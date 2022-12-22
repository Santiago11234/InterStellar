import * as THREE from "three";

export default class Planet {
  constructor(radius, positionX, textureFile) {
    this.radius = radius;
    this.positionX = positionX;
    this.textureFile = textureFile;
  }

  getMesh() {
    if (this.mesh === undefined || this.mesh === null) {
      const geometry = new THREE.SphereGeometry(this.radius);
      const texture = new THREE.TextureLoader().load(this.textureFile);
      const material = new THREE.MeshBasicMaterial({ map: texture , lightMapIntensity: 0});
      this.mesh = new THREE.Mesh(geometry, material);
    }
    return this.mesh;
  }
}