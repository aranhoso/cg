const vsSource = `
    attribute vec2 a_Position;
    void main() {
        gl_Position = vec4(a_Position, 0.0, 1.0);
    }
`;

const fsSource = `
    precision mediump float;
    uniform vec4 u_FragColor;
    void main() {
        gl_FragColor = u_FragColor;
    }
`;

const canvas = document.getElementById('glcanvas');
const gl = canvas.getContext('webgl');

const shaderProgram = initShaderProgram(gl, vsSource, fsSource);
gl.useProgram(shaderProgram);

const a_Position = gl.getAttribLocation(shaderProgram, 'a_Position');
const u_FragColor = gl.getUniformLocation(shaderProgram, 'u_FragColor');

const colorPalette = [
    [0.0, 0.0, 0.0, 1.0],
    [1.0, 0.0, 0.0, 1.0],
    [0.0, 1.0, 0.0, 1.0],
    [0.0, 0.0, 1.0, 1.0],
    [1.0, 1.0, 0.0, 1.0],
    [1.0, 0.0, 1.0, 1.0],
    [0.0, 1.0, 1.0, 1.0],
    [1.0, 0.5, 0.0, 1.0],
    [0.5, 0.0, 1.0, 1.0],
    [0.5, 0.5, 0.5, 1.0],
];

let shapes = [];
let tempPoints = [];

let currentDrawingMode = 'lines';
let keyboardInputMode = 'none';
let currentColor = colorPalette[0];
let currentThickness = 1;

function updateStatusBar() {
    const statusBar = document.getElementById('status-bar');
    const strongElements = statusBar.querySelectorAll('strong');
    
    if (strongElements.length >= 3) {
        strongElements[0].innerText = currentDrawingMode === 'lines' ? 'Linhas' : 'Triângulos';
        strongElements[1].innerText = keyboardInputMode === 'none' ? 'Nenhum' : 
            (keyboardInputMode === 'color' ? 'Cor' : 'Espessura');
        strongElements[2].innerText = currentThickness;
    }
    
    const colorPreview = document.getElementById('color-preview');
    if (colorPreview) {
        colorPreview.style.backgroundColor = `rgb(${currentColor[0]*255}, ${currentColor[1]*255}, ${currentColor[2]*255})`;
    }
}

canvas.addEventListener('click', function(event) {
    const rect = canvas.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / canvas.width) * 2 - 1;
    const y = -(((event.clientY - rect.top) / canvas.height) * 2 - 1);

    tempPoints.push(x, y);

    if (currentDrawingMode === 'lines' && tempPoints.length === 4) {
        shapes.push({
            vertices: new Float32Array(tempPoints),
            color: currentColor,
            thickness: currentThickness,
            primitive: gl.LINES,
        });
        tempPoints = [];
    } else if (currentDrawingMode === 'triangles' && tempPoints.length === 6) {
        shapes.push({
            vertices: new Float32Array(tempPoints),
            color: currentColor,
            thickness: currentThickness,
            primitive: gl.LINE_LOOP,
        });
        tempPoints = [];
    }
});

window.addEventListener('keydown', function(event) {
    const key = event.key.toLowerCase();

    if (key === 'k') {
        keyboardInputMode = 'color';
    } else if (key === 'e') {
        keyboardInputMode = 'thickness';
    } else if (key === 'l') {
        currentDrawingMode = 'lines';
        tempPoints = [];
    } else if (key === 't') {
        currentDrawingMode = 'triangles';
        tempPoints = [];
    }

    const digit = parseInt(key, 10);
    if (!isNaN(digit)) {
        if (keyboardInputMode === 'color' && digit >= 0 && digit <= 9) {
            currentColor = colorPalette[digit];
            keyboardInputMode = 'none';
        } else if (keyboardInputMode === 'thickness' && digit >= 1 && digit <= 9) {
            currentThickness = digit;
            keyboardInputMode = 'none';
        }
    }
    console.log(keyboardInputMode, key);
    updateStatusBar();
});

function drawScene() {
    gl.clearColor(1.0, 1.0, 1.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    for (const shape of shapes) {
        const vertexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, shape.vertices, gl.STATIC_DRAW);

        gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(a_Position);

        gl.uniform4fv(u_FragColor, shape.color);
        gl.lineWidth(shape.thickness);

        gl.drawArrays(shape.primitive, 0, shape.vertices.length / 2);
    }
    // console.log(shapes);
    requestAnimationFrame(drawScene);
}

function initShaderProgram(gl, vsSource, fsSource) {
    const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
    const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);
    const shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);
    return shaderProgram;
}

function loadShader(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    return shader;
}

updateStatusBar();
requestAnimationFrame(drawScene);