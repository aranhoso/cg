const vsSource = `
    attribute vec3 a_Position;
    attribute vec3 a_Color;
    uniform mat4 u_MvpMatrix;
    
    varying lowp vec3 v_Color;

    void main() {
        gl_Position = u_MvpMatrix * vec4(a_Position, 1.0);
        v_Color = a_Color;
    }
`;

const fsSource = `
    precision mediump float;
    varying lowp vec3 v_Color;

    void main() {
        gl_FragColor = vec4(v_Color, 1.0);
    }
`;

function mat4_create() {
    return new Float32Array(16);
}

function mat4_identity(out) {
    out.fill(0);
    out[0] = out[5] = out[10] = out[15] = 1;
    return out;
}

function mat4_multiply(out, a, b) {
    const a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3];
    const a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7];
    const a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11];
    const a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15];
    
    let b0 = b[0], b1 = b[1], b2 = b[2], b3 = b[3];
    out[0] = b0*a00 + b1*a10 + b2*a20 + b3*a30;
    out[1] = b0*a01 + b1*a11 + b2*a21 + b3*a31;
    out[2] = b0*a02 + b1*a12 + b2*a22 + b3*a32;
    out[3] = b0*a03 + b1*a13 + b2*a23 + b3*a33;

    b0 = b[4]; b1 = b[5]; b2 = b[6]; b3 = b[7];
    out[4] = b0*a00 + b1*a10 + b2*a20 + b3*a30;
    out[5] = b0*a01 + b1*a11 + b2*a21 + b3*a31;
    out[6] = b0*a02 + b1*a12 + b2*a22 + b3*a32;
    out[7] = b0*a03 + b1*a13 + b2*a23 + b3*a33;

    b0 = b[8]; b1 = b[9]; b2 = b[10]; b3 = b[11];
    out[8] = b0*a00 + b1*a10 + b2*a20 + b3*a30;
    out[9] = b0*a01 + b1*a11 + b2*a21 + b3*a31;
    out[10] = b0*a02 + b1*a12 + b2*a22 + b3*a32;
    out[11] = b0*a03 + b1*a13 + b2*a23 + b3*a33;

    b0 = b[12]; b1 = b[13]; b2 = b[14]; b3 = b[15];
    out[12] = b0*a00 + b1*a10 + b2*a20 + b3*a30;
    out[13] = b0*a01 + b1*a11 + b2*a21 + b3*a31;
    out[14] = b0*a02 + b1*a12 + b2*a22 + b3*a32;
    out[15] = b0*a03 + b1*a13 + b2*a23 + b3*a33;
    
    return out;
}

function mat4_ortho(out, left, right, bottom, top, near, far) {
    const lr = 1 / (left - right);
    const bt = 1 / (bottom - top);
    const nf = 1 / (near - far);
    
    out[0] = -2 * lr; out[1] = 0; out[2] = 0; out[3] = 0;
    out[4] = 0; out[5] = -2 * bt; out[6] = 0; out[7] = 0;
    out[8] = 0; out[9] = 0; out[10] = 2 * nf; out[11] = 0;
    out[12] = (left + right) * lr;
    out[13] = (top + bottom) * bt;
    out[14] = (far + near) * nf;
    out[15] = 1;
    
    return out;
}

function mat4_lookAt(out, eye, center, up) {
    let x0, x1, x2, y0, y1, y2, z0, z1, z2, len;
    
    z0 = eye[0] - center[0];
    z1 = eye[1] - center[1];
    z2 = eye[2] - center[2];
    len = 1 / Math.sqrt(z0 * z0 + z1 * z1 + z2 * z2);
    z0 *= len; z1 *= len; z2 *= len;

    x0 = up[1] * z2 - up[2] * z1;
    x1 = up[2] * z0 - up[0] * z2;
    x2 = up[0] * z1 - up[1] * z0;
    len = Math.sqrt(x0 * x0 + x1 * x1 + x2 * x2);
    if (!len) { x0 = 0; x1 = 0; x2 = 0; }
    else { len = 1 / len; x0 *= len; x1 *= len; x2 *= len; }

    y0 = z1 * x2 - z2 * x1;
    y1 = z2 * x0 - z0 * x2;
    y2 = z0 * x1 - z1 * x0;
    len = Math.sqrt(y0 * y0 + y1 * y1 + y2 * y2);
    if (!len) { y0 = 0; y1 = 0; y2 = 0; }
    else { len = 1 / len; y0 *= len; y1 *= len; y2 *= len; }

    out[0] = x0; out[1] = y0; out[2] = z0; out[3] = 0;
    out[4] = x1; out[5] = y1; out[6] = z1; out[7] = 0;
    out[8] = x2; out[9] = y2; out[10] = z2; out[11] = 0;
    out[12] = -(x0 * eye[0] + x1 * eye[1] + x2 * eye[2]);
    out[13] = -(y0 * eye[0] + y1 * eye[1] + y2 * eye[2]);
    out[14] = -(z0 * eye[0] + z1 * eye[1] + z2 * eye[2]);
    out[15] = 1;
    
    return out;
}

function initShaderProgram(gl, vsSource, fsSource) {
    const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
    const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);
    const shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);
    
    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        console.error('Falha ao inicializar o shader: ' + gl.getProgramInfoLog(shaderProgram));
        return null;
    }
    return shaderProgram;
}

function loadShader(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error('Falha ao compilar o shader: ' + gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }
    return shader;
}

function parseOBJ(text) {
    const vertices = [];
    const colors = [];
    const indices = [];
    
    const lines = text.split('\n');
    const positions = [];
    const faces = [];
    
    // Parse vertices and faces
    for (let line of lines) {
        line = line.trim();
        if (line.startsWith('v ')) {
            const parts = line.split(/\s+/);
            positions.push(
                parseFloat(parts[1]),
                parseFloat(parts[2]),
                parseFloat(parts[3])
            );
        } else if (line.startsWith('f ')) {
            const parts = line.split(/\s+/).slice(1);
            const faceIndices = parts.map(part => {
                const indices = part.split('/');
                return parseInt(indices[0]) - 1; // OBJ indices start at 1
            });
            
            // Triangulate face if needed
            for (let i = 1; i < faceIndices.length - 1; i++) {
                faces.push(faceIndices[0], faceIndices[i], faceIndices[i + 1]);
            }
        }
    }
    
    // Normalize vertices to fit in view
    let minX = Infinity, maxX = -Infinity;
    let minY = Infinity, maxY = -Infinity;
    let minZ = Infinity, maxZ = -Infinity;
    
    for (let i = 0; i < positions.length; i += 3) {
        minX = Math.min(minX, positions[i]);
        maxX = Math.max(maxX, positions[i]);
        minY = Math.min(minY, positions[i + 1]);
        maxY = Math.max(maxY, positions[i + 1]);
        minZ = Math.min(minZ, positions[i + 2]);
        maxZ = Math.max(maxZ, positions[i + 2]);
    }
    
    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;
    const centerZ = (minZ + maxZ) / 2;
    const scale = 2.0 / Math.max(maxX - minX, maxY - minY, maxZ - minZ);
    
    // Normalize and add to vertices array
    for (let i = 0; i < positions.length; i += 3) {
        vertices.push(
            (positions[i] - centerX) * scale,
            (positions[i + 1] - centerY) * scale,
            (positions[i + 2] - centerZ) * scale
        );
    }
    
    // Generate colors based on vertex position (colorful gradient)
    for (let i = 0; i < vertices.length; i += 3) {
        const x = vertices[i];
        const y = vertices[i + 1];
        const z = vertices[i + 2];
        
        // Create gradient colors
        colors.push(
            (x + 1) * 0.5,
            (y + 1) * 0.5,
            (z + 1) * 0.5
        );
    }
    
    return {
        vertices: new Float32Array(vertices),
        colors: new Float32Array(colors),
        indices: new Uint16Array(faces),
        vertexCount: faces.length
    };
}

function initCubeBuffers(gl) {
    const v = 0.5;
    const vertices = new Float32Array([
      -v, -v,  v,   v, -v,  v,   v,  v,  v,  -v,  v,  v,
      -v, -v, -v,  -v,  v, -v,   v,  v, -v,   v, -v, -v,
      -v,  v,  v,   v,  v,  v,   v,  v, -v,  -v,  v, -v,
      -v, -v,  v,  -v, -v, -v,   v, -v, -v,   v, -v,  v,
       v, -v,  v,   v, -v, -v,   v,  v, -v,   v,  v,  v,
      -v, -v,  v,  -v,  v,  v,  -v,  v, -v,  -v, -v, -v,
    ]);

    const colors = new Float32Array([
        1, 0, 0,  1, 0, 0,  1, 0, 0,  1, 0, 0,
        0, 1, 1,  0, 1, 1,  0, 1, 1,  0, 1, 1,
        0, 1, 0,  0, 1, 0,  0, 1, 0,  0, 1, 0,
        1, 0, 1,  1, 0, 1,  1, 0, 1,  1, 0, 1,
        0, 0, 1,  0, 0, 1,  0, 0, 1,  0, 0, 1,
        1, 1, 0,  1, 1, 0,  1, 1, 0,  1, 1, 0,
    ]);

    const indices = new Uint16Array([
        0, 1, 2,   0, 2, 3,
        4, 5, 6,   4, 6, 7,
        8, 9, 10,  8, 10, 11,
        12, 13, 14, 12, 14, 15,
        16, 17, 18, 16, 18, 19,
        20, 21, 22, 20, 22, 23,
    ]);

    const vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    const colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, colors, gl.STATIC_DRAW);

    const indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW); 
    
    return { 
        vertexBuffer: vertexBuffer, 
        colorBuffer: colorBuffer, 
        indexBuffer: indexBuffer, 
        vertexCount: indices.length 
    };
}

function initModelBuffers(gl, modelData) {
    const vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, modelData.vertices, gl.STATIC_DRAW);

    const colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, modelData.colors, gl.STATIC_DRAW);

    const indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, modelData.indices, gl.STATIC_DRAW);
    
    return {
        vertexBuffer: vertexBuffer,
        colorBuffer: colorBuffer,
        indexBuffer: indexBuffer,
        vertexCount: modelData.vertexCount
    };
}

const canvas = document.getElementById('glcanvas');
const gl = canvas.getContext('webgl');

if (!gl) {
    alert("WebGL não suportado!");
    throw new Error("WebGL não suportado!");
}

const shaderProgram = initShaderProgram(gl, vsSource, fsSource);
gl.useProgram(shaderProgram);

const a_Position = gl.getAttribLocation(shaderProgram, 'a_Position');
const a_Color = gl.getAttribLocation(shaderProgram, 'a_Color');
const u_MvpMatrix = gl.getUniformLocation(shaderProgram, 'u_MvpMatrix');

let cameraMode = 'orbit';
let isAnimating = false;
let eye = [2.0, 2.0, 3.0];
let center = [0.0, 0.0, 0.0];
const up = [0.0, 1.0, 0.0];

let orbitRadius = Math.sqrt(eye[0]*eye[0] + eye[1]*eye[1] + eye[2]*eye[2]);
let orbitAngleY = Math.atan2(eye[0], eye[2]);
let orbitAngleX = Math.asin(eye[1] / orbitRadius);

const modelMatrix = mat4_identity(mat4_create());
const viewMatrix = mat4_create();
const projMatrix = mat4_create();
const mvpMatrix = mat4_create();

const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
const orthoSize = 3.0;
mat4_ortho(projMatrix, 
    -orthoSize * aspect, orthoSize * aspect,
    -orthoSize, orthoSize,
    -10.0, 10.0);

let cubeBuffers = initCubeBuffers(gl);

fetch('pslogo_textured.obj')
    .then(response => response.text())
    .then(objText => {
        const modelData = parseOBJ(objText);
        cubeBuffers = initModelBuffers(gl, modelData);
        console.log('PSX Logo carregado com sucesso!');
        console.log('Vértices:', modelData.vertices.length / 3);
        console.log('Faces:', modelData.vertexCount / 3);
    })
    .catch(error => {
        console.error('Erro ao carregar OBJ:', error);
        console.log('Usando cubo padrão');
    });

function drawScene() {
    gl.clearColor(1.0, 1.0, 1.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST);

    if (isAnimating) {
        orbitAngleY += 0.01;
    }

    if (cameraMode === 'orbit') {
        center = [0.0, 0.0, 0.0];
        eye[0] = orbitRadius * Math.cos(orbitAngleX) * Math.sin(orbitAngleY);
        eye[1] = orbitRadius * Math.sin(orbitAngleX);
        eye[2] = orbitRadius * Math.cos(orbitAngleX) * Math.cos(orbitAngleY);
    }
    
    mat4_lookAt(viewMatrix, eye, center, up);
    mat4_multiply(mvpMatrix, projMatrix, viewMatrix);

    gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMatrix);
    gl.bindBuffer(gl.ARRAY_BUFFER, cubeBuffers.vertexBuffer);
    gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_Position);
    gl.bindBuffer(gl.ARRAY_BUFFER, cubeBuffers.colorBuffer);
    gl.vertexAttribPointer(a_Color, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_Color);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeBuffers.indexBuffer);
    gl.drawElements(gl.TRIANGLES, cubeBuffers.vertexCount, gl.UNSIGNED_SHORT, 0);

    requestAnimationFrame(drawScene);
}

function updateStatusBar() {
    const statusBar = document.getElementById('camera-mode-status');
    if (statusBar) {
        if (isAnimating) {
            statusBar.innerText = 'Animação Automática (A)';
        } else {
            statusBar.innerText = cameraMode === 'orbit' ? 'Órbita' : 'Panorâmica (Pan)';
        }
    }
}

window.addEventListener('keydown', function(event) {
    const key = event.key.toLowerCase();
    const step = 0.1;
    const angleStep = 0.05;

    if (key === 'a') {
        isAnimating = !isAnimating;
        if (isAnimating) {
            cameraMode = 'orbit';
        }
        updateStatusBar();
        return;
    }

    if (isAnimating) {
        isAnimating = false;
    }

    if (key === 'o') {
        cameraMode = 'orbit';
    } else if (key === 'p') {
        cameraMode = 'pan';
    }

    if (key === '+' || key === '=') {
        orbitRadius = Math.max(0.1, orbitRadius - step);
        if(cameraMode === 'pan') { eye[2] -= step; center[2] -= step; }
    } else if (key === '-') {
        orbitRadius += step;
        if(cameraMode === 'pan') { eye[2] += step; center[2] += step; }
    }

    if (cameraMode === 'orbit') {
        if (key === 'arrowleft') orbitAngleY += angleStep;
        if (key === 'arrowright') orbitAngleY -= angleStep;
        if (key === 'arrowup') orbitAngleX -= angleStep;
        if (key === 'arrowdown') orbitAngleX += angleStep;

        const limit = Math.PI / 2 - 0.01;
        orbitAngleX = Math.max(-limit, Math.min(limit, orbitAngleX));

    } else if (cameraMode === 'pan') {
        if (key === 'arrowleft') {
            eye[0] += step;
            center[0] += step;
        }
        if (key === 'arrowright') {
            eye[0] -= step;
            center[0] -= step;
        }
        if (key === 'arrowup') {
            eye[1] -= step;
            center[1] -= step;
        }
        if (key === 'arrowdown') {
            eye[1] += step;
            center[1] += step;
        }
    }
    
    updateStatusBar();
});

updateStatusBar();
requestAnimationFrame(drawScene);