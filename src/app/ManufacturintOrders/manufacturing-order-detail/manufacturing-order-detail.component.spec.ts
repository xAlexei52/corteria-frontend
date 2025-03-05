import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManufacturingOrderDetailComponent } from './manufacturing-order-detail.component';

describe('ManufacturingOrderDetailComponent', () => {
  let component: ManufacturingOrderDetailComponent;
  let fixture: ComponentFixture<ManufacturingOrderDetailComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ManufacturingOrderDetailComponent]
    });
    fixture = TestBed.createComponent(ManufacturingOrderDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
