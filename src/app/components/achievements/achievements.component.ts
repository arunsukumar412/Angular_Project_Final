// achievements.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-achievements',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './achievements.component.html',
  styleUrls: ['./achievements.component.css']
})
export class AchievementsComponent {
  // Modal state
  showModal = false;
  modalTitle = '';
  modalContent = '';

  // Achievement counts
  achievementCount1 = 0;
  achievementCount2 = 0;
  achievementCount3 = 0;
  achievementCount4 = 0;

  constructor() {
    // Initialize counts (you can set these to your actual values)
    this.achievementCount1 = 50;
    this.achievementCount2 = 25;
    this.achievementCount3 = 100;
    this.achievementCount4 = 10;
  }

  // Partner modal methods
  openPartnerModal(title: string, content: string) {
    this.modalTitle = title;
    this.modalContent = content;
    this.showModal = true;
  }

  // Achievement modal methods
  openAchievementModal(title: string, content: string) {
    this.modalTitle = title;
    this.modalContent = content;
    this.showModal = true;
  }

  // Close modal
  closeModal() {
    this.showModal = false;
  }
}