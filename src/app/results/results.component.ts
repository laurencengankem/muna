import { HttpClient } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Item } from '../models/item.model';
import { GlobalVariable } from '../global/global';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { SharedModule } from '../shared/shared.module';
import { CardItemComponent } from '../card-item/card-item.component';


@Component({
  selector: 'app-results',
  standalone: true,
  imports: [SharedModule, CardItemComponent],
  templateUrl: './results.component.html',
  styleUrl: './results.component.css'
})
export class ResultsComponent implements OnInit {

  priceForm: FormGroup;
  categoryForm: FormGroup;
  filtered: Item[] =[];
  items: Item[] = [];
  b=false;
  order= new FormControl();
  categories= new Array(0);

  constructor(public route: ActivatedRoute, private http: HttpClient,
     public router: Router, private fb: FormBuilder ) {

      this.priceForm=fb.group(
        {
          "from":['',Validators.min(0)],
          "to":['',Validators.min(0)]
        }
      )

      this.categoryForm= fb.group({
        "selectedCategories": new FormArray([])
      })
    
  }
      
   

  ngOnInit(): void {
    this.http.post<Item[]>(GlobalVariable.BASE_API_URL+"item/searchItems",{"txt":null}).
    subscribe(data=> {
      this.items=data;
      this.filtered=data;
      console.log(data);
      console.log(this.filtered)
      if(data.length){
        this.setMaxMin();
        this.setCategories();
      }
       
      this.b=true;
    },
    error=>{
      this.b=true;
      let elmt= document.getElementById("cnx");
      (elmt as HTMLElement).style.display='block';
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
        this.filtered!=res;
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
    let min=this.filtered![0].discounted;
    let max=this.filtered![0].discounted;
    for(let i=1;i<this.filtered!.length;i++){
      if(this.filtered![i].discounted<min)
        min=this.filtered![i].discounted
      if(this.filtered![i].discounted>max)
        max=this.filtered![i].discounted;
    }
    this.priceForm.controls['from'].setValue(min);
    this.priceForm.controls['to'].setValue(max);
    console.log('max='+max+' min='+min);
  }

  setCategories(){
    this.categories;
    let temp:string[]=new Array(0);
    for(let i=0;i<this.filtered!.length;i++){
      if(!temp.find(it=> it==this.filtered![i].category)){
        temp.push(this.filtered![i].category);
        console.log(this.filtered![i].category);
      }
    }
    this.categories= temp;
  }


  filter(field:string){
    this.filterFromCategory(this.filterFromPrice(this.items!));
  }

  filterFromPrice(data:Item[]){
    this.filtered!=data;
    let from= this.priceForm.controls['from'].value;
    let to= this.priceForm.controls['to'].value;
    let temp= new Array(0);
    console.log("Here");
    if(from!=null && to==null){
        console.log("it is inside")
        for(let i=0;i<this.filtered!.length;i++){
          if(this.filtered![i].discounted>=from)
           temp.push(this.filtered![i]);
        }
    }
    else if(from==null && to!=null){
      for(let i=0;i<this.filtered!.length;i++){
        if(this.filtered![i].discounted<=to)
         temp.push(this.filtered![i]);
      }
    }
    else if(from!=null && to!=null){
      for(let i=0;i<this.filtered!.length;i++){
        if(this.filtered![i].discounted>=from && this.filtered![i].discounted<=to)
         temp.push(this.filtered![i]);
      }
    }
    this.filtered!=temp;
    console.log(this.filtered!)
    return temp;
  }

  ordertheProducts(){
    if(this.order.value=="asc"){
      let temp;
      for(let i=0;i<this.filtered!.length;i++){
        for(let j=i+1; j<this.filtered!.length; j++){
          if(this.filtered![j].discounted<this.filtered![i].discounted){
            temp= this.filtered![j];
            this.filtered![j]=this.filtered![i];
            this.filtered![i]=temp;
          }
        }
      }
    }
    else if(this.order.value=="desc"){
      let temp;
      for(let i=0;i<this.filtered!.length;i++){
        for(let j=i+1; j<this.filtered!.length; j++){
          if(this.filtered![j].discounted>this.filtered![i].discounted){
            temp= this.filtered![j];
            this.filtered![j]=this.filtered![i];
            this.filtered![i]=temp;
          }
        }
      }
    }

  }

  filterFromCategory(data:Item[]){
    let categories:string[]=this.categoryForm.controls['selectedCategories'].value;
    let temp= new Array(0);
    this.filtered!=data;
    if(categories.length>0){
      for(let i=0;i<this.filtered!.length;i++){
        if(categories.find(cat=>this.filtered!![i].category==cat))
          temp.push(this.filtered![i]);
      }
      this.filtered!=temp;
    }

  }


  onCheckboxChange(event: any) {
    
    const selectedCategories = (this.categoryForm.controls['selectedCategories'] as FormArray);
    if (event.target.checked) {
      selectedCategories.push(new FormControl(event.target.value));
    } else {
      const index =  selectedCategories.controls
      .findIndex(x => x.value === event.target.value);
      selectedCategories.removeAt(index);
    }
    console.log(selectedCategories.value);
  }

}