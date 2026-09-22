
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';


@Component({
    selector: 'app-create-user',
    imports: [CommonModule, ReactiveFormsModule],
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
      this.spinner.show();
      this.http.post<any>(environment.apiUrl+"admin/create-user",this.userForm.value)
      .subscribe(res=>{
        this.spinner.hide();
        if(res){
          this.toast.success('user created successfully');
          this.userForm.reset();
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

