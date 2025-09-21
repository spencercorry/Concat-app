import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConCat } from './concat';

describe('InputField', () => {
  let component: ConCat;
  let fixture: ComponentFixture<ConCat>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConCat]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConCat);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
