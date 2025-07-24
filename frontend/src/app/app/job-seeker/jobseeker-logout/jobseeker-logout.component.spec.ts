import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JobseekerLogoutComponent } from './jobseeker-logout.component';

describe('JobseekerLogoutComponent', () => {
  let component: JobseekerLogoutComponent;
  let fixture: ComponentFixture<JobseekerLogoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JobseekerLogoutComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(JobseekerLogoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
