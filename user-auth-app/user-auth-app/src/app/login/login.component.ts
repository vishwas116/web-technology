import { Component } from '@angular/core';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html'
})
export class LoginComponent {
  email = '';
  password = '';

  constructor(private auth: AuthService) {}

  login() {
    if (!this.email || !this.password) {
      alert('Please enter email and password');
      return;
    }
    this.auth.login(this.email, this.password);
  }
}
