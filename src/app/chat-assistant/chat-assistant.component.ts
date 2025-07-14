import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';


@Component({
  selector: 'app-chat-assistant',
  templateUrl: './chat-assistant.component.html',
  styleUrls: ['./chat-assistant.component.css'],
  imports: [CommonModule,FormsModule,ReactiveFormsModule]
})
export class ChatAssistantComponent {
  isChatOpen = false;
  newMessage = '';
  selectedFile: File | null = null;
  messages: { text: string; isUser: boolean; timestamp: Date }[] = [];
  isTyping = false;
  quickQuestions = [
    'What are the job openings?',
    'How to apply?',
    'Interview process',
    'Contact HR',
    'Resume tips'
  ];

  toggleChat() {
    this.isChatOpen = !this.isChatOpen;
    if (this.isChatOpen) {
      this.addMessage('Hello! How can I assist you today?', false);
      this.isTyping = false;
    }
  }

  sendMessage() {
    if (this.newMessage.trim() || this.selectedFile) {
      this.addMessage(this.newMessage, true);
      this.newMessage = '';
      this.isTyping = true;
      setTimeout(() => {
        this.addMessage('Thanks for your message! I’m processing it...', false);
        this.isTyping = false;
        if (this.selectedFile) {
          this.addMessage(`File "${this.selectedFile.name}" uploaded successfully!`, false);
          this.selectedFile = null;
        }
      }, 1000); // Simulate response delay
    }
  }

  handleFileUpload(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
    }
  }

  selectQuickQuestion(question: string) {
    this.newMessage = question;
    this.sendMessage();
  }

  clearChat() {
    this.messages = [];
    this.addMessage('Chat history cleared!', false);
  }

  addMessage(text: string, isUser: boolean) {
    this.messages.push({
      text,
      isUser,
      timestamp: new Date()
    });
    setTimeout(() => {
      const chatMessages = document.getElementById('chat-messages');
      if (chatMessages) chatMessages.scrollTop = chatMessages.scrollHeight;
    }, 0);
  }
}