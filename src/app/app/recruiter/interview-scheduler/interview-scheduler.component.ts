import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RecruiterSidebarComponent } from "../recruiter-sidebar/recruiter-sidebar.component";
import { Route } from '@angular/router';
import { RouterModule } from '@angular/router';

interface Candidate {
  id: string;
  name: string;
  email: string;
  image: string;
}

interface Job {
  id: string;
  title: string;
}

interface Interviewer {
  id: string;
  name: string;
}

interface Interview {
  id: string;
  candidateId: string;
  candidateName: string;
  candidateEmail: string;
  candidateImage: string;
  jobId: string;
  jobTitle: string;
  interviewerId: string;
  interviewer: string;
  date: string;
  time: string;
  status: string;
  statusColor: string;
}

interface Notification {
  message: string;
  time: string;
  icon: string;
}

interface RescheduleForm {
  interviewerId: string;
  date: string;
  time: string;
}

@Component({
  selector: 'app-interview-scheduler',
  standalone: true,
  imports: [CommonModule, FormsModule, RecruiterSidebarComponent],
  templateUrl: './interview-scheduler.component.html',
  styleUrls: ['./interview-scheduler.component.css']
})
export class InterviewSchedulerComponent {
  showNotificationDropdown: boolean = false;
  showUserDropdown: boolean = false;
  showScheduleModal: boolean = false;
  showRescheduleModal: boolean = false;
  searchQuery: string = '';
  statusFilter: string = 'all';
  currentPage: number = 1;
  itemsPerPage: number = 5;
  currentMonth: string = '';
  currentYear: number = 0;
  calendarDays: { day: number; date: string; isCurrentMonth: boolean; isToday: boolean }[] = [];
  daysOfWeek: string[] = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  todayDate: string = new Date().toISOString().split('T')[0]; // Current date: 2025-07-05

  candidates: Candidate[] = [
    { id: '1', name: 'John Doe', email: 'john.doe@example.com', image: 'assets/profiles/john-doe.png' },
    { id: '2', name: 'Jane Smith', email: 'jane.smith@example.com', image: 'assets/profiles/jane-smith.png' },
    { id: '3', name: 'Alex Johnson', email: 'alex.johnson@example.com', image: 'assets/profiles/alex-johnson.png' }
  ];

  jobs: Job[] = [
    { id: '1', title: 'Software Engineer' },
    { id: '2', title: 'Product Manager' },
    { id: '3', title: 'Data Analyst' }
  ];

  interviewers: Interviewer[] = [
    { id: '1', name: 'Sarah Brown' },
    { id: '2', name: 'Michael Lee' },
    { id: '3', name: 'Emily Davis' }
  ];

  interviews: Interview[] = [
    {
      id: '1',
      candidateId: '1',
      candidateName: 'John Doe',
      candidateEmail: 'john.doe@example.com',
      candidateImage: 'assets/profiles/john-doe.png',
      jobId: '1',
      jobTitle: 'Software Engineer',
      interviewerId: '1',
      interviewer: 'Sarah Brown',
      date: '2025-07-06',
      time: '10:00',
      status: 'Scheduled',
      statusColor: 'bg-indigo-100 text-indigo-800'
    },
    {
      id: '2',
      candidateId: '2',
      candidateName: 'Jane Smith',
      candidateEmail: 'jane.smith@example.com',
      candidateImage: 'assets/profiles/jane-smith.png',
      jobId: '2',
      jobTitle: 'Product Manager',
      interviewerId: '2',
      interviewer: 'Michael Lee',
      date: '2025-07-07',
      time: '14:00',
      status: 'Scheduled',
      statusColor: 'bg-indigo-100 text-indigo-800'
    },
    {
      id: '3',
      candidateId: '3',
      candidateName: 'Alex Johnson',
      candidateEmail: 'alex.johnson@example.com',
      candidateImage: 'assets/profiles/alex-johnson.png',
      jobId: '3',
      jobTitle: 'Data Analyst',
      interviewerId: '3',
      interviewer: 'Emily Davis',
      date: '2025-07-05',
      time: '09:00',
      status: 'Completed',
      statusColor: 'bg-green-100 text-green-800'
    }
  ];

  filteredInterviews: Interview[] = [...this.interviews];
  paginatedInterviews: Interview[] = [];
  notifications: Notification[] = [
    { message: 'John Doe interview scheduled', time: '5 minutes ago', icon: 'fas fa-calendar-check' },
    { message: 'Jane Smith interview rescheduled', time: '1 hour ago', icon: 'fas fa-calendar-alt' },
    { message: 'Alex Johnson interview completed', time: 'Yesterday', icon: 'fas fa-check-circle' }
  ];

  newInterview: Partial<Interview> = { candidateId: '', jobId: '', interviewerId: '', date: '', time: '' };
  selectedInterview: Interview | null = null;
  rescheduleForm: RescheduleForm = { interviewerId: '', date: '', time: '' };

  constructor() {
    this.initializeCalendar();
    this.updatePagination();
  }

  initializeCalendar(): void {
    const today = new Date();
    this.currentMonth = today.toLocaleString('default', { month: 'long' });
    this.currentYear = today.getFullYear();
    this.generateCalendarDays(today.getFullYear(), today.getMonth());
  }

  generateCalendarDays(year: number, month: number): void {
    this.calendarDays = [];
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const today = new Date();
    const startDay = firstDay.getDay();
    const daysInMonth = lastDay.getDate();

    for (let i = startDay - 1; i >= 0; i--) {
      const date = new Date(year, month, 0 - i);
      this.calendarDays.push({
        day: date.getDate(),
        date: date.toISOString().split('T')[0],
        isCurrentMonth: false,
        isToday: false
      });
    }

    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, month, i);
      this.calendarDays.push({
        day: i,
        date: date.toISOString().split('T')[0],
        isCurrentMonth: true,
        isToday: date.toDateString() === today.toDateString()
      });
    }

    const remainingDays = 42 - this.calendarDays.length;
    for (let i = 1; i <= remainingDays; i++) {
      const date = new Date(year, month + 1, i);
      this.calendarDays.push({
        day: i,
        date: date.toISOString().split('T')[0],
        isCurrentMonth: false,
        isToday: false
      });
    }
  }

  previousMonth(): void {
    const date = new Date(this.currentYear, this.getMonthIndex(this.currentMonth) - 1);
    this.currentMonth = date.toLocaleString('default', { month: 'long' });
    this.currentYear = date.getFullYear();
    this.generateCalendarDays(this.currentYear, this.getMonthIndex(this.currentMonth));
  }

  nextMonth(): void {
    const date = new Date(this.currentYear, this.getMonthIndex(this.currentMonth) + 1);
    this.currentMonth = date.toLocaleString('default', { month: 'long' });
    this.currentYear = date.getFullYear();
    this.generateCalendarDays(this.currentYear, this.getMonthIndex(this.currentMonth));
  }

  getMonthIndex(month: string): number {
    return [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ].indexOf(month);
  }

  getInterviewsForDay(date: string): Interview[] {
    return this.interviews.filter(interview => interview.date === date);
  }

  filterInterviews(): void {
    this.filteredInterviews = this.interviews.filter(interview => {
      const matchesSearch = this.searchQuery
        ? interview.candidateName.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
          interview.jobTitle.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
          interview.interviewer.toLowerCase().includes(this.searchQuery.toLowerCase())
        : true;
      const matchesStatus = this.statusFilter === 'all' || interview.status === this.statusFilter;
      return matchesSearch && matchesStatus;
    });
    this.currentPage = 1;
    this.updatePagination();
  }

  updatePagination(): void {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    this.paginatedInterviews = this.filteredInterviews.slice(start, end);
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePagination();
    }
  }

  nextPage(): void {
    if (this.currentPage * this.itemsPerPage < this.filteredInterviews.length) {
      this.currentPage++;
      this.updatePagination();
    }
  }

  toggleNotificationDropdown(): void {
    this.showNotificationDropdown = !this.showNotificationDropdown;
    this.showUserDropdown = false;
  }

  toggleUserDropdown(): void {
    this.showUserDropdown = !this.showUserDropdown;
    this.showNotificationDropdown = false;
  }

  openScheduleModal(): void {
    const today = new Date().toISOString().split('T')[0];
    this.newInterview = {
      candidateId: '',
      jobId: '',
      interviewerId: this.interviewers[0]?.id || '',
      date: today,
      time: '09:00'
    };
    this.showScheduleModal = true;
  }

  closeScheduleModal(): void {
    this.showScheduleModal = false;
    this.newInterview = { candidateId: '', jobId: '', interviewerId: '', date: '', time: '' };
  }

  openRescheduleModal(interview: Interview): void {
    this.selectedInterview = { ...interview };
    this.rescheduleForm = {
      interviewerId: interview.interviewerId,
      date: interview.date,
      time: interview.time
    };
    this.showRescheduleModal = true;
  }

  closeRescheduleModal(): void {
    this.showRescheduleModal = false;
    this.selectedInterview = null;
    this.rescheduleForm = { interviewerId: '', date: '', time: '' };
  }

  scheduleInterview(): void {
    const candidate = this.candidates.find(c => c.id === this.newInterview.candidateId);
    const job = this.jobs.find(j => j.id === this.newInterview.jobId);
    const interviewer = this.interviewers.find(i => i.id === this.newInterview.interviewerId);

    if (candidate && job && interviewer && this.newInterview.date && this.newInterview.time) {
      const newInterview: Interview = {
        id: (this.interviews.length + 1).toString(),
        candidateId: this.newInterview.candidateId!,
        candidateName: candidate.name,
        candidateEmail: candidate.email,
        candidateImage: candidate.image,
        jobId: this.newInterview.jobId!,
        jobTitle: job.title,
        interviewerId: this.newInterview.interviewerId!,
        interviewer: interviewer.name,
        date: this.newInterview.date!,
        time: this.newInterview.time!,
        status: 'Scheduled',
        statusColor: 'bg-indigo-100 text-indigo-800'
      };
      this.interviews.push(newInterview);
      this.notifications.push({
        message: `${candidate.name} interview scheduled`,
        time: 'Just now',
        icon: 'fas fa-calendar-check'
      });
      this.sendEmailNotification(candidate.email, 'Interview Scheduled', `Your interview for ${job.title} is scheduled on ${this.newInterview.date} at ${this.newInterview.time}.`);
      this.filterInterviews();
      this.closeScheduleModal();
    }
  }

  rescheduleInterview(): void {
    if (this.selectedInterview) {
      const index = this.interviews.findIndex(i => i.id === this.selectedInterview!.id);
      if (index !== -1) {
        const interviewer = this.interviewers.find(i => i.id === this.rescheduleForm.interviewerId);
        this.interviews[index] = {
          ...this.selectedInterview,
          interviewerId: this.rescheduleForm.interviewerId,
          interviewer: interviewer ? interviewer.name : this.selectedInterview.interviewer,
          date: this.rescheduleForm.date,
          time: this.rescheduleForm.time
        };
        this.notifications.push({
          message: `${this.selectedInterview.candidateName} interview rescheduled`,
          time: 'Just now',
          icon: 'fas fa-calendar-alt'
        });
        this.sendEmailNotification(
          this.selectedInterview.candidateEmail,
          'Interview Rescheduled',
          `Your interview for ${this.selectedInterview.jobTitle} has been rescheduled to ${this.rescheduleForm.date} at ${this.rescheduleForm.time}.`
        );
        this.filterInterviews();
        this.closeRescheduleModal();
      }
    }
  }

  cancelInterview(id: string): void {
    const interview = this.interviews.find(i => i.id === id);
    if (interview) {
      interview.status = 'Cancelled';
      interview.statusColor = 'bg-red-100 text-red-800';
      this.notifications.push({
        message: `${interview.candidateName} interview cancelled`,
        time: 'Just now',
        icon: 'fas fa-times-circle'
      });
      this.sendEmailNotification(
        interview.candidateEmail,
        'Interview Cancelled',
        `Your interview for ${interview.jobTitle} on ${interview.date} has been cancelled.`
      );
      this.filterInterviews();
    }
  }

  sendEmailNotification(email: string, subject: string, body: string): void {
    console.log(`Email sent to ${email}: Subject: ${subject}, Body: ${body}`);
  }

  refreshData(): void {
    this.filterInterviews();
  }

  logout(): void {
    // Logic to handle logout
  }

  isFormValid(): boolean {
    return !!this.newInterview.candidateId && !!this.newInterview.jobId && !!this.newInterview.interviewerId && !!this.newInterview.date && !!this.newInterview.time;
  }

  isRescheduleFormValid(): boolean {
    return !!this.rescheduleForm.interviewerId && !!this.rescheduleForm.date && !!this.rescheduleForm.time;
  }
}