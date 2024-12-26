import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { GlobalVariable } from '../global/global';
import { SharedModule } from '../shared/shared.module';
import { NgxSpinnerService } from 'ngx-spinner';


@Component({
  selector: 'app-password-reset',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './password-reset.component.html',
  styleUrl: './password-reset.component.css'
})
export class PasswordResetComponent implements OnInit {

  b: Boolean= false;
  constructor(private router: Router, private http: HttpClient, private spinner: NgxSpinnerService) { }

 fc= new FormControl<string>('bbastien@gmail.com');
  ngOnInit(): void {
    localStorage.setItem("lastUrl",'verification')
  }

  getEmail(){
    let body= {
      "email": this.fc.value
    }
    this.spinner.show();
    this.http.post<Boolean>(`${GlobalVariable.BASE_API_URL}prelogin/passwordReset`, body).subscribe(res =>{
      if(res){
        this.spinner.hide();
        (document.getElementById('link-message') as HTMLElement).innerHTML = 'Check your email for a link to reset your password. If it doesn’t appear within a few minutes, check your spam folder.';
        (document.getElementById('link-message') as HTMLElement).style.color='green';
      }
      else{
        this.spinner.hide();
        (document.getElementById('link-message') as HTMLElement).innerHTML = 'Email not found.';
        (document.getElementById('link-message') as HTMLElement).style.color='red';
      }

    });


  }

}
