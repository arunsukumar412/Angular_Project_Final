import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Chart } from 'chart.js';
import { RecruiterSidebarComponent } from '../recruiter-sidebar/recruiter-sidebar.component';
import { HrHeaderComponent } from '../hr-header/hr-header.component';
import { HrFooterComponent } from '../hr-footer/hr-footer.component';

@Component({
  selector: 'app-application-management',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RecruiterSidebarComponent,
    HrHeaderComponent,
    HrFooterComponent,
  ],
  templateUrl: './job-management.component.html',
  styleUrls: ['./job-management.component.css']
})
export class JobManagementComponent implements OnInit {
  activeTab: string = 'applications';
  newApplicationsCount: number = 12;

  // Applications related properties
  applications: any[] = [];
  filteredApplications: any[] = [];
  paginatedApplications: any[] = [];
  applicationStatusFilter: string = 'all';
  applicantSearchQuery: string = '';
  currentAppPage: number = 1;
  itemsPerPage: number = 10;

  // Reports related properties
  reports: any[] = [];

  // Modals control
  showApplicationModal: boolean = false;
  showInterviewModal: boolean = false;
  showReportModal: boolean = false;

  // Selected items
  selectedApplication: any = null;
  interviewDetails: any = {
    date: '',
    time: '',
    type: 'Video',
    meetingLink: '',
    location: '',
    interviewers: '',
    notes: ''
  };

  reportDetails: any = {
    name: '',
    type: 'Applications',
    startDate: '',
    endDate: '',
    format: 'PDF',
    filters: {
      byDepartment: false,
      byStatus: false,
      bySource: false
    }
  };

  departments = [
    { id: 1, name: 'Engineering' },
    { id: 2, name: 'Marketing' },
    { id: 3, name: 'Human Resources' },
    { id: 4, name: 'Finance' },
    { id: 5, name: 'Sales' }
  ];
Math: any;

  ngOnInit(): void {
    this.initializeSampleData();
    this.filterApplications();
    this.initializeCharts();
  }

  initializeSampleData(): void {
    // Sample applications data with location set to Chennai
    this.applications = [
      { 
        id: 1, 
        jobTitle: 'Frontend Developer', 
        department: 'Engineering', 
        location: 'Chennai', // Updated to Chennai
        appliedDate: new Date('2023-05-15'), 
        status: 'New',
        candidate: {
          id: 101,
          name: 'John Doe',
          email: 'john.doe@example.com',
          phone: '(123) 456-7890',
          avatar: 'https://randomuser.me/api/portraits/men/1.jpg'
        },
        resumeUrl: 'https://example.com/resumes/john_doe.pdf',
        coverLetter: 'I am excited to apply for the Frontend Developer position...',
        questions: [
          { question: 'How many years of experience do you have with Angular?', answer: '3 years' },
          { question: 'What is your availability?', answer: 'Immediately' }
        ]
      },
      { 
        id: 2, 
        jobTitle: 'Backend Developer', 
        department: 'Engineering', 
        location: 'Chennai', // Updated to Chennai
        appliedDate: new Date('2023-06-01'), 
        status: 'Reviewed',
        candidate: {
          id: 102,
          name: 'Jane Smith',
          email: 'jane.smith@example.com',
          phone: '(987) 654-3210',
          avatar: 'https://randomuser.me/api/portraits/women/2.jpg'
        },
        resumeUrl: 'https://example.com/resumes/jane_smith.pdf',
        coverLetter: 'I am eager to contribute to your team as a Backend Developer...',
        questions: [
          { question: 'How many years of experience do you have with Node.js?', answer: '4 years' },
          { question: 'What is your availability?', answer: '2 weeks notice' }
        ]
      }
    ];

    // Sample reports data
    this.reports = [
      { id: 1, name: 'Monthly Recruitment Report - May 2023', type: 'Applications', generatedOn: new Date('2023-06-01') },
      { id: 2, name: 'Hiring Funnel Analysis Q2', type: 'Hiring Funnel', generatedOn: new Date('2023-04-15') }
    ];
  }

  initializeCharts(): void {
    // Applications Chart
    const applicationsCtx = document.getElementById('applicationsChart') as HTMLCanvasElement;
    if (applicationsCtx) {
      new Chart(applicationsCtx, {
        type: 'bar',
        data: {
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
          datasets: [
            {
              label: 'Applications',
              data: [45, 60, 75, 55, 80, 95],
              backgroundColor: '#6366F1'
            },
            {
              label: 'Hires',
              data: [5, 8, 12, 10, 15, 18],
              backgroundColor: '#10B981'
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: true
            }
          }
        }
      });
    }

    // Funnel Chart
    const funnelCtx = document.getElementById('funnelChart') as HTMLCanvasElement;
    if (funnelCtx) {
      new Chart(funnelCtx, {
        type: 'doughnut',
        data: {
          labels: ['Applied', 'Screened', 'Interviewed', 'Offered', 'Hired'],
          datasets: [{
            data: [100, 70, 40, 20, 10],
            backgroundColor: [
              '#6366F1',
              '#8B5CF6',
              '#EC4899',
              '#F59E0B',
              '#10B981'
            ],
            borderWidth: 0
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutout: '70%',
          plugins: {
            legend: {
              position: 'right'
            }
          }
        }
      });
    }
  }

  // Tab management
  setActiveTab(tab: string): void {
    this.activeTab = tab;
  }

  // Applications management
  filterApplications(): void {
    this.filteredApplications = this.applications.filter(app => {
      const matchesStatus = this.applicationStatusFilter === 'all' || app.status === this.applicationStatusFilter;
      const matchesSearch = this.applicantSearchQuery === '' || 
        app.candidate.name.toLowerCase().includes(this.applicantSearchQuery.toLowerCase()) ||
        app.jobTitle.toLowerCase().includes(this.applicantSearchQuery.toLowerCase());
      return matchesStatus && matchesSearch;
    });
    this.paginateApplications();
  }

  paginateApplications(): void {
    const startIndex = (this.currentAppPage - 1) * this.itemsPerPage;
    this.paginatedApplications = this.filteredApplications.slice(startIndex, startIndex + this.itemsPerPage);
  }

  getAppPageNumbers(): number[] {
    const totalPages = Math.ceil(this.filteredApplications.length / this.itemsPerPage);
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  goToAppPage(page: number): void {
    this.currentAppPage = page;
    this.paginateApplications();
  }

  previousAppPage(): void {
    if (this.currentAppPage > 1) {
      this.currentAppPage--;
      this.paginateApplications();
    }
  }

  nextAppPage(): void {
    if (this.currentAppPage * this.itemsPerPage < this.filteredApplications.length) {
      this.currentAppPage++;
      this.paginateApplications();
    }
  }

  viewApplication(applicationId: number): void {
    this.selectedApplication = this.applications.find(app => app.id === applicationId);
    this.showApplicationModal = true;
  }

  closeApplicationModal(): void {
    this.showApplicationModal = false;
    this.selectedApplication = null;
  }

  downloadResume(url: string): void {
    console.log('Downloading resume from:', url);
    // Implementation for downloading resume
  }

  changeApplicationStatus(applicationId: number, status: string): void {
    const application = this.applications.find(app => app.id === applicationId);
    if (application) {
      const wasNew = application.status === 'New';
      application.status = status;
      if (status === 'New' && !wasNew) {
        this.newApplicationsCount++;
      } else if (wasNew && status !== 'New') {
        this.newApplicationsCount--;
      }
    }
    this.filterApplications();
  }

  updateApplicationStatus(): void {
    if (this.selectedApplication) {
      this.changeApplicationStatus(this.selectedApplication.id, this.selectedApplication.status);
    }
  }

  scheduleInterview(applicationId: number): void {
    this.selectedApplication = this.applications.find(app => app.id === applicationId);
    this.showInterviewModal = true;
  }

  closeInterviewModal(): void {
    this.showInterviewModal = false;
    this.interviewDetails = {
      date: '',
      time: '',
      type: 'Video',
      meetingLink: '',
      location: '',
      interviewers: '',
      notes: ''
    };
  }

  isInterviewFormValid(): boolean {
    return !!this.interviewDetails.date && !!this.interviewDetails.time && !!this.interviewDetails.type;
  }

  confirmInterview(): void {
    if (this.isInterviewFormValid()) {
      console.log('Scheduling interview:', this.interviewDetails);
      this.changeApplicationStatus(this.selectedApplication.id, 'Interview');
      this.closeInterviewModal();
    }
  }

  // Reports management
  generateReport(): void {
    this.showReportModal = true;
  }

  closeReportModal(): void {
    this.showReportModal = false;
    this.reportDetails = {
      name: '',
      type: 'Applications',
      startDate: '',
      endDate: '',
      format: 'PDF',
      filters: {
        byDepartment: false,
        byStatus: false,
        bySource: false
      }
    };
  }

  isReportFormValid(): boolean {
    return !!this.reportDetails.name && !!this.reportDetails.type && !!this.reportDetails.format;
  }

  generateCustomReport(): void {
    if (this.isReportFormValid()) {
      const newReport = {
        id: this.reports.length + 1,
        name: this.reportDetails.name,
        type: this.reportDetails.type,
        generatedOn: new Date()
      };
      this.reports.unshift(newReport);
      this.closeReportModal();
    }
  }

  exportReport(type: string): void {
    console.log('Exporting report:', type);
    // Implementation for exporting reports
  }

  viewReport(reportId: number): void {
    console.log('Viewing report with ID:', reportId);
    // Implementation for viewing reports
  }

  downloadReport(reportId: number): void {
    console.log('Downloading report with ID:', reportId);
    // Implementation for downloading reports
  }

  deleteReport(reportId: number): void {
    this.reports = this.reports.filter(report => report.id !== reportId);
  }
}