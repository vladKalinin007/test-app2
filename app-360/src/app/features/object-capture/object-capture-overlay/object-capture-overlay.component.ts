import {AfterViewInit, Component, ElementRef, Input, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {BoundingBox} from '../../../core/models/bounding-box.model';
import * as THREE from 'three';

@Component({
  selector: 'app-object-capture-overlay',
  standalone: true,
  imports: [],
  templateUrl: './object-capture-overlay.component.html',
  styleUrl: './object-capture-overlay.component.scss'
})
export class ObjectCaptureOverlayComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('rendererContainer', { static: true }) containerRef!: ElementRef<HTMLDivElement>;
  @ViewChild('cubeContainer', { static: true }) cubeContainerRef!: ElementRef<HTMLDivElement>;
  @Input() boundingBox: BoundingBox | null = null;
  @Input() maskData: ImageData | null = null;
  @Input() isAligned: boolean = false;

  private lastBoxSerialized: string | null = null;
  private scene!: THREE.Scene;
  private camera!: THREE.OrthographicCamera;
  private renderer!: THREE.WebGLRenderer;
  private boxMesh!: THREE.Line;
  private animationActive = false;

  private cubeRenderer!: THREE.WebGLRenderer;
  private cubeScene!: THREE.Scene;
  private cubeCamera!: THREE.PerspectiveCamera;
  private cubeMesh!: THREE.Mesh;
  private cubeAnimationId: number = 0;

  ngOnInit(): void {
    // this.scene = new THREE.Scene();
    this.initRotatingCube();
  }

  ngAfterViewInit(): void {
    // const container = this.containerRef.nativeElement;
    // const { clientWidth: width, clientHeight: height } = container;
    //
    // this.camera = new THREE.OrthographicCamera(0, width, height, 0, 0.1, 10);
    // this.camera.position.z = 1;
    //
    // this.renderer = new THREE.WebGLRenderer({ alpha: true });
    // this.renderer.setSize(width, height);
    // container.appendChild(this.renderer.domElement);
    //
    // this.animate();
  }

  startAnimation(): void {
    if (!this.animationActive) {
      this.animationActive = true;
      this.animate();
    }
  }

  stopAnimation(): void {
    this.animationActive = false;
  }

  ngOnDestroy(): void {
    this.renderer?.dispose();
    this.boxMesh?.geometry.dispose();
  }

  private animate(): void {
    if (!this.animationActive) return;

    requestAnimationFrame(() => this.animate());

    if (!this.maskData) {
      this.renderScene();
      return;
    }

    if (!this.hasMaskChanged(this.maskData)) {
      this.renderScene();
      return;
    }

    this.removePreviousContour();

    const geometry = this.buildContourGeometry(this.maskData);
    if (!geometry) return;

    this.addContourToScene(geometry);
    this.renderScene();
  }

  private renderScene(): void {
    this.renderer.render(this.scene, this.camera);
    console.log('[Overlay] Сцена отрендерена');
  }

  private hasMaskChanged(mask: ImageData): boolean {
    const serialized = mask.data.join(',');
    const changed = serialized !== this.lastBoxSerialized;
    if (changed) {
      this.lastBoxSerialized = serialized;
      console.log('[Overlay] Обнаружено изменение маски');
    }
    return changed;
  }

  private removePreviousContour(): void {
    if (!this.boxMesh) return;
    this.scene.remove(this.boxMesh);
    this.boxMesh.geometry.dispose();
    this.boxMesh = undefined!;
    console.log('[Overlay] Предыдущий контур удалён');
  }

  private buildContourGeometry(mask: ImageData): THREE.BufferGeometry | null {
    const contourPoints = this.traceContour(mask);
    console.log(`[Overlay] Обнаружено ${contourPoints.length} точек на контуре`);

    if (contourPoints.length < 2) {
      console.warn('[Overlay] Контур слишком мал для построения');
      return null;
    }

    return new THREE.BufferGeometry().setFromPoints(
      contourPoints.map(p => new THREE.Vector3(p.x, p.y, 0))
    );
  }

  private addContourToScene(geometry: THREE.BufferGeometry): void {
    const material = new THREE.LineBasicMaterial({
      color: this.isAligned ? 0x00ff00 : 0xffffff,
      linewidth: 2,
    });

    this.boxMesh = new THREE.LineLoop(geometry, material);
    this.scene.add(this.boxMesh);

    console.log('[Overlay] Контур добавлен в сцену');
  }

  /**
   * Trace the outer contour using Moore-neighbor tracing algorithm (simple version)
   */
  private traceContour(image: ImageData): { x: number; y: number }[] {
    const { data, width, height } = image;
    const binary = new Uint8Array(width * height);

    // Binarize
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const i = y * width + x;
        binary[i] = data[i * 4] > 128 ? 1 : 0;
      }
    }

    // Find starting point
    let startX = -1, startY = -1;
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        if (binary[y * width + x]) {
          startX = x;
          startY = y;
          break;
        }
      }
      if (startX !== -1) break;
    }

    if (startX === -1) return [];

    const directions = [
      [1, 0], [1, -1], [0, -1], [-1, -1],
      [-1, 0], [-1, 1], [0, 1], [1, 1]
    ];

    let cx = startX, cy = startY, dir = 0;
    const contour: { x: number, y: number }[] = [{ x: cx, y: cy }];

    for (let step = 0; step < 10000; step++) {
      let found = false;
      for (let i = 0; i < 8; i++) {
        const ndir = (dir + i) % 8;
        const nx = cx + directions[ndir][0];
        const ny = cy + directions[ndir][1];

        if (nx >= 0 && ny >= 0 && nx < width && ny < height) {
          if (binary[ny * width + nx]) {
            cx = nx;
            cy = ny;
            contour.push({ x: cx, y: cy });
            dir = (ndir + 5) % 8;
            found = true;
            break;
          }
        }
      }

      if (!found || (cx === startX && cy === startY)) break;
    }

    return contour;
  }


  public initRotatingCube(): void {
    const container = this.cubeContainerRef.nativeElement;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // Сцена с прозрачным фоном
    this.cubeScene = new THREE.Scene();
    // Удаляем фон — он не нужен, чтобы не перекрывать видео
    // this.cubeScene.background = new THREE.Color(0x000000); ← УДАЛЕНО

    // Камера
    this.cubeCamera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    this.cubeCamera.position.z = 2;

    // Куб
    const geometry = new THREE.BoxGeometry();
    const material = new THREE.MeshNormalMaterial({
      transparent: true,
      opacity: 0.7, // слегка прозрачный
    });
    this.cubeMesh = new THREE.Mesh(geometry, material);
    this.cubeScene.add(this.cubeMesh);

    // Рендерер с прозрачным фоном
    this.cubeRenderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    this.cubeRenderer.setSize(width, height);
    this.cubeRenderer.setClearColor(0x000000, 0); // ← alpha = 0
    container.appendChild(this.cubeRenderer.domElement);

    // Анимация
    this.animateCube();
  }

  private animateCube(): void {
    this.cubeAnimationId = requestAnimationFrame(() => this.animateCube());

    this.cubeMesh.rotation.x += 0.01;
    this.cubeMesh.rotation.y += 0.01;

    this.cubeRenderer.render(this.cubeScene, this.cubeCamera);
  }

  public stopRotatingCube(): void {
    cancelAnimationFrame(this.cubeAnimationId);
    this.cubeRenderer.dispose();
    this.cubeScene.clear();
  }
}
