/*Denna fil hanterar de key events som finns i

/*========================= CAPTURE KEY EVENTS ========================= */
  


    var dX1=0, dY1=0, dX2=0, dY2=0;
    var force=16;
    var currentlyPressedKeys = {};


    //Handles
    function handleKeyDown(e) {
       currentlyPressedKeys[e.keyCode] = true;
    }

    function handleKeyUp(e) {
        currentlyPressedKeys[e.keyCode] = false;
    }

    var xSpeedObj1=0, ySpeedObj1=0, xSpeedObj2=0, ySpeedObj2=0,
        FrictionKoeff=0.3, 
        friction1=FrictionKoeff*9.81; 
        friction2=FrictionKoeff*9.81;

    function handleKeys(dt) {

        //Lägg till så man har en force istället
  
       // UP,DOWN,LEFT,RIGHT controls
        if (currentlyPressedKeys[37]) {
            // Left cursor key
            xSpeedObj1-=(force/mass1)*dt;
        }
        if (currentlyPressedKeys[39]) {
            // Right cursor key
            xSpeedObj1 +=(force/mass1)* dt;
        }
        if (currentlyPressedKeys[38]) {
            // Up cursor key
            ySpeedObj1+=(force/mass1)*dt;

        }
        if (currentlyPressedKeys[40]) {
            // Down cursor key
            ySpeedObj1-=(force/mass1)*dt;
        }

        //WASD controls
        if (currentlyPressedKeys[65]) {
            // Left cursor key
            xSpeedObj2-=(force/mass2)*dt;
        }
        if (currentlyPressedKeys[68]) {
            // Right cursor key
            xSpeedObj2 +=(force/mass2)* dt;
        }
        if (currentlyPressedKeys[87]) {
            // Up cursor key
            ySpeedObj2+=(force/mass2)*dt;
        }
        if (currentlyPressedKeys[83]) {
            // Down cursor key
            ySpeedObj2-=(force/mass2)*dt;
        }
    }

