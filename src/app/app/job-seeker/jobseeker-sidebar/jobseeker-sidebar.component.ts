import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-jobseeker-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './jobseeker-sidebar.component.html',
  styleUrls: ['./jobseeker-sidebar.component.css']
})
export class JobseekerSidebarComponent {
  mobileMenuOpen = false;
  dropdownOpen = false;

  constructor(private router: Router) {}

  toggleMobileMenu(): void {
    this.mobileMenuOpen = !this.mobileMenuOpen;
    if (this.mobileMenuOpen) {
      this.dropdownOpen = false; // Close dropdown when mobile menu opens
    }
  }

  toggleDropdown(): void {
    this.dropdownOpen = !this.dropdownOpen;
    if (this.dropdownOpen) {
      this.mobileMenuOpen = false; // Close mobile menu when dropdown opens
    }
  }

  navigateTo(route: string): void {
    this.router.navigate([route]);
    this.mobileMenuOpen = false;
    this.dropdownOpen = false;
  }

  logout(): void {
    // Implement logout logic, e.g., clear auth tokens, redirect to login
    console.log('Logging out');
    this.router.navigate(['/login']);
    this.mobileMenuOpen = false;
    this.dropdownOpen = false;
  }
}