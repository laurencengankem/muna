import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root'
})
export class UserService {

intervalId: any;

  public orderPageNum= new BehaviorSubject<number>(1);
  public loggedUser= new BehaviorSubject<any>(localStorage.getItem('username'));
  public userRole= new BehaviorSubject<string>(localStorage.getItem('userRole') || '');
  constructor(private router: Router, private toastr: ToastrService) { }

  isUserlogged():boolean{
    var token= localStorage.getItem("access_token");
    if(token){
      var now= new Date();
      let expirationTime:number= <number><unknown>localStorage.getItem("token_time");
      if(now.getTime()<expirationTime){
        return true;
      }
      
    }
    return false;
  }

  getUser(){
    return localStorage.getItem('user');
  }

  getOrderPageNum() {
    return this.orderPageNum.asObservable();
  }
  setOrderPageNum(pageNumber: number){
    this.orderPageNum.next(pageNumber);
  }

  getLoggedUser(){
    return this.loggedUser.asObservable();
  }

  setLoggedUser(user: string){
    this.loggedUser.next(user);
  }

  getUserRole(){
    return this.userRole.asObservable();
  }

  setUserRole(role: string){
    this.userRole.next(role);
  }

  checkLogin(){
    if (!this.isUserlogged()) {
      this.toastr.error("Session has expired");
      this.router.navigate(['/login']);
    }
  }
  
  startInterval(){
    this.intervalId = setInterval(() =>{
      this.checkLogin();
    }, 5000);
  }
}
