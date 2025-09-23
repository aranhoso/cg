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

let carAnimationTime = 0;

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

function animatedMainCar() {
    const canvas = document.getElementById('glCanvas3');
    const gl = canvas.getContext('webgl');
    
    if (!gl) {
        console.error('WebGL not supported');
        return;
    }
    
    const vertexShader = createShaderCar(gl, gl.VERTEX_SHADER, vertexShaderSourceCar);
    const fragmentShader = createShaderCar(gl, gl.FRAGMENT_SHADER, fragmentShaderSourceCar);
    const program = createProgramCar(gl, vertexShader, fragmentShader);
    
    function render() {
        carAnimationTime += 0.02;
        
        gl.viewport(0, 0, canvas.width, canvas.height);
        gl.clearColor(0.5, 0.8, 1.0, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        
        gl.useProgram(program);
        
        const carRed = [0.8, 0.2, 0.2];
        const black = [0.1, 0.1, 0.1];
        const darkGray = [0.3, 0.3, 0.3];
        const lightBlue = [0.7, 0.9, 1.0];
        const yellow = [1.0, 1.0, 0.3];
        const white = [0.95, 0.95, 0.95];
        const silver = [0.7, 0.7, 0.7];
        
        // Car movement
        const carMove = Math.sin(carAnimationTime * 0.5) * 0.1;
        const carBounce = Math.abs(Math.sin(carAnimationTime * 2)) * 0.02;
        
        // Car main body
        const carBody = [
            -0.6 + carMove, -0.1 + carBounce,   // front bottom
            -0.6 + carMove, 0.1 + carBounce,    // front top
            0.6 + carMove, -0.1 + carBounce,    // rear bottom
            0.6 + carMove, 0.1 + carBounce,     // rear top
        ];
        drawTriangleStrip(gl, program, carBody, carRed);
        
        // Car roof
        const carRoof = [
            -0.3 + carMove, 0.1 + carBounce,    // front bottom
            -0.2 + carMove, 0.35 + carBounce,   // front top
            0.2 + carMove, 0.1 + carBounce,     // rear bottom
            0.1 + carMove, 0.35 + carBounce,    // rear top
        ];
        drawTriangleStrip(gl, program, carRoof, carRed);
        
        // Windows
        const windshield = [
            -0.25 + carMove, 0.12 + carBounce,
            -0.18 + carMove, 0.32 + carBounce,
            -0.05 + carMove, 0.12 + carBounce,
            -0.05 + carMove, 0.32 + carBounce,
        ];
        drawTriangleStrip(gl, program, windshield, lightBlue);
        
        const rearWindow = [
            0.05 + carMove, 0.12 + carBounce,
            0.05 + carMove, 0.32 + carBounce,
            0.18 + carMove, 0.12 + carBounce,
            0.08 + carMove, 0.32 + carBounce,
        ];
        drawTriangleStrip(gl, program, rearWindow, lightBlue);
        
        // Bumpers
        const frontBumper = [
            -0.65 + carMove, -0.15 + carBounce,
            -0.65 + carMove, -0.05 + carBounce,
            -0.6 + carMove, -0.15 + carBounce,
            -0.6 + carMove, -0.05 + carBounce,
        ];
        drawTriangleStrip(gl, program, frontBumper, darkGray);
        
        const rearBumper = [
            0.6 + carMove, -0.15 + carBounce,
            0.6 + carMove, -0.05 + carBounce,
            0.65 + carMove, -0.15 + carBounce,
            0.65 + carMove, -0.05 + carBounce,
        ];
        drawTriangleStrip(gl, program, rearBumper, darkGray);
        
        // Grille and lights
        const grille = [
            -0.62 + carMove, -0.02 + carBounce,
            -0.62 + carMove, 0.08 + carBounce,
            -0.6 + carMove, -0.02 + carBounce,
            -0.6 + carMove, 0.08 + carBounce,
        ];
        drawTriangleStrip(gl, program, grille, black);
        
        // Headlights with blinking
        const lightIntensity = Math.abs(Math.sin(carAnimationTime * 3)) > 0.7 ? 1.2 : 1.0;
        const headlightColor = [yellow[0] * lightIntensity, yellow[1] * lightIntensity, yellow[2] * lightIntensity];
        
        const leftHeadlight = createCircle(-0.55 + carMove, 0.03 + carBounce, 0.06);
        drawTriangleFan(gl, program, leftHeadlight, headlightColor);
        
        const rightHeadlight = createCircle(-0.55 + carMove, -0.03 + carBounce, 0.06);
        drawTriangleFan(gl, program, rightHeadlight, headlightColor);
        
        const leftHeadlightInner = createCircle(-0.55 + carMove, 0.03 + carBounce, 0.03);
        drawTriangleFan(gl, program, leftHeadlightInner, white);
        
        const rightHeadlightInner = createCircle(-0.55 + carMove, -0.03 + carBounce, 0.03);
        drawTriangleFan(gl, program, rightHeadlightInner, white);
        
        // Rear lights
        const leftRearLight = createCircle(0.58 + carMove, 0.03 + carBounce, 0.04);
        drawTriangleFan(gl, program, leftRearLight, carRed);
        
        const rightRearLight = createCircle(0.58 + carMove, -0.03 + carBounce, 0.04);
        drawTriangleFan(gl, program, rightRearLight, carRed);
        
        // Rotating wheels
        const wheelRotation = carAnimationTime * 2;
        
        // Left front wheel
        const leftFrontTire = createCircle(-0.35 + carMove, -0.15 + carBounce, 0.12);
        drawTriangleFan(gl, program, leftFrontTire, black);
        
        const leftFrontRim = createCircle(-0.35 + carMove, -0.15 + carBounce, 0.08);
        drawTriangleFan(gl, program, leftFrontRim, silver);
        
        // Wheel spokes (rotating)
        const spokeLength = 0.06;
        for (let i = 0; i < 4; i++) {
            const angle = wheelRotation + (i * Math.PI / 2);
            const spokeX1 = (-0.35 + carMove) + Math.cos(angle) * 0.02;
            const spokeY1 = (-0.15 + carBounce) + Math.sin(angle) * 0.02;
            const spokeX2 = (-0.35 + carMove) + Math.cos(angle) * spokeLength;
            const spokeY2 = (-0.15 + carBounce) + Math.sin(angle) * spokeLength;
            
            const spoke = [
                spokeX1 - 0.01, spokeY1,
                spokeX1 + 0.01, spokeY1,
                spokeX2 - 0.01, spokeY2,
                spokeX2 + 0.01, spokeY2,
            ];
            drawTriangleStrip(gl, program, spoke, darkGray);
        }
        
        const leftFrontCenter = createCircle(-0.35 + carMove, -0.15 + carBounce, 0.03);
        drawTriangleFan(gl, program, leftFrontCenter, darkGray);
        
        // Right front wheel
        const rightFrontTire = createCircle(0.35 + carMove, -0.15 + carBounce, 0.12);
        drawTriangleFan(gl, program, rightFrontTire, black);
        
        const rightFrontRim = createCircle(0.35 + carMove, -0.15 + carBounce, 0.08);
        drawTriangleFan(gl, program, rightFrontRim, silver);
        
        // Right wheel spokes
        for (let i = 0; i < 4; i++) {
            const angle = wheelRotation + (i * Math.PI / 2);
            const spokeX1 = (0.35 + carMove) + Math.cos(angle) * 0.02;
            const spokeY1 = (-0.15 + carBounce) + Math.sin(angle) * 0.02;
            const spokeX2 = (0.35 + carMove) + Math.cos(angle) * spokeLength;
            const spokeY2 = (-0.15 + carBounce) + Math.sin(angle) * spokeLength;
            
            const spoke = [
                spokeX1 - 0.01, spokeY1,
                spokeX1 + 0.01, spokeY1,
                spokeX2 - 0.01, spokeY2,
                spokeX2 + 0.01, spokeY2,
            ];
            drawTriangleStrip(gl, program, spoke, darkGray);
        }
        
        const rightFrontCenter = createCircle(0.35 + carMove, -0.15 + carBounce, 0.03);
        drawTriangleFan(gl, program, rightFrontCenter, darkGray);
        
        // Door handles
        const leftDoorHandle = [
            -0.4 + carMove, 0.05 + carBounce,
            -0.4 + carMove, 0.08 + carBounce,
            -0.35 + carMove, 0.05 + carBounce,
            -0.35 + carMove, 0.08 + carBounce,
        ];
        drawTriangleStrip(gl, program, leftDoorHandle, silver);
        
        const rightDoorHandle = [
            0.35 + carMove, 0.05 + carBounce,
            0.35 + carMove, 0.08 + carBounce,
            0.4 + carMove, 0.05 + carBounce,
            0.4 + carMove, 0.08 + carBounce,
        ];
        drawTriangleStrip(gl, program, rightDoorHandle, silver);
        
        requestAnimationFrame(render);
    }
    
    render();
}

function mainCar() {
    animatedMainCar();
}

window.addEventListener('load', mainCar);