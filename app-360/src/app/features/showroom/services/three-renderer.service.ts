// three-renderer.service.ts
import { Injectable } from '@angular/core';
import * as THREE from 'three';

@Injectable({ providedIn: 'root' })
export class ThreeRendererService {
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;

  private cube!: THREE.Mesh;

  initialize(canvas: HTMLCanvasElement) {
    // Scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x111111);

    // Camera
    this.camera = new THREE.PerspectiveCamera(
      60,
      canvas.clientWidth / canvas.clientHeight,
      0.1,
      1000
    );
    this.camera.position.set(0, 5, 15);

    // Renderer
    this.createRenderer(canvas);

    // Placeholder geometry (test)
    this.create3DObject();

    this.scene.add(this.cube);

    // Lighting (temporary)
    const light = new THREE.AmbientLight(0xffffff, 0.5);
    this.scene.add(light);

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(10, 10, 10);
    this.scene.add(dirLight);
  }

  initializePlaceholderScene(): void {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x111111);
  }

  private create3DObject() {
    const geometry = new THREE.BoxGeometry();
    const material = new THREE.MeshStandardMaterial({color: 0x00aaff});
    this.cube = new THREE.Mesh(geometry, material);
    this.cube.position.y = 2;
  }

  private createRenderer(canvas: HTMLCanvasElement) {
    this.renderer = new THREE.WebGLRenderer({canvas, antialias: true});
    this.renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.shadowMap.enabled = true;
  }

  animate = () => {
    requestAnimationFrame(this.animate);
    this.cube.rotation.y += 0.01;
    this.renderer.render(this.scene, this.camera);
  };

  getScene(): THREE.Scene {
    return this.scene;
  }
}
