import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { HomeComponent } from './components/home/home.component';
import { ForgotPasswordComponent } from './components/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './components/reset-password/reset-password.component';
import { MainLayout } from './layouts/main-layout/main-layout';
import { AuthLayout } from './layouts/auth-layout/auth-layout';
import { PublicHome } from './components/public-home/public-home.component';
import { authGuard, privateGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    component: AuthLayout,
    canActivate: [authGuard],
    children: [
      { path: '', component: PublicHome },
      { path: 'login', component: LoginComponent },
      { path: 'register', component: RegisterComponent },
      { path: 'forgot-password', component: ForgotPasswordComponent },
      { path: 'reset-password', component: ResetPasswordComponent },
    ],
  },
  {
    path: 'home',
    component: MainLayout,
    canActivate: [privateGuard],
    children: [
      { path: '', component: HomeComponent },
    ],
  },

  { path: '**', redirectTo: '' },
];

