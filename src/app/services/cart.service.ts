import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { UserService } from './user.service';
import { ItemNumberService } from './itemnumber.service';
import { CartItem } from '../models/cart-item.model';

@Injectable({
  providedIn: 'root'
})
export class CartService {

  public cartItemList: CartItem[]=[];
  public cartItemNumber= new BehaviorSubject<number>(0);
  public ItemsList = new BehaviorSubject<CartItem[]>([]);

  constructor(private http: HttpClient,private userService: UserService,private itemNumberService: ItemNumberService) {
    var data= localStorage.getItem('cart');
        if(data){
            let datas = JSON.parse(data);
            this.cartItemList= datas;
            this.cartItemNumber.next(datas.length);
        }
   }


  getCartItemNumber(): Observable<number> {
    return this.cartItemNumber.asObservable();
  }
  setCartItemNumber(itemNumber: number){
    this.cartItemNumber.next(itemNumber);
  }


  getItems(): Observable<CartItem[]> {
    return this.ItemsList.asObservable();

  }

  setItems(items: CartItem[]){
    this.cartItemList= items;
    this.ItemsList.next(this.cartItemList);

  }


  setProduct(product: CartItem[]){
    this.cartItemList.push(...product);
    this.ItemsList.next(this.cartItemList);
  }

  addToCart(product: CartItem){
    this.cartItemList.push(product);
    this.ItemsList.next(this.cartItemList);
    this.getTotalPrice();
    this.ItemsList.next(this.cartItemList);
    localStorage.setItem('cart',JSON.stringify(this.cartItemList));
  }

  getTotalPrice(): number{
    let grandTotal =0;
    this.cartItemList.map((a: CartItem) =>{
      grandTotal = grandTotal + a.discounted*a.quantity;
    })
    return grandTotal;
  }

  removeCartItem(product: CartItem){
    this.cartItemList.map((a: CartItem, index: number) =>{
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

  updateQty(item: CartItem):boolean{
    let flag:boolean= false;
    this.cartItemList.map((a: CartItem, index: number) =>{
      if (item.id == a.id && item.requestedSize==a.requestedSize) {
        flag=true;
        this.cartItemList[index].quantity = item.quantity ;
        let newCartList: CartItem[] = this.cartItemList;
        this.ItemsList.next(newCartList);
        localStorage.setItem('cart',JSON.stringify(this.cartItemList));

      }
    })
    return flag;
  }

  updateUserRemoteCart(): Observable<boolean>|null{
    if(this.userService.isUserlogged()){
      var body={
        "username":this.userService.getUser(),
        "cartData": JSON.stringify(this.cartItemList)
      }
      return  this.http.post<boolean>(environment.apiUrl+"user/update-userCart",body)
    }
    else return null;

  }

  getUserRemoteCart():Observable<CartItem[]>|null{
    if(this.userService.isUserlogged()){
      var user=this.userService.getUser();
      return this.http.get<CartItem[]>(environment.apiUrl+"user/get-userCart/"+user)

    }
    else return null;

  }

  CompleteOrder(): Observable<string[]>|null{
    if(this.userService.isUserlogged()){
      var body={
        "username":this.userService.getUser(),
        "cartData": JSON.stringify(this.cartItemList)
      }
      return  this.http.post<string[]>(environment.apiUrl+"user/initialize-order",body)
    }
    else return null;

  }
}
