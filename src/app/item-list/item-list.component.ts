import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormGroup,FormBuilder, Validators } from '@angular/forms'
import { Observable } from 'rxjs/internal/Observable';
import { SharedModule } from '../shared/shared.module';
import { GlobalVariable } from '../global/global';
import { Item } from '../models/item.model';
import { NgxSpinnerService } from 'ngx-spinner';
import { ProductFormComponent } from '../product-form/product-form.component';


@Component({
  selector: 'app-item-list',
  standalone: true,
  imports: [SharedModule,ProductFormComponent],
  templateUrl: './item-list.component.html',
  styleUrl: './item-list.component.css'
})

export class ItemListComponent implements OnInit {

  form: FormGroup;
  showForm: boolean= false;
  items: Item[]=new Array();
  selectedFile: any= null;
  JsonString: string='';
  b:boolean= false;
  headers = new HttpHeaders({ 'Authorization': 'Bearer ' + localStorage.getItem("access_token") })

  @ViewChild('myFile')
  myInputFile!: ElementRef;

  constructor(public fb: FormBuilder, public http:HttpClient, private spinner: NgxSpinnerService) { 
    this.form= fb.group({
      'name':['',Validators.required],
      'description':['',Validators.required],
      'price':[0,[Validators.required,Validators.min(0)]],
      'discount':[0,[Validators.required,Validators.min(0),Validators.max(100)]],
      'quantity':[0,[Validators.required,Validators.min(0)]],
      'category':['']
    });
  }

  ngOnInit(): void {
    if(localStorage.getItem("userRole")!="ADMIN" && localStorage.getItem("userRole")!="OPERATOR"){
      window.location.href='/login';
    }
    this.loadItems();
  }

  showOrHide(): void{
    this.showForm= !this.showForm;   
  }

  changeContain(id: string, msg: string): void{
    let elmt= document.getElementById(id);
    (elmt as HTMLElement).innerHTML=msg;
  }


  send(){
    if(!this.form.valid){
      alert("fill the required fields correctly");
    }
    else{
      var data={
      'name':this.form.controls['name'].value,
      'description':this.form.controls['description'].value,
      'price':this.form.controls['price'].value,
      'discount':this.form.controls['price'].value,
      'category':this.form.controls['category'].value,
      'quantity':this.form.controls['quantity'].value
      }
      console.log(data['quantity']);
      var url=GlobalVariable.BASE_API_URL+"admin/addItem";
      this.http.post<Boolean>(url,data,{headers:this.headers}).
        subscribe(res=>{
          console.log(res);
          if(res){
            alert('item correctly added');
            this.ngOnInit();
          }
        });
    }
    
  }

  loadItems(){
    var url=GlobalVariable.BASE_API_URL+"item/getAllItems";
    this.spinner.show();
    this.http.get<Item[]>(url).subscribe(res=>
      {
        this.items=res;
        console.log(res);
        this.spinner.hide();
      });
  }

  edit(item:Item){
    console.log(item);
    window.location.href='/itemupdate/' + item.id;
  }

  onFileSelected(event: any): void{
    console.log(event);
    this.selectedFile= event.target.files[0];
    const fileReader = new FileReader();
    fileReader.readAsText(this.selectedFile, "UTF-8");
    fileReader.onload = () => {
      this.JsonString= <string>fileReader.result;
      console.log(JSON.parse(this.JsonString));
    }
    fileReader.onerror = (error) => {
      console.log(error);
    } 
  }

  onUpload(){
    var body={"items":this.JsonString};
    this.http.post<any>(GlobalVariable.BASE_API_URL+"admin/item/addItemList",body).
    subscribe(res=>{
      console.log(res.msg);
      (document.getElementById("msg") as HTMLElement).style.color='green';
      if((res.msg as string).includes("Bad"))
      (document.getElementById("msg") as HTMLElement).style.color='red';
      (document.getElementById("msg") as HTMLElement).innerHTML=res.msg;
      this.ngOnInit();
    });
    this.myInputFile.nativeElement.value='';

  }

  searchItems(){
    let elmt= document.getElementById('itemsearch');
    let val:string= (elmt as HTMLInputElement).value;
    var body={
      "txt":val
    }
    this.spinner.show();
    this.http.post<Item[]>(GlobalVariable.BASE_API_URL+"item/searchAllItems",body).
    subscribe(
      res=>{this.items=res;this.spinner.hide();},
      error=>{this.spinner.hide();}
  );
  }

  onFormSubmitted(formData: any) {
    this.showOrHide();
    this.loadItems();
  }

}
