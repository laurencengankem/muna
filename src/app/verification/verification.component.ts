import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { environment } from '../../environments/environment';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-verification',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './verification.component.html',
  styleUrl: './verification.component.css'
})
export class VerificationComponent implements OnInit {

  email:string;
  fc= new FormControl<string>('');
  constructor(private http:HttpClient,public route: ActivatedRoute,
    private router: Router, private toastr: ToastrService, private spinner: NgxSpinnerService) {
    this.email= <string> <unknown>this.route.snapshot.paramMap.get('email');
  }

  ngOnInit(): void {
    console.log(this.email);
  }

  verify(){
    localStorage.setItem("lastUrl", "verification");
    var data={
      "email":this.email,
      "code":this.fc.value
    }
    this.spinner.show();
    this.http.post<Boolean>(environment.apiUrl+"prelogin/email/validation",data).
      subscribe(res=>{
        if(res){
          this.spinner.hide();
          this.toastr.success("Email verification successful!\n Registration Completed!");
          this.router.navigate(["/login"]);
        }
        else{
          this.spinner.hide();
          this.toastr.error("Invalid code");
        }
          
      })
  }

  resend(){
    var password= localStorage.getItem(this.email)
    if(password!=null){
      var data={
        "email":this.email,
        "password":password
      }
      this.spinner.show();
      this.http.post<Boolean>(environment.apiUrl+"prelogin/email/send",data).
        subscribe(res=>{
          if(res)
            this.spinner.hide()
          else this.toastr.error("something went wrong. Retry later")
          this.spinner.hide();
        });
    }
    else{
      this.router.navigate(["/register"]);
    }
  }


}
