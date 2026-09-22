import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Title, Meta } from '@angular/platform-browser';
import { SharedModule } from '../shared/shared.module';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit {

  form: FormGroup;
  error= false;

  constructor(private title: Title,private meta:Meta,
    private fb: FormBuilder, private router: Router, private route: ActivatedRoute,
    private authService: AuthService,
    private spinner: NgxSpinnerService, private toastr: ToastrService) {
    this.title.setTitle("Login page");
    this.meta.updateTag({name:"keywords",content:"kulvida,kuvidaApp"});
    this.form= this.fb.group({
      'username':['',Validators.required],
      'password':['',[Validators.required,Validators.minLength(5)]]
    });
  }

  ngOnInit(): void {
  }


  log(){
    if(this.form.valid){
      const username: string = this.form.controls['username'].value;
      const password: string = this.form.controls['password'].value;
      this.spinner.show()
      this.authService.login(username, password).subscribe({
        next: res => {
          this.spinner.hide();
          if(res.jwttoken!=null){
            const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
            this.router.navigateByUrl(returnUrl || '/');
          }
          else{
            this.error=true;
          }
        },
        error: () => {
          this.spinner.hide();
          this.toastr.error('Something went wrong');
        }
      });

    }
    else{
      if(!this.form.controls['password'].valid)
        this.toastr.error("The password should be long at least 5 characters");
      else if(!this.form.controls['username'].valid)
        this.toastr.error("The Username input should be filled");
    }

  }
}
