
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SharedModule } from '../shared/shared.module';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { GlobalVariable } from '../global/global';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';


@Component({
  selector: 'app-create-user',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './create-user.component.html',
  styleUrl: './create-user.component.css'
})
export class CreateUserComponent {

  userForm: FormGroup;
  notCoinciding= true;

  constructor(private fb: FormBuilder, private http: HttpClient, 
    private toast: ToastrService, private spinner: NgxSpinnerService) {
    this.userForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      role: ['', Validators.required],
      password: ['',[Validators.required,Validators.minLength(6)]],
      repeat: ['',[Validators.required,Validators.minLength(6)]]
    });
  }

  onSubmit(): void {
    if (this.userForm.valid) {
      const headers = new HttpHeaders({ 'Authorization': 'Bearer ' + localStorage.getItem("access_token") })
      this.spinner.show();
      this.http.post<any>(GlobalVariable.BASE_API_URL+"admin/create-user",this.userForm.value,{headers})
      .subscribe(res=>{
        this.spinner.hide();
        if(res){
          this.toast.success('user created successfully');
          this.userForm.reset();
          //window.location.href='/home';
        }else{
          this.toast.error('user with the specified email might already exist');
        }
      }, error =>{this.spinner.hide();})

    } else {
      this.toast.error('Form is invalid');
    }
  }

  check(){
    if(this.userForm.controls['password'].value!==this.userForm.controls['repeat'].value)
      this.notCoinciding=true;
    else this.notCoinciding=false;
  }
}

