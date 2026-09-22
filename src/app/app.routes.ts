import { Routes } from '@angular/router';
import { roleGuard } from './shared/role.guard';

const STAFF_ROLES = ['ADMIN', 'OPERATOR'];
const ADMIN_ROLES = ['ADMIN'];

export const routes: Routes = [
    // Public / shop browsing
    { path:'', loadComponent: () => import('./home/home.component').then(m => m.HomeComponent)},
    { path:'products/:sex/:category', loadComponent: () => import('./results/results.component').then(m => m.ResultsComponent)},
    { path:'products', loadComponent: () => import('./results/results.component').then(m => m.ResultsComponent)},
    { path: 'itemdetails/:id', loadComponent: () => import('./item-details/item-details.component').then(m => m.ItemDetailsComponent)},
    { path: 'cart', loadComponent: () => import('./cart/cart.component').then(m => m.CartComponent)},
    { path: 'receipt', loadComponent: () => import('./receipt-test/receipt-test.component').then(m => m.ReceiptTestComponent)},

    // Public / auth
    { path:'login', loadComponent: () => import('./login/login.component').then(m => m.LoginComponent)},
    { path: 'register', loadComponent: () => import('./register/register.component').then(m => m.RegisterComponent)},
    { path: 'verification/:email', loadComponent: () => import('./verification/verification.component').then(m => m.VerificationComponent)},
    { path: 'password/reset', loadComponent: () => import('./password-reset/password-reset.component').then(m => m.PasswordResetComponent)},
    { path: 'password/reset-link/:code', loadComponent: () => import('./password-reset-link/password-reset-link.component').then(m => m.PasswordResetLinkComponent)},

    // Staff (ADMIN or OPERATOR)
    { path: 'checkout/:mode', loadComponent: () => import('./checkout/checkout.component').then(m => m.CheckoutComponent), canActivate: [roleGuard], data: { roles: STAFF_ROLES } },
    { path: 'orderList', loadComponent: () => import('./order-list/order-list.component').then(m => m.OrderListComponent), canActivate: [roleGuard], data: { roles: STAFF_ROLES } },
    { path:'catalog', loadComponent: () => import('./item-list/item-list.component').then(m => m.ItemListComponent), canActivate: [roleGuard], data: { roles: STAFF_ROLES } },
    { path: 'itemupdate/:id', loadComponent: () => import('./item-update/item-update.component').then(m => m.ItemUpdateComponent), canActivate: [roleGuard], data: { roles: STAFF_ROLES } },

    // Admin only
    { path:'create-user', loadComponent: () => import('./create-user/create-user.component').then(m => m.CreateUserComponent), canActivate: [roleGuard], data: { roles: ADMIN_ROLES } },
    { path:'user-setup', loadComponent: () => import('./user-setup/user-setup.component').then(m => m.UserSetupComponent), canActivate: [roleGuard], data: { roles: ADMIN_ROLES } },
    { path: 'dashboard', loadComponent: () => import('./dashboard/dashboard.component').then(m => m.DashboardComponent), canActivate: [roleGuard], data: { roles: ADMIN_ROLES } },

    { path: '**', loadComponent: () => import('./home/home.component').then(m => m.HomeComponent)}
];
