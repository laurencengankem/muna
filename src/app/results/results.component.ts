import { HttpClient } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Item } from '../models/item.model';
import { GlobalVariable } from '../global/global';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { SharedModule } from '../shared/shared.module';
import { CardItemComponent } from '../card-item/card-item.component';
import { NgxSpinnerService } from 'ngx-spinner';


@Component({
  selector: 'app-results',
  standalone: true,
  imports: [SharedModule, CardItemComponent],
  templateUrl: './results.component.html',
  styleUrl: './results.component.css'
})
export class ResultsComponent implements OnInit {

  priceForm: FormGroup;
  sizeForm: FormGroup;
  categoryForm: FormGroup;
  brandForm: FormGroup;
  filtered: Item[] =[];
  items: Item[] = [];
  txt='';
  b=false;
  order= new FormControl();
  categories= new Array(0);
  page=1;
  sizes: string[]=[];
  brands: string[]=[];
  sex='';
  category='';
  error= false;

  constructor(public route: ActivatedRoute, private http: HttpClient, 
     public router: Router, private fb: FormBuilder,private spinner: NgxSpinnerService ) {

      this.priceForm=fb.group(
        {
          "from":['',Validators.min(0)],
          "to":['',Validators.min(0)]
        }
      )

      this.categoryForm= fb.group({
        "selected": new FormArray([])
      });

      this.sizeForm= fb.group({
        "selected": new FormArray([])
      });

      this.brandForm= fb.group({
        "selected": new FormArray([])
      });
    
  }
      

  ngOnInit(): void {

    this.sex= <string> <unknown>this.route.snapshot.paramMap.get('sex');
    this.category= <string> <unknown>this.route.snapshot.paramMap.get('category');

    localStorage.setItem("lastUrl",'other')
    this.spinner.show();

    var URL= GlobalVariable.BASE_API_URL+"item/getItemsList"
    if(this.sex!=null && this.category!=null){
      URL= GlobalVariable.BASE_API_URL+"item/"+this.sex+"/"+this.category;
    }
    
    this.http.get<Item[]>(URL).
    subscribe(data=> {
      this.items=data;
      this.filtered=data;
      if(data.length){
        this.removeUnavailable();
        this.setMaxMin();
        this.setCategories();
        this.setBrands();
        this.setSizes();
      }
       
      this.b=true;
      this.error=false;
      this.spinner.hide();
    },
    error=>{
      this.b=true;
      this.error= true;
      this.spinner.hide(); 
    });
  }

  search(data:any){
    this.b=false;
    this.items=new Array(0);
    let elmt1= document.getElementById("found");
    (elmt1 as HTMLElement).style.display='none';
    let elmt2= document.getElementById("cnx");
    console.log(data);
    this.http.post<Item[]>(GlobalVariable.BASE_API_URL+"item/searchItems",{"txt":data}).
    subscribe(
      res=> {
        this.items=res;
        this.filtered=res;
        if(res.length==0){
          (elmt1 as HTMLElement).style.display='block';
        }
        else {
          this.setMaxMin();
          this.setCategories();
          (elmt1 as HTMLElement).style.display='none';
          (elmt2 as HTMLElement).style.display='none';
        }
        this.b=true;
      
      },
      error=>{
        let elmt= document.getElementById("cnx");
        (elmt as HTMLElement).style.display='block';
        this.b=true;
      });

  }

  setMaxMin(){
    let min=0;
    let max=0;
    for(let i=1;i<this.filtered.length;i++){
      for(let j=0; j<this.filtered[i].sizes.length; j++){
        if(this.filtered[i].sizes[j].price<min)
          min=this.filtered[i].sizes[j].price
        if(this.filtered[i].sizes[j].price>max)
          max=this.filtered[i].sizes[j].price;
      }
    }
    this.priceForm.controls['from'].setValue(min);
    this.priceForm.controls['to'].setValue(max);
  }

  setCategories(){
    let temp:string[]=new Array(0);
    for(let i=0;i<this.filtered.length;i++){
      if(!temp.find(it=> it==this.filtered[i].category)){
        temp.push(this.filtered[i].category);
      }
    }
    this.categories= temp;
  }

  setBrands(){
    let temp:string[]=new Array(0);
    for(let i=0;i<this.filtered.length;i++){
      if(!temp.find(it=> it==this.filtered[i].brand)){
        temp.push(this.filtered[i].brand);
      }
    }
    this.brands= temp;
  }

  setSizes(){
    let temp:string[]=new Array(0);
    for(let i=0;i<this.filtered.length;i++){
      for(let j=0; j<this.filtered[i].sizes.length; j++){
        if(!temp.find(it=> it==this.filtered[i].sizes[j].name)){
          if(Number(this.filtered[i].sizes[j].quantity)>0)
            temp.push(this.filtered[i].sizes[j].name);
        }
      }
    }
    this.sizes= temp;
  }


  ordertheProducts(){
    if(this.order.value=="asc"){
      let temp;
      for(let i=0;i<this.filtered.length;i++){
        for(let j=i+1; j<this.filtered.length; j++){
          if(this.filtered[j].discounted<this.filtered[i].discounted){
            temp= this.filtered[j];
            this.filtered[j]=this.filtered[i];
            this.filtered[i]=temp;
          }
        }
      }
    }
    else if(this.order.value=="desc"){
      let temp;
      for(let i=0;i<this.filtered.length;i++){
        for(let j=i+1; j<this.filtered.length; j++){
          if(this.filtered[j].discounted>this.filtered[i].discounted){
            temp= this.filtered[j];
            this.filtered[j]=this.filtered[i];
            this.filtered[i]=temp;
          }
        }
      }
    }
    this.page=1;
  }


  onCheckboxGenericChange(event: any,form: FormGroup) {
    const selected = (form.controls['selected'] as FormArray);
    if (event.target.checked) {
      selected.push(new FormControl(event.target.value));
    } else {
      const index =  selected.controls
      .findIndex(x => x.value === event.target.value);
      selected.removeAt(index);
    }
    form.controls['selected']=selected;
  }


  filterProducts(){
    this.spinner.show();
    setTimeout(()=>{
      this.filtered=this.items;
      this.filterByPrice(this.filtered);
      this.filterByCategory(this.filtered);
      this.filterBySizes(this.filtered);
      this.page=1;
      this.spinner.hide();
    },700) 
  }

  filterByPrice(data: Item[]) {
    let temp: Item[] = []; // initialize array
    let from: number = Number(this.priceForm.controls["from"].value); // explicitly convert to number
    let to: number = Number(this.priceForm.controls["to"].value);
    for (let i = 0; i < data.length; i++) {
      let size = data[i].sizes.find(s => this.discountedPrice(s.price,data[i].discount) <= to && this.discountedPrice(s.price,data[i].discount)  >= from); // compare price
      if (size != null) {
        temp.push(data[i]); // add item if size is found
      }
    }
    this.filtered = temp;
  }

  filterByCategory(data: Item[]){
    let categories:string[]=this.categoryForm.controls['selected'].value;
    categories= categories.filter(value => value !== null);
    let temp= new Array(0);
    if(categories.length>0){
      for(let i=0;i<data.length;i++){
        if(categories.find(cat=>data[i].category==cat))
          temp.push(data[i]);
      }
      this.filtered=temp;
    }
  }

  filterByBrand(data: Item[]){
    let brands:string[]=this.brandForm.controls['selected'].value;
    brands= brands.filter(value => value !== null);
    let temp= new Array(0);
    if(brands.length>0){
      for(let i=0;i<data.length;i++){
        if(brands.find(brand=>data[i].brand==brand))
          temp.push(data[i]);
      }
      this.filtered=temp;
    }
  }

  filterBySizes(data: Item[]){
    let sizes:string[]=this.sizeForm.controls['selected'].value;
    sizes= sizes.filter(value => value !== null);
    let temp= new Array(0);
    if(sizes.length>0){
      for(let i=0;i<data.length;i++){
        let size = data[i].sizes.find(s => sizes.includes(s.name) && s.quantity>0);
        if (size != null) {
          temp.push(data[i]);
        }
      }
      this.filtered=temp;
    }
  }
  

  discountedPrice(price:number , discount:number){
    return price * (1-(discount/100));
  }


  removeUnavailable(){
    let temp=[];
    for(let i=0; i<this.filtered.length;i++){
      let size = this.filtered[i].sizes.find(s => s.quantity>0);
      if (size != null && this.filtered[i].available) {
        temp.push(this.filtered[i]);
      }
    }
    this.filtered=temp;
  }

  showFilters=false;

  toggleContent(){
    this.showFilters=!this.showFilters;
  }

  
}

