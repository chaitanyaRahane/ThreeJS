import * as THREE from 'three';

export class landMarks {
  private renderer: THREE.WebGLRenderer;

  constructor(renderer: THREE.WebGLRenderer) {
    this.renderer = renderer;
  }

  onPointerDown(
    event: PointerEvent,
    mouse: THREE.Vector2,
    camera: THREE.Camera,
    meshes: THREE.Mesh[],
    raycaster: THREE.Raycaster,
    getActiveCheckbox: () => HTMLInputElement | null,
    scene: THREE.Scene,
    modelSpheres: Record<string, THREE.Object3D>
  ) {
    const activeCheckbox = getActiveCheckbox();
    if (!activeCheckbox) return;

    const checkboxValue = activeCheckbox.value;

    //convert screen coords to normalized device coords
    //rect has the position and size of the rendering screen 
    const rect = this.renderer.domElement.getBoundingClientRect();
    //we need mouse cordinates in related to canvas or rendering screen
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    //set the ray that goes from camera through mouse into our scene
    raycaster.setFromCamera(mouse, camera);

    // Raycast against all meshes
    const intersects = raycaster.intersectObjects(Object.values(meshes), true);
    if (intersects.length === 0) return;

    const hit = intersects[0];
    const hitPoint = hit.point;
    const hitNormal = hit.face?.normal.clone();

    let group: THREE.Group;

    if (!modelSpheres[checkboxValue]) {
      // Create a group to hold sphere + axes
      group = new THREE.Group();

      // Sphere
      const sphere = new THREE.Mesh(
        new THREE.SphereGeometry(0.5, 16, 16),
        new THREE.MeshStandardMaterial({ color: 'red' })
      );
      group.add(sphere);

      // Axes helper
      const axes = new THREE.AxesHelper(1);
      axes.scale.set(5, 5, 5); // scale axes
      group.add(axes);

      scene.add(group);
      modelSpheres[checkboxValue] = group;
    } else {
      group = modelSpheres[checkboxValue] as THREE.Group;
    }

    // Move group to hit point
    group.position.copy(hitPoint);

    // Rotate group so Z axis points along surface normal
    if (hitNormal) {
      const quaternion = new THREE.Quaternion();
      quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), hitNormal.normalize());
      group.setRotationFromQuaternion(quaternion);
    }
  }
}
