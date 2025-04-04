import { Component, OnInit } from '@angular/core';
import * as THREE from 'three';
import {ThreeRendererService} from '../../services/three-renderer.service';


@Component({
  selector: 'app-room-geometry',
  standalone: true,
  imports: [],
  template: ``,
  styleUrl: './room-geometry.component.scss'
})
export class RoomGeometryComponent implements OnInit {
  constructor(private threeService: ThreeRendererService) {}

  ngOnInit(): void {
    const scene = this.threeService.getScene();

    // Материалы
    const wallMaterial = new THREE.MeshStandardMaterial({ color: 0x333333 });
    const floorMaterial = new THREE.MeshStandardMaterial({
      color: 0x111111,
      roughness: 0.3,
      metalness: 0.6,
    });
    const ceilingMaterial = new THREE.MeshStandardMaterial({ color: 0x222222 });

    // Геометрия
    const wallThickness = 0.2;
    const roomWidth = 15;
    const roomHeight = 5;
    const roomDepth = 15;

    // Задняя стена
    const backWall = new THREE.Mesh(
      new THREE.BoxGeometry(roomWidth, roomHeight, wallThickness),
      wallMaterial
    );
    backWall.position.set(0, roomHeight / 2, -roomDepth / 2);
    scene.add(backWall);

    // Левая стена
    const leftWall = new THREE.Mesh(
      new THREE.BoxGeometry(wallThickness, roomHeight, roomDepth),
      wallMaterial
    );
    leftWall.position.set(-roomWidth / 2, roomHeight / 2, 0);
    scene.add(leftWall);

    // Правая стена
    const rightWall = new THREE.Mesh(
      new THREE.BoxGeometry(wallThickness, roomHeight, roomDepth),
      wallMaterial
    );
    rightWall.position.set(roomWidth / 2, roomHeight / 2, 0);
    scene.add(rightWall);

    // Потолок
    const ceiling = new THREE.Mesh(
      new THREE.BoxGeometry(roomWidth, wallThickness, roomDepth),
      ceilingMaterial
    );
    ceiling.position.set(0, roomHeight, 0);
    scene.add(ceiling);

    // Пол
    const floor = new THREE.Mesh(
      new THREE.BoxGeometry(roomWidth, wallThickness, roomDepth),
      floorMaterial
    );
    floor.position.set(0, 0, 0);
    floor.receiveShadow = true;
    scene.add(floor);
  }
}
