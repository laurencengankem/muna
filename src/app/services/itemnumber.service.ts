import { Injectable } from '@angular/core';

@Injectable({
providedIn: 'root'
})
export class ItemNumberService {
    private num:number=0;

    constructor(){
        var data= localStorage.getItem('cart');
        if(data){
            let datas = JSON.parse(data);
            this.num=datas.length;
        }
    }

    setNum(_num: number): void {
        this.num = _num;
    }

    getNum(): number {
        return this.num;
    }
}