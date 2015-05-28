var worldVertexPositionBuffer = null;
var worldVertexTextureCoordBuffer = null;
var worldIndexBuffer = null;

var VERTEX_COUNT = 256;
var SIZE = 800;

var count = VERTEX_COUNT * VERTEX_COUNT;
var vertices = new Array(count * 3);
var normals = new Array(count * 3);
var textureCoords = new Array(count*2);
var indices = new Array(6*(VERTEX_COUNT-1)*(VERTEX_COUNT-1));

var simplexTerrain = new SimplexNoise(12345);

function loadWorld() {

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

    worldVertexPositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, worldVertexPositionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    worldVertexPositionBuffer.itemSize = 3;
    worldVertexPositionBuffer.numItems = count;

    worldVertexTextureCoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, worldVertexTextureCoordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoords), gl.STATIC_DRAW);
    worldVertexTextureCoordBuffer.itemSize = 2;
    worldVertexTextureCoordBuffer.numItems = count;

    worldIndexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, worldIndexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);
    worldIndexBuffer.itemSize = 1;
    worldIndexBuffer.numItems = (VERTEX_COUNT-1)*(VERTEX_COUNT-1);

    document.getElementById("loadingtext").textContent = "";
}