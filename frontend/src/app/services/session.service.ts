import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class SessionService {
  private apiUrl = 'http://localhost:5000/api/sessions';

  constructor(private http: HttpClient) {}

  createSession(user_id: string, user_role?: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/`, { user_id, user_role });
  }

  getSession(session_id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${session_id}`);
  }

  deleteSession(session_id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${session_id}`);
  }

  getSessionsByUser(user_id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/user/${user_id}`);
  }
}
