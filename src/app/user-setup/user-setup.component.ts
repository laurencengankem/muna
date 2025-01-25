import { Component, OnInit } from '@angular/core';
import { SharedModule } from '../shared/shared.module';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { GlobalVariable } from '../global/global';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-user-setup',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './user-setup.component.html',
  styleUrl: './user-setup.component.css'
})
export class UserSetupComponent implements OnInit {



  users: any[] = [];


  constructor(private http: HttpClient, 
    private toast: ToastrService, private spinner: NgxSpinnerService) {
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
          this.toast.error('Oops! Quelque chose s\'est mal passé');
        }
      }, error =>{this.spinner.hide();})
  }
}
