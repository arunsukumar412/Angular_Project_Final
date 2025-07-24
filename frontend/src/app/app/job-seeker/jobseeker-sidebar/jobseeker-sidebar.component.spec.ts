import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JobseekerSidebarComponent } from './jobseeker-sidebar.component';

describe('JobseekerSidebarComponent', () => {
  let component: JobseekerSidebarComponent;
  let fixture: ComponentFixture<JobseekerSidebarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JobseekerSidebarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(JobseekerSidebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
