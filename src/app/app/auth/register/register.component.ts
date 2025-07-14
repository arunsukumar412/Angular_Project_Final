import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule,FormsModule,CommonModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  registerForm!: FormGroup;
  errorMessage: string = '';
  showPassword: boolean = false;
  passwordStrengthScore: number = 0;
  passwordSuggestions: string[] = [];

  // Common weak passwords to check against
  private commonWeakPasswords = [
    'password', '123456', '12345678', '123456789', '12345',
    'qwerty', 'abc123', 'password1', 'admin', 'welcome'
  ];

  constructor(private fb: FormBuilder, private router: Router) {}

  ngOnInit() {
    this.registerForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2), Validators.pattern(/^[a-zA-Z\s]*$/)]],
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

    // Subscribe to password changes for real-time strength assessment
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

  // Custom validator to check if passwords match
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

  // Custom validator for password complexity
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

  // Custom validator for password strength
  passwordStrengthValidator() {
    return (control: any) => {
      const value = control.value;
      if (!value) {
        return null;
      }

      // Check against common weak passwords
      if (this.commonWeakPasswords.includes(value.toLowerCase())) {
        return { commonPassword: true };
      }

      // Check for personal information (name/email) in password
      const name = this.registerForm?.get('name')?.value;
      const email = this.registerForm?.get('email')?.value;
      
      if (name && value.toLowerCase().includes(name.toLowerCase())) {
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

  // Advanced password strength algorithm
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

  // Generate helpful password suggestions
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

  // Handle password input event
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
      const { name, email, password } = this.registerForm.value;
      // Simulate registration (replace with API call)
      console.log('Registration Data:', { name, email, password });
      sessionStorage.setItem('email', email);
      sessionStorage.setItem('password', password);
      this.router.navigate(['/dashboard']);
    } else {
      this.errorMessage = 'Please fix the errors in the form.';
      this.registerForm.markAllAsTouched();
    }
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  // Getter for password strength feedback
  getPasswordStrengthFeedback(): string {
    const score = this.passwordStrengthScore;
    if (score >= 80) return 'Very Strong';
    if (score >= 60) return 'Strong';
    if (score >= 40) return 'Moderate';
    if (score >= 20) return 'Weak';
    return 'Very Weak';
  }
}