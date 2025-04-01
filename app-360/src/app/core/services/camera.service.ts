import { Injectable } from '@angular/core';

// camera.service.ts
//
// Цель:
// - Подключить веб-камеру через WebRTC API.
// - Выдать `video`-элемент с потоком камеры для дальнейшей обработки.
// - Обеспечить возможность отключения камеры.
//
// Реализация:
//
// 1. Метод `initCamera(videoElement)`:
//    - Запрашивает доступ к камере через `navigator.mediaDevices.getUserMedia(...)`.
//    - Если разрешение получено, поток присваивается `video.srcObject`.
//    - Запускает воспроизведение через `video.play()`.
//    - Обёрнут в `Observable`, чтобы можно было использовать `async pipe` и подписки.
//
// 2. Метод `stopCamera()`:
//    - Останавливает все активные потоки (videoTrack.stop()).
//    - Используется при уничтожении компонента или выходе со страницы.
//
// Примечания:
// - Используется `facingMode: 'environment'` — приоритет задней камеры на телефоне.
@Injectable({ providedIn: 'root' })
export class CameraService {
  private stream: MediaStream | null = null;

  async start(videoElement: HTMLVideoElement): Promise<void> {
    console.log('[CameraService] Запуск инициализации камеры...');

    try {
      console.time('[CameraService] Получение потока getUserMedia');
      this.stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
        audio: false
      });
      console.timeEnd('[CameraService] Получение потока getUserMedia');

      console.log('[CameraService] Поток успешно получен.');
      console.log(`[CameraService] video tracks:`, this.stream.getVideoTracks().map(t => t.label));

      videoElement.srcObject = this.stream;
      console.time('[CameraService] Воспроизведение видео');
      await videoElement.play();
      console.timeEnd('[CameraService] Воспроизведение видео');

      console.log('[CameraService] Видео воспроизводится.');
    } catch (err) {
      console.error('[CameraService] Ошибка инициализации камеры:', err);
      throw err;
    }
  }

  stop(): void {
    if (this.stream) {
      console.log('[CameraService] Остановка всех потоков камеры...');
      this.stream.getTracks().forEach((track) => {
        console.log(`[CameraService] Остановка трека: ${track.kind} (${track.label})`);
        track.stop();
      });
      this.stream = null;
      console.log('[CameraService] Потоки камеры остановлены.');
    } else {
      console.warn('[CameraService] Нет активного потока для остановки.');
    }
  }
}
