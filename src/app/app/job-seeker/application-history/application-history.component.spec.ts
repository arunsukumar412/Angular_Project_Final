import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApplicationHistoryComponent } from './application-history.component';

describe('ApplicationHistoryComponent', () => {
  let component: ApplicationHistoryComponent;
  let fixture: ComponentFixture<ApplicationHistoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ApplicationHistoryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ApplicationHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
