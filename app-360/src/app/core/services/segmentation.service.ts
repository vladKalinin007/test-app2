import { Injectable } from '@angular/core';
import {FilesetResolver, ImageSegmenter, ImageSegmenterResult} from '@mediapipe/tasks-vision';

// segmentation.service.ts
//
// Цель:
// - Сегментировать кадр с видеопотока, выделив область объекта (например, игрушки).
// - Получить бинарную маску или координаты объекта.
// - Использовать MediaPipe ImageSegmenter либо BodyPix.
//
// Детали:
//
// 1. Метод `init()`:
//    - Загружает модель MediaPipe ImageSegmenter через `FilesetResolver`.
//    - Используется модель Deeplab (или аналогичная), предобученная на сегментацию тела/объектов.
//    - Устанавливает режим `VIDEO`, активируя обработку видеопотока в реальном времени.
//    - Делегат: `'GPU'` (используется аппаратное ускорение, если доступно).
//
// 2. Метод `segmentFrame(video)`:
//    - Выполняет сегментацию текущего кадра.
//    - Возвращает результат (`ImageSegmenterResult`) с маской (`categoryMask`) или координатами.
//    - Используется как источник для `silhouette.service.ts`, `validation.service.ts`, и `capture.service.ts`.
//
// Примечания:
// - Может использоваться вместо или в комбинации с BodyPix.
// - Позволяет гибко переключаться между моделями сегментации (например, человек/объект/животное).
@Injectable({ providedIn: 'root' })
export class SegmentationService {
  private segmenter: ImageSegmenter | null = null;
  private initialized = false;

  /**
   * Инициализирует модуль сегментации объектов с использованием MediaPipe ImageSegmenter.
   *
   * Загружает WebAssembly-клиент и модель `ssd_mobilenet_v2` из CDN.
   * Используется для реального времени (режим `VIDEO`) и возвращает бинарную маску сегментированного объекта.
   *
   * Обязателен для вызова до `segmentFrame(...)`.
   *
   * Используется в: SilhouetteService, ValidationService, CaptureService.
   *
   * ⚠️ Побочные эффекты:
   * - Загружает ~5–10 МБ WASM и модель
   * - Инициализирует WebGL-контекст
   * - Требует GPU-ускорения в браузере
   *
   * @returns Promise<void> — завершается, когда модель полностью готова к использованию.
   *
   * @example
   * await segmentationService.start();
   * const result = segmentationService.segmentFrame(video);
   * const mask = result.categoryMask;
   */
  async start(): Promise<void> {
    console.log('[SegmentationService] Инициализация начата...');

    // Шаг 1: Загрузка WASM runtime от MediaPipe (vision tasks)
    const vision = await FilesetResolver.forVisionTasks(
      'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision/wasm'
    );
    console.log('[SegmentationService] WASM загружен');

    // Шаг 2: Инициализация модели SSD-MobilenetV2 для object detection + category mask
    this.segmenter = await ImageSegmenter.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath:
          'https://storage.googleapis.com/mediapipe-models/object_detector/ssd_mobilenet_v2/float32/latest/ssd_mobilenet_v2.tflite',
        delegate: 'GPU', // Используем GPU-ускорение
      },
      outputCategoryMask: true,  // Получаем bitmap-маску
      runningMode: 'VIDEO'       // Оптимизация под видеопоток
    });

    this.initialized = true;
    console.log('[SegmentationService] Модель ImageSegmenter загружена и готова');
  }

  /**
   * Выполняет сегментацию одного кадра видеопотока и возвращает результат в формате MediaPipe `ImageSegmenterResult`.
   *
   * Использует инициализированную модель MediaPipe ImageSegmenter, чтобы выделить объект (игрушку, автомобиль, форму)
   * на текущем кадре `video` и получить бинарную маску объекта (categoryMask).
   *
   * Требует предварительного вызова `start()` для загрузки и подготовки модели.
   *
   * ⚠️ Если модель не загружена (`start()` не вызывался) — выбрасывает исключение.
   *
   * @param video HTMLVideoElement — ссылка на элемент видеопотока, откуда берётся кадр.
   *
   * @returns ImageSegmenterResult:
   *   - `categoryMask: MPMask | undefined` — бинарная маска объекта
   *   - `confidenceMasks: MPMask[] | undefined` — (если активировано) многоклассовые маски
   *   - `qualityScores?: number[]` — оценка качества распознавания
   *
   * @example
   * const result = segmentationService.segmentFrame(videoElement);
   * const mask = result.categoryMask;
   *
   * @throws Error если модель не инициализирована
   */
  public segmentFrame(video: HTMLVideoElement): ImageSegmenterResult {
    if (!this.segmenter) {
      console.warn('[SegmentationService] segmentFrame вызван до инициализации модели');
      throw new Error('Segmenter not initialized');
    }

    // Выполняем сегментацию текущего кадра
    const result = this.segmenter.segmentForVideo(video, performance.now());

    // Проверка наличия бинарной маски (объект на кадре обнаружен)
    if (result.categoryMask) {
      console.log('[SegmentationService] Маска категории получена:', {
        width: result.categoryMask.width,
        height: result.categoryMask.height,
      });
    } else {
      console.warn('[SegmentationService] Маска категории отсутствует');
    }

    return result;
  }
}
