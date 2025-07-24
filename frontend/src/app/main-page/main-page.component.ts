import { Component } from '@angular/core';
import { HomePageComponent } from "../app/home-page/home-page/home-page.component";
import { AboutUsComponent } from "../components/about-us/about-us.component";
import { AchievementsComponent } from "../components/achievements/achievements.component";
import { JobsComponent } from "../components/jobs/jobs.component";
import { LoginComponent } from "../app/auth/login/login.component";
import { FooterComponent } from "../components/footer/footer.component";

@Component({
  selector: 'app-main-page',
  standalone:true,
  imports: [HomePageComponent, AboutUsComponent, AchievementsComponent, JobsComponent, FooterComponent],
  templateUrl: './main-page.component.html',
  styleUrl: './main-page.component.css'
})
export class MainPageComponent {

}
