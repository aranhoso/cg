const vertexShaderSourceCar = `
    attribute vec4 a_position;
    void main() {
        gl_Position = a_position;
    }
`;

const fragmentShaderSourceCar = `
    precision mediump float;
    uniform vec3 u_color;
    void main() {
        gl_FragColor = vec4(u_color, 1.0);
    }
`;

function createShaderCar(gl, type, source) {
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

function createProgramCar(gl, vertexShader, fragmentShader) {
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

function createCircle(centerX, centerY, radius, segments = 16) {
    const vertices = [centerX, centerY];
    
    for (let i = 0; i <= segments; i++) {
        const angle = (i * 2 * Math.PI) / segments;
        const x = centerX + Math.cos(angle) * radius;
        const y = centerY + Math.sin(angle) * radius;
        vertices.push(x, y);
    }
    
    return vertices;
}

function mainCar() {
    const canvas = document.getElementById('glCanvas3');
    const gl = canvas.getContext('webgl');
    
    if (!gl) {
        console.error('WebGL not supported');
        return;
    }
    
    const vertexShader = createShaderCar(gl, gl.VERTEX_SHADER, vertexShaderSourceCar);
    const fragmentShader = createShaderCar(gl, gl.FRAGMENT_SHADER, fragmentShaderSourceCar);
    const program = createProgramCar(gl, vertexShader, fragmentShader);
    
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.5, 0.8, 1.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    
    gl.useProgram(program);
    
    // Car colors
    const carRed = [0.8, 0.2, 0.2];
    const black = [0.1, 0.1, 0.1];
    const darkGray = [0.3, 0.3, 0.3];
    const lightBlue = [0.7, 0.9, 1.0];
    const yellow = [1.0, 1.0, 0.3];
    const white = [0.95, 0.95, 0.95];
    const silver = [0.7, 0.7, 0.7];
    
    // Car main body
    const carBody = [
        -0.6, -0.1,   // front bottom
        -0.6, 0.1,    // front top
        0.6, -0.1,    // rear bottom
        0.6, 0.1,     // rear top
    ];
    drawTriangleStrip(gl, program, carBody, carRed);
    
    // Car roof/cabin
    const carRoof = [
        -0.3, 0.1,    // front bottom
        -0.2, 0.35,   // front top (windshield)
        0.2, 0.1,     // rear bottom
        0.1, 0.35,    // rear top (rear window)
    ];
    drawTriangleStrip(gl, program, carRoof, carRed);
    
    // Windshield
    const windshield = [
        -0.25, 0.12,  // bottom left
        -0.18, 0.32,  // top left
        -0.05, 0.12,  // bottom right
        -0.05, 0.32,  // top right
    ];
    drawTriangleStrip(gl, program, windshield, lightBlue);
    
    // Rear window
    const rearWindow = [
        0.05, 0.12,   // bottom left
        0.05, 0.32,   // top left
        0.18, 0.12,   // bottom right
        0.08, 0.32,   // top right
    ];
    drawTriangleStrip(gl, program, rearWindow, lightBlue);
    
    // Front bumper
    const frontBumper = [
        -0.65, -0.15, // left
        -0.65, -0.05, // left top
        -0.6, -0.15,  // right
        -0.6, -0.05,  // right top
    ];
    drawTriangleStrip(gl, program, frontBumper, darkGray);
    
    // Rear bumper
    const rearBumper = [
        0.6, -0.15,   // left
        0.6, -0.05,   // left top
        0.65, -0.15,  // right
        0.65, -0.05,  // right top
    ];
    drawTriangleStrip(gl, program, rearBumper, darkGray);
    
    // Front grille
    const grille = [
        -0.62, -0.02, // left
        -0.62, 0.08,  // left top
        -0.6, -0.02,  // right
        -0.6, 0.08,   // right top
    ];
    drawTriangleStrip(gl, program, grille, black);
    
    // Left headlight
    const leftHeadlight = createCircle(-0.55, 0.03, 0.06);
    drawTriangleFan(gl, program, leftHeadlight, yellow);
    
    // Right headlight  
    const rightHeadlight = createCircle(-0.55, -0.03, 0.06);
    drawTriangleFan(gl, program, rightHeadlight, yellow);
    
    // Left headlight inner
    const leftHeadlightInner = createCircle(-0.55, 0.03, 0.03);
    drawTriangleFan(gl, program, leftHeadlightInner, white);
    
    // Right headlight inner
    const rightHeadlightInner = createCircle(-0.55, -0.03, 0.03);
    drawTriangleFan(gl, program, rightHeadlightInner, white);
    
    // Left rear light
    const leftRearLight = createCircle(0.58, 0.03, 0.04);
    drawTriangleFan(gl, program, leftRearLight, carRed);
    
    // Right rear light
    const rightRearLight = createCircle(0.58, -0.03, 0.04);
    drawTriangleFan(gl, program, rightRearLight, carRed);
    
    // Wheels - Left front wheel (tire)
    const leftFrontTire = createCircle(-0.35, -0.15, 0.12);
    drawTriangleFan(gl, program, leftFrontTire, black);
    
    // Left front wheel (rim)
    const leftFrontRim = createCircle(-0.35, -0.15, 0.08);
    drawTriangleFan(gl, program, leftFrontRim, silver);
    
    // Left front wheel center
    const leftFrontCenter = createCircle(-0.35, -0.15, 0.03);
    drawTriangleFan(gl, program, leftFrontCenter, darkGray);
    
    // Right front wheel (tire)
    const rightFrontTire = createCircle(0.35, -0.15, 0.12);
    drawTriangleFan(gl, program, rightFrontTire, black);
    
    // Right front wheel (rim)
    const rightFrontRim = createCircle(0.35, -0.15, 0.08);
    drawTriangleFan(gl, program, rightFrontRim, silver);
    
    // Right front wheel center
    const rightFrontCenter = createCircle(0.35, -0.15, 0.03);
    drawTriangleFan(gl, program, rightFrontCenter, darkGray);
    
    // Door handles
    const leftDoorHandle = [
        -0.4, 0.05,   // left
        -0.4, 0.08,   // left top
        -0.35, 0.05,  // right
        -0.35, 0.08,  // right top
    ];
    drawTriangleStrip(gl, program, leftDoorHandle, silver);
    
    const rightDoorHandle = [
        0.35, 0.05,   // left
        0.35, 0.08,   // left top
        0.4, 0.05,    // right
        0.4, 0.08,    // right top
    ];
    drawTriangleStrip(gl, program, rightDoorHandle, silver);
    
}

window.addEventListener('load', mainCar);