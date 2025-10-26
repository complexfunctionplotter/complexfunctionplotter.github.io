import './style.css'
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

class ComplexNumber {
    constructor(a, b) {
        this.a = a;
        this.b = b;
    }

    re() {
        return this.a;
    }

    im() {
        return this.b;
    }
}
class ComplexOperator {
    mod(x) {
        return Math.sqrt(x.re()*x.re()+x.im()*x.im());
    }

    arg(x) {
        return Math.atan(x.im()/x.re());
    }

    conjugate(x) {
        return new ComplexNumber(x.re(), -x.im());
    }

    add(x, y) {
        return new ComplexNumber(x.re()+y.re(), x.im()+y.im());
    }

    subtract(x, y) {
        return new ComplexNumber(x.re()-y.re(), x.im()-y.im());
    }

    multiply(x, y) {
        return new ComplexNumber(x.re()*y.re()-x.im()*y.im(), x.re()*y.im()+x.im()*y.re());
    }

    divide(x, y) {
        return new ComplexNumber(x.re()*y.re()+x.im()*y.im())/(y.re()*y.re()+y.im()*y.im()), (-x.re()*y.im()+x.im()*y.re())/(y.re()*y.re()+y.im()*y.im());
    }
}
const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer({
    canvas: document.querySelector('#bg'),
});

renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
camera.position.setZ(10);

const axisGeometry = new THREE.CylinderGeometry(0.02, 0.02, 8, 10, 1, false);
const axisMaterial = new THREE.MeshBasicMaterial({color: 0xffffff});
const xAxis = new THREE.Mesh(axisGeometry, axisMaterial);
const zAxis = new THREE.Mesh(axisGeometry, axisMaterial);
scene.add(xAxis, zAxis);
xAxis.rotateZ(Math.PI/2);
zAxis.rotateX(Math.PI/2);


const planeGeometry = new THREE.PlaneGeometry(8, 8, 100, 100);
const planeMaterial = new THREE.MeshBasicMaterial({color: 0x55aaaa, wireframe: true, side: THREE.DoubleSide});//important for changing colors based on Im(z)
const plane = new THREE.Mesh(planeGeometry, planeMaterial);
scene.add(plane);
plane.rotateX(-Math.PI/2)

const positionAttribute = planeGeometry.getAttribute( 'position' );
const vertex = new THREE.Vector3();
const complexOperator = new ComplexOperator();

for (let i = 0; i < positionAttribute.count; i++) {
	vertex.fromBufferAttribute( positionAttribute, i );
    const z = new ComplexNumber(vertex.x, vertex.y);
    const func = z;
	vertex.z = func.re();

	positionAttribute.setXYZ( i, vertex.x, vertex.y, vertex.z );

}

const gridHelper = new THREE.GridHelper(8, 20);
scene.add(gridHelper);

const controls = new OrbitControls(camera, renderer.domElement);

function animate() {
    requestAnimationFrame(animate);

    controls.update();
    renderer.render(scene, camera);
}
animate();