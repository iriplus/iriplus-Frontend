import { Component } from '@angular/core';
import { Router } from "@angular/router";

@Component({
  selector: 'app-public-home',
  imports: [],
  templateUrl: './public-home.component.html',
  styleUrl: './public-home.component.css'
})
export class PublicHome {
  constructor(
    private router: Router
  ) {}

  navigate(): void{
    this.router.navigate(['/login'])
  }
}
