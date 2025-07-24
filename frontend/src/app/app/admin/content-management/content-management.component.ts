import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { AdminHeaderComponent } from '../admin-header/admin-header.component';
import { AdminFooterComponent } from '../admin-footer/admin-footer.component';
import { FooterComponent } from "../../../components/footer/footer.component";
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

interface Hero {
  mainHeading: string;
  subText: string;
  buttonText: string;
  buttonLink: string;
  animateButton: boolean;
  fadeInText: boolean;
  bgImage: string;
  overlayColor: string;
}

interface Logo {
  currentLogo: string;
  size: string;
  position: string;
  animation: string;
}

interface Job {
  id: number;
  title: string;
  description: string;
  status: string;
  postedBy: string;
  postedDate: string;
  [key: string]: any;
}

interface Notification {
  id: number;
  message: string;
  time: string;
  icon: string;
}

@Component({
  selector: 'app-content-management',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, SidebarComponent, AdminHeaderComponent, AdminFooterComponent],
  templateUrl: './content-management.component.html',
  styleUrls: ['./content-management.component.css']
})
export class ContentManagementComponent implements OnInit {
  currentUser: string = 'Super Admin';
  currentYear: number = new Date().getFullYear();
  version: string = '2.5.0';
  searchQuery: string = '';
  showNotificationDropdown: boolean = false;
  showUserDropdown: boolean = false;
  activeTab: string = 'hero';
  previewSize: string = 'desktop';
  showHeroSuccess: boolean = false;
  showLogoSuccess: boolean = false;

  heroForm: FormGroup;
  logoForm: FormGroup;

  jobs: Job[] = [];
  filteredJobs: Job[] = [];
  paginatedJobs: Job[] = [];
  currentPage: number = 1;
  itemsPerPage: number = 5;
  totalJobs: number = 0;
  startIndex: number = 0;
  endIndex: number = 0;
  sortKey: keyof Job = 'title';
  sortDirection: number = 1;

  tabs = [
    { label: 'Hero Section', value: 'hero' },
    { label: 'Logo & Branding', value: 'logo' },
    { label: 'Job Listings', value: 'jobs' }
  ];

  notifications: Notification[] = [];
  bgImageUrl: string = '';
  logoImageUrl: string = '';

  private apiUrl = 'http://localhost:5000/api'; // Use backend port 5000

  constructor(private fb: FormBuilder, private router: Router, private http: HttpClient) {
    this.heroForm = this.fb.group({
      mainHeading: ['', [Validators.required, Validators.maxLength(100)]],
      subText: ['', [Validators.required, Validators.maxLength(500)]],
      buttonText: ['', [Validators.required, Validators.maxLength(50)]],
      buttonLink: ['', [Validators.required, Validators.pattern(/^(#|http[s]?:\/\/).*$/)]],
      animateButton: [true],
      fadeInText: [true],
      bgImage: [''],
      overlayColor: ['dark', Validators.required]
    });

    this.logoForm = this.fb.group({
      currentLogo: [''],
      size: ['medium', Validators.required],
      position: ['left', Validators.required],
      animation: ['none', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadContent();
    this.loadJobs();
    this.loadNotifications();
  }

  loadContent(): void {
    this.http.get<any>(`${this.apiUrl}/content/1`).pipe(
      catchError(error => {
        console.error('Error loading content:', error);
        return throwError(() => new Error('Failed to load content'));
      })
    ).subscribe(data => {
      this.heroForm.patchValue({
        mainHeading: data.hero_main_heading,
        subText: data.hero_sub_text,
        buttonText: data.hero_button_text,
        buttonLink: data.hero_button_link,
        animateButton: data.hero_animate_button,
        fadeInText: data.hero_fade_in_text,
        bgImage: data.hero_bg_image,
        overlayColor: data.hero_overlay_color
      });
      this.logoForm.patchValue({
        currentLogo: data.logo_current_logo,
        size: data.logo_size,
        position: data.logo_position,
        animation: data.logo_animation
      });
    });
  }


  loadJobs(): void {
    this.http.get<Job[]>(`${this.apiUrl}/content-jobs`).pipe(
      catchError(error => {
        console.error('Error loading jobs:', error);
        return throwError(() => new Error('Failed to load jobs'));
      })
    ).subscribe(data => {
      this.jobs = data;
      this.filterJobs();
    });
  }


  loadNotifications(): void {
    this.http.get<Notification[]>(`${this.apiUrl}/content-notifications`).pipe(
      catchError(error => {
        console.error('Error loading notifications:', error);
        return throwError(() => new Error('Failed to load notifications'));
      })
    ).subscribe(data => {
      this.notifications = data;
    });
  }

  updateHeroSection(): void {
    if (this.heroForm.valid) {
      const heroData = this.heroForm.value;
      this.http.put(`${this.apiUrl}/content/1`, heroData, {
        headers: new HttpHeaders({ 'Content-Type': 'application/json' })
      }).pipe(
        catchError(error => {
          console.error('Error updating hero section:', error);
          return throwError(() => new Error('Failed to update hero section'));
        })
      ).subscribe(() => {
        this.notifications.push({
          id: this.notifications.length + 1,
          message: `Hero section updated: ${heroData.mainHeading}`,
          time: 'Just now',
          icon: 'fas fa-image'
        });
        this.showHeroSuccess = true;
        setTimeout(() => this.showHeroSuccess = false, 5000);
      });
    } else {
      this.heroForm.markAllAsTouched();
    }
  }

  updateLogoSettings(): void {
    if (this.logoForm.valid) {
      const logoData = this.logoForm.value;
      this.http.put(`${this.apiUrl}/content/1`, { logo: logoData }, {
        headers: new HttpHeaders({ 'Content-Type': 'application/json' })
      }).pipe(
        catchError(error => {
          console.error('Error updating logo settings:', error);
          return throwError(() => new Error('Failed to update logo settings'));
        })
      ).subscribe(() => {
        this.notifications.push({
          id: this.notifications.length + 1,
          message: `Logo settings updated`,
          time: 'Just now',
          icon: 'fas fa-file-image'
        });
        this.showLogoSuccess = true;
        setTimeout(() => this.showLogoSuccess = false, 5000);
      });
    } else {
      this.logoForm.markAllAsTouched();
    }
  }

  onBgImageUpload(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      if (file.size > 2 * 1024 * 1024) {
        alert('Image file size exceeds 2MB');
        return;
      }
      const formData = new FormData();
      formData.append('image', file);
      this.http.post(`${this.apiUrl}/upload`, formData).pipe(
        catchError(error => {
          console.error('Error uploading image:', error);
          return throwError(() => new Error('Failed to upload image'));
        })
      ).subscribe((response: any) => {
        this.heroForm.patchValue({ bgImage: response.url });
      });
    }
  }

  updateBgImageFromUrl(): void {
    if (this.bgImageUrl && this.bgImageUrl.match(/^(http[s]?:\/\/).*$/)) {
      this.heroForm.patchValue({ bgImage: this.bgImageUrl });
    }
  }

  onLogoUpload(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      if (file.size > 2 * 1024 * 1024) {
        alert('Logo file size exceeds 2MB');
        return;
      }
      const formData = new FormData();
      formData.append('image', file);
      this.http.post(`${this.apiUrl}/upload`, formData).pipe(
        catchError(error => {
          console.error('Error uploading logo:', error);
          return throwError(() => new Error('Failed to upload logo'));
        })
      ).subscribe((response: any) => {
        this.logoForm.patchValue({ currentLogo: response.url });
      });
    }
  }

  updateLogoFromUrl(): void {
    if (this.logoImageUrl && this.logoImageUrl.match(/^(http[s]?:\/\/).*$/)) {
      this.logoForm.patchValue({ currentLogo: this.logoImageUrl });
    }
  }

  onImageError(): void {
    console.warn('Image failed to load, using placeholder');
    // Optionally set a default image
  }

  getOverlayClass(): string {
    const overlayColor = this.heroForm.get('overlayColor')?.value;
    switch (overlayColor) {
      case 'dark': return 'bg-black/50';
      case 'primary': return 'bg-primary/80';
      case 'custom': return 'bg-gradient-to-r from-primary/80 to-secondary/80';
      default: return 'bg-black/50';
    }
  }

  setPreviewSize(size: string): void {
    this.previewSize = size;
    const previewContainer = document.querySelector('.bg-hero-preview');
    if (previewContainer) {
      previewContainer.classList.remove('h-64', 'h-96', 'h-[500px]');
      if (size === 'mobile') previewContainer.classList.add('h-64');
      else if (size === 'tablet') previewContainer.classList.add('h-[500px]');
      else previewContainer.classList.add('h-96');
    }
  }

  getLogoSizeClass(): string {
    const size = this.logoForm.get('size')?.value;
    switch (size) {
      case 'small': return 'h-16';
      case 'large': return 'h-32';
      default: return 'h-24';
    }
  }

  getHeaderLogoSizeClass(): string {
    const size = this.logoForm.get('size')?.value;
    switch (size) {
      case 'small': return 'h-8';
      case 'large': return 'h-12';
      default: return 'h-10';
    }
  }

  getAnimationClass(): string {
    const animation = this.logoForm.get('animation')?.value;
    switch (animation) {
      case 'fade': return 'animate-fade-in';
      case 'scale': return 'animate-scale-up';
      default: return '';
    }
  }

  filterJobs(): void {
    this.filteredJobs = this.jobs.filter(job =>
      job.title.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
      job.description.toLowerCase().includes(this.searchQuery.toLowerCase())
    );
    this.totalJobs = this.filteredJobs.length;
    this.updatePaginatedJobs();
  }

  sortJobs(key: keyof Job): void {
    if (this.sortKey === key) this.sortDirection *= -1;
    else {
      this.sortKey = key;
      this.sortDirection = 1;
    }
    this.filteredJobs.sort((a, b) => {
      const valueA = typeof a[key] === 'string' ? (a[key] as string).toLowerCase() : a[key];
      const valueB = typeof b[key] === 'string' ? (b[key] as string).toLowerCase() : b[key];
      return (valueA < valueB ? -1 : 1) * this.sortDirection;
    });
    this.updatePaginatedJobs();
  }

  updatePaginatedJobs(): void {
    this.startIndex = (this.currentPage - 1) * this.itemsPerPage;
    this.endIndex = Math.min(this.startIndex + this.itemsPerPage, this.totalJobs);
    this.paginatedJobs = this.filteredJobs.slice(this.startIndex, this.endIndex);
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePaginatedJobs();
    }
  }

  nextPage(): void {
    if (this.endIndex < this.totalJobs) {
      this.currentPage++;
      this.updatePaginatedJobs();
    }
  }

  toggleSidebar(): void {
    const sidebar = document.getElementById('sidebar');
    if (sidebar) sidebar.classList.toggle('-translate-x-full');
    else console.error('Sidebar element not found');
  }

  toggleNotificationDropdown(): void {
    this.showNotificationDropdown = !this.showNotificationDropdown;
    if (this.showNotificationDropdown) this.showUserDropdown = false;
  }

  toggleUserDropdown(): void {
    this.showUserDropdown = !this.showUserDropdown;
    if (this.showUserDropdown) this.showNotificationDropdown = false;
  }

  logout(): void {
    localStorage.removeItem('userData');
    this.router.navigate(['/login']);
  }

  openPolicy(type: string): void {
    console.log(`Opening ${type} policy`);
  }

  openContact(): void {
    console.log('Opening contact page');
  }
}