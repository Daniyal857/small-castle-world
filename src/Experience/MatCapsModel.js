import * as THREE from 'three';
import gsap from 'gsap';
import { mergeUniforms } from 'three/src/renderers/shaders/UniformsUtils.js';
import Experience from './Experience.js';
import matcapVertex from './shaders/matcap/vertex.glsl';
import matcapFragment from './shaders/matcap/fragment.glsl';

export default class MatCapsModel {
  constructor(_options) {
    // Options
    this.experience = new Experience();
    this.config = this.experience.config;
    this.debug = this.experience.debug;
    this.scene = this.experience.scene;
    this.resources = this.experience.resources;
    this.floorColor = '#4f7723';
    this.pointColor = '#ff0000';
    this.objects = {};

    // Debug
    if (this.debug) {
      this.debugFolder = this.debug.addFolder({
        title: 'matcapModal'
      });
      this.debugFolder
        .addInput(this, 'floorColor', {
          view: 'color'
        })
        .on('change', () => {
          this.uniforms.uFloorColor.value.set(this.floorColor);
        });

      this.debugFolder
        .addInput(this, 'pointColor', {
          view: 'color'
        })
        .on('change', () => {
          this.uniforms.uPointColor.value.set(this.pointColor);
        });
    }

    this.setUniforms();
    this.setModel();
    this.setTelescope();
  }

  setUniforms() {
    this.uniforms = {};
    this.uniforms.uFloorColor = { value: new THREE.Color(this.floorColor) };
    this.uniforms.uFloorOrientationOffset = { value: 1 };
    this.uniforms.uFloorOrientationMultiplier = { value: 0.62 };
    this.uniforms.uFloorDistanceLimit = { value: 3.8 };

    this.uniforms.uPointColor = { value: new THREE.Color(this.pointColor) };
    this.uniforms.uPointOrientationOffset = { value: 1 };
    this.uniforms.uPointOrientationMultiplier = { value: 0.62 };
    this.uniforms.uPointDistanceLimit = { value: 3.8 };
    this.uniforms.uPointPosition = { value: new THREE.Vector3(0, 0.5, 1.692) };

    // Debug
    if (this.debug) {
      this.debugFolder.addInput(
        this.uniforms.uFloorOrientationOffset,
        'value',
        {
          label: 'uOrientationOffset',
          min: -1,
          max: 1
        }
      );
      this.debugFolder.addInput(this.uniforms.uFloorDistanceLimit, 'value', {
        label: 'uFloorDistanceLimit',
        min: 0,
        max: 10
      });
      this.debugFolder.addInput(
        this.uniforms.uFloorOrientationMultiplier,
        'value',
        {
          label: 'uOrientationMultiplier',
          min: 0,
          max: 3
        }
      );

      this.debugFolder.addInput(
        this.uniforms.uPointOrientationOffset,
        'value',
        {
          label: 'uPointOrientationOffset',
          min: -1,
          max: 1
        }
      );
      this.debugFolder.addInput(this.uniforms.uPointDistanceLimit, 'value', {
        label: 'uPointDistanceLimit',
        min: 0,
        max: 10
      });
      this.debugFolder.addInput(
        this.uniforms.uPointOrientationMultiplier,
        'value',
        {
          label: 'uPointOrientationMultiplier',
          min: 0,
          max: 3
        }
      );
    }
  }

  setModel() {
    this.model = {};
    this.model.resource = this.resources.items.smallWorld;

    // Traverse the scene and save materials
    this.model.materials = {};

    this.model.resource.scene.traverse(_child => {
      if (
        _child instanceof THREE.Mesh &&
        _child.material instanceof THREE.MeshStandardMaterial
      ) {
        let material = this.model.materials[_child.material.name];

        if (!material) {
          material = {};
          material.original = _child.material;
          material.meshes = [];

          this.model.materials[_child.material.name] = material;
        }
        material.meshes.push(_child);
      }

      // Save Object
      if (_child.name.match(/^telescopeY/)) {
        this.objects.telescopeY = _child;
      }
      if (_child.name.match(/^telescopeX/)) {
        this.objects.telescopeX = _child;
      }
      if (_child.name.match(/^gear0/)) {
        this.objects.gear0 = _child;
      }
      if (_child.name.match(/^gear1/)) {
        this.objects.gear1 = _child;
      }
    });

    // Create New Materials
    for (const _materialKey in this.model.materials) {
      const material = this.model.materials[_materialKey];

      const matcapTexture =
        this.resources.items[`${material.original.name}MatcapTexture`];
      matcapTexture.encoding = THREE.sRGBEncoding;

      // material.new = new THREE.MeshMatcapMaterial({
      //   matcap: matcapTexture
      // });

      material.new = new THREE.ShaderMaterial({
        uniforms: mergeUniforms([
          THREE.UniformsLib.common,
          THREE.UniformsLib.bumpmap,
          THREE.UniformsLib.normalmap,
          THREE.UniformsLib.displacementmap,
          THREE.UniformsLib.fog,
          THREE.UniformsLib.lights,
          {
            matcap: { value: null }
          }
        ]),
        defines: {
          MATCAP: '',
          USE_MATCAP: ''
        },
        vertexShader: matcapVertex,
        fragmentShader: matcapFragment
      });
      material.new.matcap = matcapTexture;
      material.new.uniforms.matcap.value = matcapTexture;

      material.new.uniforms.uFloorColor = this.uniforms.uFloorColor;
      material.new.uniforms.uFloorOrientationOffset =
        this.uniforms.uFloorOrientationOffset;
      material.new.uniforms.uFloorDistanceLimit =
        this.uniforms.uFloorDistanceLimit;
      material.new.uniforms.uFloorOrientationMultiplier =
        this.uniforms.uFloorOrientationMultiplier;

      material.new.uniforms.uPointColor = this.uniforms.uPointColor;
      material.new.uniforms.uPointOrientationOffset =
        this.uniforms.uPointOrientationOffset;
      material.new.uniforms.uPointDistanceLimit =
        this.uniforms.uPointDistanceLimit;
      material.new.uniforms.uPointOrientationMultiplier =
        this.uniforms.uPointOrientationMultiplier;
      material.new.uniforms.uPointPosition = this.uniforms.uPointPosition;

      for (const _mesh of material.meshes) {
        _mesh.material = material.new;
      }
    }

    this.scene.add(this.model.resource.scene);
  }

  setTelescope() {
    this.telescope = {};

    this.telescope.rotateY = () => {
      gsap.to(this.objects.telescopeY.rotation, {
        duration: 0.5 + Math.random() * 2,
        delay: Math.random() * 2.0,
        ease: 'power2.inOut',
        y: (Math.random() - 0.5) * 1.5,
        onComplete: this.telescope.rotateY
      });
    };

    this.telescope.rotateX = () => {
      gsap.to(this.objects.telescopeX.rotation, {
        duration: 0.5 + Math.random() * 2,
        delay: Math.random() * 2.0,
        ease: 'power2.inOut',
        x: -Math.random(),
        onComplete: this.telescope.rotateX
      });
    };

    this.telescope.rotateY();
    this.telescope.rotateX();
  }

  update() {
    this.objects.gear0.rotation.y =
      -this.objects.telescopeY.rotation.y * (11 / 6);
    this.objects.gear1.rotation.y =
      -0.5 - this.objects.telescopeY.rotation.y * (11 / 6);
  }
}
