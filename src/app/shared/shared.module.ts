// src/app/shared/shared.module.ts

import { NgModule } from '@angular/core';
import { NgxLoadingModule } from 'ngx-loading';

@NgModule({
  imports: [
    NgxLoadingModule.forRoot({
      backdrop: true, // Ensure backdrop is enabled
      backdropColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent black
      backdropBorderRadius: '0', // No border radius
    })
  ],
  exports: [
    NgxLoadingModule
  ]
})
export class SharedModule {}
