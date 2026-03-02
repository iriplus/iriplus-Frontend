import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { map } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { UserType } from '../interfaces/user.interface';

function buildLoginUrlTree(router: Router, returnUrl: string) {
  return router.createUrlTree(['/login'], {
    queryParams: { returnUrl }
  });
}

export const authGuard: CanActivateFn = () => {
  const router = inject(Router);
  const auth = inject(AuthService);

  return auth.checkAuth().pipe(
    map((isAuth) => (isAuth ? router.createUrlTree(['/home']) : true))
  );
};

export const privateGuard: CanActivateFn = (_route, state) => {
  const router = inject(Router);
  const auth = inject(AuthService);

  return auth.checkAuth().pipe(
    map((isAuth) => {
      if (isAuth) {
        return true;
      }

      return buildLoginUrlTree(router, state.url);
    })
  );
};

export const roleGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const auth = inject(AuthService);

  const allowedRoles = (route.data?.['allowedRoles'] as UserType[] | undefined) ?? [];

  return auth.checkAuth().pipe(
    map((isAuth) => {
      if (!isAuth) {
        return buildLoginUrlTree(router, state.url);
      }

      if (allowedRoles.length === 0) {
        return true;
      }

      const userType = auth.getUserType();

      if (!userType || !allowedRoles.includes(userType)) {
        return router.createUrlTree(['/home']);
      }

      return true;
    })
  );
};