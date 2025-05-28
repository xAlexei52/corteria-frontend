import { TestBed } from '@angular/core/testing';

import { CompanyExpensesService } from './company-expenses.service';

describe('CompanyExpensesService', () => {
  let service: CompanyExpensesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CompanyExpensesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
