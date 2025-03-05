import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManufacturingOrdersListComponent } from './manufacturing-orders-list.component';

describe('ManufacturingOrdersListComponent', () => {
  let component: ManufacturingOrdersListComponent;
  let fixture: ComponentFixture<ManufacturingOrdersListComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ManufacturingOrdersListComponent]
    });
    fixture = TestBed.createComponent(ManufacturingOrdersListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
