import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { environment } from '../../environments/environment';
import { Country } from '../models/country.model';
import { FormGroup, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';


@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent implements OnInit {

  @Input() user: string="";
  countries: Country[] = new Array();
  form :FormGroup;

  constructor(public fb: FormBuilder, private http: HttpClient, private router: Router,
    private spinner: NgxSpinnerService, private toastr: ToastrService
  ) {
    this.form= fb.group({
      'email':['',[Validators.required,Validators.pattern("^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$")]],
      'firstName':['',[Validators.required,Validators.minLength(3)]],
      'lastName':['',[Validators.required,Validators.minLength(3)]],
      'phone':['',[Validators.required,Validators.minLength(6)]],
      'psw':['',[Validators.required,Validators.minLength(6)]],
      'code':[''],
      'psw-repeat':['',[Validators.required,Validators.minLength(6)]],
    });
   }

  ngOnInit(): void {
    this.http.get<any[]>(" https://restcountries.com/v3.1/all").subscribe(res =>{
      for (let index = 0; index < res.length; index++) {
        try {
          let code =res[index].idd.root + res[index].idd.suffixes[0];
          let name =res[index].name.common;
          let flag =res[index].flags.png;
          this.countries.push(new Country(code,name ,flag ))
        } catch (error) {
        }
        
      }
      this.countries.sort(function(a,b){
        let testA = a.name;
        let testB = b.name;
        return (testA<testB) ? -1 : (testA> testB) ? 1 : 0;
      })

    })
  }

  confirm(){
    if(this.form.valid && this.form.get("psw")?.value==this.form.get("psw-repeat")?.value){
      localStorage.setItem(this.form.get("email")?.value,this.form.get("psw")?.value);
      var data={
        "email":this.form.get("email")?.value,
        "password":this.form.get("psw")?.value,
        "firstName":this.form.get("firstName")?.value,
        "lastName":this.form.get("lastName")?.value,
        "phone":this.form.get("code")?.value + this.form.get("phone")?.value


      }
      console.log(data)
      this.spinner.show();
      this.http.post<Boolean>(environment.apiUrl+"prelogin/email/send",data).
        subscribe(res=>{
          if(res){
            this.spinner.hide();
            this.router.navigate(["/verification/"+this.form.get("email")?.value]);
          }
          else this.toastr.error("something went wrong. Retry later")
        });
      
    }
  }

  leave(id:string){
    if(id=="psw-repeat"){
      if(this.form.get("psw")?.value!=this.form.get("psw-repeat")?.value){
        (document.getElementById('psw-repeat-error') as HTMLElement ).style.display='block';
      }
    }
    else if(!this.form.get(id)?.valid)
      (document.getElementById(id+"-error") as HTMLElement ).style.display='block';
    
  }
}
