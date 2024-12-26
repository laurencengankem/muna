
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Title, Meta } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { GlobalVariable } from '../global/global';
import { SharedModule } from '../shared/shared.module';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';



@Component({
  selector: 'app-password-reset-link',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './password-reset-link.component.html',
  styleUrl: './password-reset-link.component.css'
})
export class PasswordResetLinkComponent implements OnInit {
  form: FormGroup;
  code: number=0;

  constructor(private title: Title,private meta:Meta, private route: ActivatedRoute,
    private fb: FormBuilder, private http: HttpClient, private router: Router,
    private spinner:NgxSpinnerService, private toastr: ToastrService) { 
    this.title.setTitle("Password reset page");
    this.meta.updateTag({name:"keywords",content:"kulvida,kuvidaApp"});
    this.form= this.fb.group({
      'email':['',Validators.required],
      'password':['',[Validators.required,Validators.minLength(5)]],
      'confirmPassword':['',[Validators.required,Validators.minLength(5)]]
    });
  }


  ngOnInit(): void {
    localStorage.setItem("lastUrl",'verification')
    this.code = <number><unknown>this.route.snapshot.paramMap.get('code');
    
  }

  resetPassword(){
    if(this.form.valid && this.form.get("password")?.value==this.form.get("confirmPassword")?.value){
      var body={
        "email": this.form.controls["email"].value,
        "password": this.form.controls["password"].value,
        "code": this.code
      }
      this.spinner.show();
      this.http.post<Boolean>(`${GlobalVariable.BASE_API_URL}prelogin/passwordChange`, body).subscribe(res =>{
        let pswChg:HTMLElement =(document.getElementById('password-change') as HTMLElement);
        this.spinner.hide();
        if(res){
          pswChg.style.color= 'green';
          pswChg.style.textAlign= 'center';
          this.toastr.success('Password changed successfully.')
        }
        else{
          pswChg.style.color= 'red';
          pswChg.style.textAlign= 'center';
          pswChg.innerHTML = 'Email Not found.';
          
        }

      })
    }
    else{
      (document.getElementById('password-change') as HTMLElement).innerHTML = "The passwords don't match";
    }


  }

}
