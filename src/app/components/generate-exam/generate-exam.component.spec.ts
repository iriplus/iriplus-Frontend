import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GenerateExamComponent } from './generate-exam.component';

describe('GenerateExamComponent', () => {
  let component: GenerateExamComponent;
  let fixture: ComponentFixture<GenerateExamComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GenerateExamComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GenerateExamComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
