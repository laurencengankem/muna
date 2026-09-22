import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { provideToastr } from 'ngx-toastr';

import { authInterceptor } from './auth.interceptor';
import { environment } from '../../environments/environment';

describe('authInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
        provideRouter([]),
        provideToastr()
      ]
    });
    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  function seedValidToken(): void {
    localStorage.setItem('access_token', 'jwt-123');
    localStorage.setItem('token_time', (Date.now() + 100000).toString());
  }

  it('attaches the JWT to a protected request when a token exists', () => {
    seedValidToken();

    http.get(environment.apiUrl + 'item/getAllItems').subscribe();

    const req = httpMock.expectOne(environment.apiUrl + 'item/getAllItems');
    expect(req.request.headers.get('Authorization')).toBe('Bearer jwt-123');
    req.flush({});
  });

  it('does not attach a JWT to the public authenticate endpoint, even when a token exists', () => {
    seedValidToken();

    http.post(environment.apiUrl + 'authenticate', { username: 'a', password: 'b' }).subscribe();

    const req = httpMock.expectOne(environment.apiUrl + 'authenticate');
    expect(req.request.headers.has('Authorization')).toBeFalse();
    req.flush({});
  });

  it('does not attach a JWT to public prelogin endpoints', () => {
    seedValidToken();

    http.post(environment.apiUrl + 'prelogin/email/send', {}).subscribe();

    const req = httpMock.expectOne(environment.apiUrl + 'prelogin/email/send');
    expect(req.request.headers.has('Authorization')).toBeFalse();
    req.flush({});
  });

  it('does not attach an Authorization header when no token exists', () => {
    http.get(environment.apiUrl + 'item/getAllItems').subscribe();

    const req = httpMock.expectOne(environment.apiUrl + 'item/getAllItems');
    expect(req.request.headers.has('Authorization')).toBeFalse();
    req.flush({});
  });
});
