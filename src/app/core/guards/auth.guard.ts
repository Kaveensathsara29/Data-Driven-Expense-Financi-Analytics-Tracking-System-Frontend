import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthSessionService } from '../services/auth-session.service';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const authSession = inject(AuthSessionService);

  // Purely in-memory session check (no localStorage exposure)
  if (authSession.hasToken()) {
    return true;
  }

  router.navigate(['/auth']);
  return false;
};
