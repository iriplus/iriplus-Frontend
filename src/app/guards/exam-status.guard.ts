import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { catchError, map, of, switchMap } from 'rxjs';

import { Status } from '../interfaces/exam.interface';
import { AuthService } from '../services/auth.service';
import { ExamService } from '../services/exam.service';

function buildLoginUrlTree(router: Router, returnUrl: string) {
  return router.createUrlTree(['/login'], {
    queryParams: { returnUrl }
  });
}

export const examStatusGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const auth = inject(AuthService);
  const examService = inject(ExamService);

  const examIdParam = route.paramMap.get('id');
  const allowedExamStatuses =
    (route.data?.['allowedExamStatuses'] as Status[] | undefined) ?? [];

  if (!examIdParam) {
    return of(router.createUrlTree(['/exam']));
  }

  const examId = Number(examIdParam);

  if (!Number.isInteger(examId) || examId <= 0) {
    return of(router.createUrlTree(['/exam']));
  }

  return auth.checkAuth().pipe(
    switchMap((isAuth) => {
      if (!isAuth) {
        return of(buildLoginUrlTree(router, state.url));
      }

      if (allowedExamStatuses.length === 0) {
        return of(true);
      }

      return examService.getFullExam(examId).pipe(
        map((exam) => {
          if (allowedExamStatuses.includes(exam.status)) {
            return true;
          }

          return router.createUrlTree(['/exam']);
        }),
        catchError(() => of(router.createUrlTree(['/exam'])))
      );
    })
  );
};