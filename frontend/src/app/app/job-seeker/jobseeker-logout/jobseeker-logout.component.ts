import { Component, OnInit, OnDestroy, TrackByFunction } from '@angular/core';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { interval, Subscription } from 'rxjs';

interface Activity {
  action: string;
  timestamp: Date;
}

@Component({
  selector: 'app-logout',
  templateUrl: './jobseeker-logout.component.html',
  styleUrls: ['./jobseeker-logout.component.css'],
  imports: [CommonModule, FormsModule]
})
export class JobseekerLogoutComponent implements OnInit, OnDestroy {
  isLoggingOut = false;
  logoutSuccess = false;
  logoutError = false;
  errorMessage = '';
  autoLogout = true; // Set to false for confirmation before logout
  logoutProgress = 0; // Progress bar percentage
  countdown = 5; // Countdown timer for redirect (seconds)
  sessionDuration = '1h 23m'; // Mock session duration
  lastActivity: Date = new Date(); // Mock last activity
  enable2FA = false; // Two-factor authentication toggle
  userFeedback = ''; // User feedback input
  recentActivities: Activity[] = []; // Recent activity log
  private countdownSubscription: Subscription | null = null;
  private progressSubscription: Subscription | null = null;
  private audio: HTMLAudioElement; // For sound effects
trackByTimestamp: TrackByFunction<Activity> | undefined;

  constructor(
    private router: Router,
    private location: Location
  ) {
    // Initialize audio for sound effects
    this.audio = new Audio();
    this.audio.src = '/assets/sounds/click.mp3'; // Ensure this path exists
    this.audio.load();
  }

  ngOnInit(): void {
    // Load mock session data and recent activities
    this.loadSessionData();
    this.loadRecentActivities();

    // Start auto logout if enabled
    if (this.autoLogout) {
      this.performLogout();
    }
  }

  ngOnDestroy(): void {
    // Clean up subscriptions
    this.stopCountdown();
    this.stopProgress();
  }

  loadSessionData(): void {
    // Mock session data
    this.sessionDuration = '1h 23m';
    this.lastActivity = new Date(Date.now() - 3600000);
  }

  loadRecentActivities(): void {
    // Mock recent activities
    this.recentActivities = [
      { action: 'Profile updated', timestamp: new Date(Date.now() - 3600000) },
      { action: 'Job application submitted', timestamp: new Date(Date.now() - 7200000) },
      { action: 'Password changed', timestamp: new Date(Date.now() - 86400000) }
    ];
  }

  performLogout(): void {
    this.isLoggingOut = true;
    this.logoutError = false;
    this.logoutProgress = 0;

    // Start progress bar animation
    this.progressSubscription = interval(50).subscribe(() => {
      this.logoutProgress = Math.min(this.logoutProgress + 2, 100);
      if (this.logoutProgress === 100) {
        this.stopProgress();
      }
    });

    // Start countdown timer
    this.startCountdown();

    // Simulate logout process
    setTimeout(() => {
      this.isLoggingOut = false;
      this.logoutSuccess = true;
      this.playSound();

      // Log 2FA preference (mock)
      if (this.enable2FA) {
        console.log('2FA preference saved: true');
      }

      // Log feedback if provided
      if (this.userFeedback) {
        this.submitFeedback();
      }
    }, 1000000); // Simulate 2-second logout process
  }

  confirmLogout(): void {
    this.playSound();
    this.performLogout();
  }

  cancelLogout(): void {
    this.playSound();
    this.location.back();
  }

  retryLogout(): void {
    this.playSound();
    this.logoutError = false;
    this.performLogout();
  }

  shareFeedback(): void {
    if (this.userFeedback) {
      this.submitFeedback();
      this.playSound();
    }
  }

  submitFeedback(): void {
    // Mock feedback submission
    console.log('Feedback submitted:', this.userFeedback);
  }

  startCountdown(): void {
    this.countdown = 5;
    this.countdownSubscription = interval(1000).subscribe(() => {
      this.countdown--;
      if (this.countdown <= 0) {
        this.stopCountdown();
        this.router.navigate(['/login']);
      }
    });
  }

  stopCountdown(): void {
    if (this.countdownSubscription) {
      this.countdownSubscription.unsubscribe();
      this.countdownSubscription = null;
    }
  }

  stopProgress(): void {
    if (this.progressSubscription) {
      this.progressSubscription.unsubscribe();
      this.progressSubscription = null;
    }
  }

  playSound(): void {
    this.audio.currentTime = 0;
    this.audio.play().catch(err => console.error('Sound playback failed:', err));
  }

  playErrorSound(): void {
    const errorAudio = new Audio('/assets/sounds/error.mp3'); // Ensure this path exists
    errorAudio.play().catch(err => console.error('Error sound playback failed:', err));
  }
}