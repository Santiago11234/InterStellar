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



var isRotating = false;
//code for changing sizes within website
const gui = new dat.GUI();
const world = {
    earth: {
        radius: 1,
        DayLight: false,
        stopRotation: false
    }
}

var earthImg = new Image();
earthImg.src="images/earth.jpeg"
var earthNImg = new Image();
earthNImg.src="images/earthNight.jpeg"

var starImg = new Image();
starImg.src="images/star.png"


gui.add(world.earth, 'stopRotation', false).onChange(function (value) {
    isRotating = !isRotating
});


//init all three.js create compononets

const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera(75, innerWidth/innerHeight, 0.1, 1000)
const renderer = new THREE.WebGLRenderer(
    {
        antialias: true
})
renderer.setSize(innerWidth, innerHeight);
renderer.setPixelRatio(devicePixelRatio);
document.body.appendChild(renderer.domElement);


//creates the earth
const earthgeometry = new THREE.SphereGeometry(1,50,50);
const earthmaterial = new THREE.MeshBasicMaterial( { 
    map: new THREE.TextureLoader().load(earthImg.src)
 } );
const earthMesh = new THREE.Mesh( earthgeometry, earthmaterial );
scene.add(earthMesh);



//stars
const starGeo = new THREE.BufferGeometry()
const vertices = [];

for (let i = 0; i < 5000; i++) {
    const x = Math.random() * 800 - 300;
    const y = Math.random() * 800 - 300;
    const z = Math.random() * 800 - 300;
    vertices.push(x, y, z);
}
starGeo.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));

let sprite = new THREE.TextureLoader().load(starImg.src);
let starMaterial = new THREE.PointsMaterial({
  color: 0xaaaaaa,
  size: 0.2,
  map: sprite
});

const stars = new THREE.Points(starGeo,starMaterial);
scene.add(stars);



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

  
const coords = [ 
    [29.7858,-95.8245,-15.4326, -47.1332],
    [-15.4326, -47.1332,28.6139, 77.2090],
    [28.6139, 77.2090,41.38, 2.1686],
    [41.38, 2.1686,35.6839,139.7744],
    [35.6839,139.7744,40.6943,-73.9249],
    [40.6943,-73.9249,19.4333,-99.1333],
    [19.4333,-99.1333,18.9667,72.8333],
    [18.9667,72.8333,-35.473469,149.012375],
    [-35.473469,149.012375, 39.9042, 116.4074],
    [39.9042, 116.4074,-8.7832,34.5085 ],
    [-8.7832,34.5085,34.0522, -118.2437],
    [34.0522, -118.2437, 19.8968, -155.5828],
    [19.8968, -155.5828, 51.5072, 0.1276],
    [51.5072, 0.1276,29.7858,-95.8245 ]
  ];

  var tubes = []
  var cities = []

function toVector3(lat, lng, radius) {
    let DEGREE_TO_RADIAN = Math.PI / 180
    const phi = (90 - lat) * DEGREE_TO_RADIAN;
    const theta = (lng + 180) * DEGREE_TO_RADIAN;
    const x = - radius * Math.sin(phi) * Math.cos(theta)
    const y =radius * Math.cos(phi)
    const z =radius * Math.sin(phi) * Math.sin(theta)
    let prac = new THREE.Mesh(new THREE.SphereGeometry(.03, 20,20), new MeshBasicMaterial({color: 0xFF0000}));
    prac.position.set(x, y, z)
    cities.push(prac)
    scene.add(prac)
    return new THREE.Vector3(x,y,z);
}
  
function getCurve(p1, p2) {
    let points = []
    for(let i =0;i <= 20; i++) {
        let p = new THREE.Vector3().lerpVectors(p1,p2, i/20)
        p.normalize()
        p.multiplyScalar(1+ 0.25 * Math.sin(Math.PI * i/20))
        points.push(p)
    }
    const path = new THREE.CatmullRomCurve3(points)
    const geometry = new THREE.TubeGeometry( path, 20, 0.01, 8, false );
    const material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
    const mesh = new THREE.Mesh( geometry, material );
    return mesh
}

coords.forEach(c => {
    const p = getCurve(toVector3(c[0], c[1],1), toVector3(c[2],c[3], 1));
    tubes.push(p)
    scene.add(p)
})
console.log(tubes)
console.log(cities)


//what actually displays the images
new OrbitControls(camera, renderer.domElement);
camera.position.z = 3;




var t =0;
function animate() {
    
if(isRotating === true) {
    earthMesh.rotation.y += 0.01
    
    
const array = starGeo.attributes.position.array
    
for(let i = 0; i < array.length; i+=6){

    array[i] +=  +0.1
    array[i+2] += +.01
    array[i+3] -=  0.1
    array[i+4] -= .01
    array[i+5] -=0.1
    if(array[i] > 600 || array[i+2] > 600) {
        array[i] -= Math.random() * 800 - 300;
        array[i+2] -= Math.random() * 800 - 300;
    }
    if(array[i+3] > 600 || array[i+4] > 600) {
      array[i+3] -= Math.random() * 800 - 300;
      array[i+4] -= Math.random() * 800 - 300;
  }
}
starGeo.attributes.position.needsUpdate = true


t+= 0.01
for(let i = 0 ; i < cities.length;i++) {
    if(i < 14) {
        tubes[i].rotation.y += 0.01
    } 
}

}
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}
animate();