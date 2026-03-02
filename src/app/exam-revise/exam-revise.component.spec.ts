import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExamReviseComponent } from './exam-revise.component';

describe('ExamReviseComponent', () => {
  let component: ExamReviseComponent;
  let fixture: ComponentFixture<ExamReviseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExamReviseComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExamReviseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
