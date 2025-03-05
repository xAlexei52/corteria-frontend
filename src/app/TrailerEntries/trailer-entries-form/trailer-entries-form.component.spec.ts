import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrailerEntriesFormComponent } from './trailer-entries-form.component';

describe('TrailerEntriesFormComponent', () => {
  let component: TrailerEntriesFormComponent;
  let fixture: ComponentFixture<TrailerEntriesFormComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TrailerEntriesFormComponent]
    });
    fixture = TestBed.createComponent(TrailerEntriesFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
