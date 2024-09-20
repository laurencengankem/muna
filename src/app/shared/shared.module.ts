import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxSpinnerModule } from 'ngx-spinner';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    NgxSpinnerModule
  ],
  exports: [
    NgxSpinnerModule
  ]
})
export class SharedModule {}
