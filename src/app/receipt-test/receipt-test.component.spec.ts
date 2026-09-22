import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { provideToastr } from 'ngx-toastr';

import { ReceiptTestComponent } from './receipt-test.component';

describe('ReceiptTestComponent', () => {
  let component: ReceiptTestComponent;
  let fixture: ComponentFixture<ReceiptTestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReceiptTestComponent],
      providers: [provideHttpClient(), provideRouter([]), provideToastr()]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReceiptTestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
