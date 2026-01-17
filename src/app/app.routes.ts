import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { HomeComponent } from './components/home/home.component';
import { ForgotPasswordComponent } from './components/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './components/reset-password/reset-password.component';
import { MainLayout } from './layouts/main-layout/main-layout';
import { AuthLayout } from './layouts/auth-layout/auth-layout';
import { PublicHome } from './components/public-home/public-home.component';
import { authGuard, privateGuard, coordinatorGuard } from './guards/auth.guard';
import { MyProfileComponent } from './components/my-profile/my-profile.component';
import { TeachersComponent } from './components/teachers/teachers.component';
import { ClassesComponent } from './components/classes/classes.component';

export const routes: Routes = [
  {
    path: '',
    component: AuthLayout,
    children: [
      { path: '', component: PublicHome },
      { path: 'login', component: LoginComponent, canActivate: [authGuard] },
      { path: 'register', component: RegisterComponent },
      { path: 'forgot-password', component: ForgotPasswordComponent },
      { path: 'reset-password', component: ResetPasswordComponent },
    ],
  },
  {
    path: '',
    component: MainLayout,
    canActivate: [privateGuard],
    children: [
      { path: 'home', component: HomeComponent },
      { path: 'my-profile', component: MyProfileComponent},
      { path: 'teachers', component: TeachersComponent, canActivate: [coordinatorGuard]},
      { path: 'classes', component: ClassesComponent, canActivate: [coordinatorGuard]}
    ],
  },
  
  { path: '**', redirectTo: '' },
];

