import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { UserService } from '../services/user.service';
import { SharedModule } from '../shared/shared.module';
import { GlobalVariable } from '../global/global';
import { Router } from '@angular/router';


@Component({
  selector: 'app-order-list',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './order-list.component.html',
  styleUrl: './order-list.component.css'
})
export class OrderListComponent implements OnInit {

  originalOrders: any[]=[];
  userRole: any='';
  orders: any[]=[];
  orderItems: any[] = [];
  updatedItems: any[] = [];
  order: any={};
  page=1;
  orderNumFilter= null;
  orderDateFilter=null;
  orderTotalFilter= null;
  orderOpFilter= null;
  headers = new HttpHeaders({ 'Authorization': 'Bearer ' + localStorage.getItem("access_token") });

  constructor(private http: HttpClient, private userService: UserService,
        private toastr: ToastrService, private spinner: NgxSpinnerService, private router: Router){

  }

  ngOnInit(): void {

    this.userRole= localStorage.getItem("userRole");

    this.spinner.show();
    this.http.get<any>(GlobalVariable.BASE_API_URL+"operator/getOrderList",{headers:this.headers})
    .subscribe(res=>{
      this.spinner.hide();
      this.orders=res;
      this.originalOrders=this.orders;
    },error=>{
      this.spinner.hide();
      this.toastr.error('Oops il y\'a un problème');
    });
    localStorage.removeItem('order');
  }

  openModal(order:any){
    this.order=order;
    this.http.get<any>(GlobalVariable.BASE_API_URL+"operator/getOrderItems/"+order.orderId,{headers:this.headers})
    .subscribe(res=>{
      this.orderItems=res.items;
      this.updatedItems = res.updates;
      const button = document.getElementById('modalButton');
      button?.click();
    })
    
  }

  openDeleteModal(order:any){
    this.order=order;
    const button = document.getElementById('cancelButton');
    button?.click();
    
  }

  deleteOrder(){

    this.spinner.show();

    this.http.get(GlobalVariable.BASE_API_URL + "admin/delete-order/" + this.order.orderId, 
      { headers: this.headers, responseType: 'blob' }).subscribe(res=>{
        this.spinner.hide();
        const button = document.getElementById('deleteModalClose');
        button?.click();
        if(res){
          this.toastr.success('Commande Effacée Avec Succès');
          setTimeout(()=>{
            this.http.get<any>(GlobalVariable.BASE_API_URL+"operator/getOrderList",{headers:this.headers})
            .subscribe(res=>{
              this.orders=res;
              this.originalOrders=this.orders;
              if(this.orders.length<=10)
                this.page=1;
            })
          },1000)
        }else{
          this.toastr.error('Quelque chose s\'est mal passée');
        }
      }, error =>{
        this.spinner.hide();
        this.toastr.error('Quelque chose s\'est mal passée');
      })
  }


  modifyOrder(order : any){
    localStorage.setItem('order',JSON.stringify(order));
    this.router.navigate(['/checkout/return'],{ queryParams: { orderId : order.orderId } });
  }

  generateReceipt() {
    this.spinner.show();
    
    this.http.get(GlobalVariable.BASE_API_URL + "operator/generate-receipt/" + this.order.orderId, 
    { headers: this.headers, responseType: 'blob' }) // Specify responseType
      .subscribe(
        res => {
          this.spinner.hide(); // Hide spinner on success
          const blob = new Blob([res], { type: 'application/pdf' });
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = this.order.orderId+'_receipt.pdf';
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


  filterOrders(){
    console.log(this.orderNumFilter);
    console.log(this.orderDateFilter);
    console.log(this.orders);
    
    this.orders= this.originalOrders.filter(order => {

      var isExactDateMatch = true;
      var containsOrderId = true;
      var isTotalMatch= true;
      var isOperatorMatch= true;

      const orderDate = new Date(order.date).toISOString().split('T')[0];
      
      if(this.orderDateFilter!== null && this.orderDateFilter!=''){
        const targetDate = new Date(<string>this.orderDateFilter).toISOString().split('T')[0];
        isExactDateMatch = orderDate === targetDate;
      }
        
      if(this.orderNumFilter!==null){
        containsOrderId = this.orderNumFilter
          ? order.orderId.toLowerCase().includes((<string>this.orderNumFilter).toLowerCase())
          : true;
      }

      if(this.orderOpFilter!==null){
        isOperatorMatch = this.orderOpFilter
          ? order.username.toLowerCase().includes((<string>this.orderOpFilter).toLowerCase())
          : true;
      }

      if(this.orderTotalFilter!=null){
        isTotalMatch= Number(order.total) === Number(this.orderTotalFilter);
      }
      
  
      return isExactDateMatch && containsOrderId && isTotalMatch && isOperatorMatch;
    });
    this.page=1;
  }


}
