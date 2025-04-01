import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DirectionalSelectorComponent } from './directional-selector.component';

describe('DirectionalSelectorComponent', () => {
  let component: DirectionalSelectorComponent;
  let fixture: ComponentFixture<DirectionalSelectorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DirectionalSelectorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DirectionalSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
