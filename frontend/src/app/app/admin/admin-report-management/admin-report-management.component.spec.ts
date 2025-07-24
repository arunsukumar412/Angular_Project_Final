import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminReportManagementComponent } from './admin-report-management.component';

describe('AdminReportManagementComponent', () => {
  let component: AdminReportManagementComponent;
  let fixture: ComponentFixture<AdminReportManagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminReportManagementComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminReportManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
