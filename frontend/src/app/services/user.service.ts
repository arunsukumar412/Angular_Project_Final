import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// Define the User interface
export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'hr' | 'candidate';
  status: 'active' | 'inactive';
  avatar?: string;
  selected?: boolean;
  lastUpdated?: Date;
  [key: string]: any;
}

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private apiUrl = 'https://6874b090dd06792b9c94c65d.mockapi.io/api/v1/User_Management'; // MockAPI URL

  constructor(private http: HttpClient) {}

  // Get all users
  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.apiUrl);
  }

  // Add a new user
  addUser(user: User): Observable<User> {
    return this.http.post<User>(this.apiUrl, user);
  }

  // Update an existing user
  updateUser(user: User): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/${user.id}`, user);
  }

  // Delete a user
  deleteUser(userId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${userId}`);
  }
}