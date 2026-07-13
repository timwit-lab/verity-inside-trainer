// ============================================
// VERITY INSIDE TRAINER v3
// PART 1/3
// Core state + encounter generation
// ============================================


const SHAPES = {
    TRIANGLE: "▲",
    CIRCLE: "●",
    SQUARE: "■"
};


const ALL_SHAPES = [
    SHAPES.TRIANGLE,
    SHAPES.CIRCLE,
    SHAPES.SQUARE
];


const SHAPE_NAMES = {

    "▲": "Triangle",
    "●": "Circle",
    "■": "Square"

};



// ============================================
// GAME STATE
// ============================================


let game = {


    guardians: [],


    playerId: 0,


    phase: 1,


    selectedInventory: null,


    startTime: null,


    timer: null,


    solved: false,


    mode: "training"


};



let stats = JSON.parse(
    localStorage.getItem("verityStats")
) || {

    solves: 0,

    bestTime: null

};




// ============================================
// UI REFERENCES
// ============================================


const ui = {

    yourStatue:
    document.getElementById("yourStatue"),


    inventory1:
    document.getElementById("inventory1"),


    inventory2:
    document.getElementById("inventory2"),


    guardian1:
    document.getElementById("guardianStatue1"),


    guardian2:
    document.getElementById("guardianStatue2"),


    status:
    document.getElementById("status"),


    log:
    document.getElementById("log"),


    mode:
    document.getElementById("mode"),


    timer:
    document.getElementById("timer"),


    solves:
    document.getElementById("solves"),


    best:
    document.getElementById("bestTime")

};





// ============================================
// HELPERS
// ============================================


function randomItem(array) {

    return array[
        Math.floor(
            Math.random() * array.length
        )
    ];

}



function clone(array){

    return JSON.parse(
        JSON.stringify(array)
    );

}



function player(){

    return game.guardians[
        game.playerId
    ];

}



function writeLog(message, type=""){

    ui.log.innerHTML +=
    `<div class="${type}">
        ${message}
     </div>`;


    ui.log.scrollTop =
    ui.log.scrollHeight;

}





// ============================================
// ENCOUNTER GENERATOR
// ============================================


function generateEncounter(){


    /*
        Shuffle statue assignments
    */


    let statues =
    clone(ALL_SHAPES)
    .sort(
        ()=>Math.random()-0.5
    );



    game.guardians = statues.map(
        (shape,index)=>{


            return {


                id:index,


                name:
                "Guardian " +
                String.fromCharCode(
                    65+index
                ),


                statue:shape,


                inventory:[shape]

            };


        }
    );




    /*
        Give every guardian
        one foreign shape.

        This creates the
        starting inside-room state.
    */


    game.guardians[0]
    .inventory.push(
        game.guardians[1].statue
    );


    game.guardians[1]
    .inventory.push(
        game.guardians[2].statue
    );


    game.guardians[2]
    .inventory.push(
        game.guardians[0].statue
    );





    game.playerId = 0;


    game.phase = 1;


    game.selectedInventory = null;


    game.solved = false;



    writeLog(
        "Encounter generated."
    );


    writeLog(
        "Your statue is " +
        SHAPE_NAMES[
            player().statue
        ]
    );


    writeLog(
        "Find the shape that is not yours and send it away."
    );


}

// ============================================
// VERITY INSIDE TRAINER v3
// PART 2/3
// Deposits + phase logic
// ============================================



// ============================================
// INVENTORY SELECTION
// ============================================


function selectInventory(slot){


    if(!player().inventory[slot]) {

        return;

    }


    game.selectedInventory = slot;


    document
    .querySelectorAll(".shape-button")
    .forEach(
        button =>
        button.classList.remove("selected")
    );


    document
    .getElementById(
        slot === 0 ?
        "inventory1" :
        "inventory2"
    )
    .classList.add("selected");


    writeLog(

        "Selected " +
        SHAPE_NAMES[
            player().inventory[slot]
        ]

    );


}







// ============================================
// SEND SHAPE TO GUARDIAN
// ============================================


function sendShape(targetId){


    if(game.selectedInventory === null){


        writeLog(
            "Select a shape first.",
            "warning"
        );

        return;

    }



    let shape =
    player().inventory[
        game.selectedInventory
    ];



    if(game.phase === 1){


        phaseOneSend(
            targetId,
            shape
        );


    }
    else if(game.phase === 2){


        phaseTwoSend(
            targetId,
            shape
        );

    }



}







// ============================================
// PHASE 1
// GIVE AWAY THE SHAPE THAT IS NOT YOURS
// ============================================


function phaseOneSend(targetId,shape){



    let target =
    game.guardians[targetId];



    if(shape === player().statue){


        writeLog(
            "Incorrect. Keep your own shape.",
            "error"
        );

        return;

    }



    if(shape !== target.statue){


        writeLog(
            "Incorrect statue. That shape belongs elsewhere.",
            "error"
        );

        return;

    }




    removePlayerShape(shape);



    target.inventory.push(shape);



    writeLog(

        "Sent " +
        SHAPE_NAMES[shape] +
        " to " +
        target.name,

        "success"

    );



    /*
        Simulate the other two guardians
        making their correct first deposits.
    */


    resolveOtherGuardianDeposits();



    updatePhaseOneResult();


}









function resolveOtherGuardianDeposits(){



    game.guardians.forEach(
        guardian => {


            let foreignShape =
            guardian.inventory.find(
                shape =>
                shape !== guardian.statue
            );



            if(foreignShape){


                let destination =
                game.guardians.find(
                    g =>
                    g.statue === foreignShape
                );



                guardian.inventory =
                guardian.inventory.filter(
                    s =>
                    s !== foreignShape
                );



                destination.inventory.push(
                    foreignShape
                );


            }


        }

    );



}









function updatePhaseOneResult(){



    let solved =
    game.guardians.every(
        guardian =>

        guardian.inventory.length === 2 &&

        guardian.inventory.every(
            shape =>
            shape === guardian.statue
        )

    );



    if(!solved){


        writeLog(
            "Phase 1 did not resolve correctly.",
            "error"
        );


        return;

    }





    game.phase = 2;



    player().inventory = [

        player().statue,

        player().statue

    ];



    ui.status.innerHTML =

    "Phase 2: Give one copy of your shape to each guardian.";



    writeLog(

        "Phase 1 complete. Everyone has doubles.",

        "success"

    );



    clearSelection();


    updateUI();


}









// ============================================
// PHASE 2
// SEND ONE OF YOUR OWN SHAPES TO EACH PLAYER
// ============================================


function phaseTwoSend(targetId,shape){



    if(shape !== player().statue){


        writeLog(

            "Only send your own shape now.",

            "error"

        );


        return;

    }



    let target =
    game.guardians[targetId];



    removePlayerShape(shape);



    target.inventory.push(shape);



    writeLog(

        "Sent " +
        SHAPE_NAMES[shape] +
        " to " +
        target.name

    );



    if(player().inventory.length === 0){


        resolveFinalExchange();


    }


    clearSelection();


    updateUI();


}








function resolveFinalExchange(){



    /*
        Every guardian sends one copy
        of their own shape to both others.

        The player receives the two
        shapes they do not own.
    */


    let own =
    player().statue;



    let key =
    ALL_SHAPES.filter(
        s =>
        s !== own
    );



    player().inventory = key;



    game.phase = 3;



    game.solved = true;



    stopTimer();



    stats.solves++;



    let elapsed =
    Math.floor(
        (Date.now()-game.startTime)/1000
    );



    if(
        stats.bestTime === null ||
        elapsed < stats.bestTime
    ){

        stats.bestTime = elapsed;

    }



    localStorage.setItem(
        "verityStats",
        JSON.stringify(stats)
    );



    writeLog(

        "FINAL KEY: " +
        key.join(" + "),

        "success"

    );



    ui.status.innerHTML =

    "SUCCESS - Key Created";



}







// ============================================
// HELPERS
// ============================================


function removePlayerShape(shape){


    let index =
    player()
    .inventory
    .indexOf(shape);



    if(index !== -1){


        player()
        .inventory
        .splice(index,1);


    }


}




function clearSelection(){


    game.selectedInventory=null;


    document
    .querySelectorAll(".shape-button")
    .forEach(
        button =>
        button.classList.remove("selected")
    );


}

// ============================================
// VERITY INSIDE TRAINER v3
// PART 3/3
// UI + controls + timer
// ============================================



// ============================================
// UPDATE UI
// ============================================


function updateUI(){


    let p = player();



    ui.yourStatue.innerHTML =
    p.statue;



    ui.inventory1.innerHTML =
    p.inventory[0] || "";


    ui.inventory2.innerHTML =
    p.inventory[1] || "";




    if(game.mode === "training"){


        ui.guardian1.innerHTML =
        game.guardians[1].statue;


        ui.guardian2.innerHTML =
        game.guardians[2].statue;


    }

    else {


        ui.guardian1.innerHTML =
        "?";


        ui.guardian2.innerHTML =
        "?";

    }



    ui.solves.innerHTML =
    stats.solves;



    ui.best.innerHTML =
    stats.bestTime ?
    stats.bestTime + "s" :
    "--";


}









// ============================================
// TIMER
// ============================================


function startTimer(){


    clearInterval(game.timer);



    game.startTime =
    Date.now();



    game.timer =
    setInterval(()=>{


        let seconds =
        Math.floor(
            (Date.now()-game.startTime)/1000
        );


        ui.timer.innerHTML =
        seconds;



    },1000);


}





function stopTimer(){


    clearInterval(game.timer);


}









// ============================================
// NEW ENCOUNTER
// ============================================


function newEncounter(){


    stopTimer();



    ui.log.innerHTML = "";



    generateEncounter();



    startTimer();



    updateUI();


    ui.status.innerHTML =

    "Phase 1: Send the shape that is not yours.";

}









// ============================================
// HINTS
// ============================================


function showHint(){



    if(game.phase === 1){



        let wrongShape =

        player()
        .inventory
        .find(
            shape =>
            shape !== player().statue
        );



        writeLog(

            "Hint: Send " +
            SHAPE_NAMES[wrongShape]

        );


    }


    else if(game.phase === 2){


        writeLog(

            "Give one copy of your shape to each guardian."

        );


    }


}









// ============================================
// REVEAL
// ============================================


function reveal(){


    writeLog(
        "===== HIDDEN STATE ====="
    );



    game.guardians.forEach(
        guardian => {


            writeLog(

                guardian.name +
                " | Statue: " +
                guardian.statue +
                " | Inventory: " +
                guardian.inventory.join(" ")

            );


        }

    );


}









// ============================================
// MODE SWITCH
// ============================================


ui.mode.addEventListener(
"change",
()=>{


    game.mode =
    ui.mode.value;



    updateUI();


    writeLog(

        "Mode changed to " +
        game.mode

    );


});









// ============================================
// BUTTON EVENTS
// ============================================
document

.getElementById("newEncounter")

.onclick =

newEncounter;

document

.getElementById("inventory1")

.onclick =

()=>selectInventory(0);

document

.getElementById("inventory2")

.onclick =

()=>selectInventory(1);

document

.getElementById("guardian1")

.onclick =

()=>sendShape(1);

document

.getElementById("guardian2")

.onclick =

()=>sendShape(2);

document

.getElementById("hint")

.onclick =

showHint;

document

.getElementById("reveal")

.onclick =

reveal;

document

.getElementById("reset")

.onclick =

clearSelection;

// ============================================

// START

// ============================================

newEncounter();
