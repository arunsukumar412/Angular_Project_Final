import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TestCredentialsComponent } from './test-credentials.component';

describe('TestCredentialsComponent', () => {
  let component: TestCredentialsComponent;
  let fixture: ComponentFixture<TestCredentialsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestCredentialsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TestCredentialsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
