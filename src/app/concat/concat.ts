import { Component, signal, computed, effect } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-concat',
  imports: [MatButtonModule, FormsModule],
  templateUrl: './concat.html',
  styleUrl: './concat.scss',
})
export class ConCat {
  inputText = signal('');
  committedInput = signal('');

  // Persisted signals — initialized from localStorage, defaults applied on first visit
  selectedOption = signal(
    localStorage.getItem('dlimitr_option') ?? 'SQLString',
  );
  wrap = signal(Number(localStorage.getItem('dlimitr_wrap') ?? '5'));
  wrapper = signal(localStorage.getItem('dlimitr_wrapper') ?? 'None');

  // UI state
  showHelp = signal(false);
  copied = signal(false);

  constructor() {
    effect(() => localStorage.setItem('dlimitr_option', this.selectedOption()));
    effect(() => localStorage.setItem('dlimitr_wrap', String(this.wrap())));
    effect(() => localStorage.setItem('dlimitr_wrapper', this.wrapper()));
  }

  result = computed(() => {
    let inputArray = this.committedInput()
      .split(/\r?\n/)
      .filter((s) => s !== '')
      .map((item) => item.trim());

    inputArray = Array.from(new Set(inputArray));

    const wrap = this.wrap();
    const option = this.selectedOption();
    let outputText = '';

    if (option === 'SQLString') {
      for (let i = 0; i < inputArray.length; i++) {
        const isLast = i === inputArray.length - 1;
        const isWrapBoundary = (i + 1) % wrap === 0;
        outputText += isLast ? `'${inputArray[i]}'` : `'${inputArray[i]}',`;
        if (isWrapBoundary && !isLast) outputText += '\n';
      }
    } else if (option === 'SemiColon') {
      for (let i = 0; i < inputArray.length; i++) {
        const isLast = i === inputArray.length - 1;
        const isWrapBoundary = (i + 1) % wrap === 0;
        outputText += inputArray[i] + ';';
        if (isWrapBoundary && !isLast) outputText += '\n';
      }
    } else if (option === 'Comma') {
      for (let i = 0; i < inputArray.length; i++) {
        const isLast = i === inputArray.length - 1;
        const isWrapBoundary = (i + 1) % wrap === 0;
        outputText += isLast ? inputArray[i] : inputArray[i] + ',';
        if (isWrapBoundary && !isLast) outputText += '\n';
      }
    }

    const w = this.wrapper();
    const finalText =
      inputArray.length === 0
        ? outputText
        : w === '()'
          ? `(${outputText})`
          : w === '{}'
            ? `{${outputText}}`
            : outputText;

    return { text: finalText, length: inputArray.length };
  });

  format() {
    this.committedInput.set(this.inputText());
  }

  clearFields() {
    this.inputText.set('');
    this.committedInput.set('');
  }

  copyOutput() {
    navigator.clipboard.writeText(this.result().text).then(() => {
      this.copied.set(true);
      setTimeout(() => this.copied.set(false), 1500);
    });
  }
}
