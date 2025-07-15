import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';

export interface ApplicationData {
  jobId: number;
  firstName: string;
  email: string;
  phone: string;
  resume: string; // File name or path
  coverLetter: string;
}

@Injectable({
  providedIn: 'root'
})
export class ApplicationService {
  private baseUrl = 'https://6874b090dd06792b9c94c65d.mockapi.io/api/v1/Application_Management'; // Replace with your API URL

  constructor(private http: HttpClient) {}

getApplications(): Observable<any[]> {
  return this.http.get<any[]>(this.baseUrl)
    .pipe(
      catchError(error => {
        console.error('Error fetching applications:', error);
        return throwError(() => new Error('Failed to fetch applications. Please try again.'));
      })
    );
}
  submitApplication(application: ApplicationData): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post(`${this.baseUrl}`, application, { headers })
      .pipe(
        catchError(error => {
          console.error('Error submitting application:', error);
          return throwError(() => new Error('Failed to submit application. Please try again.'));
        })
      );
  }
}