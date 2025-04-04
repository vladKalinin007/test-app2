import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MirrorFloorComponent } from './mirror-floor.component';

describe('MirrorFloorComponent', () => {
  let component: MirrorFloorComponent;
  let fixture: ComponentFixture<MirrorFloorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MirrorFloorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MirrorFloorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
