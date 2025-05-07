import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  imports: [RouterModule,CommonModule,FormsModule,ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
onSubmit() {
throw new Error('Method not implemented.');
}
togglePasswordVisibility() {
throw new Error('Method not implemented.');
}
currentYear: any;
errorMessage: any;
isLoading: any;
loginForm: any;
passwordStrength: any;
showPassword: any;
toggleMobileMenu() {
throw new Error('Method not implemented.');
}

}
