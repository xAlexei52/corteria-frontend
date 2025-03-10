import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectFinancialComponent } from './project-financial.component';

describe('ProjectFinancialComponent', () => {
  let component: ProjectFinancialComponent;
  let fixture: ComponentFixture<ProjectFinancialComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ProjectFinancialComponent]
    });
    fixture = TestBed.createComponent(ProjectFinancialComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
