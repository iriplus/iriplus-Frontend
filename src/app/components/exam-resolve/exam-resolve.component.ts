import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

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

interface ResolveItemView {
  promptBefore: string;
  promptAfter: string;
  keyword: string | null;
  options: string[];
  studentAnswer: string;
}

interface ResolveExerciseView {
  exercise_type: string;
  instructions: string;
  items: ResolveItemView[];
}

@Component({
  selector: 'app-exam-resolve',
  imports: [CommonModule, FormsModule],
  templateUrl: './exam-resolve.component.html',
  styleUrl: './exam-resolve.component.css'
})

export class ExamResolveComponent {
  studentName = 'Emma Carter';

  exam: ExamMock = {
    class_description: 'FCE',
    class_id: 13,
    context:
      `Modern urban planning is shifting its focus toward sustainable living to combat the challenges of climate change and rapid population growth. Many cities are now investing in extensive public transport networks and dedicated cycling lanes to reduce the number of cars on the road, which helps lower carbon emissions and improves air quality. Additionally, the integration of "green spaces," such as rooftop gardens and community parks, provides residents with a much-needed escape from the concrete environment while supporting local biodiversity. However, critics argue that these eco-friendly developments can lead to higher property prices, potentially making city centers unaffordable for many people. Balancing environmental progress with social equality remains one of the most significant hurdles for future architects and local governments.`,
    coordinator_full_name: null,
    coordinator_id: null,
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
            answer: "don't forget",
            question:
              'My secretary made me remember I had to post my application form. FORGET'
          },
          {
            answer: 'used to find',
            question:
              "It's getting easier for me to do the writing tasks. USED"
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
    notes: null,
    status: 'In Progress',
    teacher_full_name: null
  };

  exerciseViews: ResolveExerciseView[] = this.exam.exercises.map((exercise) => ({
    exercise_type: exercise.exercise_type,
    instructions: exercise.instructions,
    items: exercise.items.map((item) => this.buildResolveItem(item))
  }));

  get totalItems(): number {
    return this.exerciseViews.reduce((acc, exercise) => acc + exercise.items.length, 0);
  }

  get answeredItems(): number {
    return this.exerciseViews.reduce(
      (acc, exercise) =>
        acc +
        exercise.items.filter((item) => item.studentAnswer.trim().length > 0).length,
      0
    );
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

  private buildResolveItem(item: ExamItem): ResolveItemView {
    const options = this.extractOptions(item.question);
    let cleanedQuestion = this.removeOptions(item.question).replace(/\(\s*\)\s*$/, '').trim();

    const keyword = this.extractKeyword(cleanedQuestion);

    if (keyword) {
      cleanedQuestion = cleanedQuestion.slice(0, cleanedQuestion.lastIndexOf(keyword)).trim();
    }

    const promptParts = this.splitAroundAnswer(cleanedQuestion, item.answer);

    return {
      promptBefore: promptParts.before,
      promptAfter: promptParts.after,
      keyword,
      options,
      studentAnswer: ''
    };
  }

  private splitAroundAnswer(question: string, answer: string): { before: string; after: string } {
    const escapedAnswer = answer.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(escapedAnswer, 'i');
    const match = question.match(regex);

    if (!match || match.index === undefined) {
      return {
        before: question,
        after: ''
      };
    }

    return {
      before: question.slice(0, match.index).trim(),
      after: question.slice(match.index + match[0].length).trim()
    };
  }

  private extractKeyword(question: string): string | null {
    const match = question.match(/\b([A-Z][A-Z-]*)\b\s*$/);
    return match ? match[1] : null;
  }

  private removeOptions(question: string): string {
    return question.replace(/\([A-Z]\)\s*[^()]+(?=(\s*\([A-Z]\))|$)/g, '').trim();
  }

  private extractOptions(question: string): string[] {
    const matches = [...question.matchAll(/\([A-Z]\)\s*([^()]+?)(?=\s*\([A-Z]\)|$)/g)];
    return matches.map((match) => match[1].trim());
  }
}
