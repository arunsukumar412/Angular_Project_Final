import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Observable, of } from 'rxjs';
import { JobseekerSidebarComponent } from '../jobseeker-sidebar/jobseeker-sidebar.component';

interface Application {
  id: string;
  jobTitle: string;
  company: string;
  date: Date;
  status: string;
}

interface Interview {
  id: string;
  jobTitle: string;
  company: string;
  date: Date;
  type: string;
  status: string;
  meetingLink?: string;
  phoneNumber?: string;
}

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  experience: string;
  remote: boolean;
  description: string;
  postedDate: string;
}

interface ApplicationStats {
  applied: number;
  interview: number;
  offer: number;
}

@Component({
  selector: 'app-jobseeker-dashboard',
  templateUrl: './jobseeker-dashboard.component.html',
  styleUrls: ['./jobseeker-dashboard.component.css'],
  standalone: true,
  imports: [CommonModule, JobseekerSidebarComponent]
})
export class JobseekerDashboardComponent implements OnInit {
  userName: string = 'Arun Sukumar';
  isLoading = false;
  recentApplications: Application[] = [];
  upcomingInterviews: Interview[] = [];
  recommendedJobs: Job[] = [];
  savedJobsCount: number = 5;
  applicationStats: ApplicationStats = { applied: 20, interview: 2, offer: 0 };
  isSidebarOpen = false;

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.isLoading = true;
    this.fetchData().subscribe(data => {
      this.recentApplications = data.applications;
      this.upcomingInterviews = data.interviews;
      this.recommendedJobs = data.recommendedJobs;
      this.isLoading = false;
    });
  }

  private fetchData(): Observable<{ 
    applications: Application[], 
    interviews: Interview[],
    recommendedJobs: Job[]
  }> {
    return of({
      applications: [
        { 
          id: '1',
          jobTitle: 'Senior Software Engineer', 
          company: 'Genworx', 
          date: new Date('2025-06-15'), 
          status: 'Under Review' 
        },
        { 
          id: '2',
          jobTitle: 'Product Manager', 
          company: 'Genworx', 
          date: new Date('2025-06-10'), 
          status: 'Interview' 
        },
        { 
          id: '3',
          jobTitle: 'UX Designer', 
          company: 'Genworx', 
          date: new Date('2025-06-05'), 
          status: 'Submitted' 
        },
      ],
      interviews: [
        {
          id: '1',
          jobTitle: 'Senior Software Engineer',
          company: 'Genworx',
          type: 'Technical',
          date: new Date('2025-07-10T10:00:00'),
          status: 'Scheduled',
          meetingLink: 'https://zoom.us/j/123456789',
        },
        {
          id: '2',
          jobTitle: 'Product Manager',
          company: 'Genworx',
          type: 'HR',
          date: new Date('2025-07-12T14:00:00'),
          status: 'Scheduled',
          phoneNumber: '123-456-7890',
        },
      ],
      recommendedJobs: [
        {
          id: '1',
          title: 'Frontend Developer',
          company: 'Genworx',
          location: 'Chennai India',
          type: 'Full-time',
          experience: 'Mid-level',
          remote: true,
          description: 'We are looking for a skilled Frontend Developer to join our team and help build amazing user experiences.',
          postedDate: '2 days ago'
        },
        {
          id: '2',
          title: 'Data Scientist',
          company: 'Genworx',
          location: 'Chennai, India',
          type: 'Full-time',
          experience: 'Senior',
          remote: false,
          description: 'Join our data team to work on cutting-edge machine learning projects and advanced analytics solutions.',
          postedDate: '1 week ago'
        },
        {
          id: '3',
          title: 'DevOps Engineer',
          company: 'Genworx',
          location: 'Chennai, India',
          type: 'Contract',
          experience: 'Mid-level',
          remote: true,
          description: 'Looking for a DevOps engineer to help us build and maintain our cloud infrastructure and CI/CD pipelines.',
          postedDate: '3 days ago'
        }
      ]
    });
  }

  getUserInitials(): string {
    if (!this.userName) return '';
    const names = this.userName.trim().split(' ');
    if (names.length === 1) {
      return names[0].charAt(0).toUpperCase();
    }
    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
  }

  toggleSidebar(): void {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  navigateTo(path: string): void {
    this.router.navigate([path]);
  }

  viewApplicationDetails(id: string): void {
    this.router.navigate(['/application-details', id]);
  }

  viewInterviewDetails(id: string): void {
    this.router.navigate(['/interview-details', id]);
  }

  applyForJob(id: string): void {
    this.router.navigate(['/apply-job', id]);
  }

  getStatusClass(status: string): string {
    switch (status.toLowerCase()) {
      case 'submitted': return 'bg-blue-100 text-blue-800';
      case 'under review': return 'bg-yellow-100 text-yellow-800';
      case 'interview': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  getInterviewStatusClass(status: string): string {
    switch (status.toLowerCase()) {
      case 'scheduled': return 'bg-green-100 text-green-800';
      case 'rescheduled': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  prepareForInterview(interview: Interview): void {
    console.log('Preparing for interview:', interview);
    this.router.navigate(['/interview-prep']);
  }

  joinInterview(interview: Interview): void {
    if (interview.meetingLink) {
      window.open(interview.meetingLink, '_blank');
    } else if (interview.phoneNumber) {
      window.location.href = `tel:${interview.phoneNumber}`;
    }
  }

  rescheduleInterview(interview: Interview): void {
    console.log('Rescheduling interview:', interview);
    this.router.navigate(['/reschedule-interview', interview.id]);
  }
}