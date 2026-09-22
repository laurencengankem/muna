import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { UserRole } from '../models/auth.model';

export const roleGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const allowedRoles = (route.data['roles'] as UserRole[]) ?? [];

  if (authService.isAuthenticated() && authService.hasRole(allowedRoles)) {
    return true;
  }

  // Matches the previous component-level checks: any authorization failure
  // (not logged in, or logged in with an insufficient role) sends the user
  // to the login page, carrying the originally requested URL.
  return router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
};
