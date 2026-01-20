import * as THREE from 'three';

export class lineCreation {
    private mechLine: THREE.Line | null = null;
    private anatoLine: THREE.Line | null = null;
    private TEA_Trans_epicondyleLine: THREE.Line | null = null;
    private PCAPosteriorCondyleLine: THREE.Line | null = null;
    private mechAxisPlane: THREE.Mesh | null = null;
    private TEAProjectedLine: THREE.Line | null = null;
    private anterirorline: THREE.Line | null = null;
    private varusValgusPlane: THREE.Mesh | null = null;
    private flexionExtensionPlane: THREE.Mesh | null = null;
    private readonly stepAngleDeg: number = 1;
    private anteriorAxisPoint: THREE.Vector3 | null = null;
    private anteriorAxisDir: THREE.Vector3 | null = null;
    private lateralAxisPoint: THREE.Vector3 | null = null;
    private lateralAxisDir: THREE.Vector3 | null = null;
    private projectedAnteriorPerpLine: THREE.Line | null = null;
    private distalMedialPlane: THREE.Mesh | null = null;
    private distalResectionPlane: THREE.Mesh | null = null;
    private getResectionPlane: THREE.Plane | null = null;
    private distanceMedialPtText: any;
    private distanceLateralPtText: any;
    private showDistance = false;
    private renderer: any;

    constructor(renderer: any) {

        console.log("Line creation init");
        const positiveBtn = document.getElementById("positiveBtn") as HTMLButtonElement;
        const negativeBtn = document.getElementById("negativeBtn") as HTMLButtonElement;

        const positiveBtnFlexion = document.getElementById("positiveBtnFlex") as HTMLButtonElement;
        const negativeBtnFlexion = document.getElementById("negativeBtnFlex") as HTMLButtonElement;

        this.distanceMedialPtText = document.getElementById("distanceDisplayMedialPt");
        this.distanceLateralPtText = document.getElementById("distanceDisplayLateralPt");

        this.distanceLateralPtText.innerText = `Distance Medial Pt:`;
        this.distanceMedialPtText.innerText = `Distance Lateral Pt:`;

        if (positiveBtn) {
            positiveBtn.onclick = () => this.rotateVarus();
        }

        if (negativeBtn) negativeBtn.onclick = () => this.rotateValgus();

        if (positiveBtnFlexion) {
            positiveBtnFlexion.onclick = () => this.rotateFlexPositive();
        }

        if (negativeBtnFlexion) negativeBtnFlexion.onclick = () => this.rotateFlexNegative();


        this.renderer = renderer;
        const button = document.getElementById("toggleClipping");
        button!.addEventListener("click", () => {
            if (!this.getResectionPlane) return;

            this.showDistance = !this.showDistance;

            this.renderer.localClippingEnabled = this.showDistance;

            this.renderer.clippingPlanes = this.showDistance ? [this.getResectionPlane] : [];
        });
    }
    //this function rotates the plane around the anterior line
    private rotatePlaneAroundLine(
        plane: THREE.Mesh,
        axisPoint: THREE.Vector3,
        axisDir: THREE.Vector3,
        angleRad: number
    ) {
        //this lets us rotate by angleRad around axisDir(which is the Y axis in our assignement).
        const quaterionRotation = new THREE.Quaternion().setFromAxisAngle(axisDir, angleRad);

        //origin point
        plane.position.sub(axisPoint);

        //above rotation applied
        plane.position.applyQuaternion(quaterionRotation);
        //this updates the planes orientation(xyz) or else it will remain in its initial form.
        plane.quaternion.premultiply(quaterionRotation);
        //this is used to rotate around the arbitary axis
        plane.position.add(axisPoint);


    }
    //this function rotates the plane around the lateral line
    private rotatePlaneAroundLateralLine(
        plane: THREE.Mesh,
        axisPoint: THREE.Vector3,
        axisDir: THREE.Vector3,
        angleRad: number
    ) {
        //this lets us rotate by angleRad around axisDir(which is the Y axis in our assignement).
        const quaterionRotation = new THREE.Quaternion().setFromAxisAngle(axisDir, angleRad);

        plane.position.sub(axisPoint);

        //above rotation applied
        plane.position.applyQuaternion(quaterionRotation);
        //this updates the planes orientation(xyz) or else it will remain in its initial form.
        plane.quaternion.premultiply(quaterionRotation);
        //this is used to rotate around the arbitary axis
        plane.position.add(axisPoint);


    }
    private rotateFlexPositive() {
        if (!this.flexionExtensionPlane || !this.lateralAxisPoint || !this.lateralAxisDir) return;

        const stepRad = THREE.MathUtils.degToRad(this.stepAngleDeg);

        this.rotatePlaneAroundLateralLine(
            this.flexionExtensionPlane,
            this.lateralAxisPoint,
            this.lateralAxisDir,
            +stepRad
        );
    }
    getResection() {
        return this.getResectionPlane;
    }
    private rotateVarus() {
        if (!this.varusValgusPlane || !this.anteriorAxisPoint || !this.anteriorAxisDir) return;

        const stepRad = THREE.MathUtils.degToRad(this.stepAngleDeg);

        this.rotatePlaneAroundLine(
            this.varusValgusPlane,
            this.anteriorAxisPoint,
            this.anteriorAxisDir,
            +stepRad
        );
    }
    private rotateValgus() {
        if (!this.varusValgusPlane || !this.anteriorAxisPoint || !this.anteriorAxisDir) return;

        const stepRad = THREE.MathUtils.degToRad(this.stepAngleDeg);

        this.rotatePlaneAroundLine(
            this.varusValgusPlane,
            this.anteriorAxisPoint,
            this.anteriorAxisDir,
            -stepRad
        );
    }
    private rotateFlexNegative() {
        if (!this.flexionExtensionPlane || !this.lateralAxisPoint || !this.lateralAxisDir) return;

        const stepRad = THREE.MathUtils.degToRad(this.stepAngleDeg);

        this.rotatePlaneAroundLateralLine(
            this.flexionExtensionPlane,
            this.lateralAxisPoint,
            this.lateralAxisDir,
            -stepRad
        );
    }
    updateButton(updateButtonEvent: HTMLButtonElement, modelSpheres: Record<string, THREE.Object3D>, scene: any) {

        updateButtonEvent.addEventListener("click", () => {
            const femur = modelSpheres["femur_center"];
            const hipCenter = modelSpheres["hip_center"];
            const proximalCanal = modelSpheres["femur_proximalCanal"];
            const distalCanal = modelSpheres["femur_distalCanal"];
            const medialEpicondyle = modelSpheres["medial_epicondyle"];
            const lateralEpicondyle = modelSpheres["lateral_epicondyle"];
            const posteriormedialPt = modelSpheres["posterior_medial_pt"];
            const posteriorlateralPt = modelSpheres["posterior_lateral_pt"];
            const distalMedialPt = modelSpheres["distal_medial_pt"];
            const distalLateralPt = modelSpheres["distal_lateral_pt"];

            let projectedMedial: THREE.Vector3 | null = null;
            let projectedLateral: THREE.Vector3 | null = null;

            //  console.log(femur,hipCenter);

            if (femur && hipCenter) {
                const points = [femur.position, hipCenter.position];

                if (!this.mechLine) {
                    const geom = new THREE.BufferGeometry().setFromPoints(points);
                    const mat = new THREE.LineBasicMaterial({ color: "green" });
                    this.mechLine = new THREE.Line(geom, mat);
                    scene.add(this.mechLine);
                } else {
                    //if line is already present jus update it
                    const pos = this.mechLine.geometry.attributes.position as THREE.BufferAttribute;
                    pos.setXYZ(0, points[0].x, points[0].y, points[0].z);
                    pos.setXYZ(1, points[1].x, points[1].y, points[1].z);
                    pos.needsUpdate = true;
                }

                const planeSize = 50;
                const planeGeo = new THREE.PlaneGeometry(planeSize, planeSize);
                const planeMat = new THREE.MeshBasicMaterial({
                    color: "grey",
                    side: THREE.DoubleSide,
                    transparent: true,
                    opacity: 0.3
                });

                if (!this.mechAxisPlane) {
                    this.mechAxisPlane = new THREE.Mesh(planeGeo, planeMat);
                    this.mechAxisPlane.position.copy(hipCenter.position);
                    scene.add(this.mechAxisPlane);
                } else {

                    //got vec from two points.
                    const mechAxisDir = femur.position.clone().sub(hipCenter.position).normalize();
                    const defaultNormal = new THREE.Vector3(0, 0, 1);
                    //we are rotating the planes normal(defaultNormal) so that it aligns with the mechAxisDir.
                    const quaterionRotation = new THREE.Quaternion().setFromUnitVectors(defaultNormal, mechAxisDir);
                    this.mechAxisPlane!.quaternion.copy(quaterionRotation);

                    // update plane pos at hip center.
                    this.mechAxisPlane!.position.copy(hipCenter.position);
                }

            } else {
                console.log("Inputs not available for femur and hip center");
            }


            if (proximalCanal && distalCanal) {
                const points = [proximalCanal.position, distalCanal.position];

                if (!this.anatoLine) {
                    const geom = new THREE.BufferGeometry().setFromPoints(points);
                    const mat = new THREE.LineBasicMaterial({ color: "red" });
                    this.anatoLine = new THREE.Line(geom, mat);
                    scene.add(this.anatoLine);
                } else {
                    //if line is already present jus update it
                    const pos = this.anatoLine.geometry.attributes.position as THREE.BufferAttribute;
                    pos.setXYZ(0, points[0].x, points[0].y, points[0].z);
                    pos.setXYZ(1, points[1].x, points[1].y, points[1].z);
                    pos.needsUpdate = true;
                }
            } else {
                console.log("Inputs not available for proximal canal and distal canal");
            }


            if (medialEpicondyle && lateralEpicondyle) {

                //got the plane normal vec
                const planeNormal = hipCenter.position.clone().sub(femur.position).normalize();
                const planePoint = hipCenter.position;

                //P projection = Point to project - (distance along plane normal * normal)
                const projectPoint = (point: THREE.Vector3) => {
                    //vec from original point to plane point.
                    const v = point.clone().sub(planePoint);
                    //dist from plane normal to the point on plane
                    const dist = v.dot(planeNormal);
                    return point.clone().sub(planeNormal.clone().multiplyScalar(dist));
                }

                projectedMedial = projectPoint(medialEpicondyle.position);
                projectedLateral = projectPoint(lateralEpicondyle.position);

                const pointsForProjection = [projectedMedial, projectedLateral];
                const points = [medialEpicondyle.position, lateralEpicondyle.position];


                if (!this.TEA_Trans_epicondyleLine) {
                    const geom = new THREE.BufferGeometry().setFromPoints(points);
                    const mat = new THREE.LineBasicMaterial({ color: "white" });
                    this.TEA_Trans_epicondyleLine = new THREE.Line(geom, mat);
                    scene.add(this.TEA_Trans_epicondyleLine);
                } else {
                    //if line is already present jus update it
                    const pos = this.TEA_Trans_epicondyleLine.geometry.attributes.position as THREE.BufferAttribute;
                    pos.setXYZ(0, points[0].x, points[0].y, points[0].z);
                    pos.setXYZ(1, points[1].x, points[1].y, points[1].z);
                    pos.needsUpdate = true;
                }

                if (!this.TEAProjectedLine) {
                    const geom = new THREE.BufferGeometry().setFromPoints(pointsForProjection);
                    const mat = new THREE.LineBasicMaterial({ color: "white" });
                    this.TEAProjectedLine = new THREE.Line(geom, mat);
                    scene.add(this.TEAProjectedLine);
                } else {
                    //if line is already present jus update it
                    const pos = this.TEAProjectedLine.geometry.attributes.position as THREE.BufferAttribute;
                    pos.setXYZ(0, pointsForProjection[0].x, pointsForProjection[0].y, pointsForProjection[0].z);
                    pos.setXYZ(1, pointsForProjection[1].x, pointsForProjection[1].y, pointsForProjection[1].z);
                    pos.needsUpdate = true;
                }
            } else {
                console.log("Inputs not available for medial Epicondyle and lateral Epicondyle");
            }

            if (posteriormedialPt && posteriorlateralPt) {
                const points = [posteriormedialPt.position, posteriorlateralPt.position];

                if (!this.PCAPosteriorCondyleLine) {
                    const geom = new THREE.BufferGeometry().setFromPoints(points);
                    const mat = new THREE.LineBasicMaterial({ color: "white" });
                    this.PCAPosteriorCondyleLine = new THREE.Line(geom, mat);
                    scene.add(this.PCAPosteriorCondyleLine);
                } else {
                    //if line is already present jus update it
                    const pos = this.PCAPosteriorCondyleLine.geometry.attributes.position as THREE.BufferAttribute;
                    pos.setXYZ(0, points[0].x, points[0].y, points[0].z);
                    pos.setXYZ(1, points[1].x, points[1].y, points[1].z);
                    pos.needsUpdate = true;
                }
            } else {
                console.log("Inputs not available for posterial medial pt and posterior lateral pt");
            }

            //Anterior line 
            //in here to understand Z axis is the mechanical axis , X axis is the projected TEA and Y axis will be the Anterior dir which
            // is perpendicular to TEA in the plane.
            if (hipCenter && femur && projectedLateral && projectedMedial) {
                //Z axis is the mechanical axis
                const planeNormal = hipCenter.position.clone().sub(femur.position).normalize();
                //X axis is the projected TEA
                const teaDir = projectedLateral.clone().sub(projectedMedial).normalize();

                //cross product is used to find Y axis which is perpendicular to  X and Z.
                let anteriorDir = new THREE.Vector3().crossVectors(planeNormal, teaDir).normalize();

                const femurCenter = femur.position.clone();

                //Move 10 mm from femur center in anteriorDir which is y axis
                let startPoint = femurCenter.clone().add(anteriorDir.clone().multiplyScalar(10));
                this.anteriorAxisPoint = startPoint.clone();
                this.anteriorAxisDir = anteriorDir.clone();
                const lineLength = 40;
                //this line starts from startPoint in the anteriorDir by 40.
                const endPoint = startPoint.clone().add(anteriorDir.clone().multiplyScalar(lineLength));

                const anterirorLinePoint = [startPoint, endPoint];

                if (!this.anterirorline) {
                    const geo = new THREE.BufferGeometry().setFromPoints(anterirorLinePoint);
                    const mat = new THREE.LineBasicMaterial({ color: "yellow" });
                    this.anterirorline = new THREE.Line(geo, mat);
                    scene.add(this.anterirorline);
                } else {
                    // if already present and need to update.
                    const pos = this.anterirorline.geometry.attributes.position as THREE.BufferAttribute;
                    pos.setXYZ(0, startPoint.x, startPoint.y, startPoint.z);
                    pos.setXYZ(1, endPoint.x, endPoint.y, endPoint.z);
                    pos.needsUpdate = true;
                }

            }


            if (this.mechAxisPlane && !this.varusValgusPlane) {
                this.varusValgusPlane = this.mechAxisPlane.clone();
                this.varusValgusPlane.material =
                    (this.mechAxisPlane.material as THREE.Material).clone();

                scene.add(this.varusValgusPlane);

                //Create a line on the VarusValgus plane
                //perpendicular to the anterior line
                //starting at femur center, length 10 mm lateral
                if (this.varusValgusPlane && this.anteriorAxisDir && femur) {
                    //0,0,1 is the planes default normal , quaternion rotates it to match the planes current rotation.
                    // we can use vec but it is valid for only 1st time , it will become incorret if the plane moves.
                    const planeNormal = new THREE.Vector3(0, 0, 1).applyQuaternion(this.varusValgusPlane.quaternion).normalize();
                    const projectedAnteriorDir = this.anteriorAxisDir.clone().normalize();
                    //The new line must be 90° to the projected anterior and stay on the plane.
                    const lateralDir = new THREE.Vector3().crossVectors(planeNormal, projectedAnteriorDir).normalize();

                    //SAME AS ABOVE LOGIC 
                    // const femurCenter = femur.position.clone();
                    // const planePoint = this.varusValgusPlane.position.clone();
                    // const v = femurCenter.clone().sub(planePoint);
                    // const distance = v.dot(planeNormal);

                    // // projected femur center ON the plane
                    // const projectedFemurCenter = femurCenter.clone().sub(
                    //     planeNormal.clone().multiplyScalar(distance)
                    // );
                    
                    const startPoint = femur.position.clone();
                    this.lateralAxisPoint = startPoint.clone();
                    this.lateralAxisDir = lateralDir.clone();
                    const endPoint = startPoint.clone().add(lateralDir.multiplyScalar(10)); // 10 mm
                    // 
                    console.log("in");
                    const points = [startPoint, endPoint];

                    if (!this.projectedAnteriorPerpLine) {
                        const geom = new THREE.BufferGeometry().setFromPoints(points);
                        const mat = new THREE.LineBasicMaterial({ color: "orange" });
                        this.projectedAnteriorPerpLine = new THREE.Line(geom, mat);
                        scene.add(this.projectedAnteriorPerpLine);
                    } else {
                        const pos = this.projectedAnteriorPerpLine.geometry.attributes.position as THREE.BufferAttribute;
                        pos.setXYZ(0, startPoint.x, startPoint.y, startPoint.z);
                        pos.setXYZ(1, endPoint.x, endPoint.y, endPoint.z);
                        pos.needsUpdate = true;
                    }

                    if (this.mechAxisPlane && !this.flexionExtensionPlane) {
                        this.flexionExtensionPlane = this.mechAxisPlane.clone();
                        this.flexionExtensionPlane.material =
                            (this.mechAxisPlane.material as THREE.Material).clone();

                        scene.add(this.flexionExtensionPlane);
                    }

                    //Creating distal medial plane which is parallel to flexion externsion plane.

                    if (this.flexionExtensionPlane && medialEpicondyle) {
                        if (!this.distalMedialPlane) {

                            //jus clone geo and material
                            this.distalMedialPlane = this.flexionExtensionPlane.clone();
                            this.distalMedialPlane.material = (this.flexionExtensionPlane.material as THREE.Material).clone();

                            (this.distalMedialPlane.material as THREE.MeshBasicMaterial).color.set("blue");
                            (this.distalMedialPlane.material as THREE.MeshBasicMaterial).opacity = 0.5;

                            scene.add(this.distalMedialPlane);
                        }

                        this.distalMedialPlane.quaternion.copy(this.flexionExtensionPlane.quaternion);
                        this.distalMedialPlane.position.copy(medialEpicondyle.position);
                    }
                    // add new plane which is parallel to distal medial plane and is at 10 mm distance 
                    if (!this.distalResectionPlane && this.distalMedialPlane) {
                        this.distalResectionPlane = this.distalMedialPlane.clone();
                        this.distalResectionPlane.material = (this.distalMedialPlane.material as THREE.Material).clone();

                        // dir from femur point to hip center
                        const proximalDir = hipCenter.position.clone().sub(femur.position).normalize();
                        this.distalMedialPlane.position.add(proximalDir.multiplyScalar(10));

                        scene.add(this.distalResectionPlane);
                    }

                    //create a clipping plane 
                    // dir from femur point to hip center
                    const proximalDir = hipCenter.position.clone().sub(femur.position).normalize();
                    const newPlanePt = femur.position.clone();

                    this.getResectionPlane = new THREE.Plane();
                    //this create a plane using normal and this plane pass through the femur point
                    this.getResectionPlane.setFromNormalAndCoplanarPoint(proximalDir, newPlanePt);

                    //need to find distance from resection plane and distal medial pt and distal lateral pt
                    const distanceMedialPt = this.getResectionPlane.distanceToPoint(distalMedialPt.position);
                    console.log(distanceMedialPt);

                    const distanceLateralPt = this.getResectionPlane.distanceToPoint(distalLateralPt.position);
                    console.log(distanceLateralPt);


                    this.distanceLateralPtText.innerText = `Distance Lateral Pt: ${distanceLateralPt.toFixed(2)}`;
                    this.distanceMedialPtText.innerText = `Distance Medial Pt: ${distanceMedialPt.toFixed(2)}`;
                }
            }
        });

    }
}