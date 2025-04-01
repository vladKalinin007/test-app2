import { Routes } from '@angular/router';
import {ObjectCaptureComponent} from './features/object-capture/object-capture.component';
import {ShowroomComponent} from './features/showroom/showroom.component';

export const routes: Routes = [
  {
    path: 'camera',
    component: ObjectCaptureComponent
  },
  {
    path: 'showroom',
    component: ShowroomComponent
  }
];
