import {Component, EventEmitter, Input, Output} from '@angular/core';

@Component({
  selector: 'app-capture-button',
  standalone: true,
  imports: [],
  templateUrl: './capture-button.component.html',
  styleUrl: './capture-button.component.scss'
})
export class CaptureButtonComponent {
  @Input() enabled: boolean = true;
  @Output() capture = new EventEmitter<void>();
}
