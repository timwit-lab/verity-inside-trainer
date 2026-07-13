const shapes = ["▲", "●", "■"];


let game = {

    playerShape: "",

    inventory: [],

    guardians: [],

    phase: 1,

    selectedShape: null,

    sentCount: 0

};



const statueShape =
document.getElementById("statueShape");


const shape1 =
document.getElementById("shape1");


const shape2 =
document.getElementById("shape2");


const leftStatue =
document.getElementById("leftStatue");


const rightStatue =
document.getElementById("rightStatue");


const phaseText =
document.getElementById("phaseText");


const log =
document.getElementById("log");




function randomShape(array){

    return array[
        Math.floor(Math.random()*array.length)
    ];

}




function writeLog(message){

    log.innerHTML +=
    `<div>${message}</div>`;

}




function newPuzzle(){


    log.innerHTML="";


    game.phase=1;

    game.sentCount=0;

    game.selectedShape=null;



    // Pick your statue

    game.playerShape =
    randomShape(shapes);



    let others =
    shapes.filter(
        s => s !== game.playerShape
    );



    game.guardians = [


        {

            name:"Guardian A",

            shape:others[0],

            inventory:[]

        },


        {

            name:"Guardian B",

            shape:others[1],

            inventory:[]

        }


    ];



    // You start with your shape + one other

    game.inventory = [

        game.playerShape,

        randomShape(others)

    ];



    // Hidden inventories

    game.guardians.forEach(g => {


        g.inventory=[

            g.shape,

            randomShape(
                shapes.filter(
                    s=>s!==g.shape
                )
            )

        ];


    });



    updateUI();



    phaseText.innerHTML =

    "Phase 1: Send the shape that is not yours.";



    writeLog(

    "Keep your own shape. Send the other shape to its statue."

    );


}





function updateUI(){


    statueShape.innerHTML =
    game.playerShape;



    shape1.innerHTML =
    game.inventory[0] || "";



    shape2.innerHTML =
    game.inventory[1] || "";



    leftStatue.innerHTML =
    game.guardians[0].shape;



    rightStatue.innerHTML =
    game.guardians[1].shape;


}





function selectShape(index){


    if(!game.inventory[index]) return;


    game.selectedShape =
    game.inventory[index];


    writeLog(

    "Selected " + game.selectedShape

    );


}





function depositGuardian(index){


    if(!game.selectedShape){


        writeLog(
        "Select a shape first."
        );

        return;

    }



    let guardian =
    game.guardians[index];



    if(game.phase===1){


        phaseOne(guardian);


    }

    else {


        phaseTwo(guardian);


    }


}






function phaseOne(guardian){


    if(
        game.selectedShape === game.playerShape
    ){


        writeLog(

        "❌ Keep your own shape."

        );


        return;

    }



    if(
        game.selectedShape !== guardian.shape
    ){


        writeLog(

        "❌ That shape belongs to the other guardian."

        );


        return;

    }




    removeSelected();



    writeLog(

    "✓ Sent " +
    game.selectedShape +
    " to " +
    guardian.name

    );



    game.selectedShape=null;



    // Simulate other guardians completing swap

    game.inventory=[

        game.playerShape,

        game.playerShape

    ];



    game.phase=2;



    phaseText.innerHTML =

    "Phase 2: Give one of your shapes to each guardian.";



    writeLog(

    "Everyone now has double their own shape."

    );



    updateUI();


}







function phaseTwo(guardian){


    if(
        game.selectedShape !== game.playerShape
    ){


        writeLog(

        "❌ Only give your own shape now."

        );


        return;

    }



    removeSelected();



    guardian.inventory.push(
        game.playerShape
    );



    game.sentCount++;



    writeLog(

    "Sent " +
    game.playerShape +
    " to " +
    guardian.name

    );



    game.selectedShape=null;



    if(game.sentCount===2){


        finish();


    }



    updateUI();


}






function removeSelected(){


    let index =
    game.inventory.indexOf(
        game.selectedShape
    );


    game.inventory.splice(
        index,
        1
    );


}






function finish(){


    let key =

    shapes.filter(
        s=>s!==game.playerShape
    );



    game.inventory=[

        key[0],

        key[1]

    ];



    phaseText.innerHTML =

    "SUCCESS! Key created.";



    writeLog(

    "Your key is: "
    +
    key[0]
    +
    " + "
    +
    key[1]

    );



}






shape1.onclick = () =>
selectShape(0);



shape2.onclick = () =>
selectShape(1);




document
.getElementById("guardianLeft")
.onclick = () =>
depositGuardian(0);




document
.getElementById("guardianRight")
.onclick = () =>
depositGuardian(1);




document
.getElementById("newPuzzle")
.onclick =
newPuzzle;




document
.getElementById("revealButton")
.onclick = () => {


    writeLog(
    "=== SECRET STATE ==="
    );


    writeLog(
    "Your shape: " +
    game.playerShape
    );


    game.guardians.forEach(g=>{


        writeLog(

        g.name +
        ": " +
        g.shape +
        " holding " +
        g.inventory.join(" ")

        );


    });


};





newPuzzle();
