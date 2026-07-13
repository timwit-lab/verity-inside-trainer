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
    document.getElementById("bestTime")
};



function randomItem(array){
    return array[
        Math.floor(Math.random()*array.length)
    ];
}



function player(){
    return game.guardians[game.playerId];
}



function writeLog(message,type=""){

    ui.log.innerHTML +=
    `<div class="${type}">${message}</div>`;

    ui.log.scrollTop =
    ui.log.scrollHeight;

}





function generateEncounter(){


    ui.log.innerHTML="";


    let statues =
    [...SHAPES]
    .sort(
        ()=>Math.random()-0.5
    );



    game.guardians =
    statues.map((shape,index)=>({

        id:index,

        name:
        "Guardian " +
        String.fromCharCode(65+index),

        statue:shape,

        inventory:[]

    }));


    game.playerId=0;


    let p=player();



    let otherShapes =
    SHAPES.filter(
        s=>s!==p.statue
    );



    /*
        Only valid starting states:

        1. Own + foreign
        2. Own + own
    */


    if(Math.random()<0.5){


        p.inventory=[

            p.statue,

            randomItem(otherShapes)

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
        believable inventories
    */


    game.guardians
    .filter(
        g=>g.id!==0
    )
    .forEach(g=>{


        let foreign =
        SHAPES.filter(
            s=>s!==g.statue
        );


        g.inventory=[

            g.statue,

            randomItem(foreign)

        ];

    });



    game.phase=1;

    game.selectedSlot=null;

    game.solved=false;



    writeLog(
        "Your statue is " +
        SHAPE_NAMES[p.statue]
    );


    writeLog(
        "You are holding: " +
        p.inventory.join(" ")
    );


    startTimer();

    updateUI();

}





function updateUI(){


    let p=player();


    ui.yourStatue.innerHTML =
    p.statue;


    ui.inventory1.innerHTML =
    p.inventory[0] || "";


    ui.inventory2.innerHTML =
    p.inventory[1] || "";


    ui.solves.innerHTML =
    stats.solves;


    ui.best.innerHTML =
    stats.bestTime ?
    stats.bestTime+"s" :
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
        slot===0 ?
        "inventory1" :
        "inventory2"
    )
    .classList.add("selected");

}





function sendShape(targetId){


    if(game.selectedSlot===null){

        writeLog(
            "Select a shape first."
        );

        return;

    }


    let shape =
    player().inventory[
        game.selectedSlot
    ];



    let target =
    game.guardians[targetId];



    if(game.phase!==1){

        writeLog(
            "Phase handling coming next."
        );

        return;

    }




    /*
        Mixed case:
        send foreign shape
        to matching statue
    */


    if(shape!==player().statue){


        if(shape!==target.statue){


            writeLog(
                "That shape belongs to another guardian.",
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


    }


    /*
        Double own case:
        send your own shape away
    */


    else{


        removePlayerShape(shape);


        target.inventory.push(shape);


        writeLog(
            "Sent your own shape to " +
            target.name
        );

    }



    updateUI();


}





function removePlayerShape(shape){


    let index =
    player()
    .inventory
    .indexOf(shape);


    if(index>-1){

        player()
        .inventory.splice(
            index,
            1
        );

    }

}





function startTimer(){

    clearInterval(game.timer);


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

    clearInterval(game.timer);

}





function hint(){


    let p=player();


    let foreign =
    p.inventory.find(
        s=>s!==p.statue
    );


    if(foreign){


        writeLog(
            "Send " +
            SHAPE_NAMES[foreign] +
            " to the guardian holding that statue."
        );


    }
    else{


        writeLog(
            "You have two copies of your shape. Send one to each other guardian."
        );


    }

}





function reveal(){


    game.guardians.forEach(g=>{


        writeLog(
            g.name +
            ": " +
            g.statue +
            " | " +
            g.inventory.join(" ")
        );


    });

}





document
.getElementById("newEncounter")
.onclick =
generateEncounter;



document
.getElementById("inventory1")
.onclick =
()=>selectSlot(0);



document
.getElementById("inventory2")
.onclick =
()=>selectSlot(1);



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




generateEncounter();
