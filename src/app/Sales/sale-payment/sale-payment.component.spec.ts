import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SalePaymentComponent } from './sale-payment.component';

describe('SalePaymentComponent', () => {
  let component: SalePaymentComponent;
  let fixture: ComponentFixture<SalePaymentComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SalePaymentComponent]
    });
    fixture = TestBed.createComponent(SalePaymentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
