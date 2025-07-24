import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, CommonModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  registerForm: FormGroup;
  errorMessage: string = '';
  showPassword: boolean = false;
  passwordStrengthScore: number = 0;
  passwordSuggestions: string[] = [];
  isLoading: boolean = false;

  private commonWeakPasswords = [
    'password', '123456', '12345678', '123456789', '12345',
    'qwerty', 'abc123', 'password1', 'admin', 'welcome'
  ];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService
  ) {
    this.registerForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(2), Validators.pattern(/^[a-zA-Z\s]*$/)]],
      email: ['', [Validators.required, Validators.email, Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)]],
      password: ['', [
        Validators.required,
        Validators.minLength(8),
        this.passwordStrengthValidator()
      ]],
      confirmPassword: ['', [Validators.required]]
    }, {
      validators: [this.mustMatch('password', 'confirmPassword'), this.passwordComplexityValidator()]
    });

    this.registerForm.get('password')?.valueChanges.subscribe(value => {
      if (value) {
        this.passwordStrengthScore = this.calculatePasswordStrength(value);
        this.passwordSuggestions = this.generatePasswordSuggestions(value);
      } else {
        this.passwordStrengthScore = 0;
        this.passwordSuggestions = [];
      }
    });
  }

  mustMatch(controlName: string, matchingControlName: string) {
    return (formGroup: FormGroup) => {
      const control = formGroup.controls[controlName];
      const matchingControl = formGroup.controls[matchingControlName];

      if (matchingControl.errors && !matchingControl.errors['mustMatch']) {
        return;
      }

      if (control.value !== matchingControl.value) {
        matchingControl.setErrors({ mustMatch: true });
      } else {
        matchingControl.setErrors(null);
      }
    };
  }

  passwordComplexityValidator() {
    return (formGroup: FormGroup) => {
      const password = formGroup.get('password')?.value;
      if (!password) return null;

      const hasUpperCase = /[A-Z]/.test(password);
      const hasLowerCase = /[a-z]/.test(password);
      const hasNumbers = /\d/.test(password);
      const hasSpecialChars = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);

      if (!hasUpperCase || !hasLowerCase || !hasNumbers || !hasSpecialChars) {
        formGroup.get('password')?.setErrors({ complexity: true });
        return { complexity: true };
      }
      return null;
    };
  }

  passwordStrengthValidator() {
    return (control: any) => {
      const value = control.value;
      if (!value) return null;

      if (this.commonWeakPasswords.includes(value.toLowerCase())) {
        return { commonPassword: true };
      }

      const username = this.registerForm?.get('username')?.value;
      const email = this.registerForm?.get('email')?.value;
      
      if (username && value.toLowerCase().includes(username.toLowerCase())) {
        return { containsPersonalInfo: true };
      }
      
      if (email) {
        const emailPrefix = email.split('@')[0];
        if (emailPrefix && value.toLowerCase().includes(emailPrefix.toLowerCase())) {
          return { containsPersonalInfo: true };
        }
      }

      return null;
    };
  }

  calculatePasswordStrength(password: string): number {
    if (!password) return 0;

    // Penalties
    let penalty = 0;
    const length = password.length;

    // 1. Length score (max 40 points)
    let score = Math.min(length * 4, 40);

    // 2. Character variety (max 30 points)
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChars = /[^A-Za-z0-9]/.test(password);

    const charTypes = [hasUpperCase, hasLowerCase, hasNumbers, hasSpecialChars].filter(Boolean).length;
    score += charTypes * 7.5; // 7.5 points per type (max 30)

    // 3. Entropy calculation (max 20 points)
    const uniqueChars = new Set(password).size;
    const entropyScore = (uniqueChars / length) * 20;
    score += Math.min(entropyScore, 20);

    // 4. Pattern penalties
    // Repeated characters
    if (/(.)\1{2,}/.test(password)) penalty += 15;
    // Sequential characters (abc, 123, etc.)
    if (/(abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz|012|123|234|345|456|567|678|789)+/i.test(password)) {
      penalty += 20;
    }
    // Keyboard patterns (qwerty, asdf, etc.)
    const keyboardPatterns = ['qwerty', 'asdfgh', 'zxcvbn', '1qaz', '2wsx', '3edc', '4rfv', '5tgb', '6yhn', '7ujm', '8ik,', '9ol.', '0p;/'];
    if (keyboardPatterns.some(pattern => password.toLowerCase().includes(pattern))) {
      penalty += 25;
    }

    // Apply penalties
    score = Math.max(0, score - penalty);

    // Ensure score is between 0-100
    return Math.min(100, score);
  }

  generatePasswordSuggestions(password: string): string[] {
    const suggestions: string[] = [];
    const length = password.length;
    
    if (length < 12) {
      suggestions.push('Use at least 12 characters');
    }
    
    if (!/[A-Z]/.test(password)) {
      suggestions.push('Add an uppercase letter');
    }
    
    if (!/[^A-Za-z0-9]/.test(password)) {
      suggestions.push('Add a special character');
    }
    
    if (!/\d/.test(password)) {
      suggestions.push('Add a number');
    }
    
    if (/(.)\1{2,}/.test(password)) {
      suggestions.push('Avoid repeated characters');
    }
    
    if (password.toLowerCase() === password) {
      suggestions.push('Mix uppercase and lowercase letters');
    }

    return suggestions.length > 0 ? suggestions : ['Strong password!'];
  }

  onPasswordInput() {
    const password = this.registerForm.get('password')?.value;
    if (password) {
      this.passwordStrengthScore = this.calculatePasswordStrength(password);
      this.passwordSuggestions = this.generatePasswordSuggestions(password);
    } else {
      this.passwordStrengthScore = 0;
      this.passwordSuggestions = [];
    }
  }

  onSubmit() {
    if (this.registerForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';

      const { username, email, password } = this.registerForm.value;

      this.authService.register({ username, email, password }).subscribe({
        next: () => {
          this.isLoading = false;
          this.registerForm.reset();
          this.router.navigate(['/jobseeker-dashboard']);
        },
        error: (err: HttpErrorResponse) => {
          this.isLoading = false;
          
          if (err.status === 400 && err.error?.message?.includes('already exists')) {
            this.errorMessage = 'This email is already registered.';
          } else if (err.status === 0) {
            this.errorMessage = 'Cannot connect to server. Please check your internet connection.';
          } else {
            this.errorMessage = err.error?.message || 'Registration failed. Please try again.';
          }
        }
      });
    } else {
      this.errorMessage = 'Please fix the errors in the form.';
      this.registerForm.markAllAsTouched();
    }
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  getPasswordStrengthFeedback(): string {
    const score = this.passwordStrengthScore;
    if (score >= 80) return 'Very Strong';
    if (score >= 60) return 'Strong';
    if (score >= 40) return 'Moderate';
    if (score >= 20) return 'Weak';
    return 'Very Weak';
  }
}