const shapes = ["▲", "●", "■"];

let game = {
    playerShape: "",
    inventory: [],
    guardians: [],
    phase: 1,
    selectedShape: null,
    sentCount: 0
};


const statueShape = document.getElementById("statueShape");
const shape1 = document.getElementById("shape1");
const shape2 = document.getElementById("shape2");

const leftStatue = document.getElementById("leftStatue");
const rightStatue = document.getElementById("rightStatue");

const phaseText = document.getElementById("phaseText");
const log = document.getElementById("log");


function randomItem(arr){
    return arr[Math.floor(Math.random()*arr.length)];
}


function writeLog(text){
    log.innerHTML += `<div>${text}</div>`;
}



function newPuzzle(){

    log.innerHTML="";

    game.phase=1;
    game.sentCount=0;


    game.playerShape=randomItem(shapes);


    let others =
        shapes.filter(
            s=>s!==game.playerShape
        );


    game.guardians=[

        {
            name:"Guardian A",
            shape:others[0],
            inventory:[others[0], others[1]]
        },

        {
            name:"Guardian B",
            shape:others[1],
            inventory:[others[1], others[0]]
        }

    ];


    game.inventory=[

        game.playerShape,

        randomItem(others)

    ];


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
    `Selected ${game.selectedShape}`
    );

}



function deposit(index){

    if(!game.selectedShape){

        writeLog("Select a shape first.");
        return;

    }


    let guardian =
    game.guardians[index];



    if(game.phase===1){

        phaseOneDeposit(guardian);

    }
    else {

        phaseTwoDeposit(guardian);

    }

}



function phaseOneDeposit(guardian){


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
        "❌ Send it to the statue holding that shape."
        );

        return;
    }



    removeSelected();


    guardian.inventory.push(
        game.selectedShape
    );


    writeLog(
    `✓ Sent ${game.selectedShape} to ${guardian.name}`
    );


    game.selectedShape=null;



    // other guardians magically finish

    game.inventory=[

        game.playerShape,
        game.playerShape

    ];


    game.phase=2;


    phaseText.innerHTML =
    "Phase 2: Give one copy of your shape to each guardian.";


    writeLog(
    "Everyone now has double their own shape."
    );


    updateUI();

}



function phaseTwoDeposit(guardian){


    if(
        game.selectedShape !== game.playerShape
    ){

        writeLog(
        "❌ You should only give your own shape now."
        );

        return;

    }



    removeSelected();


    guardian.inventory.push(
        game.playerShape
    );


    game.sentCount++;


    writeLog(
    `Sent ${game.playerShape} to ${guardian.name}`
    );


    game.selectedShape=null;



    if(game.sentCount===2){

        finishEncounter();

    }


    updateUI();

}



function removeSelected(){


    let index =
    game.inventory.indexOf(
        game.selectedShape
    );


    game.inventory.splice(index,1);

}



function finishEncounter(){


    let finalShapes =
        shapes.filter(
            s=>s!==game.playerShape
        );


    game.inventory=[

        finalShapes[0],
        finalShapes[1]

    ];



    phaseText.innerHTML =
    "SUCCESS: Key created!";


    writeLog(
    `Your key is ${finalShapes[0]} + ${finalShapes[1]}`
    );


    updateUI();

}



shape1.onclick =
()=>selectShape(0);


shape2.onclick =
()=>selectShape(1);



document
.getElementById("guardianLeft")
.onclick =
()=>deposit(0);



document
.getElementById("guardianRight")
.onclick =
()=>deposit(1);



document
.getElementById("newPuzzle")
.onclick =
newPuzzle;



document
.getElementById("revealButton")
.onclick=function(){

    writeLog("=== SECRET INFO ===");

    game.guardians.forEach(g=>{

        writeLog(
        `${g.name}: ${g.shape} | ${g.inventory.join(" ")}`
        );

    });

};



newPuzzle();
