import { Component } from '@angular/core';
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
