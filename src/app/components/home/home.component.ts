import { Component } from '@angular/core';
import { Router, RouterModule } from "@angular/router";
import { CommonModule, NgIf } from '@angular/common';

@Component({
  selector: 'app-home',
  imports: [RouterModule, CommonModule, NgIf],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {

  constructor(private router: Router) {}

  goTo(path: string): void {
    this.router.navigate([path]);
  }

  // (optional mock)
  userType: 'STUDENT' | 'TEACHER' | 'COORDINATOR' = 'TEACHER';
}

