import {Component, effect, inject, input, OnDestroy} from '@angular/core';
import {ConversationService} from '../../services/conversation.service';
import {FormsModule} from '@angular/forms';

@Component({
  selector: 'app-conversation',
  imports: [
    FormsModule
  ],
  templateUrl: './conversation.html',
  styleUrl: './conversation.scss'
})
export class Conversation implements OnDestroy{

  private readonly _conversationService: ConversationService = inject(ConversationService);

  conversationId = input.required<string>();

  messages = this._conversationService.messages;

  messageInput: string = '';

  constructor() {
    effect(() => {
      this._conversationService.subscribeToOneConversation(this.conversationId());
    });
  }

  sendMessage() {
    let messageContent = this.messageInput.trim();

    if(!messageContent){
      return;
    }

    this._conversationService.sendMessage({content: messageContent, conversationId: this.conversationId()});
  }

  ngOnDestroy(): void {
    this._conversationService.disconnectOneConversation();
  }
}
