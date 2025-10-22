import {inject, Injectable, signal} from '@angular/core';
import {RsocketConnectionService} from '../../../shared/services/rsocket-connection.service';
import {firstValueFrom, Subject} from 'rxjs';
import {SimpleMessageModel} from '../models/simple-message.model';

@Injectable({
  providedIn: 'root'
})
export class SimpleChatService {

  private _rsocketConnectionService = inject(RsocketConnectionService);

  private _message$: Subject<SimpleMessageModel> = new Subject<SimpleMessageModel>();

  private _subscription: any;

  get message$() {
    return this._message$.asObservable();
  }

  subscribe() {
    this._rsocketConnectionService.connection$.subscribe(connection => {
      let canal = 'simple-chat';

      connection.requestStream({
        metadata: String.fromCharCode(canal.length) + canal,
      }).subscribe({
        onNext: (result: any) => {
          this._message$.next(result.data);
        },
        onError: (err: any) => {
          console.log(err);
          this.handleReconnection();
        },
        onSubscribe: (subscription: any) => {
          subscription.request(2147483647);
          this._subscription = subscription;
          console.log("Sub ok");
        },
        onComplete: () => {
          console.log("Finished subscribing");
        }
      });
    })
  }

  handleReconnection() {
    console.log("Reconnecting...");
    setTimeout(() => {
      this._rsocketConnectionService.client.connect().then(
        () => this.subscribe()
      );
    }, 5000);
  }

  sendMessage(message: SimpleMessageModel) {
    this._rsocketConnectionService.connection$.subscribe(
      connection => {
        let canal = 'send-simple-message';
        return connection.fireAndForget({
          metadata: String.fromCharCode(canal.length) + canal,
          data: message
        });
      }
    );
  }

  async sendRequestResponseMessage(message: SimpleMessageModel) {
    const connection = await firstValueFrom(this._rsocketConnectionService.connection$);

    let canal = 'request-response-simple-message';

    return connection.requestResponse({
      metadata: String.fromCharCode(canal.length) + canal,
      data: message
    });
  }

  disconnect() {
    if(this._subscription) {
      this._subscription.cancel();
      this._subscription = null;
      console.log("Disconnected from simple chat");
    }
  }
}
