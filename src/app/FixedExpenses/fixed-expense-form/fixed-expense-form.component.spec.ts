import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FixedExpenseFormComponent } from './fixed-expense-form.component';

describe('FixedExpenseFormComponent', () => {
  let component: FixedExpenseFormComponent;
  let fixture: ComponentFixture<FixedExpenseFormComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [FixedExpenseFormComponent]
    });
    fixture = TestBed.createComponent(FixedExpenseFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
