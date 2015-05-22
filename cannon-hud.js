var iBufferHUD, vBufferHUD, tBufferHUD;
var iBufferCannonB, vBufferCannonB, tBufferCannonB;
var numIndicesCannonB;

function createTruncatedCone(bottomRadius, topRadius, height, radialSubdivisions, verticalSubdivisions,
	opt_topCap, opt_bottomCap, positions, normals, texCoords, indices)
{
	if (radialSubdivisions < 3)
		throw Error('radialSubdivisions must be 3 or greater');
	if (verticalSubdivisions < 1)
		throw Error('verticalSubdivisions must be 1 or greater');

	var topCap = (opt_topCap === undefined) ? true : opt_topCap;
	var bottomCap = (opt_bottomCap === undefined) ? true : opt_bottomCap;

	var extra = (topCap ? 2 : 0) + (bottomCap ? 2 : 0);

	var numVertices = (radialSubdivisions + 1) * (verticalSubdivisions + 1 + extra);
	numIndicesCannonB = 0;

	var vertsAroundEdge = radialSubdivisions + 1;

	var slant = Math.atan2(bottomRadius - topRadius, height);
	var cosSlant = Math.cos(slant);
	var sinSlant = Math.sin(slant);

	var start = topCap ? -2 : 0;
	var end = verticalSubdivisions + (bottomCap ? 2 : 0);

	for (var yy = start; yy <= end; ++yy)
	{
		var v = yy / verticalSubdivisions;
		var y = height * v;
		var ringRadius;
		if (yy < 0)
		{
			y = 0;
			v = 1;
			ringRadius = bottomRadius;
		}
		else if (yy > verticalSubdivisions)
		{
			y = height;
			v = 1;
			ringRadius = topRadius;
		}
		else
			ringRadius = bottomRadius + (topRadius - bottomRadius) * (yy / verticalSubdivisions);

		if (yy === -2 || yy === verticalSubdivisions + 2)
		{
			ringRadius = 0;
			v = 0;
		}
		
		y -= height / 2;
		
		for (var ii = 0; ii < vertsAroundEdge; ++ii)
		{
			var sin = Math.sin(ii * Math.PI * 2 / radialSubdivisions);
			var cos = Math.cos(ii * Math.PI * 2 / radialSubdivisions);
			positions.push(vec4(sin * ringRadius, y, cos * ringRadius, 1.0));
			normals.push(vec4(
				(yy < 0 || yy > verticalSubdivisions) ? 0 : (sin * cosSlant),
				(yy < 0) ? -1 : (yy > verticalSubdivisions ? 1 : sinSlant),
				(yy < 0 || yy > verticalSubdivisions) ? 0 : (cos * cosSlant), 0.0));
			// FIX: Currently for cannon bottom only
			texCoords.push(vec2((ii / radialSubdivisions), (1-v) * 397/512));
		}
	}

	for (var yy = 0; yy < verticalSubdivisions + extra; ++yy)
	{
		for (var ii = 0; ii < radialSubdivisions; ++ii)
		{
			indices.push(vertsAroundEdge * (yy + 0) + 0 + ii, vertsAroundEdge * (yy + 0) + 1 + ii, vertsAroundEdge * (yy + 1) + 1 + ii);
			indices.push(vertsAroundEdge * (yy + 0) + 0 + ii, vertsAroundEdge * (yy + 1) + 1 + ii, vertsAroundEdge * (yy + 1) + 0 + ii);
			numIndicesCannonB = numIndicesCannonB + 6;
		}
	}
}

function initCannon()
{
	var bottomVertices = [];
	var bottomNormals = [];
	var bottomTexCoords = [];
	var bottomIndices = [];

	createTruncatedCone(3, 2.25, 5, 15, 5, false, false, bottomVertices, bottomNormals, bottomTexCoords, bottomIndices);

	iBufferCannonB = gl.createBuffer();
    gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, iBufferCannonB);
    gl.bufferData( gl.ELEMENT_ARRAY_BUFFER, new Uint8Array(bottomIndices), gl.STATIC_DRAW );

    vBufferCannonB = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBufferCannonB );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(bottomVertices), gl.STATIC_DRAW );
	
    tBufferCannonB = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, tBufferCannonB );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(bottomTexCoords), gl.STATIC_DRAW );
}

function initHUD()
{
	var pointsArray = [
		vec4( -1, -23/9,  0, 1.0 ),
		vec4( -1,  1,  0, 1.0 ),
		vec4( 1,  1,  0, 1.0 ),
		vec4( 1, -23/9,  0, 1.0 )
	];
	
	var pointIndices = [
		0, 3, 2,
		0, 2, 1
	];

	var texCoord = [
		vec2(0, 0),
		vec2(0, 1),
		vec2(1, 1),
		vec2(1, 0)
	];

	iBufferHUD = gl.createBuffer();
    gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, iBufferHUD );
    gl.bufferData( gl.ELEMENT_ARRAY_BUFFER, new Uint8Array(pointIndices), gl.STATIC_DRAW );

    vBufferHUD = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBufferHUD );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW );
	
    tBufferHUD = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, tBufferHUD );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(texCoord), gl.STATIC_DRAW );
}

function drawCannon()
{
	gl.bindBuffer( gl.ARRAY_BUFFER, vBufferCannonB );
    gl.vertexAttribPointer( positionLoc, 4, gl.FLOAT, false, 0, 0 );

	gl.bindBuffer( gl.ARRAY_BUFFER, tBufferCannonB );
    gl.vertexAttribPointer( texCoordLoc, 2, gl.FLOAT, false, 0, 0 );

    gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, iBufferCannonB );	
	
	gl.uniformMatrix4fv(modelLoc, false, flatten(mat4()));
	gl.uniformMatrix4fv(cameraLoc, false, flatten(cameraTransform));
	projectionTransform = perspective( 45.0, canvas.width/canvas.height, near, far );
    gl.uniformMatrix4fv(projectionLoc, false, flatten(projectionTransform));
	
    configureTexture( document.getElementById("texImage2") );
	gl.uniform4fv(colorLoc, [ 1.0, 1.0, 1.0, 1.0 ]);
	gl.uniform1i(useTextureLoc, true);

	gl.enable( gl.BLEND );
	gl.blendFunc( gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA );
	gl.enable(gl.DEPTH_TEST);
	gl.drawElements( gl.TRIANGLES, numIndicesCannonB, gl.UNSIGNED_BYTE, 0 );
    gl.enable(gl.DEPTH_TEST);
	gl.disable( gl.BLEND );
}

function drawHUD()
{
	gl.bindBuffer( gl.ARRAY_BUFFER, vBufferHUD );
    gl.vertexAttribPointer( positionLoc, 4, gl.FLOAT, false, 0, 0 );

	gl.bindBuffer( gl.ARRAY_BUFFER, tBufferHUD );
    gl.vertexAttribPointer( texCoordLoc, 2, gl.FLOAT, false, 0, 0 );

    gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, iBufferHUD );	
	
	gl.uniformMatrix4fv(modelLoc, false, flatten(mat4()));
	gl.uniformMatrix4fv(cameraLoc, false, flatten(startingCamera));
	projectionTransform = ortho(-1, 1, -1, 1, near, far);
    gl.uniformMatrix4fv(projectionLoc, false, flatten(projectionTransform));
	
    configureTexture( document.getElementById("texImage") );
	gl.uniform4fv(colorLoc, [ 1.0, 1.0, 1.0, 1.0 ]);
	gl.uniform1i(useTextureLoc, true);

	gl.enable( gl.BLEND );
	gl.blendFunc( gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA );
	gl.enable(gl.DEPTH_TEST);
	gl.drawElements( gl.TRIANGLES, 6, gl.UNSIGNED_BYTE, 0 );
    gl.enable(gl.DEPTH_TEST);
	gl.disable( gl.BLEND );
}