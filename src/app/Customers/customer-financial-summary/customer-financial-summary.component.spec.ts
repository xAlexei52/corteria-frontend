import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomerFinancialSummaryComponent } from './customer-financial-summary.component';

describe('CustomerFinancialSummaryComponent', () => {
  let component: CustomerFinancialSummaryComponent;
  let fixture: ComponentFixture<CustomerFinancialSummaryComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CustomerFinancialSummaryComponent]
    });
    fixture = TestBed.createComponent(CustomerFinancialSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
