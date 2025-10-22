import {inject, Injectable, signal} from '@angular/core';
import {RsocketConnectionService} from '../../../shared/services/rsocket-connection.service';
import {ConversationDtoModel} from '../models/conversation-dto.model';
import {MessageDtoModel} from '../models/message-dto.model';
import {ConversationFormModel} from '../models/conversation-form.model';
import {MessageFormModel} from '../models/message-form.model';

@Injectable({
  providedIn: 'root'
})
export class ConversationService {

  private readonly _rSocketConnectionService = inject(RsocketConnectionService);

  conversations = signal<ConversationDtoModel[]>([]);
  messages = signal<MessageDtoModel[]>([]);

  private _conversationSubscription: any;
  private _messageSubscription: any;


  subscribeToAllConversations() {
    this._rSocketConnectionService.connection$.subscribe(connection => {

      let canal = 'conversation-list';

      connection.requestStream({
        metadata: String.fromCharCode(canal.length) + canal,
      }).subscribe({
        onNext: (result: any) => {
          this.conversations.update((c) => [...c,result.data]);
        },
        onError: (err: any) => {
          console.log(err);
          console.log('Tentative de reconnection');
          setTimeout(() => {
            this._rSocketConnectionService.client.connect().then(
              () => this.subscribeToAllConversations()
            );
          }, 5000);
        },
        onSubscribe: (subscription: any) => {
          subscription.request(2147483647);
          this._conversationSubscription = subscription;
          console.log("Conversation subscription was subscribed");
        },
        onComplete: () => {
          console.log("Conversation finito");
        },
      });
    });
  }

  subscribeToOneConversation(conversationId: string) {

    this.disconnectOneConversation();

    this._rSocketConnectionService.connection$.subscribe(connection => {

      let canal = `conversation-chat-${conversationId}`;

      connection.requestStream({
        metadata: String.fromCharCode(canal.length) + canal,
      }).subscribe({
        onNext: (result: any) => {
          this.messages.update((m) => [...m,result.data]);
        },
        onError: (err: any) => {
          console.log(err);
          console.log('Tentative de reconnection');
          setTimeout(() => {
            this._rSocketConnectionService.client.connect().then(
              () => this.subscribeToOneConversation(conversationId),
            );
          }, 5000);
        },
        onSubscribe: (subscription: any) => {
          subscription.request(2147483647);
          this._messageSubscription = subscription;
          console.log("Message subscription was subscribed");
        },
        onComplete: () => {
          console.log("Message finito");
        },
      });
    });
  }

  sendConversation(form : ConversationFormModel) {
    this._rSocketConnectionService.connection$.subscribe(connection => {
      let canal = 'post-conversation'
      connection.fireAndForget({
        metadata: String.fromCharCode(canal.length) + canal,
        data: form,
      });
    });
  }

  sendMessage(form : MessageFormModel) {
    this._rSocketConnectionService.connection$.subscribe(connection => {
      let canal = 'send-message'
      connection.fireAndForget({
        metadata: String.fromCharCode(canal.length) + canal,
        data: form,
      });
    });
  }

  disconnect() {
    if(this._conversationSubscription) {
      this._conversationSubscription.cancel();
      this._conversationSubscription = null;
      this.conversations.set([]);
    }
  }

  disconnectOneConversation() {
    if(this._messageSubscription){
      this._messageSubscription.cancel();
      this._messageSubscription = null;
      this.messages.set([]);
    }
  }
}
