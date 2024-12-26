import {  HttpClient, HttpResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { GlobalVariable } from '../global/global';
import {Location} from '@angular/common';
import { CartService } from '../services/cart.service';
import { UserService } from '../services/user.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Title, Meta } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { SharedModule } from '../shared/shared.module';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';

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

  constructor(private title: Title,private meta:Meta, private cartService: CartService,
    private fb: FormBuilder, private http: HttpClient, private router: Router, 
    private userService: UserService, private location: Location,
    private spinner: NgxSpinnerService, private toastr: ToastrService) { 
    this.title.setTitle("Login page");
    this.meta.updateTag({name:"keywords",content:"kulvida,kuvidaApp"});
    this.form= this.fb.group({
      'username':['',Validators.required],
      'password':['',[Validators.required,Validators.minLength(5)]]
    });
  }

  ngOnInit(): void {
    // if(this.userService.isUserlogged()){
    //   let lastUrl = localStorage.getItem("lastUrl");
    //   if(lastUrl!=null && lastUrl=="verification"){
    //     window.location.href="home";
    //   }else
    //   this.location.back();
    // }
    // else{
    //   localStorage.removeItem("username");
    //   localStorage.removeItem("access_token");
    // }
    

  }


  log(){
    if(this.form.valid){
      var body={
        "username": this.form.controls["username"].value,
        "password": this.form.controls["password"].value
      }
      this.spinner.show()
      this.http.post<any>(GlobalVariable.BASE_API_URL+"authenticate",body).
      subscribe(res=> {
        if(res.jwttoken!=null){
          localStorage.setItem("userRole",res.role);
          localStorage.setItem("access_token",res.jwttoken);
          localStorage.setItem("token_time",((new Date()).getTime()+GlobalVariable.LOGIN_DURATION).toString());
          localStorage.setItem("user",body["username"]);
          this.userService.setLoggedUser(body["username"].split("@")[0])
          localStorage.setItem("username",body["username"].split("@")[0]);
          this.cartService.getUserRemoteCart()?.
          subscribe(res=>{
            if(res!=null){
              for(let i=0;i<res.length;i++){
                if(!this.cartService.updateQty(res[i])){
                  this.cartService.addToCart(res[i])
                }
              }
            }
            
            this.cartService.updateUserRemoteCart()?.
            subscribe(res=>{
              let lastUrl = localStorage.getItem("lastUrl");
              this.cartService.setCartItemNumber(this.cartService.cartItemList.length)
              window.location.href="/";
              this.spinner.hide();
              
            });
            
          });

          //this.location.back();
          this.spinner.hide()
        }
        
        else if(res==null || res.jwttoken==null){
          this.error=true;
          this.spinner.hide();   
        }
        
      }, error=>{this.spinner.hide(); this.toastr.error('Something went wrong'); });

    }
    else{
      if(!this.form.controls['password'].valid)
        alert("The password should be long at least 5 characters");
      else if(!this.form.controls['username'].valid)
        alert("The Username input should be filled");
    }
    
  }
}

