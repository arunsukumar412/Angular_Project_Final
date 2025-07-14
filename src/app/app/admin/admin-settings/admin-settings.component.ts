import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-admin-settings',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, FormsModule, SidebarComponent, RouterModule],
  templateUrl: './admin-settings.component.html',
  styleUrls: ['./admin-settings.component.css']
})
export class AdminSettingsComponent implements OnInit {
  activeTab = 'general';
  settingsForm: FormGroup;
  newRoleName = '';
  roles = [{ id: 1, name: 'Admin' }, { id: 2, name: 'User' }];
  apiKeys = [{ id: 1, key: 'abc123-def456-ghi789' }];
  auditLogs = [
    { action: 'User Created', user: 'admin', timestamp: new Date() },
    { action: 'Settings Updated', user: 'admin', timestamp: new Date() }
  ];
  backups = [{ id: 1, name: 'backup_20230704', date: new Date() }];
  autoBackup = false;

  constructor(private fb: FormBuilder) {
    this.settingsForm = this.fb.group({
      platformName: ['GenWorx', Validators.required],
      timezone: ['UTC+05:30', Validators.required],
      dateFormat: ['DD/MM/YYYY', Validators.required],
      maintenanceMode: [false],
      userRegistration: [true],
      emailVerification: [true],
      smtpHost: ['smtp.example.com'],
      smtpPort: [587],
      smtpUsername: ['admin@example.com'],
      smtpPassword: [''],
      fromEmail: ['noreply@example.com'],
      theme: ['light'],
      cacheDuration: [30, [Validators.min(1)]]
    });
  }

  ngOnInit() {
    // Initialize with current settings (mocked for example)
    this.settingsForm.patchValue({
      platformName: 'GenWorx',
      timezone: 'UTC+05:30', // Set to India Standard Time based on current date
      dateFormat: 'DD/MM/YYYY'
    });
  }

  setActiveTab(tab: string) {
    this.activeTab = tab;
  }

  saveSettings() {
    if (this.settingsForm.valid) {
      console.log('Settings Saved:', this.settingsForm.value);
      alert('Settings saved successfully!');
    }
  }

  resetForm() {
    this.settingsForm.reset({
      platformName: 'GenWorx',
      timezone: 'UTC+05:30',
      dateFormat: 'DD/MM/YYYY',
      maintenanceMode: false,
      userRegistration: true,
      emailVerification: true,
      smtpHost: 'smtp.example.com',
      smtpPort: 587,
      smtpUsername: 'admin@example.com',
      smtpPassword: '',
      fromEmail: 'noreply@example.com',
      theme: 'light',
      cacheDuration: 30
    });
  }

  refreshSettings() {
    console.log('Refreshing settings...');
    // Simulate API call or refresh logic
  }

  addRole() {
    if (this.newRoleName) {
      this.roles.push({ id: Date.now(), name: this.newRoleName });
      this.newRoleName = '';
    }
  }

  deleteRole(id: number) {
    this.roles = this.roles.filter(role => role.id !== id);
  }

  generateApiKey() {
    const newKey = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    this.apiKeys.push({ id: Date.now(), key: newKey });
    alert(`New API Key Generated: ${newKey}`);
  }

  revokeApiKey(id: number) {
    this.apiKeys = this.apiKeys.filter(key => key.id !== id);
  }

  createBackup() {
    const backupName = `backup_${new Date().toISOString().split('T')[0]}`;
    this.backups.push({ id: Date.now(), name: backupName, date: new Date() });
    alert('Backup created successfully!');
  }

  restoreBackup(id: number) {
    console.log(`Restoring backup with ID: ${id}`);
    alert('Backup restored!');
  }

  deleteBackup(id: number) {
    this.backups = this.backups.filter(backup => backup.id !== id);
  }

  clearCache() {
    console.log('Cache cleared!');
    alert('Cache cleared successfully!');
  }

  resetSettings() {
    this.resetForm();
    alert('Settings reset to default!');
  }

  purgeData() {
    console.log('Purging deleted data!');
    alert('Deleted data purged successfully!');
  }
}