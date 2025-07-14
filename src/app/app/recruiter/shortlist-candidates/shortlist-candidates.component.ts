import { Component, OnInit, Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { v4 as uuidv4 } from 'uuid';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { RecruiterSidebarComponent } from "../recruiter-sidebar/recruiter-sidebar.component";
import { HrHeaderComponent } from '../hr-header/hr-header.component';
import { HrFooterComponent } from '../hr-footer/hr-footer.component';

interface Application {
  id: string;
  name: string;
  email: string;
  position: string;
  skills: string[];
  experience: number;
  rating: number;
  source: string;
  resumeUrl: string;
  notes: string;
  status: string;
  statusColor: string;
  image: string;
  selected: boolean;
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

@Pipe({ name: 'safeUrl' })
export class SafeUrlPipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) {}
  transform(url: string): SafeResourceUrl {
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }
}

@Component({
  selector: 'app-shortlisted-candidates',
  templateUrl: './shortlist-candidates.component.html',
  styleUrls: ['./shortlist-candidates.component.css'],
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RecruiterSidebarComponent,HrHeaderComponent,HrFooterComponent]
})
export class ShortlistCandidatesComponent implements OnInit {
  applications: Application[] = [
    {
      id: uuidv4(), name: 'John Doe', email: 'john.doe@example.com', position: 'Software Engineer', skills: ['Angular', 'TypeScript', 'Node.js'],
      experience: 5, rating: 4, source: 'LinkedIn', resumeUrl: 'assets/resumes/john_doe.pdf', notes: '',
      status: 'Applied', statusColor: 'bg-gray-100 text-gray-800', image: 'assets/icons/candidate1.png', selected: false,
      statusHistory: [{ status: 'Applied', timestamp: '2025-06-20T10:00:00Z' }]
    },
    {
      id: uuidv4(), name: 'Jane Smith', email: 'jane.smith@example.com', position: 'Data Scientist', skills: ['Python', 'R', 'SQL'],
      experience: 7, rating: 5, source: 'Referral', resumeUrl: 'assets/resumes/jane_smith.pdf', notes: 'Strong ML background',
      status: 'Shortlisted', statusColor: 'bg-blue-100 text-blue-800', image: 'assets/icons/candidate2.png', selected: false,
      statusHistory: [{ status: 'Applied', timestamp: '2025-06-22T12:00:00Z' }, { status: 'Shortlisted', timestamp: '2025-06-23T14:00:00Z' }]
    }
  ];

  shortlistedCandidates: Application[] = [];
  filteredApplications: Application[] = [];
  paginatedApplications: Application[] = [];
  paginatedShortlisted: Application[] = [];
  positions: string[] = ['Software Engineer', 'Data Scientist', 'Product Manager', 'UX Designer'];
  statuses: string[] = ['Applied', 'Shortlisted', 'Interview Scheduled', 'Hired', 'Rejected'];
  sources: string[] = ['LinkedIn', 'Company Website', 'Referral', 'Job Board'];
  interviewers = [
    { id: '1', name: 'Alice Johnson' },
    { id: '2', name: 'Bob Williams' }
  ];

  notifications: Notification[] = [];
  searchQuery = '';
  currentPage = 1;
  shortlistPage = 1;
  itemsPerPage = 10;
  showNotificationDropdown = false;
  showUserDropdown = false;
  showAddApplicationModal = false;
  showResumeModal = false;
  showNotesModal = false;
  showScheduleInterviewModal = false;
  selectedApplication: Application | null = null;
  selectedApplications: Application[] = [];
  sortField = 'name';
  sortDirection = 'asc';
  shortlistSortField = 'name';
  shortlistSortDirection = 'asc';
  todayDate = new Date().toISOString().split('T')[0];

  filters = {
    position: '',
    status: '',
    rating: '',
    minExperience: null as number | null,
    applicationDate: ''
  };

  newApplication = {
    name: '',
    email: '',
    position: '',
    skillsInput: '',
    skills: [] as string[],
    experience: 0,
    source: '',
    resumeFile: null as File | null,
    resumeUrl: '',
    notes: ''
  };

  newInterview: Interview = {
    candidateId: '',
    interviewerId: '',
    date: '',
    time: ''
  };

  ngOnInit() {
    this.shortlistedCandidates = this.applications.filter(app => app.status === 'Shortlisted');
    this.filteredApplications = [...this.applications];
    this.updatePaginatedApplications();
    this.updatePaginatedShortlisted();
    this.loadNotifications();
  }

  loadNotifications() {
    this.notifications = [
      { id: uuidv4(), message: 'New application received: John Doe', time: new Date().toISOString(), icon: 'fas fa-user-plus' },
      { id: uuidv4(), message: 'Candidate shortlisted: Jane Smith', time: new Date().toISOString(), icon: 'fas fa-check-circle' }
    ];
  }

  filterApplications() {
    this.filteredApplications = this.applications.filter(app => {
      const matchesSearch = app.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
                           app.email.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
                           app.skills.some(skill => skill.toLowerCase().includes(this.searchQuery.toLowerCase())) ||
                           app.notes.toLowerCase().includes(this.searchQuery.toLowerCase());
      const matchesPosition = !this.filters.position || app.position === this.filters.position;
      const matchesStatus = !this.filters.status || app.status === this.filters.status;
      const matchesRating = !this.filters.rating || app.rating.toString() === this.filters.rating;
      const matchesExperience = this.filters.minExperience === null || app.experience >= this.filters.minExperience;
      const matchesDate = !this.filters.applicationDate || app.statusHistory[0].timestamp.split('T')[0] === this.filters.applicationDate;
      return matchesSearch && matchesPosition && matchesStatus && matchesRating && matchesExperience && matchesDate;
    });
    this.sortApplications();
    this.currentPage = 1;
    this.updatePaginatedApplications();
  }

  sortBy(field: string) {
    if (this.sortField === field) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = field;
      this.sortDirection = 'asc';
    }
    this.sortApplications();
    this.updatePaginatedApplications();
  }

  sortShortlistedBy(field: string) {
    if (this.shortlistSortField === field) {
      this.shortlistSortDirection = this.shortlistSortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.shortlistSortField = field;
      this.shortlistSortDirection = 'asc';
    }
    this.sortShortlisted();
    this.updatePaginatedShortlisted();
  }

  sortIcon(field: string, shortlist = false) {
    const activeField = shortlist ? this.shortlistSortField : this.sortField;
    const direction = shortlist ? this.shortlistSortDirection : this.sortDirection;
    if (activeField === field) {
      return direction === 'asc' ? 'fa-sort-up' : 'fa-sort-down';
    }
    return 'fa-sort';
  }

  sortApplications() {
    this.filteredApplications.sort((a, b) => {
      const valA = a[this.sortField as keyof Application];
      const valB = b[this.sortField as keyof Application];
      if (typeof valA === 'string' && typeof valB === 'string') {
        return this.sortDirection === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }
      if (typeof valA === 'number' && typeof valB === 'number') {
        return this.sortDirection === 'asc' ? valA - valB : valB - valA;
      }
      return 0;
    });
  }

  sortShortlisted() {
    this.shortlistedCandidates.sort((a, b) => {
      const valA = a[this.shortlistSortField as keyof Application];
      const valB = b[this.shortlistSortField as keyof Application];
      if (typeof valA === 'string' && typeof valB === 'string') {
        return this.shortlistSortDirection === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }
      return 0;
    });
  }

  updatePaginatedApplications() {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    this.paginatedApplications = this.filteredApplications.slice(start, end);
  }

  updatePaginatedShortlisted() {
    const start = (this.shortlistPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    this.paginatedShortlisted = this.shortlistedCandidates.slice(start, end);
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePaginatedApplications();
    }
  }

  nextPage() {
    if (this.currentPage * this.itemsPerPage < this.filteredApplications.length) {
      this.currentPage++;
      this.updatePaginatedApplications();
    }
  }

  previousShortlistPage() {
    if (this.shortlistPage > 1) {
      this.shortlistPage--;
      this.updatePaginatedShortlisted();
    }
  }

  nextShortlistPage() {
    if (this.shortlistPage * this.itemsPerPage < this.shortlistedCandidates.length) {
      this.shortlistPage++;
      this.updatePaginatedShortlisted();
    }
  }

  toggleSelectAll(event: Event) {
    const checked = (event.target as HTMLInputElement).checked;
    this.paginatedApplications.forEach(app => app.selected = checked);
    this.updateSelectedApplications();
  }

  toggleSelectShortlisted(event: Event) {
    const checked = (event.target as HTMLInputElement).checked;
    this.paginatedShortlisted.forEach(app => app.selected = checked);
    this.updateSelectedShortlisted();
  }

  updateSelectedApplications() {
    this.selectedApplications = this.applications.filter(app => app.selected);
  }

  updateSelectedShortlisted() {
    this.selectedApplications = this.shortlistedCandidates.filter(app => app.selected);
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
    // Implement sidebar toggle logic
  }

  logout() {
    // Implement logout logic
  }

  viewAllNotifications() {
    // Implement view all notifications logic
  }

  openAddApplicationModal() {
    this.showAddApplicationModal = true;
  }

  closeAddApplicationModal() {
    this.showAddApplicationModal = false;
    this.resetNewApplication();
  }

  openScheduleInterviewModal(application: Application) {
    this.selectedApplication = application;
    this.newInterview.candidateId = application.id;
    this.showScheduleInterviewModal = true;
  }

  closeScheduleInterviewModal() {
    this.showScheduleInterviewModal = false;
    this.newInterview = { candidateId: '', interviewerId: '', date: '', time: '' };
    this.selectedApplication = null;
  }

  viewResume(application: Application) {
    this.selectedApplication = application;
    this.showResumeModal = true;
  }

  closeResumeModal() {
    this.showResumeModal = false;
    this.selectedApplication = null;
  }

  addNotes(application: Application) {
    this.selectedApplication = application;
    this.showNotesModal = true;
  }

  closeNotesModal() {
    this.showNotesModal = false;
    this.selectedApplication = null;
  }

  saveNotes() {
    if (this.selectedApplication) {
      this.notifications.push({
        id: uuidv4(),
        message: `Notes updated for ${this.selectedApplication.name}`,
        time: new Date().toISOString(),
        icon: 'fas fa-sticky-note'
      });
      this.closeNotesModal();
    }
  }

  parseSkills() {
    this.newApplication.skills = this.newApplication.skillsInput.split(',').map(skill => skill.trim()).filter(skill => skill);
  }

  handleResumeUpload(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.newApplication.resumeFile = input.files[0];
      this.newApplication.resumeUrl = URL.createObjectURL(this.newApplication.resumeFile);
    }
  }

  addApplication() {
    if (this.isAddApplicationFormValid()) {
      const newApplication: Application = {
        id: uuidv4(),
        name: this.newApplication.name,
        email: this.newApplication.email,
        position: this.newApplication.position,
        skills: this.newApplication.skills,
        experience: this.newApplication.experience,
        rating: 0,
        source: this.newApplication.source,
        resumeUrl: this.newApplication.resumeUrl || 'assets/resumes/default.pdf',
        notes: this.newApplication.notes,
        status: 'Applied',
        statusColor: 'bg-gray-100 text-gray-800',
        image: 'assets/icons/candidate-default.png',
        selected: false,
        statusHistory: [{ status: 'Applied', timestamp: new Date().toISOString() }]
      };
      this.applications.push(newApplication);
      this.shortlistedCandidates = this.applications.filter(app => app.status === 'Shortlisted');
      this.filterApplications();
      this.updatePaginatedShortlisted();
      this.notifications.push({
        id: uuidv4(),
        message: `New application received: ${newApplication.name}`,
        time: new Date().toISOString(),
        icon: 'fas fa-user-plus'
      });
      this.closeAddApplicationModal();
    }
  }

  shortlistApplication(application: Application) {
    application.status = 'Shortlisted';
    application.statusColor = 'bg-blue-100 text-blue-800';
    application.statusHistory.push({ status: 'Shortlisted', timestamp: new Date().toISOString() });
    this.shortlistedCandidates = this.applications.filter(app => app.status === 'Shortlisted');
    this.updatePaginatedShortlisted();
    this.notifications.push({
      id: uuidv4(),
      message: `Candidate shortlisted: ${application.name}`,
      time: new Date().toISOString(),
      icon: 'fas fa-check-circle'
    });
    this.filterApplications();
  }

  bulkShortlist() {
    this.selectedApplications.forEach(app => {
      app.status = 'Shortlisted';
      app.statusColor = 'bg-blue-100 text-blue-800';
      app.statusHistory.push({ status: 'Shortlisted', timestamp: new Date().toISOString() });
      this.notifications.push({
        id: uuidv4(),
        message: `Candidate shortlisted: ${app.name}`,
        time: new Date().toISOString(),
        icon: 'fas fa-check-circle'
      });
    });
    this.shortlistedCandidates = this.applications.filter(app => app.status === 'Shortlisted');
    this.updatePaginatedShortlisted();
    this.filterApplications();
  }

  rejectApplication(id: string) {
    const application = this.applications.find(app => app.id === id);
    if (application) {
      application.status = 'Rejected';
      application.statusColor = 'bg-red-100 text-red-800';
      application.statusHistory.push({ status: 'Rejected', timestamp: new Date().toISOString() });
      this.shortlistedCandidates = this.applications.filter(app => app.status === 'Shortlisted');
      this.updatePaginatedShortlisted();
      this.notifications.push({
        id: uuidv4(),
        message: `Application rejected: ${application.name}`,
        time: new Date().toISOString(),
        icon: 'fas fa-times-circle'
      });
      this.filterApplications();
    }
  }

  removeFromShortlist(id: string) {
    const application = this.applications.find(app => app.id === id);
    if (application) {
      application.status = 'Applied';
      application.statusColor = 'bg-gray-100 text-gray-800';
      application.statusHistory.push({ status: 'Applied', timestamp: new Date().toISOString() });
      this.shortlistedCandidates = this.applications.filter(app => app.status === 'Shortlisted');
      this.updatePaginatedShortlisted();
      this.notifications.push({
        id: uuidv4(),
        message: `Candidate removed from shortlist: ${application.name}`,
        time: new Date().toISOString(),
        icon: 'fas fa-user-minus'
      });
      this.filterApplications();
    }
  }

  rateApplication(application: Application, rating: number) {
    application.rating = rating;
    this.notifications.push({
      id: uuidv4(),
      message: `Rated ${application.name}: ${rating} stars`,
      time: new Date().toISOString(),
      icon: 'fas fa-star'
    });
    this.filterApplications();
  }

  scheduleInterview() {
    if (this.isScheduleInterviewFormValid() && this.selectedApplication) {
      this.selectedApplication.status = 'Interview Scheduled';
      this.selectedApplication.statusColor = 'bg-green-100 text-green-800';
      this.selectedApplication.statusHistory.push({ status: 'Interview Scheduled', timestamp: new Date().toISOString() });
      this.shortlistedCandidates = this.applications.filter(app => app.status === 'Shortlisted');
      this.updatePaginatedShortlisted();
      this.notifications.push({
        id: uuidv4(),
        message: `Interview scheduled for ${this.selectedApplication.name}`,
        time: new Date().toISOString(),
        icon: 'fas fa-calendar-check'
      });
      this.filterApplications();
      this.closeScheduleInterviewModal();
    }
  }

  bulkUpdateStatus() {
    // Implement bulk status update logic with modal for selecting new status
  }

  exportApplications() {
    const csvContent = this.convertToCSV(this.filteredApplications);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'applications.csv');
    link.click();
    window.URL.revokeObjectURL(url);
  }

  convertToCSV(applications: Application[]): string {
    const headers = ['Name', 'Email', 'Position', 'Skills', 'Experience', 'Rating', 'Source', 'Status', 'Notes'];
    const rows = applications.map(app => [
      app.name,
      app.email,
      app.position,
      app.skills.join(', '),
      app.experience,
      app.rating,
      app.source,
      app.status,
      app.notes.replace(/(\r\n|\n|\r)/gm, ' ')
    ]);
    return [headers, ...rows].map(row => row.join(',')).join('\n');
  }

  clearFilters() {
    this.filters = { position: '', status: '', rating: '', minExperience: null, applicationDate: '' };
    this.searchQuery = '';
    this.filterApplications();
  }

  isAddApplicationFormValid(): boolean {
    return !!this.newApplication.name && !!this.newApplication.email && !!this.newApplication.position &&
           !!this.newApplication.skills.length && !!this.newApplication.source && this.newApplication.experience >= 0;
  }

  isScheduleInterviewFormValid(): boolean {
    return !!this.newInterview.candidateId && !!this.newInterview.interviewerId &&
           !!this.newInterview.date && !!this.newInterview.time;
  }

  resetNewApplication() {
    this.newApplication = {
      name: '',
      email: '',
      position: '',
      skillsInput: '',
      skills: [],
      experience: 0,
      source: '',
      resumeFile: null,
      resumeUrl: '',
      notes: ''
    };
  }
}