import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { GlobalVariable } from '../global/global';
import { Item } from '../models/item.model';
import { CartService } from '../services/cart.service';
import { UserService } from '../services/user.service';
import { SharedModule } from '../shared/shared.module';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';


@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.css',
  providers: []
})
export class CartComponent implements OnInit {

  items: Item[]=[];
  datas: any[]=[];
  msg=null;
  b=false;
  empty=false;
  spedizione:number=0;
  total: number=0;
  idItem="";
  nameItem=""
  sizeItem="";

  constructor(private http:HttpClient, private router: Router,
    private cartService: CartService, private userService: UserService,
    private spinner: NgxSpinnerService, private toastr: ToastrService  ) { 

  }

  ngOnInit(): void {
    let i: number;

    this.datas= this.cartService.cartItemList;

    if(this.datas!=null && this.datas.length>0){
      this.spinner.show();
      var body={"data":JSON.stringify(this.datas)};
      this.http.post<any>(GlobalVariable.BASE_API_URL+"item/getCartItems",body).
      subscribe(result=>{
        this.spinner.hide();
        this.datas=result;
        this.b=true;
        this.total=this.computeTotal();
        this.cartService.setItems(this.datas);
        localStorage.setItem('cart',JSON.stringify(this.datas));

        window.scrollTo({
          top: 0, 
          behavior: 'smooth' 
        });
      })
    }

  }


  update(input:string){
    let i;
    let id= input.split('-')[0]; 
    let size= input.split('-')[1];
    let elmt=document.getElementById(id+size);

    for(i=0;i<this.datas.length;i++){
      if(this.datas[i].id==id && this.datas[i].requestedSize==size){
        var q= parseInt((elmt as HTMLSelectElement).value);
        if(q==0){
          this.idItem=this.datas[i].id;
          this.nameItem=this.datas[i].name;
          this.sizeItem=this.datas[i].requestedSize;
          (document.getElementById('delete') as HTMLElement).style.display='block';
          (document.getElementById('cart') as HTMLElement).style.pointerEvents='none';  
        }
        else{
          this.datas[i].quantity= q;
          this.datas[i].total= this.datas[i].quantity*this.datas[i].discounted;
          this.cartService.setItems(this.datas);
          localStorage.setItem('cart',JSON.stringify(this.datas));
          let response=this.cartService.updateUserRemoteCart();
          if(response!=null){
            response.subscribe(res=>console.log(res))
          }
        }
        
      }
    }
    this.total= this.computeTotal();
  }

  removeElement(input:any){
    let id= input.split('-')[0]; 
    let size= input.split('-')[1];
    let elmt=document.getElementById(id+size);
    (elmt as HTMLSelectElement).value= '0';
    this.update(input);
  }

  computeTotal():number{
    var tot=0;
    let i;
    for(i=0;i<this.datas.length;i++){
      tot= tot + this.datas[i].total;
    }
    return tot;
  }

  viewDetails(n:number){
    window.location.href='/itemdetails/'+this.datas[n].id;
  }

  deleteElement(n:number){
    if(n==1){
      let i;
      let index=0;
      for(i=0;i<this.datas.length;i++){
        if(this.datas[i].id==this.idItem && this.datas[i].requestedSize==this.sizeItem ){
          index=i;
        }
      }
      this.datas.splice(index,1);
      (document.getElementById('delete') as HTMLElement).style.display='none';
      (document.getElementById('cart') as HTMLElement).style.pointerEvents='auto';
      localStorage.setItem("cart",JSON.stringify(this.datas))
      this.cartService.updateUserRemoteCart()?.subscribe(res=>console.log(res));
      this.total= this.computeTotal();  
      if(this.datas.length==0){
        this.b=false;
        this.empty=true;
      }
    }
    else{
      (document.getElementById('delete') as HTMLElement).style.display='none';
      (document.getElementById('cart') as HTMLElement).style.pointerEvents='auto';
      let i=0;
      for(i=0;i<this.datas.length;i++){
        if(this.datas[i].id==this.idItem){
          let id= this.idItem+this.sizeItem;
          console.log(id);
          (document.getElementById(id) as HTMLSelectElement).value=this.datas[i].quantity;
        }
      }
    }
    this.cartService.setCartItemNumber(this.datas.length);
  }

  submit(){
    if(this.userService.isUserlogged()){
      this.spinner.show();
      this.cartService.CompleteOrder()?.subscribe(res=>{
        if(res!=null){
          let assembledBase64 = res.join('');
          this.toastr.success("Achat Compléter avec succès")
          this.cartService.cartItemList=[];
          this.datas=[];
          localStorage.removeItem('cart');
          this.cartService.setCartItemNumber(0);
          const receiptUrl = `data:image/png;base64,${assembledBase64}`
          this.downloadBase64Image(receiptUrl);
          this.spinner.hide();
          this.router.navigate(['/']);
        }
      },error=>{
        this.toastr.error('Something went wrong!');
        this.router.navigate(['/login']);
        this.spinner.hide();
      });
    }
      
    else this.router.navigate(['/login']);
  }

  downloadBase64Image(base64: string) {

    const today = new Date();
    const fileName = `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, '0')}-${today.getDate().toString().padStart(2, '0')}_` +
                 `${today.getHours().toString().padStart(2, '0')}-${today.getMinutes().toString().padStart(2, '0')}-${today.getSeconds().toString().padStart(2, '0')}_receipt.png`;

    const downloadLink = document.createElement('a');
    downloadLink.href = base64; 
    downloadLink.download = fileName;

    document.body.appendChild(downloadLink);

    downloadLink.click();
    document.body.removeChild(downloadLink);
  }

}
