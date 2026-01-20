import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { stlLoader } from "./stlLoader.js";
import { checkBox } from "./checkBox.js";
import { landMarks } from "./landMarkEvent.js";
import { lineCreation } from './lineCreation.js';

//every object(2d, 3d geometry) must be in the scene 
const scene = new THREE.Scene();
scene.background = new THREE.Color('black');

//perspective camera is being used
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.z = 1;


const renderer = new THREE.WebGLRenderer({ antialias: true });
//set the viewport to fit the screen.
renderer.setSize(window.innerWidth, window.innerHeight);
//adds the canvas(where we render or draw object) to the web page
document.body.appendChild(renderer.domElement);

//enable zoomIn/ZoomOut, paning and camera rotation. 
const controls = new OrbitControls(camera, renderer.domElement);
renderer.localClippingEnabled = true; // enable clipping

//acts like source or sun
const light1 = new THREE.DirectionalLight("white", 1.5);
light1.position.set(1, 1, 1);
scene.add(light1);

//uniformly distributed light
const light2 = new THREE.AmbientLight("white", 0.5);
scene.add(light2);

const stlModels = [
  { path: "./Right_Femur.stl", color: "grey" },
  { path: "./Right_Tibia.stl", color: "grey" }
];

const meshes: THREE.Mesh[] = [];

//STL Model loader
const stlLoaderClass = new stlLoader(scene, meshes);
stlLoaderClass.stlLoaderFunc(stlModels);

//checkbox element received
const checkboxes = document.querySelectorAll<HTMLInputElement>('.model-checkbox');

//checkbox functionality
const checkBoxLoader = new checkBox(meshes);
checkBoxLoader.checkBoxFunc(checkboxes, controls, camera);

//raycaster is used to detect or get the object which we click on in this case 
const raycaster = new THREE.Raycaster();
//mouse position which will be used for raycasting
const mouse = new THREE.Vector2();

//like a dictionary or a map 
const modelSpheres: Record<string, THREE.Object3D> = {};

const landMarkEvent = new landMarks(renderer);
//renderer.domElement.addEventListener('pointerdown', landMarkEvent.onPointerDown(mouse,camera,meshes,raycaster,() => activeModelName));
renderer.domElement.addEventListener('pointerdown', (event) => {
  landMarkEvent.onPointerDown(event, mouse, camera, meshes, raycaster, () => checkBoxLoader.getActiveCheckbox(), scene, modelSpheres);
});

const updateButtonEvent = document.getElementById("updateBtn") as HTMLButtonElement;
const updateButton = new lineCreation(renderer);

updateButton.updateButton(updateButtonEvent, modelSpheres, scene);


function animate() {
  requestAnimationFrame(animate);
  controls.update();

  renderer.render(scene, camera);
}
animate();