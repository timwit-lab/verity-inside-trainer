const SHAPES = ["▲", "●", "■"];

const SHAPE_NAMES = {
    "▲": "Triangle",
    "●": "Circle",
    "■": "Square"
};


let game = {
    guardians: [],
    playerIndex: 0,
    phase: 1,
    selectedSlot: null,
    solved: false,
    startTime: 0,
    timer: null
};


let stats = JSON.parse(
    localStorage.getItem("verityStats")
) || {
    solves: 0,
    bestTime: null
};



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

    timer:
    document.getElementById("timer"),

    solves:
    document.getElementById("solves"),

    best:
    document.getElementById("bestTime"),

    mode:
    document.getElementById("mode")
};



function random(arr){
    return arr[Math.floor(Math.random()*arr.length)];
}



function log(message, type=""){

    ui.log.innerHTML +=
    `<div class="${type}">
    ${message}
    </div>`;

    ui.log.scrollTop =
    ui.log.scrollHeight;
}





function createEncounter(){


    clearInterval(game.timer);


    game.phase = 1;
    game.selectedSlot = null;
    game.solved = false;



    ui.log.innerHTML="";



    /*
        Assign statues
    */

    let shuffled =
    [...SHAPES].sort(
        ()=>Math.random()-0.5
    );



    game.guardians =
    shuffled.map((shape,index)=>({

        id:index,

        name:
        "Guardian " +
        String.fromCharCode(65+index),

        statue:shape,

        inventory:[shape]

    }));



    /*
        Give each guardian one
        foreign shape

        This creates the initial
        Verity inside state.
    */


    game.guardians[0].inventory.push(
        game.guardians[1].statue
    );


    game.guardians[1].inventory.push(
        game.guardians[2].statue
    );


    game.guardians[2].inventory.push(
        game.guardians[0].statue
    );



    game.playerIndex=0;



    startTimer();


    update();



    ui.status.innerHTML =
    "Phase 1: Send the shape that is not yours.";

    

    log(
    "Your statue: " +
    SHAPE_NAMES[
    player().statue
    ]
    );


    log(
    "Identify the shape that does not belong to you."
    );

}





function player(){

    return game.guardians[
        game.playerIndex
    ];

}




function update(){


    let p=player();



    ui.yourStatue.innerHTML =
    p.statue;



    ui.inventory1.innerHTML =
    p.inventory[0] || "";

    ui.inventory2.innerHTML =
    p.inventory[1] || "";



    if(ui.mode.value==="training"){

        ui.guardian1.innerHTML =
        game.guardians[1].statue;


        ui.guardian2.innerHTML =
        game.guardians[2].statue;

    }
    else{

        ui.guardian1.innerHTML="?";

        ui.guardian2.innerHTML="?";

    }



    ui.solves.innerHTML =
    stats.solves;


    ui.best.innerHTML =
    stats.bestTime ?
    stats.bestTime+"s":
    "--";

}





function selectSlot(slot){

    game.selectedSlot=slot;

    document
    .querySelectorAll(".shape-button")
    .forEach(
        b=>b.classList.remove("selected")
    );


    document
    .getElementById(
        slot===0?
        "inventory1":
        "inventory2"
    )
    .classList.add("selected");


}






function deposit(targetIndex){


    if(game.selectedSlot===null){

        log(
        "Select a shape first.",
        "warning"
        );

        return;

    }



    let p=player();


    let shape =
    p.inventory[
    game.selectedSlot
    ];



    if(game.phase===1){

        phaseOneDeposit(
            targetIndex,
            shape
        );

    }

    else if(game.phase===2){

        phaseTwoDeposit(
            targetIndex,
            shape
        );

    }


}







function phaseOneDeposit(target,shape){


    let targetGuardian =
    game.guardians[target];



    if(shape===player().statue){

        log(
        "Keep your own shape.",
        "error"
        );

        return;

    }



    if(shape!==targetGuardian.statue){

        log(
        "Wrong statue for that shape.",
        "error"
        );

        return;

    }



    removeShape(shape);



    targetGuardian.inventory.push(shape);



    log(
    "Sent " +
    SHAPE_NAMES[shape] +
    " to " +
    targetGuardian.name,
    "success"
    );



    resolveFirstCycle();



}







function resolveFirstCycle(){


    /*
       Other guardians perform the
       same optimal exchange.
    */


    game.guardians.forEach(g=>{


        g.inventory =
        [
            g.statue,
            g.statue
        ];

    });



    game.phase=2;



    ui.status.innerHTML =
    "Phase 2: Give one copy of your shape to each guardian.";


    log(
    "All guardians now hold doubles."
    );


    update();

}







function phaseTwoDeposit(target,shape){


    if(shape!==player().statue){

        log(
        "Only give your own shape.",
        "error"
        );

        return;

    }



    let targetGuardian =
    game.guardians[target];


    removeShape(shape);


    targetGuardian.inventory.push(
        shape
    );


    if(
    player().inventory.length===0
    ){

        completeEncounter();

    }


    update();

}





function removeShape(shape){


    let index =
    player().inventory.indexOf(shape);


    player()
    .inventory
    .splice(index,1);


    game.selectedSlot=null;

}





function completeEncounter(){


    let finalKey =
    SHAPES.filter(
        s=>s!==player().statue
    );



    player().inventory =
    finalKey;



    game.phase=3;

    game.solved=true;


    stopTimer();



    let elapsed =
    Math.floor(
    (Date.now()-game.startTime)/1000
    );



    stats.solves++;


    if(
    !stats.bestTime ||
    elapsed < stats.bestTime
    ){

        stats.bestTime=elapsed;

    }



    localStorage.setItem(
        "verityStats",
        JSON.stringify(stats)
    );



    ui.status.innerHTML =
    "SUCCESS - Key created";


    log(
    "Final key: " +
    finalKey.join(" + "),
    "success"
    );


    update();

}





function reveal(){


    log(
    "=== Hidden Encounter ==="
    );


    game.guardians.forEach(g=>{

        log(
        g.name+
        " | Statue: "+
        g.statue+
        " | Inventory: "+
        g.inventory.join(" ")
        );

    });

}





function hint(){

    if(game.phase===1){

        let wrong =
        player()
        .inventory
        .find(
        x=>x!==player().statue
        );


        log(
        "Send "+SHAPE_NAMES[wrong]
        );

    }

    else{

        log(
        "Give one of your own shapes to each guardian."
        );

    }

}





function startTimer(){

    game.startTime =
    Date.now();


    game.timer =
    setInterval(()=>{

        ui.timer.innerHTML =
        Math.floor(
        (Date.now()-game.startTime)/1000
        );

    },1000);

}



function stopTimer(){

    clearInterval(
        game.timer
    );

}




// Events

document
.getElementById("newEncounter")
.onclick=createEncounter;


document
.getElementById("inventory1")
.onclick=()=>selectSlot(0);


document
.getElementById("inventory2")
.onclick=()=>selectSlot(1);


document
.getElementById("guardian1")
.onclick=()=>deposit(1);


document
.getElementById("guardian2")
.onclick=()=>deposit(2);


document
.getElementById("hint")
.onclick=hint;


document
.getElementById("reveal")
.onclick=reveal;


document
.getElementById("reset")
.onclick=()=>game.selectedSlot=null;



createEncounter();
