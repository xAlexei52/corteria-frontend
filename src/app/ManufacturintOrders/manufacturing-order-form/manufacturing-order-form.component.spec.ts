import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManufacturingOrderFormComponent } from './manufacturing-order-form.component';

describe('ManufacturingOrderFormComponent', () => {
  let component: ManufacturingOrderFormComponent;
  let fixture: ComponentFixture<ManufacturingOrderFormComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ManufacturingOrderFormComponent]
    });
    fixture = TestBed.createComponent(ManufacturingOrderFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
