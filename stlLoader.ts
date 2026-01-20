import * as THREE from 'three';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js';

export class stlLoader{
private loader: STLLoader;
private scene : THREE.Scene;
private meshes: THREE.Mesh[];

constructor(
    scene: THREE.Scene,
    meshes:THREE.Mesh[]
  ) {
    this.loader = new STLLoader();
    this.scene = scene;
    this.meshes = meshes;
   
  }

stlLoaderFunc(stlModels:{path:string,color:string}[]) {

stlModels.forEach((model) => {
    this.loader.load(model.path, (geometry) => {
        const material = new THREE.MeshStandardMaterial({ color: model.color ,
          side : THREE.DoubleSide,
          clippingPlanes: [],
        clipShadows: true
        });
        const mesh = new THREE.Mesh(geometry, material);
        this.scene.add(mesh);
        this.meshes.push(mesh);
    });
});
}
}

