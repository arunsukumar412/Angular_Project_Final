import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private router: Router) {}

  canActivate(): boolean {
    const email = sessionStorage.getItem('email');
    const password = sessionStorage.getItem('password');

    if (email === 'arunsukumar03@gmail.com' && password === 'admin') {
      return true;
    } else {
      alert('Access denied. Invalid credentials or empty fields.');
      this.router.navigate(['/login']);
      return false;
    }
  }
}
