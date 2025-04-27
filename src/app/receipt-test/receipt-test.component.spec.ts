import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReceiptTestComponent } from './receipt-test.component';

describe('ReceiptTestComponent', () => {
  let component: ReceiptTestComponent;
  let fixture: ComponentFixture<ReceiptTestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReceiptTestComponent]
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
