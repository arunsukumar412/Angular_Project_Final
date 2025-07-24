import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InterviewPortalComponent } from './interview-portal.component';

describe('InterviewPortalComponent', () => {
  let component: InterviewPortalComponent;
  let fixture: ComponentFixture<InterviewPortalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InterviewPortalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InterviewPortalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
