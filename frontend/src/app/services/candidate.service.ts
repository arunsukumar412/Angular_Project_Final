import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

export interface Candidate {
  id: string;
  candidateName: string;
  email: string;
  phone?: string;
  department?: string;
  location?: string;
  resume?: string;
  createdAt?: string;
}

function toCamel(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(v => toCamel(v));
  } else if (obj && typeof obj === 'object') {
    return Object.keys(obj).reduce((result, key) => {
      const camelKey = key.replace(/_([a-z])/g, g => g[1].toUpperCase());
      result[camelKey] = toCamel(obj[key]);
      return result;
    }, {} as any);
  }
  return obj;
}

@Injectable({ providedIn: 'root' })
export class CandidateService {
  private apiUrl = '/api/candidates';

  constructor(private http: HttpClient) {}

  getAll(): Observable<Candidate[]> {
    return this.http.get<Candidate[]>(this.apiUrl).pipe(map(toCamel));
  }

  getById(id: string): Observable<Candidate> {
    return this.http.get<Candidate>(`${this.apiUrl}/${id}`).pipe(map(toCamel));
  }
}
