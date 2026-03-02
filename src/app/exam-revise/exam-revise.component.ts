import { Component } from '@angular/core';
import{ CommonModule } from '@angular/common';

interface ExamItem {
  answer: string;
  question: string;
}

interface ExamExercise {
  exercise_type: string;
  instructions: string;
  items: ExamItem[];
}

interface ExamMock {
  class_description: string;
  class_id: number;
  context: string;
  coordinator_full_name: string | null;
  coordinator_id: number | null;
  date_created: string;
  exercises: ExamExercise[];
  id: number;
  notes: string | null;
  status: string;
  teacher_full_name: string | null;
}

@Component({
  selector: 'app-exam-revise',
  imports: [CommonModule],
  templateUrl: './exam-revise.component.html',
  styleUrl: './exam-revise.component.css'
})

export class ExamReviseComponent {
  exam: ExamMock = {
    class_description: 'FCE',
    class_id: 13,
    context:
      `Modern urban planning is shifting its focus toward sustainable living to combat the challenges of climate change and rapid population growth. Many cities are now investing in extensive public transport networks and dedicated cycling lanes to reduce the number of cars on the road, which helps lower carbon emissions and improves air quality. Additionally, the integration of "green spaces," such as rooftop gardens and community parks, provides residents with a much-needed escape from the concrete environment while supporting local biodiversity. However, critics argue that these eco-friendly developments can lead to higher property prices, potentially making city centers unaffordable for many people. Balancing environmental progress with social equality remains one of the most significant hurdles for future architects and local governments.`,
    coordinator_full_name: 'Mozzi Feliciano',
    coordinator_id: 1,
    date_created: 'Sun, 01 Mar 2026 21:57:37 GMT',
    exercises: [
      {
        exercise_type: 'Word Formation',
        instructions:
          'Use the word given in capitals at the end of each line to form a word that fits in the same line.',
        items: [
          {
            answer: 'planning',
            question:
              'Modern urban planning is shifting its focus toward sustainable living to combat the challenges of climate change and rapid population growth. PLAN'
          },
          {
            answer: 'reducing',
            question:
              'Many cities are now investing in extensive public transport networks and dedicated cycling lanes to reduce the number of cars on the road, which helps lower carbon emissions and improves air quality. REDUCE'
          },
          {
            answer: 'supporting',
            question:
              `Additionally, the integration of 'green spaces,' such as rooftop gardens and community parks, provides residents with a much-needed escape from the concrete environment while supporting local biodiversity. SUPPORT`
          },
          {
            answer: 'unaffordability',
            question:
              'However, critics argue that these eco-friendly developments can lead to higher property prices, potentially making city centers unaffordable for many people. UNAFFORDABLE'
          },
          {
            answer: 'remaining',
            question:
              'Balancing environmental progress with social equality remains one of the most significant hurdles for future architects and local governments. REMAINING'
          }
        ]
      },
      {
        exercise_type: 'Key word transformation',
        instructions:
          'Complete the second sentence so that it has a similar meaning to the first sentence, using the word given. Do not change the word given. You must use between two and five words, including the word given.',
        items: [
          {
            answer: 'took a break',
            question:
              'He read, he took a rest and then he carried on studying. TAKE'
          },
          {
            answer: 'take time to reach',
            question:
              'Reaching a decision will take us ages. TO'
          },
          {
            answer: 'don’t forget',
            question:
              'My secretary made me remember I had to post my application form. FORGET'
          },
          {
            answer: 'used to find',
            question:
              'It’s getting easier for me to do the writing tasks. USED'
          },
          {
            answer: 'found a solution',
            question:
              'We managed to solve the problem yesterday. FOUND'
          }
        ]
      },
      {
        exercise_type: 'Cloze test with options',
        instructions:
          'Complete each gap in the text with one suitable word from the options given.',
        items: [
          {
            answer: 'planning',
            question:
              'Modern urban planning is shifting its focus toward sustainable living to combat the challenges of climate change and rapid population growth. PLAN (A) plans (B) planning (C) planned'
          },
          {
            answer: 'reducing',
            question:
              'Many cities are now investing in extensive public transport networks and dedicated cycling lanes to reduce the number of cars on the road, which helps lower carbon emissions and improves air quality. REDUCE (A) reduces (B) reducing (C) reduced'
          },
          {
            answer: 'supporting',
            question:
              `Additionally, the integration of 'green spaces,' such as rooftop gardens and community parks, provides residents with a much-needed escape from the concrete environment while supporting local biodiversity. SUPPORT (A) supports (B) support (C) supported`
          }
        ]
      },
      {
        exercise_type: 'Open cloze test',
        instructions:
          'Complete each gap in the text with one suitable word.',
        items: [
          {
            answer: 'planning',
            question:
              'Modern urban planning is shifting its focus toward sustainable living to combat the challenges of climate change and rapid population growth. PLAN ( )'
          },
          {
            answer: 'reducing',
            question:
              'Many cities are now investing in extensive public transport networks and dedicated cycling lanes to reduce the number of cars on the road, which helps lower carbon emissions and improves air quality. REDUCE ( )'
          },
          {
            answer: 'supporting',
            question:
              `Additionally, the integration of 'green spaces,' such as rooftop gardens and community parks, provides residents with a much-needed escape from the concrete environment while supporting local biodiversity. SUPPORT ( )`
          }
        ]
      }
    ],
    id: 41,
    notes: 'Please review the wording in the transformation items and verify whether the cloze distractors feel balanced for an FCE-level student.',
    status: 'Generating',
    teacher_full_name: 'Mozzi Feliciano'
  };

  get totalItems(): number {
    return this.exam.exercises.reduce((acc, exercise) => acc + exercise.items.length, 0);
  }

  get teacherDisplayName(): string {
    return this.exam.teacher_full_name ?? 'Unassigned';
  }

  get coordinatorDisplayName(): string {
    return this.exam.coordinator_full_name ?? 'Unassigned';
  }

  get createdAtLabel(): string {
    const date = new Date(this.exam.date_created);

    if (Number.isNaN(date.getTime())) {
      return this.exam.date_created;
    }

    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
