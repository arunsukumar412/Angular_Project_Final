import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ShortlistCandidateService, ShortlistCandidate } from '../../../services/shortlist-candidate.service';
import { CandidateService, Candidate } from '../../../services/candidate.service';
import { HrHeaderComponent } from "../hr-header/hr-header.component";
import { RecruiterSidebarComponent } from "../recruiter-sidebar/recruiter-sidebar.component";
import { HrFooterComponent } from "../hr-footer/hr-footer.component";

@Component({
  selector: 'app-shortlist-candidates',
  templateUrl: './shortlist-candidates.component.html',
  styleUrls: ['./shortlist-candidates.component.css'],
  imports: [CommonModule, FormsModule, HrHeaderComponent, RecruiterSidebarComponent, HrFooterComponent]
})
export class ShortlistCandidatesComponent implements OnInit {
  encodeName(name: string | undefined): string {
    return name ? encodeURIComponent(name) : '';
  }
  shortlistedCandidates: (ShortlistCandidate & { candidateDetails?: Candidate })[] = [];
  paginatedShortlisted: (ShortlistCandidate & { candidateDetails?: Candidate })[] = [];
  shortlistPage = 1;
  itemsPerPage = 10;
  loading = false;



  constructor(
    private shortlistService: ShortlistCandidateService,
    private candidateService: CandidateService
  ) {
    // Listen for shortlist updates from anywhere in the app
    this.shortlistService.shortlistUpdated.subscribe(() => {
      this.fetchShortlistedCandidates();
    });
  }

  ngOnInit() {
    this.fetchShortlistedCandidates();
  }

  fetchShortlistedCandidates() {
    this.loading = true;
    this.shortlistService.getAll().subscribe(data => {
      // For each shortlist entry, fetch candidate details
      const shortlistWithDetails: (ShortlistCandidate & { candidateDetails?: Candidate })[] = data.map(s => ({ ...s }));
      let loaded = 0;
      if (shortlistWithDetails.length === 0) {
        this.shortlistedCandidates = [];
        this.updatePaginatedShortlisted();
        this.loading = false;
        return;
      }
      shortlistWithDetails.forEach((entry, idx) => {
        if (entry.candidateId) {
          this.candidateService.getById(entry.candidateId).subscribe({
            next: (candidate) => {
              shortlistWithDetails[idx].candidateDetails = candidate;
              console.log('Fetched candidate for entry', entry, '=>', candidate);
              loaded++;
              if (loaded === shortlistWithDetails.length) {
                this.shortlistedCandidates = shortlistWithDetails;
                console.log('Final merged shortlist:', this.shortlistedCandidates);
                this.updatePaginatedShortlisted();
                this.loading = false;
              }
            },
            error: () => {
              loaded++;
              if (loaded === shortlistWithDetails.length) {
                this.shortlistedCandidates = shortlistWithDetails;
                this.updatePaginatedShortlisted();
                this.loading = false;
              }
            }
          });
        } else {
          loaded++;
          if (loaded === shortlistWithDetails.length) {
            this.shortlistedCandidates = shortlistWithDetails;
            this.updatePaginatedShortlisted();
            this.loading = false;
          }
        }
      });
    }, () => { this.loading = false; });
  }

  updatePaginatedShortlisted() {
    const start = (this.shortlistPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    this.paginatedShortlisted = this.shortlistedCandidates.slice(start, end);
  }

  previousShortlistPage() {
    if (this.shortlistPage > 1) {
      this.shortlistPage--;
      this.updatePaginatedShortlisted();
    }
  }

  nextShortlistPage() {
    if (this.shortlistPage * this.itemsPerPage < this.shortlistedCandidates.length) {
      this.shortlistPage++;
      this.updatePaginatedShortlisted();
    }
  }

  removeFromShortlist(id: string) {
    this.shortlistService.delete(id).subscribe(() => {
      this.fetchShortlistedCandidates();
    });
  }


}