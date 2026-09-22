import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  public orderPageNum = new BehaviorSubject<number>(1);

  constructor(private authService: AuthService) { }

  getOrderPageNum(): Observable<number> {
    return this.orderPageNum.asObservable();
  }

  setOrderPageNum(pageNumber: number): void {
    this.orderPageNum.next(pageNumber);
  }

  isUserlogged(): boolean {
    return this.authService.isAuthenticated();
  }

  getUser(): string | null {
    return this.authService.getUsername();
  }
}
