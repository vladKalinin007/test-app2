import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RoomGeometryComponent } from './room-geometry.component';

describe('RoomGeometryComponent', () => {
  let component: RoomGeometryComponent;
  let fixture: ComponentFixture<RoomGeometryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RoomGeometryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RoomGeometryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
