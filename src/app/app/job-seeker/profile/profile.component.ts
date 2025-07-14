import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { JobseekerSidebarComponent } from '../jobseeker-sidebar/jobseeker-sidebar.component';

interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string | null;
  address: string;
  occupation: string;
  company: string;
  website: string;
  bio: string;
  country: string;
  language: string;
  timezone: string;
  github: string;
  linkedin: string;
  twitter: string;
  skills: string;
  education: string;
  experience: string;
  interests: string;
  profileVisible: boolean;
  jobAlerts: boolean;
  newsletter: boolean;
}

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
  standalone: true,
  imports: [CommonModule, JobseekerSidebarComponent, ReactiveFormsModule, RouterModule],
})
export class ProfileComponent implements OnInit {
  profileForm: FormGroup;
  isLoading: boolean = true;
  isEditing: boolean = false;
  profilePicture: string | null = null;
  isDarkMode: boolean = false;
  showSuccessMessage: boolean = false;
  successMessage: string = '';
  activeTab: string = 'personal';
  skillsList: string[] = [];
  
  // Sample data for dropdowns
  countries: string[] = ['USA', 'Canada', 'UK', 'Australia', 'Germany', 'France'];
  languages: string[] = ['English', 'Spanish', 'French', 'German', 'Chinese'];
  timezones: string[] = ['GMT', 'EST', 'PST', 'CST', 'IST', 'CET'];

  constructor(private fb: FormBuilder, private router: Router) {
    this.profileForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.pattern(/^\+?[\d\s-]{10,}$/)]],
      dateOfBirth: [null],
      address: [''],
      occupation: [''],
      company: [''],
      website: ['', [Validators.pattern(/^(https?:\/\/)?([\w-]+\.)+[\w-]{2,4}(\/.*)?$/i)]],
      bio: ['', [Validators.maxLength(500)]],
      country: [''],
      language: [''],
      timezone: [''],
      github: ['', [Validators.pattern(/^(https?:\/\/)?github\.com\/[\w-]+$/i)]],
      linkedin: ['', [Validators.pattern(/^(https?:\/\/)?linkedin\.com\/in\/[\w-]+$/i)]],
      twitter: ['', [Validators.pattern(/^(https?:\/\/)?x\.com\/[\w-]+$/i)]],
      skills: ['', [Validators.maxLength(500)]],
      education: ['', [Validators.maxLength(1000)]],
      experience: ['', [Validators.maxLength(1000)]],
      interests: ['', [Validators.maxLength(500)]],
      profileVisible: [true],
      jobAlerts: [true],
      newsletter: [false]
    });
  }

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {
    this.isLoading = true;
    // Mock data (replace with actual API call)
    const mockProfile: UserProfile = {
      firstName: 'Arunsukumar',
      lastName: 'A',
      email: 'jarunsukumar03@gmail.com',
      phone: '+1-555-123-4567',
      dateOfBirth: '1990-01-01',
      address: '123 Main St, Springfield',
      occupation: 'Software Engineer',
      company: 'Tech Corp',
      website: 'https://johndoe.com',
      bio: 'Passionate developer with a love for open-source projects.',
      country: 'USA',
      language: 'English',
      timezone: 'America/New_York',
      github: 'https://github.com/johndoe',
      linkedin: 'https://linkedin.com/in/johndoe',
      twitter: 'https://x.com/johndoe',
      skills: 'JavaScript, Angular, Python',
      education: 'B.S. Computer Science, University of Example, 2012',
      experience: 'Software Engineer at Tech Corp, 2015-Present',
      interests: 'Hiking, Reading, Open Source',
      profileVisible: true,
      jobAlerts: true,
      newsletter: false
    };
    
    this.profileForm.patchValue(mockProfile);
    this.skillsList = mockProfile.skills.split(',').map(skill => skill.trim());
    this.profilePicture = 'https://via.placeholder.com/150';
    
    setTimeout(() => {
      this.isLoading = false;
    }, 500); // Simulate API delay
  }

  toggleEdit(): void {
    this.isEditing = !this.isEditing;
    if (!this.isEditing) {
      this.loadProfile(); // Reset to original values
    }
  }

  toggleDarkMode(): void {
    this.isDarkMode = !this.isDarkMode;
    document.documentElement.classList.toggle('dark', this.isDarkMode);
  }

  saveProfile(): void {
    if (this.profileForm.valid) {
      this.isLoading = true;
      // Simulate saving profile (replace with API call)
      setTimeout(() => {
        console.log('Saved profile:', this.profileForm.value);
        this.isEditing = false;
        this.isLoading = false;
        this.showSuccess('Profile saved successfully!');
      }, 500); // Simulate API delay
    } else {
      this.profileForm.markAllAsTouched();
      this.showSuccess('Please fix the errors in the form.', false);
    }
  }

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      if (file.type.startsWith('image/') && file.size <= 2 * 1024 * 1024) { // Limit to 2MB
        const reader = new FileReader();
        reader.onload = () => {
          this.profilePicture = reader.result as string;
          this.showSuccess('Profile picture updated successfully!');
        };
        reader.onerror = () => {
          this.showSuccess('Error reading image file.', false);
        };
        reader.readAsDataURL(file);
      } else {
        this.showSuccess('Please upload a valid image file (max 2MB).', false);
      }
    }
  }

  exportProfile(): void {
    const profileData = JSON.stringify(this.profileForm.value, null, 2);
    const blob = new Blob([profileData], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'user-profile.json';
    link.click();
    window.URL.revokeObjectURL(url);
    this.showSuccess('Profile exported successfully!');
  }

  copyProfileLink(): void {
    const username = this.profileForm.get('email')?.value.split('@')[0];
    const profileLink = `${window.location.origin}/profile/${username}`;
    navigator.clipboard.writeText(profileLink).then(() => {
      this.showSuccess('Profile link copied to clipboard!');
    }).catch(() => {
      this.showSuccess('Failed to copy link. Please try again.', false);
    });
  }

  removeSkill(skill: string): void {
    this.skillsList = this.skillsList.filter(s => s !== skill);
    this.profileForm.get('skills')?.setValue(this.skillsList.join(', '));
  }

  addSkill(): void {
    const skillControl = this.profileForm.get('skills');
    const newSkill = skillControl?.value.trim();
    if (newSkill && !this.skillsList.includes(newSkill)) {
      this.skillsList.push(newSkill);
      skillControl?.setValue('');
      this.profileForm.get('skills')?.setValue(this.skillsList.join(', '));
    }
  }

  private showSuccess(message: string, isSuccess: boolean = true): void {
    this.showSuccessMessage = true;
    this.successMessage = message;
    setTimeout(() => {
      this.showSuccessMessage = false;
      this.successMessage = '';
    }, 3000);
  }

  backToPortal(): void {
    this.router.navigate(['/jobseeker-dashboard']);
  }
}