
if ( !window.requestAnimationFrame ) {
  window.requestAnimationFrame = ( function() {
    return window.webkitRequestAnimationFrame ||
      window.mozRequestAnimationFrame ||
      window.oRequestAnimationFrame ||
      window.msRequestAnimationFrame;
  } )();
};



//Den funktionen som körs när sidan startas
var main=function() {
  var CANVAS=document.getElementById("your_canvas");
  CANVAS.width=window.innerWidth;
  CANVAS.height=window.innerHeight;

  /*========================= GET WEBGL CONTEXT ========================= */
  try {
    var GL = CANVAS.getContext("experimental-webgl", {antialias: true});
  } catch (e) {
    alert("You are not webgl compatible :(") ;
    return false;
  } ;

  
  /*========================= SHADERS ========================= */
  
  var shader_vertex_source="\n\
attribute vec3 position;\n\
uniform mat4 Pmatrix;\n\
uniform mat4 Vmatrix;\n\
uniform mat4 Mmatrix;\n\
attribute vec3 color; //the color of the point\n\
varying vec3 vColor;\n\
void main(void) { //pre-built function\n\
gl_Position = Pmatrix*Vmatrix*Mmatrix*vec4(position, 1.);\n\
vColor=color;\n\
}";
  
  var shader_fragment_source="\n\
precision mediump float;\n\
varying vec3 vColor;\n\
void main(void) {\n\
gl_FragColor = vec4(vColor, 1.);\n\
}";
  
  var get_shader=function(source, type, typeString) {
    var shader = GL.createShader(type);
    GL.shaderSource(shader, source);
    GL.compileShader(shader);
    if (!GL.getShaderParameter(shader, GL.COMPILE_STATUS)) {
      alert("ERROR IN "+typeString+ " SHADER : " + GL.getShaderInfoLog(shader));
      return false;
    }
    return shader;
  };
  
  var shader_vertex=get_shader(shader_vertex_source, GL.VERTEX_SHADER, "VERTEX");
  var shader_fragment=get_shader(shader_fragment_source, GL.FRAGMENT_SHADER, "FRAGMENT");
  
  var SHADER_PROGRAM=GL.createProgram();
  GL.attachShader(SHADER_PROGRAM, shader_vertex);
  GL.attachShader(SHADER_PROGRAM, shader_fragment);
  
  GL.linkProgram(SHADER_PROGRAM);
  
  var _Pmatrix = GL.getUniformLocation(SHADER_PROGRAM, "Pmatrix");
  var _Vmatrix = GL.getUniformLocation(SHADER_PROGRAM, "Vmatrix");
  var _Mmatrix = GL.getUniformLocation(SHADER_PROGRAM, "Mmatrix");

  
  var _color = GL.getAttribLocation(SHADER_PROGRAM, "color");
  var _position = GL.getAttribLocation(SHADER_PROGRAM, "position");
  
  GL.enableVertexAttribArray(_color);
  GL.enableVertexAttribArray(_position);
  
  GL.useProgram(SHADER_PROGRAM);
  
  
  /*========================= MATRICES ========================= */
  
  //Default values for the matrices, E/I etc
  var PROJMATRIX=LIBS.get_projection(40, CANVAS.width/CANVAS.height, 1, 100);
  var MOVEMATRIX1=LIBS.get_I4();
  var MOVEMATRIX2=LIBS.get_I4();
  var MOVEMATRIX3=LIBS.get_I4();
  var VIEWMATRIX=LIBS.get_I4();
  

  LIBS.translateZ(VIEWMATRIX, -70);
  
  /*========================= INITBUFFERS OBJECTS ========================= */

  var CUBE_VERTEX= GL.createBuffer ();
  GL.bindBuffer(GL.ARRAY_BUFFER, CUBE_VERTEX);
  GL.bufferData(GL.ARRAY_BUFFER,
                new Float32Array(cube_vertex),
                GL.STATIC_DRAW);

  var CUBE_FACES= GL.createBuffer ();
  GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, CUBE_FACES);
  GL.bufferData(GL.ELEMENT_ARRAY_BUFFER,
                new Uint16Array(cube_faces),
                GL.STATIC_DRAW);


  /*========================= DRAWING ========================= */
  //Resetting the canvas
  GL.enable(GL.DEPTH_TEST);
  GL.depthFunc(GL.LEQUAL);
  GL.clearColor(0.0, 0.0, 0.0, 0.0);
  GL.clearDepth(1.0);


  //Handling keypress
  document.onkeydown = handleKeyDown;
  document.onkeyup = handleKeyUp;



  var animate=function() {

    if(xSpeedObj1>MaxVelocity)
      xSpeedObj1=MaxVelocity;

    if(ySpeedObj1>MaxVelocity)
      ySpeedObj1=MaxVelocity;

    if(xSpeedObj2>MaxVelocity)
      xSpeedObj2=MaxVelocity;

    if(ySpeedObj2>MaxVelocity)
      ySpeedObj2=MaxVelocity;

    time= Date.now();

    var dt=(time-timeOld)/1000;
    handleKeys(dt);

    timeOld=time;

    GL.viewport(0.0, 0.0, CANVAS.width, CANVAS.height);
    GL.clear(GL.COLOR_BUFFER_BIT | GL.DEPTH_BUFFER_BIT);
    GL.uniformMatrix4fv(_Pmatrix, false, PROJMATRIX);
    GL.uniformMatrix4fv(_Vmatrix, false, VIEWMATRIX);
    GL.vertexAttribPointer(_position, 3, GL.FLOAT, false,4*(3+3),0) ;
    GL.vertexAttribPointer(_color, 3, GL.FLOAT, false,4*(3+3),3*4) ;

    /*==============OBJECT1 FRICTION==================*/

    // Calculating direction with maximum speed
    // if((xSpeedObj1*xSpeedObj1)<=(ySpeedObj1*ySpeedObj1))
    //   MaxSpeedDirObj1=ySpeedObj1;
    
    // else if((xSpeedObj1*xSpeedObj1)>(ySpeedObj1*ySpeedObj1))
    //   MaxSpeedDirObj1=xSpeedObj1;
    
    // // Making sure the MaxSpeed is positive
    // if(MaxSpeedDirObj1<0)
    //   MaxSpeedDirObj1=MaxSpeedDirObj1*(-1);
  
    // //Removing the speed component of the friction after normalizing
    // if(xSpeedObj1!=0 && MaxSpeedDirObj1!=0)
    //   xSpeedObj1-=(xSpeedObj1/MaxSpeedDirObj1)*friction1*dt;
    
    // if(ySpeedObj1!=0 && MaxSpeedDirObj1!=0)
    //   ySpeedObj1-=(ySpeedObj1/MaxSpeedDirObj1)*friction1*dt;


    //====================DISKUTERA FRIKTIONSLÖSNINGAR=================================//
    //Jag tror personligen att denna lösning är mer fysikaliska korrekt, detta kan
    //vi diskutera imorgon. Så som jag uppfattat det delar man bara på det största
    //värdet av x och y, det betyder att friktionen kommer ha en uppdelning som
    //överstiger 1 när den borde ha en uppdelning där totalen blir 1?


    //Man tar fram en normerad vektor som beskriver längdförhållandena, men med
    //längden 1, sedan tar man den multiplicerat med friktionskonstanten*tidsskillnad
    if(xSpeedObj1!=0||ySpeedObj1!=0){
      var normalize = Math.sqrt(Math.pow((xSpeedObj1),2)+Math.pow((ySpeedObj1),2));
      var xComponent = xSpeedObj1/normalize;
      var yComponent = ySpeedObj1/normalize;
      friction1=FrictionKoeff*9.81; 
      xSpeedObj1 -= xComponent*friction1*dt;
      ySpeedObj1 -= yComponent*friction1*dt;
    }
    


    /*==============OBJECT2 FRICTION==================*/

    //Variables affecting Sphere 2
    // if((xSpeedObj2*xSpeedObj2)<=(ySpeedObj2*ySpeedObj2))
    //   MaxSpeedDirObj2=ySpeedObj2;
    
    // else if((xSpeedObj2*xSpeedObj2)>(ySpeedObj2*ySpeedObj2))
    //   MaxSpeedDirObj2=xSpeedObj2;
    
    // if(MaxSpeedDirObj2<0)
    //   MaxSpeedDirObj2=MaxSpeedDirObj2*(-1);
  
    // if(xSpeedObj2!=0 && MaxSpeedDirObj2!=0)
    //   xSpeedObj2-=(xSpeedObj2/MaxSpeedDirObj2)*friction2*dt;
    
    // if(ySpeedObj2!=0 && MaxSpeedDirObj2!=0)
    //   ySpeedObj2-=(ySpeedObj2/MaxSpeedDirObj2)*friction2*dt;


    //Man tar fram en normerad vektor som beskriver längdförhållandena, men med
    //längden 1, sedan tar man den multiplicerat med friktionskonstanten*tidsskillnad
    if(xSpeedObj2!=0||ySpeedObj2!=0){
      var normalize = Math.sqrt(Math.pow((xSpeedObj2),2)+Math.pow((ySpeedObj2),2));
      var xComponent = xSpeedObj2/normalize;
      var yComponent = ySpeedObj2/normalize;
      friction2=FrictionKoeff*9.81;
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


    dX1=xSpeedObj1*dt;
    dY1=ySpeedObj1*dt;

    xPos1+=dX1, yPos1+=dY1;

    dX2=xSpeedObj2*dt;
    dY2=ySpeedObj2*dt;

    xPos2+=dX2, yPos2+=dY2;

    //Bugg har uppstått när kuberna träffar av varandra snett, mickes förslag är att man
        //flyttar isär kuberna om de råkar gå ihop. Man kan använda sig av normalriktningen
        //mellan sfärerna för att räkna ut var de kom ifrån, eller så kör man i chrome
    if(Math.sqrt(Math.pow((xPos1-xPos2),2)+Math.pow((yPos1-yPos2),2))<(radius1+radius2)){
          
        var positionArray = COLLISION.moveOutObject(xPos1,yPos1,xPos2,yPos2,radius1,radius2);
        dX1 = positionArray[0];
        dY1 = positionArray[1];
        dX2 = positionArray[2];
        dY2 = positionArray[3];

    }

    // Move Sphere 1
    LIBS.set_I4(MOVEMATRIX1);
    LIBS.translate(MOVEMATRIX1,xPos1,yPos1,0);
    
    //ritar ut Sphere 1
    GL.uniformMatrix4fv(_Mmatrix, false, MOVEMATRIX1);
    GL.bindBuffer(GL.ARRAY_BUFFER, CUBE_VERTEX);
    GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, CUBE_FACES);
    GL.drawElements(GL.TRIANGLES, 6*2*3, GL.UNSIGNED_SHORT, 0);
    

    // Move Sphere 2
    LIBS.set_I4(MOVEMATRIX2);
    LIBS.translate(MOVEMATRIX2,xPos2, yPos2,0);

    //ritar ut Sphere 2
    GL.uniformMatrix4fv(_Mmatrix, false, MOVEMATRIX2);
    GL.bindBuffer(GL.ARRAY_BUFFER, CUBE_VERTEX);
    GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, CUBE_FACES);
    GL.drawElements(GL.TRIANGLES, 6*2*3, GL.UNSIGNED_SHORT, 0);

    //ritar ut Cylinder 1
    LIBS.set_I4(MOVEMATRIX3);
    LIBS.translate(MOVEMATRIX3,10,10,0);

    GL.uniformMatrix4fv(_Mmatrix, false, MOVEMATRIX3);
    GL.bindBuffer(GL.ARRAY_BUFFER, CUBE_VERTEX);
    GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, CUBE_FACES);
    GL.drawElements(GL.TRIANGLES, 6*2*3, GL.UNSIGNED_SHORT, 0);

    //ritar ut Cylinder 2
    LIBS.set_I4(MOVEMATRIX3);
    LIBS.translate(MOVEMATRIX3,-10,-10,0);

    GL.uniformMatrix4fv(_Mmatrix, false, MOVEMATRIX3);
    GL.bindBuffer(GL.ARRAY_BUFFER, CUBE_VERTEX);
    GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, CUBE_FACES);
    GL.drawElements(GL.TRIANGLES, 6*2*3, GL.UNSIGNED_SHORT, 0);

    //ritar ut Cylinder 3
    LIBS.set_I4(MOVEMATRIX3);
    LIBS.translate(MOVEMATRIX3,-10,10,0);

    GL.uniformMatrix4fv(_Mmatrix, false, MOVEMATRIX3);
    GL.bindBuffer(GL.ARRAY_BUFFER, CUBE_VERTEX);
    GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, CUBE_FACES);
    GL.drawElements(GL.TRIANGLES, 6*2*3, GL.UNSIGNED_SHORT, 0);

    //ritar ut Cylinder 4
    LIBS.set_I4(MOVEMATRIX3);
    LIBS.translate(MOVEMATRIX3,10,-10,0);

    GL.uniformMatrix4fv(_Mmatrix, false, MOVEMATRIX3);
    GL.bindBuffer(GL.ARRAY_BUFFER, CUBE_VERTEX);
    GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, CUBE_FACES);
    GL.drawElements(GL.TRIANGLES, 6*2*3, GL.UNSIGNED_SHORT, 0);

    //Is      
    if(Math.sqrt(Math.pow((xPosIce-xPos1),2)+Math.pow((yPosIce-yPos1),2)) < IceRadius){
      FrictionKoeff=0;
    }
    if(Math.sqrt(Math.pow((xPosIce-xPos1),2)+Math.pow((yPosIce-yPos1),2)) > IceRadius){
      FrictionKoeff=0.4;
    }

    //Game over
    if(xPos1 > 50 || xPos1 < -50 || yPos1 >25 || yPos1 < -25 || xPos2 > 50 || xPos2 < -50 || yPos2 >25 || yPos2 < -25){
      alert("Game Over! Start New Game");
      location.reload();
    }

    GL.flush();
    //Seems to be what is resetting it all
    //window.requestAnimationFrame(animate);
  }
  //Starts animations with time 0
  //animate(0);
  var timeOld = Date.now();
  setInterval(animate,1);

}