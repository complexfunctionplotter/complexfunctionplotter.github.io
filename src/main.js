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

    mod() {
        return Math.sqrt(this.re()*this.re()+this.im()*this.im());
    }

    arg() {
        return Math.atan2(this.im(), this.re());
    }

    conjugate() {
        return new ComplexNumber(x.re(), -x.im());
    }

    add(y) {
        return new ComplexNumber(this.re()+y.re(), this.im()+y.im());
    }

    subtract(y) {
        return new ComplexNumber(this.re()-y.re(), this.im()-y.im());
    }

    multiply(y) {
        return new ComplexNumber(this.re()*y.re()-this.im()*y.im(), this.re()*y.im()+this.im()*y.re());
    }

    divide(y) {
        return new ComplexNumber((this.re()*y.re()+this.im()*y.im())/(y.re()*y.re()+y.im()*y.im()), (-this.re()*y.im()+this.im()*y.re())/(y.re()*y.re()+y.im()*y.im()));
    }

    exp() {
        const ex = Math.exp(this.re());
        return new ComplexNumber(ex*Math.cos(this.im()), ex*Math.sin(this.im()));
    }

    ln() {
        return new ComplexNumber(Math.log(this.mod()), this.arg());
    }

    pow(w) {
        return w.multiply(this.ln()).exp();
    }

    sin() {
        return this.multiply(new ComplexNumber(0, 1)).exp().subtract(this.multiply(new ComplexNumber(0, -1)).exp()).divide(new ComplexNumber(0, 2));
    }

    cos() {
        return this.multiply(new ComplexNumber(0, 1)).exp().add(this.multiply(new ComplexNumber(0, -1)).exp()).divide(new ComplexNumber(2, 0));
    }

    tan() {
        return this.sin().divide(this.cos());
    }
}

const gridSize = 8;
const resolution = 64;

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer({
    canvas: document.querySelector('#bg'),
});

renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x0f0d0f, 1);
camera.position.setX(6);
camera.position.setY(6);
camera.position.setZ(6);


const axisGeometry = new THREE.CylinderGeometry(0.02, 0.02, gridSize, 10, 1, false);
const axisMaterial = new THREE.MeshBasicMaterial({color: 0xffffff});
const xAxis = new THREE.Mesh(axisGeometry, axisMaterial);
const zAxis = new THREE.Mesh(axisGeometry, axisMaterial);
scene.add(xAxis, zAxis);
xAxis.rotateZ(Math.PI/2);
zAxis.rotateX(Math.PI/2);





function getColor(im) {
    const color = new THREE.Color();
    const colorneg = new THREE.Color(0x0000ff);
    const colorpos = new THREE.Color(0xff0000);
    const c = 1;
    colorneg.set(colorneg.r*c*-im/gridSize, colorneg.g*c*-im/gridSize, colorneg.b*c*-im/gridSize);
    colorpos.set(colorpos.r*c*im/gridSize, colorpos.g*c*im/gridSize, colorpos.b*c*im/gridSize);
    return im <= 0 ? color.set(colorneg) : color.set(colorpos);
}


const btn1 = document.getElementById('btn1');
const textbox = document.getElementById('textbox');

const loadedPlanes = [];
let planeCounter = 0;

function removePlane(name) {
    const removedPlane = scene.getObjectByName(`ComplexPlane${name}`);
    if(removedPlane) {
        scene.remove(removedPlane);
        removedPlane.geometry.dispose();
    }
}

function parse(value, z) {
    let func;
    if(value=="ln(z)") {
        func = z.ln();
    }
    else if(value=="1/z") {
        func = z.pow(new ComplexNumber(-1, 0));
    }
    else if(value=="e^z") {
        func = z.exp();
    }
    else if(value=="z^2") {
        func = z.pow(new ComplexNumber(2, 0));
    }
    else if(value=="sin(z)") {
        func = z.sin();
    }
    else if(value=="cos(z)") {
        func = z.cos();
    }
    else if(value=="tan(z)") {
        func = z.tan();
    }
    else {
        func = new ComplexNumber(0, 0);
    }
    return func;
}

function load() {
    planeCounter++;
    removePlane(planeCounter-1);
    const planeGeometry = new THREE.PlaneGeometry(gridSize, gridSize, resolution, resolution);
    const planeMaterial = new THREE.MeshBasicMaterial({vertexColors: true, wireframe: false, side: THREE.DoubleSide});
    const plane = new THREE.Mesh(planeGeometry, planeMaterial);
    const name = `ComplexPlane${planeCounter}`;
    plane.name = name;
    scene.add(plane);
    loadedPlanes.push(plane);
    
    plane.rotation.x = -Math.PI/2;
    const positionAttribute = planeGeometry.getAttribute('position');
    const vertex = new THREE.Vector3();
    const colors = [];
    let colorIndex = 0;
    
    for (let i = 0; i < positionAttribute.count; i++) {
	    vertex.fromBufferAttribute(positionAttribute, i);
        const z = new ComplexNumber(vertex.x, vertex.y);
        const func = parse(textbox.value, z);
	    vertex.z = func.re();
        const color = getColor(func.im());
        colors[colorIndex++] = color.r;
        colors[colorIndex++] = color.g;
        colors[colorIndex++] = color.b;

	    positionAttribute.setXYZ(i, vertex.x, vertex.y, vertex.z);
        planeGeometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    }
    textbox.value = "";
}

btn1.addEventListener('click', load);

textbox.addEventListener('keyup', (event) => {
    if(event.key=='Enter') {
        textbox.blur();
        btn1.click();
    }
});

const gridHelper = new THREE.GridHelper(gridSize, gridSize);
scene.add(gridHelper);

const controls = new OrbitControls(camera, renderer.domElement);

window.addEventListener('resize', (event) => {
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
});

function animate() {
    requestAnimationFrame(animate);

    controls.update();
    renderer.render(scene, camera);
}
animate();