var iBufferHUD, vBufferHUD, tBufferHUD;

var cannonDefault;
var cannonAzimuth, cannonAltitude;

var bottomCone, middleCone, ringCone, topCone;
var cannonTransform = mat4();

function cone(partID)
{
	this.indices = [];
	this.vertices = [];
	this.textureCoords = [];
	this.normals = [];
	this.numIndices = 0;
	this.partID = partID;
	this.indexBuffer;
	this.vertexBuffer;
	this.textureBuffer;
}

cone.prototype.createTruncatedCone = function (bottomRadius, topRadius, height,
		radialSubdivisions, verticalSubdivisions, opt_topCap, opt_bottomCap)
{
	if (radialSubdivisions < 3)
		throw Error('radialSubdivisions must be 3 or greater');
	if (verticalSubdivisions < 1)
		throw Error('verticalSubdivisions must be 1 or greater');

	var topCap = (opt_topCap === undefined) ? true : opt_topCap;
	var bottomCap = (opt_bottomCap === undefined) ? true : opt_bottomCap;

	var extra = (topCap ? 2 : 0) + (bottomCap ? 2 : 0);

	var numVertices = (radialSubdivisions + 1) * (verticalSubdivisions + 1 + extra);
	
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
			this.vertices.push(vec4(sin * ringRadius, y, cos * ringRadius, 1.0));
			this.normals.push(vec4(
				(yy < 0 || yy > verticalSubdivisions) ? 0 : (sin * cosSlant),
				(yy < 0) ? -1 : (yy > verticalSubdivisions ? 1 : sinSlant),
				(yy < 0 || yy > verticalSubdivisions) ? 0 : (cos * cosSlant), 0.0));
			switch (this.partID)
			{
				case 0: // Bottom segment
					this.textureCoords.push(vec2((ii / radialSubdivisions) * 5/4 + .12, (1-v) * 397/512));
					break;
				case 1: // Middle segment
					this.textureCoords.push(vec2((ii / radialSubdivisions) * 2 - .1, v ));
					break;
				case 2: // Top segments
					this.textureCoords.push(vec2((ii / radialSubdivisions) * 2 - .1, v/2 + 0.5 ));
					break;
			}
		}
	}

	for (var yy = 0; yy < verticalSubdivisions + extra; ++yy)
	{
		for (var ii = 0; ii < radialSubdivisions; ++ii)
		{
			this.indices.push(vertsAroundEdge * (yy + 0) + 0 + ii, vertsAroundEdge * (yy + 0) + 1 + ii, vertsAroundEdge * (yy + 1) + 1 + ii);
			this.indices.push(vertsAroundEdge * (yy + 0) + 0 + ii, vertsAroundEdge * (yy + 1) + 1 + ii, vertsAroundEdge * (yy + 1) + 0 + ii);
			this.numIndices += 6;
		}
	}
};

cone.prototype.setupBuffers = function()
{
	this.indexBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
    gl.bufferData( gl.ELEMENT_ARRAY_BUFFER, new Uint8Array(this.indices), gl.STATIC_DRAW );

    this.vertexBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, this.vertexBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(this.vertices), gl.STATIC_DRAW );
	
    this.textureBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, this.textureBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(this.textureCoords), gl.STATIC_DRAW );
}

cone.prototype.drawCone = function(modelTransform)
{
	gl.bindBuffer( gl.ARRAY_BUFFER, this.vertexBuffer );
    gl.vertexAttribPointer( positionLoc, 4, gl.FLOAT, false, 0, 0 );

	gl.bindBuffer( gl.ARRAY_BUFFER, this.textureBuffer );
    gl.vertexAttribPointer( texCoordLoc, 2, gl.FLOAT, false, 0, 0 );

    gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer );	
	
	gl.uniformMatrix4fv(modelLoc, false, flatten(modelTransform));
	gl.uniformMatrix4fv(cameraLoc, false, flatten(startingCamera));
    gl.uniformMatrix4fv(projectionLoc, false, flatten(perspective( 45.0, canvas.width/canvas.height, near, far )));

	gl.uniform4fv(colorLoc, [ 1.0, 1.0, 1.0, 1.0 ]);
	gl.uniform1i(useTextureLoc, true);
	gl.uniform1i(useThreePositionLoc, false);

	gl.enable( gl.BLEND );
	gl.blendFunc( gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA );
	gl.enable(gl.DEPTH_TEST);
	gl.drawElements( gl.TRIANGLES, this.numIndices, gl.UNSIGNED_BYTE, 0 );
    gl.enable(gl.DEPTH_TEST);
	gl.disable( gl.BLEND );
}

function initCannon()
{
	bottomCone = new cone(0);
	var firstRadius = 2.75;
	var secondRadius = 2.25;
	bottomCone.createTruncatedCone(firstRadius, secondRadius, 7, 15, 5, true, false);
	bottomCone.setupBuffers();
	
	middleCone = new cone(1);
	var thirdRadius = 1.9275;
	middleCone.createTruncatedCone(secondRadius, thirdRadius, 4.5, 15, 5, false, false);
	middleCone.setupBuffers();
	
	ringCone = new cone(2);
	var fourthRadius = 1.6;
	ringCone.createTruncatedCone(thirdRadius, 1.6, 0.5, 15, 5, false, false);
	ringCone.setupBuffers();
	
	topCone = new cone(2);
	topCone.createTruncatedCone(fourthRadius, 1.45, 2, 15, 5, false, true);
	topCone.setupBuffers();
	
	cannonDefault = mat4();
	cannonDefault = mult(cannonDefault, translate(2.8, -2.5, 0));
	cannonDefault = mult(cannonDefault, rotate(-90, vec3(1, 0, 0)));
	cannonAzimuth = 20;
	cannonAltitude = 25;
	
    initTexture(document.getElementById("texImage2"), 1);
    initTexture(document.getElementById("texImage3"), 2);
}

function drawCannon()
{
	cannonTransform = cannonDefault;
	cannonTransform = mult(cannonTransform, rotate(cannonAzimuth, vec3(0, 0, 1)));
	cannonTransform = mult(cannonTransform, rotate(cannonAltitude, vec3(1, 0, 0)));
	
	var adjust = mult(mat4(), rotate(180 + 72, vec3(0, 1, 0)));
	adjust = mult(adjust, scale(0.40, 0.40, 0.40));
	
	// Bottom
	modelTransform = mult(mat4(), cannonTransform);
	modelTransform = mult(modelTransform, adjust);
	modelTransform = mult(modelTransform, translate(0, 1.4, 0));
    gl.uniform1i(gl.getUniformLocation(program, "texture"), 1);
	bottomCone.drawCone(modelTransform);
	
	// Middle
	modelTransform = mult(mat4(), cannonTransform);
	modelTransform = mult(modelTransform, adjust);
	modelTransform = mult(modelTransform, translate(0, 7.15, 0));
    gl.uniform1i(gl.getUniformLocation(program, "texture"), 2);
	middleCone.drawCone(modelTransform);
	
	// Ring
	modelTransform = mult(mat4(), cannonTransform);
	modelTransform = mult(modelTransform, adjust);
	modelTransform = mult(modelTransform, translate(0, 9.65, 0));
	ringCone.drawCone(modelTransform);
	
	// Top
	modelTransform = mult(mat4(), cannonTransform);
	modelTransform = mult(modelTransform, adjust);
	modelTransform = mult(modelTransform, translate(0, 10.9, 0));
	topCone.drawCone(modelTransform);
}

var texHUD;

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
	
    initTexture(document.getElementById("texImage"), 0);
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
	var projectionTransform = ortho(-1, 1, -1, 1, near, far);
    gl.uniformMatrix4fv(projectionLoc, false, flatten(projectionTransform));
	
    gl.uniform1i(gl.getUniformLocation(program, "texture"), 0);
	
	gl.uniform4fv(colorLoc, [ 1.0, 1.0, 1.0, 1.0 ]);
	gl.uniform1i(useTextureLoc, true);
	gl.uniform1i(useThreePositionLoc, false);

	gl.enable( gl.BLEND );
	gl.blendFunc( gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA );
	gl.enable(gl.DEPTH_TEST);
	gl.drawElements( gl.TRIANGLES, 6, gl.UNSIGNED_BYTE, 0 );
	gl.disable( gl.BLEND );
}