import { Component, signal } from '@angular/core';
import {ConversationIndex} from './features/conversation/pages/conversation-index/conversation-index';

@Component({
  selector: 'app-root',
  imports: [ConversationIndex],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('TF_Java2025_DemoRSocket_fend');
}
