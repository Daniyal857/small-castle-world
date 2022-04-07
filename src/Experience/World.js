import * as THREE from 'three';
import Entrance from './Entrance.js';
import Experience from './Experience.js';
import Floor from './Floor.js';
import MatCapsModel from './MatCapsModel.js';
import WindStrokes from './WindStrokes.js';

export default class World {
  constructor(_options) {
    this.experience = new Experience();
    this.config = this.experience.config;
    this.scene = this.experience.scene;
    this.resources = this.experience.resources;

    this.resources.on('groupEnd', _group => {
      if (_group.name === 'base') {
        this.setFloor();
        this.setEntrance();
        this.setWindStrokes();
        this.setMatcapsModel();
      }
    });
  }

  setFloor() {
    this.floor = new Floor();
  }

  setEntrance() {
    this.entrance = new Entrance();
  }

  setWindStrokes() {
    this.windStrokes = new WindStrokes();
  }

  setMatcapsModel() {
    this.matcapModal = new MatCapsModel();
  }

  resize() {}

  update() {
    if (this.entrance) {
      this.entrance.update();
    }
    if (this.matcapModal) {
      this.matcapModal.update();
    }
  }

  destroy() {}
}
