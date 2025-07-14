import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  errorMessage = '';
  showPassword = false;

  constructor(private fb: FormBuilder, private router: Router) {}

  ngOnInit(): void {
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

    const { email, password } = this.loginForm.value;

    if (email === 'arunsukumar03@gmail.com' && password === 'admin') {
      // Admin credentials
      sessionStorage.setItem('email', email);
      sessionStorage.setItem('password', password);
      this.router.navigate(['/dashboard']);
    } else if (email === 'arunhr@gmail.com' && password === 'hr1234') {
      // HR credentials
      sessionStorage.setItem('email', email);
      sessionStorage.setItem('password', password);
      this.router.navigate(['/hr-dashboard']);
    } else {
      this.errorMessage = 'Invalid email or password.';
    }
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }
}