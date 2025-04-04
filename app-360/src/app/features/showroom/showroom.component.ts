// import {
//   AfterViewInit,
//   Component,
//   ElementRef,
//   ViewChild,
// } from '@angular/core';
// import * as THREE from 'three';
// import { Reflector } from 'three/examples/jsm/objects/Reflector.js';

import {
  AfterViewInit,
  Component,
  ElementRef,
  ViewChild,
} from '@angular/core';
import * as THREE from 'three';
import { Reflector } from 'three/examples/jsm/objects/Reflector.js';
import {Texture} from 'three';

@Component({
  selector: 'app-showroom',
  templateUrl: './showroom.component.html',
  styleUrls: ['./showroom.component.scss'],
  standalone: true
})
export class ShowroomComponent implements AfterViewInit {
  @ViewChild('canvas') canvasRef!: ElementRef<HTMLCanvasElement>;

  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;

  ngAfterViewInit(): void {
    this.initScene();
    this.initGeometry();
    this.initLights();
    this.animate();
  }

  private initScene(): void {
    const canvas = this.canvasRef.nativeElement;
    this.setupScene();
    this.setupCamera(canvas);
    this.setupRenderer(canvas);
  }

  private setupScene() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x111111);
  }

  private setupRenderer(canvas: HTMLCanvasElement): void {
    this.renderer = new THREE.WebGLRenderer({canvas, antialias: true});
    this.renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.shadowMap.enabled = true;
  }

  private setupCamera(canvas: HTMLCanvasElement): void {
    const fov = 35;
    const aspect = canvas.clientWidth / canvas.clientHeight;
    const near = 0.1;
    const far = 1000;
    this.camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    this.camera.position.set(0, 3, 16);
    this.camera.lookAt(0, 1.5, 0);
  }

  private initGeometry(): void {
    const loader = new THREE.TextureLoader();

    // Загрузка плиточной текстуры
    const floorTexture = loader.load(
      'https://cdn.jsdelivr.net/gh/emmelleppi/ambientcg-textures@main/FloorTiles034/2K_FloorTiles034_Albedo.jpg'
    );
    floorTexture.wrapS = THREE.RepeatWrapping;
    floorTexture.wrapT = THREE.RepeatWrapping;
    floorTexture.repeat.set(10, 10);

    const wallMaterial = this.createWallMaterial();

    const floorMaterial = this.createFloorMaterial(floorTexture);

    const circleRadius = 5;
    const ringThickness = 0.03;

    const ringGeometry = new THREE.RingGeometry(
      circleRadius - ringThickness,
      circleRadius + ringThickness,
      64
    );

    const ringMaterial = this.createRingMaterial();

    const ring = new THREE.Mesh(ringGeometry, ringMaterial);


    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.12;
    ring.position.z = 0;
    ring.position.x = 0;

    this.scene.add(ring);

    const ceilingMaterial = new THREE.MeshStandardMaterial({ color: 0x9A9B9E });

    const wallThickness = 0.2;
    const roomWidth = 20;
    const roomHeight = 7;
    const roomDepth = 35;

    // Задняя стена
    const backWall = new THREE.Mesh(
      new THREE.BoxGeometry(roomWidth, roomHeight, wallThickness),
      wallMaterial
    );
    backWall.position.set(0, roomHeight / 2, -roomDepth / 2);
    this.scene.add(backWall);

    // Левая стена
    const leftWall = new THREE.Mesh(
      new THREE.BoxGeometry(wallThickness, roomHeight, roomDepth),
      wallMaterial
    );
    leftWall.position.set(-roomWidth / 2, roomHeight / 2, 0);
    this.scene.add(leftWall);

    // Правая стена
    const rightWall = new THREE.Mesh(
      new THREE.BoxGeometry(wallThickness, roomHeight, roomDepth),
      wallMaterial
    );
    rightWall.position.set(roomWidth / 2, roomHeight / 2, 0);
    this.scene.add(rightWall);

    // Потолок
    const ceiling = new THREE.Mesh(
      new THREE.BoxGeometry(roomWidth, wallThickness, roomDepth),
      ceilingMaterial
    );
    ceiling.position.set(0, roomHeight, 0);
    this.scene.add(ceiling);

    // Пол с плиточной текстурой (основа)
    const floor = new THREE.Mesh(
      new THREE.BoxGeometry(roomWidth, wallThickness, roomDepth),
      floorMaterial
    );
    floor.position.set(0, 0, 0);
    floor.receiveShadow = true;
    this.scene.add(floor);

// Отражающая поверхность (Reflector)
    const mirrorGeometry = new THREE.PlaneGeometry(roomWidth, roomDepth);
    const reflector = new Reflector(mirrorGeometry, {
      textureWidth: 1024,
      textureHeight: 1024,
      clipBias: 0.003,
      // @ts-ignore
      recursion: 1,
    });
    reflector.rotation.x = -Math.PI / 2;
    reflector.position.y = 0.11;
    this.scene.add(reflector);

// ✅ Приведение типа, чтобы получить доступ к opacity/color
    const reflectorMaterial = reflector.material as THREE.MeshBasicMaterial;
    reflectorMaterial.transparent = true;
    reflectorMaterial.opacity = 0.3;
    reflectorMaterial.color = new THREE.Color(0xffffff); // светлый, чтобы отражения были заметны
  }

  private createWallMaterial() {
    return new THREE.MeshStandardMaterial({
      color: 0x3D3C40,
      roughness: 0.478,
    });
  }

  private createRingMaterial() {
    return new THREE.MeshBasicMaterial({
      color: 0x00ffff,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.5,
    });
  }

  private createFloorMaterial(floorTexture: Texture) {
    return new THREE.MeshStandardMaterial({
      map: floorTexture,
      roughness: 0.3,
      metalness: 0.1,
    });
  }

  private initLights(): void {
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    this.scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(10, 10, 10);
    directionalLight.castShadow = true;
    this.scene.add(directionalLight);
  }

  private animate = () => {
    requestAnimationFrame(this.animate);
    this.renderer.render(this.scene, this.camera);
  };
}
