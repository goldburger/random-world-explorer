
var gl;
var shaderProgram;

var mvMatrix = mat4.create();
var mvMatrixStack = [];
var pMatrix = mat4.create();

var lastTime = 0;
// Used to make us "jog" up and down as we move forward.
var joggingAngle = 0;

var pitch = 0;
var pitchRate = 0;

var yaw = -200;
var yawRate = 0;

var xPos = 0;
var yPos = 0.4;
var zPos = 0;

var speed = 0;

var currentlyPressedKeys = {};

// Called onload of html file
function webGLStart() {                                         // main game loop
    var canvas = document.getElementById("gl-canvas");
    initGL(canvas);
    initShaders();                                              // Bind attributes/uniforms

    initTexture();

    initTerrain();

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.enable(gl.DEPTH_TEST);

    document.onkeydown = handleKeyDown;
    document.onkeyup = handleKeyUp;

    tick(); // render with movement
}

function initGL(canvas) {
    try {
        gl = canvas.getContext("experimental-webgl");
        gl.viewportWidth = canvas.width;
        gl.viewportHeight = canvas.height;
    } catch (e) {
    }
    if (!gl) {
        alert("Could not initialise WebGL, sorry :-(");
    }
}
function getShader(gl, id) {
    var shaderScript = document.getElementById(id);
    if (!shaderScript) {
        return null;
    }

    var str = "";
    var k = shaderScript.firstChild;
    while (k) {
        if (k.nodeType == 3) {
            str += k.textContent;
        }
        k = k.nextSibling;
    }

    var shader;
    if (shaderScript.type == "x-shader/x-fragment") {
        shader = gl.createShader(gl.FRAGMENT_SHADER);
    } else if (shaderScript.type == "x-shader/x-vertex") {
        shader = gl.createShader(gl.VERTEX_SHADER);
    } else {
        return null;
    }

    gl.shaderSource(shader, str);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        alert(gl.getShaderInfoLog(shader));
        return null;
    }

    return shader;
}

function initShaders() {
    var fragmentShader = getShader(gl, "fragment-shader");
    var vertexShader = getShader(gl, "vertex-shader");

    shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        alert("Could not initialise shaders");
    }

    gl.useProgram(shaderProgram);

    // Get attribute and uniform locations
    shaderProgram.vertexPositionAttributeLoc = gl.getAttribLocation(shaderProgram, "aVertexPosition");
    gl.enableVertexAttribArray(shaderProgram.vertexPositionAttributeLoc);

    shaderProgram.textureCoordAttributeLoc = gl.getAttribLocation(shaderProgram, "aTextureCoord");
    gl.enableVertexAttribArray(shaderProgram.textureCoordAttributeLoc);

    shaderProgram.pMatrixUniformLoc = gl.getUniformLocation(shaderProgram, "uPMatrix");
    shaderProgram.mvMatrixUniformLoc = gl.getUniformLocation(shaderProgram, "uMVMatrix");
    shaderProgram.samplerUniformLoc = gl.getUniformLocation(shaderProgram, "uSampler");
}

function tick() {
    requestAnimFrame(tick);
    handleKeys();
    render();
    animate();
}

function handleKeyDown(event) {
    currentlyPressedKeys[event.keyCode] = true;
}
function handleKeyUp(event) {
    currentlyPressedKeys[event.keyCode] = false;
}
function handleKeys() {
    if (currentlyPressedKeys[33]) {
        // Page Up
        pitchRate = 0.1;
    } else if (currentlyPressedKeys[34]) {
        // Page Down
        pitchRate = -0.1;
    } else {
        pitchRate = 0;
    }

    if (currentlyPressedKeys[37] || currentlyPressedKeys[65]) {
        // Left cursor key or A
        yawRate = 0.1;
    } else if (currentlyPressedKeys[39] || currentlyPressedKeys[68]) {
        // Right cursor key or D
        yawRate = -0.1;
    } else {
        yawRate = 0;
    }

    if (currentlyPressedKeys[38] || currentlyPressedKeys[87]) {
        // Up cursor key or W
        speed = 0.003;
    } else if (currentlyPressedKeys[40] || currentlyPressedKeys[83]) {
        // Down cursor key
        speed = -0.003;
    } else {
        speed = 0;
    }

}

function animate() {
    var timeNow = new Date().getTime();
    if (lastTime != 0) {
        var elapsed = timeNow - lastTime;

        if (speed != 0) {
            xPos -= Math.sin(degToRad(yaw)) * speed * elapsed;
            zPos -= Math.cos(degToRad(yaw)) * speed * elapsed;

            joggingAngle += elapsed * 0.6; // 0.6 "fiddle factor" - makes it feel more realistic
            yPos = Math.sin(degToRad(joggingAngle)) / 20 + 0.4
        }

        yaw += yawRate * elapsed;
        pitch += pitchRate * elapsed;

    }
    lastTime = timeNow;
}

function render() {
    gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    if (terrainVertexTextureCoordBuffer == null || terrainVertexPositionBuffer == null) {
        return;
    }
    mat4.perspective(pMatrix, 70, gl.viewportWidth / gl.viewportHeight, 0.1, 100.0);

    // Render player/cannon



    mat4.identity(mvMatrix);
    mat4.translate(mvMatrix, mvMatrix, [0,-1,-1]);
    mat4.rotate(mvMatrix, mvMatrix, degToRad(-pitch), [1, 0, 0]);
    mat4.rotate(mvMatrix, mvMatrix, degToRad(-yaw), [0, 1, 0]);
    mat4.translate(mvMatrix, mvMatrix, [-xPos, -yPos, -zPos]);

    // Render terrain
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, mudTexture);
    gl.uniform1i(shaderProgram.samplerUniformLoc, 0);

    // Load attributes or uniform up to shader
    gl.bindBuffer(gl.ARRAY_BUFFER, terrainVertexTextureCoordBuffer);
    gl.vertexAttribPointer(shaderProgram.textureCoordAttributeLoc, terrainVertexTextureCoordBuffer.itemSize, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, terrainVertexPositionBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexPositionAttributeLoc, terrainVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);


    loadMatrixUniforms(pMatrix, mvMatrix);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, terrainIndexBuffer);
    gl.drawElements(gl.TRIANGLE_STRIP, terrainIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
}

// Helper functions

function mvPushMatrix() {
    var copy = mat4.create();
    mat4.set(mvMatrix, copy);
    mvMatrixStack.push(copy);
}
function mvPopMatrix() {
    if (mvMatrixStack.length == 0) {
        throw "Invalid popMatrix!";
    }
    mvMatrix = mvMatrixStack.pop();
}

function loadMatrixUniforms (pMatrix, mvMatrix) {
    gl.uniformMatrix4fv(shaderProgram.pMatrixUniformLoc, false, pMatrix);
    gl.uniformMatrix4fv(shaderProgram.mvMatrixUniformLoc, false, mvMatrix);
}

function createTransformationMatrix (translation, rotX, rotY, rotZ, scale) {
    var matrix = mat4.create();
    mat4.translate(matrix, matrix, translation);
    mat4.rotate(matrix, matrix, degToRad(rotX), [1,0,0]);
    mat4.rotate(matrix, matrix, degToRad(rotY), [0,1,0]);
    mat4.rotate(matrix, matrix, degToRad(rotZ), [0,0,1]);
    mat4.scale(matrix, matrix, scale);
    return matrix;
}

function degToRad(degrees) {
    return degrees * Math.PI / 180;
}
