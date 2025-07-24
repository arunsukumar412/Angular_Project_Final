import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

export interface Interview {
  id?: string;
  candidateId: string;
  candidateName: string;
  candidateEmail: string;
  candidateImage: string;
  jobId: string;
  jobTitle: string;
  interviewerId: string;
  interviewer: string;
  date: string;
  time: string;
  status: string;
  statusColor: string;
}

@Injectable({ providedIn: 'root' })
export class InterviewService {
  private apiUrl = '/api/interviews';

  constructor(private http: HttpClient) {}

  getAll(): Observable<Interview[]> {
    return this.http.get<Interview[]>(this.apiUrl).pipe(
      tap(data => console.log('Backend interviews:', data))
    );
  }

  create(interview: Interview): Observable<any> {
    return this.http.post(this.apiUrl, interview);
  }

  update(id: string, interview: Interview): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, interview);
  }

  delete(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
