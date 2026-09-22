import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from '../../environments/environment';
import { Item } from '../models/item.model';
import { ItemFormService } from '../services/fgservice.service';
import { SharedModule } from '../shared/shared.module';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';



@Component({
  selector: 'app-item-update',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './item-update.component.html',
  styleUrl: './item-update.component.css'
})
export class ItemUpdateComponent implements OnInit {

  clothProductForm!: FormGroup;


  selectedFile: any= null;
  msg: any=null;
  Base64String: any=null;
  flag=false;
  item: Item= new Item();
  loaded: Boolean= false;
  form: FormGroup;
  mainPhoto="";
  imageToDeleteIndex: number= 0;

  @ViewChild('myFile')
  myInputFile!: ElementRef;

  constructor(private http: HttpClient,public route: ActivatedRoute,private router: Router,private fb: FormBuilder ,private toastr:ToastrService,
    private spinner: NgxSpinnerService, private is: ItemFormService) {
     this.form= is.form;
     
   }


  ngOnInit(): void {

    var id= <number> <unknown>this.route.snapshot.paramMap.get('id');

    var url=environment.apiUrl+"item/searchItems/"+id;
    this.http.get<Item>(url).subscribe(res=>{
      this.item=res;
      this.loaded=true;
      let i;
      for(i=0;i<this.item.pictures.length;i++){
        if(this.item.pictures[i].tag=="MAIN"){
          this.mainPhoto=this.item.pictures[i].url;
          this.flag=true;
        }
      }
      if(!this.flag && this.item.pictures.length>0 ){
        this.mainPhoto=this.item.pictures[0].url;
        this.updateMain(0);
        this.flag=true;
      }

      this.clothProductForm = this.fb.group({
        id: [this.item.id],
        available: [this.item.available,Validators.required],
        name: [this.item.name,Validators.required],
        description: [this.item.description, Validators.required],
        discount: [this.item.discount, [Validators.min(0), Validators.max(100)]],
        cost: [this.item.cost, [Validators.min(0)]],
        sex: [this.item.sex, Validators.required],
        brand:[this.item.brand],
        code: [this.item.code],
        color: [this.item.color],
        category: [this.item.category, Validators.required],
        sizes: this.fb.array(this.addSavedSize(this.item.sizes))
      });


    });
    
  }

  onFileSelected(event: any): void{
    console.log(event);
    this.selectedFile= event.target.files[0];
    const myReader: FileReader = new FileReader();
    myReader.onloadend = (e) => {
      if(myReader.result!=null)
      this.Base64String = myReader.result.toString();
    };
    myReader.readAsDataURL(this.selectedFile); 
  }
  
  onUpload():void{
    if(this.Base64String!=null)
    {
      console.log((this.selectedFile as File).name);
      var data={
        "id":this.item.id,
        "image":this.Base64String,
        "name":(this.selectedFile as File).name

      }
      var url=environment.apiUrl+"operator/uploadPictures";
      this.http.post<Boolean>(url,data).
        subscribe(res => {
          console.log(res);
          this.ngOnInit();
          if(document.getElementById("myFile")!=null)
          (document.getElementById("myFile") as HTMLInputElement).value = "";
          this.Base64String=null;
        
        });

      this.myInputFile.nativeElement.value='';
        
    }
  }


  resize(pic:string,width:number,height:number){
    let w= document.getElementsByClassName("image");
    console.log(w.length);
    return pic+"?tr=w-"+width+",h-"+height;
  }

  onSubmit(){
    var data=this.is.setData();
    if(this.form.valid){
      var data=this.is.setData();
      var url=environment.apiUrl+"admin/updateItem/";
      this.http.post<Boolean>(url+this.item.id,data).
        subscribe(res=>{
          if(res){
            this.toastr.success("Modifications Sauvegardées");
            this.router.navigate(['/itemslist']);
          }
          else{
            this.toastr.error("Insérer des données valides");

          }
        });
    }
    else
      this.toastr.error("Insérer des donneés valides");
    
  }


  delete(){
    var url=environment.apiUrl+"admin/deleteItem/";
    this.http.post<Boolean>(url+this.item.id,null).
    subscribe(res=>{
      if(res){
        this.toastr.success("Modèle Effacé");
        setTimeout(()=>{
          this.router.navigate(['/catalog']);
        },1500)
      }
      else this.toastr.error("Impossible d'effacer le modèle");
        
      
    });
  }

  showOrHide(id: any): void{
    let elmt= document.getElementById(id);
    if((elmt as HTMLElement).style.display=="block"){
      (elmt as HTMLElement).style.display="none";
      
    }
    else{
      (elmt as HTMLElement).style.display="block";
    }
    
  }



  addSavedSize(sizes: any[]): FormGroup[]{
    let sizeArray=[]
    if(sizes.length>0){
      for(let i=0; i<sizes.length;i++){
          sizeArray.push(this.fb.group({
            name: [sizes[i].name, Validators.required],
            quantity: [sizes[i].quantity, Validators.required],
            magasin: [sizes[i].magasin,Validators.required],
            price: [sizes[i].price, Validators.required],
            location: [sizes[i].location]
          }));
      }
      return sizeArray;
    }else{
      sizeArray.push(this.createSize());
    }
    return sizeArray;
  }

  createSize(): FormGroup {
    return this.fb.group({
      name: ['', Validators.required],
      quantity: ['', Validators.required],
      magasin: [0,Validators.required],
      price: ['', Validators.required],
      location: ['']
    });
  }

  get sizes(): FormArray {
    return this.clothProductForm.get('sizes') as FormArray;
  }

  addSize(): void {
    this.sizes.push(this.createSize());
  }

  removeSize(index: number): void {
    this.sizes.removeAt(index);
  }

  saveProduct(): void {

    if (this.clothProductForm.valid) {
      console.log('Product updated:', this.clothProductForm.value);

      var url=environment.apiUrl+"admin/updateItem/"+this.item.id;
      this.spinner.show();
      this.http.post<Boolean>(url,this.clothProductForm.value).
        subscribe(res=>{
          console.log(res);
          this.spinner.hide();
          if(res){
            this.toastr.success('Modifications  Sauvergardées');
            this.ngOnInit();
          }else{
            this.toastr.error('something went wrong!');
          }
        }, error=>{
          this.spinner.hide();
        });
    }
  }

  show(picture:string){
      window.location.href=picture;
  }
  

  deletePic(){
    var data={
      "itemId":this.item.id,
      "url":this.item.pictures[this.imageToDeleteIndex].url
    }
    this.spinner.show();
    this.http.post<Boolean>(environment.apiUrl+'admin/deletePicture',data).
      subscribe(res=>
        {
          console.log(res);
          this.spinner.hide();
          setTimeout(()=>{
            this.ngOnInit()
          },500);
          
    })
  }

  updateMain(i:number){
    var url= environment.apiUrl+"admin/updateMainPicture/"+this.item.id+"/";
    if(this.item.pictures[i].tag!="MAIN"){
      this.http.get<Boolean>(url+this.item.pictures[i].id).
      subscribe(res=>console.log(res));
    }
    this.mainPhoto=this.item.pictures[i].url;
  }

}

