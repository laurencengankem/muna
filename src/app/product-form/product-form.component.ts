import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Component({
    selector: 'app-product-form',
    templateUrl: './product-form.component.html',
    styleUrls: ['./product-form.component.css'],
    imports: [CommonModule, ReactiveFormsModule]
})
export class ProductFormComponent implements OnInit {
  clothProductForm!: FormGroup;
  @Output() formSubmitted = new EventEmitter<any>();

  selectedFile: any= null;
  Base64String: any=null;
  productCode: any|null = null;

  constructor(private fb: FormBuilder,private toastr:ToastrService,
    private spinner: NgxSpinnerService, private http: HttpClient) {}

  ngOnInit(): void {
    this.clothProductForm = this.fb.group({
      name: ['',Validators.required],
      description: ['', Validators.required],
      discount: [0, [Validators.min(0), Validators.max(100)]],
      sex: ['U', Validators.required],
      brand:[''],
      location: [''],
      color:[''],
      code: [this.productCode, Validators.required],
      category: ['', Validators.required],
      sizes: this.fb.array([this.createSize()])
    });

    var url= environment.apiUrl+"operator/getNextCode";
    this.http.get<any>(url).subscribe(res=>{
      this.productCode=res.code;
      this.clothProductForm.patchValue({code: this.productCode});
      //this.clothProductForm.controls['code'].disable();
    });

  }

  createSize(): FormGroup {
    return this.fb.group({
      name: ['', Validators.required],
      quantity: ['', Validators.required],
      magasin:['',Validators.required],
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
      //console.log('Product saved:', this.clothProductForm.value);

      var url=environment.apiUrl+"operator/addItem";
      this.spinner.show();
      this.http.post<Boolean>(url, this.clothProductForm.value).
        subscribe(res=>{
          console.log(res);
          this.spinner.hide();
          if(res){
            this.onUpload(res);
            this.toastr.success('item correctly added');
            this.formSubmitted.emit(true);
          }else{
            this.toastr.error('something went wrong!');
          }
        }, error=>{
          this.spinner.hide();
        });
    }
  }

  onFileSelected(event: any): void{
    this.selectedFile= event.target.files[0];
    const myReader: FileReader = new FileReader();
    myReader.onloadend = (e) => {
      if(myReader.result!=null)
      this.Base64String = myReader.result.toString();
    };
    myReader.readAsDataURL(this.selectedFile); 
  }
  
  onUpload(id: any):void{
    if(this.Base64String!=null)
    {
      var data={
        "id": id,
        "image":this.Base64String,
        "name":(this.selectedFile as File).name

      }
      var url=environment.apiUrl+"operator/uploadPictures";
      this.http.post<Boolean>(url,data).
        subscribe(res => {
          //this.ngOnInit();
          if(document.getElementById("myFile")!=null)
          (document.getElementById("myFile") as HTMLInputElement).value = "";
          this.Base64String=null;
        
        });
        
    }
  }
}

