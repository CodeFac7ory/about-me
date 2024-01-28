import './style.css'

import * as THREE from 'three';
import {RenderPass} from 'three/addons/postprocessing/RenderPass.js';
import {BloomPass} from 'three/addons/postprocessing/BloomPass.js';
import {OutputPass} from 'three/addons/postprocessing/OutputPass.js';
import {EffectComposer} from 'three/addons/postprocessing/EffectComposer.js';

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);

let uniforms, mesh;

const clock = new THREE.Clock();

const renderer = new THREE.WebGLRenderer({
    antialias: true
})
renderer.autoClear = false;

// blur all another way
// renderer.domElement.style.filter = `blur(2px)`
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);


container.appendChild( renderer.domElement );

camera.position.setZ(30);

renderer.render(scene, camera);

const geometry = new THREE. TorusGeometry(10, 3, 16, 100);

const textureLoader = new THREE.TextureLoader();
const cloudTexture = textureLoader.load( './textures/lava/cloud.png' );
const lavaTexture = textureLoader.load( './textures/lava/lavatile.jpg' );

lavaTexture.colorSpace = THREE.SRGBColorSpace;

cloudTexture.wrapS = cloudTexture.wrapT = THREE.RepeatWrapping;
lavaTexture.wrapS = lavaTexture.wrapT = THREE.RepeatWrapping;

uniforms = {
    'fogDensity': { value: 0.03 },
    'fogColor': { value: new THREE.Vector3( 0, 0, 0 ) },
    'time': { value: 1.0 },
    'uvScale': { value: new THREE.Vector2( 3.0, 1.0 ) },
    'texture1': { value: cloudTexture },
    'texture2': { value: lavaTexture },
};

const materialFire = new THREE.ShaderMaterial( {
    uniforms: uniforms,
    vertexShader: document.getElementById( 'vertexShader' ).textContent,
    fragmentShader: document.getElementById( 'fragmentShader' ).textContent
} );

const torus = new THREE.Mesh(geometry, materialFire);
torus.rotation.x = 0.3;

scene.add(torus);

// Lights
const pointLight = new THREE.PointLight(0xffffff);
pointLight.position.set(5, 5, 5);

const ambientLight = new THREE.AmbientLight(0xffffff);
scene.add(pointLight, ambientLight);

// Moon
const moonTexture = new THREE.TextureLoader().load('textures/moon.jpg');
const normalTexture = new THREE.TextureLoader().load('textures/normal.jpg');

const moon = new THREE.Mesh(
    new THREE.SphereGeometry(5, 32, 32),
    new THREE.MeshStandardMaterial({
        map: moonTexture,
        normalMap: normalTexture,
    })
);

scene.add(moon);

moon.position.setX(-15);
moon.position.setY(15);

function addStar() {
    const geometry = new THREE.SphereGeometry(0.25, 24, 24);
    const material = new THREE.MeshStandardMaterial({ color: 0xffffff });
    const star = new THREE.Mesh(geometry, material);

    const [x, y, z] = Array(3)
        .fill()
        .map(() => THREE.MathUtils.randFloatSpread(100));

    star.position.set(x, y, z);
    scene.add(star);
}

Array(200).fill().forEach(addStar);

// Background
const spaceTexture = new THREE.TextureLoader().load('textures/space.jpg');
scene.background = spaceTexture;

const renderModel = new RenderPass( scene, camera );
const effectBloom = new BloomPass( 0.25 );
const outputPass = new OutputPass();

const composer = new EffectComposer( renderer );

composer.addPass( renderModel );
composer.addPass( effectBloom );
composer.addPass( outputPass );

function animate() {
    requestAnimationFrame(animate);

    moon.rotation.x += 0.005;

    const delta = 5 * clock.getDelta();

    uniforms[ 'time' ].value += 0.2 * delta;

    torus.rotation.y += 0.0125 * delta;
    torus.rotation.x += 0.05 * delta;

    // renderer vs composer
    renderer.clear();
    // controls.update();
    // renderer.render(scene, camera);

    // renderer vs composer
    composer.render( 0.1 );
    composer.render();
}

animate();

window.addEventListener( 'resize', onWindowResize, false );

function onWindowResize(){
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
    composer.setSize( window.innerWidth, window.innerHeight );
}


document.body.onscroll = moveCamera;
moveCamera();

function moveCamera() {
    const t = document.body.getBoundingClientRect().top;
    moon.rotation.x += 0.05;
    moon.rotation.y += 0.075;
    moon.rotation.z += 0.05;

    camera.position.z = 30 + t * -0.01;
    camera.rotation.y = t * -0.0002;
    camera.position.x = t * -0.0002;
}