import * as THREE from 'three';

export class checkBox {
  private meshes: THREE.Mesh[];
  private activeCheckbox: HTMLInputElement | null = null; // currently active checkbox
  private cameraFocused: boolean = false; // track if camera has been focused first time

  constructor(meshes: THREE.Mesh[]) {
    this.meshes = meshes;
  }

  getActiveCheckbox() {
    return this.activeCheckbox;
  }

  checkBoxFunc(
    checkboxes: NodeListOf<HTMLInputElement>,
    controls: any,
    camera: any
  ) {
    checkboxes.forEach(checkbox => {
      checkbox.checked = false;

      checkbox.addEventListener('change', () => {
        //If the current active checkbox is unchecked, deactivate it
        if (!checkbox.checked && this.activeCheckbox === checkbox) {
          this.activeCheckbox = null;

          // Reset all meshes to original color
          Object.values(this.meshes).forEach(mesh => {
            mesh.material = new THREE.MeshStandardMaterial({ color: 'grey' });
          });

          return; // exit early
        }

        //If checkbox is checked, activate it
        if (checkbox.checked) {
          // Uncheck all other checkboxes
          checkboxes.forEach(checkBox => {
            if (checkBox !== checkbox)
              checkBox.checked = false;
          });

          //set current checkbox as active
          this.activeCheckbox = checkbox;

          //rset all meshes to original color
          Object.values(this.meshes).forEach(mesh => {
            mesh.material = new THREE.MeshStandardMaterial({ color: 'grey' });
          });

          //highlight all meshes
          Object.values(this.meshes).forEach(mesh => {
            mesh.material = new THREE.MeshStandardMaterial({ color: 'blue' });
          });

          //only focus camera the first time
          if (!this.cameraFocused) {

            const boundingBox = new THREE.Box3();
            //this loops around the stl models and set the bounding box around the object or models
            Object.values(this.meshes).forEach(mesh => boundingBox.expandByObject(mesh));

            //now this center is the geometric center of all the meshes coz of its bounding box
            const center = boundingBox.getCenter(new THREE.Vector3());
            controls.target.copy(center);

            //to check how far the camera should be to fit all models in view
            const size = boundingBox.getSize(new THREE.Vector3()).length();
            //distance form center to camera
            const direction = new THREE.Vector3().subVectors(camera.position, center).normalize();

            //now camera is position properly
            camera.position.copy(center.clone().add(direction.multiplyScalar(size)));
            controls.update();

            //so it wont update again
            this.cameraFocused = true;
          }
        }
      });
    });
  }
}
