import { TestBed } from '@angular/core/testing';

import { TrailerEntriesService } from './trailer-entries.service';

describe('TrailerEntriesService', () => {
  let service: TrailerEntriesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TrailerEntriesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
