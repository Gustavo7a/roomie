import {Component, inject} from '@angular/core';
import {CommonModule} from '@angular/common';
import {Auth} from '../auth/auth';
import {Router} from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {
  private auth = inject(Auth);
  private router = inject(Router);

  onLogout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
