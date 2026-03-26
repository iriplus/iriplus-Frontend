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
import { NotificationService } from "../../services/notification.service";

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

  errorMessage = '';
  showProfileConfirmModal = false;
  profilePassword = '';
  profilePasswordConfirm = '';
  confirmProfileError = '';
  
  showChangePasswordModal = false;
  currentPassword = '';
  newPassword = '';
  repeatNewPassword = '';
  changePasswordError = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private userService: UserService,
    private levelService: LevelService,
    private classService: ClassService,
    private notificationService: NotificationService
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
    this.classCapacityPercentage = 0;
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
      this.classCapacityPercentage = 0;
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

  private hasProfileChanges(): boolean {
    if (!this.originalData) {
      return false;
    }

    return (
      this.user.name.trim() !== (this.originalData.name ?? '').trim() ||
      this.user.surname.trim() !== (this.originalData.surname ?? '').trim() ||
      this.user.email.trim().toLowerCase() !== (this.originalData.email ?? '').trim().toLowerCase() ||
      this.user.dni.trim() !== (this.originalData.dni ?? '').trim()
    );
  }

  private validateProfileForm(): boolean {
    this.errorMessage = '';

    this.user.name = this.user.name?.trim() ?? '';
    this.user.surname = this.user.surname?.trim() ?? '';
    this.user.email = this.user.email?.trim().toLowerCase() ?? '';
    this.user.dni = this.user.dni?.trim() ?? '';

    if (!this.user.name || !this.user.surname || !this.user.email || !this.user.dni) {
      this.errorMessage = 'All personal information fields are required.';
      return false;
    }

    const emailIsValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.user.email);
    if (!emailIsValid) {
      this.errorMessage = 'Please enter a valid email address.';
      return false;
    }

    const dniLength = this.user.dni.length;
    if (dniLength < 7 || dniLength > 10) {
      this.errorMessage = 'DNI must contain between 7 and 10 characters.';
      return false;
    }

    if (!this.hasProfileChanges()) {
      this.errorMessage = 'No changes detected.';
      return false;
    }

    return true;
  }

  openProfileConfirmModal(): void {
    this.confirmProfileError = '';
    this.profilePassword = '';
    this.profilePasswordConfirm = '';
    this.showProfileConfirmModal = true;
  }

  closeProfileConfirmModal(): void {
    this.showProfileConfirmModal = false;
    this.confirmProfileError = '';
    this.profilePassword = '';
    this.profilePasswordConfirm = '';
  }

  enableEdit(): void {
    this.errorMessage = '';
    this.confirmProfileError = '';
    this.isEditing = true;
  }

  cancelEdit(): void {
    if (this.originalData) {
      this.user = { ...this.originalData };
    }

    this.errorMessage = '';
    this.closeProfileConfirmModal();
    this.isEditing = false;
  }

  onSubmit(event: Event): void {
    event.preventDefault();

    if (!this.user?.id) {
      return;
    }

    if (!this.validateProfileForm()) {
      return;
    }

    this.openProfileConfirmModal();
  }

  confirmProfileUpdate(): void {
    if (!this.user?.id) {
      return;
    }

    this.confirmProfileError = '';

    if (!this.profilePassword || !this.profilePasswordConfirm) {
      this.confirmProfileError = 'Please enter your current password in both fields';
      return;
    }

    if (this.profilePassword !== this.profilePasswordConfirm) {
      this.confirmProfileError = 'Passwords do not match';
      return;
    }

    const emailChanged = this.user.email.trim().toLowerCase() !== (this.originalData?.email ?? '').trim().toLowerCase();

    const updatePayload: Partial<User> = {
      name: this.user.name,
      surname: this.user.surname,
      email: this.user.email,
      dni: this.user.dni,
      passwd: this.profilePassword
    };

    this.userService.updateUser(this.user.id, updatePayload).subscribe({
      next: () => {
        this.closeProfileConfirmModal();
        this.isEditing = false;
        this.errorMessage = '';
        
        if (emailChanged) {
          this.notificationService.show({
            type: 'success',
            title: 'Profile Updated',
            message: 'Your email was updated succesfully. Please verify your new email and sign in again',
            autoCloseMs: 5000,
          });

          this.authService.logout().subscribe({
            next: () => {
              this.router.navigate(['/login'])
            },
            error: () => {
              this.router.navigate(['/login'])
            }
          });

          return;
        }

        this.notificationService.show({
          type: 'success',
          title: 'Profile Updated',
          message: 'Your profile was updated succesfully',
          autoCloseMs: 5000,
        });

        this.loadProfile();
      },
      error: (err) => {
        const isIncorrectPassword = err?.status === 401;

        this.profilePassword = '';
        this.profilePasswordConfirm = '';

        if (!isIncorrectPassword) {
          this.closeProfileConfirmModal();
        }

        this.notificationService.show({
          type: 'error',
          title: 'Operation failed',
          message: err.error?.message || 'Error updating profile. Please try again',
          autoCloseMs: 5000,
        });
      },
    });
  }

  changePassword(): void {
    this.openChangePasswordModal();
  }

  openChangePasswordModal(): void {
    this.changePasswordError = '';
    this.currentPassword = '';
    this.newPassword = '';
    this.repeatNewPassword = '';
    this.showChangePasswordModal = true;
  }

  closeChangePasswordModal(): void {
    this.showChangePasswordModal = false;
    this.changePasswordError = '';
    this.currentPassword = '';
    this.newPassword = '';
    this.repeatNewPassword = '';
  }
confirmChangePassword(): void {
  if (!this.user?.id) {
    return;
  }

  this.changePasswordError = '';

  const currentPassword = this.currentPassword?.trim() ?? '';
  const newPassword = this.newPassword?.trim() ?? '';
  const repeatNewPassword = this.repeatNewPassword?.trim() ?? '';

  if (!currentPassword || !newPassword || !repeatNewPassword) {
    this.changePasswordError = 'All password fields are required.';
    return;
  }

  if (newPassword !== repeatNewPassword) {
    this.changePasswordError = 'New passwords do not match.';
    return;
  }

  if (currentPassword === newPassword) {
    this.changePasswordError = 'The new password must be different from the current password.';
    return;
  }

  this.authService.changePassword({ currentPassword, newPassword }).subscribe({
    next: () => {
      this.closeChangePasswordModal();

      this.notificationService.show({
        type: 'success',
        title: 'Password Updated',
        message: 'Your password was updated successfully. Please sign in again.',
        autoCloseMs: 5000,
      });

      this.authService.logout().subscribe({
        next: () => {
          this.router.navigate(['/login']);
        },
        error: () => {
          this.router.navigate(['/login']);
        }
      });
    },
    error: (err) => {
      const isIncorrectPassword = err?.status === 401;

      this.currentPassword = '';
      this.newPassword = '';
      this.repeatNewPassword = '';

      if (isIncorrectPassword) {
        this.changePasswordError = err.error?.msg || 'Current password is incorrect.';
        return;
      }

      this.closeChangePasswordModal();

      this.notificationService.show({
        type: 'error',
        title: 'Operation failed',
        message: err.error?.msg || 'Error updating password. Please try again.',
        autoCloseMs: 5000,
      });
    }
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
        this.notificationService.show({
          type: 'success',
          title: 'Operation Successful',
          message: 'Account deleted successfully.',
          autoCloseMs: 5000,
        });

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
        this.notificationService.show({
          type: 'error',
          title: 'Operation Failed',
          message: 'Error deleting account. Please try again.',
          autoCloseMs: 5000,
        });
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

    const code = this.classCodeInput?.trim().toUpperCase();

    if (!code) {
      this.classError = 'Please enter a valid class code.';
      return;
    }

    this.classService.validateClassCode(code).subscribe({
      next: (clazz) => {

        const currentStudents = clazz.students?.length ?? 0;

        if (currentStudents >= clazz.max_capacity) {
          this.classError = 'This class is already full.';
          return;
        }

        if (!this.user?.id) return;

        const updatePayload = {
          student_class_id: clazz.id
        };

        this.userService.updateUser(this.user.id, updatePayload).subscribe({
          next: () => {
                this.user = {
                ...this.user,
                student_class_id: clazz.id
                };

              this.refreshClassInfo(clazz.id);
              this.closeChangeClassModal();
          },
          error: (err) => {
            console.error(err);
            this.classError = 'Error updating class. Please try again.';
          }
        });
      },
      error: (err) => {
        console.error(err);

        if (err.status === 409) {
          this.classError = 'This class is already full.';
        } else if (err.status === 404) {
          this.classError = 'Class code not found.';
        } else {
          this.classError = 'Error validating class. Please try again.';
        }
      }
    });
  }

  refreshClassInfo(classId: number): void {
  this.classService.getClassById(classId).subscribe({
    next: (cls) => {
      this.currentClass = cls;
      this.calculateClassCapacity();
    },
    error: () => {
      this.currentClass = null;
    }
  });
}
}
