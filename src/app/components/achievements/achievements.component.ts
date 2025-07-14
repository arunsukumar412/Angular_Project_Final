import { Component, AfterViewInit, ElementRef, QueryList, ViewChildren } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-achievements',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './achievements.component.html',
  styleUrls: ['./achievements.component.css']
})
export class AchievementsComponent implements AfterViewInit {
  // Modal state
  showModal = false;
  modalTitle = '';
  modalContent = '';

  // Achievement counts
  achievementCount1 = 50;
  achievementCount2 = 25;
  achievementCount3 = 50;
  achievementCount4 = 10;

  // Reference to number elements for animation
  @ViewChildren('animateNumber') numberElements!: QueryList<ElementRef<HTMLElement>>;

  // Achievement data
  achievements = [
    {
      title: '50+ Successful AI Projects',
      content: "We've delivered over 50 AI projects across industries including healthcare, finance, and manufacturing. Our solutions have helped clients increase efficiency by an average of 40% and reduce costs by 25%."
    },
    {
      title: '25+ Patents in AI Technology',
      content: 'Our research team has been granted 25+ patents for innovative AI algorithms and architectures. These patents cover areas like explainable AI, federated learning, and real-time decision systems.'
    },
    {
      title: '100+ Satisfied Clients Worldwide',
      content: 'From startups to Fortune 500 companies, we’ve partnered with over 100 organizations across 15 countries. Our client retention rate stands at an industry-leading 92%.'
    },
    {
      title: '10+ Prestigious Awards',
      content: "Recognized by leading tech organizations for our groundbreaking work in AI, including the 'AI Innovation of the Year' and 'Best Applied AI Solution' awards."
    }
  ];

  constructor() {
    // Initialize counts
    this.achievementCount1 = 50;
    this.achievementCount2 = 25;
    this.achievementCount3 = 50;
    this.achievementCount4 = 10;
  }

  ngAfterViewInit() {
    // Set up Intersection Observer for number animation
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            this.animateNumbers();
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );

    const achievementsSection = document.getElementById('achievements');
    if (achievementsSection) {
      observer.observe(achievementsSection);
    }
  }

  // Number animation logic
  private animateNumbers() {
    const targets = [50, 25, 100, 10]; // Target counts for each achievement
    this.numberElements.forEach((element, index) => {
      const target = targets[index] || 0;
      const duration = 2000; // Animation duration in ms
      const steps = 50;
      const increment = target / steps;
      let current = 0;

      const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
          clearInterval(timer);
          current = target;
        }
        element.nativeElement.textContent = Math.floor(current) + '+';
      }, duration / steps);
    });

    // Update component properties for display
    this.achievementCount1 = 50;
    this.achievementCount2 = 25;
    this.achievementCount3 = 100;
    this.achievementCount4 = 10;
  }

  // Open modal with achievement details
  openAchievementModal(index: number) {
    this.modalTitle = this.achievements[index].title;
    this.modalContent = this.achievements[index].content;
    this.showModal = true;
    document.body.style.overflow = 'hidden';
  }

  // Close modal
  closeModal() {
    this.showModal = false;
    document.body.style.overflow = '';
  }

  // Handle modal overlay click
  handleOverlayClick(event: MouseEvent) {
    if ((event.target as HTMLElement).classList.contains('modal-overlay')) {
      this.closeModal();
    }
  }
}