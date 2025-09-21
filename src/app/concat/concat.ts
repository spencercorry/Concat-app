import { Component } from '@angular/core';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatButtonToggleModule} from '@angular/material/button-toggle';
import { MatButtonToggleGroup } from "@angular/material/button-toggle";
import {MatButtonModule} from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import {FormsModule} from '@angular/forms';
import {MatToolbarModule} from '@angular/material/toolbar';

@Component({
  selector: 'app-concat',
  imports: [MatButtonToggleGroup, MatButtonToggleModule, MatFormFieldModule, MatButtonModule, MatIconModule,MatInputModule,FormsModule,MatToolbarModule],
  templateUrl: './concat.html',
  styleUrl: './concat.scss'
})
export class ConCat {

  inputText:string = ""
  outputText:string = ""
  wrap:number = 5
  outputLength:number = 0

  concat(input:string, wrapInput:number, option:string){

    this.outputText = ''
    this.wrap = wrapInput
    

    let inputArray:string[] = input.split(/\r?\n/)

    inputArray = inputArray.filter((s) => s != '')

    let inputSet = new Set(inputArray);

    inputArray = Array.from(inputSet)

    this.outputLength = inputArray.length

    if (option == "SQLString"){

      for(let i:number=0; i<inputArray.length; i++){


        if (i == inputArray.length-1){
          this.outputText+= "'"+ inputArray[i].trim() +"'"
        }
        else{
          this.outputText+= "'"+ inputArray[i].trim() +"'"+","
        }

        if ((i+1) % this.wrap ==0){
          this.outputText+="\n"
        }
      }
    }
    else if (option == "SemiColon"){

      for(let i:number=0; i<inputArray.length; i++){

      this.outputText+= inputArray[i].trim()+";"

      if ((i+1) % this.wrap ==0){
        this.outputText+="\n"
      }

    }
  }
    else if (option == "Comma"){

      for(let i:number=0; i<inputArray.length; i++){

        if (i == inputArray.length-1){
            this.outputText+= inputArray[i].trim()
          }
          else{
            this.outputText+= inputArray[i].trim() +","
          }

      if ((i+1) % this.wrap ==0){
        this.outputText+="\n"
      }

    }
  }


  }

  clearFields(){
    this.inputText = ""
    this.outputText = ""
    this.outputLength = 0
  }

  onToggleChange(value:string){
    console.log(value)

  }
}