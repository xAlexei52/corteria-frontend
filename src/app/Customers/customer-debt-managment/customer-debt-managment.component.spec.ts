import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomerDebtManagmentComponent } from './customer-debt-managment.component';

describe('CustomerDebtManagmentComponent', () => {
  let component: CustomerDebtManagmentComponent;
  let fixture: ComponentFixture<CustomerDebtManagmentComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CustomerDebtManagmentComponent]
    });
    fixture = TestBed.createComponent(CustomerDebtManagmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
