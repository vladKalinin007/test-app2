import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CurvedLightsComponent } from './curved-lights.component';

describe('CurvedLightsComponent', () => {
  let component: CurvedLightsComponent;
  let fixture: ComponentFixture<CurvedLightsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CurvedLightsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CurvedLightsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
