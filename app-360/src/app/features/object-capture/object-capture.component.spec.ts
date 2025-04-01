import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ObjectCaptureComponent } from './object-capture.component';

describe('ObjectCaptureComponent', () => {
  let component: ObjectCaptureComponent;
  let fixture: ComponentFixture<ObjectCaptureComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ObjectCaptureComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ObjectCaptureComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
