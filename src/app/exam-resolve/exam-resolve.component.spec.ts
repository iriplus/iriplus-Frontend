import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExamResolveComponent } from './exam-resolve.component';

describe('ExamResolveComponent', () => {
  let component: ExamResolveComponent;
  let fixture: ComponentFixture<ExamResolveComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExamResolveComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExamResolveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
