let inited3d = false;
//initialise simplex noise instance
var noise = new SimplexNoise();
let meshRoof, meshFloor,ball, scene, group, camera, renderer;

function init3D(viewId) {
    if (inited3d) {
        return;
    }

    inited3d = true;

    //here comes the webgl
    scene = new THREE.Scene();
    group = new THREE.Group();
    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 0, 100);
    camera.lookAt(scene.position);
    scene.add(camera);

    renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);

    const w = 100, h = 100;
    var meshGeometry = new THREE.PlaneGeometry(w, h, 20, 20);
    var meshMaterial = new THREE.MeshLambertMaterial({
        color: 0x6904ce,
        side: THREE.DoubleSide,
        wireframe: true
    });

    meshRoof = new THREE.Mesh(meshGeometry, meshMaterial);
    meshRoof.rotation.x = -0.5 * Math.PI;
    meshRoof.position.set(0, 50, 0);
    group.add(meshRoof);

    meshFloor = new THREE.Mesh(meshGeometry, meshMaterial);
    meshFloor.rotation.x = -0.5 * Math.PI;
    meshFloor.position.set(0, -50, 0);
    group.add(meshFloor);

    var icosahedronGeometry = new THREE.IcosahedronGeometry(2, 1);
    var lambertMaterial = new THREE.MeshLambertMaterial({
        color: 0xff00ee,
        wireframe: true
    });

    ball = new THREE.Mesh(icosahedronGeometry, lambertMaterial);
    ball.position.set(0, 0, 0);
    group.add(ball);

    var ambientLight = new THREE.AmbientLight(0xaaaaaa);
    scene.add(ambientLight);

    var spotLight = new THREE.SpotLight(0xffffff);
    spotLight.intensity = 0.9;
    spotLight.position.set(-10, 40, 20);
    spotLight.lookAt(ball);
    spotLight.castShadow = true;
    scene.add(spotLight);

    // var orbitControls = new THREE.OrbitControls(camera, renderer.domElement);
    // orbitControls.autoRotate = true;

    scene.add(group);

    document.getElementById(viewId).appendChild(renderer.domElement);

    window.addEventListener('resize', onWindowResize, false);

    function onWindowResize() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    }

    document.body.addEventListener('touchend', function (ev) { context.resume(); });

}



function render3d(dataArray, filter) {
    if (!dataArray) {
        return;
    }


    var lowerHalfArray = dataArray.slice(0, (dataArray.length / 2) - 1);
    var upperHalfArray = dataArray.slice((dataArray.length / 2) - 1, dataArray.length - 1);

    var overallAvg = avg(dataArray);
    var lowerMax = max(lowerHalfArray);
    var lowerAvg = avg(lowerHalfArray);
    var upperMax = max(upperHalfArray);
    var upperAvg = avg(upperHalfArray);

    var lowerMaxFr = lowerMax / lowerHalfArray.length;
    var lowerAvgFr = lowerAvg / lowerHalfArray.length;
    var upperMaxFr = upperMax / upperHalfArray.length;
    var upperAvgFr = upperAvg / upperHalfArray.length;

    console.log(upperAvg)
    let randomColor = toHexColor(upperAvg);


    makeRoughGround(meshRoof, modulate(upperAvgFr, 0, 1, 0.5, 4), randomColor);
    makeRoughGround(meshFloor, modulate(lowerMaxFr, 0, 1, 0.5, 4), randomColor);

      makeRoughBall(ball, modulate(Math.pow(lowerMaxFr, 0.8), 0, 1, 0, 8), modulate(upperAvgFr, 0, 1, 0, 4), randomColor);

    group.rotation.y += 0.005;
    renderer.render(scene, camera);
}

function makeRoughGround(mesh, distortionFr, randomColor) {
    mesh.geometry.vertices.forEach(function (vertex, i) {
        var amp = 2;
        var time = Date.now();
        var distance = (noise.noise2D(vertex.x + time * 0.0003, vertex.y + time * 0.0001) + 0) * distortionFr * amp;
        vertex.z = distance;
    });

    mesh.material.color.set(randomColor); // Set the color of the mesh material

    mesh.geometry.verticesNeedUpdate = true;
    mesh.geometry.normalsNeedUpdate = true;
    mesh.geometry.computeVertexNormals();
    mesh.geometry.computeFaceNormals();
}


function makeRoughBall(mesh, bassFr, treFr, randomColor) {
    mesh.geometry.vertices.forEach(function (vertex, i) {
        var offset = mesh.geometry.parameters.radius;
        var amp = 10;
        var time = window.performance.now();
        vertex.normalize();
        var rf = 0.00001;
        var distance = (offset + bassFr) + noise.noise3D(vertex.x + time * rf * 7, vertex.y + time * rf * 8, vertex.z + time * rf * 9) * amp * treFr;
        vertex.multiplyScalar(distance);
    });

    mesh.material.color.set(randomColor); // Set the color of the mesh material

    mesh.geometry.verticesNeedUpdate = true;
    mesh.geometry.normalsNeedUpdate = true;
    mesh.geometry.computeVertexNormals();
    mesh.geometry.computeFaceNormals();
}
