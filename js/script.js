const bgEslim = '../assets/images/bg2.png';
const eslims = [
    '../assets/images/elements/1.png',
    '../assets/images/elements/2.png',
    '../assets/images/elements/3.png',
    '../assets/images/elements/4.png'
];

// Load the audio file
const audioFile = '../assets/media/audio.mp3';

let analyser;
let isPlaying = false;
let toggleColorsTimeout;
let colorsEnabled = true;

// Create a Web Audio API context
const audioContext = new (window.AudioContext || window.webkitAudioContext)();

// Define the eslim animation properties
const duration = 2;
let distance = 10;

const app = new PIXI.Application({
    width: window.innerWidth,
    height: window.innerHeight,
});

document.body.appendChild(app.view);
app.stage.interactive = true;

const eslimBg = PIXI.Sprite.from(bgEslim);
eslimBg.anchor.set(0.5);
app.stage.addChild(eslimBg);

const container = new PIXI.Container();
container.alpha = 0.7;
app.stage.addChild(container);

const eslim1 = PIXI.Sprite.from(eslims[0]);
eslim1.anchor.set(0.5);
container.addChild(eslim1);

const eslim2 = PIXI.Sprite.from(eslims[1]);
eslim2.anchor.set(0.5);
container.addChild(eslim2);

const eslim3 = PIXI.Sprite.from(eslims[2]);
eslim3.anchor.set(0.5);
container.addChild(eslim3);

const eslim4 = PIXI.Sprite.from(eslims[3]);
eslim4.anchor.set(0.5);
container.addChild(eslim4);


const filter = new PIXI.filters.ColorMatrixFilter();
randomizeColorMatrix(filter);


// Function to randomize the ColorMatrixFilter matrix values
function randomizeColorMatrix(filter) {
    const matrix = filter.matrix;

    // Modify the matrix values randomly
    for (let i = 0; i < matrix.length; i++) {
        matrix[i] = Math.random() * 2 - 1;
    }

    filter.matrix = matrix;
}

let count = 0;

const help = new PIXI.Text('Tap/Click and wait to play and again to toggle colors', {
    fontFamily: 'Arial',
    fontSize: 16,
    fontWeight: 'bold',
    fill: 'white',
});

app.stage.addChild(help);

app.ticker.add((delta) => {
    eslim4.scale.x = 1 + Math.sin(count) * 0.04;
    eslim4.scale.y = 1 + Math.cos(count) * 0.04;

    count += 0.1;

    const { matrix } = filter;

    matrix[1] = Math.sin(count) * 3;
    matrix[2] = Math.cos(count);
    matrix[3] = Math.cos(count) * 1.5;
    matrix[4] = Math.sin(count / 3) * 2;
    matrix[5] = Math.sin(count / 2);
    matrix[6] = Math.sin(count / 4);
});

app.stage.on('pointertap', () => {
    startAudioPlayback();
    distance = 50;
    randomizeColorMatrix(filter);
    colorsEnabled = !colorsEnabled;
    toggleColors();
});

// Define a function to update the rotation based on the audio data
function updateRotation() {
    // Get the audio data from the analyser
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyser.getByteFrequencyData(dataArray);

    render3d(dataArray, filter);

    // Calculate the average frequency
    let sum = 0;
    for (let i = 0; i < bufferLength; i++) {
        sum += dataArray[i];
    }
    const averageFrequency = sum / bufferLength;

    // Update the rotation based on the average frequency
    const rotationSpeed = (averageFrequency / 100) * 0.01;
    eslimBg.rotation += rotationSpeed * 10;
    eslim1.rotation -= rotationSpeed * 3;
    eslim3.rotation += rotationSpeed * 2;
    eslim2.rotation += rotationSpeed * 5;
    eslim4.rotation += rotationSpeed;

    if (averageFrequency > 50) {
        if (toggleColorsTimeout) {
            clearTimeout(toggleColorsTimeout);
        }

        toggleColorsTimeout = setTimeout(() => {
            toggleColors();
        }, 1000);
    }

    // Call the updateRotation function on the next animation frame
    requestAnimationFrame(updateRotation);


}

// Function to handle button click and start audio playback
async function startAudioPlayback() {
    const buffer = await loadAudio(audioFile, (progress) => {
        let p = document.getElementById("progress");

        if (!p) {
            return;
        }

        if (progress >= 100) {
            p.remove();
            return;
        }
        p.style.width = `${progress}vw`;

    });

    if (isPlaying) {
        return;
    }

    isPlaying = true;

    const source = audioContext.createBufferSource();
    source.buffer = buffer;

    // Create an analyser node
    analyser = audioContext.createAnalyser();
    analyser.fftSize = 2048;

    // Connect the source to the analyser
    source.connect(analyser);

    // Connect the analyser to the audio context destination
    analyser.connect(audioContext.destination);

    source.start();

    init3D('scene3d');

    // Call the updateRotation function to start updating the rotation
    updateRotation();

}

function toggleColors() {
    // colorsEnabled = !colorsEnabled; // To toggle status of colors 
    randomizeColorMatrix(filter);
    app.stage.filters = colorsEnabled ? [filter] : null;

}

// Create the GSAP animation
function animate() {
    animation = gsap.to(container, {
        x: `+=${distance}`,
        y: `+=${distance}`,
        duration: duration,
        ease: "power1.inOut",
        onComplete: () => {
            gsap.to(container, {
                x: `-=${distance}`,
                y: `-=${distance}`,
                duration: duration,
                ease: "power1.inOut",
                onComplete: animate, // Repeat the animation when completed
            });
        },
    });
}


// Function to handle resizing of the PIXI application
function handleResize() {
    // Update the dimensions of the PIXI application
    app.renderer.resize(window.innerWidth, window.innerHeight);

    let x = app.screen.width / 2;
    let y = app.screen.height / 2;;
    eslimBg.x = x; eslimBg.y = y;
    container.x = x - (distance / 2); container.y = y - (distance / 2);
    help.x = 10; help.y = app.screen.height - 30;

}

// Listen for the 'resize' event and call the handleResize function
window.addEventListener('resize', handleResize);

// Call the handleResize function initially to set the correct dimensions
handleResize();

// Start the animation
animate();
