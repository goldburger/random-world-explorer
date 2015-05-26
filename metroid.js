var canvas;
var gl;

var program;
var freeAim = false;

var colorLoc, modelLoc, cameraLoc, projectionLoc;
var positionLoc, texCoordLoc, useTextureLoc;
var cameraTransform;
var near = 0.1;
var far = 1000;
var startingCamera;

var vBufferCrosshair;

var vertices = [
	vec4( -.1, 0, 0, 1.0 ),
	vec4( .1, 0, 0, 1.0 ), 
	vec4( 0, .15, 0, 1.0 ),
	vec4( 0, -.15, 0, 1.0 )
];

function keyPress(event)
{
	switch (event.keyCode){
		case 37: // Left arrow key
			cameraTransform = mult( rotate(-1, vec3(0, 1, 0)), cameraTransform );
			break;
		case 38: // Up arrow key
			cameraTransform = mult( translate(0, -.25, 0), cameraTransform );
			break;
		case 39: // Right arrow key
			cameraTransform = mult( rotate(1, vec3(0, 1, 0)), cameraTransform );
			break;
		case 40: // Down arrow key
			cameraTransform = mult( translate(0, .25, 0), cameraTransform );
			break;
		case 73: // I key
			cameraTransform = mult( translate(0, 0, .25), cameraTransform );
			break;
		case 74: // J key
			cameraTransform = mult( translate(.25, 0, 0), cameraTransform );
			break;
		case 75: // K key
			cameraTransform = mult( translate(-.25, 0, 0), cameraTransform );
			break;
		case 77: // M key
			cameraTransform = mult( translate(0, 0, -.25), cameraTransform );
			break;
		case 82: // R key
			cameraTransform = startingCamera;
			break;
		
		case 87: // W
			cannonAltitude++;
			break;
		case 83: // S
			cannonAltitude--;
			break;
		case 65: // A
			cannonAzimuth++;
			break;
		case 68: // D
			cannonAzimuth--;
			break;
		
		default:
			break;
	}
}

function initTexture(image, index)
{
    var curTexture = gl.createTexture();
	switch (index)
	{
		case 0:
			gl.activeTexture(gl.TEXTURE0);
			break;
		case 1:
			gl.activeTexture(gl.TEXTURE1);
			break;
		case 2:
			gl.activeTexture(gl.TEXTURE2);
			break;
	}
    gl.bindTexture( gl.TEXTURE_2D, curTexture );
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image );
    gl.generateMipmap( gl.TEXTURE_2D );
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR );
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR );
}

function enableAiming(event)
{
	freeAim = true;
	aim(event);
}

function aim(event)
{
	if (freeAim == true)
	{
		var x = event.clientX;
		var y = event.clientY;
		if (x < canvas.width/10)
		{
			// Change heading left; TBD
		}
		else if (x <= canvas.width * 9/10)
		{
			x -= canvas.width/10;
			x = x / canvas.width * 1.25 * -100 + 70;
			cannonAzimuth = x;
		}
		else
		{
			// Change heading right; TBD
		}
		if (y < canvas.height/8)
		{
			// Change vertical angle up; TBD
		}
		else if (y < canvas.height * 7/8)
		{
			y -= canvas.height/8;
			y = y / canvas.height * 4/3 * -50 + 50;
			cannonAltitude = y;
		}
		else
		{
			// Change vertical angle down; TBD
		}
	}
}

window.onload = function init()
{
    canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );
    gl.enable(gl.DEPTH_TEST);

    program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );
	
    positionLoc = gl.getAttribLocation( program, "vPosition" );
    gl.enableVertexAttribArray( positionLoc );
	
	texCoordLoc = gl.getAttribLocation( program, "vTexCoord" );
    gl.enableVertexAttribArray( texCoordLoc );

    vBufferCrosshair = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBufferCrosshair );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW );

	initHUD();
	initCannon();
	
	colorLoc = gl.getUniformLocation( program, "fColor" );
    modelLoc = gl.getUniformLocation( program, "modelTransform" );
    cameraLoc = gl.getUniformLocation( program, "cameraTransform" );	
    projectionLoc = gl.getUniformLocation( program, "projectionTransform" );
	useTextureLoc = gl.getUniformLocation(program, "useTexture");
	
	startingCamera = mult(translate(0, 0, -5), mat4());
	cameraTransform = startingCamera;

	document.onkeydown = keyPress;
	
	canvas.onclick = enableAiming;
	canvas.onmousemove = aim;
	
    render();
}

function drawCrosshair()
{
    gl.disableVertexAttribArray( texCoordLoc );

	gl.bindBuffer( gl.ARRAY_BUFFER, vBufferCrosshair );
    gl.vertexAttribPointer( positionLoc, 4, gl.FLOAT, false, 0, 0 );
	
	gl.uniformMatrix4fv(modelLoc, false, flatten(mat4()));
	gl.uniformMatrix4fv(cameraLoc, false, flatten(startingCamera));
	
    gl.uniformMatrix4fv(projectionLoc, false, flatten(ortho(-1, 1, -1, 1, near, far)));

	gl.uniform4fv(colorLoc, [ 0.0, 0.0, 0.0, 1.0 ]);
	gl.uniform1i(useTextureLoc, false);
	
	gl.drawArrays( gl.LINES, 0, 4);
	
    gl.enableVertexAttribArray( texCoordLoc );
}

function render()
{
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	
	//drawCrosshair();

	drawCannon();
	drawHUD();
	
    requestAnimFrame( render );
}