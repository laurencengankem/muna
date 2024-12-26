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

  orders: any[]=[];
  orderItems: any[] = [];
  order: any={};
  headers = new HttpHeaders({ 'Authorization': 'Bearer ' + localStorage.getItem("access_token") });

  constructor(private http: HttpClient, private userService: UserService,
        private toastr: ToastrService, private spinner: NgxSpinnerService){

  }

  ngOnInit(): void {
    this.http.get<any>(GlobalVariable.BASE_API_URL+"operator/getOrderList",{headers:this.headers})
    .subscribe(res=>{
      this.orders=res;
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

}
