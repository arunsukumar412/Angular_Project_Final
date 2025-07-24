import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RecruiterSidebarComponent } from "../recruiter-sidebar/recruiter-sidebar.component";
import { Route } from '@angular/router';
import { RouterModule } from '@angular/router';
import { HrHeaderComponent } from '../hr-header/hr-header.component';
import { InterviewService, Interview as BackendInterview } from '../../../services/interview.service';

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
  imports: [CommonModule, FormsModule, RecruiterSidebarComponent,HrHeaderComponent, RouterModule],
  templateUrl: './interview-scheduler.component.html',
  styleUrls: ['./interview-scheduler.component.css']
})
export class InterviewSchedulerComponent implements OnInit {
selectDate(arg0: string) {
throw new Error('Method not implemented.');
}
Math: any;
formatDate(arg0: string) {
throw new Error('Method not implemented.');
}
getInitials(arg0: string) {
throw new Error('Method not implemented.');
}
markAsCompleted(arg0: string) {
throw new Error('Method not implemented.');
}
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

  candidates: Candidate[] = [];
  shortlistCandidates: any[] = [];
  jobs: Job[] = [];
  interviewers: Interviewer[] = [];
  interviews: Interview[] = [];
  filteredInterviews: Interview[] = [];
  paginatedInterviews: Interview[] = [];
  notifications: Notification[] = [];

  newInterview: Partial<Interview> = { candidateId: '', jobId: '', interviewerId: '', date: '', time: '' };
  selectedInterview: Interview | null = null;
  rescheduleForm: RescheduleForm = { interviewerId: '', date: '', time: '' };


  constructor(private interviewService: InterviewService, private http: HttpClient) {
    this.initializeCalendar();
    this.updatePagination();
  }

  ngOnInit(): void {
    this.fetchShortlistCandidates();
    this.fetchInterviews();
  }

  fetchShortlistCandidates(): void {
    this.http.get<any[]>('/api/shortlist').subscribe({
      next: (data) => {
        this.shortlistCandidates = data;
        // Map to Candidate[] for dropdown compatibility
        this.candidates = data.map(c => ({
          id: c.candidate_id,
          name: c.candidate_name,
          email: c.candidate_email,
          image: c.candidate_image
        }));
      },
      error: (err) => {
        console.error('Failed to fetch shortlist candidates:', err);
      }
    });
  }

  fetchInterviews(): void {
    this.interviewService.getAll().subscribe({
      next: (data) => {
        // Map backend fields to frontend Interview[]
        this.interviews = data.map((item: any) => ({
          id: item.id?.toString(),
          candidateId: item.candidate_id || item.candidateId,
          candidateName: item.candidate_name || item.candidateName,
          candidateEmail: item.candidate_email || item.candidateEmail,
          candidateImage: item.candidate_image || item.candidateImage,
          jobId: item.job_id || item.jobId,
          jobTitle: item.job_title || item.jobTitle,
          interviewerId: item.interviewer_id || item.interviewerId,
          interviewer: item.interviewer,
          date: item.date,
          time: item.time,
          status: item.status,
          statusColor: item.status_color || item.statusColor
        }));
        this.filteredInterviews = [...this.interviews];
        this.updatePagination();
      },
      error: (err) => {
        console.error('Failed to fetch interviews:', err);
      }
    });
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
      const newInterview: BackendInterview = {
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
      this.interviewService.create(newInterview).subscribe({
        next: () => {
          this.notifications.push({
            message: `${candidate.name} interview scheduled`,
            time: 'Just now',
            icon: 'fas fa-calendar-check'
          });
          this.sendEmailNotification(candidate.email, 'Interview Scheduled', `Your interview for ${job.title} is scheduled on ${this.newInterview.date} at ${this.newInterview.time}.`);
          this.fetchInterviews();
          this.closeScheduleModal();
        }
      });
    }
  }

  rescheduleInterview(): void {
    if (this.selectedInterview) {
      const interviewer = this.interviewers.find(i => i.id === this.rescheduleForm.interviewerId);
      const updatedInterview: BackendInterview = {
        ...this.selectedInterview,
        interviewerId: this.rescheduleForm.interviewerId,
        interviewer: interviewer ? interviewer.name : this.selectedInterview.interviewer,
        date: this.rescheduleForm.date,
        time: this.rescheduleForm.time
      };
      this.interviewService.update(this.selectedInterview.id, updatedInterview).subscribe({
        next: () => {
          this.notifications.push({
            message: `${this.selectedInterview!.candidateName} interview rescheduled`,
            time: 'Just now',
            icon: 'fas fa-calendar-alt'
          });
          this.sendEmailNotification(
            this.selectedInterview!.candidateEmail,
            'Interview Rescheduled',
            `Your interview for ${this.selectedInterview!.jobTitle} has been rescheduled to ${this.rescheduleForm.date} at ${this.rescheduleForm.time}.`
          );
          this.fetchInterviews();
          this.closeRescheduleModal();
        }
      });
    }
  }

  cancelInterview(id: string): void {
    const interview = this.interviews.find(i => i.id === id);
    if (interview) {
      this.interviewService.update(id, { ...interview, status: 'Cancelled', statusColor: 'bg-red-100 text-red-800' }).subscribe({
        next: () => {
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
          this.fetchInterviews();
        }
      });
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