
var terrainVertexPositionBuffer = null;
var terrainVertexTextureCoordBuffer = null;
var terrainIndexBuffer = null;

var VERTEX_COUNT = 256;
var SIZE = 800;

var count = VERTEX_COUNT * VERTEX_COUNT;
var vertices = new Array(count * 3);
var normals = new Array(count * 3);
var textureCoords = new Array(count*2);
var indices = new Array(6*(VERTEX_COUNT-1)*(VERTEX_COUNT-1));

var simplexTerrain = new SimplexNoise(12345);

function loadTerrain() {

    var vertexPointer = 0;
    for(var i=0;i<VERTEX_COUNT;i++){
        for(var j=0;j<VERTEX_COUNT;j++){
            vertices[vertexPointer*3] = j/(VERTEX_COUNT - 1.0) * SIZE;
            vertices[vertexPointer*3+1] = simplexTerrain.noise(j,i);                    // y = height
            vertices[vertexPointer*3+2] = i/(VERTEX_COUNT - 1.0) * SIZE;

            // Calculate normal
            // vec3f normal = calculateNormal(j, i);

            normals[vertexPointer*3] = 0;       // normal.x
            normals[vertexPointer*3+1] = 1;     // normal.y
            normals[vertexPointer*3+2] = 0;     // normal.z
            textureCoords[vertexPointer*2] = j/(VERTEX_COUNT - 1.0);
            textureCoords[vertexPointer*2+1] = i/(VERTEX_COUNT - 1.0);
            vertexPointer++;
        }
    }
    var pointer = 0;
    for(var gz=0;gz<VERTEX_COUNT-1;gz++){
        for(var gx=0;gx<VERTEX_COUNT-1;gx++){
            var topLeft = (gz*VERTEX_COUNT)+gx;
            var topRight = topLeft + 1;
            var bottomLeft = ((gz+1)*VERTEX_COUNT)+gx;
            var bottomRight = bottomLeft + 1;
            indices[pointer++] = topLeft;
            indices[pointer++] = bottomLeft;
            indices[pointer++] = topRight;
            indices[pointer++] = topRight;
            indices[pointer++] = bottomLeft;
            indices[pointer++] = bottomRight;
        }
    }

    terrainVertexPositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, terrainVertexPositionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    terrainVertexPositionBuffer.itemSize = 3;
    terrainVertexPositionBuffer.numItems = count;

    terrainVertexTextureCoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, terrainVertexTextureCoordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoords), gl.STATIC_DRAW);
    terrainVertexTextureCoordBuffer.itemSize = 2;
    terrainVertexTextureCoordBuffer.numItems = count;

    terrainIndexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, terrainIndexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);
    terrainIndexBuffer.itemSize = 1;
    terrainIndexBuffer.numItems = (VERTEX_COUNT-1)*(VERTEX_COUNT-1);

    document.getElementById("loadingtext").textContent = "";
}


