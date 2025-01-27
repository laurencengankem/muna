import { Component, OnInit } from '@angular/core';
import { SharedModule } from '../shared/shared.module';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { GlobalVariable } from '../global/global';
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

  userForm: FormGroup;
  notCoinciding= true;


  constructor(private http: HttpClient, private fb: FormBuilder,
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
    var url=GlobalVariable.BASE_API_URL+"admin/getUserList"
    const headers = new HttpHeaders({ 'Authorization': 'Bearer ' + localStorage.getItem("access_token") })
    this.spinner.show();
    this.http.get<any>(url,{headers}).subscribe(res=>{
      this.users=res;
      this.spinner.hide();
    }, error=>{this.spinner.hide();});
 
  }

  switchUserStatus(user: any): void {
    console.log('Enabling user:', user);
    // Add your logic to enable the user here
    const headers = new HttpHeaders({ 'Authorization': 'Bearer ' + localStorage.getItem("access_token") })
      this.spinner.show();
      var body={
        email: user.username
      }
      this.http.post<any>(GlobalVariable.BASE_API_URL+"admin/update-user-status",body,{headers})
      .subscribe(res=>{
        this.spinner.hide();
        if(res){
          this.toast.success('Utilisateur ajourné correctement');
          var url=GlobalVariable.BASE_API_URL+"admin/getUserList"
          this.spinner.show();
          this.http.get<any>(url,{headers}).subscribe(res=>{
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
      const headers = new HttpHeaders({ 'Authorization': 'Bearer ' + localStorage.getItem("access_token") })
      this.spinner.show();
      var body={ email: this.emailAddress};
      body= {...body,...this.userForm.value}
      this.http.post<any>(GlobalVariable.BASE_API_URL+"admin/editUserPassword",body,{headers})
      .subscribe(res=>{
        this.spinner.hide();
        if(res){
          this.toast.success('Password Modifié avec succès');
          const button = document.getElementById('modalClose');
          this.userForm.reset();
          button?.click();
          //window.location.href='/home';
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
