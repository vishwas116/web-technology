import { Component, OnInit } from '@angular/core';
import { AuthService, User } from '../auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html'
})
export class ProfileComponent implements OnInit {
  user: User | null = null;

  constructor(private auth: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.user = this.auth.getLoggedInUser();
    if (!this.user) {
      alert('Please login first');
      this.router.navigate(['/login']);
    }
  }

  logout() {
    this.auth.logout();
  }
}
