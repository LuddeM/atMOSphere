

    var gl;

    function initGL(canvas) {
        try {
            gl = canvas.getContext("experimental-webgl");
            gl.viewportWidth = canvas.width;
            gl.viewportHeight = canvas.height;
        } catch (e) {
        }
        if (!gl) {
            alert("Could not initialise WebGL, sorry :-(");
        }
    }


    function getShader(gl, id) {
        var shaderScript = document.getElementById(id);
        if (!shaderScript) {
            return null;
        }

        var str = "";
        var k = shaderScript.firstChild;
        while (k) {
            if (k.nodeType == 3) {
                str += k.textContent;
            }
            k = k.nextSibling;
        }

        var shader;
        if (shaderScript.type == "x-shader/x-fragment") {
            shader = gl.createShader(gl.FRAGMENT_SHADER);
        } else if (shaderScript.type == "x-shader/x-vertex") {
            shader = gl.createShader(gl.VERTEX_SHADER);
        } else {
            return null;
        }

        gl.shaderSource(shader, str);
        gl.compileShader(shader);

        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            alert(gl.getShaderInfoLog(shader));
            return null;
        }

        return shader;
    }


    var shaderProgram;

    function initShaders() {
        var fragmentShader = getShader(gl, "per-fragment-lighting-fs");
        var vertexShader = getShader(gl, "per-fragment-lighting-vs");

        shaderProgram = gl.createProgram();
        gl.attachShader(shaderProgram, vertexShader);
        gl.attachShader(shaderProgram, fragmentShader);
        gl.linkProgram(shaderProgram);

        if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
            alert("Could not initialise shaders");
        }

        gl.useProgram(shaderProgram);

        shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
        gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);

        shaderProgram.vertexNormalAttribute = gl.getAttribLocation(shaderProgram, "aVertexNormal");
        gl.enableVertexAttribArray(shaderProgram.vertexNormalAttribute);

        shaderProgram.textureCoordAttribute = gl.getAttribLocation(shaderProgram, "aTextureCoord");
        gl.enableVertexAttribArray(shaderProgram.textureCoordAttribute);


        shaderProgram.vMatrixUniform =	gl.getUniformLocation(shaderProgram, "uVMatrix");
        shaderProgram.mMatrixUniform = gl.getUniformLocation(shaderProgram, "uMMatrix");

        
        shaderProgram.pMatrixUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
        //shaderProgram.mvMatrixUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");
        shaderProgram.nMatrixUniform = gl.getUniformLocation(shaderProgram, "uNMatrix");
        shaderProgram.samplerUniform = gl.getUniformLocation(shaderProgram, "uSampler");
        shaderProgram.materialShininessUniform = gl.getUniformLocation(shaderProgram, "uMaterialShininess");
        shaderProgram.showSpecularHighlightsUniform = gl.getUniformLocation(shaderProgram, "uShowSpecularHighlights");
        shaderProgram.useTexturesUniform = gl.getUniformLocation(shaderProgram, "uUseTextures");
        shaderProgram.useLightingUniform = gl.getUniformLocation(shaderProgram, "uUseLighting");
        shaderProgram.ambientColorUniform = gl.getUniformLocation(shaderProgram, "uAmbientColor");
        shaderProgram.pointLightingLocationUniform = gl.getUniformLocation(shaderProgram, "uPointLightingLocation");
        shaderProgram.pointLightingSpecularColorUniform = gl.getUniformLocation(shaderProgram, "uPointLightingSpecularColor");
        shaderProgram.pointLightingDiffuseColorUniform = gl.getUniformLocation(shaderProgram, "uPointLightingDiffuseColor");
    }


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

    function initTextures() {
        earthTexture = gl.createTexture();
        earthTexture.image = new Image();
        earthTexture.image.onload = function () {
            handleLoadedTexture(earthTexture)
        }
        earthTexture.image.src = "earth.jpg";

        galvanizedTexture = gl.createTexture();
        galvanizedTexture.image = new Image();
        galvanizedTexture.image.onload = function () {
            handleLoadedTexture(galvanizedTexture)
        }
        galvanizedTexture.image.src = "arroway.de_metal+structure+06_d100_flat.jpg";
    }

    var mMatrix = mat4.create();
    var vMatrix = mat4.create();

    //var mvMatrix = mat4.create();
    //var mvMatrixStack = [];
    var pMatrix = mat4.create();

    


    function setMatrixUniforms() {


        gl.uniformMatrix4fv(shaderProgram.pMatrixUniform, false, pMatrix);
        //gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, mvMatrix);

        gl.uniformMatrix4fv(shaderProgram.vMatrixUniform, false, vMatrix);
        gl.uniformMatrix4fv(shaderProgram.mMatrixUniform, false, mMatrix);


        var normalMatrix = mat3.create();
        mat4.toInverseMat3(vMatrix, normalMatrix);
        mat3.transpose(normalMatrix);
        gl.uniformMatrix3fv(shaderProgram.nMatrixUniform, false, normalMatrix);
    }

    function degToRad(degrees) {
        return degrees * Math.PI / 180;
    }


    var teapotAngle = 180;

    //För FPS-counter
    /*var time_old=0;
    var fps_time=0;
    var fps_frames=0;
    var dom_counter=document.getElementById("fps_counter");
*/

    function drawScene() {

        
        gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        if (teapotVertexPositionBuffer == null || teapotVertexNormalBuffer == null || teapotVertexTextureCoordBuffer == null || teapotVertexIndexBuffer == null) {
            return;
        }

        mat4.perspective(45, gl.viewportWidth / gl.viewportHeight, 0.1, 100.0, pMatrix);

        var specularHighlights = useSpecularLighting;
        gl.uniform1i(shaderProgram.showSpecularHighlightsUniform, specularHighlights);

        var lighting = useLighting;
        gl.uniform1i(shaderProgram.useLightingUniform, lighting);
        if (lighting) {
            gl.uniform3f(
                shaderProgram.ambientColorUniform,
                parseFloat(ambientR),
                parseFloat(ambientG),
                parseFloat(ambientB)
            );

            gl.uniform3f(
                shaderProgram.pointLightingLocationUniform,
                parseFloat(lightPositionX),
                parseFloat(lightPositionY),
                parseFloat(lightPositionZ)
            );

            gl.uniform3f(
                shaderProgram.pointLightingSpecularColorUniform,
                parseFloat(specularR),
                parseFloat(specularG),
                parseFloat(specularB)
            );

            gl.uniform3f(
                shaderProgram.pointLightingDiffuseColorUniform,
                parseFloat(diffuseR),
                parseFloat(diffuseG),
                parseFloat(diffuseB)
            );
        }

        /*==============SETTING TEXTURES AND DRAW SPHERE 1==============*/
        //var texture = document.getElementById("texture").value;
        var texture = "earth";
        gl.uniform1i(shaderProgram.useTexturesUniform, texture != "none");

        mat4.identity(vMatrix);
        mat4.translate(vMatrix, [0, 0, -40]);
        mat4.rotate(vMatrix,Math.PI/2, [0, 0, 0]);



        mat4.identity(mMatrix);
        
        //console.log("xPos1 is   " + xPos1); 
        
        mat4.translate(mMatrix, [xPos1, yPos1, 0]);
        

        gl.activeTexture(gl.TEXTURE0);
        if (texture == "earth") {
            gl.bindTexture(gl.TEXTURE_2D, earthTexture);
        } else if (texture == "galvanized") {
            gl.bindTexture(gl.TEXTURE_2D, galvanizedTexture);
        }
        gl.uniform1i(shaderProgram.samplerUniform, 0);

        gl.uniform1f(shaderProgram.materialShininessUniform, parseFloat(shininess));

        gl.bindBuffer(gl.ARRAY_BUFFER, teapotVertexPositionBuffer);
        gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, teapotVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, teapotVertexTextureCoordBuffer);
        gl.vertexAttribPointer(shaderProgram.textureCoordAttribute, teapotVertexTextureCoordBuffer.itemSize, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, teapotVertexNormalBuffer);
        gl.vertexAttribPointer(shaderProgram.vertexNormalAttribute, teapotVertexNormalBuffer.itemSize, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, teapotVertexIndexBuffer);
        setMatrixUniforms();
        gl.drawElements(gl.TRIANGLES, teapotVertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);

        /*==============SETTING TEXTURES AND DRAW SPHERE 2==============*/
        mat4.identity(mMatrix);
        mat4.translate(mMatrix, [xPos2, yPos2, 0]);
        
        texture = "galvanized";
        gl.uniform1i(shaderProgram.useTexturesUniform, texture != "none");

        gl.activeTexture(gl.TEXTURE0);
        if (texture == "earth") {
            gl.bindTexture(gl.TEXTURE_2D, earthTexture);
        } else if (texture == "galvanized") {
            gl.bindTexture(gl.TEXTURE_2D, galvanizedTexture);
        }
        gl.uniform1i(shaderProgram.samplerUniform, 0);

        gl.uniform1f(shaderProgram.materialShininessUniform, parseFloat(shininess));

        gl.bindBuffer(gl.ARRAY_BUFFER, teapotVertexPositionBuffer);
        gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, teapotVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, teapotVertexTextureCoordBuffer);
        gl.vertexAttribPointer(shaderProgram.textureCoordAttribute, teapotVertexTextureCoordBuffer.itemSize, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, teapotVertexNormalBuffer);
        gl.vertexAttribPointer(shaderProgram.vertexNormalAttribute, teapotVertexNormalBuffer.itemSize, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, teapotVertexIndexBuffer);
        setMatrixUniforms();
        gl.drawElements(gl.TRIANGLES, teapotVertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);

        /*==============SETTING TEXTURES AND DRAW PILLAR 1==============*/
        
        mat4.identity(mMatrix);
        mat4.translate(mMatrix, [xPosCy1, yPosCy1, 0]);
        
        texture = "none";
        gl.uniform1i(shaderProgram.useTexturesUniform, texture != "none");

        gl.activeTexture(gl.TEXTURE0);
        if (texture == "earth") {
            gl.bindTexture(gl.TEXTURE_2D, earthTexture);
        } else if (texture == "galvanized") {
            gl.bindTexture(gl.TEXTURE_2D, galvanizedTexture);
        }
        gl.uniform1i(shaderProgram.samplerUniform, 0);

        gl.uniform1f(shaderProgram.materialShininessUniform, parseFloat(shininess));

        gl.bindBuffer(gl.ARRAY_BUFFER, pillarVertexPositionBuffer);
        gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, pillarVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, pillarVertexTextureCoordBuffer);
        gl.vertexAttribPointer(shaderProgram.textureCoordAttribute, pillarVertexTextureCoordBuffer.itemSize, gl.FLOAT, false, 0, 0);
        
        gl.bindBuffer(gl.ARRAY_BUFFER, pillarVertexNormalBuffer);
        gl.vertexAttribPointer(shaderProgram.vertexNormalAttribute, pillarVertexNormalBuffer.itemSize, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, pillarVertexIndexBuffer);
        setMatrixUniforms();
        gl.drawElements(gl.TRIANGLES, pillarVertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);


        /*==============SETTING TEXTURES AND DRAW PILLAR 2==============*/
        
        mat4.identity(mMatrix);
        mat4.translate(mMatrix, [xPosCy2, yPosCy2, 0]);
        
        texture = "none";
        gl.uniform1i(shaderProgram.useTexturesUniform, texture != "none");

        gl.activeTexture(gl.TEXTURE0);
        if (texture == "earth") {
            gl.bindTexture(gl.TEXTURE_2D, earthTexture);
        } else if (texture == "galvanized") {
            gl.bindTexture(gl.TEXTURE_2D, galvanizedTexture);
        }
        gl.uniform1i(shaderProgram.samplerUniform, 0);

        gl.uniform1f(shaderProgram.materialShininessUniform, parseFloat(shininess));

        gl.bindBuffer(gl.ARRAY_BUFFER, pillarVertexPositionBuffer);
        gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, pillarVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, pillarVertexTextureCoordBuffer);
        gl.vertexAttribPointer(shaderProgram.textureCoordAttribute, pillarVertexTextureCoordBuffer.itemSize, gl.FLOAT, false, 0, 0);
        
        gl.bindBuffer(gl.ARRAY_BUFFER, pillarVertexNormalBuffer);
        gl.vertexAttribPointer(shaderProgram.vertexNormalAttribute, pillarVertexNormalBuffer.itemSize, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, pillarVertexIndexBuffer);
        setMatrixUniforms();
        gl.drawElements(gl.TRIANGLES, pillarVertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);


        /*==============SETTING TEXTURES AND DRAW PILLAR 3==============*/
        
        mat4.identity(mMatrix);
        mat4.translate(mMatrix, [xPosCy3, yPosCy3, 0]);
        
        texture = "none";
        gl.uniform1i(shaderProgram.useTexturesUniform, texture != "none");

        gl.activeTexture(gl.TEXTURE0);
        if (texture == "earth") {
            gl.bindTexture(gl.TEXTURE_2D, earthTexture);
        } else if (texture == "galvanized") {
            gl.bindTexture(gl.TEXTURE_2D, galvanizedTexture);
        }
        gl.uniform1i(shaderProgram.samplerUniform, 0);

        gl.uniform1f(shaderProgram.materialShininessUniform, parseFloat(shininess));

        gl.bindBuffer(gl.ARRAY_BUFFER, pillarVertexPositionBuffer);
        gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, pillarVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, pillarVertexTextureCoordBuffer);
        gl.vertexAttribPointer(shaderProgram.textureCoordAttribute, pillarVertexTextureCoordBuffer.itemSize, gl.FLOAT, false, 0, 0);
        
        gl.bindBuffer(gl.ARRAY_BUFFER, pillarVertexNormalBuffer);
        gl.vertexAttribPointer(shaderProgram.vertexNormalAttribute, pillarVertexNormalBuffer.itemSize, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, pillarVertexIndexBuffer);
        setMatrixUniforms();
        gl.drawElements(gl.TRIANGLES, pillarVertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);


        /*==============SETTING TEXTURES AND DRAW PILLAR 1==============*/
        
        mat4.identity(mMatrix);
        mat4.translate(mMatrix, [xPosCy4, yPosCy4, 0]);
        
        texture = "none";
        gl.uniform1i(shaderProgram.useTexturesUniform, texture != "none");

        gl.activeTexture(gl.TEXTURE0);
        if (texture == "earth") {
            gl.bindTexture(gl.TEXTURE_2D, earthTexture);
        } else if (texture == "galvanized") {
            gl.bindTexture(gl.TEXTURE_2D, galvanizedTexture);
        }
        gl.uniform1i(shaderProgram.samplerUniform, 0);

        gl.uniform1f(shaderProgram.materialShininessUniform, parseFloat(shininess));

        gl.bindBuffer(gl.ARRAY_BUFFER, pillarVertexPositionBuffer);
        gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, pillarVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, pillarVertexTextureCoordBuffer);
        gl.vertexAttribPointer(shaderProgram.textureCoordAttribute, pillarVertexTextureCoordBuffer.itemSize, gl.FLOAT, false, 0, 0);
        
        gl.bindBuffer(gl.ARRAY_BUFFER, pillarVertexNormalBuffer);
        gl.vertexAttribPointer(shaderProgram.vertexNormalAttribute, pillarVertexNormalBuffer.itemSize, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, pillarVertexIndexBuffer);
        setMatrixUniforms();
        gl.drawElements(gl.TRIANGLES, pillarVertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);



        /*
        var time_now = new Date().getTime();
        var h=time_now-time_old;

        fps_time+=h;
        fps_frames++;

        if (fps_time>1000) {
      
            var fps=1000 * fps_frames/fps_time;
      
            dom_counter.innerHTML=Math.round(fps) + " FPS";
      
            fps_time = fps_frames = 0;
        }

        time_old=time_now;*/
    }


    var lastTime = 0;

    function animate() {
        var timeNow = new Date().getTime();
        if (lastTime != 0) {
            var dt = (timeNow - lastTime)/1000;
            //var dt = 0.01;

            //console.log(dt); 
            
            if(xSpeedObj1>MaxVelocity)
                xSpeedObj1=MaxVelocity;

            if(ySpeedObj1>MaxVelocity)
                ySpeedObj1=MaxVelocity;

            if(xSpeedObj2>MaxVelocity)
                xSpeedObj2=MaxVelocity;

            if(ySpeedObj2>MaxVelocity)
                ySpeedObj2=MaxVelocity;

            handleKeys(dt);

            /*==============OBJECT1 FRICTION==================*/

            //Man tar fram en normerad vektor som beskriver längdförhållandena, men med
            //längden 1, sedan tar man den multiplicerat med friktionskonstanten*tidsskillnad
            if(xSpeedObj1!=0||ySpeedObj1!=0){
              var normalize = Math.sqrt(Math.pow((xSpeedObj1),2)+Math.pow((ySpeedObj1),2));
              var xComponent = xSpeedObj1/normalize;
              var yComponent = ySpeedObj1/normalize;
              friction1=FrictionKoeff1*9.81*mass1; 
              xSpeedObj1 -= xComponent*friction1*dt;
              ySpeedObj1 -= yComponent*friction1*dt;
            }        

            /*==============OBJECT2 FRICTION==================*/

            //Man tar fram en normerad vektor som beskriver längdförhållandena, men med
            //längden 1, sedan tar man den multiplicerat med friktionskonstanten*tidsskillnad
            if(xSpeedObj2!=0||ySpeedObj2!=0){
              var normalize = Math.sqrt(Math.pow((xSpeedObj2),2)+Math.pow((ySpeedObj2),2));
              var xComponent = xSpeedObj2/normalize;
              var yComponent = ySpeedObj2/normalize;
              friction2=FrictionKoeff2*9.81*mass2;
              xSpeedObj2 -= xComponent*friction2*dt;
              ySpeedObj2 -= yComponent*friction2*dt;
            }
            /*==============CHECKING IF COLLISION==============*/

            // Between sphere and sphere
            if(Math.sqrt(Math.pow((xPos1-xPos2),2)+Math.pow((yPos1-yPos2),2)) <= (radius1+radius2))
            {
                var velocityArray = COLLISION.calculateNewSpeed(xSpeedObj1,ySpeedObj1,xSpeedObj2,ySpeedObj2,xPos1,yPos1,xPos2,yPos2,mass1,mass2);
                xSpeedObj1 = velocityArray[0];
                ySpeedObj1 = velocityArray[1];
                xSpeedObj2 = velocityArray[2];
                ySpeedObj2 = velocityArray[3];
                //console.log(ySpeedObj1);
            }

		    // Between sphere1 and cylinders
		    if(Math.sqrt(Math.pow((xPos1-xPosCy1),2)+Math.pow((yPos1-yPosCy1),2)) <= (radius1+radius2))
		        xTemp=xPosCy1, yTemp=yPosCy1, CylinderCollision1= true;
		    if(Math.sqrt(Math.pow((xPos1-xPosCy2),2)+Math.pow((yPos1-yPosCy2),2)) <= (radius1+radius2))
		        xTemp=xPosCy2, yTemp=yPosCy2, CylinderCollision1= true; 
		    if(Math.sqrt(Math.pow((xPos1-xPosCy3),2)+Math.pow((yPos1-yPosCy3),2)) <= (radius1+radius2))
		        xTemp=xPosCy3, yTemp=yPosCy3, CylinderCollision1= true;
		    if(Math.sqrt(Math.pow((xPos1-xPosCy4),2)+Math.pow((yPos1-yPosCy4),2)) <= (radius1+radius2))
		        xTemp=xPosCy4, yTemp=yPosCy4, CylinderCollision1= true;
		    if(CylinderCollision1==true){
		        var velocityArray = COLLISION.calculateNewSpeed(xSpeedObj1,ySpeedObj1,xSpeedObj3,ySpeedObj3,xPos1,yPos1,xTemp,yTemp,mass1,mass3);
		        xSpeedObj1 = velocityArray[0];
		        ySpeedObj1 = velocityArray[1];
		        xSpeedObj3 = velocityArray[2];
		        ySpeedObj3 = velocityArray[3];
		        CylinderCollision1=false;
		        //console.log(ySpeedObj1);
		    }
		    // Between sphere2 and cylinders
		    if(Math.sqrt(Math.pow((xPos2-xPosCy1),2)+Math.pow((yPos2-yPosCy1),2)) <= (radius1+radius2))
		        xTemp=xPosCy1, yTemp=yPosCy1, CylinderCollision2= true;
		    if(Math.sqrt(Math.pow((xPos2-xPosCy2),2)+Math.pow((yPos2-yPosCy2),2)) <= (radius1+radius2))
		        xTemp=xPosCy2, yTemp=yPosCy2, CylinderCollision2= true; 
		    if(Math.sqrt(Math.pow((xPos2-xPosCy3),2)+Math.pow((yPos2-yPosCy3),2)) <= (radius1+radius2))
		        xTemp=xPosCy3, yTemp=yPosCy3, CylinderCollision2= true;
		    if(Math.sqrt(Math.pow((xPos2-xPosCy4),2)+Math.pow((yPos2-yPosCy4),2)) <= (radius1+radius2))
		        xTemp=xPosCy4, yTemp=yPosCy4, CylinderCollision2= true;
		    if(CylinderCollision2==true){
		        var velocityArray = COLLISION.calculateNewSpeed(xSpeedObj2,ySpeedObj2,xSpeedObj3,ySpeedObj3,xPos2,yPos2,xTemp,yTemp,mass2,mass3);
		        xSpeedObj2 = velocityArray[0];
		        ySpeedObj2 = velocityArray[1];
		        xSpeedObj3 = velocityArray[2];
		        ySpeedObj3 = velocityArray[3];
		        CylinderCollision2=false;
		        //console.log(ySpeedObj1);
		    }            

            //ySpeedObj1+=16*dt;

            //Calculates new positions
            dX1=xSpeedObj1*dt;
            dY1=ySpeedObj1*dt;

            xPos1+=dX1, yPos1+=dY1;

            dX2=xSpeedObj2*dt;
            dY2=ySpeedObj2*dt;

            xPos2+=dX2, yPos2+=dY2; 

            //Is Objekt 1
            if(Math.sqrt(Math.pow((xPosIce-xPos1),2)+Math.pow((yPosIce-yPos1),2)) < IceRadius){
                FrictionKoeff1=frictionIce;
            }
            else
                FrictionKoeff1=frictionPlane;

            //Is Objekt 1
            if(Math.sqrt(Math.pow((xPosIce-xPos2),2)+Math.pow((yPosIce-yPos2),2)) < IceRadius){
                FrictionKoeff2=frictionIce;
            }
            else
                FrictionKoeff2=frictionPlane;


        	//Game over
    		if(xPos1 > planWidth/2 || xPos1 < -planWidth/2 || yPos1 >planHeight/2 || yPos1 < -planHeight/2 || xPos2 > planWidth/2 || xPos2 < -planWidth/2 || yPos2 >planHeight/2 || yPos2 < -planHeight/2){
      			alert("Game Over! Start New Game");
      			location.reload();
    		}

        }
        lastTime = timeNow;
    }


    function tick() {
        //requestAnimFrame(tick);
        animate();
        drawScene();

        
    }


    function webGLStart() {
        var canvas = document.getElementById("LitheMos");
        canvas.width=window.innerWidth;
        canvas.height=window.innerHeight;

        //Handling keypress
        document.onkeydown = handleKeyDown;
        document.onkeyup = handleKeyUp;

        initGL(canvas);
        initShaders();
        initTextures();
        loadSpheres();
        loadPillars();

        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.enable(gl.DEPTH_TEST);

        setInterval(tick,1000/60);
    }

