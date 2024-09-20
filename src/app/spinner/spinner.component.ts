import { Component, OnInit } from '@angular/core';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';  // Import the spinner module and service

@Component({
  selector: 'app-spinner',
  templateUrl: './spinner.component.html',
  styleUrls: ['./spinner.component.css'],
  standalone: true,   // Declare this as a standalone component
  imports: [NgxSpinnerModule]   // Import the NgxSpinnerModule directly here
})
export class SpinnerComponent {

  constructor(private spinner: NgxSpinnerService) {}

  showSpinner() {
    this.spinner.show();
  }

  hideSpinner() {
    this.spinner.hide();
  }
}
