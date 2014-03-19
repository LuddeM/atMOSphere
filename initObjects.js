//En fil där alla objekt som ska användas är definierade, samt dess
//attribut, t.ex massa, maxhastighet och material

  /*========================= Variabler ========================= */

var sphereShine = 32.0, pillarShine = 32.0,mapShine=0.0;

var mass1=1, mass2=1, mass3=1000, xPos1=5, yPos1=0,xPos2=-5, yPos2=0, radius1 = 1, radius2 = 1;

var MaxSpeedDirObj1=0, MaxSpeedDirObj2=0, MaxVelocity=50, xSpeedObj1=0, ySpeedObj1=0,
      xSpeedObj2=0, ySpeedObj2=0, xSpeedObj3=0, ySpeedObj3=0;
      
var xPosIce=0, yPosIce=0, IceRadius=10;

var frictionPlane=0.4, frictionIce=0.0;
var frictionKoeff1=frictionPlane,frictionKoeff2=frictionPlane, friction1, friction2;

var planWidth = 60, planHeight = 30;
var xPosCy1=20, yPosCy1=15, xPosCy2=20,yPosCy2=-15, xPosCy3=-20, yPosCy3=15, xPosCy4=-20, yPosCy4=-15;
var xTemp, yTemp, CylinderCollision1 = false, CylinderCollision2 = false;


var sphereVertexPositionBuffer;
var sphereVertexNormalBuffer;
var sphereVertexTextureCoordBuffer;
var sphereVertexIndexBuffer;

function handleLoadedSphere(sphereData) {
    sphereVertexNormalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, sphereVertexNormalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(sphereData.normals), gl.STATIC_DRAW);
    sphereVertexNormalBuffer.itemSize = 3;
    sphereVertexNormalBuffer.numItems = sphereData.normals.length / 3;

    sphereVertexTextureCoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, sphereVertexTextureCoordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(sphereData.texcoords), gl.STATIC_DRAW);
    sphereVertexTextureCoordBuffer.itemSize = 2;
    sphereVertexTextureCoordBuffer.numItems = sphereData.texcoords.length / 2;

    sphereVertexPositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, sphereVertexPositionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(sphereData.verts), gl.STATIC_DRAW);
    sphereVertexPositionBuffer.itemSize = 3;
    sphereVertexPositionBuffer.numItems = sphereData.verts.length / 3;

    sphereVertexIndexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, sphereVertexIndexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(sphereData.indices), gl.STATIC_DRAW);
    sphereVertexIndexBuffer.itemSize = 1;
    sphereVertexIndexBuffer.numItems = sphereData.indices.length;
}

    var pillarVertexPositionBuffer;
    var pillarVertexNormalBuffer;
    var pillarVertexTextureCoordBuffer;
    var pillarVertexIndexBuffer;

    function handleLoadedPillar(pillarData) {
        
        pillarVertexNormalBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, pillarVertexNormalBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(pillarData.normals), gl.STATIC_DRAW);
        pillarVertexNormalBuffer.itemSize = 3;
        pillarVertexNormalBuffer.numItems = pillarData.normals.length / 3;

        pillarVertexTextureCoordBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, pillarVertexTextureCoordBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(pillarData.texcoords), gl.STATIC_DRAW);
        pillarVertexTextureCoordBuffer.itemSize = 2;
        pillarVertexTextureCoordBuffer.numItems = pillarData.texcoords.length / 2;

        pillarVertexPositionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, pillarVertexPositionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(pillarData.verts), gl.STATIC_DRAW);
        pillarVertexPositionBuffer.itemSize = 3;
        pillarVertexPositionBuffer.numItems = pillarData.verts.length / 3;

        pillarVertexIndexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, pillarVertexIndexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(pillarData.indices), gl.STATIC_DRAW);
        pillarVertexIndexBuffer.itemSize = 1;
        pillarVertexIndexBuffer.numItems = pillarData.indices.length;
    }

    var mapVertexPositionBuffer;
    var mapVertexNormalBuffer;
    var mapVertexTextureCoordBuffer;
    var mapVertexIndexBuffer;

    function handleLoadedMap(mapData) {
        
        mapVertexNormalBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, mapVertexNormalBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(mapData.normals), gl.STATIC_DRAW);
        mapVertexNormalBuffer.itemSize = 3;
        mapVertexNormalBuffer.numItems = mapData.normals.length / 3;

        mapVertexTextureCoordBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, mapVertexTextureCoordBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(mapData.texcoords), gl.STATIC_DRAW);
        mapVertexTextureCoordBuffer.itemSize = 2;
        mapVertexTextureCoordBuffer.numItems = mapData.texcoords.length / 2;

        mapVertexPositionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, mapVertexPositionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(mapData.verts), gl.STATIC_DRAW);
        mapVertexPositionBuffer.itemSize = 3;
        mapVertexPositionBuffer.numItems = mapData.verts.length / 3;

        mapVertexIndexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, mapVertexIndexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(mapData.indices), gl.STATIC_DRAW);
        mapVertexIndexBuffer.itemSize = 1;
        mapVertexIndexBuffer.numItems = mapData.indices.length;
    }    


function loadSpheres() {
        var request = new XMLHttpRequest();
        request.open("GET", "jsonObjects/sphere.json");
        request.onreadystatechange = function () {
            if (request.readyState == 4) {
                handleLoadedSphere(JSON.parse(request.responseText));
            }
        }
        request.send();
    }

    function loadPillars() {
        var request = new XMLHttpRequest();
        request.open("GET", "jsonObjects/pillarfirst.json");
        request.onreadystatechange = function () {
            if (request.readyState == 4) {
                handleLoadedPillar(JSON.parse(request.responseText));
            }
        }
        request.send();
    }    

    function loadMap(){
        var request = new XMLHttpRequest();
        request.open("GET", "jsonObjects/map.json");
        request.onreadystatechange = function () {
            if (request.readyState == 4) {
                handleLoadedMap(JSON.parse(request.responseText));
            }
        }
        request.send();
    }    


