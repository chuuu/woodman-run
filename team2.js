var score = 0;
var lastTick = 0;
var coinrotate = 0;

var starttime = 0;
var setStartTime = false;
var startTimeNotSet = true;
var readyScene = true;
var gameOverScene = false;
var gameOverPlayed = false;
var bonusAddedToScore = false;


var cameraMove = 0;
var rotateCubes = true;
var cubesAngle = 0;
var rotateTex = true;
var texAngle = 0;
var scrollTex = false;
var time = 0;
var lastTime = 0;

var canvas;
var gl;

var numVertices  = 36;

var texSize = 64;

var program;

var pointsArray = [];
var modelArray = [];
var colorsArray = [];
var texCoordsArray = [];
var stone_x;
var stone_z;
var coin_x;
var coin_z;
var obstacle_lane;
var coin_lane;
var texture;

//variable of the object's
var numTimesToSubdivide = 3;
var index = 0;
var object_time = 0;
var normalsArray = [];
var colorsArray = [];
var texCoordsArray = [];
var Rotate_amount =0;
var angle_left = 25;
var angle_right = -25;
var angle_right_arm = 15;
var angle_left_arm = -15;
var texture1;
var game_state = 0;  // 0 is ready, 1 is in game

var x_move = 0;
var player_zpos = 19;

var va = vec4(0.0, 0.0, -1.0,1);
var vb = vec4(0.0, 0.942809, 0.333333, 1);
var vc = vec4(-0.816497, -0.471405, 0.333333, 1);
var vd = vec4(0.816497, -0.471405, 0.333333,1);

//lighting module variables
var lightPosition = vec4(2.0, 2.0, 3.0, 0.0 );
var lightAmbient = vec4(0.2, 0.2, 0.2, 1.0 );
var lightDiffuse = vec4( 1.0, 1.0, 1.0, 1.0 );
var lightSpecular = vec4( 1.0, 1.0, 1.0, 1.0 );

var materialAmbient = vec4( 1.0, 1.0, 1.0, 1.0 );
var materialDiffuse = vec4( 0.8, 0.8, 0.8, 1.0 );
var materialSpecular = vec4( 1.0, 0.8, 0.8, 1.0 );
var materialShininess = 50.0;
    
var ModelMatrix, ViewMatrix, projectionMatrix;
var ModelMatrixLoc,ViewMatrixLoc, projectionMatrixLoc;
var normalMatrix, normalMatrixLoc;
var modelViewMatrix;


//colors
var vertexColors = [
    vec4( 1.0, 1.0, 1.0, 1.0 ),
    vec4( 0.0, 0.0, 1.0, 1.0  ),  // black
    vec4( 0.0, 0.0, 1.0, 1.0 ),  // red
    vec4( 1.0, 1.0, 0.0, 1.0 ),  // yellow
    vec4( 0.0, 1.0, 0.0, 1.0 ),  // green
    vec4( 0.0, 0.0, 1.0, 1.0 ),  // blue
    vec4( 1.0, 0.0, 1.0, 1.0 ),  // magenta
    vec4( 0.0, 1.0, 1.0, 1.0 ),  // white
    vec4( 0.0, 1.0, 1.0, 1.0 )   // cyan
]; 


function triangle(a, b, c) {


     vertices.push(a);
     vertices.push(b);      
     vertices.push(c);
    
     colorsArray.push(vertexColors[0]); 
     colorsArray.push(vertexColors[0]); 
     colorsArray.push(vertexColors[0]);

     texturecoord.push(texCoord[0]);
     texturecoord.push(texCoord[1]);
     texturecoord.push(texCoord[2]); 

     pointsArray.push(a);
     pointsArray.push(b);
     pointsArray.push(c);

     normalsArray.push(vec3(a[0],a[1], a[2]));
     normalsArray.push(vec3(b[0],b[1], b[2]));
     normalsArray.push(vec3(c[0],c[1], c[2]));

     index += 3;
     
}


function divideTriangle(a, b, c, count) {
    if ( count > 0 ) {
                
        var ab = mix( a, b, 0.5);
        var ac = mix( a, c, 0.5);
        var bc = mix( b, c, 0.5);
                
        ab = normalize(ab, true);
        ac = normalize(ac, true);
        bc = normalize(bc, true);
                                
        divideTriangle( a, ab, ac, count - 1 );
        divideTriangle( ab, b, bc, count - 1 );
        divideTriangle( bc, c, ac, count - 1 );
        divideTriangle( ab, bc, ac, count - 1 );
    }
    else { 
        triangle( a, b, c );
    }
}


function tetrahedron(a, b, c, d, n) {
    divideTriangle(a, b, c, n);
    divideTriangle(d, c, b, n);
    divideTriangle(a, d, b, n);
    divideTriangle(a, c, d, n);
}


//texture cordinate of the body
var texCoord = [
    vec2(0, 0),
    vec2(0, 1),
    vec2(1, 1),
    vec2(1, 0)
];


//vectices of the body
var vertices_body = [
    vec4( -0.5, -0.5,  0.5, 1.0 ),
    vec4( -0.5,  0.5,  0.5, 1.0 ),
    vec4( 0.5,  0.5,  0.5, 1.0 ),
    vec4( 0.5, -0.5,  0.5, 1.0 ),
    vec4( -0.5, -0.5, -0.5, 1.0 ),
    vec4( -0.5,  0.5, -0.5, 1.0 ),
    vec4( 0.5,  0.5, -0.5, 1.0 ),
    vec4( 0.5, -0.5, -0.5, 1.0 )
];

//vertices of the head
var va = vec4(0.0, 0.0, -1.0,1);
var vb = vec4(0.0, 0.942809, 0.333333, 1);
var vc = vec4(-0.816497, -0.471405, 0.333333, 1);
var vd = vec4(0.816497, -0.471405, 0.333333,1);



function quad(a, b, c, d, color) {
	 var t1 = subtract(vertices_body[b], vertices_body[a]);
     var t2 = subtract(vertices_body[c], vertices_body[b]);
     var normal = cross(t1, t2);
     var normal = vec3(normal);

     vertices.push(vertices_body[a]); 
	 normalsArray.push(normal);
     colorsArray.push(vertexColors[color]); 
     texturecoord.push(texCoord[0]);

     vertices.push(vertices_body[b]); 
	 normalsArray.push(normal);
     colorsArray.push(vertexColors[color]);
     texturecoord.push(texCoord[1]); 

     vertices.push(vertices_body[c]);
	 normalsArray.push(normal); 
     colorsArray.push(vertexColors[color]);
     texturecoord.push(texCoord[2]); 
   
     vertices.push(vertices_body[a]);
	 normalsArray.push(normal); 
     colorsArray.push(vertexColors[color]);
     texturecoord.push(texCoord[0]); 

     vertices.push(vertices_body[c]);
	 normalsArray.push(normal); 
     colorsArray.push(vertexColors[color]);
     texturecoord.push(texCoord[2]); 

     vertices.push(vertices_body[d]); 
	 normalsArray.push(normal);
     colorsArray.push(vertexColors[color]);
     texturecoord.push(texCoord[3]);   
}


function colorCube(color)
{
    quad( 1, 0, 3, 2, color );
    quad( 2, 3, 7, 6, color+1 );
    quad( 3, 0, 4, 7, color+2 );
    quad( 6, 5, 1, 2, color+3 );
    quad( 4, 5, 6, 7, color+4 );
    quad( 5, 4, 0, 1, color+5 );
}

function pushNormal()
{
	for(var i=0; i<6; i++)
	{
		var t1 = subtract(vertices[i*6+1], vertices[i*6]);
		var t2 = subtract(vertices[i*6+2], vertices[i*6+1]);
		var normal = cross(t1, t2);
		var normal = vec3(normal);
		normalsArray.push(normal);
		normalsArray.push(normal);
		normalsArray.push(normal);
		normalsArray.push(normal);
		normalsArray.push(normal);
		normalsArray.push(normal);
	}
}

//environment variables
var texturecoord = [
vec2(0, 0),
vec2(0, 1.0),
vec2(1.0, 1.0),
vec2(1.0, 1.0),
vec2(1.0, 0),
vec2(0, 0),
vec2(0, 0),
vec2(0, 1.0),
vec2(1.0, 1.0),
vec2(1.0, 1.0),
vec2(1.0, 0),
vec2(0, 0),
vec2(0, 0),
vec2(0, 1.0),
vec2(1.0, 1.0),
vec2(1.0, 1.0),
vec2(1.0, 0),
vec2(0, 0),
vec2(0, 0),
vec2(0, 1.0),
vec2(1.0, 1.0),
vec2(1.0, 1.0),
vec2(1.0, 0),
vec2(0, 0),
vec2(0, 0),
vec2(0, 1.0),
vec2(1.0, 1.0),
vec2(1.0, 1.0),
vec2(1.0, 0),
vec2(0, 0),
vec2(0, 0),
vec2(0, 1.0),
vec2(1.0, 1.0),
vec2(1.0, 1.0),
vec2(1.0, 0),
vec2(0, 0)
];

var vertices = [
vec4(-2.0, 0.0, -5.0, 1.0),
vec4(-2.0, 0.0, 7.0, 1.0),
vec4(2.0, 0.0, 7.0, 1.0),
vec4(2.0, 0.0, 7.0, 1.0),
vec4(2.0, 0.0, -5.0, 1.0),
vec4(-2.0, 0.0, -5.0, 1.0),
vec4(-5.0, 0.0, -5.0, 1.0),
vec4(-5.0, 0.0, 7.0, 1.0),
vec4(5.0, 0.0, 7.0, 1.0),
vec4(5.0, 0.0, 7.0, 1.0),
vec4(5.0, 0.0, -5.0, 1.0),
vec4(-5.0, 0.0, -5.0, 1.0),
vec4(-20.0, 0.0, -20.0, 1.0),
vec4(-20.0, 0.0, 20.0, 1.0),
vec4(20.0, 0.0, 20.0, 1.0),
vec4(20.0, 0.0, 20.0, 1.0),
vec4(20.0, 0.0, -20.0, 1.0),
vec4(-20.0, 0.0, -20.0, 1.0),
vec4(-5.0, 0.0, -5.0, 1.0),
vec4(-5.0, 0.0, 5.0, 1.0),
vec4(5.0, 0.0, 5.0, 1.0),
vec4(5.0, 0.0, 5.0, 1.0),
vec4(5.0, 0.0, -5.0, 1.0),
vec4(-5.0, 0.0, -5.0, 1.0),
vec4(-.3, 0.0, -.3, 1.0),
vec4(-.3, 0.0, .3, 1.0),
vec4(.3, 0.0, .3, 1.0),
vec4(.3, 0.0, .3, 1.0),
vec4(.3, 0.0, -.3, 1.0),
vec4(-.3, 0.0, -.3, 1.0),
vec4(-3, 0.0, -3, 1.0),
vec4(-3, 0.0, 3, 1.0),
vec4(3, 0.0, 3, 1.0),
vec4(3, 0.0, 3, 1.0),
vec4(3, 0.0, -3, 1.0),
vec4(-3, 0.0, -3, 1.0)
];



function configureTexture(){
    textures = [];
    
    for (var i=0; i<20; ++i) {
    	var texture = gl.createTexture();
    	gl.bindTexture(gl.TEXTURE_2D, texture);
    	gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image[i] );
    	
    	gl.generateMipmap( gl.TEXTURE_2D );
    	gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR );
    	gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR_MIPMAP_LINEAR );

    	textures.push(texture);
    }
}


window.onload = function init() {

    canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    
    if ( !gl ) { alert( "WebGL isn't available" ); }
    
    document.addEventListener('keydown', function(event) {
    	//alert(event.keyCode);
        
        // key 's': start/stop scrolling of texture map
        if (event.keyCode == 38 && setStartTime == false && !gameOverScene) {
        	scrollTex = !scrollTex;
        	setStartTime = true;
        	readyScene = false;
            game_state = 1;
            Rotate_amount = 0;
            object_time = 0;
        }
        
    }, true);

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 0.0, 0.0, 1.0 );
    
    gl.enable(gl.DEPTH_TEST);

    program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

	pushNormal();

    console.log(vertices.length);
    //draw the head
    tetrahedron(va, vb, vc, vd, 5);

    //draw the body
    colorCube(0);

    //draw left leg
    colorCube(0);

    //draw right leg
    colorCube(0);

    //draw left arm
    colorCube(0);

    //draw left right
    colorCube(0);

    //draw obstacle
    colorCube(0);

    console.log(vertices.length);

    vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW );
    
    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );
    
    tBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, tBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(texturecoord), gl.STATIC_DRAW );
    
    vTexCoord = gl.getAttribLocation( program, "vTexCoord" );
    gl.vertexAttribPointer( vTexCoord, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vTexCoord );

	var nBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, nBuffer);
    gl.bufferData( gl.ARRAY_BUFFER, flatten(normalsArray), gl.STATIC_DRAW );
    
    var vNormal = gl.getAttribLocation( program, "vNormal" );
    gl.vertexAttribPointer( vNormal, 3, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vNormal);

    //environment texture
    image1 = document.getElementById("texImage");
    image2 = document.getElementById("texImage2");
    image3 = document.getElementById("texImage3");
    image4 = document.getElementById("texImage4");
    image5 = document.getElementById("texImage5");
    image6 = document.getElementById("texImage6");
    image7 = document.getElementById("texImage7");
    image8 = document.getElementById("texImage8");
    image9 = document.getElementById("texImage9");
    image10 = document.getElementById("texImage10");
    image11 = document.getElementById("texImage11");
    image12 = document.getElementById("texImage12");
    image13 = document.getElementById("texImage13");
    image14 = document.getElementById("texImage14");
    image15 = document.getElementById("texImage15");
    image16 = document.getElementById("texImage16");
    image17 = document.getElementById("texImage17");
    image18 = document.getElementById("texImage18");
    image19 = document.getElementById("texImage19");
    image20 = document.getElementById("texImage20");
    //object texture

    image = [];
    image.push(image1);
    image.push(image2);
    image.push(image3);
    image.push(image4);
    image.push(image5);
    image.push(image6);
    image.push(image7);
    image.push(image8);
    image.push(image9);
    image.push(image10);
    image.push(image11);
    image.push(image12);
    image.push(image13);
    image.push(image14);
    image.push(image15);
    image.push(image16);
    image.push(image17);
    image.push(image18);
    image.push(image19);
    image.push(image20);

    configureTexture();

    modelViewMatrixLoc = gl.getUniformLocation(program, "modelViewMatrix");
    projectionMatrixLoc = gl.getUniformLocation(program, "projectionMatrix");
    scrollTexLoc = gl.getUniformLocation(program, "scrollTex");
    timeLoc = gl.getUniformLocation(program, "time");
    starttimeLoc = gl.getUniformLocation(program, "starttime");
    isSkyLoc = gl.getUniformLocation(program, "isSky");
    isGoSceneLoc = gl.getUniformLocation(program, "isGoScene");
    isObjectLoc = gl.getUniformLocation(program, "isObject");
    textureLoc = gl.getUniformLocation(program, "texture");
    gl.uniform1i(textureLoc, 0);
    
	//calculating lighting variables
    ambientProduct = mult(lightAmbient, materialAmbient);
    diffuseProduct = mult(lightDiffuse, materialDiffuse);
    specularProduct = mult(lightSpecular, materialSpecular);

	gl.uniform4fv( gl.getUniformLocation(program, 
       "ambientProduct"),flatten(ambientProduct) );
    gl.uniform4fv( gl.getUniformLocation(program, 
       "diffuseProduct"),flatten(diffuseProduct) );
    gl.uniform4fv( gl.getUniformLocation(program, 
       "specularProduct"),flatten(specularProduct) );	
    gl.uniform4fv( gl.getUniformLocation(program, 
       "lightPosition"),flatten(lightPosition) );
    gl.uniform1f( gl.getUniformLocation(program, 
       "shininess"),materialShininess );

    z_change = 0;
    x_change = 0;
    fov_change = 0;
    cam_change = 0;
    y_change = 0;
    size_change = 0;
    Rotate_amount = 0;
    //key press handler, only for setting up parameter
    window.onkeydown = function( event ) {
       var key = event.keyCode;
       
        switch( key ) {
          case 90:
                z_change = z_change + 1;
                console.log("z_change");  
                console.log(z_change);
                break;
          case 88:
                z_change = z_change - 1 ;
                console.log("z_change");  
                console.log(z_change);
                break;
          case 89:
                y_change = y_change + 1;
                console.log("y_change");   
                console.log(y_change); 
                break;
          case 85:
                y_change = y_change - 1 ;
                console.log("y_change");  
                console.log(y_change);
                break;
          case 70:
                fov_change = fov_change + 5;
                console.log("fov_change");  
                console.log(fov_change);
                break;
          case 71:
                fov_change = fov_change - 5;
                console.log("fov_change");  
                console.log(fov_change);
                break;
          case 67:
                cam_change = cam_change + 1;
                console.log("cam_change");  
                console.log(cam_change);
                break;
          case 86:
                cam_change = cam_change - 1;
                console.log("cam_change");  
                console.log(cam_change);
                break;
          // case 83:
          //       size_change = size_change + 0.1;
          //       console.log("size_change");  
          //       console.log(size_change);
          //       break;
          // case 68:
          //       size_change = size_change - 0.1;
          //       console.log("size_change");  
          //       console.log(size_change);
          //       break;
          case 37:
                if (x_move - 0.25 >= -1.0 && !gameOverScene) {
                    x_move -= 0.25;
                }
                break;
          case 39:
                if (x_move + 0.25 <= 1.0 && !gameOverScene) {
                    x_move += 0.25;
                }
                break;
          case 65:
                if(game_state ==0)
                Rotate_amount = Rotate_amount - 1;
                break;
          case 68:
                if(game_state == 0)
                Rotate_amount = Rotate_amount + 1;
                break;
            case 13:
                if (gameOverScene) {
                    gameOverScene = false;
                    reset();
                }

        }
    }

    render();
}


function set_par(ViewMatrix,ModelMatrix,projectionMatrix){

    // gl.uniformMatrix4fv(ViewMatrixLoc, false, flatten(ViewMatrix) );
    // gl.uniformMatrix4fv(ModelMatrixLoc, false, flatten(ModelMatrix) );
    var modelViewMatrix = mult(ViewMatrix,ModelMatrix);
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix) );
    gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix) );
}

function reset() {
    starttime = 0;
    score = 0;
    setStartTime = false;
    startTimeNotSet = true;
    readyScene = true;

    x_move = 0;

    gameOverPlayed = false;
    
    document.getElementById('audioGameOver').pause();
    document.getElementById('audioGameOver').currentTime = 0;
    document.getElementById('audiotag1').play();

    console.log("reset complete");
}

function gameOver() {
    starttime = 0;
    setStartTime = false;
    startTimeNotSet = true;

    cameraMove = 0;
    rotateCubes = true;
    rotateTex = true;
    texAngle = 0;
    scrollTex = false;
    time = 0;
    lastTime = 0;
    isObject = true;
    isSky = true;
    gameOverScene = true;

    document.getElementById('audiotag1').pause();
    document.getElementById('audiotag1').currentTime = 0;
    if (!gameOverPlayed) {
      document.getElementById('audiopunch').play();
      document.getElementById('audioGameOver').play();
      gameOverPlayed = true;
    }

    game_state = 0;
}

function bindDigit (currdigit){
	gl.activeTexture(gl.TEXTURE);
    gl.bindTexture(gl.TEXTURE_2D, textures[currdigit+7]);
}



var render = function(time){


    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    isSky = false;
    isObject = false;
    gl.uniform1f(isObjectLoc, isObject);
    gl.uniform1f(isSkyLoc, isSky);
    
    if (startTimeNotSet && setStartTime)
    {
    	startTimeNotSet = false;
    	starttime = time;
    }
    
    gl.uniform1f(timeLoc, time);
    gl.uniform1f(starttimeLoc, starttime);
    gl.uniform1f(scrollTexLoc, scrollTex);
    gl.uniform1f(isGoSceneLoc, false);

	//normal matrix
	normalMatrix = mat4();
	gl.uniformMatrix3fv(normalMatrixLoc, false, flatten(normalMatrix) );
    
    // projection
    projectionMatrix = perspective(50, canvas.width / canvas.height, 0.1, 500);
    projectionMatrix = mult(projectionMatrix, translate(0, 0, -5+cameraMove));
    gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix) );
    
    gl.activeTexture(gl.TEXTURE);
    gl.bindTexture(gl.TEXTURE_2D, textures[0]);
    

    ViewMatrix = translate(0,0,0);
    tmp = mult(translate(0,0,0),rotate(Rotate_amount,vec3(0,1,0)));
    ViewMatrix = mult(tmp,ViewMatrix );
    ViewMatrix = mult( rotate(Rotate_amount,vec3(0,1,0)),ViewMatrix);


    //floor
    modelViewMatrix = mult(ViewMatrix, translate(0, -1, -4));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix) );
    gl.drawArrays( gl.TRIANGLES, 0, 6 );
    
    gl.activeTexture(gl.TEXTURE);
    gl.bindTexture(gl.TEXTURE_2D, textures[1]);
    //grassland
    //left
    modelViewMatrix = mult(ViewMatrix,translate(-7, -1, -4));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix) );
    gl.drawArrays( gl.TRIANGLES, 6, 6 );
    //right
    modelViewMatrix = mult(ViewMatrix,translate(7, -1, -4));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix) );
    gl.drawArrays( gl.TRIANGLES, 6, 6 );
    
    //sky
    isSky = true;
    gl.uniform1f(isSkyLoc, isSky);

    gl.activeTexture(gl.TEXTURE);
    gl.bindTexture(gl.TEXTURE_2D, textures[2]);
    modelViewMatrix = translate(2.5, 2, -10);
    modelViewMatrix = mult(modelViewMatrix, rotate(-30, vec3(1, 0, 0)));
    modelViewMatrix = mult(ViewMatrix,modelViewMatrix);
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix) );
    gl.drawArrays( gl.TRIANGLES, 12, 6 );
    isSky = false;
    gl.uniform1f(isSkyLoc, isSky);

    if (gameOverScene) {
        gl.enable( gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
        gl.activeTexture(gl.TEXTURE);
        gl.bindTexture(gl.TEXTURE_2D, textures[17]);

        modelViewMatrix = translate(0, 0.9, -3);
        modelViewMatrix = mult(modelViewMatrix, rotate(90, vec3(1, 0, 0)));
        gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));
        gl.drawArrays(gl.TRIANGLES, 18, 6);

        gl.disable(gl.BLEND);
    }
   
    // ready scene
    if (readyScene)
    {
    	gl.enable( gl.BLEND);
    	gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    	//gl.depthMask(gl.FALSE);

    	gl.activeTexture(gl.TEXTURE);
        gl.bindTexture(gl.TEXTURE_2D, textures[3]);
    	
    	modelViewMatrix = translate(0, 0, -3);
    	modelViewMatrix = mult(modelViewMatrix, rotate(90, vec3(1, 0, 0)));
        gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix) );
        gl.drawArrays( gl.TRIANGLES, 18, 6 );
        //goScene = true;
        //gl.depthMask(gl.TRUE);
        gl.disable(gl.BLEND);
    }
    
    // go scene
    	gl.uniform1f(isGoSceneLoc, true);
    	gl.enable( gl.BLEND);
    	gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    	//gl.depthMask(gl.FALSE);
    	gl.uniform1f(scrollTexLoc, false);

    	gl.activeTexture(gl.TEXTURE);
        gl.bindTexture(gl.TEXTURE_2D, textures[4]);
        modelViewMatrix = translate(0, 0, -3);
    	modelViewMatrix = mult(modelViewMatrix, rotate(90, vec3(1, 0, 0)));
        gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix) );
        gl.drawArrays( gl.TRIANGLES, 18, 6 );
    	gl.uniform1f(scrollTexLoc, scrollTex);
        //gl.depthMask(gl.TRUE);
        gl.disable(gl.BLEND);
        gl.uniform1f(isGoSceneLoc, false);
    
        gl.activeTexture(gl.TEXTURE);
        gl.bindTexture(gl.TEXTURE_2D, textures[0]);

    // Score
    if (starttime != 0 && time - starttime > 1000.0){
    gl.uniform1f(scrollTexLoc, false);
    if (time - lastTick > 30)
    	{
    		lastTick = time;
    		score += 1;
    	}
    var digit;
    var scoreLeft;
    gl.enable( gl.BLEND);
	gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
	
	digit = Math.floor(score / 100000);
    scoreLeft = score % 100000;
    bindDigit(digit);
    modelViewMatrix = translate(3, 3, -3);
	modelViewMatrix = mult(modelViewMatrix, rotate(90, vec3(1, 0, 0)));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix) );
    gl.drawArrays( gl.TRIANGLES, 24, 6 );
	
    digit = Math.floor(scoreLeft / 10000);
    scoreLeft = scoreLeft % 10000;
    bindDigit(digit);
    modelViewMatrix = translate(3.6, 3, -3);
	modelViewMatrix = mult(modelViewMatrix, rotate(90, vec3(1, 0, 0)));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix) );
    gl.drawArrays( gl.TRIANGLES, 24, 6 );
    
    digit = Math.floor(scoreLeft / 1000);
    scoreLeft = scoreLeft % 1000;
    bindDigit(digit);
    modelViewMatrix = translate(4.2, 3, -3);
	modelViewMatrix = mult(modelViewMatrix, rotate(90, vec3(1, 0, 0)));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix) );
    gl.drawArrays( gl.TRIANGLES, 24, 6 );
    
    digit = Math.floor(scoreLeft / 100);
    scoreLeft = scoreLeft % 100;
    bindDigit(digit);
    modelViewMatrix = translate(4.8, 3, -3);
	modelViewMatrix = mult(modelViewMatrix, rotate(90, vec3(1, 0, 0)));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix) );
    gl.drawArrays( gl.TRIANGLES, 24, 6 );
    
    digit = Math.floor(scoreLeft / 10);
    scoreLeft = scoreLeft % 10;
    bindDigit(digit);
    modelViewMatrix = translate(5.4, 3, -3);
	modelViewMatrix = mult(modelViewMatrix, rotate(90, vec3(1, 0, 0)));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix) );
    gl.drawArrays( gl.TRIANGLES, 24, 6 );
    
    bindDigit(scoreLeft);
    modelViewMatrix = translate(6, 3, -3);
	modelViewMatrix = mult(modelViewMatrix, rotate(90, vec3(1, 0, 0)));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix) );
    gl.drawArrays( gl.TRIANGLES, 24, 6 );
    
    gl.disable(gl.BLEND);
    gl.uniform1f(scrollTexLoc, true);
    }
    
        
    //shadow
    gl.enable( gl.BLEND);
	gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
	gl.uniform1f(scrollTexLoc, false);
	gl.activeTexture(gl.TEXTURE);
    gl.bindTexture(gl.TEXTURE_2D, textures[18]);
    //modelViewMatrix = mult(ViewMatrix, scale(0.2,0.5,0.5));
    modelViewMatrix = mult(ViewMatrix, translate(-0.3+x_move*1.6, -1, -0.45));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix) );
    gl.drawArrays( gl.TRIANGLES, 30, 6 );
	gl.disable(gl.BLEND);
    gl.uniform1f(scrollTexLoc, true);
        

    //draw the objects
    isObject = true;
    gl.uniform1f(isObjectLoc, isObject);

    ViewMatrix = mult(mat4(),translate(0,0,-20+cam_change));


    projectionMatrix = perspective(70+fov_change, canvas.width/canvas.height, 0.1, 100);


    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, textures[5]);
    gl.uniform1i(gl.getUniformLocation(program, "texture"), 0);


    //model matrix for  the head
    ModelMatrix_head= mult(mat4(),scale(0.5+size_change,0.5+size_change,0.5+size_change));
    ModelMatrix_head= mult(mat4(),scale(0.07,0.07,0.07));
    ModelMatrix_head = mult(translate(x_move,-0.31,player_zpos),ModelMatrix_head);
    // possible collision model
    modelArray.push(ModelMatrix_head);
    set_par(ViewMatrix,ModelMatrix_head,projectionMatrix);

    for(var i = 36; i<index+36; i+=3) 
        gl.drawArrays( gl.TRIANGLES, i, 3 );



    //model matrix for  the left leg
    if(object_time%12 == 0){
        angle_left = - angle_left;
        angle_right = - angle_right;
        angle_right_arm = - angle_right_arm;
        angle_left_arm = - angle_left_arm;
    }
    ModelMatrix_left= mult(mat4(),scale(0.04,0.12,0.01));
    ModelMatrix_left = mult(translate(-0.025+x_move,-0.55,player_zpos),ModelMatrix_left);
    ModelMatrix_left = mult(ModelMatrix_left,rotate(angle_left,vec3(1,0,0)));
    // possible collision model
    modelArray.push(ModelMatrix_left);
    set_par(ViewMatrix,ModelMatrix_left,projectionMatrix);
    gl.drawArrays( gl.TRIANGLES, 36+index+numVertices, numVertices );


    //model matrix for  the right leg
    ModelMatrix_right= mult(mat4(),scale(0.04,0.12,0.01));
    ModelMatrix_right = mult(translate(0.025+x_move,-0.55,player_zpos), ModelMatrix_right);
    ModelMatrix_right = mult(ModelMatrix_right,rotate(angle_right,vec3(1,0,0)));
    // possible collision model
    modelArray.push(ModelMatrix_right);
    set_par(ViewMatrix,ModelMatrix_right,projectionMatrix);
    gl.drawArrays( gl.TRIANGLES, 36+index+2*numVertices, numVertices );


    //model matrix for  the body
    ModelMatrix_body= mult(mat4(),scale(0.1,0.15,0.01));
    ModelMatrix_body = mult(translate(x_move,-1+0.55,player_zpos),ModelMatrix_body);
    // possible collision model
    modelArray.push(ModelMatrix_body);
    set_par(ViewMatrix,ModelMatrix_body,projectionMatrix);
    gl.drawArrays( gl.TRIANGLES, index+36, numVertices );


    //model matrix for  the left arm
    ModelMatrix_left_arm= mult(mat4(),scale(0.03,0.11,0.0000001));
    ModelMatrix_left_arm = mult(translate(-0.06+x_move,-0.44,player_zpos), ModelMatrix_left_arm);
    ModelMatrix_left_arm = mult(ModelMatrix_left_arm,rotate(-30,vec3(0,1,0)));
    ModelMatrix_left_arm = mult(ModelMatrix_left_arm,rotate(angle_left_arm,vec3(1,0,0)));
    // possible collision model
    modelArray.push(ModelMatrix_left_arm);
    set_par(ViewMatrix,ModelMatrix_left_arm,projectionMatrix);
    gl.drawArrays( gl.TRIANGLES, 36+index+3*numVertices, numVertices );


    //model matrix for  the right arm
    ModelMatrix_right_arm= mult(mat4(),scale(0.03,0.11,0.0000001));
    ModelMatrix_right_arm = mult(translate(0.06+x_move,-0.44,player_zpos),ModelMatrix_right_arm);
    ModelMatrix_right_arm = mult(ModelMatrix_right_arm,rotate(30,vec3(0,1,0)));
    ModelMatrix_right_arm = mult(ModelMatrix_right_arm,rotate(angle_right_arm,vec3(1,0,0)));
    // possible collision model
    modelArray.push(ModelMatrix_right_arm);
    set_par(ViewMatrix,ModelMatrix_right_arm,projectionMatrix);
    gl.drawArrays( gl.TRIANGLES, 36+index+4*numVertices, numVertices );

    //stone only shows up when in game, not in ready state
    if(game_state ==1 || gameOverScene){
        stone_z = (0.1*object_time%14)+6;
        coin_z = (0.1*object_time%16)+6;
        // set x-coord of new stone to one of the three lanes
        if (stone_z === 6) {
            stone_x = (1.8*Math.floor(Math.random()* 3 - 1));
            switch (stone_x) {
                case -1.8:
                    obstacle_lane = 1;
                    break;
                case 0:
                    obstacle_lane = 2;
                    break;
                case 1.8:
                    obstacle_lane = 3;
                    break;
            }
            console.log("obstacle lane: " + obstacle_lane);
        }

        // coin placement
        if (coin_z === 6) {
            coin_x = (1.8*Math.floor(Math.random()* 3 - 1));
            bonusAddedToScore = false;

            switch (coin_x) {
                case -1.8:
                    coin_lane = 1;
                    break;
                case 0:
                    coin_lane = 2;
                    break;
                case 1.8:
                    coin_lane = 3;
                    break;
            }
        }
        coinrotate+=4;
        //coins
        ModelMatrix_obstacle = translate(coin_x,-1,coin_z);
        
        ModelMatrix_obstacle = mult(ModelMatrix_obstacle, rotate(45,vec3(0,0,1)));
        ModelMatrix_obstacle = mult(ModelMatrix_obstacle, rotate(coinrotate,vec3(1,1,0)));
        ModelMatrix_obstacle = mult(ModelMatrix_obstacle, scale(0.5, 0.5, 0.1));
        
        ModelMatrix_obstacle= mult(ModelMatrix_obstacle,scale(1+size_change,1+size_change,1));
        
        modelArray.push(ModelMatrix_obstacle);
        set_par(ViewMatrix,ModelMatrix_obstacle,projectionMatrix);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, textures[19]);
        gl.uniform1i(gl.getUniformLocation(program, "texture"), 0);
        gl.drawArrays( gl.TRIANGLES, 36+index+5*numVertices, numVertices );
        
        //model matrix for  obstacle
        ModelMatrix_obstacle = translate(stone_x,-1,stone_z);
        ModelMatrix_obstacle= mult(ModelMatrix_obstacle,scale(1+size_change,1+size_change,1));
        //ModelMatrix_obstacle = mult(ModelMatrix_obstacle, scale(1, 1, 0.1));
        // possible collision model
        modelArray.push(ModelMatrix_obstacle);
        set_par(ViewMatrix,ModelMatrix_obstacle,projectionMatrix);

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, textures[6]);
        gl.uniform1i(gl.getUniformLocation(program, "texture"), 0);
        gl.drawArrays( gl.TRIANGLES, 36+index+5*numVertices, numVertices );

         // collision detection
        
        switch (obstacle_lane) {
            case 1:
                if ((player_zpos - (stone_z+1)) <= (1+size_change) && stone_z < 18) {
                    if (x_move <= -0.5) {
                        gameOver();
                    }
                }                
                break;
            case 2:
                if ((player_zpos - (stone_z+1)) <= (1+size_change) && stone_z < 18) {
                    if (x_move >= -0.25 && x_move <= 0.25) {
                        gameOver();
                    }
                }       
                break;
            case 3:
                if ((player_zpos - (stone_z+1)) <= (1+size_change) && stone_z < 18) {
                    if (x_move >= 0.5) {
                        gameOver();
                    }
                }                       
                break;
        }

        switch (coin_lane) {
            case 1:
                if (player_zpos - coin_z <= 1.1 && coin_z < 20) {
                    if (x_move <= -0.75) {
                       document.getElementById('audioCoinBonus').play();
                       coin_x = 100;
                       if (!bonusAddedToScore) {
                        score += 500;
                        bonusAddedToScore = true;
                      }
                    }
                }                
                break;
            case 2:
                if (player_zpos - coin_z <= 1.1 && coin_z < 20) {
                    if (x_move === 0) {
                       document.getElementById('audioCoinBonus').play();
                       coin_x = 100;
                       if (!bonusAddedToScore) {
                        score += 500;
                        bonusAddedToScore = true;
                      }
                    }
                }       
                break;
            case 3:
                if (player_zpos - coin_z <= 1.1 && coin_z < 20) {
                    if (x_move >= 0.75) {
                        document.getElementById('audioCoinBonus').play();
                        coin_x = 100;
                        if (!bonusAddedToScore) {
                          score += 500;
                          bonusAddedToScore = true;
                        }
                    }
                }                       
                break;
        }
    }

    if (!gameOverScene) {
        object_time = object_time + 1;
    }

   
    requestAnimFrame(render);
}
