import { TestBed } from '@angular/core/testing';

import { ManufacturingOrdersService } from './manufacturing-orders.service';

describe('ManufacturingOrdersService', () => {
  let service: ManufacturingOrdersService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ManufacturingOrdersService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
