// Shaders
const vertexShader = `
  attribute vec3 a_Position;
  attribute vec3 a_Color;
  uniform mat4 u_MvpMatrix;
  varying lowp vec3 v_Color;
  void main() {
    gl_Position = u_MvpMatrix * vec4(a_Position, 1.0);
    v_Color = a_Color;
  }
`;

const fragmentShader = `
  precision mediump float;
  varying lowp vec3 v_Color;
  void main() {
    gl_FragColor = vec4(v_Color, 1.0);
  }
`;

// Funções de vetor 3D
const vec3_add = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const vec3_subtract = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const vec3_scale = (v, s) => [v[0] * s, v[1] * s, v[2] * s];
const vec3_length = (v) => Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
const vec3_normalize = (v) => {
  const length = vec3_length(v);
  return length === 0 ? [0, 0, 0] : [v[0] / length, v[1] / length, v[2] / length];
};
const vec3_cross = (a, b) => [
  a[1] * b[2] - a[2] * b[1],
  a[2] * b[0] - a[0] * b[2],
  a[0] * b[1] - a[1] * b[0]
];

// Funções de matriz 4x4
const mat4_multiply = (a, b) => {
  const result = new Float32Array(16);
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      result[i * 4 + j] = a[j] * b[i * 4] + a[j + 4] * b[i * 4 + 1] + 
                          a[j + 8] * b[i * 4 + 2] + a[j + 12] * b[i * 4 + 3];
    }
  }
  return result;
};

const mat4_frustum = (left, right, bottom, top, near, far) => {
  const matrix = new Float32Array(16);
  matrix[0] = 2 * near / (right - left);
  matrix[8] = (right + left) / (right - left);
  matrix[5] = 2 * near / (top - bottom);
  matrix[9] = (top + bottom) / (top - bottom);
  matrix[10] = (far + near) / (near - far);
  matrix[14] = 2 * far * near / (near - far);
  matrix[11] = -1;
  return matrix;
};

const mat4_lookAt = (eye, center, up) => {
  let z = vec3_normalize([eye[0] - center[0], eye[1] - center[1], eye[2] - center[2]]);
  let x = vec3_normalize(vec3_cross(up, z));
  let y = vec3_normalize(vec3_cross(z, x));
  
  const matrix = new Float32Array(16);
  matrix[0] = x[0]; matrix[4] = x[1]; matrix[8] = x[2];
  matrix[12] = -(x[0] * eye[0] + x[1] * eye[1] + x[2] * eye[2]);
  matrix[1] = y[0]; matrix[5] = y[1]; matrix[9] = y[2];
  matrix[13] = -(y[0] * eye[0] + y[1] * eye[1] + y[2] * eye[2]);
  matrix[2] = z[0]; matrix[6] = z[1]; matrix[10] = z[2];
  matrix[14] = -(z[0] * eye[0] + z[1] * eye[1] + z[2] * eye[2]);
  matrix[3] = 0; matrix[7] = 0; matrix[11] = 0; matrix[15] = 1;
  return matrix;
};

// Inicialização de Shaders
const initShaderProgram = (gl, vertexSource, fragmentSource) => {
  const compileShader = (type, source) => {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error('Erro ao compilar shader:', gl.getShaderInfoLog(shader));
      gl.deleteShader(shader);
      return null;
    }
    return shader;
  };
  
  const program = gl.createProgram();
  const vs = compileShader(gl.VERTEX_SHADER, vertexSource);
  const fs = compileShader(gl.FRAGMENT_SHADER, fragmentSource);
  
  if (!vs || !fs) return null;
  
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error('Erro ao linkar programa:', gl.getProgramInfoLog(program));
    return null;
  }
  
  return program;
};

// Criação de Buffers
const createBuffer = (gl, target, data) => {
  const buffer = gl.createBuffer();
  gl.bindBuffer(target, buffer);
  gl.bufferData(target, data, gl.STATIC_DRAW);
  return buffer;
};

// Inicialização de Geometrias
const initCubeBuffers = (gl) => {
  const size = 0.5;
  return {
    vertexBuffer: createBuffer(gl, gl.ARRAY_BUFFER, new Float32Array([
      -size,-size,size, size,-size,size, size,size,size, -size,size,size,
      -size,-size,-size, -size,size,-size, size,size,-size, size,-size,-size,
      -size,size,size, size,size,size, size,size,-size, -size,size,-size,
      -size,-size,size, -size,-size,-size, size,-size,-size, size,-size,size,
      size,-size,size, size,-size,-size, size,size,-size, size,size,size,
      -size,-size,size, -size,size,size, -size,size,-size, -size,-size,-size
    ])),
    colorBuffer: createBuffer(gl, gl.ARRAY_BUFFER, new Float32Array([
      1,0,0, 1,0,0, 1,0,0, 1,0,0,
      0,1,1, 0,1,1, 0,1,1, 0,1,1,
      0,1,0, 0,1,0, 0,1,0, 0,1,0,
      1,0,1, 1,0,1, 1,0,1, 1,0,1,
      0,0,1, 0,0,1, 0,0,1, 0,0,1,
      1,1,0, 1,1,0, 1,1,0, 1,1,0
    ])),
    indexBuffer: createBuffer(gl, gl.ELEMENT_ARRAY_BUFFER, new Uint16Array([
      0,1,2,0,2,3, 4,5,6,4,6,7, 8,9,10,8,10,11,
      12,13,14,12,14,15, 16,17,18,16,18,19, 20,21,22,20,22,23
    ])),
    vertexCount: 36
  };
};

const initPlaneBuffers = (gl) => ({
  vertexBuffer: createBuffer(gl, gl.ARRAY_BUFFER, new Float32Array([
    -10,-0.51,-10, 10,-0.51,-10, 10,-0.51,10, -10,-0.51,10
  ])),
  colorBuffer: createBuffer(gl, gl.ARRAY_BUFFER, new Float32Array([
    0.5,0.5,0.5, 0.5,0.5,0.5, 0.5,0.5,0.5, 0.5,0.5,0.5
  ])),
  indexBuffer: createBuffer(gl, gl.ELEMENT_ARRAY_BUFFER, new Uint16Array([0,1,2, 0,2,3])),
  vertexCount: 6
});

const initAxesBuffers = (gl) => ({
  vertexBuffer: createBuffer(gl, gl.ARRAY_BUFFER, new Float32Array([
    0,0,0, 0,0,5,  // Eixo X (Vermelho)
    0,0,0, 0,5,0,  // Eixo Y (Verde)
    0,0,0, 5,0,0   // Eixo Z (Azul)
  ])),
  colorBuffer: createBuffer(gl, gl.ARRAY_BUFFER, new Float32Array([
    1,0,0, 1,0,0,  // Vermelho
    0,1,0, 0,1,0,  // Verde
    0,0,1, 0,0,1   // Azul
  ])),
  vertexCount: 6
});

// Inicialização WebGL
const canvas = document.getElementById("glcanvas");
const gl = canvas.getContext("webgl");

if (!gl) { 
  alert("WebGL não suportado!"); 
  throw new Error("WebGL não disponível"); 
}

gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

const shaderProgram = initShaderProgram(gl, vertexShader, fragmentShader);
if (!shaderProgram) {
  alert("Erro ao inicializar shaders!");
  throw new Error("Falha na inicialização dos shaders");
}

gl.useProgram(shaderProgram);

const attribPosition = gl.getAttribLocation(shaderProgram, "a_Position");
const attribColor = gl.getAttribLocation(shaderProgram, "a_Color");
const uniformMvpMatrix = gl.getUniformLocation(shaderProgram, "u_MvpMatrix");

const cubeBuffers = initCubeBuffers(gl);
const planeBuffers = initPlaneBuffers(gl);
const axesBuffers = initAxesBuffers(gl);

// Parâmetros de projeção (controlados pela UI)
let fieldOfView = 60;
let nearPlane = 0.1;
let farPlane = 100.0;
let aspectRatio = gl.canvas.width / gl.canvas.height;

// Parâmetros da câmera
let cameraPosition = [2, 2, 5];
let cameraFront = [0, 0, -1];
const cameraUp = [0, 1, 0];
let yaw = -115, pitch = -20;

const updateCameraVectors = () => {
  const radYaw = yaw * Math.PI / 180;
  const radPitch = pitch * Math.PI / 180;
  cameraFront = vec3_normalize([
    Math.cos(radYaw) * Math.cos(radPitch),
    Math.sin(radPitch),
    Math.sin(radYaw) * Math.cos(radPitch)
  ]);
};
updateCameraVectors();

// Event listeners para controles da UI
const fovSlider = document.getElementById('fov');
const nearSlider = document.getElementById('near');
const farSlider = document.getElementById('far');
const aspectSlider = document.getElementById('aspect');

if (fovSlider) {
  fovSlider.addEventListener('input', (e) => {
    fieldOfView = parseFloat(e.target.value);
    document.getElementById('fovValue').textContent = fieldOfView + '°';
  });
}

if (nearSlider) {
  nearSlider.addEventListener('input', (e) => {
    nearPlane = parseFloat(e.target.value);
    document.getElementById('nearValue').textContent = nearPlane.toFixed(2);
  });
}

if (farSlider) {
  farSlider.addEventListener('input', (e) => {
    farPlane = parseFloat(e.target.value);
    document.getElementById('farValue').textContent = farPlane.toFixed(0);
  });
}

if (aspectSlider) {
  aspectSlider.addEventListener('input', (e) => {
    aspectRatio = parseFloat(e.target.value);
    document.getElementById('aspectValue').textContent = aspectRatio.toFixed(2);
  });
}

// Controle de teclado
const keys = {};
document.addEventListener("keydown", (e) => keys[e.key] = true);
document.addEventListener("keyup", (e) => keys[e.key] = false);

// Loop de renderização
let lastTime = 0;

const drawScene = (currentTime) => {
  currentTime *= 0.001;
  const deltaTime = currentTime - lastTime;
  lastTime = currentTime;

  const moveSpeed = 3 * deltaTime;
  const rotationSpeed = 90 * deltaTime;

  // Movimentação da câmera
  if (keys["w"] || keys["W"]) cameraPosition = vec3_add(cameraPosition, vec3_scale(cameraFront, moveSpeed));
  if (keys["s"] || keys["S"]) cameraPosition = vec3_subtract(cameraPosition, vec3_scale(cameraFront, moveSpeed));
  
  const cameraRight = vec3_normalize(vec3_cross(cameraFront, cameraUp));
  if (keys["a"] || keys["A"]) cameraPosition = vec3_subtract(cameraPosition, vec3_scale(cameraRight, moveSpeed));
  if (keys["d"] || keys["D"]) cameraPosition = vec3_add(cameraPosition, vec3_scale(cameraRight, moveSpeed));
  if (keys["e"] || keys["E"]) cameraPosition = vec3_add(cameraPosition, vec3_scale(cameraUp, moveSpeed));
  if (keys["q"] || keys["Q"]) cameraPosition = vec3_subtract(cameraPosition, vec3_scale(cameraUp, moveSpeed));

  // Rotação da câmera
  if (keys["ArrowLeft"]) yaw -= rotationSpeed;
  if (keys["ArrowRight"]) yaw += rotationSpeed;
  if (keys["ArrowUp"]) pitch = Math.min(89, pitch + rotationSpeed);
  if (keys["ArrowDown"]) pitch = Math.max(-89, pitch - rotationSpeed);
  if (keys["ArrowLeft"] || keys["ArrowRight"] || keys["ArrowUp"] || keys["ArrowDown"]) {
    updateCameraVectors();
  }

  // Cálculo da matriz de projeção
  const fovRadians = (fieldOfView * Math.PI) / 180;
  const topPlane = nearPlane * Math.tan(fovRadians / 2);
  const projectionMatrix = mat4_frustum(
    -topPlane * aspectRatio, topPlane * aspectRatio,
    -topPlane, topPlane,
    nearPlane, farPlane
  );

  // Cálculo da matriz de visão
  const cameraTarget = vec3_add(cameraPosition, cameraFront);
  const viewMatrix = mat4_lookAt(cameraPosition, cameraTarget, cameraUp);
  const mvpMatrix = mat4_multiply(projectionMatrix, viewMatrix);

  // Renderização
  gl.clearColor(1.0, 1.0, 1.0, 1.0); // Fundo branco
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.enable(gl.DEPTH_TEST);
  gl.uniformMatrix4fv(uniformMvpMatrix, false, mvpMatrix);

  const drawObject = (buffers, mode) => {
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.vertexBuffer);
    gl.vertexAttribPointer(attribPosition, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(attribPosition);
    
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.colorBuffer);
    gl.vertexAttribPointer(attribColor, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(attribColor);
    
    if (buffers.indexBuffer) {
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.indexBuffer);
      gl.drawElements(mode, buffers.vertexCount, gl.UNSIGNED_SHORT, 0);
    } else {
      gl.drawArrays(mode, 0, buffers.vertexCount);
    }
  };

  drawObject(cubeBuffers, gl.TRIANGLES);
  drawObject(planeBuffers, gl.TRIANGLES);
  drawObject(axesBuffers, gl.LINES);

  requestAnimationFrame(drawScene);
};

// Iniciar renderização
requestAnimationFrame(drawScene);
console.log("WebGL inicializado com sucesso!");