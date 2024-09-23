import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {

intervalId: any;

  public orderPageNum= new BehaviorSubject<number>(1);
  constructor() { }

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

  checkLogin(){
    if (!this.isUserlogged()) {
      alert("Session has expired")
      window.location.href="login";
    }
  }
  
  startInterval(){
    this.intervalId = setInterval(() =>{
      this.checkLogin();
    }, 5000);
  }
}
