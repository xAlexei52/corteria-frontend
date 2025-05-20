import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SaleRomaneoComponent } from './sale-romaneo.component';

describe('SaleRomaneoComponent', () => {
  let component: SaleRomaneoComponent;
  let fixture: ComponentFixture<SaleRomaneoComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SaleRomaneoComponent]
    });
    fixture = TestBed.createComponent(SaleRomaneoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
