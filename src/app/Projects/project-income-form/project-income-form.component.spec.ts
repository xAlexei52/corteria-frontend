import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectIncomeFormComponent } from './project-income-form.component';

describe('ProjectIncomeFormComponent', () => {
  let component: ProjectIncomeFormComponent;
  let fixture: ComponentFixture<ProjectIncomeFormComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ProjectIncomeFormComponent]
    });
    fixture = TestBed.createComponent(ProjectIncomeFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
