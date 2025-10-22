import { Injectable } from '@angular/core';
import {IdentitySerializer, JsonSerializer, RSocketClient} from 'rsocket-core';
import {ReplaySubject, take} from 'rxjs';
import RSocketWebSocketClient from 'rsocket-websocket-client';

@Injectable({
  providedIn: 'root'
})
export class RsocketConnectionService {

  private _client: RSocketClient<any, any>;
  private _connection$: ReplaySubject<any> = new ReplaySubject<any>(1);

  constructor() {

    this._client = new RSocketClient({
      serializers: {
        data: JsonSerializer,
        metadata: IdentitySerializer,
      },
      setup: {
        keepAlive: 10000,
        lifetime: 20000,
        dataMimeType: 'application/json',
        metadataMimeType: 'message/x.rsocket.routing.v0'
      },
      transport: new RSocketWebSocketClient({
        url: 'ws://localhost:7000/rsocket',
      })
    });

    this.connect();
  }

  private connect() {
    if(this._connection$.observed){
      return;
    }
    this._client.connect().subscribe({
      onComplete: (con) => {
        console.log("Connected to RSocket");
        this._connection$.next(con);
      },
      onError: (err) => {
        console.log(err);
      }
    });
  }

  get client() {
    return this._client;
  }

  get connection$() {
    return this._connection$.asObservable().pipe(take(1));
  }
}
