import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { ResultsComponent } from './results/results.component';

export const routes: Routes = [
    { path:'',component: HomeComponent},
    { path:'products',component: ResultsComponent}
];
