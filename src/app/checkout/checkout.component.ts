import { Component, OnInit } from '@angular/core';
import { SharedModule } from '../shared/shared.module';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { GlobalVariable } from '../global/global';
import { ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { UserService } from '../services/user.service';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.css'
})
export class CheckoutComponent implements OnInit{

  productCode:any=null;
  searchedProcduct: any=undefined;
  directMode= false;
  discount= 0;
  paymentMethod: any= "";

  errorsMsg: any[]=[];

  products: any[]= [];

  headers = new HttpHeaders({ 'Authorization': 'Bearer ' + localStorage.getItem("access_token") })
  searching= false;
  notFound= false;
  found=false;
  product = {
    id: 0 ,
    name: 'T-Shirt',
    size: 'M',
    price: 19.99,
    available: true, // Change to false if not available
    outOfStock: true,
    quantity: 0,
    location: '',
    availableSizes: [{name:'',quantity:'', magasin: '',price:0,location:''}],
    picture: 'https://via.placeholder.com/150' // Replace with actual image URL
  };

  constructor(private http: HttpClient,private route: ActivatedRoute, private userService: UserService,
      private toastr: ToastrService, private spinner: NgxSpinnerService){
    var mode = <any><unknown>this.route.snapshot.paramMap.get('mode');
    if(mode=='direct')
      this.directMode=true;
  }

  ngOnInit(): void {
    if(localStorage.getItem("userRole")!="ADMIN" && localStorage.getItem("userRole")!="OPERATOR"){
      window.location.href='/login';
    }
  }

  searchSize(size:string){
    this.productCode= this.productCode+size;
    this.onSearch();
  }

  onSearch() {
    // Add your logic for the search action here
    if(this.productCode!=null){
      this.found=false;
      this.notFound= false;
      this.searching=true;
      this.replaceInvalidChar();
    var data={
      code: this.productCode
    }
    var url=GlobalVariable.BASE_API_URL+"item/searchItemByCode";
    setTimeout(() => {
      this.http.post<any>(url,data,  {headers:this.headers}).
      subscribe(res => {
        if(res != null){
          this.searching=false;
          this.searchedProcduct=res;
          this.product.id= res.id;
          this.product.name= res.name;
          this.product.size=  res.requestedSize;
          this.product.price= res.requestedPrice==null? 0 : res.requestedPrice;
          this.product.picture= res.pictures.length>0? res.pictures[0].url: null;
          this.product.available= res.available;
          this.product.quantity= res.quantity;
          this.product.location= res.location;
          this.found=true;
          if(res.requestedSize==null){
            this.product.availableSizes= res.availableSizes;
          }
          else if(this.directMode && res.available){
            this.addProduct();
            this.productCode=null;
          }
        }else{
          this.searching=false;
          this.notFound=true;
        }
        
      }, error=>{
        this.searching=false;
        this.notFound=true;
      }); 
    },500);

    

  }
    
    

  }

  addProduct(){
    this.products.unshift({ id: this.product.id, name: this.product.name, size: this.product.size, price: this.product.price });
  }

  removeProduct(index: number) {
    this.products.splice(index, 1);
  }

  calculateTotalPrice(): number {
    return this.products.reduce((total, product) => total + product.price, 0);
  }

  checkDiscount(){
    this.discount = Number(this.discount);
    if(this.discount<0 || this.calculateTotalPrice()<this.discount)
      this.discount=0;
  }

  calculateDiscountedPrice(): number {
    let discounted = this.calculateTotalPrice();
    if(this.discount>0)
      return discounted - this.discount;
    else return discounted;
  }


  submit(){
    this.errorsMsg=[];
    const data= this.groupAndSumProducts(this.products);
    const url=GlobalVariable.BASE_API_URL+"operator/validate-checkout";
    this.spinner.show();
    var body={
      items: data,
      discount: this.discount
    }
    this.http.post<any>(url,body,  {headers:this.headers}).subscribe(res => {
      this.spinner.hide();
      if(res.status==400){
        this.errorsMsg= res.messages;
      }else if(res.status==200){
        const button = document.getElementById('modalPaymentButton');
        button?.click();
      }
    }, error => {
      this.spinner.hide();
    });

  }

  groupAndSumProducts(products:any[]) {
    const groupedProducts: any[] = [];
    const productMap = new Map();
  
    products.forEach(product => {
      const key = `${product.id}-${product.size}-${product.price}`;
      if (productMap.has(key)) {
        productMap.get(key).quantity += 1;
      } else {
        productMap.set(key, {
          id: product.id,
          name: product.name,
          size: product.size,
          price: product.price,
          quantity: 1,
        });
      }
    });
  
    productMap.forEach(value => groupedProducts.push(value));

    return groupedProducts;
  }


  validatePaymentMethod(){
    if(this.paymentMethod!==""){
      const button = document.getElementById('paymentmodalClose');
      button?.click();
      setTimeout(()=>{
        const buttonM = document.getElementById('modalButton');
        buttonM?.click();
      },100)
    }
  }

  generateReceipt(){
    const button = document.getElementById('modalClose');
    const data= this.groupAndSumProducts(this.products);
    var body={
       username :this.userService.getUser(),
       items: data,
       paymentMethod: this.paymentMethod,
       discount: this.discount
    }
    this.spinner.show();
     this.http.post<any>(GlobalVariable.BASE_API_URL+"operator/complete-checkout",body,{headers:this.headers, responseType: 'blob' as 'json'})
     .subscribe(res=>{
          this.products=[];
          this.discount=0;
          this.paymentMethod='';
          button?.click();
          this.spinner.hide();
          this.toastr.success('Commande Complétée avec succès!')
          const blob = new Blob([res], { type: 'application/pdf' });
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'muna_receipt.pdf';
          document.body.appendChild(a); // Append to body
          setTimeout(()=>{
            a.click();
            document.body.removeChild(a); // Remove after click
            window.URL.revokeObjectURL(url);
          },1500)
          
    },error=>{
      this.toastr.error('Something went wrong!');
      this.spinner.hide();
    });
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


  replaceInvalidChar(){
    this.productCode=  this.productCode
    .replace(/[^a-zA-Z0-9]/g, '-').replace('z','Y').replace('Z','Y');
  }


}
