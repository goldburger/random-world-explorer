// Helpful tutorials about skyboxes:
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
    // Retrieve the textures for the skybox sides
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

// Used to flip the environments
var img1load, img2load, img3load, img4load, img5load, img6load, img7load;

function changeSkybox(ind) {
    var first = "img/" + ind + "/";

    var img1 = document.getElementById('texImage4');
    img1.src=first+'bottom.jpg';
    img1.onload = function() {
        img1load = true;
        onChangeLoad();
    }

    var img2 = document.getElementById('texImage5')
    img2.src=first+'right.jpg';
    img2.onload = function() {
        img2load = true;
        onChangeLoad();
    }

    var img3 = document.getElementById('texImage6')
    img3.src=first+'left.jpg';
    img3.onload = function() {
        img3load = true;
        onChangeLoad();
    }

    var img4 = document.getElementById('texImage7')
    img4.src=first+'bottom.jpg';
    img4.onload = function() {
        img4load = true;
        onChangeLoad();
    }

    var img5 = document.getElementById('texImage8')
    img5.src=first+'top.jpg';
    img5.onload = function() {
        img5load = true;
        onChangeLoad();
    }

    var img6 = document.getElementById('texImage9')
    img6.src=first+'back.jpg';
    img6.onload = function() {
        img6load = true;
        onChangeLoad();
    }

    var img7 = document.getElementById('texImage10')
    img7.src=first+'front.jpg';
    img7.onload = function() {
        img7load = true;
        onChangeLoad();
    }
}

function onChangeLoad() {
    if (img1load && img2load && img3load && img4load 
        && img5load && img6load && img7load) {
        initSkybox();
        initTerrain();
        drawTerrain();
        drawSkybox();
    }
}