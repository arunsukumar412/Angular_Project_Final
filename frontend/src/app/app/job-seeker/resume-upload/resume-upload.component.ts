import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { JobseekerSidebarComponent } from '../jobseeker-sidebar/jobseeker-sidebar.component';

interface Resume {
  id: number;
  name: string;
  dateUploaded: Date;
  size: number;
  content: string; // Base64 encoded content for download
}

@Component({
  selector: 'app-resume-upload',
  templateUrl: './resume-upload.component.html',
  styleUrls: ['./resume-upload.component.css'],
  standalone: true,
  imports: [CommonModule, RouterModule, JobseekerSidebarComponent]
})
export class ResumeUploadComponent implements OnInit {
  resumes: Resume[] = [];
  isLoading: boolean = true;
  selectedFile: File | null = null;
  fileError: string | null = null;
  uploadProgress: number = 0;
  dragOver: boolean = false;
  isDarkMode: boolean = false; // Added for dark mode support

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.loadResumes();
  }

  loadResumes(): void {
    // Simulate API call with a delay
    setTimeout(() => {
      // Mock data (replace with actual API call)
      this.resumes = [
        {
          id: 1,
          name: 'John_Doe_Resume_2025.pdf',
          dateUploaded: new Date('2025-06-01'),
          size: 524288, // 0.5 MB
          content: 'data:application/pdf;base64,JVBERi0xL...' // Mock base64 content
        },
        {
          id: 2,
          name: 'John_Doe_Resume_V2.pdf',
          dateUploaded: new Date('2025-05-15'),
          size: 786432, // 0.75 MB
          content: 'data:application/pdf;base64,JVBERi0xL...' // Mock base64 content
        }
      ];
      this.isLoading = false;
    }, 1000); // Simulated loading delay
  }

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.handleFileSelection(input.files[0]);
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.dragOver = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.dragOver = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.dragOver = false;
    if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
      this.handleFileSelection(event.dataTransfer.files[0]);
    }
  }

  triggerFileInput(): void {
    const fileInput = document.getElementById('resumeFile') as HTMLInputElement;
    fileInput.click();
  }

  private handleFileSelection(file: File): void {
    if (file.type !== 'application/pdf') {
      this.fileError = 'Please upload a valid PDF file.';
      this.selectedFile = null;
      return;
    }
    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      this.fileError = 'File size must be less than 5MB.';
      this.selectedFile = null;
      return;
    }
    this.fileError = null;
    this.selectedFile = file;
  }

  uploadResume(): void {
    if (!this.selectedFile) return;

    this.uploadProgress = 10; // Start progress
    const reader = new FileReader();
    reader.onload = () => {
      const interval = setInterval(() => {
        if (this.uploadProgress < 90) {
          this.uploadProgress += 10;
        } else {
          clearInterval(interval);
          this.uploadProgress = 100;
          const newResume: Resume = {
            id: this.resumes.length + 1,
            name: this.selectedFile!.name,
            dateUploaded: new Date(),
            size: this.selectedFile!.size,
            content: reader.result as string
          };
          this.resumes.push(newResume);
          setTimeout(() => {
            this.uploadProgress = 0;
            this.selectedFile = null;
            const input = document.getElementById('resumeFile') as HTMLInputElement;
            if (input) input.value = '';
            alert('Resume uploaded successfully!');
            console.log('Uploading resume:', newResume);
          }, 500); // Simulated save delay
        }
      }, 500);
    };
    reader.readAsDataURL(this.selectedFile);
  }

  downloadResume(resume: Resume): void {
    const link = document.createElement('a');
    link.href = resume.content;
    link.download = resume.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    alert('Resume downloaded successfully!');
  }

  deleteResume(id: number): void {
    if (confirm('Are you sure you want to delete this resume?')) {
      this.resumes = this.resumes.filter(resume => resume.id !== id);
      alert('Resume deleted successfully!');
      console.log('Deleted resume with ID:', id);
    }
  }

  backToPortal(): void {
    this.router.navigate(['/jobseeker-dashboard']);
  }

  toggleDarkMode(): void {
    this.isDarkMode = !this.isDarkMode;
  }
}