import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JobReportManagementComponent } from './job-report-management.component';

describe('JobReportManagementComponent', () => {
  let component: JobReportManagementComponent;
  let fixture: ComponentFixture<JobReportManagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JobReportManagementComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(JobReportManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
