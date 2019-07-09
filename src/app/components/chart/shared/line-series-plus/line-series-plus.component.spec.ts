import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LineSeriesPlusComponent } from './line-series-plus.component';

describe('LineSeriesPlusComponent', () => {
  let component: LineSeriesPlusComponent;
  let fixture: ComponentFixture<LineSeriesPlusComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LineSeriesPlusComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LineSeriesPlusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
