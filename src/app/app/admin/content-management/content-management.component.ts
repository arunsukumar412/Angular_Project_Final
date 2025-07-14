import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormsModule } from '@angular/forms';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { AdminHeaderComponent } from '../admin-header/admin-header.component';
import { AdminFooterComponent } from '../admin-footer/admin-footer.component';
import { FooterComponent } from "../../../components/footer/footer.component";
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
  [key: string]: any; // Index signature to allow dynamic property access
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
  // State
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

  // Forms
  heroForm: FormGroup;
  logoForm: FormGroup;

  // Job Listings
  jobs: Job[] = [
    { id: 1, title: 'Software Engineer', description: 'Develop web applications.', status: 'open', postedBy: 'HR Team', postedDate: '2025-07-01' },
    { id: 2, title: 'Product Manager', description: 'Lead product strategy.', status: 'closed', postedBy: 'HR Team', postedDate: '2025-06-25' },
    { id: 3, title: 'UI/UX Designer', description: 'Design user interfaces.', status: 'draft', postedBy: 'HR Team', postedDate: '2025-06-20' }
  ];

  filteredJobs: Job[] = [];
  paginatedJobs: Job[] = [];
  currentPage: number = 1;
  itemsPerPage: number = 5;
  totalJobs: number = 0;
  startIndex: number = 0;
  endIndex: number = 0;
  sortKey: keyof Job = 'title'; // Use keyof for type safety
  sortDirection: number = 1;

  // Tabs
  tabs = [
    { label: 'Hero Section', value: 'hero' },
    { label: 'Logo & Branding', value: 'logo' },
    { label: 'Job Listings', value: 'jobs' }
  ];

  // Notifications
  notifications: Notification[] = [
    { id: 1, message: 'Hero section updated', time: '2 hours ago', icon: 'fas fa-image' },
    { id: 2, message: 'Logo settings updated', time: '1 day ago', icon: 'fas fa-file-image' }
  ];

  constructor(private fb: FormBuilder, private router: Router) {
    // Initialize Hero Form
    this.heroForm = this.fb.group({
      mainHeading: ['', [Validators.required, Validators.maxLength(100)]],
      subText: ['', [Validators.required, Validators.maxLength(500)]],
      buttonText: ['', [Validators.required, Validators.maxLength(50)]],
      buttonLink: ['', [Validators.required, Validators.pattern(/^(#|http[s]?:\/\/).*$/)]],
      animateButton: [true],
      fadeInText: [true],
      bgImage: ['https://media.istockphoto.com/id/182867373/photo/modern-business-board-room-empty-round-conference-table.jpg?s=612x612&w=0&k=20&c=fsyTC5hNXBdyAUSoT6AOHlhBKjZ2r3HK12RrjuQWwtQ='],
      overlayColor: ['dark', Validators.required]
    });

    // Initialize Logo Form
    this.logoForm = this.fb.group({
      currentLogo: ['assets/icons/logo.png'],
      size: ['medium', Validators.required],
      position: ['left', Validators.required],
      animation: ['none', Validators.required]
    });
  }

  ngOnInit(): void {
    // Load data from localStorage
    const storedHero = localStorage.getItem('heroData');
    if (storedHero) {
      this.heroForm.patchValue(JSON.parse(storedHero));
      console.log('Loaded hero from localStorage:', JSON.parse(storedHero));
    }

    const storedLogo = localStorage.getItem('logoData');
    if (storedLogo) {
      this.logoForm.patchValue(JSON.parse(storedLogo));
      console.log('Loaded logo from localStorage:', JSON.parse(storedLogo));
    }

    this.filterJobs();
    console.log('Initial hero.mainHeading:', this.heroForm.get('mainHeading')?.value);
  }

  // Sidebar and Dropdowns
  toggleSidebar(): void {
    const sidebar = document.getElementById('sidebar');
    if (sidebar) {
      sidebar.classList.toggle('-translate-x-full');
    } else {
      console.error('Sidebar element not found');
    }
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

  logout(): void {
    localStorage.removeItem('userData');
    this.router.navigate(['/login']);
  }

  // Search
  onSearch(): void {
    console.log('Search query:', this.searchQuery);
    this.filterJobs();
  }

  // Tabs
  setActiveTab(tab: string): void {
    this.activeTab = tab;
  }

  // Hero Section
  updateHeroSection(): void {
    console.log('Updating hero section, mainHeading:', this.heroForm.get('mainHeading')?.value);
    if (this.heroForm.valid) {
      const heroData = this.heroForm.value;
      localStorage.setItem('heroData', JSON.stringify(heroData));
      this.notifications.push({
        id: this.notifications.length + 1,
        message: `Hero section updated: ${heroData.mainHeading}`,
        time: 'Just now',
        icon: 'fas fa-image'
      });
      this.showHeroSuccess = true;
      setTimeout(() => {
        this.showHeroSuccess = false;
      }, 5000);
    } else {
      this.heroForm.markAllAsTouched();
      console.error('Hero form validation failed:', this.heroForm.errors);
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
      const reader = new FileReader();
      reader.onload = () => {
        this.heroForm.patchValue({ bgImage: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  }

  getOverlayClass(): string {
    const overlayColor = this.heroForm.get('overlayColor')?.value;
    switch (overlayColor) {
      case 'dark':
        return 'bg-black/50';
      case 'primary':
        return 'bg-primary/80';
      case 'custom':
        return 'bg-gradient-to-r from-primary/80 to-secondary/80';
      default:
        return 'bg-black/50';
    }
  }

  setPreviewSize(size: string): void {
    this.previewSize = size;
    const previewContainer = document.querySelector('.bg-hero-preview');
    if (previewContainer) {
      previewContainer.classList.remove('h-64', 'h-96', 'h-[500px]');
      if (size === 'mobile') {
        previewContainer.classList.add('h-64');
      } else if (size === 'tablet') {
        previewContainer.classList.add('h-[500px]');
      } else {
        previewContainer.classList.add('h-96');
      }
    }
  }

  // Logo Section
  updateLogoSettings(): void {
    if (this.logoForm.valid) {
      const logoData = this.logoForm.value;
      localStorage.setItem('logoData', JSON.stringify(logoData));
      this.notifications.push({
        id: this.notifications.length + 1,
        message: `Logo settings updated`,
        time: 'Just now',
        icon: 'fas fa-file-image'
      });
      this.showLogoSuccess = true;
      setTimeout(() => {
        this.showLogoSuccess = false;
      }, 5000);
    } else {
      this.logoForm.markAllAsTouched();
      console.error('Logo form validation failed:', this.logoForm.errors);
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
      const reader = new FileReader();
      reader.onload = () => {
        this.logoForm.patchValue({ currentLogo: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  }

  getLogoSizeClass(): string {
    const size = this.logoForm.get('size')?.value;
    switch (size) {
      case 'small':
        return 'h-16';
      case 'large':
        return 'h-32';
      default:
        return 'h-24';
    }
  }

  getHeaderLogoSizeClass(): string {
    const size = this.logoForm.get('size')?.value;
    switch (size) {
      case 'small':
        return 'h-8';
      case 'large':
        return 'h-12';
      default:
        return 'h-10';
    }
  }

  getAnimationClass(): string {
    const animation = this.logoForm.get('animation')?.value;
    switch (animation) {
      case 'fade':
        return 'animate-fade-in';
      case 'scale':
        return 'animate-scale-up';
      default:
        return '';
    }
  }

  // Job Listings
  filterJobs(): void {
    this.filteredJobs = this.jobs.filter(job =>
      job.title.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
      job.description.toLowerCase().includes(this.searchQuery.toLowerCase())
    );
    this.totalJobs = this.filteredJobs.length;
    this.updatePaginatedJobs();
  }

  sortJobs(key: keyof Job): void {
    if (this.sortKey === key) {
      this.sortDirection *= -1;
    } else {
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

  // Footer Actions
  openPolicy(type: string): void {
    console.log(`Opening ${type} policy`);
  }

  openContact(): void {
    console.log('Opening contact page');
  }
}