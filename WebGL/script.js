

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

    var teapotAngle = 180;

    //För FPS-counter
    /*var time_old=0;
    var fps_time=0;
    var fps_frames=0;
    var dom_counter=document.getElementById("fps_counter");
*/


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
        loadMap();
        loadSkybox();

        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.enable(gl.DEPTH_TEST);

        //tick();
        setInterval(tick,1000/60);
    }

