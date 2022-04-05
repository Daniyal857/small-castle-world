import * as THREE from 'three';
import Experience from './Experience.js';

export default class Entrance {
  constructor(_options) {
    // Options
    this.experience = new Experience();
    this.resources = this.experience.resources;
    this.debug = this.experience.debug;
    this.scene = this.experience.scene;

    // Debug
    if (this.debug) {
      this.debugFolder = this.debug.addFolder({
        title: 'entrance'
        // expanded: false
      });
    }

    this.setModel();
  }

  setModel() {
    this.model = {};
    this.model.resource = this.resources.items.entranceModel;
    this.model.mesh = this.model.resource.scene.children[0];
    this.model.mesh.material.transparent = true;
    this.model.mesh.material.emissive.set('#ffffff');
    console.log(this.model.mesh.material);

    this.scene.add(this.model.resource.scene);
  }
}
