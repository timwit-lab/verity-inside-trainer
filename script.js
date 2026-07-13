const SHAPES = ["▲", "●", "■"];

const NAMES = {
    "▲": "Triangle",
    "●": "Circle",
    "■": "Square"
};


let game = {

    player: null,

    guardians: [],

    phase: 0,

    selectedSlot: null,

    startTime: null,

    timer: null

};


let stats = {

    solved: 0,

    best: null

};



// Elements

const playerStatue =
document.getElementById("playerStatue");

const statueA =
document.getElementById("statueA");

const statueB =
document.getElementById("statueB");


const slot1 =
document.getElementById("slot1");

const slot2 =
document.getElementById("slot2");


const status =
document.getElementById("status");


const log =
document.getElementById("log");


const difficulty =
document.getElementById("difficulty");






function random(arr){

    return arr[Math.floor(Math.random()*arr.length)];

}





function write(text,type=""){

    log.innerHTML +=
    `<div class="${type}">${text}</div>`;

    log.scrollTop = log.scrollHeight;

}





function newEncounter(){


    clearInterval(game.timer);


    log.innerHTML="";


    game.phase=1;


    game.selectedSlot=null;


    game.startTime=Date.now();



    startTimer();



    /*
        Pick player shape
    */


    let playerShape =
    random(SHAPES);



    let others =
    SHAPES.filter(
        x=>x!==playerShape
    );



    /*
        Create the three rooms
    */


    game.player = {

        name:"You",

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

                playerShape

            ]

        },


        {

            name:"Guardian B",

            shape:others[1],

            inventory:[

                others[1],

                others[0]

            ]

        }

    ];



    update();


    status.innerHTML =

    "Phase 1: Send away the shape that is not your statue.";



    write(

    "Your statue is " +
    NAMES[playerShape]

    );


    write(

    "Keep your own shape. Give the other shape away."

    );


}






function update(){


    playerStatue.innerHTML =
    game.player.shape;



    slot1.innerHTML =
    game.player.inventory[0] || "";



    slot2.innerHTML =
    game.player.inventory[1] || "";



    /*
        Raid mode hides other statue details
    */


    if(difficulty.value==="raid"){

        statueA.innerHTML="?";

        statueB.innerHTML="?";

    }

    else {

        statueA.innerHTML =
        game.guardians[0].shape;


        statueB.innerHTML =
        game.guardians[1].shape;

    }


}






function selectSlot(slot){


    if(!game.player.inventory[slot])
        return;


    game.selectedSlot=slot;


    write(

    "Selected " +
    NAMES[
    game.player.inventory[slot]
    ]

    );

}





function sendToGuardian(index){


    if(game.selectedSlot===null){

        write(
        "Select a shape first.",
        "warning"
        );

        return;

    }



    if(game.phase===1){

        phaseOne(index);

    }


    else if(game.phase===2){

        phaseTwo(index);

    }


}







function phaseOne(index){


    let shape =
    game.player.inventory[
        game.selectedSlot
    ];



    let guardian =
    game.guardians[index];



    if(shape===game.player.shape){


        write(
        "Wrong: keep your own shape.",
        "error"
        );

        return;

    }



    if(shape!==guardian.shape){


        write(
        "Wrong guardian for that shape.",
        "error"
        );

        return;

    }



    removeSelected();


    write(

    "Sent " +
    NAMES[shape] +
    " to " +
    guardian.name

    );



    /*
        Simulate other guardians doing
        the same correct strategy
    */


    resolvePhaseOne();



}







function resolvePhaseOne(){


    game.player.inventory=[

        game.player.shape,

        game.player.shape

    ];



    game.phase=2;


    game.selectedSlot=null;



    update();



    status.innerHTML =

    "Phase 2: Give one copy of your shape to each guardian.";



    write(

    "All guardians now have doubles."

    );



}






function phaseTwo(index){


    let guardian =
    game.guardians[index];



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

    "Sent your " +
    NAMES[shape] +
    " to " +
    guardian.name

    );



    if(game.player.inventory.length===0){

        finish();

    }


}





function removeSelected(){


    game.player.inventory.splice(

        game.selectedSlot,

        1

    );


    game.selectedSlot=null;

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



    stopTimer();



    stats.solved++;



    document.getElementById("solved")
    .innerHTML=stats.solved;



    status.innerHTML =

    "SUCCESS — Key created";



    write(

    "Your final key: " +

    key.join(" + "),

    "success"

    );


    update();


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



    game.gu ardians.forEach(g=>{


        write(

        g.name +

        ": " +

        g.shape +

        " " +

        g.inventory.join(" ")

        );


    });


}






function hint(){


    if(game.phase===1){

        let wrong =
        game.player.inventory.find(
            s=>s!==game.player.shape
        );


        write(

        "Hint: Send " +
        NAMES[wrong] +
        " to the matching statue."

        );

    }


    if(game.phase===2){

        write(

        "Hint: Give one of your own shapes to each guardian."

        );

    }


}







function resetMove(){

    game.selectedSlot=null;

    write(
    "Selection cleared."
    );

}






function startTimer(){


    game.timer =
    setInterval(()=>{


        let seconds =
        Math.floor(
        (Date.now()-game.startTime)/1000
        );


        document.getElementById("timer")
        .innerHTML=seconds;



    },1000);


}



function stopTimer(){

    clearInterval(game.timer);

}





slot1.onclick=()=>selectSlot(0);

slot2.onclick=()=>selectSlot(1);



document
.getElementById("guardianA")
.onclick=()=>sendToGuardian(0);


document
.getElementById("guardianB")
.onclick=()=>sendToGuardian(1);



document
.getElementById("newGame")
.onclick=newEncounter;



document
.getElementById("hint")
.onclick=hint;



document
.getElementById("reveal")
.onclick=reveal;



document
.getElementById("reset")
.onclick=resetMove;




newEncounter();
