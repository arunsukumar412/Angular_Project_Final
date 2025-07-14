import { Component, EventEmitter, Output } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-recruiter-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './recruiter-sidebar.component.html',
  styleUrls: ['./recruiter-sidebar.component.css']
})
export class RecruiterSidebarComponent {
  @Output() sidebarToggled = new EventEmitter<boolean>();
  isSidebarOpen = false; // Changed from isCollapsed to isSidebarOpen for consistency

  constructor(private router: Router) {}

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
    this.sidebarToggled.emit(this.isSidebarOpen);
  }

  navigateTo(route: string) {
    this.router.navigate([`/hr/${route}`]); // Adjusted for HR dashboard context
  }

  logout() {
    // Implement logout logic (e.g., using AuthService if available)
    sessionStorage.removeItem('email'); // Clear stored credentials
    sessionStorage.removeItem('password');
    console.log('Logging out...');
    this.router.navigate(['/login']);
  }
}