import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Route } from '@angular/router';
import { RouterModule } from '@angular/router';
@Component({
  selector: 'app-jobs',
  imports: [RouterModule,RouterModule,CommonModule],
  templateUrl: './jobs.component.html',
  styleUrl: './jobs.component.css'
})
export class JobsComponent {

}
