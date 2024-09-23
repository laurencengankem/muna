import { Injectable } from '@angular/core';
import { Subject, Observable, BehaviorSubject } from 'rxjs';
import { Item } from '../models/item.model';

@Injectable({providedIn:'root'})

export class ItemService {
  private siblingItem = new Subject<Number>();
  constructor() { }
  /*
   * @return {Observable<string>} : siblingMsg
   */
  public getItem(): Observable<Number> {
    return this.siblingItem.asObservable();
  }
  /*
   * @param {string} message : siblingMsg
   */
  public updateItem(item: Number): void {
    this.siblingItem.next(item);
  }

}