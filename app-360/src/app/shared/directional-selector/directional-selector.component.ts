import {Component, EventEmitter, Input, Output} from '@angular/core';
import {Direction} from '../../core/models/direction.enum';
import {NgForOf} from '@angular/common';

@Component({
  selector: 'app-directional-selector',
  standalone: true,
  imports: [
    NgForOf
  ],
  templateUrl: './directional-selector.component.html',
  styleUrl: './directional-selector.component.scss'
})
export class DirectionalSelectorComponent {
  @Input() current!: Direction;
  @Output() directionChanged = new EventEmitter<Direction>();

  directions = Object.values(Direction) as Direction[];

  selectDirection(dir: Direction): void {
    this.directionChanged.emit(dir);
  }

  protected readonly Direction = Direction;
}
