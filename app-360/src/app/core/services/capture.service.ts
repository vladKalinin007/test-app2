// import { Injectable } from '@angular/core';
// import * as bodySegmentation from '@tensorflow-models/body-segmentation';
// import '@tensorflow/tfjs-backend-webgl';
// // import '@tensorflow/tfjs';
// import * as tf from '@tensorflow/tfjs';


// capture.service.ts
//
// Цель:
// - Захватить текущее изображение с камеры.
// - Используя ML-модель (BodyPix), определить фигуру объекта.
// - Удалить фон, сохранив только объект (игрушку).
// - Подставить произвольный фон из assets.
// - Вернуть итоговое изображение в формате HTMLCanvasElement.
//
// Ключевые операции:
// 1. Загрузка модели BodyPix (TensorFlow.js).
//    - Эта модель позволяет сегментировать человека/объект на фоне.
// 2. Сегментация кадра из видеопотока.
//    - Получение бинарной маски: 1 = объект, 0 = фон.
// 3. Объединение фона и объекта:
//    - Создаётся canvas того же размера, что и видео.
//    - Сначала отрисовывается фоновая картинка.
//    - Затем поверх добавляется только сегментированное тело объекта (пиксели с маской 1).
// 4. Итоговая canvas-картинка может быть сохранена или передана на сервер.


import { Injectable } from '@angular/core';
import * as bodySegmentation from '@tensorflow-models/body-segmentation';
import * as tf from '@tensorflow/tfjs';
import { BodySegmenter, SupportedModels } from '@tensorflow-models/body-segmentation';
import {Segmentation} from '@tensorflow-models/body-segmentation/dist/shared/calculators/interfaces/common_interfaces';

@Injectable({ providedIn: 'root' })
export class CaptureService {
  private segmenter!: BodySegmenter;

  public async initSelfieSegmenter(): Promise<void> {
    await tf.setBackend('webgl');
    await tf.ready();

    this.segmenter = await bodySegmentation.createSegmenter(
      SupportedModels.MediaPipeSelfieSegmentation,
      {
        runtime: 'mediapipe',
        modelType: 'general',
        solutionPath: 'https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation',
      }
    );
  }

  public async blendWithSoftEdges(
    video: HTMLVideoElement,
    backgroundImage: HTMLImageElement
  ): Promise<HTMLCanvasElement> {
    if (!this.segmenter) throw new Error('Segmenter not initialized');

    const width = video.videoWidth;
    const height = video.videoHeight;

    const people = await this.segmenter.segmentPeople(video);
    if (!people.length) throw new Error('No person detected');

    const mask = await this.createMask(people);
    const canvas = this.createCanvas(width, height);
    const ctx = canvas.getContext('2d')!;

    const smoothMask = this.getBlurredMask(mask, width, height);
    const personImage = this.captureVideoFrame(video, width, height);
    const backgroundScene = this.prepareBackgroundFrame(backgroundImage, width, height);

    const result = ctx.createImageData(width, height);
    this.alphaBlend(personImage, backgroundScene, smoothMask, result);

    ctx.putImageData(result, 0, 0);
    return canvas;
  }

  private async createMask(people: Segmentation[]) {
    return await bodySegmentation.toBinaryMask(
      people[0],
      {r: 255, g: 255, b: 255, a: 255},
      {r: 0, g: 0, b: 0, a: 0},
      true // blurred mask
    );
  }

// Creates a blank canvas of given size
  private createCanvas(width: number, height: number): HTMLCanvasElement {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    return canvas;
  }

// Applies additional blur to the segmentation mask for soft edges
  private getBlurredMask(mask: ImageData, width: number, height: number): ImageData {
    const maskCanvas = document.createElement('canvas');
    maskCanvas.width = width;
    maskCanvas.height = height;
    const maskCtx = maskCanvas.getContext('2d')!;
    maskCtx.putImageData(mask, 0, 0);
    maskCtx.filter = 'blur(8px)';
    maskCtx.drawImage(maskCanvas, 0, 0);
    return maskCtx.getImageData(0, 0, width, height);
  }

// Captures current video frame as ImageData
  private captureVideoFrame(video: HTMLVideoElement, width: number, height: number): ImageData {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(video, 0, 0);
    return ctx.getImageData(0, 0, width, height);
  }

// Prepares background image frame (blur + brightness)
  private prepareBackgroundFrame(image: HTMLImageElement, width: number, height: number): ImageData {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d')!;
    ctx.filter = 'blur(6px) brightness(1.1)';
    ctx.drawImage(image, 0, 0);
    return ctx.getImageData(0, 0, width, height);
  }

// Alpha blends foreground and background based on mask
  private alphaBlend(
    fg: ImageData,
    bg: ImageData,
    mask: ImageData,
    output: ImageData
  ): void {
    for (let i = 0; i < output.data.length; i += 4) {
      const alpha = mask.data[i + 3] / 255;
      output.data[i + 0] = fg.data[i + 0] * alpha + bg.data[i + 0] * (1 - alpha);
      output.data[i + 1] = fg.data[i + 1] * alpha + bg.data[i + 1] * (1 - alpha);
      output.data[i + 2] = fg.data[i + 2] * alpha + bg.data[i + 2] * (1 - alpha);
      output.data[i + 3] = 255;
    }
  }
}
