import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JobseekerBannerComponent } from './jobseeker-banner.component';

describe('JobseekerBannerComponent', () => {
  let component: JobseekerBannerComponent;
  let fixture: ComponentFixture<JobseekerBannerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JobseekerBannerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(JobseekerBannerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
