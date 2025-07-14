import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ChatAssistantComponent } from "../../../chat-assistant/chat-assistant.component";

@Component({
  selector: 'app-home-page',
  imports: [CommonModule, RouterModule],
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.css']
})
export class HomePageComponent implements OnInit {
  showMobileMenu = false;
  showPopup = false;
  popupContent = '';
mobileMenuOpen: any;

  constructor() { }

  ngOnInit(): void {
  }

  toggleMobileMenu(): void {
    this.showMobileMenu = !this.showMobileMenu;
  }

  openPopup(type: string): void {
    this.showPopup = true;
    switch(type) {
      case 'about':
        this.popupContent = 'about';
        break;
      case 'jobs':
        this.popupContent = 'jobs';
        break;
      // Add other cases as needed
      default:
        this.popupContent = 'default';
    }
  }

  closePopup(): void {
    this.showPopup = false;
  }
}