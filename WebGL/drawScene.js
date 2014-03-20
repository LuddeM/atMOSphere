    function drawScene() {

        
        gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        if (sphereVertexPositionBuffer == null || sphereVertexNormalBuffer == null || sphereVertexTextureCoordBuffer == null || sphereVertexIndexBuffer == null) {
            return;
        }
        //Setting the perspective and the view
        mat4.perspective(pMatrix,45, gl.viewportWidth / gl.viewportHeight, 0.1, 1000.0, pMatrix);
        mat4.identity(vMatrix);
        mat4.rotate(vMatrix, vMatrix,-Math.PI/4, [1, 0, 0]);
        mat4.translate(vMatrix,vMatrix, [0, 50, -50]);

        //Setting the camera position
        var camera = vec4.create();
        vec4.transformMat4(camera,camera,vMatrix);
        gl.uniform4fv(shaderProgram.cameraPositionUniform,camera);


        //Setting the light position
        var lightPos = vec3.create();
        var translateLight = mat4.create();
        mat4.translate(translateLight,translateLight,[50.0 , -50.0 ,60.0]);
        vec3.transformMat4(lightPos, lightPos, translateLight);
        vec3.transformMat4(lightPos, lightPos, vMatrix);


        gl.uniform1i(shaderProgram.showSpecularHighlightsUniform, true);
        gl.uniform1i(shaderProgram.useLightingUniform, true);

        //Setting the position for the lightSource, 3fv = vector?
        gl.uniform3fv(shaderProgram.pointLightingLocationUniform,lightPos);
        gl.uniform3f(shaderProgram.ambientColorUniform,0.2,0.2,0.2);
        gl.uniform3f(shaderProgram.pointLightingSpecularColorUniform,0.8,0.8,0.8);
        gl.uniform3f(shaderProgram.pointLightingDiffuseColorUniform,0.8,0.8,0.8);
 

      

        /*==============SET TEXTURES,POSITION AND DRAW ALL SPHERES==============*/

        drawSphere(vec3.fromValues(xPos1,yPos1,1),0,[0,0,0],"earth");
        drawSphere(vec3.fromValues(xPos2,yPos2,1),0,[0,0,0],"galvanized");

        /*==============SET TEXTURES,POSITION AND DRAW ALL PILLARS==============*/

        drawPillar(vec3.fromValues(xPosCy1,yPosCy1,0),Math.PI/2,[1,0,0],"earth");
        drawPillar(vec3.fromValues(xPosCy2,yPosCy2,0),Math.PI/2,[1,0,0],"earth");
        drawPillar(vec3.fromValues(xPosCy3,yPosCy3,0),Math.PI/2,[1,0,0],"earth");
        drawPillar(vec3.fromValues(xPosCy4,yPosCy4,0),Math.PI/2,[1,0,0],"earth");
        

        /*==============SETTING TEXTURES AND DRAW Map==============*/
        
        mat4.identity(mMatrix);
        mat4.rotate(mMatrix, mMatrix,Math.PI/2, [1, 0, 0]);

        texture = "earth";
        gl.uniform1i(shaderProgram.useTexturesUniform, texture != "none");

        gl.activeTexture(gl.TEXTURE0);
        /*
        if (texture == "earth") {
            gl.bindTexture(gl.TEXTURE_2D, earthTexture);
        } else if (texture == "galvanized") {
            gl.bindTexture(gl.TEXTURE_2D, galvanizedTexture);
        }
        */
        gl.bindTexture(gl.TEXTURE_2D, galvanizedTexture);
        gl.uniform1i(shaderProgram.samplerUniform, 0);

        gl.uniform1f(shaderProgram.materialShininessUniform, parseFloat(mapShine));

        gl.bindBuffer(gl.ARRAY_BUFFER, mapVertexPositionBuffer);
        gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, mapVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, mapVertexTextureCoordBuffer);
        gl.vertexAttribPointer(shaderProgram.textureCoordAttribute, mapVertexTextureCoordBuffer.itemSize, gl.FLOAT, false, 0, 0);
        
        gl.bindBuffer(gl.ARRAY_BUFFER, mapVertexNormalBuffer);
        gl.vertexAttribPointer(shaderProgram.vertexNormalAttribute, mapVertexNormalBuffer.itemSize, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, mapVertexIndexBuffer);

        setMatrixUniforms();
        gl.drawElements(gl.TRIANGLES, mapVertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);


        /*==============SETTING TEXTURES AND DRAW SKYBOX==============*/


        mat4.identity(mMatrix);
        //mat4.rotate(mMatrix,mMatrix,Math.PI/2,[1,0,0]);
        //mat4.rotate(mMatrix,mMatrix,Math.PI,[0,1,0]);
        mat4.scale(mMatrix,mMatrix, [20, 20, 20]);

        gl.uniform1i(shaderProgram.useTexturesUniform, texture != "none");

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, skyboxTexture);

        gl.uniform1i(shaderProgram.samplerUniform, 0);
        gl.uniform1f(shaderProgram.materialShininessUniform, parseFloat(0));

        gl.bindBuffer(gl.ARRAY_BUFFER, skyboxVertexPositionBuffer);
        gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, skyboxVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, skyboxVertexTextureCoordBuffer);
        gl.vertexAttribPointer(shaderProgram.textureCoordAttribute, skyboxVertexTextureCoordBuffer.itemSize, gl.FLOAT, false, 0, 0);
        
        gl.bindBuffer(gl.ARRAY_BUFFER, skyboxVertexNormalBuffer);
        gl.vertexAttribPointer(shaderProgram.vertexNormalAttribute, skyboxVertexNormalBuffer.itemSize, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, skyboxVertexIndexBuffer);

        setMatrixUniforms();
        gl.drawElements(gl.TRIANGLES, skyboxVertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
    }

    function drawSphere(translation,rotation,axis,texture){

        mat4.identity(mMatrix);
        mat4.translate(mMatrix,mMatrix, translation);
        mat4.rotate(mMatrix,mMatrix,rotation, axis);

        gl.uniform1i(shaderProgram.useTexturesUniform, texture != "none");

        gl.activeTexture(gl.TEXTURE0);
        if (texture == "earth") {
            gl.bindTexture(gl.TEXTURE_2D, earthTexture);
        } else if (texture == "galvanized") {
            gl.bindTexture(gl.TEXTURE_2D, galvanizedTexture);
        }
        gl.uniform1i(shaderProgram.samplerUniform, 0);

        gl.uniform1f(shaderProgram.materialShininessUniform, parseFloat(sphereShine));

        gl.bindBuffer(gl.ARRAY_BUFFER, sphereVertexPositionBuffer);
        gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, sphereVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, sphereVertexTextureCoordBuffer);
        gl.vertexAttribPointer(shaderProgram.textureCoordAttribute, sphereVertexTextureCoordBuffer.itemSize, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, sphereVertexNormalBuffer);
        gl.vertexAttribPointer(shaderProgram.vertexNormalAttribute, sphereVertexNormalBuffer.itemSize, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, sphereVertexIndexBuffer);
        setMatrixUniforms();
        gl.drawElements(gl.TRIANGLES, sphereVertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);


    }

    function drawPillar(translation,rotation,axis,texture) {

        mat4.identity(mMatrix);
        mat4.translate(mMatrix, mMatrix, translation);
        mat4.rotate(mMatrix,mMatrix,rotation, axis);

        gl.uniform1i(shaderProgram.useTexturesUniform, texture != "none");

        gl.activeTexture(gl.TEXTURE0);
        if (texture == "earth") {
            gl.bindTexture(gl.TEXTURE_2D, earthTexture);
        } else if (texture == "galvanized") {
            gl.bindTexture(gl.TEXTURE_2D, galvanizedTexture);
        }
        gl.uniform1i(shaderProgram.samplerUniform, 0);

        gl.uniform1f(shaderProgram.materialShininessUniform, parseFloat(pillarShine));

        gl.bindBuffer(gl.ARRAY_BUFFER, pillarVertexPositionBuffer);
        gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, pillarVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, pillarVertexTextureCoordBuffer);
        gl.vertexAttribPointer(shaderProgram.textureCoordAttribute, pillarVertexTextureCoordBuffer.itemSize, gl.FLOAT, false, 0, 0);
        
        gl.bindBuffer(gl.ARRAY_BUFFER, pillarVertexNormalBuffer);
        gl.vertexAttribPointer(shaderProgram.vertexNormalAttribute, pillarVertexNormalBuffer.itemSize, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, pillarVertexIndexBuffer);

        setMatrixUniforms();
        gl.drawElements(gl.TRIANGLES, pillarVertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);

    }