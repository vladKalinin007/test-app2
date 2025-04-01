import {BoundingBox} from './bounding-box.model';

export interface Silhouette {
  box: BoundingBox;
  path2D: number[][]; // упрощённый контур
}
