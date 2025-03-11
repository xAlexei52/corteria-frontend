import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectExpenseListComponent } from './project-expense-list.component';

describe('ProjectExpenseListComponent', () => {
  let component: ProjectExpenseListComponent;
  let fixture: ComponentFixture<ProjectExpenseListComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ProjectExpenseListComponent]
    });
    fixture = TestBed.createComponent(ProjectExpenseListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
