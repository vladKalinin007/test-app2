import { Injectable } from '@angular/core';
import {BoundingBox} from '../models/bounding-box.model';

// silhouette.service.ts
//
// Цель:
// - Построить шаблон (силуэт) по текущему объекту.
// - Масштабировать этот шаблон до эталонного вида (нормализация).
// - Хранить эталонный bounding box для последующей валидации.
//
// Детали:
//
// 1. Метод `setTemplate(box: BoundingBox)`:
//    - Сохраняет шаблон для текущего угла (front, left и т. д.).
//    - Может быть вызван в ручном или автоматическом режиме (например, пользователь нажимает «создать шаблон»).
//
// 2. Метод `getTemplate()`:
//    - Предоставляет сохранённый шаблон при валидации.
//
// 3. Метод `normalizeBox()`:
//    - Приводит bounding box к нормализованным координатам (в долях от ширины/высоты).
//    - Это позволяет применять шаблон независимо от разрешения видео.
//    - Например: (x = 100 / 640) = 0.15625.
@Injectable({ providedIn: 'root' })
export class SilhouetteService {
  private targetBox: BoundingBox | null = null;

  setTemplate(box: BoundingBox): void {
    this.targetBox = box;
    console.log('[SilhouetteService] Установлен шаблон (template bounding box):', box);
  }

  getTemplate(): BoundingBox | null {
    if (this.targetBox) {
      console.log('[SilhouetteService] Получен текущий шаблон:', this.targetBox);
    } else {
      console.warn('[SilhouetteService] Шаблон не установлен (null)');
    }
    return this.targetBox;
  }

  normalizeBox(box: BoundingBox, refWidth: number, refHeight: number): BoundingBox {
    const normalized: BoundingBox = {
      x: box.x / refWidth,
      y: box.y / refHeight,
      width: box.width / refWidth,
      height: box.height / refHeight,
    };

    console.log('[SilhouetteService] Нормализация bounding box:');
    console.log(`  Исходный box:`, box);
    console.log(`  Эталон: ${refWidth}x${refHeight}`);
    console.log(`  Нормализованный box:`, normalized);

    return normalized;
  }
}
