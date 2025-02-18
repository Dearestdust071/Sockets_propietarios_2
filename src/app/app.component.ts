import { Component, inject, Input } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { WebsocketsServiceService } from './services/websockets.service.service';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { debounceTime } from 'rxjs';
import { CommonModule, NgFor } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  host: {ngSkipHydration: 'true'},
  imports: [RouterOutlet, FormsModule, ReactiveFormsModule, NgFor, CommonModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'], // Cambiado a styleUrls
})
export class AppComponent {
  private formBuilder: FormBuilder = inject(FormBuilder); //Inyectamos formbuilder
  private ws: WebsocketsServiceService = inject(WebsocketsServiceService); //Inyectamos servicio

  formulario: FormGroup = this.formBuilder.group({ //caja de texto formulario de rooms
    msg: new FormControl(''),
  });

  formulario3: FormGroup = this.formBuilder.group({ //caja de texto formulario de rooms
    msg: new FormControl(''),
  }); 

  formulario2: FormGroup = this.formBuilder.group({ 
    rooms: new FormControl([]),
  }); 

  title = 'prueba';
  roomNameStored = '';
  roomAvailable:any;
  eventName = '';

  async ngAfterViewInit() {
    this.ListenMessageForRoom();
    this.ListenFormChanges();
    this.ListenAvailableRooms();
  }

  ListenFormChanges(){
    //escuchar los cambios del formulario
    this.formulario.get('msg')?.valueChanges.pipe(
      debounceTime(500)
    ).subscribe(value => {
      this.ws.EmitToRoom(this.roomNameStored, this.formulario.value.msg);
    });
  }

  // Listen() { //Escucha los mensajes del socket
  //   this.ws.observable.subscribe((msg: string) => {
  //     this.formulario.get('msg')?.patchValue(msg, { emitEvent: false });
  //   });
  // }

  ListenAvailableRooms() { //Escucha las rooms disponibles (tarea)
    this.ws.Listen('rooms').subscribe((ListOfRooms: any) => {
      console.log(ListOfRooms);
      // this.formulario2.get('rooms')?.patchValue(room, { emitEvent: false });
      this.roomAvailable = ListOfRooms;
    });
  }

  ListenMessageForRoom() { //Escucha los mensajes de las rooms
    this.ws.Listen('message').subscribe((msg: string) => {
      // En de abajo se cambia para parchar un formulario o espacio para poner la informacion necesaria
      console.log(msg);
      this.formulario.get('msg')?.patchValue(msg, { emitEvent: false });
    });
  }

  JoinRoom(roomName: string){
    // console.log("Sientro en joiun roroomos aosdm ");
    
    if(this.roomNameStored != ''){
      this.ws.LeaveRoom(this.roomNameStored);
    }
    this.roomNameStored = roomName; //Actualiza la room a la que declaramos en el front
    this.ws.JoinRoom(roomName); //nos unimos a la room especificada
    this.ListenMessageForRoom();//llamamos el metodo listen room para empezar a escuhar a la nueva sala
    // this.ListenRoo();//llamamos el metodo listen room para empezar a escuhar a la nueva sala
    this.ListenFormChanges(); //escucha los cambios en los otros formularios
    this.formulario3.reset(); //resetea el input
  }

  CreateRoom(roomName: string){
    this.ws.CreateRoom(roomName);



    this.ListenFormChanges(); //escucha los cambios en los otros formularios
    this.formulario3.reset();
  }

}
