import { Injectable } from '@angular/core';
import {BoundingBox} from '../models/bounding-box.model';

// validation.service.ts
//
// Цель:
// - Проверить, вписывается ли текущий объект (на видео) в шаблонный силуэт.
// - Решение «да» или «нет» влияет на разрешение съёмки.
//
// Внутренние детали:
// 1. Описание входных данных:
//    - `current`: текущий bounding box (ширина, высота, позиция объекта).
//    - `template`: эталонный bounding box (силуэт).
//    - `tolerance`: допустимое отклонение (в процентах, например 5%).
//
// 2. Алгоритм:
//    - Сравниваются по 4 параметрам: `x`, `y`, `width`, `height`.
//    - Если абсолютное отклонение каждого из них меньше `tolerance`, объект считается «выровненным».
//    - Возвращается булево значение `true | false`.
//
// 3. Использование:
//    - Отдельно отрисовывается шаблон через `overlay.component.ts`.
//    - Когда объект попадает в допустимые рамки, шаблон становится зелёным.
//    - Только в этом случае разрешается вызвать `capture.service.ts`.
@Injectable({ providedIn: 'root' })
export class ValidationService {
  isAligned(current: BoundingBox, template: BoundingBox, tolerance = 0.05): boolean {
    const dx = Math.abs(current.x - template.x);
    const dy = Math.abs(current.y - template.y);
    const dw = Math.abs(current.width - template.width);
    const dh = Math.abs(current.height - template.height);

    console.log('[ValidationService] Проверка совпадения bounding box:');
    console.log(`  dx = ${dx.toFixed(4)}, dy = ${dy.toFixed(4)}, dw = ${dw.toFixed(4)}, dh = ${dh.toFixed(4)}`);
    console.log(`  tolerance = ${tolerance}`);

    const aligned = dx < tolerance && dy < tolerance && dw < tolerance && dh < tolerance;

    console.log(`[ValidationService] Результат: ${aligned ? 'OK ✅' : 'FAIL ❌'}`);

    return aligned;
  }
}
