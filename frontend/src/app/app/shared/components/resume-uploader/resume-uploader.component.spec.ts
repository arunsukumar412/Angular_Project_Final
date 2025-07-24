import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResumeUploaderComponent } from './resume-uploader.component';

describe('ResumeUploaderComponent', () => {
  let component: ResumeUploaderComponent;
  let fixture: ComponentFixture<ResumeUploaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResumeUploaderComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ResumeUploaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
