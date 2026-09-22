import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { CartService } from '../services/cart.service';
import { AuthService } from '../services/auth.service';

const PUBLIC_ENDPOINT_PREFIXES = ['authenticate', 'prelogin/'];

function isPublicEndpoint(url: string): boolean {
  return PUBLIC_ENDPOINT_PREFIXES.some(prefix => url.includes(prefix));
}

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const cartService = inject(CartService);
  const toastr = inject(ToastrService);

  const token = authService.getToken();
  const authorizedReq = (token && !isPublicEndpoint(req.url))
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(authorizedReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 403) {
        console.error('Access forbidden: 403');
        localStorage.removeItem('cart');
        cartService.cartItemList = [];
        cartService.setCartItemNumber(0);
        toastr.error('Session Expirée');
        authService.logout();
      }
      return throwError(() => error);
    })
  );
};
