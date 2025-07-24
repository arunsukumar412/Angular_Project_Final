import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { AdminHeaderComponent } from '../admin-header/admin-header.component';
import { AdminFooterComponent } from '../admin-footer/admin-footer.component';
import { AdminUser } from '../../../services/admin-user.service';
import { HttpClient } from '@angular/common/http';
import { HttpClientModule } from '@angular/common/http';
import { Subscription } from 'rxjs';

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

interface UserTab {
  label: string;
  value: 'all' | 'hr' | 'candidateActivity';
  count: number;
}

@Component({
  selector: 'app-user-management',
  templateUrl: './user-management.component.html',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, SidebarComponent, AdminHeaderComponent, AdminFooterComponent],
  // providers: [AdminUserService],
})
export class UserManagementComponent implements OnInit, OnDestroy {
  users: AdminUser[] = [];
  filteredUsers: AdminUser[] = [];
  candidateActivities: Activity[] = [];
  selectedUser: AdminUser | null = null;
  isEditing = false;
  showUserModal = false;
  filterRole: 'hr' | 'candidate' | '' = '';
  filterStatus: 'active' | 'inactive' | '' = '';
  filterDate: string | null = null;
  activeTab: 'all' | 'hr' | 'candidateActivity' = 'all';
  selectAll = false;
  selectedUsers: AdminUser[] = [];
  currentPage = 1;
  itemsPerPage = 10;
  startIndex = 0;
  endIndex = 0;
  totalUsers = 0;
  autoGeneratePassword = true;
  activityLog: Log[] = [];
  currentDate = new Date();
  userTabs: UserTab[] = [
    { label: 'All Users', value: 'all', count: 0 },
    { label: 'HR Users', value: 'hr', count: 0 },
    { label: 'Candidate Activity', value: 'candidateActivity', count: 0 },
  ];
  userForm: FormGroup;
  private sortField: keyof AdminUser = 'name';
  private sortDirection: 'asc' | 'desc' = 'asc';
  private activityLogInterval: ReturnType<typeof setInterval> | null = null;
  private subscriptions: Subscription = new Subscription();
  private defaultAvatar = 'https://png.pngtree.com/png-vector/20250109/ourlarge/pngtree-smiling-professional-avatar-png-image_14851558.png'; // PNGTree image path

  constructor(private fb: FormBuilder, private http: HttpClient) {
    this.userForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      role: ['hr', Validators.required],
      status: ['active', Validators.required],
      phone: [''],
    });
  }

  ngOnInit(): void {
    this.loadUsers();
    this.startActivityLogging();
  }

  ngOnDestroy(): void {
    if (this.activityLogInterval) {
      clearInterval(this.activityLogInterval);
    }
    this.subscriptions.unsubscribe();
  }

  loadUsers(): void {
    this.subscriptions.add(
      this.http.get<AdminUser[]>('/api/admin-users').subscribe({
        next: (users: AdminUser[]) => {
          this.users = users.map(user => ({
            ...user,
            selected: false,
            avatar_url: user.avatar_url || this.defaultAvatar,
            last_updated: user.last_updated || new Date().toISOString(),
          }));
          this.filterUsers();
        },
        error: (err: any) => {
          console.error('Error loading users:', err);
          this.logActivity('Failed to load users from backend.');
        },
      })
    );
  }

  // Removed generateMockUsers

  // Removed generateMockActivities

  filterUsers(): void {
    this.filteredUsers = this.users.filter(
      (user) =>
        (this.activeTab === 'hr' ? user.role === 'hr' : true) &&
        (this.filterRole ? user.role === this.filterRole : true) &&
        (this.filterStatus ? user.status === this.filterStatus : true) &&
        (!this.filterDate ||
          (user.last_updated &&
            new Date(user.last_updated).toISOString().split('T')[0] === this.filterDate))
    );
    this.totalUsers = this.filteredUsers.length;
    this.updateTabCounts();
    this.updatePagination();
  }

  updateTabCounts(): void {
    this.userTabs[0].count = this.users.length;
    this.userTabs[1].count = this.users.filter((u) => u.role === 'hr').length;
    this.userTabs[2].count = this.candidateActivities.length;
  }

  setActiveTab(tab: 'all' | 'hr' | 'candidateActivity'): void {
    this.activeTab = tab;
    this.currentPage = 1;
    this.filterUsers();
  }

  openAddUserModal(): void {
    this.isEditing = false;
    this.userForm.reset({ status: 'active', role: 'hr', phone: '' });
    this.selectedUser = null;
    this.showUserModal = true;
  }

  editUser(userId: string): void {
    const user = this.users.find((u) => u.user_id === userId);
    if (user && user.role === 'hr') {
      this.isEditing = true;
      this.selectedUser = user;
      this.userForm.patchValue({
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        phone: user.phone || '',
      });
      this.showUserModal = true;
    }
  }

  closeUserModal(): void {
    this.showUserModal = false;
    this.isEditing = false;
    this.selectedUser = null;
  }

  generatedPassword: string | null = null;
  showToast = false;
  toastMessage = '';
  toastTimeout: any = null;

  submitUserForm(): void {
    if (this.userForm.invalid) return;

    const formValue = this.userForm.value;
    let password = '';
    let user_id = this.isEditing && this.selectedUser ? this.selectedUser.user_id : undefined;
    if (!this.isEditing && formValue.role === 'hr') {
      // Generate a random password for new HR users
      password = Math.random().toString(36).slice(-8);
      this.generatedPassword = password;
    }

    const user: AdminUser & { password?: string } = {
      user_id,
      name: formValue.name,
      email: formValue.email,
      phone: formValue.phone,
      role: formValue.role,
      status: formValue.status,
      avatar_url: this.defaultAvatar,
      ...(password ? { password } : {})
    };

    if (this.isEditing && this.selectedUser && this.selectedUser.user_id) {
      this.subscriptions.add(
        this.http.put(`/api/admin-users/${this.selectedUser.user_id}`, user).subscribe({
          next: () => {
            this.logActivity(`Updated user ${user.name}`);
            this.closeUserModal();
            this.loadUsers();
          },
          error: (err: any) => {
            console.error('Error updating user:', err);
            this.logActivity(`Failed to update user ${user.name}`);
          },
        })
      );
    } else {
      this.subscriptions.add(
        this.http.post('/api/admin-users', user).subscribe({
          next: () => {
            this.logActivity(`Added new user ${user.name}`);
            // Show generated password after creation as a toast
            if (this.generatedPassword) {
              this.showToastMessage(`HR user created!<br>Email: <b>${user.email}</b><br>Password: <b>${this.generatedPassword}</b>`);
            }
            this.closeUserModal();
            this.loadUsers();
            this.generatedPassword = null;
          },
          error: (err: any) => {
            console.error('Error adding user:', err);
            this.logActivity(`Failed to add user ${user.name}`);
            this.generatedPassword = null;
          },
        })
      );
    }
  }

  showToastMessage(message: string) {
    this.toastMessage = message;
    this.showToast = true;
    if (this.toastTimeout) {
      clearTimeout(this.toastTimeout);
    }
    this.toastTimeout = setTimeout(() => {
      this.showToast = false;
      this.toastMessage = '';
    }, 5000);
  }

  generateAndSendCredentials(user: AdminUser): void {
    const password = this.autoGeneratePassword
      ? Math.random().toString(36).slice(-8)
      : 'default123';
    this.logActivity(`Generated credentials for ${user.name}`);
    console.log(`Credentials for ${user.name}: Email: ${user.email}, Password: ${password}`);
  }

  deleteUser(user_id: string): void {
    if (confirm('Are you sure you want to delete this user?')) {
    this.subscriptions.add(
      this.http.delete(`/api/admin-users/${user_id}`).subscribe({
        next: () => {
          this.logActivity(`Deleted user with ID ${user_id}`);
          this.loadUsers();
        },
        error: (err: any) => {
          console.error('Error deleting user:', err);
          this.logActivity(`Failed to delete user with ID ${user_id}`);
        },
      })
    );
    }
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
    this.selectedUsers.forEach((user) => {
      user.status = 'active';
      this.subscriptions.add(
        this.http.put(`/api/admin-users/${user.user_id}`, user).subscribe({
          error: (err: any) => {
            console.error('Error activating user:', err);
            this.logActivity(`Failed to activate user ${user.name}`);
          },
        })
      );
    });
    this.logActivity(`Activated ${this.selectedUsers.length} users`);
    this.selectedUsers = [];
    this.selectAll = false;
    this.filterUsers();
  }

  bulkDeactivate(): void {
    this.selectedUsers.forEach((user) => {
      user.status = 'inactive';
      this.subscriptions.add(
        this.http.put(`/api/admin-users/${user.user_id}`, user).subscribe({
          error: (err: any) => {
            console.error('Error deactivating user:', err);
            this.logActivity(`Failed to deactivate user ${user.name}`);
          },
        })
      );
    });
    this.logActivity(`Deactivated ${this.selectedUsers.length} users`);
    this.selectedUsers = [];
    this.selectAll = false;
    this.filterUsers();
  }

  bulkDelete(): void {
    if (confirm(`Are you sure you want to delete ${this.selectedUsers.length} users?`)) {
      this.selectedUsers.forEach((user) => {
        this.subscriptions.add(
          this.http.delete(`/api/admin-users/${user.user_id}`).subscribe({
            error: (err: any) => {
              console.error('Error deleting user:', err);
              this.logActivity(`Failed to delete user ${user.name}`);
            },
          })
        );
      });
      this.users = this.users.filter((u) => !this.selectedUsers.some((su) => su.user_id === u.user_id));
      this.logActivity(`Deleted ${this.selectedUsers.length} users`);
      this.selectedUsers = [];
      this.selectAll = false;
      this.filterUsers();
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

  sortTable(field: keyof AdminUser): void {
    if (this.sortField === field) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = field;
      this.sortDirection = 'asc';
    }
    this.filteredUsers.sort((a, b) => {
      const valueA = a[field as keyof AdminUser];
      const valueB = b[field as keyof AdminUser];
      if (field === 'last_updated') {
        const dateA = valueA ? new Date(valueA as string).getTime() : 0;
        const dateB = valueB ? new Date(valueB as string).getTime() : 0;
        return this.sortDirection === 'asc' ? dateA - dateB : dateB - dateA;
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
        })}`
      );
    }, 300000); // Log every 5 minutes
  }
}