// References:
//
// https://youtu.be/_Ix5oN8eC1E?list=PLRIWtICgwaX0u7Rf9zkZhLoLuZVfUksDP
// http://math.hws.edu/eck/cs424/notes2013/19_GLSL.html
//

var skyboxSize = 512.0;

var skyboxVertices = [
    -skyboxSize,  skyboxSize, -skyboxSize,
    -skyboxSize, -skyboxSize, -skyboxSize,
    skyboxSize, -skyboxSize, -skyboxSize,
    skyboxSize, -skyboxSize, -skyboxSize,
    skyboxSize,  skyboxSize, -skyboxSize,
    -skyboxSize,  skyboxSize, -skyboxSize,

    -skyboxSize, -skyboxSize,  skyboxSize,
    -skyboxSize, -skyboxSize, -skyboxSize,
    -skyboxSize,  skyboxSize, -skyboxSize,
    -skyboxSize,  skyboxSize, -skyboxSize,
    -skyboxSize,  skyboxSize,  skyboxSize,
    -skyboxSize, -skyboxSize,  skyboxSize,

    skyboxSize, -skyboxSize, -skyboxSize,
    skyboxSize, -skyboxSize,  skyboxSize,
    skyboxSize,  skyboxSize,  skyboxSize,
    skyboxSize,  skyboxSize,  skyboxSize,
    skyboxSize,  skyboxSize, -skyboxSize,
    skyboxSize, -skyboxSize, -skyboxSize,

    -skyboxSize, -skyboxSize,  skyboxSize,
    -skyboxSize,  skyboxSize,  skyboxSize,
    skyboxSize,  skyboxSize,  skyboxSize,
    skyboxSize,  skyboxSize,  skyboxSize,
    skyboxSize, -skyboxSize,  skyboxSize,
    -skyboxSize, -skyboxSize,  skyboxSize,

    -skyboxSize,  skyboxSize, -skyboxSize,
    skyboxSize,  skyboxSize, -skyboxSize,
    skyboxSize,  skyboxSize,  skyboxSize,
    skyboxSize,  skyboxSize,  skyboxSize,
    -skyboxSize,  skyboxSize,  skyboxSize,
    -skyboxSize,  skyboxSize, -skyboxSize,

    -skyboxSize, -skyboxSize, -skyboxSize,
    -skyboxSize, -skyboxSize,  skyboxSize,
    skyboxSize, -skyboxSize, -skyboxSize,
    skyboxSize, -skyboxSize, -skyboxSize,
    -skyboxSize, -skyboxSize,  skyboxSize,
    skyboxSize, -skyboxSize,  skyboxSize
];

var skyboxVertexPositionBuffer;

function initSkybox() {

    initTexture(document.getElementById("texImage5"), 4);
    initTexture(document.getElementById("texImage6"), 5);
    initTexture(document.getElementById("texImage7"), 6);
    initTexture(document.getElementById("texImage8"), 7);
    initTexture(document.getElementById("texImage9"), 8);
    initTexture(document.getElementById("texImage10"), 9);

    skyboxVertexPositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, skyboxVertexPositionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(skyboxVertices), gl.STATIC_DRAW);
    skyboxVertexPositionBuffer.itemSize = 3;
    skyboxVertexPositionBuffer.numItems = 36;
}

function drawSkybox()
{
	gl.useProgram(programSky);
	var skyPositionLoc = gl.getAttribLocation( programSky, "threePosition" );
    gl.enableVertexAttribArray( skyPositionLoc );
	
    gl.activeTexture(gl.TEXTURE4);
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, skyboxTexture);
    gl.uniform1i(gl.getUniformLocation(programSky, "skybox"), 4);	

    gl.bindBuffer(gl.ARRAY_BUFFER, skyboxVertexPositionBuffer);
    gl.vertexAttribPointer(skyPositionLoc, 3, gl.FLOAT, false, 0, 0);	

	gl.uniformMatrix4fv(gl.getUniformLocation( programSky, "modelTransform" ), false, flatten(mat4()));
    gl.uniformMatrix4fv(gl.getUniformLocation( programSky, "cameraTransform" ), false, flatten(cameraTransform));
    gl.uniformMatrix4fv(gl.getUniformLocation( programSky, "projectionTransform" ), false, flatten(perspective( 45.0, canvas.width/canvas.height, near, far )));
 
    gl.enable( gl.BLEND );
    gl.blendFunc( gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA );
    gl.enable(gl.DEPTH_TEST);
    gl.drawArrays(gl.TRIANGLES, 0, skyboxVertexPositionBuffer.numItems);
    gl.disable(gl.DEPTH_TEST);
    gl.disable( gl.BLEND );
 
	gl.useProgram(program);
}