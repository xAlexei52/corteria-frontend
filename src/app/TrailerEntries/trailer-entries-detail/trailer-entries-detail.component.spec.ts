import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrailerEntriesDetailComponent } from './trailer-entries-detail.component';

describe('TrailerEntriesDetailComponent', () => {
  let component: TrailerEntriesDetailComponent;
  let fixture: ComponentFixture<TrailerEntriesDetailComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TrailerEntriesDetailComponent]
    });
    fixture = TestBed.createComponent(TrailerEntriesDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
