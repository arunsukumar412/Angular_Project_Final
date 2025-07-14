import { Component, AfterViewInit, ElementRef, ViewChild, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import Chart from 'chart.js/auto';
import { SidebarComponent } from "../sidebar/sidebar.component";
import { interval, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { Subject } from 'rxjs';

type WeekKey = 'week1' | 'week2' | 'week3' | 'week4';
type TimeRangeKey = '7days' | '30days' | '90days';

interface SummaryCard {
  title: string;
  value: number;
  change: number;
  isPositive: boolean;
  progress: number;
  icon: string;
  iconBg: string;
}

interface PlatformMetric {
  metric: string;
  value: string;
  percentage: number;
  color: string;
}

interface ActivityItem {
  icon: string;
  iconBg: string;
  title: string;
  description: string;
  time: string;
}

interface TopUser {
  name: string;
  points: number;
  role: string;
  roleColor: string;
  connections: number;
  image: string;
}

interface JobPosting {
  title: string;
  company: string;
  location: string;
  category: string;
  categoryColor: string;
  applications: number;
  status: string;
  statusColor: string;
  posted: string;
  logo: string;
}

interface JobCategory {
  name: string;
  value: number;
  color: string;
}

interface WeeklyData {
  current: number[];
  previous: number[];
  avg: number;
  total: number;
}

interface TimeRangeData {
  applications: number[];
  hires: number[];
  conversion: number;
}

interface UserActivityData {
  active: number;
  inactive: number;
  newToday: number;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements AfterViewInit, OnInit, OnDestroy {
  constructor(private router: Router) {}

  // View Refs
  @ViewChild('loginChart') loginChartRef!: ElementRef;
  @ViewChild('applicationsChart') applicationsChartRef!: ElementRef;
  @ViewChild('userActivityChart') userActivityChartRef!: ElementRef;
  @ViewChild('searchInput') searchInputRef!: ElementRef;

  // State
  selectedTimeRange: TimeRangeKey = '30days';
  selectedWeek: WeekKey = 'week1';
  searchQuery = '';
  searchQueryChanged: Subject<string> = new Subject<string>();

  // UI State
  isSidebarCollapsed = false;
  isDarkMode = false;
  showNotificationDropdown = false;
  showUserDropdown = false;
  isLoading = false;
  isRefreshing = false;

  // Charts
  loginChart: Chart | null = null;
  applicationsChart: Chart | null = null;
  userActivityChart: Chart | null = null;

  // Data
  summaryCards: SummaryCard[] = [];
  platformPerformance: PlatformMetric[] = [];
  recentActivity: ActivityItem[] = [];
  topUsers: TopUser[] = [];
  recentJobs: JobPosting[] = [];
  weeklyData: Record<WeekKey, WeeklyData> = {
    week1: { current: [], previous: [], avg: 0, total: 0 },
    week2: { current: [], previous: [], avg: 0, total: 0 },
    week3: { current: [], previous: [], avg: 0, total: 0 },
    week4: { current: [], previous: [], avg: 0, total: 0 }
  };
  timeRangeData: Record<TimeRangeKey, TimeRangeData> = {
    '7days': { applications: [], hires: [], conversion: 0 },
    '30days': { applications: [], hires: [], conversion: 0 },
    '90days': { applications: [], hires: [], conversion: 0 }
  };
  userActivityData: UserActivityData = { active: 0, inactive: 0, newToday: 0 };
  jobCategories: JobCategory[] = [];

  // Subscriptions
  private dataRefreshSubscription!: Subscription;
  private searchSubscription!: Subscription;

  ngOnInit(): void {
    // Initialize data
    this.initializeData();
    
    // Set up auto-refresh every 5 minutes
    this.dataRefreshSubscription = interval(300000).subscribe(() => {
      this.refreshData();
    });

    // Set up search debounce
    this.searchSubscription = this.searchQueryChanged
      .pipe(
        debounceTime(500),
        distinctUntilChanged()
      )
      .subscribe(query => {
        this.handleSearch(query);
      });
  }

  ngAfterViewInit(): void {
    this.initializeCharts();
    this.setupEventListeners();
  }

  ngOnDestroy(): void {
    if (this.dataRefreshSubscription) {
      this.dataRefreshSubscription.unsubscribe();
    }
    if (this.searchSubscription) {
      this.searchSubscription.unsubscribe();
    }
    this.destroyCharts();
  }

  initializeData(): void {
    // Summary cards
    this.summaryCards = [
      {
        title: 'Total Users',
        value: 12548,
        change: 12.5,
        isPositive: true,
        progress: 75,
        icon: 'fas fa-users',
        iconBg: 'bg-blue-100'
      },
      {
        title: 'HR Professionals',
        value: 864,
        change: 8.2,
        isPositive: true,
        progress: 65,
        icon: 'fas fa-user-tie',
        iconBg: 'bg-indigo-100'
      },
      {
        title: 'Jobs Posted',
        value: 3421,
        change: 2.3,
        isPositive: false,
        progress: 55,
        icon: 'fas fa-briefcase',
        iconBg: 'bg-amber-100'
      },
      {
        title: 'Applications',
        value: 21548,
        change: 24.7,
        isPositive: true,
        progress: 85,
        icon: 'fas fa-file-alt',
        iconBg: 'bg-purple-100'
      }
    ];

    // Platform performance
    this.platformPerformance = [
      { metric: 'Server Uptime', value: '99.98%', percentage: 99.8, color: 'bg-primary' },
      { metric: 'Response Time', value: '142ms', percentage: 95, color: 'bg-green-500' },
      { metric: 'API Success Rate', value: '99.2%', percentage: 99.2, color: 'bg-blue-500' },
      { metric: 'Database Load', value: '32%', percentage: 32, color: 'bg-yellow-500' }
    ];

    // Recent activity
    this.recentActivity = this.generateRecentActivity(5);

    // Top users
    this.topUsers = this.generateTopUsers(5);

    // Recent jobs
    this.recentJobs = this.generateRecentJobs(5);

    // Weekly data
    this.weeklyData = this.generateWeeklyData();

    // Time range data
    this.timeRangeData = this.generateTimeRangeData();

    // User activity
    this.userActivityData = {
      active: 8562,
      inactive: 3986,
      newToday: 124
    };

    // Job categories
    this.jobCategories = [
      { name: 'Technology', value: 42, color: '#4F46E5' },
      { name: 'Healthcare', value: 23, color: '#EC4899' },
      { name: 'Finance', value: 15, color: '#F59E0B' },
      { name: 'Other', value: 20, color: '#10B981' }
    ];
  }

  initializeCharts(): void {
    this.initializeLoginChart();
    this.initializeApplicationsChart();
    this.initializeUserActivityChart();
  }

  destroyCharts(): void {
    if (this.loginChart) {
      this.loginChart.destroy();
      this.loginChart = null;
    }
    if (this.applicationsChart) {
      this.applicationsChart.destroy();
      this.applicationsChart = null;
    }
    if (this.userActivityChart) {
      this.userActivityChart.destroy();
      this.userActivityChart = null;
    }
  }

  generateRecentActivity(count: number): ActivityItem[] {
    const activities: ActivityItem[] = [];
    const types = [
      { icon: 'fa-user-plus', title: 'New user registered', description: 'joined the platform' },
      { icon: 'fa-briefcase', title: 'New job posted', description: 'posted a new position' },
      { icon: 'fa-file-signature', title: 'Application submitted', description: 'applied for a job' },
      { icon: 'fa-check-circle', title: 'Job completed', description: 'position was filled' },
      { icon: 'fa-exclamation-triangle', title: 'System alert', description: 'high traffic detected' }
    ];
    const colors = ['blue', 'green', 'purple', 'yellow', 'red'];
    const names = ['John Smith', 'TechLead Inc.', 'Sarah Johnson', 'Digital Solutions', 'System'];

    for (let i = 0; i < count; i++) {
      const type = types[i % types.length];
      const timeOptions = [
        `${Math.floor(Math.random() * 60)} minutes ago`,
        `${Math.floor(Math.random() * 24)} hours ago`,
        'Yesterday',
        `${Math.floor(Math.random() * 7)} days ago`
      ];
      
      activities.push({
        icon: `fas ${type.icon}`,
        iconBg: `bg-${colors[i % colors.length]}-600`,
        title: type.title,
        description: `${names[i % names.length]} ${type.description}`,
        time: timeOptions[i % timeOptions.length]
      });
    }
    
    return activities;
  }

  generateTopUsers(count: number): TopUser[] {
    const users: TopUser[] = [];
    const names = ['Emily Johnson', 'Michael Chen', 'David Wilson', 'Sarah Williams', 'Robert Taylor'];
    const roles = ['HR Professional', 'Recruiter', 'Hiring Manager', 'Talent Acquisition', 'HR Director'];
    const roleColors = ['green', 'blue', 'purple', 'pink', 'indigo'];
    const images = [
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
      'https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
      'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
      'https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
    ];

    for (let i = 0; i < count; i++) {
      users.push({
        name: names[i % names.length],
        points: Math.floor(Math.random() * 1000) + 500,
        role: roles[i % roles.length],
        roleColor: `bg-${roleColors[i % roleColors.length]}-100 text-${roleColors[i % roleColors.length]}-800`,
        connections: Math.floor(Math.random() * 20) + 10,
        image: images[i % images.length]
      });
    }
    
    // Sort by points
    return users.sort((a, b) => b.points - a.points);
  }

  generateRecentJobs(count: number): JobPosting[] {
    const jobs: JobPosting[] = [];
    const titles = ['Senior UX Designer', 'Backend Developer', 'Marketing Manager', 'Data Scientist', 'HR Coordinator'];
    const companies = ['TechLead Inc.', 'Digital Solutions', 'Brand Vision', 'Analytics Pro', 'HR Inc.'];
    const locations = ['San Francisco, CA', 'New York, NY', 'Chicago, IL', 'Boston, MA', 'Austin, TX'];
    const categories = ['Design', 'Development', 'Marketing', 'Data', 'Human Resources'];
    const categoryColors = ['blue', 'purple', 'pink', 'indigo', 'red'];
    const statuses = ['Active', 'Pending', 'Closed'];
    const statusColors = ['green', 'yellow', 'gray'];
    const postedOptions = ['2 days ago', '1 week ago', '2 weeks ago', '3 weeks ago'];

    for (let i = 0; i < count; i++) {
      const statusIndex = i % statuses.length;
      
      jobs.push({
        title: titles[i % titles.length],
        company: companies[i % companies.length],
        location: locations[i % locations.length],
        category: categories[i % categories.length],
        categoryColor: `bg-${categoryColors[i % categoryColors.length]}-100 text-${categoryColors[i % categoryColors.length]}-800`,
        applications: Math.floor(Math.random() * 200) + 50,
        status: statuses[statusIndex],
        statusColor: `bg-${statusColors[statusIndex]}-100 text-${statusColors[statusIndex]}-800`,
        posted: postedOptions[i % postedOptions.length],
        logo: 'assets/icons/Gen.png'
      });
    }
    
    return jobs;
  }

  generateWeeklyData(): Record<WeekKey, WeeklyData> {
    const data: Record<WeekKey, WeeklyData> = {
      week1: { current: [], previous: [], avg: 0, total: 0 },
      week2: { current: [], previous: [], avg: 0, total: 0 },
      week3: { current: [], previous: [], avg: 0, total: 0 },
      week4: { current: [], previous: [], avg: 0, total: 0 }
    };

    // Generate realistic weekly data with trends
    const weeks: WeekKey[] = ['week1', 'week2', 'week3', 'week4'];
    let prevWeekAvg = 300;
    
    weeks.forEach(week => {
      const weekAvg = prevWeekAvg + (Math.random() * 100 - 30);
      const currentWeek: number[] = [];
      const previousWeek: number[] = [];
      let weekTotal = 0;
      
      // Generate daily data with some randomness
      for (let i = 0; i < 7; i++) {
        const dayValue = Math.floor(weekAvg + (Math.random() * 100 - 50));
        currentWeek.push(dayValue);
        weekTotal += dayValue;
        
        // Previous week is 10-20% less
        previousWeek.push(Math.floor(dayValue * (0.8 + Math.random() * 0.1)));
      }
      
      data[week] = {
        current: currentWeek,
        previous: previousWeek,
        avg: Math.floor(weekTotal / 7),
        total: weekTotal
      };
      
      prevWeekAvg = weekAvg;
    });
    
    return data;
  }

  generateTimeRangeData(): Record<TimeRangeKey, TimeRangeData> {
    const data: Record<TimeRangeKey, TimeRangeData> = {
      '7days': { applications: [], hires: [], conversion: 0 },
      '30days': { applications: [], hires: [], conversion: 0 },
      '90days': { applications: [], hires: [], conversion: 0 }
    };

    // Generate 7 days data
    const apps7: number[] = [];
    const hires7: number[] = [];
    let totalApps7 = 0;
    let totalHires7 = 0;
    
    for (let i = 0; i < 7; i++) {
      const appCount = Math.floor(120 + Math.random() * 100);
      const hireCount = Math.floor(appCount * (0.03 + Math.random() * 0.02));
      apps7.push(appCount);
      hires7.push(hireCount);
      totalApps7 += appCount;
      totalHires7 += hireCount;
    }
    
    data['7days'] = {
      applications: apps7,
      hires: hires7,
      conversion: parseFloat(((totalHires7 / totalApps7) * 100).toFixed(1))
    };

    // Generate 30 days data (weekly pattern)
    const apps30: number[] = [];
    const hires30: number[] = [];
    let totalApps30 = 0;
    let totalHires30 = 0;
    
    for (let i = 0; i < 30; i++) {
      const dayOfWeek = i % 7;
      let appCount, hireCount;
      
      if (dayOfWeek === 0 || dayOfWeek === 6) { // Weekend
        appCount = Math.floor(80 + Math.random() * 40);
      } else { // Weekday
        appCount = Math.floor(150 + Math.random() * 80);
      }
      
      hireCount = Math.floor(appCount * (0.025 + Math.random() * 0.015));
      apps30.push(appCount);
      hires30.push(hireCount);
      totalApps30 += appCount;
      totalHires30 += hireCount;
    }
    
    data['30days'] = {
      applications: apps30,
      hires: hires30,
      conversion: parseFloat(((totalHires30 / totalApps30) * 100).toFixed(1))
    };

    // Generate 90 days data (monthly pattern)
    const apps90: number[] = [];
    const hires90: number[] = [];
    let totalApps90 = 0;
    let totalHires90 = 0;
    
    for (let i = 0; i < 90; i++) {
      const weekOfMonth = Math.floor(i / 7) % 4;
      let appCount, hireCount;
      
      if (weekOfMonth === 0) { // First week of month
        appCount = Math.floor(200 + Math.random() * 100);
      } else if (weekOfMonth === 3) { // Last week of month
        appCount = Math.floor(100 + Math.random() * 50);
      } else { // Middle weeks
        appCount = Math.floor(150 + Math.random() * 80);
      }
      
      hireCount = Math.floor(appCount * (0.02 + Math.random() * 0.01));
      apps90.push(appCount);
      hires90.push(hireCount);
      totalApps90 += appCount;
      totalHires90 += hireCount;
    }
    
    data['90days'] = {
      applications: apps90,
      hires: hires90,
      conversion: parseFloat(((totalHires90 / totalApps90) * 100).toFixed(1))
    };
    
    return data;
  }

  initializeLoginChart(): void {
    const ctx = this.loginChartRef.nativeElement.getContext('2d');
    const data = this.weeklyData[this.selectedWeek];
    
    this.loginChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [
          {
            label: 'Current Week',
            data: data.current,
            borderColor: 'rgba(79, 70, 229, 1)',
            backgroundColor: 'rgba(79, 70, 229, 0.2)',
            fill: true,
            tension: 0.4,
            borderWidth: 2,
            pointBackgroundColor: 'rgba(79, 70, 229, 1)',
            pointRadius: 4,
            pointHoverRadius: 6
          },
          {
            label: 'Previous Week',
            data: data.previous,
            borderColor: 'rgba(236, 72, 153, 1)',
            backgroundColor: 'rgba(236, 72, 153, 0.2)',
            fill: true,
            tension: 0.4,
            borderWidth: 2,
            borderDash: [5, 5],
            pointBackgroundColor: 'rgba(236, 72, 153, 1)',
            pointRadius: 4,
            pointHoverRadius: 6
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
            labels: {
              usePointStyle: true,
              padding: 20
            }
          },
          tooltip: {
            mode: 'index',
            intersect: false,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            titleFont: { size: 14, weight: 'bold' },
            bodyFont: { size: 12 },
            padding: 12,
            cornerRadius: 8
          }
        },
        scales: {
          y: {
            beginAtZero: false,
            grid: {
              color: 'rgba(0, 0, 0, 0.05)'
            },
            ticks: {
              stepSize: 100
            }
          },
          x: {
            grid: {
              display: false
            }
          }
        },
        animation: {
          duration: 1000,
          easing: 'easeOutQuart'
        }
      }
    });
  }

  initializeApplicationsChart(): void {
    const ctx = this.applicationsChartRef.nativeElement.getContext('2d');
    const data = this.timeRangeData[this.selectedTimeRange];
    const days = data.applications.length;
    
    this.applicationsChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: Array.from({length: days}, (_, i) => `Day ${i+1}`),
        datasets: [
          {
            label: 'Applications',
            data: data.applications,
            backgroundColor: 'rgba(79, 70, 229, 0.7)',
            borderRadius: 4,
            borderWidth: 0
          },
          {
            label: 'Hires',
            data: data.hires,
            backgroundColor: 'rgba(16, 185, 129, 0.7)',
            borderRadius: 4,
            borderWidth: 0
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
            labels: {
              usePointStyle: true,
              padding: 20
            }
          },
          tooltip: {
            mode: 'index',
            intersect: false,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            titleFont: { size: 14, weight: 'bold' },
            bodyFont: { size: 12 },
            padding: 12,
            cornerRadius: 8
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            stacked: false,
            grid: {
              color: 'rgba(0, 0, 0, 0.05)'
            }
          },
          x: {
            stacked: false,
            grid: {
              display: false
            }
          }
        },
        animation: {
          duration: 1000,
          easing: 'easeOutQuart'
        }
      }
    });
  }

  initializeUserActivityChart(): void {
    const ctx = this.userActivityChartRef.nativeElement.getContext('2d');
    
    this.userActivityChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Active', 'Inactive', 'New Today'],
        datasets: [{
          data: [
            this.userActivityData.active,
            this.userActivityData.inactive,
            this.userActivityData.newToday
          ],
          backgroundColor: [
            'rgba(79, 70, 229, 0.7)',
            'rgba(236, 72, 153, 0.7)',
            'rgba(16, 185, 129, 0.7)'
          ],
          borderWidth: 0,
          hoverOffset: 10
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '70%',
        plugins: {
          legend: {
            position: 'right',
            labels: {
              usePointStyle: true,
              padding: 20
            }
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            titleFont: { size: 14, weight: 'bold' },
            bodyFont: { size: 12 },
            padding: 12,
            cornerRadius: 8,
            callbacks: {
              label: (context) => {
                const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
                const value = context.raw as number;
                const percentage = Math.round((value / total) * 100);
                return `${context.label}: ${value.toLocaleString()} (${percentage}%)`;
              }
            }
          }
        },
        animation: {
          animateScale: true,
          animateRotate: true
        }
      }
    });
  }

  setupEventListeners(): void {
    // Close dropdowns when clicking outside
    document.addEventListener('click', (event) => {
      const userMenuButton = document.getElementById('user-menu-button');
      const notificationButton = document.getElementById('notification-btn');

      if (userMenuButton && !userMenuButton.contains(event.target as Node)) {
        this.showUserDropdown = false;
      }
      if (notificationButton && !notificationButton.contains(event.target as Node)) {
        this.showNotificationDropdown = false;
      }
    });

    // Mobile menu toggle
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    if (mobileMenuButton) {
      mobileMenuButton.addEventListener('click', () => {
        this.toggleSidebar();
      });
    }
  }

  // UI Interactions
  toggleSidebar(): void {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
  }

  toggleDarkMode(): void {
    this.isDarkMode = !this.isDarkMode;
    document.body.classList.toggle('dark');
    // You would also update charts for dark mode here
  }

  toggleNotificationDropdown(): void {
    this.showNotificationDropdown = !this.showNotificationDropdown;
    if (this.showNotificationDropdown) {
      this.showUserDropdown = false;
    }
  }

  toggleUserDropdown(): void {
    this.showUserDropdown = !this.showUserDropdown;
    if (this.showUserDropdown) {
      this.showNotificationDropdown = false;
    }
  }

  onSearchChange(query: string): void {
    this.searchQueryChanged.next(query);
  }

  handleSearch(query: string): void {
    // Filter data based on search query
    if (query.trim() === '') {
      // Reset to original data if query is empty
      this.recentJobs = this.generateRecentJobs(5);
      this.topUsers = this.generateTopUsers(5);
      this.recentActivity = this.generateRecentActivity(5);
    } else {
      // Filter jobs and users based on query
      const lowerQuery = query.toLowerCase();
      this.recentJobs = this.generateRecentJobs(20).filter(job => 
        job.title.toLowerCase().includes(lowerQuery) || 
        job.company.toLowerCase().includes(lowerQuery) ||
        job.category.toLowerCase().includes(lowerQuery)
      ).slice(0, 5);
      
      this.topUsers = this.generateTopUsers(20).filter(user => 
        user.name.toLowerCase().includes(lowerQuery) ||
        user.role.toLowerCase().includes(lowerQuery)
      ).slice(0, 5);
      
      this.recentActivity = this.generateRecentActivity(20).filter(activity => 
        activity.title.toLowerCase().includes(lowerQuery) ||
        activity.description.toLowerCase().includes(lowerQuery)
      ).slice(0, 5);
    }
  }

  updateWeek(week: WeekKey): void {
    this.selectedWeek = week;
    const data = this.weeklyData[week];
    
    if (this.loginChart) {
      this.loginChart.data.datasets[0].data = data.current;
      this.loginChart.data.datasets[1].data = data.previous;
      this.loginChart.update();
    }
  }

  updateTimeRange(range: TimeRangeKey): void {
    this.selectedTimeRange = range;
    const data = this.timeRangeData[range];
    
    if (this.applicationsChart) {
      const days = data.applications.length;
      this.applicationsChart.data.labels = Array.from({length: days}, (_, i) => `Day ${i+1}`);
      this.applicationsChart.data.datasets[0].data = data.applications;
      this.applicationsChart.data.datasets[1].data = data.hires;
      this.applicationsChart.update();
    }
  }

  refreshData(): void {
    this.isRefreshing = true;
    
    // Simulate API call with delay
    setTimeout(() => {
      // Generate fresh data
      this.summaryCards = this.summaryCards.map(card => ({
        ...card,
        value: Math.floor(card.value * (0.9 + Math.random() * 0.2)), // ±10% change
        change: parseFloat((card.change * (0.8 + Math.random() * 0.4)).toFixed(1)), // ±20% change
        isPositive: Math.random() > 0.4, // 60% chance of positive
        progress: Math.floor(card.progress * (0.8 + Math.random() * 0.4)) // ±20% change
      }));
      
      this.weeklyData = this.generateWeeklyData();
      this.timeRangeData = this.generateTimeRangeData();
      this.userActivityData = {
        active: Math.floor(this.userActivityData.active * (0.9 + Math.random() * 0.2)),
        inactive: Math.floor(this.userActivityData.inactive * (0.9 + Math.random() * 0.2)),
        newToday: Math.floor(Math.random() * 200) + 50
      };
      
      // Rotate some recent activity
      if (Math.random() > 0.7) { // 30% chance to rotate
        this.recentActivity = this.generateRecentActivity(5);
      }
      
      // Rotate some top users
      if (Math.random() > 0.7) { // 30% chance to rotate
        this.topUsers = this.generateTopUsers(5);
      }
      
      // Rotate some jobs
      if (Math.random() > 0.7) { // 30% chance to rotate
        this.recentJobs = this.generateRecentJobs(5);
      }
      
      // Update charts
      this.updateWeek(this.selectedWeek);
      this.updateTimeRange(this.selectedTimeRange);
      
      if (this.userActivityChart) {
        this.userActivityChart.data.datasets[0].data = [
          this.userActivityData.active,
          this.userActivityData.inactive,
          this.userActivityData.newToday
        ];
        this.userActivityChart.update();
      }
      
      this.isRefreshing = false;
    }, 1500); // Simulate network delay
  }

  formatNumber(num: number): string {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  }

  navigateToManageJobs(): void {
    this.router.navigate(['/user-management']);
  }

  // Utility function to get random element from array
  private getRandomElement<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)];
  }
}