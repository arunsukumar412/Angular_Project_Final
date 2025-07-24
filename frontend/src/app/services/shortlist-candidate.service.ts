import { Injectable, EventEmitter } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface ShortlistCandidate {
  id?: string;
  candidateId: string;
  candidateName: string;
  candidateEmail: string;
  candidateImage: string;
  jobId: string;
  jobTitle: string;
  status: string;
}

@Injectable({ providedIn: 'root' })
export class ShortlistCandidateService {
  shortlistUpdated: EventEmitter<void> = new EventEmitter<void>();
  private apiUrl = '/api/shortlist-candidates';

  constructor(private http: HttpClient) {}

  getAll(): Observable<ShortlistCandidate[]> {
    return this.http.get<any[]>(this.apiUrl).pipe(
      // Map snake_case API fields to camelCase for the UI
      map((data: any[]) => data.map(item => ({
        id: item.id,
        candidateId: item.candidate_id,
        candidateName: item.candidate_name,
        candidateEmail: item.candidate_email,
        candidateImage: item.candidate_image,
        jobId: item.job_id,
        jobTitle: item.job_title,
        status: item.status
      })))
    );
  }

  create(candidate: ShortlistCandidate): Observable<any> {
    // Map camelCase to snake_case for backend
    const payload = {
      candidate_id: candidate.candidateId,
      candidate_name: candidate.candidateName,
      candidate_email: candidate.candidateEmail,
      candidate_image: candidate.candidateImage,
      job_id: candidate.jobId,
      job_title: candidate.jobTitle,
      status: candidate.status
    };
    return this.http.post(this.apiUrl, payload).pipe(
      map(res => {
        this.shortlistUpdated.emit();
        return res;
      })
    );
  }

  delete(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`).pipe(
      map(res => {
        this.shortlistUpdated.emit();
        return res;
      })
    );
  }
}
