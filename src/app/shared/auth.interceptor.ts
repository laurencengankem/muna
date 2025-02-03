import { Injectable } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { CartService } from '../services/cart.service';
import { UserService } from '../services/user.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(private router: Router,private cartService: CartService, private userService: UserService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 403) {
          console.error('Access forbidden: 403');
          localStorage.removeItem('access_token');
          localStorage.removeItem('cart');
          this.userService.setLoggedUser('');
          this.cartService.cartItemList=[];
          this.cartService.setCartItemNumber(0);
          window.alert('Session Expirée')
          this.router.navigate(['/login']); 
        }
        throw error;
      })
    );
  }
}
