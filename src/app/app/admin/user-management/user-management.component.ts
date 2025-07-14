import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SidebarComponent } from '../sidebar/sidebar.component';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'hr' | 'candidate';
  status: 'active' | 'inactive';
  avatar?: string;
  selected?: boolean;
  lastUpdated?: Date;
  [key: string]: any; // Added index signature to allow dynamic indexing
}

interface Activity {
  userName: string;
  action: string;
  details: string;
  timestamp: Date;
}

interface Log {
  message: string;
  timestamp: Date;
}

interface Notification {
  message: string;
  time: string;
  read: boolean;
}

interface UserTab {
  label: string;
  value: 'all' | 'hr' | 'candidateActivity';
  count: number;
}

@Component({
  selector: 'app-user-management',
  templateUrl: './user-management.component.html',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, SidebarComponent],
})
export class UserManagementComponent implements OnInit, OnDestroy {
  users: User[] = [];
  filteredUsers: User[] = [];
  candidateActivities: Activity[] = [];
  selectedUser: User | null = null;
  isEditing = false;
  showUserModal = false;
  showNotificationDropdown = false;
  showUserDropdown = false;
  showSidebar = false; // Added for toggleSidebar
  searchQuery = '';
  filterRole: 'hr' | 'candidate' | '' = '';
  filterStatus: 'active' | 'inactive' | '' = '';
  filterDate: string | null = null;
  activeTab: 'all' | 'hr' | 'candidateActivity' = 'all';
  notifications: Notification[] = [];
  unreadNotifications = 0;
  selectAll = false;
  selectedUsers: User[] = [];
  currentPage = 1;
  itemsPerPage = 10;
  startIndex = 0; // Reintroduced
  endIndex = 0; // Reintroduced
  totalUsers = 0;
  autoGeneratePassword = true;
  activityLog: Log[] = [];
  currentUser = 'Admin'; // Reintroduced
  currentDate = new Date(); // Reintroduced
  currentYear = this.currentDate.getFullYear(); // Reintroduced
  version = '2.4.1'; // Reintroduced

  userTabs: UserTab[] = [
    { label: 'All Users', value: 'all', count: 0 },
    { label: 'HR Users', value: 'hr', count: 0 },
    { label: 'Candidate Activity', value: 'candidateActivity', count: 0 },
  ];

  userForm: FormGroup;
  private sortField: keyof User = 'name';
  private sortDirection: 'asc' | 'desc' = 'asc';
  private activityLogInterval: ReturnType<typeof setInterval> | null = null;

  constructor(private fb: FormBuilder) {
    this.userForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      role: ['hr', Validators.required],
      status: ['active', Validators.required],
    });
  }

  ngOnInit(): void {
    this.loadUsers();
    this.generateMockActivities();
    this.updateTabCounts();
    this.startActivityLogging();
  }

  ngOnDestroy(): void {
    if (this.activityLogInterval) {
      clearInterval(this.activityLogInterval);
      this.activityLogInterval = null;
    }
  }

  loadUsers(): void {
    this.users = [
      {
        id: 'hr1',
        name: 'HR Manager 1',
        email: 'hr1@genworx.com',
        role: 'hr',
        status: 'active',
        avatar: 'assets/avatars/hr1.png',
        lastUpdated: new Date(),
      },
      {
        id: 'hr2',
        name: 'HR Manager 2',
        email: 'hr2@genworx.com',
        role: 'hr',
        status: 'inactive',
        avatar: 'assets/avatars/hr2.png',
        lastUpdated: new Date(),
      },
      {
        id: 'cand1',
        name: 'Candidate 1',
        email: 'cand1@genworx.com',
        role: 'candidate',
        status: 'active',
        avatar: 'assets/avatars/cand1.png',
        lastUpdated: new Date(),
      },
    ];
    this.filterUsers();
  }

  generateMockActivities(): void {
    this.candidateActivities = [
      {
        userName: 'Candidate 1',
        action: 'Applied for job',
        details: 'Applied to Software Engineer role',
        timestamp: new Date(),
      },
      {
        userName: 'Candidate 1',
        action: 'Viewed profile',
        details: 'Updated personal details',
        timestamp: new Date(Date.now() - 3600000),
      },
    ];
  }

  filterUsers(): void {
    this.filteredUsers = this.users.filter(
      (user) =>
        user.name.toLowerCase().includes(this.searchQuery.toLowerCase()) &&
        (this.filterRole ? user.role === this.filterRole : true) &&
        (this.filterStatus ? user.status === this.filterStatus : true) &&
        (!this.filterDate ||
          (user.lastUpdated &&
            new Date(user.lastUpdated).toISOString().split('T')[0] === this.filterDate)),
    );
    this.totalUsers = this.filteredUsers.length;
    this.updateTabCounts();
    this.updatePagination();
  }

  updateTabCounts(): void {
    this.userTabs[0].count = this.filteredUsers.length;
    this.userTabs[1].count = this.filteredUsers.filter((u) => u.role === 'hr').length;
    this.userTabs[2].count = this.candidateActivities.length;
  }

  setActiveTab(tab: 'all' | 'hr' | 'candidateActivity'): void {
    this.activeTab = tab;
  }

  toggleSidebar(): void {
    this.showSidebar = !this.showSidebar;
  }

  toggleNotificationDropdown(): void {
    this.showNotificationDropdown = !this.showNotificationDropdown;
  }

  toggleUserDropdown(): void {
    this.showUserDropdown = !this.showUserDropdown;
  }

  openAddUserModal(): void {
    this.isEditing = false;
    this.userForm.reset({ status: 'active', role: 'hr' });
    this.selectedUser = null;
    this.showUserModal = true;
  }

  editUser(userId: string): void {
    const user = this.users.find((u) => u.id === userId);
    if (user && user.role === 'hr') {
      this.isEditing = true;
      this.selectedUser = user;
      this.userForm.patchValue({
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
      });
      this.showUserModal = true;
    }
  }

  cancelEdit(): void {
    this.isEditing = false;
    this.selectedUser = null;
    this.showUserModal = false;
  }

  submitUserForm(): void {
    if (this.userForm.invalid) return;

    const formValue = this.userForm.value;
    if (
      !this.isEditing &&
      this.users.some((u) => u.email === formValue.email && u.id !== this.selectedUser?.id)
    ) {
      alert('Email already exists.');
      return;
    }

    if (this.isEditing && this.selectedUser) {
      Object.assign(this.selectedUser, {
        name: formValue.name,
        email: formValue.email,
        role: formValue.role,
        status: formValue.status,
        lastUpdated: new Date(),
      });
      this.logActivity(`Updated user ${this.selectedUser.name}`);
    } else {
      const newUser: User = {
        id: `hr${this.users.length + 1}`,
        name: formValue.name,
        email: formValue.email,
        role: formValue.role,
        status: formValue.status,
        avatar: `assets/avatars/hr${this.users.length + 1}.png`,
        lastUpdated: new Date(),
      };
      this.users.push(newUser);
      if (this.autoGeneratePassword) {
        this.generateAndSendCredentials(newUser);
      }
      this.logActivity(`Added new user ${newUser.name}`);
    }
    this.closeUserModal();
    this.filterUsers();
  }

  closeUserModal(): void {
    this.showUserModal = false;
    this.isEditing = false;
    this.selectedUser = null;
  }

  generateAndSendCredentials(user: User): void {
    const password = this.autoGeneratePassword
      ? Math.random().toString(36).slice(-8)
      : 'default123';
    const currentTime = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
    this.notifications.unshift({
      message: `Credentials sent to ${user.email}`,
      time: currentTime,
      read: false,
    });
    this.unreadNotifications++;
    this.logActivity(`Generated credentials for ${user.name}`);
    console.log(
      `Credentials for ${user.name}: Email: ${user.email}, Password: ${password} (Sent at ${currentTime})`,
    );
  }

  deleteUser(userId: string): void {
    if (confirm('Are you sure you want to delete this user?')) {
      const user = this.users.find((u) => u.id === userId);
      this.users = this.users.filter((u) => u.id !== userId);
      this.filterUsers();
      this.logActivity(`Deleted user ${user?.name || 'with ID ' + userId}`);
    }
  }

  exportUsers(): void {
    const escapeCsv = (value: string) =>
      `"${value.replace(/"/g, '""')}"`;
    const headers = 'Name,Email,Role,Status\n';
    const csv = headers + this.filteredUsers
      .map(
        (user) =>
          `${escapeCsv(user.name)},${escapeCsv(user.email)},${user.role},${user.status}`,
      )
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `users_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    this.logActivity('Exported user list');
  }

  importUsers(): void {
    alert('Import functionality to be implemented (e.g., upload CSV file)');
    this.logActivity('Initiated user import');
  }

  syncUsers(): void {
    alert('Syncing with directory (e.g., LDAP/AD)');
    this.logActivity('Synced users with directory');
  }

  bulkActivate(): void {
    this.selectedUsers.forEach((user) => (user.status = 'active'));
    this.filterUsers();
    this.logActivity(`Activated ${this.selectedUsers.length} users`);
    this.selectedUsers = [];
    this.selectAll = false;
  }

  bulkDeactivate(): void {
    this.selectedUsers.forEach((user) => (user.status = 'inactive'));
    this.filterUsers();
    this.logActivity(`Deactivated ${this.selectedUsers.length} users`);
    this.selectedUsers = [];
    this.selectAll = false;
  }

  bulkDelete(): void {
    if (confirm(`Are you sure you want to delete ${this.selectedUsers.length} users?`)) {
      this.users = this.users.filter((u) => !this.selectedUsers.some((su) => su.id === u.id));
      this.filterUsers();
      this.logActivity(`Deleted ${this.selectedUsers.length} users`);
      this.selectedUsers = [];
      this.selectAll = false;
    }
  }

  toggleSelectAll(): void {
    this.selectAll = !this.selectAll;
    this.filteredUsers.forEach((user) => (user.selected = this.selectAll));
    this.updateSelectedUsers();
  }

  updateSelectedUsers(): void {
    this.selectedUsers = this.filteredUsers.filter((user) => user.selected);
  }

  sortTable(field: keyof User): void {
    if (this.sortField === field) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = field;
      this.sortDirection = 'asc';
    }
    this.filteredUsers.sort((a, b) => {
      const valueA = a[field];
      const valueB = b[field];
      if (field === 'lastUpdated' && valueA instanceof Date && valueB instanceof Date) {
        return this.sortDirection === 'asc'
          ? valueA.getTime() - valueB.getTime()
          : valueB.getTime() - valueA.getTime();
      }
      return this.sortDirection === 'asc'
        ? String(valueA).localeCompare(String(valueB))
        : String(valueB).localeCompare(String(valueA));
    });
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePagination();
    }
  }

  nextPage(): void {
    if (this.endIndex < this.totalUsers) {
      this.currentPage++;
      this.updatePagination();
    }
  }

  updatePagination(): void {
    this.startIndex = (this.currentPage - 1) * this.itemsPerPage;
    this.endIndex = Math.min(this.startIndex + this.itemsPerPage, this.totalUsers);
  }

  logout(): void {
    console.log('Logged out');
    this.logActivity('User logged out');
  }

  openPolicy(type: string): void {
    console.log(`Opening ${type} policy`);
    this.logActivity(`Opened ${type} policy`);
  }

  openContact(): void {
    console.log('Opening contact form');
    this.logActivity('Opened contact form');
  }

  markAllAsRead(): void {
    this.unreadNotifications = 0;
    this.notifications.forEach((n) => (n.read = true));
  }

  logActivity(message: string): void {
    this.activityLog.unshift({ message, timestamp: new Date() });
    if (this.activityLog.length > 10) {
      this.activityLog.pop();
    }
  }

  startActivityLogging(): void {
    this.activityLogInterval = setInterval(() => {
      this.logActivity(
        `System checked at ${new Date().toLocaleTimeString('en-IN', {
          timeZone: 'Asia/Kolkata',
        })}`,
      );
    }, 300000);
  }
}