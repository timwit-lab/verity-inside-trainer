const shapes = ["▲", "●", "■"];

let game = {

    playerShape: null,

    inventory: [],

    guardians: [],

    phase: 1,

    selectedShape: null,

    selectedGuardian: null

};


const statueShape = document.getElementById("statueShape");
const shape1 = document.getElementById("shape1");
const shape2 = document.getElementById("shape2");

const leftStatue = document.getElementById("leftStatue");
const rightStatue = document.getElementById("rightStatue");

const phaseText = document.getElementById("phaseText");
const log = document.getElementById("log");


const newPuzzleButton =
    document.getElementById("newPuzzle");

const checkButton =
    document.getElementById("checkButton");

const revealButton =
    document.getElementById("revealButton");



function randomShape(exclude = null) {

    let available = shapes.filter(
        s => s !== exclude
    );

    return available[
        Math.floor(Math.random() * available.length)
    ];

}



function writeLog(message) {

    log.innerHTML += `<div>${message}</div>`;

    log.scrollTop = log.scrollHeight;

}



function newPuzzle() {


    log.innerHTML = "";

    game.phase = 1;


    // Pick player's statue

    game.playerShape =
        shapes[Math.floor(Math.random()*3)];



    // Other two statues

    let remaining =
        shapes.filter(
            s => s !== game.playerShape
        );


    game.guardians = [

        {
            name:"Guardian A",
            shape:remaining[0],
            inventory:[]
        },

        {
            name:"Guardian B",
            shape:remaining[1],
            inventory:[]
        }

    ];



    // Player starts with their own shape
    // plus one random other shape

    game.inventory = [

        game.playerShape,

        randomShape(game.playerShape)

    ];



    // Create hidden inventories

    generateHiddenInventories();



    updateUI();



    phaseText.innerHTML =
        "Phase 1: Give away the shape that is not yours.";

    
    writeLog(
        "Puzzle created. Identify the shape you need to send."
    );

}



function generateHiddenInventories(){

    /*
       This creates a valid Verity state.

       The other guardians are given inventories
       that allow the strategy to work.
    */


    game.guardians.forEach(g => {


        g.inventory = [

            g.shape,

            randomShape(g.shape)

        ];


    });

}



function updateUI(){


    statueShape.innerHTML =
        game.playerShape;


    shape1.innerHTML =
        game.inventory[0];


    shape2.innerHTML =
        game.inventory[1];



    leftStatue.innerHTML =
        game.guardians[0].shape;


    rightStatue.innerHTML =
        game.guardians[1].shape;



}



function selectShape(index){

    game.selectedShape =
        game.inventory[index];


    writeLog(
        "Selected " + game.selectedShape
    );


}



function depositShape(guardianIndex){


    if(game.selectedShape === null){

        writeLog(
            "Choose a shape first."
        );

        return;

    }



    let guardian =
        game.guardians[guardianIndex];



    writeLog(

        `Sent ${game.selectedShape} to ${guardian.name}`

    );



    let removeIndex =
        game.inventory.indexOf(
            game.selectedShape
        );


    game.inventory.splice(
        removeIndex,
        1
    );



    guardian.inventory.push(
        game.selectedShape
    );



    game.selectedShape=null;


    updateUI();


}



shape1.onclick =
    () => selectShape(0);


shape2.onclick =
    () => selectShape(1);



document
.getElementById("guardianLeft")
.onclick =
    () => depositShape(0);



document
.getElementById("guardianRight")
.onclick =
    () => depositShape(1);



newPuzzleButton.onclick =
    newPuzzle;



checkButton.onclick = function(){

    writeLog(
        "Checking state..."
    );

};



revealButton.onclick = function(){


    writeLog(
        "Your statue: "
        + game.playerShape
    );


    game.guardians.forEach(g=>{

        writeLog(
            `${g.name}: ${g.shape} holding ${g.inventory.join(" ")}`
        );

    });


};



newPuzzle();
