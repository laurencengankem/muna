import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { CartService } from '../services/cart.service';
import { UserService } from '../services/user.service';

const PUBLIC_ENDPOINT_PREFIXES = ['authenticate', 'prelogin/'];

function isPublicEndpoint(url: string): boolean {
  return PUBLIC_ENDPOINT_PREFIXES.some(prefix => url.includes(prefix));
}

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const cartService = inject(CartService);
  const userService = inject(UserService);
  const toastr = inject(ToastrService);

  const token = localStorage.getItem('access_token');
  const authorizedReq = (token && !isPublicEndpoint(req.url))
    ? req.clone({ setHeaders: { Authorization: 'Bearer ' + token } })
    : req;

  return next(authorizedReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 403) {
        console.error('Access forbidden: 403');
        localStorage.removeItem('access_token');
        localStorage.removeItem('cart');
        localStorage.removeItem('userRole');
        userService.setLoggedUser('');
        userService.setUserRole('');
        cartService.cartItemList = [];
        cartService.setCartItemNumber(0);
        toastr.error('Session Expirée');
        router.navigate(['/login']);
      }
      return throwError(() => error);
    })
  );
};
