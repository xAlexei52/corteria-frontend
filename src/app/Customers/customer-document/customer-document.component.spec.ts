import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomerDocumentComponent } from './customer-document.component';

describe('CustomerDocumentComponent', () => {
  let component: CustomerDocumentComponent;
  let fixture: ComponentFixture<CustomerDocumentComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CustomerDocumentComponent]
    });
    fixture = TestBed.createComponent(CustomerDocumentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
