import {Component, inject, OnDestroy} from '@angular/core';
import {SimpleChatService} from '../../services/simple-chat.service';
import {SimpleMessageModel} from '../../models/simple-message.model';
import {FormsModule} from '@angular/forms';

@Component({
  selector: 'app-simple-chat-index',
  imports: [
    FormsModule
  ],
  templateUrl: './simple-chat-index.html',
  styleUrl: './simple-chat-index.scss'
})
export class SimpleChatIndex implements OnDestroy{

  private readonly _simpleChatService: SimpleChatService = inject(SimpleChatService);

  messages: SimpleMessageModel[] = [];

  newMessage: string = '';

  constructor() {
    this._simpleChatService.subscribe();
    this._simpleChatService.message$.subscribe(
      (message) => {
        this.messages.push(message);
      }
    );
  }

  sendMessage() {
    let message = this.newMessage.trim();

    if(!message){
      return;
    }

    this._simpleChatService.sendMessage({content: message});
    this.newMessage = '';
  }

  sendRequestResponseMessage() {
    let message = this.newMessage.trim();

    if(!message){
      return;
    }

    this._simpleChatService.sendRequestResponseMessage({content: message}).then(
      (result) => {
        console.log(result);
        this.newMessage = '';
      }
    );
  }

  ngOnDestroy(): void {
    this._simpleChatService.disconnect();
  }
}
