import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { ConCat } from './concat';

describe('ConCat', () => {
  let component: ConCat;
  let fixture: ComponentFixture<ConCat>;

  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({ imports: [ConCat] }).compileComponents();
    fixture = TestBed.createComponent(ConCat);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  function run(input: string, option: string, wrap: number, wrapper: string) {
    component.committedInput.set(input);
    component.selectedOption.set(option);
    component.wrap.set(wrap);
    component.wrapper.set(wrapper);
    return component.result();
  }

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // ── SQLString ──────────────────────────────────────────────────────────────

  describe('SQLString', () => {
    it('wraps each item in single quotes separated by commas', () => {
      expect(run('apple\nbanana\ncherry', 'SQLString', 5, 'None').text)
        .toBe("'apple','banana','cherry'");
    });

    it('last item has no trailing comma', () => {
      expect(run('only', 'SQLString', 5, 'None').text).toBe("'only'");
    });

    it('inserts a newline after every Nth item', () => {
      expect(run('a\nb\nc\nd', 'SQLString', 2, 'None').text)
        .toBe("'a','b',\n'c','d'");
    });

    it('wrap=1 puts each item on its own line', () => {
      expect(run('a\nb\nc', 'SQLString', 1, 'None').text)
        .toBe("'a',\n'b',\n'c'");
    });

    it('wrap larger than item count produces no newlines', () => {
      expect(run('a\nb', 'SQLString', 10, 'None').text).toBe("'a','b'");
    });

    it('produces a valid SQL IN-clause list when wrapped with parentheses', () => {
      const input = [
        'AL', 'AK', 'AZ', 'AR',
        'CA', 'CO', 'CT', 'DE',
        'FL', 'GA', 'HI', 'ID',
      ].join('\n');

      const result = run(input, 'SQLString', 4, '()');

      // Ready to paste directly into: WHERE state_code IN (...)
      expect(result.text).toBe(
        "('AL','AK','AZ','AR',\n'CA','CO','CT','DE',\n'FL','GA','HI','ID')"
      );
      expect(result.length).toBe(12);
    });
  });

  // ── SemiColon ─────────────────────────────────────────────────────────────

  describe('SemiColon', () => {
    it('appends a semicolon to every item including the last', () => {
      expect(run('apple\nbanana\ncherry', 'SemiColon', 5, 'None').text)
        .toBe('apple;banana;cherry;');
    });

    it('inserts a newline after every Nth item', () => {
      expect(run('a\nb\nc\nd', 'SemiColon', 2, 'None').text)
        .toBe('a;b;\nc;d;');
    });

    it('single item gets a semicolon', () => {
      expect(run('only', 'SemiColon', 5, 'None').text).toBe('only;');
    });
  });

  // ── Comma ─────────────────────────────────────────────────────────────────

  describe('Comma', () => {
    it('separates items with commas, no trailing comma', () => {
      expect(run('apple\nbanana\ncherry', 'Comma', 5, 'None').text)
        .toBe('apple,banana,cherry');
    });

    it('single item has no trailing comma', () => {
      expect(run('only', 'Comma', 5, 'None').text).toBe('only');
    });

    it('inserts a newline after every Nth item', () => {
      expect(run('a\nb\nc\nd', 'Comma', 2, 'None').text)
        .toBe('a,b,\nc,d');
    });

    it('wrap=1 puts each item on its own line', () => {
      expect(run('a\nb\nc', 'Comma', 1, 'None').text)
        .toBe('a,\nb,\nc');
    });
  });

  // ── Deduplication ─────────────────────────────────────────────────────────

  describe('deduplication', () => {
    it('removes duplicate lines', () => {
      const r = run('apple\nbanana\napple', 'Comma', 5, 'None');
      expect(r.text).toBe('apple,banana');
      expect(r.length).toBe(2);
    });

    it('preserves first-occurrence order', () => {
      expect(run('b\na\nb\nc\na', 'Comma', 5, 'None').text).toBe('b,a,c');
    });

    it('treats trimmed duplicates as the same item', () => {
      const r = run('apple\n  apple  \nbanana', 'Comma', 5, 'None');
      expect(r.length).toBe(2);
      expect(r.text).toBe('apple,banana');
    });
  });

  // ── Whitespace trimming ───────────────────────────────────────────────────

  describe('whitespace trimming', () => {
    it('trims leading and trailing spaces', () => {
      expect(run('  apple  \n  banana  ', 'SQLString', 5, 'None').text)
        .toBe("'apple','banana'");
    });

    it('trims tabs', () => {
      expect(run('\tapple\t\n\tbanana\t', 'Comma', 5, 'None').text)
        .toBe('apple,banana');
    });
  });

  // ── Empty lines ───────────────────────────────────────────────────────────

  describe('empty lines', () => {
    it('ignores blank lines between items', () => {
      const r = run('apple\n\nbanana\n', 'Comma', 5, 'None');
      expect(r.text).toBe('apple,banana');
      expect(r.length).toBe(2);
    });

    it('returns empty text and length 0 for blank input', () => {
      const r = run('', 'SQLString', 5, 'None');
      expect(r.text).toBe('');
      expect(r.length).toBe(0);
    });

    it('returns empty text and length 0 for whitespace-only input', () => {
      const r = run('\n\n\n', 'Comma', 5, 'None');
      expect(r.text).toBe('');
      expect(r.length).toBe(0);
    });
  });

  // ── CRLF line endings ─────────────────────────────────────────────────────

  describe('CRLF line endings', () => {
    it('handles Windows \\r\\n line endings', () => {
      expect(run('apple\r\nbanana\r\ncherry', 'Comma', 5, 'None').text)
        .toBe('apple,banana,cherry');
    });

    it('handles mixed \\r\\n and \\n endings', () => {
      expect(run('apple\r\nbanana\ncherry', 'Comma', 5, 'None').text)
        .toBe('apple,banana,cherry');
    });
  });

  // ── Wrapper ───────────────────────────────────────────────────────────────

  describe('wrapper', () => {
    it('surrounds the entire output with parentheses for ()', () => {
      expect(run('apple\nbanana', 'Comma', 5, '()').text)
        .toBe('(apple,banana)');
    });

    it('surrounds the entire output with braces for {}', () => {
      expect(run('apple\nbanana', 'Comma', 5, '{}').text)
        .toBe('{apple,banana}');
    });

    it('leaves output unwrapped for None', () => {
      expect(run('apple\nbanana', 'Comma', 5, 'None').text)
        .toBe('apple,banana');
    });

    it('does not apply wrapper when input is empty', () => {
      expect(run('', 'Comma', 5, '()').text).toBe('');
      expect(run('', 'Comma', 5, '{}').text).toBe('');
    });

    it('wrapper applies to SQLString output', () => {
      expect(run('a\nb', 'SQLString', 5, '()').text).toBe("('a','b')");
    });

    it('wrapper applies to SemiColon output', () => {
      expect(run('a\nb', 'SemiColon', 5, '{}').text).toBe('{a;b;}');
    });
  });

  // ── length ────────────────────────────────────────────────────────────────

  describe('length', () => {
    it('reflects the unique item count', () => {
      expect(run('a\nb\nc\na', 'SQLString', 5, 'None').length).toBe(3);
    });

    it('is 0 for empty input', () => {
      expect(run('', 'SQLString', 5, 'None').length).toBe(0);
    });

    it('counts after deduplication, not before', () => {
      expect(run('x\nx\nx', 'Comma', 5, 'None').length).toBe(1);
    });
  });

  // ── format() gate ─────────────────────────────────────────────────────────

  describe('format() gate', () => {
    it('result does not change when inputText changes without calling format()', () => {
      component.committedInput.set('apple');
      component.selectedOption.set('Comma');
      component.wrap.set(5);
      component.wrapper.set('None');
      const before = component.result().text;

      component.inputText.set('apple\nbanana\ncherry');

      expect(component.result().text).toBe(before);
    });

    it('result updates after format() is called', () => {
      component.committedInput.set('apple');
      component.selectedOption.set('Comma');
      component.wrap.set(5);
      component.wrapper.set('None');

      component.inputText.set('apple\nbanana');
      component.format();

      expect(component.result().text).toBe('apple,banana');
    });
  });

  // ── copyOutput() ──────────────────────────────────────────────────────────

  describe('copyOutput()', () => {
    let writeTextSpy: jasmine.Spy;

    beforeEach(() => {
      writeTextSpy = jasmine.createSpy('writeText').and.returnValue(Promise.resolve());
      Object.defineProperty(navigator, 'clipboard', {
        value: { writeText: writeTextSpy },
        configurable: true,
      });
    });

    it('passes extremely large output to the clipboard without error', fakeAsync(() => {
      const items = Array.from({ length: 10_000 }, (_, i) => `item_${i}`);
      component.committedInput.set(items.join('\n'));
      component.selectedOption.set('SQLString');
      component.wrap.set(5);
      component.wrapper.set('None');

      component.copyOutput();
      tick(); // flush the resolved Promise

      const expected = component.result().text;
      expect(writeTextSpy).toHaveBeenCalledOnceWith(expected);
      expect(expected.length).toBeGreaterThan(100_000);
      expect(component.result().length).toBe(10_000);
      expect(component.copied()).toBeTrue();

      tick(1500); // flush the copied-reset timeout
      expect(component.copied()).toBeFalse();
    }));
  });

  // ── clearFields() ─────────────────────────────────────────────────────────

  describe('clearFields()', () => {
    it('resets inputText to empty string', () => {
      component.inputText.set('apple\nbanana');
      component.clearFields();
      expect(component.inputText()).toBe('');
    });

    it('resets committedInput to empty string', () => {
      component.committedInput.set('apple\nbanana');
      component.clearFields();
      expect(component.committedInput()).toBe('');
    });

    it('result is empty after clearing', () => {
      component.committedInput.set('apple\nbanana');
      component.selectedOption.set('Comma');
      component.wrap.set(5);
      component.wrapper.set('None');
      component.clearFields();
      const r = component.result();
      expect(r.text).toBe('');
      expect(r.length).toBe(0);
    });
  });
});
