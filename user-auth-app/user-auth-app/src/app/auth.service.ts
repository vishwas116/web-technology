import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

export interface User {
  name: string;
  email: string;
  password: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  constructor(private router: Router) {}

  register(user: User) {
    localStorage.setItem('user', JSON.stringify(user));
    alert('Registered successfully!');
    this.router.navigate(['/login']);
  }

  login(email: string, password: string) {
    const raw = localStorage.getItem('user');
    const storedUser: User | null = raw ? JSON.parse(raw) : null;
    if (storedUser && storedUser.email === email && storedUser.password === password) {
      localStorage.setItem('loggedInUser', JSON.stringify(storedUser));
      this.router.navigate(['/profile']);
    } else {
      alert('Invalid credentials!');
    }
  }

  getLoggedInUser(): User | null {
    const raw = localStorage.getItem('loggedInUser');
    return raw ? JSON.parse(raw) as User : null;
  }

  logout() {
    localStorage.removeItem('loggedInUser');
    this.router.navigate(['/login']);
  }
}
