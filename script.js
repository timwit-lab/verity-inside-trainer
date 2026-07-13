const shapes = ["▲", "●", "■"];

let game = {
    playerShape: "",
    inventory: [],
    guardians: [],
    phase: 1,
    selectedShape: null
};


const statueShape = document.getElementById("statueShape");
const shape1 = document.getElementById("shape1");
const shape2 = document.getElementById("shape2");

const leftStatue = document.getElementById("leftStatue");
const rightStatue = document.getElementById("rightStatue");

const phaseText = document.getElementById("phaseText");
const log = document.getElementById("log");


function randomItem(array){

    return array[
        Math.floor(Math.random()*array.length)
    ];

}


function writeLog(text){

    log.innerHTML += `<div>${text}</div>`;

}



function newPuzzle(){

    log.innerHTML="";

    game.phase=1;


    game.playerShape=randomItem(shapes);


    let others =
        shapes.filter(
            s=>s!==game.playerShape
        );


    game.guardians=[

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



    /*
      Create a valid Verity starting state.

      Everyone starts holding their own shape
      and one shape belonging to another guardian.
    */


    game.inventory=[

        game.playerShape,

        randomItem(others)

    ];



    game.guardians.forEach(g=>{

        let possible =
            shapes.filter(
                s=>s!==g.shape
            );


        g.inventory=[

            g.shape,

            randomItem(possible)

        ];

    });



    updateUI();


    phaseText.innerHTML =
    "Phase 1: Give away the shape that is NOT yours.";

    writeLog(
        "Find the shape that isn't your statue."
    );

}



function updateUI(){

    statueShape.innerHTML=
        game.playerShape;


    shape1.innerHTML=
        game.inventory[0] ?? "";


    shape2.innerHTML=
        game.inventory[1] ?? "";


    leftStatue.innerHTML=
        game.guardians[0].shape;


    rightStatue.innerHTML=
        game.guardians[1].shape;

}



function selectShape(number){

    game.selectedShape =
        game.inventory[number];


    writeLog(
        `Selected ${game.selectedShape}`
    );

}



function depositToGuardian(index){


    if(!game.selectedShape){

        writeLog(
            "Select a shape first."
        );

        return;

    }


    let guardian =
        game.guardians[index];



    /*
      Correct play:
      You keep your own shape.
      You send the other shape
      to the statue holding it.
    */


    if(
        game.selectedShape === game.playerShape
    ){

        writeLog(
        "❌ Do not send your own shape. Keep it."
        );

        return;

    }



    if(
        game.selectedShape !== guardian.shape
    ){

        writeLog(
        "❌ That guardian does not need this shape."
        );

        return;

    }



    guardian.inventory.push(
        game.selectedShape
    );


    game.inventory.splice(

        game.inventory.indexOf(
            game.selectedShape
        ),

        1

    );



    writeLog(
        `✓ Sent ${game.selectedShape} to ${guardian.name}`
    );



    game.selectedShape=null;


    resolveFirstPhase();



}



function resolveFirstPhase(){


    /*
       If the player has only their own shape left,
       simulate the other two guardians.
    */


    if(

        game.inventory.length===1
        &&
        game.inventory[0]===game.playerShape

    ){


        writeLog(
        "Other guardians complete their swaps..."
        );



        game.inventory=[

            game.playerShape,

            game.playerShape

        ];



        phaseText.innerHTML =
        "Phase 2: You have doubles! Give one to each guardian.";



        game.phase=2;


    }


    updateUI();

}



shape1.onclick =
()=>selectShape(0);


shape2.onclick =
()=>selectShape(1);


document
.getElementById("guardianLeft")
.onclick=
()=>depositToGuardian(0);


document
.getElementById("guardianRight")
.onclick=
()=>depositToGuardian(1);



document
.getElementById("newPuzzle")
.onclick=
newPuzzle;



document
.getElementById("revealButton")
.onclick=function(){


    writeLog(
        "=== SECRET STATE ==="
    );


    writeLog(
        "Your shape: "
        +game.playerShape
    );


    game.guardians.forEach(g=>{

        writeLog(
        `${g.name}: ${g.shape} ${g.inventory.join(" ")}`
        );

    });


};



newPuzzle();
