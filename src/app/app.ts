import { Component } from '@angular/core';
//import { RouterOutlet } from '@angular/router';
//import { ButtonComponent } from './button-component/button-component';
//import { Counter } from './counter/counter';
import { ConCat } from "./concat/concat";


@Component({
  selector: 'app-root',
  imports: [ConCat],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected title = 'myFirstApp';

}
