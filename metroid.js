var canvas;
var gl;

var program;
var texture;

var color, colorLoc;
var modelTransform, modelLoc;
var cameraTransform, cameraLoc;
var projectionTransform, projectionLoc;
var near = 0.1;
var far = 1000;
var startingCamera;

var vBufferCrosshair;

var positionLoc, texCoordLoc;
var useTextureLoc;

var vertices = [
	vec4( -.1, 0, 0, 1.0 ),
	vec4( .1, 0, 0, 1.0 ), 
	vec4( 0, .15, 0, 1.0 ),
	vec4( 0, -.15, 0, 1.0 )
];

function keyboardEvent(event)
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
		default:
			break;
	}
}

function configureTexture(image)
{
    texture = gl.createTexture();
    gl.bindTexture( gl.TEXTURE_2D, texture );
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image );
    gl.generateMipmap( gl.TEXTURE_2D );
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR );
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR );    
    gl.uniform1i(gl.getUniformLocation(program, "texture"), 0);
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
	
	startingCamera = mult(translate(0, 0, -20), mat4());
	cameraTransform = startingCamera;

	document.onkeydown = keyboardEvent;
	
    render();
}

function drawCrosshair()
{
    gl.disableVertexAttribArray( texCoordLoc );

	gl.bindBuffer( gl.ARRAY_BUFFER, vBufferCrosshair );
    gl.vertexAttribPointer( positionLoc, 4, gl.FLOAT, false, 0, 0 );
	
	gl.uniformMatrix4fv(modelLoc, false, flatten(mat4()));
	gl.uniformMatrix4fv(cameraLoc, false, flatten(startingCamera));
	
	projectionTransform = ortho(-1, 1, -1, 1, near, far);
    gl.uniformMatrix4fv(projectionLoc, false, flatten(projectionTransform));
	
	color = [ 0.0, 0.0, 0.0, 1.0 ];
	gl.uniform4fv(colorLoc, color);
	gl.uniform1i(useTextureLoc, false);
	
	gl.drawArrays( gl.LINES, 0, 4);
	
    gl.enableVertexAttribArray( texCoordLoc );
}

function render()
{
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	
	drawCrosshair();

	drawCannon();
	drawHUD();
	
    requestAnimFrame( render );
}