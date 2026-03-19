import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserType } from '../../interfaces/user.interface';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-footer',
  imports: [ CommonModule ],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css'
})
export class FooterComponent implements OnInit {
  userType: UserType | null = null;

  constructor(
    private authService: AuthService,
  ) {}

  ngOnInit(): void {
    this.loadUser();
  }

  loadUser(): void {
    this.authService.loadMe().subscribe({
      next: (user) => {
        if (!user) {
          return;
        }
        this.userType = user.type;
      },
      error: (err) => {
        console.error('Error loading current user:', err);
      },
    });
  }

  get isStudent(): boolean {
      return this.userType === UserType.STUDENT;
  }
  
  get isTeacher(): boolean {
      return this.userType === UserType.TEACHER;
  }
  
  get isCoordinator(): boolean {
      return this.userType === UserType.COORDINATOR;
  }
}
