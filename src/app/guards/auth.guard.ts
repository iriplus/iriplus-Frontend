import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { map } from 'rxjs';
import { UserType } from '../interfaces/user.interface';

export const authGuard: CanActivateFn = () => {
  const router = inject(Router);
  const auth = inject(AuthService);

  return auth.checkAuth().pipe(
    map(isAuth => isAuth ? router.parseUrl('/home') : true)
  );
};

export const privateGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const auth = inject(AuthService);

  return auth.checkAuth().pipe(
    map(isAuth => {
      if (isAuth) return true;
      return router.createUrlTree(['/login'], {
        queryParams: { returnUrl: state.url }
      });
    })
  );
};

export const coordinatorGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const auth = inject(AuthService);

  return auth.checkAuth().pipe(
    map(isAuth => {
      if (!isAuth) {
        return router.createUrlTree(['/login'], {
          queryParams: { returnUrl: state.url }
        });
      }

      if (auth.getUserType() !== UserType.COORDINATOR) {
        return router.createUrlTree(['/home']);
      }

      return true;
    })
  );
};

export const teacherGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const auth = inject(AuthService);

  return auth.checkAuth().pipe(
    map(isAuth => {
      if (!isAuth) {
        return router.createUrlTree(['/login'], {
          queryParams: { returnUrl: state.url }
        });
      }

      if (auth.getUserType() !== UserType.TEACHER) {
        return router.createUrlTree(['/home']);
      }

      return true;
    })
  );
};