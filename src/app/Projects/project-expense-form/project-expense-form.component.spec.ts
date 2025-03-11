import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectExpenseFormComponent } from './project-expense-form.component';

describe('ProjectExpenseFormComponent', () => {
  let component: ProjectExpenseFormComponent;
  let fixture: ComponentFixture<ProjectExpenseFormComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ProjectExpenseFormComponent]
    });
    fixture = TestBed.createComponent(ProjectExpenseFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
