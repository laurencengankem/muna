import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { environment } from '../../environments/environment';
import { AuthResponse, UserRole } from '../models/auth.model';

const SESSION_DURATION_MS = 20000000;

const TOKEN_KEY = 'access_token';
const TOKEN_EXPIRY_KEY = 'token_time';
const ROLE_KEY = 'userRole';
const USER_KEY = 'user';
const DISPLAY_NAME_KEY = 'username';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private readonly currentUserSubject = new BehaviorSubject<string>(localStorage.getItem(DISPLAY_NAME_KEY) || '');
  private readonly userRoleSubject = new BehaviorSubject<UserRole>((localStorage.getItem(ROLE_KEY) as UserRole) || '');
  private expiryTimer?: ReturnType<typeof setTimeout>;

  readonly currentUser$: Observable<string> = this.currentUserSubject.asObservable();
  readonly userRole$: Observable<UserRole> = this.userRoleSubject.asObservable();

  constructor(private http: HttpClient, private router: Router, private toastr: ToastrService) {
    if (this.isAuthenticated()) {
      this.scheduleExpiry();
    } else {
      this.clearSession();
    }
  }

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  getUsername(): string | null {
    return localStorage.getItem(USER_KEY);
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) {
      return false;
    }
    const expirationTime = Number(localStorage.getItem(TOKEN_EXPIRY_KEY));
    return !!expirationTime && Date.now() < expirationTime;
  }

  hasRole(allowedRoles: UserRole[]): boolean {
    const role = this.userRoleSubject.value;
    return !!role && allowedRoles.includes(role);
  }

  login(username: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(environment.apiUrl + 'authenticate', { username, password }).pipe(
      tap(res => {
        if (res?.jwttoken) {
          this.establishSession(res.jwttoken, res.role, username);
        }
      })
    );
  }

  logout(redirectTo: string | null = '/login'): void {
    this.clearSession();
    if (redirectTo) {
      this.router.navigate([redirectTo]);
    }
  }

  private establishSession(token: string, role: UserRole, username: string): void {
    const expirationTime = Date.now() + SESSION_DURATION_MS;
    const displayName = username.split('@')[0];

    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(ROLE_KEY, role);
    localStorage.setItem(TOKEN_EXPIRY_KEY, expirationTime.toString());
    localStorage.setItem(USER_KEY, username);
    localStorage.setItem(DISPLAY_NAME_KEY, displayName);

    this.currentUserSubject.next(displayName);
    this.userRoleSubject.next(role);
    this.scheduleExpiry();
  }

  private clearSession(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(ROLE_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(DISPLAY_NAME_KEY);
    localStorage.removeItem(TOKEN_EXPIRY_KEY);
    this.currentUserSubject.next('');
    this.userRoleSubject.next('');
    this.clearExpiryTimer();
  }

  private scheduleExpiry(): void {
    this.clearExpiryTimer();
    const expirationTime = Number(localStorage.getItem(TOKEN_EXPIRY_KEY));
    const delay = expirationTime - Date.now();
    if (delay <= 0) {
      return;
    }
    this.expiryTimer = setTimeout(() => {
      this.toastr.error('Session Expirée');
      this.logout();
    }, delay);
  }

  private clearExpiryTimer(): void {
    if (this.expiryTimer) {
      clearTimeout(this.expiryTimer);
      this.expiryTimer = undefined;
    }
  }
}
