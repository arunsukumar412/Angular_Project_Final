import { Component } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css'],
  standalone: true,
  imports: [RouterModule,CommonModule,FormsModule,ReactiveFormsModule]
})
export class ForgotPasswordComponent {
  forgotPasswordForm: FormGroup;
  showSuccess: boolean = false;
  errorMessage: string = '';
  currentDate: Date = new Date(); // 02:12 PM IST, July 05, 2025

  constructor(private fb: FormBuilder, private router: Router) {
    this.forgotPasswordForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  onSubmit(): void {
    if (this.forgotPasswordForm.valid) {
      // Simulate sending reset link to server
      console.log('Sending reset link to:', this.forgotPasswordForm.value.email);
      this.showSuccess = true;
      this.errorMessage = '';

      // Hide success message after 5 seconds
      setTimeout(() => {
        this.showSuccess = false;
      }, 5000);

      // Reset form after success
      this.forgotPasswordForm.reset();
    } else {
      this.errorMessage = 'Please enter a valid email address.';
      this.showSuccess = false;
    }
  }

  goBack(): void {
    window.history.back();
  }
}