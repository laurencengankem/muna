import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { UserService } from '../services/user.service';
import { SharedModule } from '../shared/shared.module';
import { GlobalVariable } from '../global/global';


@Component({
  selector: 'app-order-list',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './order-list.component.html',
  styleUrl: './order-list.component.css'
})
export class OrderListComponent implements OnInit {

  originalOrders: any[]=[];
  orders: any[]=[];
  orderItems: any[] = [];
  order: any={};
  orderNumFilter= null;
  orderDateFilter=null;
  orderTotalFilter= null;
  orderOpFilter= null;
  headers = new HttpHeaders({ 'Authorization': 'Bearer ' + localStorage.getItem("access_token") });

  constructor(private http: HttpClient, private userService: UserService,
        private toastr: ToastrService, private spinner: NgxSpinnerService){

  }

  ngOnInit(): void {
    this.http.get<any>(GlobalVariable.BASE_API_URL+"operator/getOrderList",{headers:this.headers})
    .subscribe(res=>{
      this.orders=res;
      this.originalOrders=this.orders;
    })
  }

  openModal(order:any){
    this.order=order;
    this.http.get<any>(GlobalVariable.BASE_API_URL+"operator/getOrderItems/"+order.orderId,{headers:this.headers})
    .subscribe(res=>{
      this.orderItems=res;
      const button = document.getElementById('modalButton');
      button?.click();
    })
    
  }

  generateReceipt(){
    this.spinner.show();
    this.http.get<any>(GlobalVariable.BASE_API_URL+"operator/generate-receipt/"+this.order.orderId,{headers:this.headers})
     .subscribe(res=>{
      if(res!=null){
        let assembledBase64 = res.join('');
        const receiptUrl = `data:image/png;base64,${assembledBase64}`
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
  }


}
