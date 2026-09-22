import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot, UrlTree, provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideToastr } from 'ngx-toastr';

import { roleGuard } from './role.guard';
import { AuthService } from '../services/auth.service';

describe('roleGuard', () => {
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let router: Router;

  const state = { url: '/catalog' } as RouterStateSnapshot;

  function routeWithRoles(roles: string[]): ActivatedRouteSnapshot {
    return { data: { roles } } as unknown as ActivatedRouteSnapshot;
  }

  beforeEach(() => {
    authServiceSpy = jasmine.createSpyObj('AuthService', ['isAuthenticated', 'hasRole']);

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideRouter([]),
        provideToastr(),
        { provide: AuthService, useValue: authServiceSpy }
      ]
    });
    router = TestBed.inject(Router);
  });

  it('allows access when the user is authenticated and has an allowed role', () => {
    authServiceSpy.isAuthenticated.and.returnValue(true);
    authServiceSpy.hasRole.and.returnValue(true);

    const result = TestBed.runInInjectionContext(() => roleGuard(routeWithRoles(['ADMIN', 'OPERATOR']), state));

    expect(result).toBeTrue();
    expect(authServiceSpy.hasRole).toHaveBeenCalledWith(['ADMIN', 'OPERATOR']);
  });

  it('redirects to /login when the user is authenticated but lacks an allowed role', () => {
    authServiceSpy.isAuthenticated.and.returnValue(true);
    authServiceSpy.hasRole.and.returnValue(false);

    const result = TestBed.runInInjectionContext(() => roleGuard(routeWithRoles(['ADMIN']), state)) as UrlTree;

    expect(result instanceof UrlTree).toBeTrue();
    expect(router.serializeUrl(result)).toBe('/login?returnUrl=%2Fcatalog');
  });

  it('redirects to /login when the user is not authenticated', () => {
    authServiceSpy.isAuthenticated.and.returnValue(false);

    const result = TestBed.runInInjectionContext(() => roleGuard(routeWithRoles(['ADMIN']), state)) as UrlTree;

    expect(result instanceof UrlTree).toBeTrue();
    expect(authServiceSpy.hasRole).not.toHaveBeenCalled();
  });
});
