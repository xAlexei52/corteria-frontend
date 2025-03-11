import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FixedExpenseListComponent } from './fixed-expense-list.component';

describe('FixedExpenseListComponent', () => {
  let component: FixedExpenseListComponent;
  let fixture: ComponentFixture<FixedExpenseListComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [FixedExpenseListComponent]
    });
    fixture = TestBed.createComponent(FixedExpenseListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
