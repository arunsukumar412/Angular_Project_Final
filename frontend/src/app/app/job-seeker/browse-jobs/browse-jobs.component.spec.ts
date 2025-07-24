import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BrowseJobsComponent } from './browse-jobs.component';

describe('BrowseJobsComponent', () => {
  let component: BrowseJobsComponent;
  let fixture: ComponentFixture<BrowseJobsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BrowseJobsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BrowseJobsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
