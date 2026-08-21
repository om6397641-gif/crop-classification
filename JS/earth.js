/* ===========================
   GeoVision Earth 3D V2
=========================== */


const container = document.getElementById("earth");


const scene = new THREE.Scene();


// Camera
const camera = new THREE.PerspectiveCamera(
    45,
    1,
    0.1,
    1000
);

camera.position.z = 3;



// Renderer
const renderer = new THREE.WebGLRenderer({
    antialias:true,
    alpha:true
});


const size = Math.min(
    window.innerWidth * 0.45,
    600
);


renderer.setSize(size,size);
renderer.setPixelRatio(window.devicePixelRatio);


container.appendChild(renderer.domElement);



// Earth Sphere

const geometry = new THREE.SphereGeometry(
    1,
    128,
    128
);



// Texture

const textureLoader = new THREE.TextureLoader();


const earthTexture = textureLoader.load(
    "images/earth.jpg",
    ()=>{
        console.log("Earth loaded");
    }
);



// Earth Material

const material = new THREE.MeshStandardMaterial({

    map:earthTexture,

    roughness:0.8,

    metalness:0.1

});



const earth = new THREE.Mesh(
    geometry,
    material
);


scene.add(earth);




// Glow Effect

const glowGeometry = new THREE.SphereGeometry(
    1.08,
    64,
    64
);


const glowMaterial = new THREE.MeshBasicMaterial({

    color:0x168cff,

    transparent:true,

    opacity:0.18,

    side:THREE.BackSide

});


const glow = new THREE.Mesh(
    glowGeometry,
    glowMaterial
);


scene.add(glow);




// Lights

const ambient = new THREE.AmbientLight(
    0xffffff,
    1.2
);

scene.add(ambient);



const sun = new THREE.DirectionalLight(
    0xffffff,
    2
);


sun.position.set(
    5,
    3,
    5
);


scene.add(sun);





// Stars

const starsGeometry =
new THREE.BufferGeometry();



const starsMaterial =
new THREE.PointsMaterial({

    color:0xffffff,

    size:0.015

});



let vertices=[];


for(let i=0;i<2500;i++){

    let x =
    (Math.random()-0.5)*25;

    let y =
    (Math.random()-0.5)*25;

    let z =
    (Math.random()-0.5)*25;


    vertices.push(
        x,y,z
    );

}



starsGeometry.setAttribute(
"position",
new THREE.Float32BufferAttribute(
    vertices,
    3
));



const stars =
new THREE.Points(
    starsGeometry,
    starsMaterial
);


scene.add(stars);




/* ===========================
   Animation
=========================== */

function animate() {

    requestAnimationFrame(animate);

    // دوران الكرة حول نفسها 🌍
    earth.rotation.y += 0.002;

    renderer.render(
        scene,
        camera
    );
}

animate();


animate();





// Responsive

window.addEventListener(
"resize",
()=>{


const newSize =
Math.min(
window.innerWidth*0.45,
600
);


camera.aspect=1;

camera.updateProjectionMatrix();


renderer.setSize(
newSize,
newSize
);


});