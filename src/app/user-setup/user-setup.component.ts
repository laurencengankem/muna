import { Component, OnInit } from '@angular/core';
import { SharedModule } from '../shared/shared.module';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-user-setup',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './user-setup.component.html',
  styleUrl: './user-setup.component.css'
})
export class UserSetupComponent implements OnInit {



  users: any[] = [];
  emailAddress= '';
  page=1;

  userForm: FormGroup;
  notCoinciding= true;


  constructor(private http: HttpClient, private router: Router, private fb: FormBuilder,
    private toast: ToastrService, private spinner: NgxSpinnerService) {

      this.userForm = this.fb.group({
        email: ['', [Validators.required, Validators.email]],
        // firstName: ['', Validators.required],
        // lastName: ['', Validators.required],
        // role: ['', Validators.required],
        password: ['',[Validators.required,Validators.minLength(6)]],
        repeat: ['',[Validators.required,Validators.minLength(6)]]
      });
  }
    
  ngOnInit(): void {
    if(localStorage.getItem("userRole")!="ADMIN"){
      this.router.navigate(['/login']);
    }
    var url=environment.apiUrl+"admin/getUserList"
    this.spinner.show();
    this.http.get<any>(url).subscribe(res=>{
      this.users=res;
      this.spinner.hide();
    }, error=>{this.spinner.hide();});

  }

  switchUserStatus(user: any): void {
      this.spinner.show();
      var body={
        email: user.username
      }
      this.http.post<any>(environment.apiUrl+"admin/update-user-status",body)
      .subscribe(res=>{
        this.spinner.hide();
        if(res){
          this.toast.success('Utilisateur ajourné correctement');
          var url=environment.apiUrl+"admin/getUserList"
          this.spinner.show();
          this.http.get<any>(url).subscribe(res=>{
            this.users=res;
            this.spinner.hide();
          }, error=>{this.spinner.hide();});

        }else{
          this.toast.error('Oops! Quelque chose s\'est mal passée');
        }
      }, error =>{this.spinner.hide();})
  }

  onSubmit(): void {
    if (this.userForm.valid) {
      this.spinner.show();
      var body={ email: this.emailAddress};
      body= {...body,...this.userForm.value}
      this.http.post<any>(environment.apiUrl+"admin/editUserPassword",body)
      .subscribe(res=>{
        this.spinner.hide();
        if(res){
          this.toast.success('Password Modifié avec succès');
          const button = document.getElementById('modalClose');
          this.userForm.reset();
          button?.click();
        }else{
          this.toast.error('Oups! Quelque chose s\'est mal passée');
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

  setUser(username: string){
    this.emailAddress= username;
    this.userForm.controls['email'].enable();
    this.userForm.patchValue({ email : this.emailAddress});
    this.userForm.controls['email'].disable();
  }

}
