import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { interval, Subscription } from 'rxjs';

@Component({
  selector: 'app-login',
  templateUrl: './login-animation.component.html',
  styleUrls: ['./login-animation.component.css'],
  imports: [CommonModule, FormsModule]
})
export class LoginAnimationComponent implements OnInit, OnDestroy {
  isLoggingIn = false;
  loginSuccess = false;
  loginError = false;
  errorMessage = '';
  email = '';
  password = '';
  rememberMe = false;
  userFeedback = '';
  loginProgress = 0;
  countdown = 5;
  private countdownSubscription: Subscription | null = null;
  private progressSubscription: Subscription | null = null;
  private audio: HTMLAudioElement;

  constructor(
    private router: Router,
    private location: Location
  ) {
    this.audio = new Audio();
    this.audio.src = '/assets/sounds/click.mp3'; // Ensure this path exists
    this.audio.load();
  }

  ngOnInit(): void {
    // Simulate session timeout warning
    setTimeout(() => {
      if (!this.loginSuccess && !this.isLoggingIn) {
        this.errorMessage = 'Session timeout. Please log in within 30 seconds.';
        this.loginError = true;
      }
    }, 30000);
  }

  ngOnDestroy(): void {
    this.stopCountdown();
    this.stopProgress();
  }

  onSubmit(): void {
    this.playSound();
    // Basic validation
    if (!this.email) {
      this.emailError = 'Email is required';
      this.loginError = true;
      this.playErrorSound();
      return;
    }
    if (!this.password || this.password.length < 6) {
      this.passwordError = 'Password must be at least 6 characters';
      this.loginError = true;
      this.playErrorSound();
      return;
    }

    this.emailError = '';
    this.passwordError = '';
    this.performLogin();
  }

  performLogin(): void {
    this.isLoggingIn = true;
    this.loginError = false;
    this.loginProgress = 0;

    // Start progress bar animation
    this.progressSubscription = interval(50).subscribe(() => {
      this.loginProgress = Math.min(this.loginProgress + 2, 100);
      if (this.loginProgress === 100) {
        this.stopProgress();
      }
    });

    // Start countdown timer
    this.startCountdown();

    // Simulate login process
    setTimeout(() => {
      // Mock authentication (replace with actual service call)
      if (this.email === 'test@genworx.com' && this.password === 'password123') {
        this.isLoggingIn = false;
        this.loginSuccess = true;
        this.playSound();
        if (this.rememberMe) {
          console.log('Remember me enabled');
        }
        if (this.userFeedback) {
          this.submitFeedback();
        }
      } else {
        this.isLoggingIn = false;
        this.loginError = true;
        this.errorMessage = 'Invalid email or password';
        this.stopCountdown();
        this.stopProgress();
        this.playErrorSound();
      }
    }, 2000);
  }

  googleLogin(): void {
    this.playSound();
    console.log('Initiating Google login');
    // Implement actual Google login logic here
  }

  githubLogin(): void {
    this.playSound();
    console.log('Initiating GitHub login');
    // Implement actual GitHub login logic here
  }

  retryLogin(): void {
    this.playSound();
    this.loginError = false;
    this.performLogin();
  }

  cancelLogin(): void {
    this.playSound();
    this.location.back();
  }

  shareFeedback(): void {
    if (this.userFeedback) {
      this.submitFeedback();
      this.playSound();
    }
  }

  submitFeedback(): void {
    console.log('Feedback submitted:', this.userFeedback);
  }

  startCountdown(): void {
    this.countdown = 5;
    this.countdownSubscription = interval(1000).subscribe(() => {
      this.countdown--;
      if (this.countdown <= 0) {
        this.stopCountdown();
        if (this.loginSuccess) {
          this.router.navigate(['/dashboard']);
        }
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

  // Validation error properties
  emailError: string = '';
  passwordError: string = '';
}