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
  private baseUrl = '/api/jobs-management'; // Backend API endpoint

  constructor(private http: HttpClient) {}

// Get all jobs
getJobs(): Observable<any[]> {
  return this.http.get<any[]>(this.baseUrl)
    .pipe(
      catchError(error => {
        console.error('Error fetching jobs:', error);
        return throwError(() => new Error('Failed to fetch jobs. Please try again.'));
      })
    );
}

// Create a new job
createJob(job: any): Observable<any> {
  return this.http.post(this.baseUrl, job)
    .pipe(
      catchError(error => {
        console.error('Error creating job:', error);
        return throwError(() => new Error('Failed to create job. Please try again.'));
      })
    );
}

// Update a job
updateJob(id: number, job: any): Observable<any> {
  return this.http.put(`${this.baseUrl}/${id}`, job)
    .pipe(
      catchError(error => {
        console.error('Error updating job:', error);
        return throwError(() => new Error('Failed to update job. Please try again.'));
      })
    );
}

// Delete a job
deleteJob(id: number): Observable<any> {
  return this.http.delete(`${this.baseUrl}/${id}`)
    .pipe(
      catchError(error => {
        console.error('Error deleting job:', error);
        return throwError(() => new Error('Failed to delete job. Please try again.'));
      })
    );
}
  // Submit a job application (separate endpoint)
  submitApplication(application: ApplicationData): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post('/api/applications', application, { headers })
      .pipe(
        catchError(error => {
          console.error('Error submitting application:', error);
          return throwError(() => new Error('Failed to submit application. Please try again.'));
        })
      );
  }
}