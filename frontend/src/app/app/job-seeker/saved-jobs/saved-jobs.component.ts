import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { JobseekerSidebarComponent } from '../jobseeker-sidebar/jobseeker-sidebar.component';

interface Job {
  id: number;
  title: string;
  company: string;
  location: string;
  type: string;
  salary: string;
  description: string;
  dateSaved: Date;
}

@Component({
  selector: 'app-saved-jobs',
  templateUrl: './saved-jobs.component.html',
  styleUrls: ['./saved-jobs.component.css'],
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, JobseekerSidebarComponent]
})
export class SavedJobsComponent implements OnInit {
  isLoading: boolean = true;
  showJobDetails: boolean = false;
  selectedJob: Job | null = null;
  isDarkMode: boolean = false;
  searchQuery: string = '';
  savedJobs: Job[] = [];
  filteredJobs: Job[] = [];

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.loadSavedJobs();
  }

  loadSavedJobs(): void {
    this.isLoading = true;
    setTimeout(() => {
      // Mock data (replace with actual API call)
      this.savedJobs = [
        {
          id: 1,
          title: 'Software Engineer',
          company: 'Tech Corp',
          location: 'San Francisco, CA',
          type: 'Full-time',
          salary: '$120,000',
          description: 'Develop and maintain web applications.',
          dateSaved: new Date('2025-07-08')
        },
        {
          id: 2,
          title: 'Data Analyst',
          company: 'Data Insights',
          location: 'New York, NY',
          type: 'Part-time',
          salary: '$90,000',
          description: 'Analyze data and generate reports.',
          dateSaved: new Date('2025-07-07')
        }
      ];
      this.filteredJobs = [...this.savedJobs];
      this.isLoading = false;
    }, 1000); // Simulated loading delay
  }

  filterJobs(): void {
    const query = this.searchQuery.toLowerCase().trim();
    this.filteredJobs = this.savedJobs.filter(job =>
      job.title.toLowerCase().includes(query) || job.company.toLowerCase().includes(query)
    );
  }

  viewJobDetails(job: Job): void {
    this.selectedJob = { ...job }; // Create a copy to avoid direct mutation
    this.showJobDetails = true;
  }

  hideJobDetails(): void {
    this.showJobDetails = false;
    this.selectedJob = null;
  }

  removeJob(jobId: number): void {
    if (confirm('Are you sure you want to remove this job?')) {
      this.savedJobs = this.savedJobs.filter(job => job.id !== jobId);
      this.filteredJobs = this.filteredJobs.filter(job => job.id !== jobId);
      alert('Job removed successfully!');
      console.log('Removed job with ID:', jobId);
    }
  }

  applyForJob(jobId: number): void {
    console.log('Applying for job with ID:', jobId);
    // Implement apply logic (e.g., navigate to application page)
    alert('Applying for job...');
  }

  shareJob(jobId: number): void {
    const job = this.savedJobs.find(j => j.id === jobId);
    if (job) {
      const shareUrl = `${window.location.origin}/job/${jobId}`;
      navigator.clipboard.writeText(shareUrl).then(() => {
        alert('Job link copied to clipboard!');
        console.log('Shared job:', job.title);
      }).catch(err => console.error('Failed to copy:', err));
    }
  }

  toggleDarkMode(): void {
    this.isDarkMode = !this.isDarkMode;
  }
}