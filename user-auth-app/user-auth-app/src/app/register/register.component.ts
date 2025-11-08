import { Component } from '@angular/core';
import { AuthService, User } from '../auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html'
})
export class RegisterComponent {
  name = '';
  email = '';
  password = '';

  constructor(private auth: AuthService) {}

  register() {
    if (!this.name || !this.email || !this.password) {
      alert('Please fill all fields');
      return;
    }
    const user: User = { name: this.name, email: this.email, password: this.password };
    this.auth.register(user);
  }
}
