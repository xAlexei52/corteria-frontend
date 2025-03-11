import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrailerEntriesListComponent } from './trailer-entries-list.component';

describe('TrailerEntriesListComponent', () => {
  let component: TrailerEntriesListComponent;
  let fixture: ComponentFixture<TrailerEntriesListComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TrailerEntriesListComponent]
    });
    fixture = TestBed.createComponent(TrailerEntriesListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
