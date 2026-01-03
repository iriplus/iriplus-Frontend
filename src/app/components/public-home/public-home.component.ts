import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-public-home',
  standalone: true,
  templateUrl: './public-home.component.html',
  styleUrls: ['./public-home.component.css']
})
export class PublicHome {

  constructor(private router: Router) {}

  navigate(path: 'login' | 'register'): void {
    this.router.navigate([path]);
  }
}
