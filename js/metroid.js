var canvas;
var gl;

var program, programSky;
var freeAim = false;

var colorLoc, modelLoc, cameraLoc, projectionLoc;
var cameraAzimuth, cameraAltitude, cameraTransform;
var positionLoc, texCoordLoc, normalLoc;
var useTextureLoc, useLightingLoc, useThreePositionLoc, useSkyboxLoc;
var near = 0.1;
var far = 1000;
var startingCamera, resetCamera;
var scrollingLeft, scrollingRight, scrollingUp, scrollingDown;

var vBufferCrosshair;

var vertices = [
	vec4( -.1, 0, 0, 1.0 ),
	vec4( .1, 0, 0, 1.0 ), 
	vec4( 0, .15, 0, 1.0 ),
	vec4( 0, -.15, 0, 1.0 )
];

var playMusic = true;

var sound = new Howl({
  urls: ['sounds/sound.mp3', 'sound.ogg', 'sound.wav'],
  loop: true,
  volume: 0.5
}).play();

var laser = new Howl({
	urls: ['sounds/laser.mp3'],
	volume: 0.7
})

function keyPress(event)
{
	switch (event.keyCode){
		case 82: // R key
			cameraTransform = resetCamera;
			cameraAzimuth = 135;
			cameraAltitude = 0;
			break;
		case 87: // W
			cameraTransform = mult(rotate(-cameraAltitude, vec3(1, 0, 0)), cameraTransform);
			cameraTransform = mult( translate(0, 0, 0.5), cameraTransform );
			cameraTransform = mult(rotate(cameraAltitude, vec3(1, 0, 0)), cameraTransform);	
			break;
		case 83: // S
			cameraTransform = mult(rotate(-cameraAltitude, vec3(1, 0, 0)), cameraTransform);
			cameraTransform = mult( translate(0, 0, -0.5), cameraTransform );
			cameraTransform = mult(rotate(cameraAltitude, vec3(1, 0, 0)), cameraTransform);	
			break;
		case 65: // A
			cameraTransform = mult(rotate(-cameraAltitude, vec3(1, 0, 0)), cameraTransform);
			cameraTransform = mult( translate(0.5, 0, 0), cameraTransform );
			cameraTransform = mult(rotate(cameraAltitude, vec3(1, 0, 0)), cameraTransform);	
			break;
		case 68: // D
			cameraTransform = mult(rotate(-cameraAltitude, vec3(1, 0, 0)), cameraTransform);
			cameraTransform = mult( translate(-0.5, 0, 0), cameraTransform );
			cameraTransform = mult(rotate(cameraAltitude, vec3(1, 0, 0)), cameraTransform);	
			break;
		case 48:
			changeSkybox(1);
			break;
		case 49:
			changeSkybox(2);
			break;
		case 50:
			changeSkybox(3);
			break;
		case 51:
			changeSkybox(4);
			break;
		case 52:
			changeSkybox(5);
			break;
		case 53:
			changeSkybox(6);
			break;
		case 54:
			changeSkybox(7);
			break;
		case 55:
			changeSkybox(8);
			break;
		case 56:
			changeSkybox(9);
			break;
		case 57:
			changeSkybox(10);
			break;
		case 77:
			if (playMusic) {
				sound.mute();
				playMusic = !playMusic;
				break;
			}
			else {
				sound.unmute();
				playMusic = !playMusic;
				break;
			}
			
		default:
			break;
	}
}

var img = new Array(6);
var skyboxTexture;
var terrainTexture;
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
		case 3:
			gl.activeTexture(gl.TEXTURE3);
			terrainTexture = curTexture;
			break;

        case 4: case 5: case 6: case 7: case 8:
			gl.activeTexture(gl.TEXTURE4);
            img[index - 4] = image;
            break;
        case 9:
            img[5] = image;
			gl.activeTexture(gl.TEXTURE4);
			break;
	}

    if (index < 4) {
		if (index == 3)
			gl.bindTexture(gl.TEXTURE_2D, terrainTexture);
		else
			gl.bindTexture(gl.TEXTURE_2D, curTexture);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
        gl.generateMipmap(gl.TEXTURE_2D);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
		if (index == 3)
			gl.bindTexture(gl.TEXTURE_2D, null);
    }
    else if (index == 9) { // For skybox texturing
		skyboxTexture = curTexture;

        var targets = [
            gl.TEXTURE_CUBE_MAP_POSITIVE_X, gl.TEXTURE_CUBE_MAP_NEGATIVE_X,
            gl.TEXTURE_CUBE_MAP_POSITIVE_Y, gl.TEXTURE_CUBE_MAP_NEGATIVE_Y,
            gl.TEXTURE_CUBE_MAP_POSITIVE_Z, gl.TEXTURE_CUBE_MAP_NEGATIVE_Z
        ];
        for (var j = 0; j < 6; j++)
        {
			gl.bindTexture(gl.TEXTURE_CUBE_MAP, skyboxTexture);
            gl.texImage2D(targets[j], 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img[j]);
            gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        }
        gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
		gl.bindTexture(gl.TEXTURE_CUBE_MAP, null);
    }
}

function click(event) {
	if (!freeAim) {
		enableAiming();
	}
	else {
		laser.play();
	}
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
		var w = window.innerWidth;
		if (x - (w-canvas.width)/2 < canvas.width/10)
		{
			scrollingLeft = true;
		}
		else if (x <= canvas.width * 9/10)
		{
			x -= canvas.width/10;
			x = x / canvas.width * 1.25 * -100 + 70;
			cannonAzimuth = x;
			scrollingLeft = false;
			scrollingRight = false;
		}
		else
		{
			scrollingRight = true;
		}
		if (y < canvas.height/8)
		{
			scrollingUp = true;
		}
		else if (y < canvas.height * 7/8)
		{
			y -= canvas.height/8;
			y = y / canvas.height * 4/3 * -50 + 50;
			cannonAltitude = y;
			scrollingUp = false;
			scrollingDown = false;
		}
		else
		{
			scrollingDown = true;
		}
	}
}

function dummyLightingUniforms()
{
    gl.uniform4fv( gl.getUniformLocation(program, "ambientProduct"), flatten(vec4(0, 0, 0, 0)));
    gl.uniform4fv( gl.getUniformLocation(program, "diffuseProduct"), flatten(vec4(0, 0, 0, 0)));
    gl.uniform4fv( gl.getUniformLocation(program, "specularProduct"), flatten(vec4(0, 0, 0, 0)));
    gl.uniform4fv( gl.getUniformLocation(program, "lightPosition"), flatten(vec4(0, 0, 0, 0)));
    gl.uniform1f( gl.getUniformLocation(program, "shininess"), 0);
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
	programSky = initShaders( gl, "vertex-shader-sky", "fragment-shader-sky" );
	
    gl.useProgram( program );
	
    positionLoc = gl.getAttribLocation( program, "vPosition" );
    gl.enableVertexAttribArray( positionLoc );
	
	texCoordLoc = gl.getAttribLocation( program, "vTexCoord" );
    gl.enableVertexAttribArray( texCoordLoc );

	threePositionLoc = gl.getAttribLocation( program, "threePosition" );
	normalLoc = gl.getAttribLocation( program, "vNormal" );
	
	colorLoc = gl.getUniformLocation( program, "fColor" );
    modelLoc = gl.getUniformLocation( program, "modelTransform" );
    cameraLoc = gl.getUniformLocation( program, "cameraTransform" );	
    projectionLoc = gl.getUniformLocation( program, "projectionTransform" );
	useTextureLoc = gl.getUniformLocation(program, "useTexture");
	useLightingLoc = gl.getUniformLocation(program, "useLighting");
	useThreePositionLoc = gl.getUniformLocation(program, "useThreePosition");
	
    vBufferCrosshair = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBufferCrosshair );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW );

	initHUD();
	initCannon();
    initSkybox();
	initTerrain();

	dummyLightingUniforms();
	
	startingCamera = mult(translate(0, 0, -5), mat4());
	cameraTransform = startingCamera;

	scrollingLeft = false;
	scrollingRight = false;
	scrollingUp = false;
	scrollingDown = false;
	
	// TODO: Change when altering terrain shape, size, layout
	cameraTransform = mult(translate(-128, -10, -128), cameraTransform);
	cameraTransform = mult( rotate(135, vec3(0, 1, 0)), cameraTransform );
	cameraAzimuth = 135;
	cameraAltitude = 0;
	
	resetCamera = cameraTransform;
	
	document.onkeydown = keyPress;
	
	canvas.onclick = click;
	canvas.onmousemove = aim;

    render();
};

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
	gl.uniform1i(useLightingLoc, false);
	gl.uniform1i(useThreePositionLoc, false);
    //gl.uniform1i(useSkyboxLoc, false);
	
	gl.drawArrays( gl.LINES, 0, 4);
	
    gl.enableVertexAttribArray( texCoordLoc );
}

function render()
{
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	
	var maxAltitude = 40;
	if (scrollingLeft == true)
	{
		cameraTransform = mult(rotate(-cameraAltitude, vec3(1, 0, 0)), cameraTransform);
		cameraTransform = mult(rotate(-1, vec3(0, 1, 0)), cameraTransform);
		cameraTransform = mult(rotate(cameraAltitude, vec3(1, 0, 0)), cameraTransform);
		cameraAzimuth--;
	}
	if (scrollingRight == true)
	{
		cameraTransform = mult(rotate(-cameraAltitude, vec3(1, 0, 0)), cameraTransform);
		cameraTransform = mult(rotate(1, vec3(0, 1, 0)), cameraTransform);
		cameraTransform = mult(rotate(cameraAltitude, vec3(1, 0, 0)), cameraTransform);	
		cameraAzimuth++;
	}
	if (scrollingUp == true && cameraAltitude >= -1 * maxAltitude)
	{
		cameraTransform = mult(rotate(-1, vec3(1, 0, 0)), cameraTransform);
		cameraAltitude--;
	}
	if (scrollingDown == true && cameraAltitude <= maxAltitude)
	{
		cameraTransform = mult(rotate(1, vec3(1, 0, 0)), cameraTransform);
		cameraAltitude++;
	}
	
	//drawCrosshair();

	drawTerrain();
	drawSkybox();	// new version of drawSkybox(). Need to revert commit to get old one back

	drawCannon();
	drawHUD();
	
    requestAnimFrame( render );
}