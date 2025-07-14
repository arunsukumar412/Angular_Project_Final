import { Component, OnInit, ElementRef, ViewChild, OnDestroy } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { JobseekerSidebarComponent } from '../jobseeker-sidebar/jobseeker-sidebar.component'; // Adjust path as needed

@Component({
  selector: 'app-interview-portal',
  templateUrl: './interview-portal.component.html',
  styleUrls: ['./interview-portal.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    JobseekerSidebarComponent
  ]
})
export class InterviewPortalComponent implements OnInit, OnDestroy {
  @ViewChild('fullscreenContent') fullscreenContent!: ElementRef;

  isLoading = false;
  isLoggedIn = false;
  isDarkMode = false;
  isTestStarted = false;
  name = '';
  email = ''; // Set by HR or initialization
  password = ''; // Set by HR or initialization
  loginError = '';
  timer: number = 30 * 60; // 30 minutes in seconds
  timerDisplay: string = '30:00';
  private timerInterval: any;

  constructor(private router: Router) {}

  ngOnInit(): void {
    // Initialize credentials (e.g., fetched from HR or a service)
    this.email = 'user@example.com'; // Replace with actual logic
    this.password = 'auto-generated-password'; // Replace with actual logic

    // Set up fullscreen event listeners
    document.onfullscreenchange = () => {
      console.log('Fullscreen change:', document.fullscreenElement ? 'Entered' : 'Exited');
      if (!document.fullscreenElement && this.isTestStarted) {
        this.endTest(); // End test if user exits full-screen
      }
    };
    document.onfullscreenerror = (event) => {
      console.error('Fullscreen error:', event);
      this.loginError = 'Failed to enter full-screen mode. Please try again.';
    };
  }

  ngOnDestroy(): void {
    // Clean up timer and event listeners
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
    document.onfullscreenchange = null;
    document.onfullscreenerror = null;
  }

  login(): void {
    this.isLoading = true;
    // Simulate login (replace with actual authentication)
    setTimeout(() => {
      if (this.email && this.password) {
        this.isLoggedIn = true;
        this.enterFullscreen();
      } else {
        this.loginError = 'Please provide valid credentials.';
      }
      this.isLoading = false;
    }, 1000);
  }

  enterFullscreen(): void {
    const elem = this.fullscreenContent?.nativeElement;
    if (elem && document.fullscreenEnabled) {
      elem.requestFullscreen({ navigationUI: 'hide' }).catch((err: any) => {
        console.error('Fullscreen error:', err);
        this.loginError = 'Failed to enter full-screen mode. Please try again.';
      });
    } else {
      console.warn('Fullscreen not supported or element not found');
      this.loginError = 'Full-screen mode is not supported in this browser.';
    }
  }

  exitFullscreen(): void {
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(err => {
        console.error('Exit fullscreen error:', err);
        this.loginError = 'Failed to exit full-screen mode. Please try again.';
      });
    }
  }

  toggleDarkMode(): void {
    this.isDarkMode = !this.isDarkMode;
    document.documentElement.classList.toggle('dark', this.isDarkMode);
  }

  startTest(): void {
    this.isTestStarted = true;
    this.timer = 30 * 60; // Reset to 30 minutes
    this.updateTimerDisplay();
    this.timerInterval = setInterval(() => {
      this.timer--;
      this.updateTimerDisplay();
      if (this.timer <= 0) {
        this.endTest();
      }
    }, 1000);
  }

  updateTimerDisplay(): void {
    const minutes = Math.floor(this.timer / 60);
    const seconds = this.timer % 60;
    this.timerDisplay = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  }

  endTest(): void {
    this.isTestStarted = false;
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
    this.timer = 30 * 60;
    this.timerDisplay = '30:00';
    this.exitFullscreen();
    alert('Test ended. Your responses have been submitted.'); // Replace with actual submission logic
  }
}