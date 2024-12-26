import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { ToastrModule } from 'ngx-toastr';
import { RouterModule } from '@angular/router';
import { MatDialogModule } from '@angular/material/dialog';



@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    ToastrModule.forRoot({
      timeOut: 2000, // 2 seconds
      positionClass: 'toast-top-center',
      preventDuplicates: true,
      closeButton: false,
      tapToDismiss: false,
      maxOpened: 1
    })
  ],
  exports: [
    CommonModule,
    FormsModule,
    RouterModule,
    ReactiveFormsModule,
    NgxPaginationModule,
    ToastrModule,
  ]
})
export class SharedModule { 
}
