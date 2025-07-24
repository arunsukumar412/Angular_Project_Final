import { Component, OnInit, Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { v4 as uuidv4 } from 'uuid';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RecruiterSidebarComponent } from '../recruiter-sidebar/recruiter-sidebar.component';
import { HrFooterComponent } from '../hr-footer/hr-footer.component';
import { HrHeaderComponent } from '../hr-header/hr-header.component';

@Pipe({ name: 'safeUrl' })
export class SafeUrlPipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) {}
  transform(url: string): SafeResourceUrl {
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }
}

interface Candidate {
  id: string;
  name: string;
  email: string;
  position: string;
  skills: string[];
  rating: number;
  source: string;
  resumeUrl: string;
  notes: string;
  status: string;
  statusColor: string;
  image: string;
  selected: boolean;
  credentials: { username: string; password: string; testLink: string };
  testStatus: string;
  testStatusColor: string;
  testProgress: number;
  testLastUpdated: string;
  statusHistory: { status: string; timestamp: string }[];
}

interface Notification {
  id: string;
  message: string;
  time: string;
  icon: string;
}

interface Interview {
  candidateId: string;
  interviewerId: string;
  date: string;
  time: string;
}

interface EmailTemplate {
  subject: string;
  body: string;
}

@Component({
  selector: 'app-test-credentials',
  templateUrl: './test-credentials.component.html',
  styleUrls: ['./test-credentials.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RecruiterSidebarComponent,HrFooterComponent,HrHeaderComponent],
})
export class TestCredentialsComponent implements OnInit {
  candidates: Candidate[] = [
    {
      id: uuidv4(),
      name: 'Arun ',
      email: 'arun.@example.com',
      position: 'Software Engineer',
      skills: ['Angular', 'TypeScript', 'Node.js'],
      rating: 4,
      source: 'LinkedIn',
      resumeUrl: 'assets/icons/ARUNSUKUMAR A_RESUME.pdf',
      notes: '',
      status: 'Shortlisted',
      statusColor: 'bg-blue-100 text-blue-800',
      image: 'https://static.vecteezy.com/system/resources/thumbnails/027/951/137/small_2x/stylish-spectacles-guy-3d-avatar-character-illustrations-png.png',
      selected: false,
      credentials: { username: 'arun123', password: 'Test@1234', testLink: 'https://testplatform.com/jdoe123' },
      testStatus: 'Not Started',
      testStatusColor: 'bg-gray-100 text-gray-800',
      testProgress: 0,
      testLastUpdated: new Date().toISOString(),
      statusHistory: [{ status: 'Shortlisted', timestamp: '2025-07-05T10:00:00Z' }],
    },
    {
      id: uuidv4(),
      name: 'Sukumar',
      email: 'sukumar@example.com',
      position: 'Data Scientist',
      skills: ['Python', 'R', 'SQL'],
      rating: 5,
      source: 'Referral',
      resumeUrl: 'assets/icons/ARUNSUKUMAR A_RESUME.pdf',
      notes: 'Strong ML background',
      status: 'Shortlisted',
      statusColor: 'bg-blue-100 text-blue-800',
      image: 'https://static.vecteezy.com/system/resources/thumbnails/027/951/137/small_2x/stylish-spectacles-guy-3d-avatar-character-illustrations-png.png',
      selected: false,
      credentials: { username: 'jsmith456', password: 'Test@5678', testLink: 'https://testplatform.com/jsmith456' },
      testStatus: 'In Progress',
      testStatusColor: 'bg-yellow-100 text-yellow-800',
      testProgress: 50,
      testLastUpdated: new Date().toISOString(),
      statusHistory: [{ status: 'Shortlisted', timestamp: '2025-07-05T12:00:00Z' }],
    },
  ];

  filteredCandidates: Candidate[] = [];
  paginatedCandidates: Candidate[] = [];
  positions: string[] = ['Software Engineer', 'Data Scientist', 'Product Manager', 'UX Designer'];
  statuses: string[] = ['Shortlisted', 'Interview Scheduled', 'Hired', 'Rejected'];
  sources: string[] = ['LinkedIn', 'Company Website', 'Referral', 'Job Board'];
  testStatuses: string[] = ['Not Started', 'In Progress', 'Completed'];
  interviewers = [
    { id: '1', name: 'Alice Johnson' },
    { id: '2', name: 'Bob Williams' },
  ];

  notifications: Notification[] = [];
  emailTemplate: EmailTemplate = {
    subject: 'Your Test Credentials',
    body: 'Dear {name},\n\nYou have been shortlisted for the {position} position. Please use the following credentials to access your test:\n\nUsername: {username}\nPassword: {password}\nTest Link: {testLink}\n\nBest regards,\nHR Team',
  };

  searchQuery = '';
  currentPage = 1;
  itemsPerPage = 10;
  showNotificationDropdown = false;
  showUserDropdown = false;
  showAddCandidateModal = false;
  showCredentialsModal = false;
  showResumeModal = false;
  showNotesModal = false;
  showScheduleInterviewModal = false;
  showEmailTemplateModal = false;
  selectedCandidate: Candidate | null = null;
  selectedCandidates: Candidate[] = [];
  sortField = 'name';
  sortDirection = 'asc';
  todayDate = new Date().toISOString().split('T')[0];

  filters = {
    position: '',
    status: '',
    rating: '',
    testStatus: '',
  };

  newCandidate = {
    name: '',
    email: '',
    position: '',
    skillsInput: '',
    skills: [] as string[],
    source: '',
    resumeFile: null as File | null,
    resumeUrl: '',
    notes: '',
  };

  newInterview: Interview = {
    candidateId: '',
    interviewerId: '',
    date: '',
    time: '',
  };

  ngOnInit() {
    this.filteredCandidates = [...this.candidates];
    this.updatePaginatedCandidates();
    this.loadNotifications();
  }

  loadNotifications() {
    this.notifications = [
      { id: uuidv4(), message: 'Credentials sent to John Doe', time: new Date().toISOString(), icon: 'fas fa-envelope' },
      { id: uuidv4(), message: 'Jane Smith started test', time: new Date().toISOString(), icon: 'fas fa-play-circle' },
    ];
  }

  filterCandidates() {
    this.filteredCandidates = this.candidates.filter(candidate => {
      const matchesSearch =
        candidate.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        candidate.email.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        candidate.skills.some(skill => skill.toLowerCase().includes(this.searchQuery.toLowerCase())) ||
        candidate.notes.toLowerCase().includes(this.searchQuery.toLowerCase());
      const matchesPosition = !this.filters.position || candidate.position === this.filters.position;
      const matchesStatus = !this.filters.status || candidate.status === this.filters.status;
      const matchesRating = !this.filters.rating || candidate.rating.toString() === this.filters.rating;
      const matchesTestStatus = !this.filters.testStatus || candidate.testStatus === this.filters.testStatus;
      return matchesSearch && matchesPosition && matchesStatus && matchesRating && matchesTestStatus;
    });
    this.sortCandidates();
    this.currentPage = 1;
    this.updatePaginatedCandidates();
  }

  sortBy(field: string) {
    if (this.sortField === field) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = field;
      this.sortDirection = 'asc';
    }
    this.sortCandidates();
    this.updatePaginatedCandidates();
  }

  sortIcon(field: string) {
    if (this.sortField === field) {
      return this.sortDirection === 'asc' ? 'fa-sort-up' : 'fa-sort-down';
    }
    return 'fa-sort';
  }

  sortCandidates() {
    this.filteredCandidates.sort((a, b) => {
      const valA = a[this.sortField as keyof Candidate];
      const valB = b[this.sortField as keyof Candidate];
      if (typeof valA === 'string' && typeof valB === 'string') {
        return this.sortDirection === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }
      if (typeof valA === 'number' && typeof valB === 'number') {
        return this.sortDirection === 'asc' ? valA - valB : valB - valA;
      }
      return 0;
    });
  }

  updatePaginatedCandidates() {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    this.paginatedCandidates = this.filteredCandidates.slice(start, end);
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePaginatedCandidates();
    }
  }

  nextPage() {
    if (this.currentPage * this.itemsPerPage < this.filteredCandidates.length) {
      this.currentPage++;
      this.updatePaginatedCandidates();
    }
  }

  toggleSelectAll(event: Event) {
    const checked = (event.target as HTMLInputElement).checked;
    this.paginatedCandidates.forEach(candidate => (candidate.selected = checked));
    this.updateSelectedCandidates();
  }

  updateSelectedCandidates() {
    this.selectedCandidates = this.candidates.filter(candidate => candidate.selected);
  }

  toggleNotificationDropdown() {
    this.showNotificationDropdown = !this.showNotificationDropdown;
    this.showUserDropdown = false;
  }

  toggleUserDropdown() {
    this.showUserDropdown = !this.showUserDropdown;
    this.showNotificationDropdown = false;
  }

  toggleSidebar() {
    console.log('Toggling sidebar');
  }

  logout() {
    console.log('User logged out');
  }

  viewAllNotifications() {
    console.log('Viewing all notifications');
  }

  viewNotification(event: Event, notification: Notification) {
    event.preventDefault();
    console.log('Viewing notification:', notification);
  }

  openAddCandidateModal() {
    this.showAddCandidateModal = true;
  }

  closeAddCandidateModal() {
    this.showAddCandidateModal = false;
    this.resetNewCandidate();
  }

  openCredentialsModal(candidate: Candidate) {
    this.selectedCandidate = candidate;
    this.showCredentialsModal = true;
  }

  closeCredentialsModal() {
    this.showCredentialsModal = false;
    this.selectedCandidate = null;
  }

  viewCredentials(candidate: Candidate) {
    this.openCredentialsModal(candidate);
  }

  resendCredentials(candidate: Candidate | null) {
    if (candidate) {
      this.sendCredentials(candidate, false);
      this.notifications.push({
        id: uuidv4(),
        message: `Credentials resent to ${candidate.name}`,
        time: new Date().toISOString(),
        icon: 'fas fa-envelope',
      });
    }
    this.closeCredentialsModal();
  }

  bulkSendCredentials() {
    this.selectedCandidates.forEach(candidate => {
      if (!candidate.credentials.username || !candidate.credentials.password) {
        candidate.credentials = this.generateCredentials();
      }
      this.sendCredentials(candidate, true);
      this.notifications.push({
        id: uuidv4(),
        message: `Test credentials sent to ${candidate.name}`,
        time: new Date().toISOString(),
        icon: 'fas fa-envelope',
      });
    });
    this.updateSelectedCandidates();
  }

  bulkResendCredentials() {
    this.selectedCandidates.forEach(candidate => {
      if (candidate.credentials.username && candidate.credentials.password) {
        this.sendCredentials(candidate, false);
        this.notifications.push({
          id: uuidv4(),
          message: `Credentials resent to ${candidate.name}`,
          time: new Date().toISOString(),
          icon: 'fas fa-envelope',
        });
      }
    });
  }

  viewResume(candidate: Candidate) {
    this.selectedCandidate = candidate;
    this.showResumeModal = true;
  }

  closeResumeModal() {
    this.showResumeModal = false;
    this.selectedCandidate = null;
  }

  viewNotes(candidate: Candidate) {
    this.selectedCandidate = candidate;
    this.showNotesModal = true;
  }

  closeNotesModal() {
    this.showNotesModal = false;
    this.selectedCandidate = null;
  }

  saveNotes() {
    if (this.selectedCandidate) {
      this.notifications.push({
        id: uuidv4(),
        message: `Notes updated for ${this.selectedCandidate.name}`,
        time: new Date().toISOString(),
        icon: 'fas fa-sticky-note',
      });
      this.closeNotesModal();
    }
  }

  openScheduleInterviewModal(candidate: Candidate) {
    this.selectedCandidate = candidate;
    this.newInterview.candidateId = candidate.id;
    this.showScheduleInterviewModal = true;
  }

  closeScheduleInterviewModal() {
    this.showScheduleInterviewModal = false;
    this.newInterview = { candidateId: '', interviewerId: '', date: '', time: '' };
    this.selectedCandidate = null;
  }

  openEmailTemplateModal() {
    this.showEmailTemplateModal = true;
  }

  closeEmailTemplateModal() {
    this.showEmailTemplateModal = false;
  }

  saveEmailTemplate() {
    this.notifications.push({
      id: uuidv4(),
      message: 'Email template updated',
      time: new Date().toISOString(),
      icon: 'fas fa-envelope',
    });
    this.closeEmailTemplateModal();
  }

  parseSkills() {
    this.newCandidate.skills = this.newCandidate.skillsInput
      .split(',')
      .map(skill => skill.trim())
      .filter(skill => skill);
  }

  handleResumeUpload(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.newCandidate.resumeFile = input.files[0];
      this.newCandidate.resumeUrl = URL.createObjectURL(this.newCandidate.resumeFile);
    }
  }

  addCandidate() {
    if (this.isAddCandidateFormValid()) {
      const credentials = this.generateCredentials();
      const newCandidate: Candidate = {
        id: uuidv4(),
        name: this.newCandidate.name,
        email: this.newCandidate.email,
        position: this.newCandidate.position,
        skills: this.newCandidate.skills,
        rating: 0,
        source: this.newCandidate.source,
        resumeUrl: this.newCandidate.resumeUrl || 'assets/resumes/default.pdf',
        notes: this.newCandidate.notes,
        status: 'Shortlisted',
        statusColor: 'bg-blue-100 text-blue-800',
        image: 'assets/icons/candidate-default.png',
        selected: false,
        credentials,
        testStatus: 'Not Started',
        testStatusColor: 'bg-gray-100 text-gray-800',
        testProgress: 0,
        testLastUpdated: new Date().toISOString(),
        statusHistory: [{ status: 'Shortlisted', timestamp: new Date().toISOString() }],
      };
      this.candidates.push(newCandidate);
      this.sendCredentials(newCandidate, true);
      this.filteredCandidates = [...this.candidates];
      this.updatePaginatedCandidates();
      this.notifications.push({
        id: uuidv4(),
        message: `Candidate shortlisted: ${newCandidate.name}`,
        time: new Date().toISOString(),
        icon: 'fas fa-check-circle',
      });
      this.closeAddCandidateModal();
    }
  }

  generateCredentials() {
    const username = `user${Math.floor(Math.random() * 1000000)}`;
    const password = `Test@${Math.floor(Math.random() * 10000)}`;
    const testLink = `https://testplatform.com/${username}`;
    return { username, password, testLink };
  }

  sendCredentials(candidate: Candidate, isNew: boolean) {
    const emailBody = this.emailTemplate.body
      .replace('{name}', candidate.name)
      .replace('{position}', candidate.position)
      .replace('{username}', candidate.credentials.username)
      .replace('{password}', candidate.credentials.password)
      .replace('{testLink}', candidate.credentials.testLink);
    console.log(`Simulated email ${isNew ? 'sent' : 'resent'} to ${candidate.email}:`, {
      subject: this.emailTemplate.subject,
      body: emailBody,
    });
    // In a real application, integrate with an email service (e.g., AWS SES, SendGrid)
  }

  rateCandidate(candidate: Candidate, rating: number) {
    candidate.rating = rating;
    this.notifications.push({
      id: uuidv4(),
      message: `Rated ${candidate.name}: ${rating} stars`,
      time: new Date().toISOString(),
      icon: 'fas fa-star',
    });
    this.filterCandidates();
  }

  updateTestStatus(candidate: Candidate) {
    const statuses = ['Not Started', 'In Progress', 'Completed'];
    const currentIndex = statuses.indexOf(candidate.testStatus);
    candidate.testStatus = statuses[(currentIndex + 1) % statuses.length];
    candidate.testStatusColor =
      candidate.testStatus === 'Not Started'
        ? 'bg-gray-100 text-gray-800'
        : candidate.testStatus === 'In Progress'
        ? 'bg-yellow-100 text-yellow-800'
        : 'bg-green-100 text-green-800';
    candidate.testProgress =
      candidate.testStatus === 'Not Started' ? 0 : candidate.testStatus === 'In Progress' ? Math.floor(Math.random() * 50 + 25) : 100;
    candidate.testLastUpdated = new Date().toISOString();
    this.notifications.push({
      id: uuidv4(),
      message: `Test status updated for ${candidate.name}: ${candidate.testStatus}`,
      time: new Date().toISOString(),
      icon: 'fas fa-tasks',
    });
    this.filterCandidates();
  }

  scheduleInterview() {
    if (this.isScheduleInterviewFormValid() && this.selectedCandidate) {
      this.selectedCandidate.status = 'Interview Scheduled';
      this.selectedCandidate.statusColor = 'bg-green-100 text-green-800';
      this.selectedCandidate.statusHistory.push({ status: 'Interview Scheduled', timestamp: new Date().toISOString() });
      this.notifications.push({
        id: uuidv4(),
        message: `Interview scheduled for ${this.selectedCandidate.name}`,
        time: new Date().toISOString(),
        icon: 'fas fa-calendar-check',
      });
      this.filterCandidates();
      this.closeScheduleInterviewModal();
    }
  }

  removeCandidate(id: string) {
    const candidate = this.candidates.find(c => c.id === id);
    if (candidate) {
      candidate.status = 'Rejected';
      candidate.statusColor = 'bg-red-100 text-red-800';
      candidate.statusHistory.push({ status: 'Rejected', timestamp: new Date().toISOString() });
      this.notifications.push({
        id: uuidv4(),
        message: `Candidate removed: ${candidate.name}`,
        time: new Date().toISOString(),
        icon: 'fas fa-user-minus',
      });
      this.filterCandidates();
    }
  }

  exportCandidates() {
    const csvContent = this.convertToCSV(this.filteredCandidates);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'shortlisted_candidates.csv');
    link.click();
    window.URL.revokeObjectURL(url);
  }

  convertToCSV(candidates: Candidate[]): string {
    const headers = ['Name', 'Email', 'Position', 'Skills', 'Rating', 'Source', 'Test Status', 'Test Progress', 'Username', 'Test Link', 'Notes'];
    const rows = candidates.map(c => [
      c.name,
      c.email,
      c.position,
      c.skills.join(', '),
      c.rating,
      c.source,
      c.testStatus,
      c.testProgress,
      c.credentials.username,
      c.credentials.testLink,
      c.notes.replace(/(\r\n|\n|\r)/gm, ' '),
    ]);
    return [headers, ...rows].map(row => row.join(',')).join('\n');
  }

  clearFilters() {
    this.filters = { position: '', status: '', rating: '', testStatus: '' };
    this.searchQuery = '';
    this.filterCandidates();
  }

  isAddCandidateFormValid(): boolean {
    return (
      !!this.newCandidate.name &&
      !!this.newCandidate.email &&
      !!this.newCandidate.position &&
      !!this.newCandidate.skills.length &&
      !!this.newCandidate.source
    );
  }

  isScheduleInterviewFormValid(): boolean {
    return !!this.newInterview.candidateId && !!this.newInterview.interviewerId && !!this.newInterview.date && !!this.newInterview.time;
  }

  resetNewCandidate() {
    this.newCandidate = {
      name: '',
      email: '',
      position: '',
      skillsInput: '',
      skills: [],
      source: '',
      resumeFile: null,
      resumeUrl: '',
      notes: '',
    };
  }
}