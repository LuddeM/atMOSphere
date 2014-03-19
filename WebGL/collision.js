var COLLISION = {
	calculateNewSpeed: function(xSpeedObj1,ySpeedObj1,xSpeedObj2,ySpeedObj2,xPos1,yPos1,xPos2,yPos2,mass1,mass2){



	console.log("Start"); 

        //Hitta normalvektor och normalisera denna
        var normConst = Math.sqrt(Math.pow((xPos2-xPos1),2)+Math.pow((yPos2-yPos1),2));
        //alert(Math.sqrt(Math.pow((dX1-dX2),2)+Math.pow((dY1-dY2),2)));

        

        if (normConst==0)
                normConst=0.00001;

        var xNormal = (xPos2-xPos1)/normConst;
        var yNormal= (yPos2-yPos1)/normConst;

        

        //Ta ut tangentvektor, också normaliserad
        var xTangent = -yNormal;
        var yTangent = xNormal;

        //Multiplicerar v1 och v2 med tangentvektorn (skalärprodukt och projicering)
        var tangentSpeed1 = (xSpeedObj1*xTangent) + (ySpeedObj1 * yTangent);
        var tangentSpeed2 = (xSpeedObj2*xTangent) + (ySpeedObj2 * yTangent);


        //Testning säger att normalSpeed1 alltid är positiv eller negativ, oavsett om den kommer från vänster eller höger.. 
        //Multiplicerar v1 och v2 med normalvektorn (skalärprodukt och projicering)
        var normalSpeed1 = (xSpeedObj1*xNormal) + (ySpeedObj1 * yNormal);
        var normalSpeed2 = (xSpeedObj2*xNormal) + (ySpeedObj2 * yNormal);


        //Tangethastigheten efter kollision är samma som före, dock räknas normalhastighet efter ut här
        var normalSpeedAfter1 = (normalSpeed1*(mass1-mass2) + 2*mass2*normalSpeed2)/(mass1+mass2);
        var normalSpeedAfter2 = (normalSpeed2*(mass2-mass1) + 2*mass1*normalSpeed1)/(mass1+mass2);

        //Gör om skalärerna till vektorkomponenter för normal och tangent

        //För objekt nummer ett
        var xNewNormalSpeed1 = normalSpeedAfter1 * xNormal;
        var yNewNormalSpeed1 = normalSpeedAfter1 * yNormal;

        var xNewTangentSpeed1 = tangentSpeed1 * xTangent;
        var yNewTangentSpeed1 = tangentSpeed1 * yTangent;

        //För objekt nummer två
        var xNewNormalSpeed2 = normalSpeedAfter2 * xNormal;
        var yNewNormalSpeed2 = normalSpeedAfter2 * yNormal;

        var xNewTangentSpeed2 = tangentSpeed2 * xTangent;
        var yNewTangentSpeed2 = tangentSpeed2 * yTangent;


        //Tangentdelen och normaldelen läggs ihop så man får de nya hastigheterna
        xSpeedObj1 = xNewNormalSpeed1 + xNewTangentSpeed1;
        ySpeedObj1 = yNewNormalSpeed1 + yNewTangentSpeed1;

        xSpeedObj2 = xNewNormalSpeed2 + xNewTangentSpeed2;
        ySpeedObj2 = yNewNormalSpeed2 + yNewTangentSpeed2;

        //Om de fastnar i varandra
        if(normConst<2){
                var positionArray=COLLISION.moveOutObject(xSpeedObj1,ySpeedObj1,xSpeedObj2,ySpeedObj2,xPos1,yPos1,xPos2,yPos2,mass1,mass2);
                xPos1=positionArray[0];
                yPos1=positionArray[1];
                xPos2=positionArray[2];
                yPos2=positionArray[3];
        }

        var velocityArray = new Array();

        velocityArray[0]=xSpeedObj1;
        velocityArray[1]=ySpeedObj1;
        velocityArray[2]=xSpeedObj2;
        velocityArray[3]=ySpeedObj2;

        return velocityArray;
	},
	//Hantering av de fall då objekten fastnat i varandra, fungerar ej alla gånger
	moveOutObject: function(xPos1,yPos1,xPos2,yPos2,radius1,radius2){

	var normConst = Math.sqrt(Math.pow((xPos2-xPos1),2)+Math.pow((yPos2-yPos1),2));

        if (normConst==0)
                normConst=0.00001;

        var xNormal = (xPos2-xPos1)/normConst;
        var yNormal= (yPos2-yPos1)/normConst;

        var distance = (radius1+radius2) - normConst;

        console.log(distance);

        xPos1 = (0.001+(distance/2))* xNormal;
        yPos1 = (0.001+(distance/2)) * yNormal;

        xPos2 = (0.001+(distance/2)) * (-xNormal);
        yPos2 = (0.001+(distance/2)) * (-yNormal);

        var positionArray = new Array();

        positionArray[0] = xPos1;
        positionArray[1] = yPos1;
        positionArray[2] = xPos2;
        positionArray[3] = yPos2;

        return positionArray;

	}

}