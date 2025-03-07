import { TestBed } from '@angular/core/testing';

import { FixedExpensesService } from './fixed-expenses.service';

describe('FixedExpensesService', () => {
  let service: FixedExpensesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FixedExpensesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
