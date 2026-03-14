import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: 'exam-review/:id',
    renderMode: RenderMode.Server
  },
  {
    path: 'exam-revise/:id',
    renderMode: RenderMode.Server
  },
  {
    path: 'exam-resolve/:id',
    renderMode: RenderMode.Server
  },
  {
    path: 'view-exam/:id',
    renderMode: RenderMode.Server
  },
  {
    path: '**',
    renderMode: RenderMode.Prerender
  }
];
