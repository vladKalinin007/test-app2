import {Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';

import {Direction} from '../../core/models/direction.enum';
import {BoundingBox} from '../../core/models/bounding-box.model';

import {CameraService} from '../../core/services/camera.service';
import {SegmentationService} from '../../core/services/segmentation.service';
import {SilhouetteService} from '../../core/services/silhouette.service';
import {ValidationService} from '../../core/services/validation.service';
import {CaptureService} from '../../core/services/capture.service';
import {DirectionalSelectorComponent} from '../../shared/directional-selector/directional-selector.component';
import {CaptureButtonComponent} from '../../shared/capture-button/capture-button.component';
import {ObjectCaptureOverlayComponent} from './object-capture-overlay/object-capture-overlay.component';
import {NgIf} from '@angular/common';


@Component({
  selector: 'app-object-capture',
  standalone: true,
  imports: [
    DirectionalSelectorComponent,
    CaptureButtonComponent,
    ObjectCaptureOverlayComponent,
    NgIf
  ],
  templateUrl: './object-capture.component.html',
  styleUrl: './object-capture.component.scss'
})
export class ObjectCaptureComponent implements OnDestroy {
  @ViewChild('video', { static: true }) videoRef!: ElementRef<HTMLVideoElement>;
  @ViewChild('resultImage') resultImageRef!: ElementRef<HTMLImageElement>;
  @ViewChild(ObjectCaptureOverlayComponent) overlayRef!: ObjectCaptureOverlayComponent;

  direction: Direction = Direction.FRONT;
  currentBox: BoundingBox | null = null;
  currentMask: ImageData | null = null;
  isAligned: boolean = false;

  private intervalId: any;
  isCameraOn = false;

  constructor(
    private camera: CameraService,
    private segmentation: SegmentationService,
    private silhouette: SilhouetteService,
    private validator: ValidationService,
    private captureService: CaptureService
  ) {}

  ngOnDestroy() {
    this.stopCamera();
  }

  public async startCamera(): Promise<void> {
    try {
      await this.camera.start(this.videoRef.nativeElement);
      await this.segmentation.start();
      await this.captureService.initSelfieSegmenter();

      this.intervalId = setInterval(() => this.detectFrame(), 300);
      this.isCameraOn = true;

      this.overlayRef.startAnimation();
      console.log('[ObjectCaptureComponent] Камера включена');
    } catch (err) {
      console.error('[ObjectCaptureComponent] Ошибка включения камеры:', err);
    }
  }

  public stopCamera(): void {
    clearInterval(this.intervalId);
    this.camera.stop();
    this.videoRef.nativeElement.srcObject = null;
    this.isCameraOn = false;
    this.overlayRef.stopAnimation();
    console.log('[ObjectCaptureComponent] Камера выключена');
  }

  public async detectFrame(): Promise<void> {
    const result = this.segmentation.segmentFrame(this.videoRef.nativeElement);
    if (!result) return;

    const mask = result.categoryMask;
    if (!mask) {
      result.close();
      return;
    }

    const width = mask.width;
    const height = mask.height;
    const grayscale = mask.getAsUint8Array();

    if (grayscale.length !== width * height) {
      console.error('[ObjectCaptureComponent] Маска повреждена', {
        grayscaleLength: grayscale.length,
        expected: width * height,
      });
      mask.close();
      result.close();
      return;
    }

    const rgba = new Uint8ClampedArray(width * height * 4);
    for (let i = 0; i < grayscale.length; i++) {
      const val = grayscale[i];
      const offset = i * 4;
      rgba[offset + 0] = val;
      rgba[offset + 1] = val;
      rgba[offset + 2] = val;
      rgba[offset + 3] = 255;
    }

    const imageData = new ImageData(rgba, width, height);
    mask.close();
    result.close();

    const box = this.extractBoundingBox(imageData);
    this.currentBox = box;
    this.currentMask = imageData;

    const template = this.silhouette.getTemplate();
    this.isAligned = template ? this.validator.isAligned(box, template) : false;
  }

  extractBoundingBox(mask: ImageData): BoundingBox {
    const { data, width, height } = mask;

    let minX = width, minY = height, maxX = 0, maxY = 0;
    let found = false;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const offset = (y * width + x) * 4;
        const r = data[offset]; // т.к. grayscale → R=G=B=val

        if (r > 30) { // порог (можно адаптировать)
          found = true;
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }
      }
    }

    if (!found) {
      console.warn('[extractBoundingBox] Ничего не найдено в маске');
      return { x: 0, y: 0, width: 0, height: 0 };
    }

    return {
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY
    };
  }

  onDirectionChanged(newDir: Direction): void {
    this.direction = newDir;
    this.isAligned = false;
    this.currentBox = null;
  }

  public async onCapture(): Promise<void> {
    const bg = new Image();
    bg.src = 'bg-default.jpg';
    await bg.decode();
    const result = await this.captureService.blendWithSoftEdges(
      this.videoRef.nativeElement,
      bg
    );
    console.log('Captured image:', result.toDataURL());
    this.resultImageRef.nativeElement.src = result.toDataURL();
  }
}
