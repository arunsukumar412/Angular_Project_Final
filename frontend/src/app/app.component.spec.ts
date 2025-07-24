import { TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RegisterComponent } from './app/auth/register/register.component';

describe('AppComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        HttpClientTestingModule,
        FormsModule,
        ReactiveFormsModule,
        BrowserAnimationsModule,
        AppComponent,
        RegisterComponent
      ],
      // If you're using standalone components (which seems likely from your imports),
      // you don't need declarations, just import the components directly
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it(`should have the 'Genworx-Job' title`, () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app.title).toEqual('Genworx-Job');
  });

  it('should render title', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('Hello, Genworx-Job');
  });

  // Add additional tests for your signup form components if needed
  describe('SignupFormComponent', () => {
    it('should create the signup form component', () => {
      const fixture = TestBed.createComponent(RegisterComponent);
      const component = fixture.componentInstance;
      expect(component).toBeTruthy();
    });

    it('should initialize with step 1', () => {
      const fixture = TestBed.createComponent(RegisterComponent);
      const component = fixture.componentInstance as RegisterComponent;
      expect(component.currentStep).toBe(1);
    });
  });
});