import * as THREE from 'three';
import gsap from 'gsap';
import Experience from './Experience.js';
import windStrokeVertex from './shaders/windStroke/vertex.glsl';
import windStrokeFragment from './shaders/windStroke/fragment.glsl';

export default class WindStrokes {
  constructor(_options) {
    // Options
    this.experience = new Experience();
    this.debug = this.experience.debug;
    this.resources = this.experience.resources;
    this.scene = this.experience.scene;

    this.resource1 = this.resources.items.windStroke1eModel;
    this.resource2 = this.resources.items.windStroke2Model;
    this.items = [];

    // Debug
    if (this.debug) {
      this.debugFolder = this.debug.addFolder({
        title: 'windStrokes'
        // expanded: false
      });
      this.debugFolder
        .addButton({
          title: 'pop()'
        })
        .on('click', () => {
          this.pop();
        });
    }

    this.setMaterial();

    window.setInterval(() => {
      if (Math.random() < 0.3) {
        this.pop();
      }
    }, 1000);
  }

  setMaterial() {
    // Material
    this.material = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      uniforms: {
        uProgress: { value: 0.1 }
      },
      vertexShader: windStrokeVertex,
      fragmentShader: windStrokeFragment
    });

    // Mesh
    // this.reference.mesh = this.resources.scene.children[0];
    // this.reference.mesh.position.set(0, 2, 4);
    // this.reference.mesh.material = this.reference.material;

    // this.scene.add(this.reference.mesh);
  }

  pop() {
    const resource = Math.random() < 0.5 ? this.resource1 : this.resource2;

    const mesh = resource.scene.children[0].clone(false);
    mesh.material = this.material.clone();

    mesh.position.x = (3 + Math.random() * 7) * (Math.random() < 0.5 ? 1 : -1);
    mesh.position.y = Math.random() * 3;
    mesh.position.z =
      (2.5 + Math.random() * 5) * (Math.random() < 0.5 ? 1 : -1);

    // Animate with GSAP
    gsap.to(mesh.material.uniforms.uProgress, {
      ease: 'power4.inOut',
      value: 1,
      duration: 12
    });

    gsap.to(mesh.position, {
      duration: 20,
      x: mesh.position.x - 3.0,
      onComplete: () => {
        mesh.geometry.dispose();
        mesh.material.dispose();
        this.scene.remove(mesh);
      }
    });

    this.scene.add(mesh);
  }
}
