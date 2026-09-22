import { Component } from '@angular/core';
import { SharedModule } from '../shared/shared.module';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { UserService } from '../services/user.service';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-receipt-test',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './receipt-test.component.html',
  styleUrl: './receipt-test.component.css'
})
export class ReceiptTestComponent  {

  width: Number=167;
  size: Number= 5.5;

  constructor(private http: HttpClient,private route: ActivatedRoute, private userService: UserService,
    private toastr: ToastrService, private spinner: NgxSpinnerService){

  }

  submit(){

    var body={
      fontSize: this.size,
      width: this.width
   }

    this.spinner.show();
      this.http.post<any>(environment.apiUrl+"operator/testImage",body,{responseType: 'blob' as 'json'})
      .subscribe(res=>{
          this.spinner.hide();
          this.toastr.success('Image générée avec succès!')
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
          },1000)
          
    },error=>{
      this.toastr.error('Something went wrong!');
      this.spinner.hide();
    });
  }

}
