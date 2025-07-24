import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { SessionService } from '../../../services/session.service';
import { LoginAnimationComponent } from '../../../login-animation/login-animation.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  loginForm: FormGroup;
  errorMessage = '';
  showPassword = false;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService,
    private sessionService: SessionService
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.errorMessage = 'Please fill in all required fields correctly.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    const { email, password } = this.loginForm.value;

    this.authService.login({ email, password }).subscribe({
      next: (response) => {
        this.isLoading = false;
        const user = this.authService.getCurrentUser();
        if (user && user.id) {
          // Try to get user_role from user object, fallback to email logic
          let user_role = user.role || '';
          if (!user_role) {
            if (email === 'arunsukumar03@gmail.com') user_role = 'admin';
            else if (email === 'arunhr@gmail.com') user_role = 'hr';
            else user_role = 'jobseeker';
          }
          // Create session in backend with user_role
          this.sessionService.createSession(user.id, user_role).subscribe({
            next: (sessionRes) => {
              localStorage.setItem('session_id', sessionRes.session_id);
              // Redirect based on user role
              if (user_role === 'admin') {
                this.router.navigate(['/dashboard']);
              } else if (user_role === 'hr') {
                this.router.navigate(['/hr-dashboard']);
              } else {
                this.router.navigate(['/jobseeker-dashboard']);
              }
            },
            error: () => {
              this.errorMessage = 'Session creation failed.';
            }
          });
        } else {
          this.errorMessage = 'User not found.';
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error.message || 'Invalid email or password.';
        // Fallback to hardcoded credentials if backend is down (for development only)
        if (email === 'arunsukumar03@gmail.com' && password === 'admin') {
          sessionStorage.setItem('email', email);
          sessionStorage.setItem('password', password);
          this.router.navigate(['/dashboard']);
        } else if (email === 'arunhr@gmail.com' && password === 'hr1234') {
          sessionStorage.setItem('email', email);
          sessionStorage.setItem('password', password);
          this.router.navigate(['/hr-dashboard']);
        } else if (email === 'arun@gmail.com' && password === 'arun1234') {
          sessionStorage.setItem('email', email);
          sessionStorage.setItem('password', password);
          this.router.navigate(['/jobseeker-dashboard']);
        } else {
          this.errorMessage = 'Invalid email or password.';
        }
      }
    });
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }
}