import * as THREE from 'three';
import Experience from './Experience.js';

export default class DepthOfField {
  constructor(_options) {
    // Options
    this.experience = new Experience();
    this.renderer = this.experience.renderer;
    this.scene = this.experience.scene;
    this.camera = this.experience.camera;

    this.raycaster = new THREE.Raycaster();
  }

  update() {
    // update the picking ray with the camera and pointer position
    this.raycaster.setFromCamera(new THREE.Vector2(0, 0), this.camera.instance);

    // calculate objects intersecting the picking ray
    const intersects = this.raycaster.intersectObjects(
      this.scene.children,
      true
    );

    if (intersects.length) {
      const intersect = intersects[0];
      this.renderer.postProcess.bokehPass.materialBokeh.uniforms.focus.value =
        intersect.distance;
    }
  }
}
