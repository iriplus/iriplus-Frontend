import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { map } from 'rxjs';

export const authGuard: CanActivateFn = () => {
  const router = inject(Router);
  const auth = inject(AuthService);

  return auth.checkAuth().pipe(
    map(isAuth => isAuth ? router.parseUrl('/home') : true)
  );
};

export const privateGuard: CanActivateFn = () => {
  const router = inject(Router);
  const auth = inject(AuthService);

  return auth.checkAuth().pipe(
    map(isAuth => isAuth ? true : router.parseUrl('/'))
  );
};
