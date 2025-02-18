import { isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, inject, } from '@angular/core';
import { Observable, Subject } from 'rxjs';



export interface EntryModel { //Recibe el modelo que mandamos desde .NET (modelo, sockets)
  Action_Type: string;
  Value: {
    Name: string;
    Msg: string;
    Rooms: [Room]

  };
}

export interface Room { //Recibe el modelo que mandamos desde .NET (modelo, sockets)
  RoomName: string;
    User: string;
  };



@Injectable({
  providedIn: 'root',
})
export class WebsocketsServiceService {
  
  private socket!: WebSocket; //Abre la conexion
  private socketOpenPromise: Promise<void>; //Checar que ya esté conectado
  public observable: Subject<EntryModel> = new Subject<EntryModel>(); //Recibir y ver los mensajes
  private platform_id: Object = inject(PLATFORM_ID);


  constructor() {
    //Abre la conexion
    if (isPlatformBrowser(this.platform_id) && typeof window != undefined)
      this.socket = new WebSocket('ws://192.168.30.155:9001');


    this.socketOpenPromise = new Promise<void>((resolve, reject) => {

      if (this.socket != undefined) {
        this.socket.onopen = () => {
          console.log('Se conecto a el websocket exitosamente!');
          resolve();
        };
        this.socket.onerror = (event) => {
          reject(event);
        };
      }
    });

    if (this.socket != undefined) {
      this.socket.onclose = () => {
        console.log('Disconnect');
      };
    }

    if (this.socket != undefined) {
      this.socket.onmessage = (event) => {
        console.log(event.data);
        
        try {
          const jsonObject: EntryModel = JSON.parse(event.data);
          console.log(jsonObject);
          this.observable.next(jsonObject);
          
        } catch (error) {
          console.error('Error parsing JSON:', error);
        }
      };
    }

  }

  public async Emit(content: string) {
    try {
      await this.socketOpenPromise;
      this.socket.send(content);
    } catch (error) {
      console.error('Error connecting', error);
    }
  }




  public Listen(eventName:string): Observable<any> { //Escucha los mensajes que vienen del websocket, filtrando los mensajes dependiendo su ActionType
    return new Observable<any>((observer) => {
      this.observable.subscribe((entry: EntryModel) => {
        switch (entry.Action_Type) {
          case 'message':
            if (entry.Action_Type === eventName) {
              observer.next(entry.Value.Msg)
            }
            // observer.next(entry.Value.Rooms);
            break;
            case 'rooms':
            if (entry.Action_Type === eventName) {
              observer.next(entry.Value.Rooms);
            }
            break;
            case 'join':
            if (entry.Action_Type === eventName) {
              observer.next(entry.Value.Msg);
            }
            break;
          default:
            console.error("error");
            break;
        }
      });
    });
  }

  public async JoinRoom(roomName: string) {
    try {
      await this.socketOpenPromise;
      const message = {
        Action_Type: 'join',
        Value: {
          Name: roomName,
          Msg: ''
        },
      };
      this.socket.send(JSON.stringify(message));
    } catch (error) {
      console.error('Error connecting to the WebSocket:', error);
    }
  }

  public async CreateRoom(roomName: string) {
    try {
      await this.socketOpenPromise;
      const message = {
        Action_Type: 'createRoom',
        Value: {
          Name: roomName,
          Msg: ''
        },
      };
      this.socket.send(JSON.stringify(message));
    } catch (error) {
      console.error('Error connecting to the WebSocket:', error);
    }
  }

  public async LeaveRoom(roomName: string) {
    try {
      await this.socketOpenPromise;
      const message = {
        Action_Type: 'leave',
        Value: {
          Name: roomName,
          Msg: ''
        },
      };
      this.socket.send(JSON.stringify(message));
    } catch (error) {
      console.error('Error connecting to the WebSocket:', error);
    }
  }
  
  public async EmitToRoom(roomName: string, content: string) {
    try {
      await this.socketOpenPromise;
      const message = {
        Action_Type: 'message',
        Value: {
          Name: roomName,
          Msg: content
        },
      };
      this.socket.send(JSON.stringify(message));
    } catch (error) {
      console.error('Error connecting', error);
    }
  }

}
