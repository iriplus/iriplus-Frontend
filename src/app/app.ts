import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NotificationHostComponent } from './components/ui/notification-host/notification-host.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NotificationHostComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})


export class App {
  protected readonly title = signal('iriplus-Frontend');
}
