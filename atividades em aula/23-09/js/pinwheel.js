const vertexShaderSourcePinwheel = `
    attribute vec4 a_position;
    void main() {
        gl_Position = a_position;
    }
`;

const fragmentShaderSourcePinwheel = `
    precision mediump float;
    uniform vec3 u_color;
    void main() {
        gl_FragColor = vec4(u_color, 1.0);
    }
`;

function createShaderPinwheel(gl, type, source) {
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

function createProgramPinwheel(gl, vertexShader, fragmentShader) {
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

let pinwheelAnimationTime = 0;

function createCurvedPinwheelBlade(centerX, centerY, angle, length, width) {
    const vertices = [centerX, centerY]; // centro pra animar dps
    
    const segments = 8;
    for (let i = 0; i <= segments; i++) {
        const t = i / segments;

        const currentAngle = angle + (t - 0.5) * width * 2;
        const currentLength = length * (0.2 + 0.8 * t);
        
        // curvinha
        const curveOffset = Math.sin(t * Math.PI) * width * 0.5;
        
        const x = centerX + Math.cos(currentAngle + curveOffset) * currentLength;
        const y = centerY + Math.sin(currentAngle + curveOffset) * currentLength;
        vertices.push(x, y);
    }
    
    return vertices;
}

function animatedMainPinwheel() {
    const canvas = document.getElementById('glCanvas4');
    const gl = canvas.getContext('webgl');
    
    if (!gl) {
        console.error('WebGL not supported');
        return;
    }
    
    const vertexShader = createShaderPinwheel(gl, gl.VERTEX_SHADER, vertexShaderSourcePinwheel);
    const fragmentShader = createShaderPinwheel(gl, gl.FRAGMENT_SHADER, fragmentShaderSourcePinwheel);
    const program = createProgramPinwheel(gl, vertexShader, fragmentShader);
    
    function render() {
        pinwheelAnimationTime += 0.03;
        
        gl.viewport(0, 0, canvas.width, canvas.height);
        gl.clearColor(0.5, 0.8, 1.0, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        
        gl.useProgram(program);
        
        const red = [0.9, 0.2, 0.2];
        const blue = [0.2, 0.4, 0.9];
        const yellow = [1.0, 0.9, 0.2];
        const green = [0.2, 0.8, 0.3];
        const purple = [0.7, 0.2, 0.8];
        const orange = [1.0, 0.6, 0.1];
        const pink = [1.0, 0.4, 0.7];
        const cyan = [0.2, 0.8, 0.9];
        
        const centerGray = [0.4, 0.4, 0.4];
        const stickBrown = [0.6, 0.4, 0.2];
        const darkBrown = [0.4, 0.2, 0.1];

        const centerX = 0.0;
        const centerY = 0.2;

        const numBlades = 8;
        const bladeLength = 0.3;
        const bladeWidth = 0.3;
        const colors = [red, blue, yellow, green, purple, orange, pink, cyan];

        // Stick with sway
        const stickSway = Math.sin(pinwheelAnimationTime * 0.5) * 0.02;
        
        const stick = [
            -0.01 + stickSway * 0.3, 0.2, // top left
            -0.01 + stickSway, -0.6, // bottom left
            0.01 + stickSway * 0.3, 0.2, // top right
            0.01 + stickSway, -0.6, // bottom right
        ];
        drawTriangleStrip(gl, program, stick, stickBrown);

        // Rotating blades
        const rotation = pinwheelAnimationTime;
        
        for (let i = 0; i < numBlades; i++) {
            const angle = rotation + (i * 2 * Math.PI) / numBlades;
            const blade = createCurvedPinwheelBlade(centerX, centerY, angle, bladeLength, bladeWidth);
            drawTriangleFan(gl, program, blade, colors[i]);
        }
        
        // Center components
        const centerOuter = createCircle(centerX, centerY, 0.06);
        drawTriangleFan(gl, program, centerOuter, centerGray);
        
        const centerInner = createCircle(centerX, centerY, 0.03);
        drawTriangleFan(gl, program, centerInner, [0.6, 0.6, 0.6]);
        
        const centerPin = createCircle(centerX, centerY, 0.01);
        drawTriangleFan(gl, program, centerPin, [0.2, 0.2, 0.2]);
        
        
        
        // Ground
        const ground = [
            -1.0, -0.7,
            -1.0, -0.6,
            1.0, -0.7,
            1.0, -0.6,
        ];
        drawTriangleStrip(gl, program, ground, [0.3, 0.7, 0.2]);
        
        requestAnimationFrame(render);
    }
    
    render();
}

function mainPinwheel() {
    animatedMainPinwheel();
}

window.addEventListener('load', mainPinwheel);