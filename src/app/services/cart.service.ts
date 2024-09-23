import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { GlobalVariable } from '../global/global';
import { UserService } from './user.service';


@Injectable({
  providedIn: 'root'
})
export class CartService {

  public cartItemList: any=[];
  public cartItemNumber= new BehaviorSubject<number>(0);
  public ItemsList = new BehaviorSubject<any>([]);
  headers = new HttpHeaders({ 'Authorization': 'Bearer ' + localStorage.getItem("access_token") })
  
  constructor(private http: HttpClient,private userService: UserService) { }
    
  

  getCartItemNumber() {
    return this.cartItemNumber.asObservable();
  }
  setCartItemNumber(itemNumber: number){
    this.cartItemNumber.next(itemNumber);
  }


  getItems(){
    return this.ItemsList.asObservable();

  }

  setItems(items: any){
    this.cartItemList= items;
    this.ItemsList.next(this.cartItemList);
    
  }


  setProduct(product: any){
    this.cartItemList.push(...product);
    this.ItemsList.next(this.cartItemList);
  }

  addToCart(product: any){
    this.cartItemList.push(product);
    this.ItemsList.next(this.cartItemList);
    this.getTotalPrice();
    console.log(this.cartItemList);
    this.ItemsList.next(this.cartItemList);
    localStorage.setItem('cart',JSON.stringify(this.cartItemList));
  }

  getTotalPrice(): number{
    let grandTotal =0;
    this.cartItemList.map((a:any) =>{
      grandTotal = grandTotal + a['discounted']*a['quantity'];
    })
    return grandTotal;
  }

  removeCartItem(product: any){
    this.cartItemList.map((a: any, index: any) =>{
      if (product.id === a.id) {
        this.cartItemList.splice(index, 1);
        
      }
    })
  }

  removeAllCart(){
    this.cartItemList =[];
    localStorage.removeItem('cart');
    this.ItemsList.next(this.cartItemList);
  }

  updateQty(item: any, quantity:number):boolean{
    let flag:boolean= false;
    this.cartItemList.map((a: any, index: any) =>{
      if (item.id == a.id) {
        flag=true;
        this.cartItemList[index].quantity = quantity ;
        let newCartList: any[] = this.cartItemList;
        this.ItemsList.next(newCartList);
        localStorage.setItem('cart',JSON.stringify(this.cartItemList));
       
      }
    })
    return flag;
  }

  updateUserRemoteCart(): Observable<boolean>|null{
    if(this.userService.isUserlogged()){
      const headers = new HttpHeaders({ 'Authorization': 'Bearer ' + localStorage.getItem("access_token") })
      var body={
        "username":this.userService.getUser(),
        "cartData": JSON.stringify(this.cartItemList)
      }
      return  this.http.post<any>(GlobalVariable.BASE_API_URL+"user/update-userCart",body,{headers})
    }
    else return null;
    
  }

  getUserRemoteCart():Observable<any[]>|null{
    if(this.userService.isUserlogged()){
      const headers = new HttpHeaders({ 'Authorization': 'Bearer ' + localStorage.getItem("access_token") })
      var user=this.userService.getUser();
      return this.http.get<any[]>(GlobalVariable.BASE_API_URL+"user/get-userCart/"+user,{headers})
      
    }
    else return null;
    
  }
}
