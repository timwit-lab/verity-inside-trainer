const SHAPES = ["▲", "●", "■"];

const SHAPE_NAMES = {
    "▲": "Triangle",
    "●": "Circle",
    "■": "Square"
};


let game = {

    player: null,

    guardians: [],

    phase: 1,

    selectedSlot: null,

    startTime: null,

    timer: null,

    solved: false

};


let stats = {

    solves: 0,

    bestTime: null

};



// Elements

const yourStatue =
document.getElementById("yourStatue");

const inventory1 =
document.getElementById("inventory1");

const inventory2 =
document.getElementById("inventory2");

const guardianStatue1 =
document.getElementById("guardianStatue1");

const guardianStatue2 =
document.getElementById("guardianStatue2");

const status =
document.getElementById("status");

const log =
document.getElementById("log");

const mode =
document.getElementById("mode");

const timerDisplay =
document.getElementById("timer");

const solvesDisplay =
document.getElementById("solves");

const bestDisplay =
document.getElementById("bestTime");




// Utility


function random(array){

    return array[
        Math.floor(Math.random()*array.length)
    ];

}



function write(message,type=""){

    log.innerHTML +=
    `<div class="${type}">${message}</div>`;

    log.scrollTop =
    log.scrollHeight;

}




// Create encounter


function newEncounter(){


    clearInterval(game.timer);


    log.innerHTML="";


    game.phase=1;

    game.selectedSlot=null;

    game.solved=false;



    let playerShape =
    random(SHAPES);



    let others =
    SHAPES.filter(
        s=>s!==playerShape
    );



    /*
       Generate valid starting state

       Each guardian has:
       - their own shape
       - one foreign shape

    */


    game.player={

        shape:playerShape,

        inventory:[

            playerShape,

            random(others)

        ]

    };



    game.guardians=[


        {

            name:"Guardian A",

            shape:others[0],

            inventory:[

                others[0],

                random(
                    SHAPES.filter(
                        x=>x!==others[0]
                    )
                )

            ]

        },


        {

            name:"Guardian B",

            shape:others[1],

            inventory:[

                others[1],

                random(
                    SHAPES.filter(
                        x=>x!==others[1]
                    )
                )

            ]

        }

    ];



    startTimer();


    update();



    status.innerHTML =
    "Phase 1: Send away the shape that is not yours.";


    write(
        "Your statue is " +
        SHAPE_NAMES[playerShape]
    );


    write(
        "Keep your own shape. Send the other shape to its matching guardian."
    );

}




// Update UI


function update(){


    yourStatue.innerHTML =
    game.player.shape;


    inventory1.innerHTML =
    game.player.inventory[0] || "";


    inventory2.innerHTML =
    game.player.inventory[1] || "";



    if(mode.value==="training"){


        guardianStatue1.innerHTML =
        game.guardians[0].shape;


        guardianStatue2.innerHTML =
        game.guardians[1].shape;


    }
    else{


        guardianStatue1.innerHTML =
        "?";


        guardianStatue2.innerHTML =
        "?";


    }


}




// Inventory selection


function selectInventory(slot){


    if(!game.player.inventory[slot])
        return;


    game.selectedSlot=slot;


    inventory1.classList.remove("selected");
    inventory2.classList.remove("selected");


    if(slot===0)

        inventory1.classList.add("selected");


    else

        inventory2.classList.add("selected");


    write(
        "Selected " +
        SHAPE_NAMES[
            game.player.inventory[slot]
        ]
    );

}




// Sending shapes


function sendToGuardian(number){


    if(game.selectedSlot===null){

        write(
            "Select a shape first.",
            "warning"
        );

        return;

    }



    if(game.phase===1){

        phaseOne(number);

    }

    else if(game.phase===2){

        phaseTwo(number);

    }

}





function phaseOne(number){


    let shape =
    game.player.inventory[
        game.selectedSlot
    ];


    let guardian =
    game.guardians[number];



    if(shape===game.player.shape){


        write(
            "Wrong: keep your own shape.",
            "error"
        );

        return;

    }



    if(shape!==guardian.shape){


        write(
            "Wrong guardian. That shape belongs elsewhere.",
            "error"
        );

        return;

    }



    removeSelected();



    write(
        "Sent " +
        SHAPE_NAMES[shape] +
        " to " +
        guardian.name,
        "success"
    );



    /*
       Simulate all three guardians
       reaching the double state
    */


    game.player.inventory=[

        game.player.shape,

        game.player.shape

    ];



    game.phase=2;


    status.innerHTML =
    "Phase 2: Give one copy of your shape to each guardian.";


    write(
        "All guardians now have double their own shape."
    );



    clearSelection();

    update();


}






function phaseTwo(number){


    let shape =
    game.player.inventory[
        game.selectedSlot
    ];



    if(shape!==game.player.shape){


        write(
            "Only give your own shape now.",
            "error"
        );

        return;

    }



    removeSelected();



    write(
        "Sent your shape to Guardian " +
        (number+1)
    );



    if(game.player.inventory.length===0){

        finish();

    }


    clearSelection();

    update();

}





function removeSelected(){


    game.player.inventory.splice(

        game.selectedSlot,

        1

    );


}




function clearSelection(){

    game.selectedSlot=null;

    inventory1.classList.remove("selected");

    inventory2.classList.remove("selected");

}





function finish(){


    let key =
    SHAPES.filter(
        s=>s!==game.player.shape
    );



    game.player.inventory=[

        key[0],

        key[1]

    ];



    game.phase=3;

    game.solved=true;


    clearInterval(game.timer);



    stats.solves++;


    solvesDisplay.innerHTML =
    stats.solves;



    let time =
    Math.floor(
        (Date.now()-game.startTime)/1000
    );



    if(
        !stats.bestTime ||
        time < stats.bestTime
    ){

        stats.bestTime=time;

        bestDisplay.innerHTML =
        time+"s";

    }



    status.innerHTML =
    "SUCCESS - Key Created";


    write(
        "Your final key: " +
        key.join(" + "),
        "success"
    );


}





// Tools


function hint(){


    if(game.phase===1){


        let wrong =
        game.player.inventory.find(
            s=>s!==game.player.shape
        );


        write(
            "Hint: Send " +
            SHAPE_NAMES[wrong]
        );


    }


    if(game.phase===2){


        write(
            "Hint: Give one of your shapes to each guardian."
        );

    }


}





function reveal(){


    write(
        "=== SECRET STATE ==="
    );


    write(
        "You: " +
        game.player.shape +
        " " +
        game.player.inventory.join(" ")
    );


    game.guardians.forEach(g=>{


        write(

            g.name +
            ": " +
            g.shape +
            " " +
            g.inventory.join(" ")

        );


    });


}





function resetSelection(){

    clearSelection();

    write(
        "Selection cleared."
    );

}





// Timer


function startTimer(){


    game.startTime=Date.now();


    game.timer=setInterval(()=>{


        let seconds =
        Math.floor(
            (Date.now()-game.startTime)/1000
        );


        timerDisplay.innerHTML =
        seconds;


    },1000);


}






// Events


inventory1.onclick =
()=>selectInventory(0);


inventory2.onclick =
()=>selectInventory(1);



document
.getElementById("guardian1")
.onclick =
()=>sendToGuardian(0);



document
.getElementById("guardian2")
.onclick =
()=>sendToGuardian(1);



document
.getElementById("newEncounter")
.onclick =
newEncounter;



document
.getElementById("hint")
.onclick =
hint;



document
.getElementById("reveal")
.onclick =
reveal;



document
.getElementById("reset")
.onclick =
resetSelection;



newEncounter();
