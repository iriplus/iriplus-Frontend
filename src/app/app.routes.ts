import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { HomeComponent } from './components/home/home.component';
import { ForgotPasswordComponent } from './components/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './components/reset-password/reset-password.component';
import { MainLayout } from './layouts/main-layout/main-layout';
import { AuthLayout } from './layouts/auth-layout/auth-layout';
import { PublicHome } from './components/public-home/public-home.component';
import { authGuard, privateGuard, roleGuard } from './guards/auth.guard';
import { MyProfileComponent } from './components/my-profile/my-profile.component';
import { TeachersComponent } from './components/teachers/teachers.component';
import { ClassesComponent } from './components/classes/classes.component';
import { LevelsComponent } from './components/levels/levels.component';
import { GenerateExamComponent } from './components/generate-exam/generate-exam.component';
import { ExamsComponent } from './components/exams/exams.component';
import { ExamReviewComponent } from './components/exam-review/exam-review.component';
import { UserType } from './interfaces/user.interface';
import { ExamReviseComponent } from './components/exam-revise/exam-revise.component';
import { ExamResolveComponent } from './components/exam-resolve/exam-resolve.component';
import { ViewExamComponent } from './components/view-exam/view-exam.component';
import { StudentsComponent } from './components/students/students.component';

export const routes: Routes = [
  {
    path: '',
    component: MainLayout,
    children: [
      { path: '', component: PublicHome },

      { path: 'home', component: HomeComponent, canActivate: [privateGuard] },
      { path: 'my-profile', component: MyProfileComponent, canActivate: [privateGuard] },
      { path: 'exam', component: ExamsComponent, canActivate: [privateGuard] },

      {
        path: 'generate-exam',
        component: GenerateExamComponent,
        canActivate: [roleGuard],
        data: { allowedRoles: [UserType.TEACHER, UserType.COORDINATOR] }
      },

      {
        path: 'teachers',
        component: TeachersComponent,
        canActivate: [roleGuard],
        data: { allowedRoles: [UserType.COORDINATOR] }
      },
      {
        path: 'classes',
        component: ClassesComponent,
        canActivate: [roleGuard],
        data: { allowedRoles: [UserType.COORDINATOR, UserType.TEACHER] }
      },
      {
        path: 'levels',
        component: LevelsComponent,
        canActivate: [roleGuard],
        data: { allowedRoles: [UserType.COORDINATOR] }
      },
      {
        path: 'exam-review/:id',
        component: ExamReviewComponent,
        canActivate: [roleGuard],
        data: { allowedRoles: [UserType.COORDINATOR] }
      },
      {
        path: 'exam-revise/:id',
        component: ExamReviseComponent,
        canActivate: [roleGuard],
        data: { allowedRoles: [UserType.TEACHER] }
      },
      {
        path: 'exam-resolve/:id',
        component: ExamResolveComponent,
        canActivate: [roleGuard],
        data: { allowedRoles: [UserType.STUDENT] }
      },
      {
        path: 'view-exam/:id',
        component: ViewExamComponent,
        canActivate: [roleGuard],
        data: { allowedRoles: [UserType.STUDENT, UserType.TEACHER, UserType.COORDINATOR] }
      },
      {
        path: 'students',
        component: StudentsComponent,
        canActivate: [roleGuard],
        data: { allowedRoles: [UserType.COORDINATOR, UserType.TEACHER] }
      }
    ]
  },
  {
    path: '',
    component: AuthLayout,
    children: [
      { path: 'login', component: LoginComponent, canActivate: [authGuard] },
      { path: 'register', component: RegisterComponent, canActivate: [authGuard] },
      { path: 'forgot-password', component: ForgotPasswordComponent, canActivate: [authGuard] },
      { path: 'reset-password', component: ResetPasswordComponent, canActivate: [authGuard] }
    ]
  },
  { path: '**', redirectTo: '' }
];