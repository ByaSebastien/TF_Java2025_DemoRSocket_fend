import {Component, inject, OnDestroy, signal, Signal, WritableSignal} from '@angular/core';
import {ConversationService} from '../../services/conversation.service';
import {ConversationDtoModel} from '../../models/conversation-dto.model';
import {FormsModule} from '@angular/forms';
import {Conversation} from '../../components/conversation/conversation';

@Component({
  selector: 'app-conversation-index',
  imports: [
    FormsModule,
    Conversation
  ],
  templateUrl: './conversation-index.html',
  styleUrl: './conversation-index.scss'
})
export class ConversationIndex implements OnDestroy {

  private readonly _conversationService = inject(ConversationService);

  conversations: Signal<ConversationDtoModel[]> = this._conversationService.conversations;

  conversationInput: string = '';

  currentConversationId: WritableSignal<string|undefined> = signal(undefined);

  constructor() {
    this._conversationService.subscribeToAllConversations();
  }

  postConversation() {
    let conversationName = this.conversationInput.trim();

    if(!conversationName){
      return;
    }

    this._conversationService.sendConversation({name: conversationName});
  }

  setConversation(conversationId: string){
    this.currentConversationId.set(conversationId);
  }

  ngOnDestroy(): void {
    this._conversationService.disconnect();
  }
}
