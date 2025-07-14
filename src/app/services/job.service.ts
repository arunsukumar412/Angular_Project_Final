import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class JobService {
  getJobs(): Observable<any[]> {
    // In a real app, this would be an HTTP request
    const mockJobs = [
      {
        id: 1,
        title: 'Senior UX Designer',
        company: 'TechCorp',
        location: 'San Francisco, CA',
        salary: '$120,000 - $150,000',
        type: 'Full-time',
        postedDate: new Date('2023-06-10'),
        description: 'We are looking for an experienced UX Designer to join our product team...',
        requirements: [
          '5+ years of UX design experience',
          'Strong portfolio of design projects',
          'Proficiency in Figma and Adobe Creative Suite'
        ],
        skills: ['UX Design', 'Figma', 'User Research', 'Prototyping']
      },
      // Add more mock jobs as needed
    ];
    return of(mockJobs);
  }
}