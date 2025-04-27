import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { ResultsComponent } from './results/results.component';
import { ItemDetailsComponent } from './item-details/item-details.component';
import { CartComponent } from './cart/cart.component';
import { ItemListComponent } from './item-list/item-list.component';
import { ItemUpdateComponent } from './item-update/item-update.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { VerificationComponent } from './verification/verification.component';
import { PasswordResetComponent } from './password-reset/password-reset.component';
import { PasswordResetLinkComponent } from './password-reset-link/password-reset-link.component';
import { CheckoutComponent } from './checkout/checkout.component';
import { CreateUserComponent } from './create-user/create-user.component';
import { UserSetupComponent } from './user-setup/user-setup.component';
import { OrderListComponent } from './order-list/order-list.component';
import { ReceiptTestComponent } from './receipt-test/receipt-test.component';
import { DashboardComponent } from './dashboard/dashboard.component';


export const routes: Routes = [
    { path:'',component: HomeComponent},
    { path:'login',component: LoginComponent},
    { path: 'register', component: RegisterComponent},
    { path: 'verification/:email', component: VerificationComponent},
    {path: 'password/reset-link/:code',component: PasswordResetLinkComponent},
    { path:'products/:sex/:category',component: ResultsComponent},
    { path:'products',component: ResultsComponent},
    { path: 'itemdetails/:id', component: ItemDetailsComponent},
    { path: 'cart', component: CartComponent},
    { path: 'checkout/:mode', component: CheckoutComponent},
    { path: 'orderList', component: OrderListComponent},
    { path:'catalog', component: ItemListComponent},
    { path:'create-user', component: CreateUserComponent},
    { path:'user-setup', component: UserSetupComponent},
    { path: 'itemupdate/:id', component: ItemUpdateComponent},
    { path: 'password/reset', component: PasswordResetComponent},
    { path: 'receipt', component: ReceiptTestComponent},
    { path: 'dashboard', component: DashboardComponent},
    { path: '**', component: HomeComponent}
];
