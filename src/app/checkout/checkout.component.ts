import { Component, OnInit } from '@angular/core';
import { SharedModule } from '../shared/shared.module';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { GlobalVariable } from '../global/global';
import { ActivatedRoute, Router } from '@angular/router';
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
  return= false;
  oldOrder: any= { total: 0, discount: 0};
  oldTotal: number= 0;
  discount= 0;
  paymentMethod: any= "";
  shouldPay= true;

  errorsMsg: any[]=[];

  products: any[]= [];
  oldProducts: any[]= [];

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
    picture: '' 
  };

  constructor(private http: HttpClient,private route: ActivatedRoute, private userService: UserService,
      private toastr: ToastrService, private spinner: NgxSpinnerService, private router: Router){
    var mode = <any><unknown>this.route.snapshot.paramMap.get('mode');
    if(mode=='direct' || mode=='return' )
      this.directMode=true;
    
    if(mode== 'return'){
      this.return = true;
      this.route.queryParams.subscribe(params => {
        const orderId = params['orderId'];
        this.http.get<any>(GlobalVariable.BASE_API_URL+"operator/getOrderItems/"+orderId,{headers:this.headers})
        .subscribe(res=>{
          res.items.forEach((it:any) =>{
            console.log(it);
            for(let i=0; i< it.quantity; i++){
              this.oldProducts.unshift({orderItemId: it.orderItemId, code: it.code , id: Number(it.code.slice(0,5)) , name: it.item, size: it.code.slice(5) , price: it.total/it.quantity });
            }
          })
          this.oldOrder= JSON.parse(<string>localStorage.getItem('order'));
          this.discount= this.oldOrder.discount;
          this.oldTotal= res.paid;
        })
      });
    }
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

  removeOldProduct(index: number) {
    this.oldProducts.splice(index, 1);
  }

  calculateTotalPrice(): number {
      return this.products.reduce((total, product) => total + product.price, 0)+
             this.oldProducts.reduce((total, product) => total + product.price, 0);
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
    console.log(body);
    this.http.post<any>(url,body,  {headers:this.headers}).subscribe(res => {
      this.spinner.hide();
      if(res.status==400){
        this.errorsMsg= res.messages;
      }else if(res.status==200){
        if(!this.return || (this.return && (this.calculateDiscountedPrice()-this.oldTotal)>0)){
          const button = document.getElementById('modalPaymentButton');
          button?.click();
        }else{
          this.shouldPay= false;
          const button = document.getElementById('modalButton');
          button?.click();
        }        
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
          code: product.code ? product.code : null,
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


  groupAndSumOldProducts(products:any[]) {
    const groupedProducts: any[] = [];
    const productMap = new Map();
  
    products.forEach(product => {
      const key = `${product.id}-${product.size}-${product.price}-${product.orderItemId}`;
      if (productMap.has(key)) {
        productMap.get(key).quantity += 1;
      } else {
        productMap.set(key, {
          id: product.id,
          code: product.code ? product.code+product.orderItemId: null,
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
       items:  data ,
       updating: this.return,
       oldOrderId: this.oldOrder.orderId,
       oldItems: this.groupAndSumOldProducts(this.oldProducts),
       paymentMethod: this.paymentMethod,
       discount: this.discount
    }
    console.log(body);
    this.spinner.show();
     this.http.post<any>(GlobalVariable.BASE_API_URL+"operator/complete-checkout",body,{headers:this.headers})
     .subscribe(res=>{
          if(!this.return){
            this.products=[];
            localStorage.removeItem('order');
            this.discount=0;
          }
          this.paymentMethod='';
          button?.click();
          this.spinner.hide();
          this.toastr.success('Commande Complétée avec succès!')
          // const blob = new Blob([res], { type: 'application/pdf' });
          // const url = window.URL.createObjectURL(blob);
          // const a = document.createElement('a');
          // a.href = url;
          // a.download = 'muna_receipt.pdf';
          // document.body.appendChild(a); // Append to body
          setTimeout(()=>{
            // a.click();
            // document.body.removeChild(a); // Remove after click
            // window.URL.revokeObjectURL(url);
            console.log(res);
            this.generateReceiptImg(res.orderId);
          },1500)
          setTimeout(()=>{
             this.router.navigate(['/checkout/direct']);
           },2000)
          
    },error=>{
      this.toastr.error('Something went wrong!');
      this.spinner.hide();
    });
  }


  generateReceiptImg(orderId:string) {
    this.spinner.show();
    
    this.http.get(GlobalVariable.BASE_API_URL + "operator/generate-receipt/" + orderId, 
    { headers: this.headers, responseType: 'blob' }) // Specify responseType
      .subscribe(
        res => {
          this.spinner.hide(); // Hide spinner on success
          const blob = new Blob([res], { type: 'application/pdf' });
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = orderId+'_receipt.pdf';
          document.body.appendChild(a); // Append to body
          a.click();
          document.body.removeChild(a); // Remove after click
          window.URL.revokeObjectURL(url);
        },
        error => {
          this.toastr.error('Something went wrong!');
          this.spinner.hide();
        }
      );
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
    this.productCode=  this.productCode.replace(/[^a-zA-Z0-9]/g, '-').replace('z','Y').replace('Z','Y');
  }


}
