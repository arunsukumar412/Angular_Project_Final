import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApplicationService {
  private baseUrl = 'https://your-api.com/api/applications'; // Replace with your API URL

  constructor(private http: HttpClient) {}

  submitApplication(application: any): Observable<any> {
    return this.http.post(`${this.baseUrl}`, application);
  }
}
