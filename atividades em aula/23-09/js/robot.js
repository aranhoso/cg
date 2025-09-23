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

let animationTime = 0;

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

function animatedMainBender() {
    const canvas = document.getElementById('glCanvas1');
    const gl = canvas.getContext('webgl');
    
    if (!gl) {
        console.error('WebGL not supported');
        return;
    }
    
    const vertexShader = createShaderBender(gl, gl.VERTEX_SHADER, vertexShaderSourceBender);
    const fragmentShader = createShaderBender(gl, gl.FRAGMENT_SHADER, fragmentShaderSourceBender);
    const program = createProgramBender(gl, vertexShader, fragmentShader);
    
    function render() {
        animationTime += 0.02;
        
        gl.viewport(0, 0, canvas.width, canvas.height);
        gl.clearColor(0.1, 0.1, 0.2, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        
        gl.useProgram(program);

        const metalGray = [0.7, 0.7, 0.75];
        const darkGray = [0.4, 0.4, 0.45];
        const yellow = [1.0, 0.9, 0.2];
        const red = [0.9, 0.2, 0.2];
        const black = [0.1, 0.1, 0.1];
        
        // Head sway animation
        const sway = Math.sin(animationTime) * 0.1;
        
        const head = [
            -0.3 + sway, 0.2,   // bottom left
            -0.3 + sway, 0.7,   // top left
            0.3 + sway, 0.2,    // bottom right
            0.3 + sway, 0.7,    // top right
        ];
        drawTriangleStrip(gl, program, head, metalGray);
        
        const headTop = [
            0.0 + sway, 0.8,    // center top
            -0.3 + sway, 0.7,   // left
            -0.2 + sway, 0.7,  // left-mid
            0.2 + sway, 0.7,   // right-mid
            0.3 + sway, 0.7,    // right
        ];
        drawTriangleFan(gl, program, headTop, metalGray);
        
        // Body (static)
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
        
        // Blinking eyes - now square
        const blink = Math.abs(Math.sin(animationTime * 2)) > 0.9 ? 0.02 : 0;
        
        const leftEye = [
            -0.15 + sway, 0.45 + blink,   // bottom left
            -0.15 + sway, 0.6 - blink,    // top left
            -0.05 + sway, 0.45 + blink,   // bottom right
            -0.05 + sway, 0.6 - blink,    // top right
        ];
        drawTriangleStrip(gl, program, leftEye, yellow);
        
        const rightEye = [
            0.05 + sway, 0.45 + blink,    // bottom left
            0.05 + sway, 0.6 - blink,     // top left
            0.15 + sway, 0.45 + blink,    // bottom right
            0.15 + sway, 0.6 - blink,     // top right
        ];
        drawTriangleStrip(gl, program, rightEye, yellow);
        
        // Square pupils
        const leftPupil = [
            -0.13 + sway, 0.49,   // bottom left
            -0.13 + sway, 0.55,   // top left
            -0.07 + sway, 0.49,   // bottom right
            -0.07 + sway, 0.55,   // top right
        ];
        drawTriangleStrip(gl, program, leftPupil, black);
        
        const rightPupil = [
            0.07 + sway, 0.49,    // bottom left
            0.07 + sway, 0.55,    // top left
            0.13 + sway, 0.49,    // bottom right
            0.13 + sway, 0.55,    // top right
        ];
        drawTriangleStrip(gl, program, rightPupil, black);
        
        // Mouth (moves with head)
        const mouth = [
            -0.08 + sway, 0.3,   // top left
            -0.08 + sway, 0.25,  // bottom left
            0.08 + sway, 0.3,    // top right
            0.08 + sway, 0.25,   // bottom right
        ];
        drawTriangleStrip(gl, program, mouth, black);
        
        // Antenna (moves with head)
        const antenna = [
            -0.02 + sway, 0.8,   // bottom left
            -0.02 + sway, 0.95,  // top left
            0.02 + sway, 0.8,    // bottom right
            0.02 + sway, 0.95,   // top right
        ];
        drawTriangleStrip(gl, program, antenna, darkGray);
        
        const antennaTip = [
            0.0 + sway, 1.0,     // center
            -0.03 + sway, 0.95,  // left
            0.0 + sway, 0.98,    // top
            0.03 + sway, 0.95,   // right
            0.0 + sway, 0.92,    // bottom
            -0.03 + sway, 0.95,  // back to left
        ];
        drawTriangleFan(gl, program, antennaTip, red);
        
        // Arms (wave motion)
        const armWave = Math.sin(animationTime * 1.5) * 0.05;
        
        const leftArm = [
            -0.6, 0.1 + armWave,    // top left
            -0.6, -0.1 + armWave,   // bottom left
            -0.25, 0.1,   // top right
            -0.25, -0.1,  // bottom right
        ];
        drawTriangleStrip(gl, program, leftArm, metalGray);
        
        const rightArm = [
            0.25, 0.1,    // top left
            0.25, -0.1,   // bottom left
            0.6, 0.1 - armWave,     // top right
            0.6, -0.1 - armWave,    // bottom right
        ];
        drawTriangleStrip(gl, program, rightArm, metalGray);
        
        // Legs and feet (static)
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
        
        requestAnimationFrame(render);
    }
    
    render();
}

function mainBender() {
    animatedMainBender();
}

window.addEventListener('load', mainBender);