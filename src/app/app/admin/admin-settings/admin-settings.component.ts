import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, SidebarComponent,ReactiveFormsModule],
  templateUrl: './admin-settings.component.html',
  styleUrls: ['./admin-settings.component.css']
})
export class AdminSettingsComponent implements OnInit {
  currentDate: Date = new Date(); // 01:53 PM IST, July 05, 2025
  activeTab: string = 'general';
  settingsForm: FormGroup;
  showConfirmation: boolean = false;
  confirmationMessage: string = '';
  actionToExecute: string = '';
  emailTestResult: string = '';

  constructor(private fb: FormBuilder, private router: Router) {
    this.settingsForm = this.fb.group({
      platformName: ['', [Validators.required, Validators.minLength(2)]],
      timezone: ['UTC+05:30'],
      dateFormat: ['DD/MM/YYYY'],
      twoFactor: [false],
      sessionTimeout: [30, [Validators.min(15), Validators.max(1440)]],
      emailNotifications: [true],
      inAppNotifications: [true],
      theme: ['light'],
      maintenanceMode: [false],
      logLevel: ['info'],
      smtpHost: ['smtp.example.com', [Validators.required]],
      smtpPort: [587, [Validators.min(1), Validators.max(65535)]],
      smtpUsername: ['admin@example.com'],
      smtpPassword: [''],
      fromEmail: ['noreply@example.com', [Validators.email]]
    });
  }

  ngOnInit(): void {}

  toggleSidebar(): void {
    // Implement sidebar toggle logic if needed
  }

  setActiveTab(tab: string): void {
    this.activeTab = tab;
  }

  toggleMaintenanceMode(): void {
    if (this.settingsForm.get('maintenanceMode')?.value) {
      alert('Maintenance mode enabled. Platform is now restricted to admins.');
    }
  }

  testEmailSettings(): void {
    const smtpHost = this.settingsForm.get('smtpHost')?.value;
    const smtpPort = this.settingsForm.get('smtpPort')?.value;
    const smtpUsername = this.settingsForm.get('smtpUsername')?.value;
    const smtpPassword = this.settingsForm.get('smtpPassword')?.value;
    const fromEmail = this.settingsForm.get('fromEmail')?.value;

    // Simulate email test
    if (smtpHost && smtpPort && smtpUsername && fromEmail) {
      this.emailTestResult = 'Email configuration test successful! Message sent to ' + fromEmail;
      setTimeout(() => this.emailTestResult = '', 5000); // Clear after 5 seconds
    } else {
      this.emailTestResult = 'Email configuration test failed. Please check settings.';
      setTimeout(() => this.emailTestResult = '', 5000);
    }
  }

  saveSettings(): void {
    if (this.settingsForm.valid) {
      console.log('Settings saved:', this.settingsForm.value);
      this.settingsForm.markAsPristine();
      alert('Settings saved successfully!');
    }
  }

  resetSettings(): void {
    this.settingsForm.reset({
      platformName: 'GenWorx',
      timezone: 'UTC+05:30',
      dateFormat: 'DD/MM/YYYY',
      twoFactor: false,
      sessionTimeout: 30,
      emailNotifications: true,
      inAppNotifications: true,
      theme: 'light',
      maintenanceMode: false,
      logLevel: 'info',
      smtpHost: 'smtp.example.com',
      smtpPort: 587,
      smtpUsername: 'admin@example.com',
      smtpPassword: '',
      fromEmail: 'noreply@example.com'
    });
    alert('Settings reset to default.');
  }

  confirmAction(action: string): void {
    this.actionToExecute = action;
    this.confirmationMessage = `Are you sure you want to ${action.replace(/([A-Z])/g, ' $1').toLowerCase()}? This action cannot be undone.`;
    this.showConfirmation = true;
  }

  cancelAction(): void {
    this.showConfirmation = false;
    this.actionToExecute = '';
  }

  executeAction(): void {
    switch (this.actionToExecute) {
      case 'clearCache':
        console.log('Cache cleared at', new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
        alert('Cache cleared successfully.');
        break;
      case 'resetSettings':
        this.resetSettings();
        break;
      case 'purgeData':
        console.log('Deleted data purged at', new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
        alert('Deleted data purged successfully.');
        break;
    }
    this.showConfirmation = false;
    this.actionToExecute = '';
  }

  openPolicy(type: string): void {
    console.log(`Opening ${type} policy at ${new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' })}`);
    this.router.navigate([`/policy/${type}`]);
  }

  openContact(): void {
    console.log(`Opening contact page at ${new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' })}`);
    this.router.navigate(['/contact']);
  }
}