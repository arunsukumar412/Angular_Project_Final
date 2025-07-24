import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdminFooterComponent } from './admin-footer.component';
import { By } from '@angular/platform-browser';

describe('AdminFooterComponent', () => {
  let component: AdminFooterComponent;
  let fixture: ComponentFixture<AdminFooterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminFooterComponent], // Assuming it's a standalone component
      // If not standalone, remove imports and add declarations: [AdminFooterComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(AdminFooterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render copyright text', () => {
    const copyrightElement = fixture.debugElement.query(By.css('.copyright'));
    expect(copyrightElement.nativeElement.textContent).toContain('© 2023 GenWorx Jobs Platform. All rights reserved.');
  });

  it('should render footer links', () => {
    const links = fixture.debugElement.queryAll(By.css('.footer-links a'));
    expect(links.length).toBe(3); // Privacy Policy, Terms of Service, Contact Us
    expect(links[0].nativeElement.textContent).toContain('Privacy Policy');
    expect(links[1].nativeElement.textContent).toContain('Terms of Service');
    expect(links[2].nativeElement.textContent).toContain('Contact Us');
  });

  it('should render version', () => {
    const versionElement = fixture.debugElement.query(By.css('.version'));
    expect(versionElement.nativeElement.textContent).toContain('Version 2.4.1');
  });
});