import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface AdminUser {
  user_id?: string;
  name: string;
  email: string;
  phone?: string;
  role?: 'hr' | 'candidate' | 'admin';
  status?: 'active' | 'inactive';
  password_hash?: string;
  avatar_url?: string;
  last_updated?: string;
  created_at?: string;
  selected?: boolean;
}

@Injectable({ providedIn: 'root' })
export class AdminUserService {
  private apiUrl = '/api/admin-users';

  constructor(private http: HttpClient) {}

  getAll(): Observable<AdminUser[]> {
    return this.http.get<AdminUser[]>(this.apiUrl);
  }

  getById(id: string): Observable<AdminUser> {
    return this.http.get<AdminUser>(`${this.apiUrl}/${id}`);
  }

  create(user: AdminUser): Observable<any> {
    return this.http.post(this.apiUrl, user);
  }

  update(id: string, user: AdminUser): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, user);
  }

  delete(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
