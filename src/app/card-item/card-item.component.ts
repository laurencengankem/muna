import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Item } from '../models/item.model';
// import { CartService } from '../services/cart.service';


@Component({
  selector: 'app-card-item',
  standalone: true,
  imports: [],
  templateUrl: './card-item.component.html',
  styleUrl: './card-item.component.css'
})
export class CardItemComponent /*implements OnInit*/ {
  // @Input() item: Item;
  // picture:string;
  // b:boolean =false;
  // constructor(private router: Router,private cartService: CartService) { }

  // ngOnInit(): void {
  //   if(this.item.pictures.length>0){
  //     let i=0;
  //     for(i=0;i<this.item.pictures.length;i++){
  //       if(this.item.pictures[i].tag=="MAIN")
  //         this.picture=this.item.pictures[i].url;
  //     }
  //     if(this.picture==null){
  //       this.picture=this.item.pictures[0].url;
  //     }
  //   } 
  //   else{
  //     this.picture="";
  //   }

  //   if(this.item.discount!=null && this.item.discount>0){
  //     this.b=true;
  //   }
      
  // }
  

  // changeHeartColor(){
  //   let elemtStyle = (<HTMLInputElement>document.getElementById(this.item.name)).style;
  //   if (elemtStyle.color === "red") {
  //     elemtStyle.color = "black";

  //   }else{
  //     elemtStyle.color = "red";
  //   }
   
   
  // }

  // viewDetails(){
  //   this.router.navigate(['/itemdetails/'+this.item.id],{});
  // }
  
  // addToCart(){
  //   let cartData: any= this.cartService.cartItemList;
  //   console.log(cartData);
  //   let itemIsPresent =false;
  //     for(let i=0; i<cartData.length; i++){
  //       if(cartData[i]['id'] ==this.item.id){
  //         var q=cartData[i]["quantity"];
  //         var newQty= parseInt(q)+1;
  //         cartData[i]['quantity']=newQty;
  //         cartData[i]['total'] = newQty* cartData[i]['discounted'];
  //         itemIsPresent =true;
            
  //       }
  //     }
      
  //     if(!itemIsPresent){
  //       let photo:any=null;
  //       if(this.item.pictures.length>0)
  //         photo=this.item.pictures[0].url;
  //       cartData.push({
  //         "id":this.item.id,
  //         "quantity":1,
  //         "name":this.item.name,
  //         "photo":photo,
  //         "price":this.item.price,
  //         "discounted":this.item.discounted,
  //         "discount":this.item.discount,
  //         "total":this.item.discounted*1
  //       })
  //     }
  //     this.cartService.setCartItemNumber(cartData.length);
  //     localStorage.setItem('cart',JSON.stringify(cartData));
  //     this.cartService.setItems(cartData);
  //     let response=this.cartService.updateUserRemoteCart();
  //     if(response!=null){
  //       response.subscribe((res: any)=>console.log(res))
  //     }
  //     var msg= '<em style="color:green;font-size:1.5em">'+this.item.name+'</em>'+ ' added to the cart';
  

  // }

}