import { HttpBackend, HttpClient } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { ActivatedRoute, Router, TitleStrategy } from '@angular/router';
import { GlobalVariable } from '../global/global';
import { Item } from '../models/item.model';
import { CartService } from '../services/cart.service';
import { ItemService } from '../services/item.service';
import { SharedModule } from '../shared/shared.module';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { UserService } from '../services/user.service';


@Component({
  selector: 'app-item-details',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './item-details.component.html',
  styleUrl: './item-details.component.css',
  providers: []
})

export class ItemDetailsComponent implements OnInit {

  slideIndex: number=1;
  userRole:any = '';
  b= false;
  d=false;
  item: Item= new Item();
  price: number=0;
  num1:number=0;
  num2:number=0;
  photo="";
  quantity = new FormControl(1,[Validators.min(1)]);
  selectedSize: string = '';

  constructor(public route: ActivatedRoute,private http: HttpClient,
    private cartService: CartService, private spinner: NgxSpinnerService,private router: Router,
    private toastr: ToastrService, private userService: UserService ) { 
    
  }

  ngOnInit(): void {

    var id= <number> <unknown>this.route.snapshot.paramMap.get('id');
    var url=GlobalVariable.BASE_API_URL+"item/searchItems/"
    this.spinner.show();
    this.http.get<Item>(url+id).
      subscribe(it=>
        { this.item=it; 
          this.b=true; 
          if(this.item.discount!=null && this.item.discount>0)
            this.d=true;
          if(this.item.pictures.length>0)
            this.photo=this.item.pictures[0].url;
          if(this.item.sizes.length>0)
            this.price= this.item.sizes[0].price;
          this.spinner.hide();
          window.scrollTo({
            top: 0, 
            behavior: 'smooth' 
          });
       }, error=>{
        this.spinner.hide();
       });

    if(this.userService.isUserlogged()){
      this.userRole=localStorage.getItem("userRole");
    }
      
      
    
  }



  addItem(){
    if(this.quantity.valid){
      var data= true;
      
      if(data){
        let datas = this.cartService.cartItemList;
        let i;
        let b=0;
        for(i=0;i<datas.length;i++){
          if(datas[i]["id"]==this.item.id && this.quantity.value && datas[i]["requestedSize"]===this.selectedSize){
            var n1=datas[i]["quantity"];
            var total= parseInt(n1)+1;
            datas[i]["quantity"]=total;
            datas[i]["total"]=total*datas[i]["discounted"];
            b=1;
          }
        }
        if(b==0){
          var q=1;
          console.log(this.item.sizes)
          datas.push({
            "id":this.item.id,
            "quantity":this.quantity.value,
            "name":this.item.name,
            "photo": this.photo,
            "price":this.price,
            "discounted":this.price*(1-(this.item.discount/100)),
            "discount":this.item.discount,
            "total":this.price*(1-(this.item.discount/100)),
            "requestedSize": this.selectedSize,
            "sizes": this.item.sizes
          })
          
        }
        this.cartService.setItems(datas);
        localStorage.setItem('cart',JSON.stringify(datas));
        this.cartService.setCartItemNumber(datas.length)
      }

      this.toastr.success(`"${this.item.name}"  ajouté au panier`);

      
    }
    else{
      alert("select the number of item you desire");
    }
  }


  plusSlides(n: number) {
    this.showSlides(this.slideIndex += n);
  }
  
  // Thumbnail image controls
  currentSlide(n:number) {
    this.showSlides(this.slideIndex = n);
  }
  
  showSlides(n: number) {
    let i;
    if( document.getElementById("first")!=null)
      (document.getElementById("first") as HTMLElement).style.display='none';

    let slides = document.getElementsByClassName("mySlides");
    let dots = document.getElementsByClassName("demo");
    let captionText = document.getElementById("caption");
    if (n > slides.length) {this.slideIndex = 1}
    if (n < 1) {this.slideIndex = slides.length}
    for (i = 0; i < slides.length; i++) {
      (slides[i] as HTMLElement).style.display = "none";
    }
    for (i = 0; i < dots.length; i++) {
      dots[i].className = dots[i].className.replace(" active", "");
    }
    (slides[this.slideIndex-1] as HTMLElement).style.display = "block";
    dots[this.slideIndex-1].className += " active";
    if(captionText !=null){
      captionText.innerHTML = (dots[this.slideIndex-1]as HTMLImageElement).alt;
    }
  
  } 


 

  onSizeChange(event: any) {
    const selectedValue = event.target.value;
    const selected = this.item.sizes.find(size => size.name === selectedValue);
    this.selectedSize= selected.name;
  
    if (selected) {
      this.price = selected.price;
    } else {
      console.warn('Selected size not found');
    }
  }

}
