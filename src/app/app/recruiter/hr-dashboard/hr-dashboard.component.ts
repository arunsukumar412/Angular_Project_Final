import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import Chart from 'chart.js/auto';
import { RecruiterSidebarComponent } from "../recruiter-sidebar/recruiter-sidebar.component";
import { Route } from '@angular/router';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-hr-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RecruiterSidebarComponent],
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
    { title: 'Candidates', value: 90, change: 12, isPositive: true, progress: 75, icon: 'fas fa-users' },
    { title: 'Interviews', value: 5, change: 5, isPositive: true, progress: 50, icon: 'fas fa-calendar-alt' },
    { title: 'Job Postings', value: 3, change: -2, isPositive: false, progress: 30, icon: 'fas fa-briefcase' }
  ];

  weeklyData = {
    week1: { avg: 150, total: 1050 },
    week2: { avg: 145, total: 1015 },
    week3: { avg: 148, total: 1036 },
    week4: { avg: 152, total: 1064 }
  };

  timeRangeData = {
    '7days': { conversion: 15 },
    '30days': { conversion: 18 },
    '90days': { conversion: 20 }
  };

  userActivityData = { active: 1200, inactive: 300, newToday: 50 };
  jobCategories = [
    { name: 'IT', value: 40, color: '#3B82F6' },
    { name: 'HR', value: 30, color: '#10B981' },
    { name: 'Sales', value: 20, color: '#F59E0B' },
    { name: 'Marketing', value: 10, color: '#EF4444' }
  ];
  platformPerformance = [
    { metric: 'Uptime', value: '99.9%', percentage: 99, color: 'bg-green-500' },
    { metric: 'Response Time', value: '150ms', percentage: 85, color: 'bg-blue-500' },
    { metric: 'Load', value: '75%', percentage: 75, color: 'bg-amber-500' }
  ];
  recentActivity = [
    { title: 'Interview Scheduled', description: 'Candidate A at 10:00 AM', time: '5 mins ago', icon: 'fas fa-calendar-check', iconBg: 'bg-blue-500' },
    { title: 'New Application', description: 'Software Engineer role', time: '15 mins ago', icon: 'fas fa-user-plus', iconBg: 'bg-green-500' },
    { title: 'Job Updated', description: 'Marketing Manager post', time: '1 hour ago', icon: 'fas fa-pen', iconBg: 'bg-amber-500' }
  ];
  topUsers = [
    { name: 'Arun S', image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80', points: 450, role: 'HR', roleColor: 'bg-blue-100 text-blue-800', connections: 25 },
    { name: 'Sukumar K', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80', points: 380, role: 'Recruiter', roleColor: 'bg-green-100 text-green-800', connections: 18 }
  ];
  recentJobs = [
    { title: 'Software Engineer', company: 'GenWorx', location: 'Bangalore, India', category: 'IT', categoryColor: 'bg-blue-100 text-blue-800', applications: 15, status: 'Active', statusColor: 'bg-green-100 text-green-800', posted: '2 days ago', logo: 'https://via.placeholder.com/40' },
    { title: 'HR Manager', company: 'TechCorp', location: 'Chennai, India', category: 'HR', categoryColor: 'bg-green-100 text-green-800', applications: 8, status: 'Pending', statusColor: 'bg-yellow-100 text-yellow-800', posted: '5 days ago', logo: 'https://via.placeholder.com/40' }
  ];

  // Chart References
  @ViewChild('loginChart') loginChartRef!: ElementRef;
  @ViewChild('applicationsChart') applicationsChartRef!: ElementRef;
  @ViewChild('userActivityChart') userActivityChartRef!: ElementRef;
  private loginChart!: Chart;
  private applicationsChart!: Chart;
  private userActivityChart!: Chart;

  constructor(private router: Router) {}

  ngOnInit() {
    this.initializeCharts();
  }

  initializeCharts() {
    this.loginChart = new Chart(this.loginChartRef.nativeElement, {
      type: 'bar',
      data: {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [{
          label: 'Current Period',
          data: [120, 130, 140, 150, 145, 155, 160],
          backgroundColor: 'rgba(59, 130, 246, 0.7)'
        }, {
          label: 'Previous Period',
          data: [110, 125, 135, 140, 130, 145, 150],
          backgroundColor: 'rgba(209, 213, 219, 0.7)'
        }]
      },
      options: { responsive: true, maintainAspectRatio: false }
    });

    this.applicationsChart = new Chart(this.applicationsChartRef.nativeElement, {
      type: 'bar',
      data: {
        labels: ['Week 1', 'Week 2', 'Week 3'],
        datasets: [{
          label: 'Applications',
          data: [200, 180, 220],
          backgroundColor: 'rgba(59, 130, 246, 0.7)'
        }, {
          label: 'Hires',
          data: [30, 25, 35],
          backgroundColor: 'rgba(16, 185, 129, 0.7)'
        }]
      },
      options: { responsive: true, maintainAspectRatio: false }
    });

    this.userActivityChart = new Chart(this.userActivityChartRef.nativeElement, {
      type: 'pie',
      data: {
        labels: ['Active', 'Inactive', 'New Today'],
        datasets: [{
          data: [this.userActivityData.active, this.userActivityData.inactive, this.userActivityData.newToday],
          backgroundColor: ['#3B82F6', '#EF4444', '#10B981']
        }]
      },
      options: { responsive: true, maintainAspectRatio: false }
    });
  }

  updateTimeRange(range: string) {
    this.selectedTimeRange = range;
    // Update charts or data based on time range
    this.applicationsChart.data.datasets[0].data = [200, 180, 220].map(v => v * (range === '30days' ? 1.5 : range === '90days' ? 2 : 1));
    this.applicationsChart.data.datasets[1].data = [30, 25, 35].map(v => v * (range === '30days' ? 1.5 : range === '90days' ? 2 : 1));
    this.applicationsChart.update();
  }

  refreshData() {
    // Simulate data refresh
    this.summaryCards = this.summaryCards.map(card => ({
      ...card,
      value: card.value + (Math.random() * 10 - 5)
    }));
    this.initializeCharts(); // Reinitialize charts with new data if needed
  }

  formatNumber(value: number): string {
    return value.toLocaleString();
  }

  navigateToManageJobs() {
    this.router.navigate(['/hr/job-management']);
  }

  toggleNotificationDropdown() {
    this.showNotificationDropdown = !this.showNotificationDropdown;
  }

  toggleUserDropdown() {
    this.showUserDropdown = !this.showUserDropdown;
  }

  logout() {
    sessionStorage.removeItem('email');
    sessionStorage.removeItem('password');
    this.router.navigate(['/login']);
  }
}