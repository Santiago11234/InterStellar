import * as THREE from 'three';
import {OrbitControls } from 'https://unpkg.com/three@0.146.0/examples/jsm/controls/OrbitControls.js';
import { MeshBasicMaterial, Vector3 } from 'three';

var Shaders = {
    'atmosphere' : {
      uniforms: {},
      vertexShader: [
        'varying vec3 vNormal;',
        'void main() {',
          'vNormal = normalize( normalMatrix * normal );',
          'gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );',
        '}'
      ].join('\n'),
      fragmentShader: [
        'varying vec3 vNormal;',
        'void main() {',
          'float intensity = pow( 1.0 - dot( vNormal, vec3( 0, 0, 1.0 ) ), 10.0 );',
          'gl_FragColor = vec4(.2549, .615,0.85 , 0.2 ) * intensity;',
          
        '}'
      ].join('\n')
    }
  };





var app = document.getElementById("app");
var CANVAS_WIDTH = document.getElementById("canvas").clientWidth;
console.log(CANVAS_WIDTH)

var CANVAS_HEIGHT =document.getElementById("canvas").clientHeight;
console.log(CANVAS_HEIGHT)

// SCENE

const scene = new THREE.Scene();

// CAMERA 

const camera = new THREE.PerspectiveCamera(45, CANVAS_WIDTH / CANVAS_HEIGHT, 0.1, 100);

camera.lookAt(scene.position);

// RENDERER

const renderer = new THREE.WebGLRenderer(
    {
        antialias: true
})
renderer.setClearColor(0x000, 1.0);
renderer.setSize(CANVAS_WIDTH, CANVAS_HEIGHT);

app.appendChild(renderer.domElement);
renderer.render(scene, camera);



//init all three.js create compononets
var earthImg = new Image();
earthImg.src="Images/earth.jpeg"



//creates the earth
const earthgeometry = new THREE.SphereGeometry(1,50,50);
const earthmaterial = new THREE.MeshBasicMaterial( { 
    map: new THREE.TextureLoader().load(earthImg.src)
 } );
const earthMesh = new THREE.Mesh( earthgeometry, earthmaterial );
scene.add(earthMesh);






var atmosGeometry = new THREE.SphereGeometry(1,100,100);
var shader = Shaders['atmosphere'];
var uniforms = THREE.UniformsUtils.clone(shader.uniforms);

var atmosMaterial = new THREE.ShaderMaterial({
      uniforms: uniforms,
      vertexShader: shader.vertexShader,
      fragmentShader: shader.fragmentShader,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
      transparent: true
    });

var mesh = new THREE.Mesh(atmosGeometry, atmosMaterial);
mesh.scale.set( 1.1, 1.1, 1.1 );
scene.add(mesh);

  


//what actually displays the images

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableZoom = false;
controls.enablePan = false;
camera.position.z = 3;

const directionalLight = new THREE.DirectionalLight( 0x000000, 1);
directionalLight.castShadow = true;
directionalLight.position.set(-75, 75, 0)
directionalLight.target = earthMesh;
directionalLight.visible = true;
scene.add( directionalLight );




function animate() {
    
    earthMesh.rotation.y += 0.01;


    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}
animate();