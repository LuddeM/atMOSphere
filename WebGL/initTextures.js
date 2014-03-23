

/*
    function handleLoadedTexture(texture) {
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texture.image);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.bindTexture(gl.TEXTURE_2D, null);
    }
*/
function handleLoadedTexture(texture) {
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texture.image);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.bindTexture(gl.TEXTURE_2D, null);
}

var earthTexture;
var galvanizedTexture;
var skyboxTexture;
var pillarTexture;
var iceTexture;

function initTextures() {
    earthTexture = gl.createTexture();
    earthTexture.image = new Image();
    earthTexture.image.onload = function () {
        handleLoadedTexture(earthTexture)
    }
    earthTexture.image.src = "textures/earth.jpg";

    galvanizedTexture = gl.createTexture();
    galvanizedTexture.image = new Image();
    galvanizedTexture.image.onload = function () {
        handleLoadedTexture(galvanizedTexture)
    }
    galvanizedTexture.image.src = "textures/arroway.de_metal+structure+06_d100_flat.jpg";


    skyboxTexture = gl.createTexture();
    skyboxTexture.image = new Image();
    skyboxTexture.image.onload = function () {
        handleLoadedTexture(skyboxTexture)
    }
    skyboxTexture.image.src = "textures/blue_space.jpg";


    pillarTexture = gl.createTexture();
    pillarTexture.image = new Image();
    pillarTexture.image.onload = function () {
        handleLoadedTexture(pillarTexture)
    }
    pillarTexture.image.src = "textures/pillar.png";

/*
    iceTexture = gl.createTexture();
    iceTexture.image = new Image();
    pillarTexture.image.onload = function () {
        handleLoadedTexture(iceTexture)
    }
    iceTexture.image.src = "textures/pillar.png";   */      
}