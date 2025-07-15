import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { AdminHeaderComponent } from '../admin-header/admin-header.component';
import { AdminFooterComponent } from '../admin-footer/admin-footer.component';
import { UserService, User } from '../../../services/user.service';
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
  providers: [UserService],
})
export class UserManagementComponent implements OnInit, OnDestroy {
  users: User[] = [];
  filteredUsers: User[] = [];
  candidateActivities: Activity[] = [];
  selectedUser: User | null = null;
  isEditing = false;
  showUserModal = false;
  filterRole: 'hr' | 'candidate' | '' = '';
  filterStatus: 'active' | 'inactive' | '' = '';
  filterDate: string | null = null;
  activeTab: 'all' | 'hr' | 'candidateActivity' = 'all';
  selectAll = false;
  selectedUsers: User[] = [];
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
  private sortField: keyof User = 'name';
  private sortDirection: 'asc' | 'desc' = 'asc';
  private activityLogInterval: ReturnType<typeof setInterval> | null = null;
  private subscriptions: Subscription = new Subscription();
  private defaultAvatar = 'https://png.pngtree.com/png-vector/20250109/ourlarge/pngtree-smiling-professional-avatar-png-image_14851558.png'; // PNGTree image path

  constructor(private fb: FormBuilder, private userService: UserService) {
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
    this.generateMockActivities(5); // Generate 5 mock activities
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
      this.userService.getUsers().subscribe({
        next: (users: User[]) => {
          this.users = users.map(user => ({
            ...user,
            selected: false,
            avatar: user.avatar || this.defaultAvatar, // Use PNGTree image as default
            lastUpdated: user.lastUpdated ? new Date(user.lastUpdated) : new Date(),
          }));
          this.filterUsers();
        },
        error: (err: any) => {
          console.error('Error loading users:', err);
          this.logActivity('Failed to load users, generating mock users');
          this.generateMockUsers(); // Fallback to mock users
        },
      })
    );
  }

  generateMockUsers(count: number = 4, role: 'hr' | 'candidate' | 'all' = 'all'): void {
    const users: User[] = [];
    for (let i = 0; i < count; i++) {
      const userRole = role === 'all' ? (Math.random() > 0.5 ? 'hr' : 'candidate') : role;
      users.push({
        id: `${userRole}${Date.now() + i}`,
        name: `User ${i + 1}`,
        email: `user${i + 1}@example.com`,
        phone: `+1-555-010${i}`,
        role: userRole,
        status: Math.random() > 0.5 ? 'active' : 'inactive',
        lastUpdated: new Date(Date.now() - Math.random() * 86400000 * 7), // Random time within 7 days
        selected: false,
        avatar: this.defaultAvatar, // Use PNGTree image
      });
    }
    this.users = users;
    this.filterUsers();
    this.logActivity(`Generated ${count} mock ${role} users with default avatar`);
  }

  generateMockActivities(count: number = 5): void {
    const actions = [
      'Applied for job',
      'Updated profile',
      'Completed assessment',
      'Scheduled interview',
      'Viewed job listing',
    ];
    const roles = ['Software Engineer', 'Data Analyst', 'Product Manager', 'Designer'];
    this.candidateActivities = Array.from({ length: count }, (_, index) => ({
      userName: `Candidate ${index + 1}`,
      action: actions[Math.floor(Math.random() * actions.length)],
      details: `${actions[Math.floor(Math.random() * actions.length)]} for ${roles[Math.floor(Math.random() * roles.length)]} role`,
      timestamp: new Date(Date.now() - Math.random() * 86400000 * 7), // Random time within 7 days
    }));
    this.updateTabCounts();
    this.logActivity(`Generated ${count} mock candidate activities`);
  }

  filterUsers(): void {
    this.filteredUsers = this.users.filter(
      (user) =>
        (this.activeTab === 'hr' ? user.role === 'hr' : true) &&
        (this.filterRole ? user.role === this.filterRole : true) &&
        (this.filterStatus ? user.status === this.filterStatus : true) &&
        (!this.filterDate ||
          (user.lastUpdated &&
            new Date(user.lastUpdated).toISOString().split('T')[0] === this.filterDate))
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
    const user = this.users.find((u) => u.id === userId);
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

  submitUserForm(): void {
    if (this.userForm.invalid) return;

    const formValue = this.userForm.value;
    const user: User = {
      id: this.isEditing && this.selectedUser ? this.selectedUser.id : `hr${Date.now()}`,
      name: formValue.name,
      email: formValue.email,
      phone: formValue.phone,
      role: formValue.role,
      status: formValue.status,
      lastUpdated: new Date(),
      avatar: this.defaultAvatar, // Use PNGTree image as default
    };

    if (this.isEditing && this.selectedUser) {
      this.subscriptions.add(
        this.userService.updateUser(user).subscribe({
          next: (updatedUser: User) => {
            const index = this.users.findIndex((u) => u.id === updatedUser.id);
            if (index !== -1) {
              this.users[index] = { ...this.users[index], ...updatedUser, selected: this.users[index].selected };
            }
            this.logActivity(`Updated user ${user.name}`);
            this.closeUserModal();
            this.filterUsers();
          },
          error: (err: any) => {
            console.error('Error updating user:', err);
            this.logActivity(`Failed to update user ${user.name}`);
          },
        })
      );
    } else {
      this.subscriptions.add(
        this.userService.addUser(user).subscribe({
          next: (newUser: User) => {
            const userObj: User = {
              id: newUser.id || `hr${Date.now()}`,
              name: newUser.name,
              email: newUser.email,
              phone: newUser.phone,
              role: newUser.role || 'hr',
              status: newUser.status || 'active',
              lastUpdated: newUser.lastUpdated ? new Date(newUser.lastUpdated) : new Date(),
              selected: false,
              avatar: newUser.avatar || this.defaultAvatar,
            };
            this.users.push(userObj);
            if (this.autoGeneratePassword) {
              this.generateAndSendCredentials(userObj);
            }
            this.logActivity(`Added new user ${newUser.name}`);
            this.closeUserModal();
            this.filterUsers();
          },
          error: (err: any) => {
            console.error('Error adding user:', err);
            this.logActivity(`Failed to add user ${user.name}`);
          },
        })
      );
    }
  }

  generateAndSendCredentials(user: User): void {
    const password = this.autoGeneratePassword
      ? Math.random().toString(36).slice(-8)
      : 'default123';
    this.logActivity(`Generated credentials for ${user.name}`);
    console.log(`Credentials for ${user.name}: Email: ${user.email}, Password: ${password}`);
  }

  deleteUser(userId: string): void {
    if (confirm('Are you sure you want to delete this user?')) {
      this.subscriptions.add(
        this.userService.deleteUser(userId).subscribe({
          next: () => {
            const user = this.users.find((u) => u.id === userId);
            this.users = this.users.filter((u) => u.id !== userId);
            this.logActivity(`Deleted user ${user?.name || 'with ID ' + userId}`);
            this.filterUsers();
          },
          error: (err: any) => {
            console.error('Error deleting user:', err);
            this.logActivity(`Failed to delete user with ID ${userId}`);
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
        this.userService.updateUser(user).subscribe({
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
      this.subscriptions.add( // Fixed typo: subplications -> subscriptions
        this.userService.updateUser(user).subscribe({
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
          this.userService.deleteUser(user.id).subscribe({
            error: (err: any) => {
              console.error('Error deleting user:', err);
              this.logActivity(`Failed to delete user ${user.name}`);
            },
          })
        );
      });
      this.users = this.users.filter((u) => !this.selectedUsers.some((su) => su.id === u.id));
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