import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { JobseekerSidebarComponent } from '../jobseeker-sidebar/jobseeker-sidebar.component';
import { NgxPaginationModule } from 'ngx-pagination';

interface Job {
  id: number;
  title: string;
  company: string;
  location: string;
  logo: string;
  type: string;
  salary: string;
  description: string;
  postedDate: string;
  deadline: string;
  category: string;
  experience: string;
  tags: string[];
  status: string;
  source: string;
  rating: number;
  isSaved: boolean;
  isRemote?: boolean;
  requirements?: string[];
  benefits?: string[];
}

interface Interview {
  id: number;
  jobTitle: string;
  company: string;
  date: string;
  time?: string;
  location?: string;
  meetingLink?: string;
}

interface Application {
  id: number;
  jobTitle: string;
  company: string;
  status: 'Submitted' | 'Under Review' | 'Interview Scheduled' | 'Offer Extended' | 'Rejected';
  appliedDate: string;
  lastUpdated: string;
}

@Component({
  selector: 'app-browse-jobs',
  templateUrl: './browse-jobs.component.html',
  styleUrls: ['./browse-jobs.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, NgxPaginationModule]
})
export class BrowseJobsComponent implements OnInit {
  jobs: Job[] = [
    {
      id: 1,
      title: 'Software Engineer',
      company: 'Genworx',
      location: 'Chennai, India',
      logo: '/assets/icons/Gen.png',
      type: 'Full-time',
      salary: '6 to 7 CTC',
      description: 'Develop and maintain web applications using modern JavaScript frameworks and collaborate with cross-functional teams to deliver high-quality software solutions.',
      postedDate: '2025-07-01',
      deadline: '2025-08-01',
      category: 'Engineering',
      experience: 'Mid-level',
      tags: ['JavaScript', 'React', 'Angular', 'Node.js'],
      status: 'Open',
      source: 'Company Website',
      rating: 4,
      isSaved: false,
      isRemote: false,
      requirements: [
        '3+ years of experience with JavaScript frameworks',
        'Strong understanding of web technologies',
        'Experience with RESTful APIs'
      ],
      benefits: [
        'Competitive salary',
        'Health insurance',
        'Flexible work hours'
      ]
    },
    {
      id: 2,
      title: 'Data Scientist',
      company: 'Genworx',
      location: 'Chennai, India',
      logo: '/assets/icons/Gen.png',
      type: 'Full-time',
      salary: '4 to 5 CTC',
      description: 'Analyze large datasets to drive insights, build predictive models, and work with stakeholders to implement data-driven strategies.',
      postedDate: '2025-06-25',
      deadline: '2025-07-25',
      category: 'Data Science',
      experience: 'Senior',
      tags: ['Python', 'Machine Learning', 'TensorFlow', 'Pandas'],
      status: 'Open',
      source: 'Job Board',
      rating: 5,
      isSaved: false,
      isRemote: true,
      requirements: [
        '5+ years of experience in data science',
        'Strong Python programming skills',
        'Experience with machine learning frameworks'
      ],
      benefits: [
        'Remote work options',
        'Annual bonus',
        'Professional development budget'
      ]
    },
    {
      id: 3,
      title: 'Product Manager',
      company: 'Genworx',
      location: 'Remote',
      logo: '/assets/icons/Gen.png',
      type: 'Full-time',
      salary: '4 to 5 CTC',
      description: 'Lead product strategy, define roadmaps, and collaborate with engineering and design teams to deliver innovative products.',
      postedDate: '2025-06-20',
      deadline: '2025-07-20',
      category: 'Product Management',
      experience: 'Senior',
      tags: ['Agile', 'Scrum', 'Product Strategy', 'UX'],
      status: 'Open',
      source: 'LinkedIn',
      rating: 4.5,
      isSaved: false,
      isRemote: true,
      requirements: [
        'Proven experience as a Product Manager',
        'Strong analytical skills',
        'Excellent communication abilities'
      ]
    },
    {
      id: 4,
      title: 'UI/UX Designer',
      company: 'Genworx',
      location: 'Chennai, India',
      logo: '/assets/icons/Gen.png',
      type: 'Full-time',
      salary: '4 to 5 CTC',
      description: 'Design user-friendly interfaces, create wireframes, and conduct user research to enhance product usability and aesthetics.',
      postedDate: '2025-06-15',
      deadline: '2025-07-15',
      category: 'Design',
      experience: 'Mid-level',
      tags: ['Figma', 'Adobe XD', 'User Research', 'Prototyping'],
      status: 'Open',
      source: 'Company Website',
      rating: 4.2,
      isSaved: false,
      requirements: [
        'Portfolio demonstrating design skills',
        '2+ years of UX/UI experience',
        'Proficiency in design tools'
      ]
    }
  ];

  filteredJobs: Job[] = [];
  isLoading: boolean = false;
  showFilters: boolean = false;
  isDarkMode: boolean = false;
  isSidebarOpen: boolean = false;
  showModal: boolean = false;
  selectedJob: Job | null = null;
  searchQuery: string = '';
  filterType: string = '';
  filterLocation: string = '';
  minSalary: string = '';
  maxSalary: string = '';
  filterCategory: string = '';
  filterExperience: string = '';
  remoteOnly: boolean = false;
  postedWithin: string = '';
  sortBy: string = 'relevance';
  currentPage: number = 1;
  pageSize: number = 6;
  totalPages: number = 1;
  showSuccessMessage: boolean = false;
  successMessage: string = '';
  salaryError: boolean = false;
  userName: string = 'Arunsukumar';
  savedJobsCount: number = 0;

  // Sample data for filters
  jobTypes = [
    { value: 'Full-time', label: 'Full-time' },
    { value: 'Part-time', label: 'Part-time' },
    { value: 'Contract', label: 'Contract' },
    { value: 'Remote', label: 'Remote' }
  ];

  experienceLevels = [
    { value: 'Entry', label: 'Entry Level' },
    { value: 'Mid-level', label: 'Mid Level' },
    { value: 'Senior', label: 'Senior' }
  ];

  jobCategories = ['Engineering', 'Data Science', 'Product Management', 'Design', 'Marketing', 'Sales'];
  timeOptions = ['Last 24 hours', 'Last 7 days', 'Last 30 days'];

  upcomingInterviews: Interview[] = [
    { 
      id: 1, 
      jobTitle: 'Software Engineer', 
      company: 'Genworx', 
      date: '2025-07-15',
      time: '10:00 AM',
      location: 'Virtual',
      meetingLink: 'https://meet.genworx.com/interview-123'
    },
    { 
      id: 2, 
      jobTitle: 'Data Scientist', 
      company: 'Genworx', 
      date: '2025-07-20',
      time: '2:30 PM',
      location: 'Office - Chennai'
    }
  ];

  recentApplications: Application[] = [
    { 
      id: 1, 
      jobTitle: 'Product Manager', 
      company: 'Innovate Inc', 
      status: 'Under Review',
      appliedDate: '2025-06-28',
      lastUpdated: '2025-07-01'
    },
    { 
      id: 2, 
      jobTitle: 'UI/UX Designer', 
      company: 'Design Studio', 
      status: 'Submitted',
      appliedDate: '2025-06-30',
      lastUpdated: '2025-06-30'
    }
  ];

  @ViewChild('searchQueryInput') searchQueryInput!: ElementRef;

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.applyFilters();
    this.updateSavedJobsCount();
  }

  navigateTo(route: string): void {
    this.router.navigate([route]);
  }

  toggleSidebar(): void {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  updateSavedJobsCount(): void {
    this.savedJobsCount = this.jobs.filter(job => job.isSaved).length;
  }

  toggleFilters(): void {
    this.showFilters = !this.showFilters;
    if (this.showFilters && this.searchQueryInput) {
      setTimeout(() => this.searchQueryInput.nativeElement.focus(), 0);
    }
  }

  clearFilters(): void {
    this.searchQuery = '';
    this.filterType = '';
    this.filterLocation = '';
    this.minSalary = '';
    this.maxSalary = '';
    this.filterCategory = '';
    this.filterExperience = '';
    this.remoteOnly = false;
    this.postedWithin = '';
    this.sortBy = 'relevance';
    this.currentPage = 1;
    this.salaryError = false;
    this.applyFilters();
  }

  toggleDarkMode(): void {
    this.isDarkMode = !this.isDarkMode;
    document.documentElement.classList.toggle('dark', this.isDarkMode);
  }

  exportJobs(): void {
    const csvContent = [
      'Title,Company,Location,Salary,Type,Category,Experience,Posted Date',
      ...this.filteredJobs.map(job =>
        `"${job.title}","${job.company}","${job.location}","${job.salary}","${job.type}","${job.category}","${job.experience}","${job.postedDate}"`
      )
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `jobs_export_${new Date().toISOString().slice(0,10)}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
    
    this.showSuccessNotification('Jobs exported successfully!');
  }

  toggleSaveJob(jobId: number): void {
    const job = this.jobs.find(j => j.id === jobId);
    if (job) {
      job.isSaved = !job.isSaved;
      this.updateSavedJobsCount();
      this.showSuccessNotification(
        job.isSaved 
          ? `"${job.title}" at ${job.company} saved to your list` 
          : `"${job.title}" removed from saved jobs`
      );
    }
  }

  viewJobDetails(jobId: number): void {
    const job = this.jobs.find(j => j.id === jobId);
    if (job) {
      this.selectedJob = { ...job };
      this.showModal = true;
    }
  }

  closeModal(): void {
    this.showModal = false;
    this.selectedJob = null;
  }

  applyForJob(jobId: number): void {
    this.router.navigate(['/apply', jobId]);
    this.showSuccessNotification('Application process started');
    this.closeModal();
  }

  shareJob(jobId: number): void {
    const job = this.jobs.find(j => j.id === jobId);
    if (job) {
      const shareUrl = `${window.location.origin}/job/${jobId}`;
      if (navigator.share) {
        navigator.share({
          title: `${job.title} at ${job.company}`,
          text: `Check out this job opportunity: ${job.title} at ${job.company}`,
          url: shareUrl
        }).catch(() => this.copyToClipboard(shareUrl, job));
      } else {
        this.copyToClipboard(shareUrl, job);
      }
    }
  }

  private copyToClipboard(text: string, job: Job): void {
    navigator.clipboard.writeText(text).then(() => {
      this.showSuccessNotification(`Link to "${job.title}" copied to clipboard!`);
    }).catch(() => {
      this.showSuccessNotification('Failed to copy link. Please try again.');
    });
  }

  showSuccessNotification(message: string): void {
    this.successMessage = message;
    this.showSuccessMessage = true;
    setTimeout(() => {
      this.showSuccessMessage = false;
      this.successMessage = '';
    }, 3000);
  }

  validateSalary(): void {
    this.salaryError = false;
    
    if (this.minSalary && !/^\$?\d+([,.]\d+)?$/.test(this.minSalary)) {
      this.salaryError = true;
    }
    
    if (this.maxSalary && !/^\$?\d+([,.]\d+)?$/.test(this.maxSalary)) {
      this.salaryError = true;
    }
    
    if (!this.salaryError) {
      this.applyFilters();
    }
  }

  toggleJobType(type: string): void {
    this.filterType = this.filterType === type ? '' : type;
    this.applyFilters();
  }

  toggleExperienceLevel(level: string): void {
    this.filterExperience = this.filterExperience === level ? '' : level;
    this.applyFilters();
  }

  applyFilters(): void {
    this.isLoading = true;
    
    setTimeout(() => {
      this.filteredJobs = this.jobs.filter(job => {
        // Search query filter
        const matchesSearch = !this.searchQuery ||
          [job.title, job.company, job.description, job.tags.join(' ')]
            .some(field => field.toLowerCase().includes(this.searchQuery.toLowerCase()));
        
        // Job type filter
        const matchesType = !this.filterType || 
          job.type.toLowerCase() === this.filterType.toLowerCase();
        
        // Location filter
        const matchesLocation = !this.filterLocation ||
          job.location.toLowerCase().includes(this.filterLocation.toLowerCase());
        
        // Category filter
        const matchesCategory = !this.filterCategory ||
          job.category.toLowerCase() === this.filterCategory.toLowerCase();
        
        // Experience filter
        const matchesExperience = !this.filterExperience ||
          job.experience.toLowerCase() === this.filterExperience.toLowerCase();
        
        // Remote filter
        const matchesRemote = !this.remoteOnly || job.isRemote;
        
        // Salary filter
        let matchesSalary = true;
        if (this.minSalary || this.maxSalary) {
          const salaryMatch = job.salary.match(/(\d+)\s*to\s*(\d+)/) || 
                             job.salary.match(/(\d+)/);
          
          if (salaryMatch) {
            const minJobSalary = parseFloat(salaryMatch[1]);
            const maxJobSalary = salaryMatch[2] ? parseFloat(salaryMatch[2]) : minJobSalary;
            
            const minFilter = this.minSalary ? parseFloat(this.minSalary.replace(/[$,]/g, '')) : 0;
            const maxFilter = this.maxSalary ? parseFloat(this.maxSalary.replace(/[$,]/g, '')) : Infinity;
            
            matchesSalary = maxJobSalary >= minFilter && minJobSalary <= maxFilter;
          } else {
            matchesSalary = false;
          }
        }
        
        // Posted within filter
        let matchesPostedWithin = true;
        if (this.postedWithin) {
          const days = parseInt(this.postedWithin);
          const postedDate = new Date(job.postedDate);
          const cutoffDate = new Date();
          cutoffDate.setDate(cutoffDate.getDate() - days);
          
          matchesPostedWithin = postedDate >= cutoffDate;
        }
        
        return matchesSearch && matchesType && matchesLocation && 
               matchesCategory && matchesExperience && matchesRemote && 
               matchesSalary && matchesPostedWithin;
      });
      
      // Sorting
      this.sortJobs();
      
      this.updateTotalPages();
      this.currentPage = 1;
      this.isLoading = false;
    }, 500);
  }

  private sortJobs(): void {
    switch (this.sortBy) {
      case 'date-desc':
        this.filteredJobs.sort((a, b) => 
          new Date(b.postedDate).getTime() - new Date(a.postedDate).getTime());
        break;
        
      case 'date-asc':
        this.filteredJobs.sort((a, b) => 
          new Date(a.postedDate).getTime() - new Date(b.postedDate).getTime());
        break;
        
      case 'salary-desc':
        this.filteredJobs.sort((a, b) => this.getMaxSalary(b) - this.getMaxSalary(a));
        break;
        
      case 'salary-asc':
        this.filteredJobs.sort((a, b) => this.getMinSalary(a) - this.getMinSalary(b));
        break;
        
      case 'rating-desc':
        this.filteredJobs.sort((a, b) => b.rating - a.rating);
        break;
        
      default: // relevance
        // Keep original order or implement relevance algorithm
        break;
    }
  }

  private getMinSalary(job: Job): number {
    const match = job.salary.match(/(\d+)\s*to\s*(\d+)/) || job.salary.match(/(\d+)/);
    return match ? parseFloat(match[1]) : 0;
  }

  private getMaxSalary(job: Job): number {
    const match = job.salary.match(/(\d+)\s*to\s*(\d+)/);
    return match ? parseFloat(match[2] || match[1]) : this.getMinSalary(job);
  }

  updatePageSize(): void {
    this.currentPage = 1;
    this.updateTotalPages();
  }

  handlePageEvent(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxVisiblePages = 5;
    
    if (this.totalPages <= maxVisiblePages) {
      for (let i = 1; i <= this.totalPages; i++) {
        pages.push(i);
      }
    } else {
      let start = Math.max(1, this.currentPage - Math.floor(maxVisiblePages / 2));
      const end = Math.min(this.totalPages, start + maxVisiblePages - 1);
      
      if (end - start + 1 < maxVisiblePages) {
        start = end - maxVisiblePages + 1;
      }
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
    }
    
    return pages;
  }

  updateTotalPages(): void {
    this.totalPages = Math.max(1, Math.ceil(this.filteredJobs.length / this.pageSize));
  }
}