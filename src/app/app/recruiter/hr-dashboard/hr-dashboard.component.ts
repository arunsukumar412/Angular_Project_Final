import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import Chart from 'chart.js/auto';
import { RecruiterSidebarComponent } from "../recruiter-sidebar/recruiter-sidebar.component";
import { RouterModule } from '@angular/router';
import { HrHeaderComponent } from '../hr-header/hr-header.component';
import { HrFooterComponent } from '../hr-footer/hr-footer.component';

@Component({
  selector: 'app-hr-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RecruiterSidebarComponent, RouterModule,HrHeaderComponent,HrFooterComponent,HrFooterComponent],
  templateUrl: './hr-dashboard.component.html',
  styleUrls: ['./hr-dashboard.component.css']
})
export class HrDashboardComponent implements OnInit {
  showNotificationDropdown = false;
  showUserDropdown = false;
  selectedTimeRange = '7days';
  selectedWeek = 'week1';

  // Dynamic Data
  summaryCards = [
    { title: 'Total Applications', value: 1248, change: 12.5, isPositive: true, progress: 75, icon: 'fas fa-file-alt' },
    { title: 'Open Positions', value: 24, change: -3.2, isPositive: false, progress: 60, icon: 'fas fa-briefcase' },
    { title: 'Interviews Scheduled', value: 86, change: 8.7, isPositive: true, progress: 45, icon: 'fas fa-calendar-alt' },
    { title: 'Hires This Month', value: 14, change: 5.3, isPositive: true, progress: 30, icon: 'fas fa-user-tie' }
  ];

  applicationsData = {
    '7days': {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      current: [45, 52, 60, 55, 58, 62, 70],
      previous: [40, 48, 55, 50, 53, 58, 65]
    },
    '30days': {
      labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
      current: [320, 350, 380, 400],
      previous: [300, 330, 360, 380]
    },
    '90days': {
      labels: ['Month 1', 'Month 2', 'Month 3'],
      current: [1200, 1350, 1500],
      previous: [1100, 1250, 1400]
    }
  };

  hiringPipelineData = {
    stages: ['Applied', 'Screened', 'Interviewed', 'Offered', 'Hired'],
    counts: [1200, 800, 400, 150, 80],
    colors: ['#3B82F6', '#60A5FA', '#93C5FD', '#A5B4FC', '#818CF8']
  };

  recentActivity = [
    { 
      title: 'Candidate Accepted Offer', 
      description: 'John Doe for Senior Developer position', 
      time: '2 hours ago', 
      icon: 'fas fa-user-check', 
      iconBg: 'bg-green-100 text-green-600'
    },
    { 
      title: 'Interview Scheduled', 
      description: 'With Sarah Johnson for Marketing role', 
      time: 'Yesterday', 
      icon: 'fas fa-calendar-alt', 
      iconBg: 'bg-blue-100 text-blue-600'
    },
    { 
      title: 'New Job Posted', 
      description: 'Product Manager position', 
      time: '2 days ago', 
      icon: 'fas fa-file-alt', 
      iconBg: 'bg-purple-100 text-purple-600'
    }
  ];

  topCandidates = [
    { 
      name: 'Michael Chen', 
      image: 'assets/icons/candidate1.png', 
      match: 92, 
      role: 'Software Engineer', 
      roleColor: 'bg-green-100 text-green-800', 
      interviews: 3 
    },
    { 
      name: 'Jessica Williams', 
      image: 'assets/icons/candidate2.png', 
      match: 88, 
      role: 'Product Manager', 
      roleColor: 'bg-blue-100 text-blue-800', 
      interviews: 2 
    },
    { 
      name: 'David Kim', 
      image: 'assets/icons/candidate3.png', 
      match: 85, 
      role: 'UX Designer', 
      roleColor: 'bg-yellow-100 text-yellow-800', 
      interviews: 1 
    }
  ];

  activeJobs = [
    { 
      title: 'Senior Software Engineer', 
      department: 'Engineering', 
      applications: 42, 
      status: 'Active', 
      statusColor: 'bg-green-100 text-green-800', 
      posted: 'May 15, 2025' 
    },
    { 
      title: 'Product Manager', 
      department: 'Product', 
      applications: 28, 
      status: 'Active', 
      statusColor: 'bg-green-100 text-green-800', 
      posted: 'June 2, 2025' 
    },
    { 
      title: 'Marketing Specialist', 
      department: 'Marketing', 
      applications: 15, 
      status: 'Closing Soon', 
      statusColor: 'bg-yellow-100 text-yellow-800', 
      posted: 'April 28, 2025' 
    }
  ];

  // Chart References
  @ViewChild('applicationsChart') applicationsChartRef!: ElementRef;
  @ViewChild('hiringPipelineChart') hiringPipelineChartRef!: ElementRef;
  private applicationsChart!: Chart;
  private hiringPipelineChart!: Chart;

  constructor(private router: Router) {}

  ngOnInit() {
    this.initializeCharts();
    this.simulateRealTimeUpdates();
  }

  initializeCharts() {
    // Applications Trend Chart
    this.applicationsChart = new Chart(this.applicationsChartRef.nativeElement, {
      type: 'line',
      data: {
        labels: this.applicationsData[this.selectedTimeRange as keyof typeof this.applicationsData].labels,
        datasets: [
          {
            label: 'Current Period',
            data: this.applicationsData[this.selectedTimeRange as keyof typeof this.applicationsData].current,
            borderColor: '#3B82F6',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            tension: 0.3,
            fill: true
          },
          {
            label: 'Previous Period',
            data: this.applicationsData[this.selectedTimeRange as keyof typeof this.applicationsData].previous,
            borderColor: '#9CA3AF',
            backgroundColor: 'rgba(156, 163, 175, 0.1)',
            tension: 0.3,
            fill: true,
            borderDash: [5, 5]
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          tooltip: {
            mode: 'index',
            intersect: false
          },
          legend: {
            position: 'top'
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: {
              drawOnChartArea: true,
              color: 'rgba(229, 231, 235, 0.5)'
            }
          },
          x: {
            grid: {
              drawOnChartArea: false
            }
          }
        }
      }
    });

    // Hiring Pipeline Chart
    this.hiringPipelineChart = new Chart(this.hiringPipelineChartRef.nativeElement, {
      type: 'bar',
      data: {
        labels: this.hiringPipelineData.stages,
        datasets: [{
          label: 'Candidates',
          data: this.hiringPipelineData.counts,
          backgroundColor: this.hiringPipelineData.colors,
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                const total = this.hiringPipelineData.counts[0];
                const value = context.raw as number;
                const percentage = ((value / total) * 100).toFixed(1);
                return `${value} candidates (${percentage}%)`;
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: {
              drawOnChartArea: true,
              color: 'rgba(229, 231, 235, 0.5)'
            }
          },
          x: {
            grid: {
              drawOnChartArea: false
            }
          }
        }
      }
    });
  }

  updateTimeRange(range: string) {
    this.selectedTimeRange = range;
    
    // Update applications chart data
    this.applicationsChart.data.labels = this.applicationsData[range as keyof typeof this.applicationsData].labels;
    this.applicationsChart.data.datasets[0].data = this.applicationsData[range as keyof typeof this.applicationsData].current;
    this.applicationsChart.data.datasets[1].data = this.applicationsData[range as keyof typeof this.applicationsData].previous;
    this.applicationsChart.update();
    
    // Update summary cards based on time range
    this.updateSummaryCards(range);
  }

  updateSummaryCards(timeRange: string) {
    const multiplier = timeRange === '30days' ? 3 : timeRange === '90days' ? 10 : 1;
    
    this.summaryCards = [
      { 
        title: 'Total Applications', 
        value: 1248 * multiplier, 
        change: timeRange === '7days' ? 12.5 : timeRange === '30days' ? 8.7 : 5.3, 
        isPositive: true, 
        progress: 75, 
        icon: 'fas fa-file-alt' 
      },
      { 
        title: 'Open Positions', 
        value: 24, 
        change: -3.2, 
        isPositive: false, 
        progress: 60, 
        icon: 'fas fa-briefcase' 
      },
      { 
        title: 'Interviews Scheduled', 
        value: 86 * multiplier, 
        change: timeRange === '7days' ? 8.7 : timeRange === '30days' ? 6.2 : 4.1, 
        isPositive: true, 
        progress: 45, 
        icon: 'fas fa-calendar-alt' 
      },
      { 
        title: 'Hires This Month', 
        value: 14 * (timeRange === '90days' ? 3 : 1), 
        change: 5.3, 
        isPositive: true, 
        progress: 30, 
        icon: 'fas fa-user-tie' 
      }
    ];
  }

  refreshData() {
    // Simulate API call delay
    setTimeout(() => {
      // Randomize some data to simulate fresh fetch
      this.summaryCards.forEach(card => {
        const randomChange = Math.random() * 5 - 2.5; // Random change between -2.5 and +2.5
        card.change = parseFloat((card.change + randomChange).toFixed(1));
        card.isPositive = card.change >= 0;
      });

      // Randomize applications data
      Object.keys(this.applicationsData).forEach(key => {
        this.applicationsData[key as keyof typeof this.applicationsData].current = 
          this.applicationsData[key as keyof typeof this.applicationsData].current.map(v => 
            Math.max(0, v + Math.random() * 20 - 10)
          );
        this.applicationsData[key as keyof typeof this.applicationsData].previous = 
          this.applicationsData[key as keyof typeof this.applicationsData].previous.map(v => 
            Math.max(0, v + Math.random() * 20 - 10)
          );
      });

      // Update charts with new data
      this.updateTimeRange(this.selectedTimeRange);
      
      // Add a new random activity
      const activities = [
        'New Application Received',
        'Interview Scheduled',
        'Offer Accepted',
        'Candidate Rejected',
        'New Job Posted'
      ];
      const newActivity = {
        title: activities[Math.floor(Math.random() * activities.length)],
        description: `For ${['Software Engineer', 'Product Manager', 'UX Designer', 'HR Specialist'][Math.floor(Math.random() * 4)]} role`,
        time: 'Just now',
        icon: 'fas fa-bell',
        iconBg: 'bg-blue-100 text-blue-600'
      };
      this.recentActivity.unshift(newActivity);
      if (this.recentActivity.length > 5) this.recentActivity.pop();
      
    }, 1000);
  }

  simulateRealTimeUpdates() {
    // Simulate real-time updates every 30 seconds
    setInterval(() => {
      // Randomly update one of the summary cards
      const randomCardIndex = Math.floor(Math.random() * this.summaryCards.length);
      const randomIncrement = Math.floor(Math.random() * 5) + 1;
      
      this.summaryCards[randomCardIndex].value += randomIncrement;
      this.summaryCards[randomCardIndex].change = parseFloat(
        (this.summaryCards[randomCardIndex].change + (Math.random() * 0.5 - 0.25)).toFixed(1)
      );
      
      // Occasionally add a new candidate
      if (Math.random() > 0.7) {
        const newCandidate = {
          name: ['Alex', 'Taylor', 'Jordan', 'Casey'][Math.floor(Math.random() * 4)] + ' ' + 
                ['Smith', 'Johnson', 'Williams', 'Brown'][Math.floor(Math.random() * 4)],
          image: `assets/icons/candidate${Math.floor(Math.random() * 3) + 1}.png`,
          match: Math.floor(Math.random() * 15) + 80,
          role: ['Developer', 'Designer', 'Manager', 'Analyst'][Math.floor(Math.random() * 4)],
          roleColor: ['bg-blue-100 text-blue-800', 'bg-green-100 text-green-800', 'bg-yellow-100 text-yellow-800'][Math.floor(Math.random() * 3)],
          interviews: Math.floor(Math.random() * 3) + 1
        };
        this.topCandidates.unshift(newCandidate);
        if (this.topCandidates.length > 5) this.topCandidates.pop();
      }
    }, 30000);
  }

  formatNumber(value: number): string {
    return value.toLocaleString();
  }

  navigateToManageJobs() {
    this.router.navigate(['/hr/job-management']);
  }

  toggleNotificationDropdown() {
    this.showNotificationDropdown = !this.showNotificationDropdown;
    if (this.showNotificationDropdown) {
      this.showUserDropdown = false;
    }
  }

  toggleUserDropdown() {
    this.showUserDropdown = !this.showUserDropdown;
    if (this.showUserDropdown) {
      this.showNotificationDropdown = false;
    }
  }

  logout() {
    // Clear session and navigate to login
    sessionStorage.removeItem('hr_token');
    this.router.navigate(['/login']);
  }

  // Utility function to generate random past time
  private getRandomPastTime(): string {
    const times = [
      '5 minutes ago',
      '15 minutes ago',
      '1 hour ago',
      'Yesterday',
      '2 days ago',
      'Last week'
    ];
    return times[Math.floor(Math.random() * times.length)];
  }
}