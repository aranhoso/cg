const vertexShaderSourceBender = `
    attribute vec4 a_position;
    void main() {
        gl_Position = a_position;
    }
`;

const fragmentShaderSourceBender = `
    precision mediump float;
    uniform vec3 u_color;
    void main() {
        gl_FragColor = vec4(u_color, 1.0);
    }
`;

function createShaderBender(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error('Error compiling shader:', gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }
    
    return shader;
}

function createProgramBender(gl, vertexShader, fragmentShader) {
    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error('Error linking program:', gl.getProgramInfoLog(program));
        gl.deleteProgram(program);
        return null;
    }
    
    return program;
}

function drawTriangleStrip(gl, program, vertices, color) {
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    
    const positionLocation = gl.getAttribLocation(program, 'a_position');
    const colorLocation = gl.getUniformLocation(program, 'u_color');
    
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
    gl.uniform3fv(colorLocation, color);
    
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, vertices.length / 2);
}

function drawTriangleFan(gl, program, vertices, color) {
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    
    const positionLocation = gl.getAttribLocation(program, 'a_position');
    const colorLocation = gl.getUniformLocation(program, 'u_color');
    
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
    gl.uniform3fv(colorLocation, color);
    
    gl.drawArrays(gl.TRIANGLE_FAN, 0, vertices.length / 2);
}

function mainBender() {
    const canvas = document.getElementById('glCanvas1');
    const gl = canvas.getContext('webgl');
    
    if (!gl) {
        console.error('WebGL not supported');
        return;
    }
    
    const vertexShader = createShaderBender(gl, gl.VERTEX_SHADER, vertexShaderSourceBender);
    const fragmentShader = createShaderBender(gl, gl.FRAGMENT_SHADER, fragmentShaderSourceBender);
    const program = createProgramBender(gl, vertexShader, fragmentShader);
    
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.1, 0.1, 0.2, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    
    gl.useProgram(program);

    const metalGray = [0.7, 0.7, 0.75];
    const darkGray = [0.4, 0.4, 0.45];
    const yellow = [1.0, 0.9, 0.2];
    const red = [0.9, 0.2, 0.2];
    const black = [0.1, 0.1, 0.1];
    
    const head = [
        -0.3, 0.2,   // bottom left
        -0.3, 0.7,   // top left
        0.3, 0.2,    // bottom right
        0.3, 0.7,    // top right
    ];
    drawTriangleStrip(gl, program, head, metalGray);
    
    const headTop = [
        0.0, 0.8,    // center top
        -0.3, 0.7,   // left
        -0.2, 0.75,  // left-mid
        0.2, 0.75,   // right-mid
        0.3, 0.7,    // right
    ];
    drawTriangleFan(gl, program, headTop, metalGray);
    
    const body = [
        -0.25, 0.2,   // top left
        -0.25, -0.4,  // bottom left
        0.25, 0.2,    // top right
        0.25, -0.4,   // bottom right
    ];
    drawTriangleStrip(gl, program, body, metalGray);
    
    const chestPanel = [
        -0.15, 0.1,   // top left
        -0.15, -0.1,  // bottom left
        0.15, 0.1,    // top right
        0.15, -0.1,   // bottom right
    ];
    drawTriangleStrip(gl, program, chestPanel, darkGray);
    
    const leftEye = [
        0.0, 0.55,    // center
        -0.15, 0.5,   // left
        -0.1, 0.6,    // top-left
        -0.05, 0.6,   // top-right
        -0.05, 0.5,   // right
        -0.1, 0.45,   // bottom-right
        -0.15, 0.45,  // bottom-left
        -0.15, 0.5,   // back to left
    ];
    drawTriangleFan(gl, program, leftEye, yellow);
    
    // Right eye
    const rightEye = [
        0.0, 0.55,    // center
        0.15, 0.5,    // left
        0.1, 0.6,     // top-left
        0.05, 0.6,    // top-right
        0.05, 0.5,    // right
        0.1, 0.45,    // bottom-right
        0.15, 0.45,   // bottom-left
        0.15, 0.5,    // back to left
    ];
    drawTriangleFan(gl, program, rightEye, yellow);
    
    // Left pupil
    const leftPupil = [
        -0.1, 0.52,   // center
        -0.13, 0.5,   // left
        -0.1, 0.55,   // top
        -0.07, 0.5,   // right
        -0.1, 0.49,   // bottom
        -0.13, 0.5,   // back to left
    ];
    drawTriangleFan(gl, program, leftPupil, black);
    
    // Right pupil
    const rightPupil = [
        0.1, 0.52,    // center
        0.07, 0.5,    // left
        0.1, 0.55,    // top
        0.13, 0.5,    // right
        0.1, 0.49,    // bottom
        0.07, 0.5,    // back to left
    ];
    drawTriangleFan(gl, program, rightPupil, black);
    
    // Mouth
    const mouth = [
        -0.08, 0.3,   // top left
        -0.08, 0.25,  // bottom left
        0.08, 0.3,    // top right
        0.08, 0.25,   // bottom right
    ];
    drawTriangleStrip(gl, program, mouth, black);
    
    // Antenna
    const antenna = [
        -0.02, 0.8,   // bottom left
        -0.02, 0.95,  // top left
        0.02, 0.8,    // bottom right
        0.02, 0.95,   // top right
    ];
    drawTriangleStrip(gl, program, antenna, darkGray);
    
    // Antenna tip
    const antennaTip = [
        0.0, 1.0,     // center
        -0.03, 0.95,  // left
        0.0, 0.98,    // top
        0.03, 0.95,   // right
        0.0, 0.92,    // bottom
        -0.03, 0.95,  // back to left
    ];
    drawTriangleFan(gl, program, antennaTip, red);
    
    // Arms
    const leftArm = [
        -0.4, 0.1,    // top left
        -0.4, -0.1,   // bottom left
        -0.25, 0.1,   // top right
        -0.25, -0.1,  // bottom right
    ];
    drawTriangleStrip(gl, program, leftArm, metalGray);
    
    const rightArm = [
        0.25, 0.1,    // top left
        0.25, -0.1,   // bottom left
        0.4, 0.1,     // top right
        0.4, -0.1,    // bottom right
    ];
    drawTriangleStrip(gl, program, rightArm, metalGray);
    
    // Legs
    const leftLeg = [
        -0.15, -0.4,  // top left
        -0.15, -0.7,  // bottom left
        -0.05, -0.4,  // top right
        -0.05, -0.7,  // bottom right
    ];
    drawTriangleStrip(gl, program, leftLeg, metalGray);
    
    const rightLeg = [
        0.05, -0.4,   // top left
        0.05, -0.7,   // bottom left
        0.15, -0.4,   // top right
        0.15, -0.7,   // bottom right
    ];
    drawTriangleStrip(gl, program, rightLeg, metalGray);
    
    // Feet
    const leftFoot = [
        -0.2, -0.7,   // top left
        -0.2, -0.8,   // bottom left
        -0.05, -0.7,  // top right
        -0.05, -0.8,  // bottom right
    ];
    drawTriangleStrip(gl, program, leftFoot, darkGray);
    
    const rightFoot = [
        0.05, -0.7,   // top left
        0.05, -0.8,   // bottom left
        0.2, -0.7,    // top right
        0.2, -0.8,    // bottom right
    ];
    drawTriangleStrip(gl, program, rightFoot, darkGray);
}

window.addEventListener('load', mainBender);