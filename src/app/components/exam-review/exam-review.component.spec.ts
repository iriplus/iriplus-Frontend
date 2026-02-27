import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExamReviewComponent } from './exam-review.component';

describe('ExamReviewComponent', () => {
  let component: ExamReviewComponent;
  let fixture: ComponentFixture<ExamReviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExamReviewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExamReviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
