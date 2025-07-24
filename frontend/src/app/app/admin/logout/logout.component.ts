import { Component, OnInit, Renderer2 } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { JobseekerLogoutComponent } from '../../job-seeker/jobseeker-logout/jobseeker-logout.component';

interface Notification {
  message: string;
  time: string;
}

interface ActivityLog {
  message: string;
  timestamp: Date;
}

@Component({
  selector: 'app-logout',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, SidebarComponent],
  templateUrl: './logout.component.html',
  styleUrls: ['./logout.component.css']
})
export class LogoutComponent implements OnInit {
  currentUser: string = 'Admin User';
  currentDate: Date = new Date(); // Added to match template
  currentYear: number = new Date().getFullYear(); // 2025
  version: string = '1.0.0';
  searchQuery: string = '';
  showNotificationDropdown: boolean = false;
  showUserDropdown: boolean = false;
  unreadNotifications: number = 2;
  notifications: Notification[] = [
    { message: 'New user added', time: '1 hr ago' },
    { message: 'System update available', time: '2 hrs ago' }
  ];
  activityLog: ActivityLog[] = [
    { message: 'Logged in at 01:30 PM IST', timestamp: new Date('2025-07-05T13:30:00+05:30') },
    { message: 'Updated user profile', timestamp: new Date('2025-07-05T12:45:00+05:30') }
  ];
  isSidebarCollapsed: boolean = false;

  constructor(private router: Router, private renderer: Renderer2) {}

  ngOnInit(): void {}

  toggleSidebar(): void {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
  }

  toggleNotificationDropdown(): void {
    this.showNotificationDropdown = !this.showNotificationDropdown;
    if (this.showNotificationDropdown) {
      this.showUserDropdown = false;
      this.unreadNotifications = 0; // Mark as read on open
    }
  }

  toggleUserDropdown(): void {
    this.showUserDropdown = !this.showUserDropdown;
    if (this.showUserDropdown) {
      this.showNotificationDropdown = false;
    }
  }

  markAllAsRead(): void {
    this.unreadNotifications = 0;
    this.showNotificationDropdown = false;
  }

  filterSearch(): void {
    // Implement search logic if needed
    console.log('Search query:', this.searchQuery);
  }

  logoutConfirm(): void {
    // Triggered by the UI, handled by buttons
  }

  logout(): void {
    console.log('Logging out at', new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
    this.router.navigate(['/jobseeker-logout']); // Redirect to login page
  }

  cancelLogout(): void {
    this.router.navigate(['/']); // Return to previous page or dashboard
  }

  openPolicy(type: string): void {
    console.log(`Opening ${type} policy at ${new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' })}`);
    this.router.navigate([`/policy/${type}`]);
  }

  openContact(): void {
    console.log(`Opening contact page at ${new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' })}`);
    this.router.navigate(['/contact']);
  }
}