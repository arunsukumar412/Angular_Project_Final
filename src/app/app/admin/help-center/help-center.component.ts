import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { ChatAssistantComponent } from '../../../chat-assistant/chat-assistant.component';
import { Route } from '@angular/router';
import { RouterModule } from '@angular/router';
import { DatePipe } from '@angular/common';

interface FAQ {
  id: number;
  question: string;
  answer: string;
  isOpen: boolean;
}

interface Notification {
  id: number;
  message: string;
  time: string;
  icon: string;
  iconColor: string;
  link: string;
}

@Component({
  selector: 'app-ai-help-center',
  templateUrl: './help-center.component.html',
  styleUrls: ['./help-center.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent, ChatAssistantComponent, RouterModule, DatePipe]
})
export class HelpCenterComponent implements OnInit {
  isSidebarOpen = false;
  showNotificationDropdown = false;
  showUserDropdown = false;
  searchQuery = '';
  today = new Date();
  
  faqs: FAQ[] = [
    {
      id: 1,
      question: 'How do I interact with the GenWorx AI?',
      answer: 'You can ask the AI anything using natural language. Try questions like "How do I configure settings?" or "Show me user analytics". The AI understands context and can guide you through complex tasks.',
      isOpen: false
    },
    {
      id: 2,
      question: 'What can the GenWorx AI assistant do?',
      answer: 'The AI can answer questions, automate tasks, generate reports, troubleshoot issues, and provide personalized recommendations based on your usage patterns and platform data.',
      isOpen: false
    },
    {
      id: 3,
      question: 'How do I customize the AI behavior?',
      answer: 'Navigate to AI Settings in the sidebar to adjust response style, notification preferences, and configure automation rules for your specific workflow needs.',
      isOpen: false
    },
    {
      id: 4,
      question: 'Is my data secure with the AI?',
      answer: 'Yes, all AI interactions are encrypted and follow strict data privacy protocols. The AI only accesses information necessary to complete your requests and never stores sensitive data.',
      isOpen: false
    },
    {
      id: 5,
      question: 'How accurate are the AI responses?',
      answer: 'Our AI maintains 98.7% accuracy for platform-related queries. It continuously learns from interactions and is updated weekly with the latest platform knowledge.',
      isOpen: false
    },
    {
      id: 6,
      question: 'Can the AI automate complex workflows?',
      answer: 'Yes, the AI can automate multi-step processes like user onboarding, report generation, and system configurations. Use the "Automate this" button after any AI response to set up automation.',
      isOpen: false
    }
  ];
  
  filteredFAQs: FAQ[] = [];
  
  notifications: Notification[] = [
    { 
      id: 1, 
      message: 'AI has new recommendations for you', 
      time: '2 minutes ago', 
      icon: 'fa-robot', 
      iconColor: 'text-blue-600', 
      link: '/ai-recommendations' 
    },
    { 
      id: 2, 
      message: 'Your weekly AI analytics report is ready', 
      time: '1 hour ago', 
      icon: 'fa-chart-bar', 
      iconColor: 'text-blue-600', 
      link: '/reports' 
    },
    { 
      id: 3, 
      message: 'AI has detected unusual activity', 
      time: 'Yesterday', 
      icon: 'fa-shield-alt', 
      iconColor: 'text-yellow-500', 
      link: '/security' 
    }
  ];

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.filteredFAQs = [...this.faqs];
  }

  toggleSidebar(): void {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  toggleNotificationDropdown(): void {
    this.showNotificationDropdown = !this.showNotificationDropdown;
    if (this.showNotificationDropdown) {
      this.showUserDropdown = false;
    }
  }

  toggleUserDropdown(): void {
    this.showUserDropdown = !this.showUserDropdown;
    if (this.showUserDropdown) {
      this.showNotificationDropdown = false;
    }
  }

  clearNotifications(): void {
    this.notifications = [];
  }

  filterFAQs(): void {
    if (!this.searchQuery) {
      this.filteredFAQs = [...this.faqs];
      return;
    }
    this.filteredFAQs = this.faqs.filter(faq =>
      faq.question.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(this.searchQuery.toLowerCase())
    );
  }

  toggleFAQ(faq: FAQ): void {
    faq.isOpen = !faq.isOpen;
  }

  contactSupport(): void {
    this.router.navigate(['/contact-support']);
  }

  openChat(): void {
    // This would typically trigger your chat assistant component
    console.log('Opening AI chat interface');
    // Implement your chat opening logic here
  }

  callSupport(): void {
    console.log('Initiating support call');
    // Implement call support logic
  }
}