import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { Router } from "@angular/router";
import { User } from '../../interfaces/user.interface';
import { AuthService } from "../../services/auth.service";
import { UserService } from "../../services/user.service";
import { Level } from "../../interfaces/level.interface";
import { Class } from "../../interfaces/class.interface";
import { LevelService } from "../../services/level.service";
import { ClassService } from "../../services/class.service";

@Component({
  selector: 'app-my-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './my-profile.component.html',
  styleUrls: ['./my-profile.component.css']
})
export class MyProfileComponent implements OnInit {

  user!: User;

  originalData: User | null = null;

  isEditing = false;
  showDeleteModal = false;

  accumulatedXp = 0;

  levels: Level[] = [];
  currentLevel: Level | null = null;
  nextLevel: Level | null = null;

  totalLevels = 0;
  currentLevelIndex = 0;
  progressPercentage = 0;
  xpToNextLevel = 0;

  currentClass: Class | null = null;
  classCapacityPercentage = 0;

  showChangeClassModal = false;
  classSearchTerm = '';
  classes: Class[] = [];
  filteredClasses: Class[] = [];
  selectedClassId: number | null = null;

  classCodeInput: string = '';
  classError: string = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private userService: UserService,
    private levelService: LevelService,
    private classService: ClassService
  ) {}

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {
    this.authService.loadMe().subscribe(user => {
      console.log('USER FROM BACKEND:', user);
      if (!user) return;
      this.user = user;
      this.saveOriginalData();


      if (this.isStudent) {
        this.loadStudentAcademicData();
      }
    });
  }

  loadStudentAcademicData(): void {
    this.loadLevelsAndCalculateProgress();

    if (!this.user.student_class_id) {
      this.currentClass = null;
      return;
    }

    this.classService.getClassById(this.user.student_class_id).subscribe({
      next: (cls) => {
        this.currentClass = cls;
        this.calculateClassCapacity();
      },
      error: (err) => {
        console.error('Error loading class', err);
        this.currentClass = null;
      }
    });
  }

  calculateClassCapacity(): void {
    if (!this.currentClass) {
      this.classCapacityPercentage = 0;
      return;
    }
    
    this.classCapacityPercentage =
      ((this.currentClass.students?.length ?? 0) / this.currentClass.max_capacity) * 100;
  }

  loadLevelsAndCalculateProgress(): void {
    this.accumulatedXp = this.user.accumulated_xp ?? 0;

    this.levelService.getLevels().subscribe(levels => {
      this.levels = [...levels].sort((a, b) => a.min_xp - b.min_xp);
      this.totalLevels = this.levels.length;

      this.resolveCurrentAndNextLevel();
      this.calculateProgress();
    });
  }

  resolveCurrentAndNextLevel(): void {
    let currentIndex = 0;

    for (let i = 0; i < this.levels.length; i++) {
      if (this.accumulatedXp >= this.levels[i].min_xp) {
        currentIndex = i;
      }
    }

    this.currentLevelIndex = currentIndex;
    this.currentLevel = this.levels[currentIndex] ?? null;
    this.nextLevel = this.levels[currentIndex + 1] ?? null;
  }

  calculateProgress(): void {
    console.log({
      accumulatedXp: this.accumulatedXp,
      currentLevel: this.currentLevel?.min_xp,
      nextLevel: this.nextLevel?.min_xp,
      levelRange: this.nextLevel!.min_xp - this.currentLevel!.min_xp,
      currentProgress: this.accumulatedXp - this.currentLevel!.min_xp
    });
    
    if (!this.currentLevel) {
      this.progressPercentage = 0;
      this.xpToNextLevel = 0;
      return;
    }

    if (!this.nextLevel) {
      this.progressPercentage = 100;
      this.xpToNextLevel = 0;
      return;
    }

    const levelRange = this.nextLevel.min_xp - this.currentLevel.min_xp;
    const currentProgress = this.accumulatedXp - this.currentLevel.min_xp;

    this.progressPercentage = Math.min(
      (currentProgress / levelRange) * 100,
      100
    );

    this.xpToNextLevel = this.nextLevel.min_xp - this.accumulatedXp;
  }

  saveOriginalData(): void {
    this.originalData = { ...this.user };
  }

  enableEdit(): void {
    this.isEditing = true;
  }

  cancelEdit(): void {
    if (this.originalData) {
      this.user = { ...this.originalData };
    }
    this.isEditing = false;
  }

  onSubmit(event: Event): void {
    event.preventDefault();

    if (!this.user?.id) return;

    const updatePayload = {
      name: this.user.name,
      surname: this.user.surname,
      email: this.user.email,
      dni: this.user.dni
    };

    this.userService.updateUser(this.user.id, updatePayload).subscribe({
      next: () => {
        this.loadProfile();
        this.isEditing = false;
      },
      error: (err) => console.error(err)
    });
  }

  changePassword(): void {
    this.router.navigate(['/forgot-password'], {
      queryParams: { mode: 'change' }
    });
  }

  confirmDeleteAccount(): void {
    this.showDeleteModal = true;
  }

  closeDeleteModal(): void {
    this.showDeleteModal = false;
  }

  deleteAccount(): void {
    if (!this.user?.id) return;

    this.userService.deleteUser(this.user.id).subscribe({
      next: () => {
        this.showDeleteModal = false;

        this.authService.logout().subscribe({
          next: () => {
            this.router.navigate(['/login']);
          },
          error: (err) => {
            console.error('Logout error:', err);
            this.router.navigate(['/login']);
          }
        });
      },
      error: (err) => {
        console.error('Delete error:', err);
        alert('Error deleting account. Please try again.');
      }
    });
  }

  get isStudent(): boolean {
    return this.authService.getUserType() === 'Student';
  }

  get isTeacher(): boolean {
    return this.authService.getUserType() === 'Teacher';
  }

  openChangeClassModal(): void {
    this.showChangeClassModal = true;
    this.classCodeInput = ''; 
    this.classError = ''; 
  }

  closeChangeClassModal(): void {
    this.showChangeClassModal = false;
    this.classCodeInput = '';
    this.classError = '';
  }

confirmChangeClass(): void {
  this.classError = '';

  const classCode = this.classCodeInput?.trim();

  if (!classCode) {
    this.classError = 'Please enter a class code';
    return;
  }

  if (!this.user?.id) {
    this.classError = 'User not found';
    return;
  }

  this.classService.getClass(classCode).subscribe({
    next: (cls) => {

      if (!cls?.id) {
        this.classError = 'Class not found';
        return;
      }

      this.userService.updateUser(this.user.id, {
        student_class_id: cls.id
      }).subscribe({
        next: () => {
          this.loadProfile();
          this.closeChangeClassModal();
        },
        error: (err) => {
        console.log('Update error:', err);

        if (err.status === 409) {this.classError = err.error?.message || 'Class is full.';}
        else if (err.status === 404) {this.classError = 'Class not found.';} 
        else {this.classError = 'Unexpected error. Please try again.';}
       }
      });
    },
    error: () => {
      this.classError = 'Invalid class code. Please verify and try again.';
    }
  });
}

}