const vertexShaderSourceFlower = `
    attribute vec4 a_position;
    void main() {
        gl_Position = a_position;
    }
`;

const fragmentShaderSourceFlower = `
    precision mediump float;
    uniform vec3 u_color;
    void main() {
        gl_FragColor = vec4(u_color, 1.0);
    }
`;

function createShaderFlower(gl, type, source) {
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

function createProgramFlower(gl, vertexShader, fragmentShader) {
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

function createCircle(centerX, centerY, radius, segments = 32) {
    const vertices = [centerX, centerY];
    
    for (let i = 0; i <= segments; i++) {
        const angle = (i * 2 * Math.PI) / segments;
        const x = centerX + Math.cos(angle) * radius;
        const y = centerY + Math.sin(angle) * radius;
        vertices.push(x, y);
    }
    
    return vertices;
}

let flowerAnimationTime = 0;

function createScallopedCircle(centerX, centerY, radius, scallops = 8, scallopDepth = 0.3) {
    const vertices = [centerX, centerY];
    const segments = scallops * 4;
    
    for (let i = 0; i <= segments; i++) {
        const angle = (i * 2 * Math.PI) / segments;

        const scallopAngle = (i * 2 * Math.PI * scallops) / segments;
        const scallopRadius = radius * (1 - scallopDepth * 0.5 * (1 + Math.cos(scallopAngle)));
        
        const x = centerX + Math.cos(angle) * scallopRadius;
        const y = centerY + Math.sin(angle) * scallopRadius;
        vertices.push(x, y);
    }
    
    return vertices;
}

function animatedMainFlower() {
    const canvas = document.getElementById('glCanvas2');
    const gl = canvas.getContext('webgl');
    
    if (!gl) {
        console.error('WebGL not supported');
        return;
    }
    
    const vertexShader = createShaderFlower(gl, gl.VERTEX_SHADER, vertexShaderSourceFlower);
    const fragmentShader = createShaderFlower(gl, gl.FRAGMENT_SHADER, fragmentShaderSourceFlower);
    const program = createProgramFlower(gl, vertexShader, fragmentShader);
    
    function render() {
        flowerAnimationTime += 0.01;
        
        gl.viewport(0, 0, canvas.width, canvas.height);
        gl.clearColor(0.6, 0.9, 0.6, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        
        gl.useProgram(program);

        const petalPink = [1.0, 0.4, 0.7];
        const petalLightPink = [1.0, 0.7, 0.9];
        const petalDeepPink = [0.9, 0.2, 0.6];
        const centerYellow = [1.0, 0.9, 0.2];
        const centerOrange = [1.0, 0.6, 0.1];
        const stemGreen = [0.2, 0.7, 0.2];
        
        // Gentle sway animation
        const sway = Math.sin(flowerAnimationTime) * 0.08;
        const flowerY = 0.3 + Math.sin(flowerAnimationTime * 0.5) * 0.02;
        
        // Swaying stem
        const stem = [
            -0.02 + sway * 0.3, -0.3,  // bottom left
            -0.02 + sway, flowerY - 0.1,   // top left (connects to flower)
            0.02 + sway * 0.3, -0.3,   // bottom right
            0.02 + sway, flowerY - 0.1,    // top right
        ];
        drawTriangleStrip(gl, program, stem, stemGreen);
        
        // Ground (static)
        const ground = [
            -1.0, -0.4,   // far left
            -1.0, -0.3,   // far left top
            1.0, -0.4,    // far right
            1.0, -0.3,    // far right top
        ];
        drawTriangleStrip(gl, program, ground, [0.3, 0.8, 0.3]);
        
        // Animated flower head with gentle motion
        const centerX = sway;
        
        // Petal layers with size variation
        const petalPulse = 1.0 + Math.sin(flowerAnimationTime * 2) * 0.05;
        
        const outerPetalCrown = createScallopedCircle(centerX, flowerY, 0.35 * petalPulse, 12, 0.4);
        drawTriangleFan(gl, program, outerPetalCrown, petalDeepPink);
        
        const middlePetalCrown = createScallopedCircle(centerX, flowerY, 0.28 * petalPulse, 10, 0.3);
        drawTriangleFan(gl, program, middlePetalCrown, petalPink);
        
        const innerPetalCrown = createCircle(centerX, flowerY, 0.18 * petalPulse);
        drawTriangleFan(gl, program, innerPetalCrown, petalLightPink);
        
        // Center with gentle pulsing
        const centerPulse = 1.0 + Math.sin(flowerAnimationTime * 3) * 0.1;
        
        const centerOuter = createCircle(centerX, flowerY, 0.08 * centerPulse);
        drawTriangleFan(gl, program, centerOuter, centerOrange);
        
        const centerInner = createCircle(centerX, flowerY, 0.04 * centerPulse);
        drawTriangleFan(gl, program, centerInner, centerYellow);
        
        const centerHighlight = createCircle(centerX - 0.015, flowerY + 0.01, 0.015);
        drawTriangleFan(gl, program, centerHighlight, [1.0, 1.0, 0.8]);
        
        requestAnimationFrame(render);
    }
    
    render();
}

function mainFlower() {
    animatedMainFlower();
}

window.addEventListener('load', mainFlower);