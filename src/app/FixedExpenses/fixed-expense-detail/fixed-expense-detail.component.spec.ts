import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FixedExpenseDetailComponent } from './fixed-expense-detail.component';

describe('FixedExpenseDetailComponent', () => {
  let component: FixedExpenseDetailComponent;
  let fixture: ComponentFixture<FixedExpenseDetailComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [FixedExpenseDetailComponent]
    });
    fixture = TestBed.createComponent(FixedExpenseDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
