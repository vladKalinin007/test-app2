import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {ObjectCaptureComponent} from './features/object-capture/object-capture.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ObjectCaptureComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'app-360';
}
