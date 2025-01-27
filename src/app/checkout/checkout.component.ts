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

  productCode=null;
  searchedProcduct: any=undefined;
  directMode= false;
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
    availableSizes: [{name:'',quantity:'',price:0,location:''}],
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

  onSearch() {
    // Add your logic for the search action here
    if(this.productCode!=null){
      this.found=false;
    this.notFound= false;
    this.searching=true;
    var data={
      code: this.productCode
    }
    var url=GlobalVariable.BASE_API_URL+"item/searchItemByCode";
    setTimeout(() => {
      this.http.post<any>(url,data,  {headers:this.headers}).
      subscribe(res => {
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


  submit(){
    this.errorsMsg=[];
    const data= this.groupAndSumProducts(this.products);
    const url=GlobalVariable.BASE_API_URL+"operator/validate-checkout";
    this.spinner.show();
    var body={
      items: data
    }
    this.http.post<any>(url,body,  {headers:this.headers}).subscribe(res => {
      this.spinner.hide();
      if(res.status==400){
        this.errorsMsg= res.messages;
      }else if(res.status==200){
        const button = document.getElementById('modalButton');
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

    console.log(groupedProducts);
    return groupedProducts;
  }

  generateReceipt(){
    const button = document.getElementById('modalClose');
    const data= this.groupAndSumProducts(this.products);
    var body={
       username :this.userService.getUser(),
       items: data
    }
     this.http.post<any>(GlobalVariable.BASE_API_URL+"operator/complete-checkout",body,{headers:this.headers})
     .subscribe(res=>{
      if(res!=null){
        let assembledBase64 = res.join('');
        this.toastr.success("Achat Compléter avec succès")
        const receiptUrl = `data:image/png;base64,${assembledBase64}`
        this.products=[];
        this.productCode=null;
        button?.click();
        this.spinner.hide();
        setTimeout(() => {
          this.downloadBase64Image(receiptUrl);
        },500);
      }
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



}
