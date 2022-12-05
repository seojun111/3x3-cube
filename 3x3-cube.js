"use strict";

var canvas;
var gl;

var numVertices  = 36; // 정점 개수

var texSize = 256; // texture size
var numChecks = 7; // 3x3 큐브를 만들기 위한 수

var program;

var texture1, texture2;
var t1, t2;

var c;

var flag = true;

var image1 = new Uint8Array(4*texSize*texSize);

    for ( var i = 0; i < texSize; i++ ) {
        for ( var j = 0; j <texSize; j++ ) {
            var patchx = Math.floor(i/(texSize/numChecks));
            if(patchx%2) c = 255;
            else c = 0;
            image1[4*i*texSize+4*j] = c;
            image1[4*i*texSize+4*j+1] = c;
            image1[4*i*texSize+4*j+2] = c;
            image1[4*i*texSize+4*j+3] = 255;
        }
    }

var image2 = new Uint8Array(4*texSize*texSize);

    // Checker board 패턴을 만듬
    for ( var i = 0; i < texSize; i++ ) {
        for ( var j = 0; j <texSize; j++ ) {
            var patchy = Math.floor(j/(texSize/numChecks));
            if(patchy%2) c = 255;
            else c = 0;
            image2[4*i*texSize+4*j] = c;
            image2[4*i*texSize+4*j+1] = c;
            image2[4*i*texSize+4*j+2] = c;
            image2[4*i*texSize+4*j+3] = 255;
           }
    }

var pointsArray = [];
var colorsArray = [];
var texCoordsArray = [];

// texture 조정
var texCoord = [
    vec2(0, 0),
    vec2(0, 1),
    vec2(1, 1),
    vec2(1, 0)
];

// 정점 좌표 배열
var vertices = [
    vec4( -0.5, -0.5,  0.5, 1.0 ),
    vec4( -0.5,  0.5,  0.5, 1.0 ),
    vec4( 0.5,  0.5,  0.5, 1.0 ),
    vec4( 0.5, -0.5,  0.5, 1.0 ),
    vec4( -0.5, -0.5, -0.5, 1.0 ),
    vec4( -0.5,  0.5, -0.5, 1.0 ),
    vec4( 0.5,  0.5, -0.5, 1.0 ),
    vec4( 0.5, -0.5, -0.5, 1.0 )
];

// 색깔 배열
var vertexColors = [
    vec4( 0.0, 0.0, 0.0, 1.0 ),  // black
    vec4( 1.0, 0.0, 0.0, 1.0 ),  // red
    vec4( 1.0, 1.0, 0.0, 1.0 ),  // yellow
    vec4( 0.0, 1.0, 0.0, 1.0 ),  // green
    vec4( 0.0, 0.0, 1.0, 1.0 ),  // blue
    vec4( 1.0, 0.0, 1.0, 1.0 ),  // magenta
    vec4( 0.0, 1.0, 1.0, 1.0 ),  // white
    vec4( 0.0, 1.0, 1.0, 1.0 )   // cyan
];

// x, y, z축 설정
var xAxis = 0;
var yAxis = 1;
var zAxis = 2;
var axis = xAxis;

//각도 설정
var theta = [45.0, 45.0, 45.0];

var thetaLoc;

function configureTexture() { // texture 설정 함수
    texture1 = gl.createTexture(); // 첫번째 texture 생성
    gl.bindTexture( gl.TEXTURE_2D, texture1 ); // 바인딩
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true); // 픽셀 저장 모드 지정
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, texSize, texSize, 0, gl.RGBA, gl.UNSIGNED_BYTE, image1); // 2차원 texture 이미지 지정
    gl.generateMipmap( gl.TEXTURE_2D ); // texture 개체에 대한 mipmap 생성
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER,
                      gl.NEAREST_MIPMAP_LINEAR ); // texture 매개 변수 설정
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST); // texture 매개 변수 설정

    texture2 = gl.createTexture(); // 두번째 texture도 같은 작업 수행
    gl.bindTexture( gl.TEXTURE_2D, texture2 );
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, texSize, texSize, 0, gl.RGBA, gl.UNSIGNED_BYTE, image2);
    gl.generateMipmap( gl.TEXTURE_2D );
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER,
                      gl.NEAREST_MIPMAP_LINEAR );
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
}

function quad(a, b, c, d) { // 점과 색, texture을 설정하는 함수
     pointsArray.push(vertices[a]);
     colorsArray.push(vertexColors[a]);
     texCoordsArray.push(texCoord[0]);

     pointsArray.push(vertices[b]);
     colorsArray.push(vertexColors[a]);
     texCoordsArray.push(texCoord[1]);

     pointsArray.push(vertices[c]);
     colorsArray.push(vertexColors[a]);
     texCoordsArray.push(texCoord[2]);

     pointsArray.push(vertices[a]);
     colorsArray.push(vertexColors[a]);
     texCoordsArray.push(texCoord[0]);

     pointsArray.push(vertices[c]);
     colorsArray.push(vertexColors[a]);
     texCoordsArray.push(texCoord[2]);

     pointsArray.push(vertices[d]);
     colorsArray.push(vertexColors[a]);
     texCoordsArray.push(texCoord[3]);
}

function colorCube() { // quad 함수 이용하여 cube 만들기
    quad( 1, 0, 3, 2 );
    quad( 2, 3, 7, 6 );
    quad( 3, 0, 4, 7 );
    quad( 6, 5, 1, 2 );
    quad( 4, 5, 6, 7 );
    quad( 5, 4, 0, 1 );
}


window.onload = function init() { // init 함수

    canvas = document.getElementById( "gl-canvas" ); // 캔버스 불러오기

    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    gl.viewport( 0, 0, canvas.width, canvas.height ); // 캔버스 뷰포트 설정
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 ); // 배경색 흰색으로 설정

    gl.enable(gl.DEPTH_TEST); // 이 컨텍스트에 대한 특정 WebGL 기능을 사용하도록 설정

    // shader 로드 및 특성 버퍼 초기화
    program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    colorCube(); // cube 만들기

    var cBuffer = gl.createBuffer(); // color 버퍼 생성
    gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer ); // 버퍼 바인딩
    gl.bufferData( gl.ARRAY_BUFFER, flatten(colorsArray), gl.STATIC_DRAW ); // 버퍼 데이터 저장소를 초기화 후 생성

    var vColor = gl.getAttribLocation( program, "vColor" ); // 속성 변수 위치를 반환
    gl.vertexAttribPointer( vColor, 4, gl.FLOAT, false, 0, 0 ); // 현재 gl에 바인딩된 버퍼 바인딩
    gl.enableVertexAttribArray( vColor ); // 정점 속성 배열을 속성 배열 목록으로 설정

    var vBuffer = gl.createBuffer(); // vertices 버퍼도 같은 작업 수행
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData( gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW );

    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    var tBuffer = gl.createBuffer(); // texture 버퍼도 같은 작업 수행
    gl.bindBuffer( gl.ARRAY_BUFFER, tBuffer);
    gl.bufferData( gl.ARRAY_BUFFER, flatten(texCoordsArray), gl.STATIC_DRAW );

    var vTexCoord = gl.getAttribLocation( program, "vTexCoord" );
    gl.vertexAttribPointer( vTexCoord, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vTexCoord );

    configureTexture(); // texture 설정

    gl.activeTexture( gl.TEXTURE0 ); // 활성화할 텍스처 단위 지정 (texture0)
    gl.bindTexture( gl.TEXTURE_2D, texture1 ); // texture 바인딩
    gl.uniform1i(gl.getUniformLocation( program, "Tex0"), 0);

    gl.activeTexture( gl.TEXTURE1 ); // texture1도 같은 작업 수행
    gl.bindTexture( gl.TEXTURE_2D, texture2 );
    gl.uniform1i(gl.getUniformLocation( program, "Tex1"), 1);

    thetaLoc = gl.getUniformLocation(program, "theta");


 document.getElementById("ButtonX").onclick = function(){axis = xAxis;}; // x축 기준 회전 버튼
 document.getElementById("ButtonY").onclick = function(){axis = yAxis;}; // y축 기준 회전 버튼
 document.getElementById("ButtonZ").onclick = function(){axis = zAxis;}; // z축 기준 회전 버튼
 document.getElementById("ButtonT").onclick = function(){flag = !flag;}; // 회전 멈추기

    render(); // 렌더링
}

var render = function() { // 렌더 함수
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    if(flag) theta[axis] += 2.0;
    gl.uniform3fv(thetaLoc, theta);
    gl.drawArrays( gl.TRIANGLES, 0, numVertices );
    requestAnimFrame(render);
}
