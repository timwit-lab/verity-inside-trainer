// ============================================
// VERITY INSIDE TRAINER
// SCRIPT PART 1/2
// ============================================


const SHAPES = ["▲", "●", "■"];


const SHAPE_NAMES = {

    "▲": "Triangle",
    "●": "Circle",
    "■": "Square"

};



let game = {

    guardians: [],

    playerId: 0,

    phase: 1,

    selectedSlot: null,

    solved: false,

    startTime: null,

    timer: null

};



let stats =
JSON.parse(
    localStorage.getItem("verityStats")
)
||
{
    solves:0,
    bestTime:null
};






// ===============================
// UI
// ===============================


const ui = {

    yourStatue:
    document.getElementById("yourStatue"),


    guardianAStatue:
    document.getElementById("guardianAStatue"),


    guardianBStatue:
    document.getElementById("guardianBStatue"),


    inventory1:
    document.getElementById("inventory1"),


    inventory2:
    document.getElementById("inventory2"),


    status:
    document.getElementById("status"),


    log:
    document.getElementById("log"),


    timer:
    document.getElementById("timer"),


    solves:
    document.getElementById("solves"),


    best:
    document.getElementById("bestTime")

};







// ===============================
// HELPERS
// ===============================


function randomItem(array){

    return array[
        Math.floor(
            Math.random()*array.length
        )
    ];

}



function player(){

    return game.guardians[
        game.playerId
    ];

}



function log(message,type=""){

    ui.log.innerHTML +=
    `<div class="${type}">
    ${message}
    </div>`;

    ui.log.scrollTop =
    ui.log.scrollHeight;

}







// ===============================
// CREATE ENCOUNTER
// ===============================


function newEncounter(){



    clearInterval(game.timer);


    ui.log.innerHTML="";



    let statues =
    [...SHAPES]
    .sort(
        ()=>Math.random()-0.5
    );




    /*
        Create three guardians

        Index 0 = player
        Index 1 = Guardian A
        Index 2 = Guardian B
    */


    game.guardians =
    statues.map(
        (shape,index)=>({

            id:index,

            name:
            index===0
            ?
            "You"
            :
            "Guardian " +
            String.fromCharCode(64+index),


            statue:shape,

            inventory:[]

        })
    );




    game.playerId=0;



    let p=player();



    let foreignShapes =
    SHAPES.filter(
        s=>s!==p.statue
    );




    /*
        Valid starting states:

        1:
        Own + foreign

        2:
        Own + own

    */


    if(Math.random()<0.5){


        p.inventory=[

            p.statue,

            randomItem(
                foreignShapes
            )

        ];


    }

    else{


        p.inventory=[

            p.statue,

            p.statue

        ];

    }







    /*
        Give other guardians
        hidden inventories

        They have their own shape
        plus a random foreign shape.

    */


    game.guardians
    .filter(
        g=>g.id!==0
    )
    .forEach(
        g=>{


            let possible =
            SHAPES.filter(
                s=>s!==g.statue
            );


            g.inventory=[

                g.statue,

                randomItem(
                    possible
                )

            ];


        }
    );





    game.phase=1;

    game.selectedSlot=null;

    game.solved=false;



    startTimer();


    updateUI();



    log(
        "Your statue is " +
        SHAPE_NAMES[p.statue]
    );


    log(
        "You are holding: " +
        p.inventory.join(" ")
    );


    log(
        "Identify what shape needs to leave your room."
    );


    ui.status.innerHTML =
    "Phase 1: Send shapes to the correct statues.";

}







// ===============================
// UI UPDATE
// ===============================


function updateUI(){


    let p=player();



    ui.yourStatue.innerHTML =
    p.statue;



    ui.guardianAStatue.innerHTML =
    game.guardians[1].statue;



    ui.guardianBStatue.innerHTML =
    game.guardians[2].statue;



    ui.inventory1.innerHTML =
    p.inventory[0] || "";


    ui.inventory2.innerHTML =
    p.inventory[1] || "";



    ui.solves.innerHTML =
    stats.solves;


    ui.best.innerHTML =
    stats.bestTime
    ?
    stats.bestTime+"s"
    :
    "--";

}

// ============================================
// VERITY INSIDE TRAINER
// SCRIPT PART 2/2
// ============================================



// ===============================
// TIMER
// ===============================


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







// ===============================
// SELECT SHAPE
// ===============================


function selectShape(slot){


    game.selectedSlot = slot;



    document
    .querySelectorAll(".shape-button")
    .forEach(
        b =>
        b.classList.remove("selected")
    );



    document
    .getElementById(
        slot===0
        ?
        "inventory1"
        :
        "inventory2"
    )
    .classList.add("selected");


}







// ===============================
// SEND SHAPE
// ===============================


function sendShape(targetId){



    if(game.selectedSlot===null){


        log(
            "Select a shape first.",
            "warning"
        );


        return;

    }



    let shape =
    player()
    .inventory[
        game.selectedSlot
    ];



    let target =
    game.guardians[targetId];





    /*
       Shape must belong to
       target guardian statue
    */


    if(shape !== target.statue){


        /*
           Special case:
           double own shapes

           send own shape to
           either other guardian
           because they need it
        */


        if(
            shape === player().statue &&
            player().inventory[0] === player().statue &&
            player().inventory[1] === player().statue
        ){


            removeSelectedShape();


            target.inventory.push(shape);


            log(
                "Sent your " +
                SHAPE_NAMES[shape] +
                " to " +
                target.name
            );


        }

        else{


            log(
                "Wrong guardian for that shape.",
                "error"
            );


            return;

        }


    }

    else{


        removeSelectedShape();


        target.inventory.push(shape);


        log(
            "Sent " +
            SHAPE_NAMES[shape] +
            " to " +
            target.name,
            "success"
        );


    }



    updateUI();



    checkPhaseOne();

}







function removeSelectedShape(){


    player()
    .inventory
    .splice(
        game.selectedSlot,
        1
    );


    game.selectedSlot=null;


    document
    .querySelectorAll(".shape-button")
    .forEach(
        b =>
        b.classList.remove("selected")
    );


}









// ===============================
// PHASE ONE CHECK
// ===============================


function checkPhaseOne(){



    if(player().inventory.length>0){

        return;

    }




    simulateOtherGuardians();



    /*
       Everyone now has
       double their own shape

    */


    let ready =
    game.guardians.every(
        g=>{


            return (
                g.inventory.length===2 &&
                g.inventory.every(
                    s =>
                    s===g.statue
                )
            );

        }
    );




    if(!ready){


        log(
            "Something went wrong in phase 1.",
            "error"
        );


        return;

    }





    game.phase=2;



    player().inventory=[

        player().statue,

        player().statue

    ];



    ui.status.innerHTML =

    "Phase 2: Give one of your shapes to each guardian.";



    log(
        "Phase 1 complete. Everyone has doubles.",
        "success"
    );


    updateUI();


}









// ===============================
// OTHER GUARDIANS RESOLVE
// ===============================


function simulateOtherGuardians(){


    game.guardians
    .filter(
        g=>g.id!==0
    )
    .forEach(
        g=>{


            let foreign =
            g.inventory.find(
                s=>s!==g.statue
            );



            if(foreign){


                let owner =
                game.guardians.find(
                    x =>
                    x.statue===foreign
                );



                g.inventory =
                g.inventory.filter(
                    s =>
                    s!==foreign
                );



                owner.inventory.push(
                    foreign
                );


            }


        }
    );

}







// ===============================
// PHASE TWO
// ===============================


function checkPhaseTwo(){


    if(player().inventory.length!==0){

        return;

    }



    let key =
    SHAPES.filter(
        s =>
        s!==player().statue
    );



    player().inventory =
    key;



    game.solved=true;



    stopTimer();



    stats.solves++;



    let time =
    Math.floor(
        (Date.now()-game.startTime)/1000
    );



    if(
        !stats.bestTime ||
        time < stats.bestTime
    ){

        stats.bestTime=time;

    }



    localStorage.setItem(
        "verityStats",
        JSON.stringify(stats)
    );



    ui.status.innerHTML =
    "SUCCESS - Key Created";



    log(
        "Your final key: " +
        key.join(" + "),
        "success"
    );



    updateUI();

}







// ===============================
// HINT
// ===============================


function hint(){


    let p=player();


    let foreign =
    p.inventory.find(
        s =>
        s!==p.statue
    );



    if(foreign){


        log(
            "Send " +
            SHAPE_NAMES[foreign] +
            " to the guardian holding that statue."
        );


    }

    else{


        log(
            "You have two copies of your shape. Send one to each guardian."
        );


    }

}







// ===============================
// REVEAL
// ===============================


function reveal(){


    log(
        "=== Hidden inventories ==="
    );


    game.guardians.forEach(
        g=>{


            log(
                g.name +
                ": " +
                g.inventory.join(" ")
            );


        }
    );

}







// ===============================
// EVENTS
// ===============================


document
.getElementById("newEncounter")
.onclick =
newEncounter;



document
.getElementById("inventory1")
.onclick =
()=>selectShape(0);



document
.getElementById("inventory2")
.onclick =
()=>selectShape(1);



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
hint;



document
.getElementById("reveal")
.onclick =
reveal;



document
.getElementById("reset")
.onclick =
()=>{
    game.selectedSlot=null;
};




// START

newEncounter();
