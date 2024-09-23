import { Injectable } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";

@Injectable({
    providedIn:'root'
})

export class ItemFormService{

    form: FormGroup;
    

    constructor(public fb: FormBuilder){
        this.form= fb.group({
      'name':[],
      'description':[],
      'price':['',Validators.min(0)],
      'discount':['',[Validators.min(0),Validators.max(100)]],
      'category':[''],
      'quantity':['',Validators.min(0)]
    });
    }

    setData():any{
        var data={
            'name':this.form.controls['name'].value,
            'description':this.form.controls['description'].value,
            'price':this.form.controls['price'].value,
            'discount':this.form.controls['discount'].value,
            'category': this.form.controls['category'].value,
            'quantity':this.form.controls['quantity'].value
        }
        return data;
    }
}