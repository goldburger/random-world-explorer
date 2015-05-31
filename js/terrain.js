// Reference used to generate the terrain:
// https://www.youtube.com/watch?v=yNYwZMmgTJk&list=PLRIWtICgwaX0u7Rf9zkZhLoLuZVfUksDP&index=14

var terrainVertexPositionBuffer;
var terrainVertexTextureCoordBuffer;
var terrainIndexBuffer;

var VERTEX_COUNT = 256;
var SIZE = 4096;

var terrainCount = VERTEX_COUNT * VERTEX_COUNT;
var terrainVertices = new Array(terrainCount * 3);
var terrainNormals = new Array(terrainCount * 3);
var terrainTextureCoords = new Array(terrainCount*2);
var terrainIndices = new Array(6*(VERTEX_COUNT-1)*(VERTEX_COUNT-1));

var simplexTerrain = new SimplexNoise(12345);

function initTerrain() {
    initTexture(document.getElementById("texImage4"), 3);

    var height;

    // Generates the terrain vertices and texture coordinates so that
    // we can load the mesh in as triangle strips
    var vertexPointer = 0;
    for(var i=0; i<VERTEX_COUNT; i++){
        for(var j=0; j<VERTEX_COUNT; j++){
			terrainVertices[vertexPointer*3] = j/(VERTEX_COUNT - 1.0) * SIZE;
            height = simplexTerrain.noise(j,i);
            terrainVertices[vertexPointer*3+1] = height * 5.0;	// y = height
            terrainVertices[vertexPointer*3+2] = i/(VERTEX_COUNT - 1.0) * SIZE;

            terrainNormals[vertexPointer*3] = 0;       // normal.x
            terrainNormals[vertexPointer*3+1] = 1;     // normal.y
            terrainNormals[vertexPointer*3+2] = 0;     // normal.z
			
            terrainTextureCoords[vertexPointer*2] = j/(VERTEX_COUNT - 1.0);
            terrainTextureCoords[vertexPointer*2+1] = i/(VERTEX_COUNT - 1.0);
            vertexPointer++;
        }
    }

    // Indices for the terrain vertices => triangle strips
    var pointer = 0;
    for(var gz=0; gz<VERTEX_COUNT-1; gz++){
        for(var gx=0; gx<VERTEX_COUNT-1; gx++){
            var topLeft = (gz*VERTEX_COUNT)+gx;
            var topRight = topLeft + 1;
            var bottomLeft = ((gz+1)*VERTEX_COUNT)+gx;
            var bottomRight = bottomLeft + 1;
            terrainIndices[pointer++] = topLeft;
            terrainIndices[pointer++] = bottomLeft;
            terrainIndices[pointer++] = topRight;
            terrainIndices[pointer++] = topRight;
            terrainIndices[pointer++] = bottomLeft;
            terrainIndices[pointer++] = bottomRight;
		}
    }
	
    terrainVertexPositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, terrainVertexPositionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(terrainVertices), gl.STATIC_DRAW);
    terrainVertexPositionBuffer.itemSize = 3;
    terrainVertexPositionBuffer.numItems = terrainCount;

    terrainVertexTextureCoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, terrainVertexTextureCoordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(terrainTextureCoords), gl.STATIC_DRAW);
    terrainVertexTextureCoordBuffer.itemSize = 2;
    terrainVertexTextureCoordBuffer.numItems = terrainCount;

    terrainIndexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, terrainIndexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(terrainIndices), gl.STATIC_DRAW);
    terrainIndexBuffer.itemSize = 1;
    terrainIndexBuffer.numItems = (VERTEX_COUNT-1)*(VERTEX_COUNT-1);

    //document.getElementById("loadingtext").textContent = "";
}

function drawTerrain()
{
    gl.disableVertexAttribArray( positionLoc );
    gl.enableVertexAttribArray( threePositionLoc );

    gl.uniform1i(gl.getUniformLocation(program, "texture"), 3);

    gl.bindBuffer(gl.ARRAY_BUFFER, terrainVertexPositionBuffer);
    gl.vertexAttribPointer(threePositionLoc, 3, gl.FLOAT, false, 0, 0);

	gl.bindBuffer(gl.ARRAY_BUFFER, terrainVertexTextureCoordBuffer);
    gl.vertexAttribPointer(texCoordLoc, 2, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, terrainIndexBuffer);

	gl.uniformMatrix4fv(modelLoc, false, flatten(mat4()));
	gl.uniformMatrix4fv(cameraLoc, false, flatten(cameraTransform));
    gl.uniformMatrix4fv(projectionLoc, false, flatten(perspective( 45.0, canvas.width/canvas.height, near, far )));

	gl.uniform4fv(colorLoc, [ 1.0, 1.0, 1.0, 1.0 ]);
	gl.uniform1i(useTextureLoc, true);
	gl.uniform1i(useLightingLoc, false);
	gl.uniform1i(useThreePositionLoc, true);
    gl.uniform1f(useSkyboxLoc, false);

	gl.enable( gl.BLEND );
	gl.blendFunc( gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA );
	gl.enable(gl.DEPTH_TEST);
    gl.drawElements(gl.TRIANGLE_STRIP, terrainIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);	
    gl.enable(gl.DEPTH_TEST);
	gl.disable( gl.BLEND );

    gl.disableVertexAttribArray( threePositionLoc );
    gl.enableVertexAttribArray( positionLoc );
}