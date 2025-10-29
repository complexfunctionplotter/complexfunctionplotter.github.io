import './style.css'
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { mx_bilerp_0 } from 'three/src/nodes/materialx/lib/mx_noise.js';

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
        return new ComplexNumber((x.re()*y.re()+x.im()*y.im())/(y.re()*y.re()+y.im()*y.im()), (-x.re()*y.im()+x.im()*y.re())/(y.re()*y.re()+y.im()*y.im()));
    }
}
const gridSize = 8;

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


const planeGeometry = new THREE.PlaneGeometry(gridSize, gridSize, 100, 100);
const planeMaterial = new THREE.MeshBasicMaterial({vertexColors: true, wireframe: false, side: THREE.DoubleSide});
const plane = new THREE.Mesh(planeGeometry, planeMaterial);
scene.add(plane);
plane.rotateX(-Math.PI/2)

const positionAttribute = planeGeometry.getAttribute('position');
const vertex = new THREE.Vector3();
const complexOperator = new ComplexOperator();

function getColor(im) {
    const color = new THREE.Color();
    const colorneg = new THREE.Color(0x0000ff);
    const colorpos = new THREE.Color(0xff0000);
    const c = 1;
    colorneg.set(colorneg.r*c*-im/gridSize, colorneg.g*c*-im/gridSize, colorneg.b*c*-im/gridSize);
    colorpos.set(colorpos.r*c*im/gridSize, colorpos.g*c*im/gridSize, colorpos.b*c*im/gridSize);
    return im <= 0 ? color.set(colorneg) : color.set(colorpos);
}

const colors = [];
let colorIndex = 0;

for (let i = 0; i < positionAttribute.count; i++) {
	vertex.fromBufferAttribute(positionAttribute, i);
    const z = new ComplexNumber(vertex.x, vertex.y);
    const func = complexOperator.divide(new ComplexNumber(1, 0), z);
    //const func = complexOperator.add(new ComplexNumber(1, 0), complexOperator.multiply(z, z));
	vertex.z = func.re();
    const color = getColor(func.im());
    colors[colorIndex++] = color.r;
    colors[colorIndex++] = color.g;
    colors[colorIndex++] = color.b;


	positionAttribute.setXYZ(i, vertex.x, vertex.y, vertex.z);
    planeGeometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
}

const gridHelper = new THREE.GridHelper(gridSize, gridSize);
scene.add(gridHelper);

const controls = new OrbitControls(camera, renderer.domElement);

function animate() {
    requestAnimationFrame(animate);

    controls.update();
    renderer.render(scene, camera);
}
animate();