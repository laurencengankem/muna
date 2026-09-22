import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Router, provideRouter } from '@angular/router';
import { provideToastr } from 'ngx-toastr';

import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  let router: Router;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([]), provideToastr()]
    });
    router = TestBed.inject(Router);
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('isAuthenticated() should return false when no token exists', () => {
    expect(service.isAuthenticated()).toBeFalse();
  });

  it('hasRole() should return false when there is no role set', () => {
    expect(service.hasRole(['ADMIN', 'OPERATOR'])).toBeFalse();
  });

  it('login() should establish a session and update state on a successful response', () => {
    let emittedUser = '';
    service.currentUser$.subscribe(user => emittedUser = user);

    service.login('jane.doe@example.com', 'secret').subscribe();

    const req = httpMock.expectOne(environment.apiUrl + 'authenticate');
    expect(req.request.method).toBe('POST');
    req.flush({ jwttoken: 'jwt-123', role: 'ADMIN' });

    expect(service.getToken()).toBe('jwt-123');
    expect(service.isAuthenticated()).toBeTrue();
    expect(service.hasRole(['ADMIN'])).toBeTrue();
    expect(emittedUser).toBe('jane.doe');
  });

  it('logout() should clear the stored session and navigate to /login by default', () => {
    const navigateSpy = spyOn(router, 'navigate');

    service.login('jane.doe@example.com', 'secret').subscribe();
    httpMock.expectOne(environment.apiUrl + 'authenticate').flush({ jwttoken: 'jwt-123', role: 'ADMIN' });
    expect(service.isAuthenticated()).toBeTrue();

    service.logout();

    expect(service.isAuthenticated()).toBeFalse();
    expect(localStorage.getItem('access_token')).toBeNull();
    expect(localStorage.getItem('userRole')).toBeNull();
    expect(navigateSpy).toHaveBeenCalledWith(['/login']);
  });

  it('logout() should navigate to a custom route when provided', () => {
    const navigateSpy = spyOn(router, 'navigate');

    service.logout('/home');

    expect(navigateSpy).toHaveBeenCalledWith(['/home']);
  });
});

describe('AuthService (bootstrapped with an already-valid session)', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem('access_token', 'a-valid-token');
    localStorage.setItem('token_time', (Date.now() + 100000).toString());
    localStorage.setItem('userRole', 'ADMIN');

    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([]), provideToastr()]
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('isAuthenticated() should return true when a token exists and has not expired', () => {
    expect(service.isAuthenticated()).toBeTrue();
  });

  it('hasRole() should reflect the role restored from storage', () => {
    expect(service.hasRole(['ADMIN'])).toBeTrue();
    expect(service.hasRole(['OPERATOR'])).toBeFalse();
  });
});

describe('AuthService (bootstrapped with an expired session)', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem('access_token', 'a-stale-token');
    localStorage.setItem('token_time', (Date.now() - 1000).toString());

    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([]), provideToastr()]
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('isAuthenticated() should return false and the stale session should be cleared', () => {
    expect(service.isAuthenticated()).toBeFalse();
    expect(localStorage.getItem('access_token')).toBeNull();
  });
});
