import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectIncomeListComponent } from './project-income-list.component';

describe('ProjectIncomeListComponent', () => {
  let component: ProjectIncomeListComponent;
  let fixture: ComponentFixture<ProjectIncomeListComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ProjectIncomeListComponent]
    });
    fixture = TestBed.createComponent(ProjectIncomeListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
