const prev  = document.getElementById('btn-prev');
const start = document.getElementById('btn-start');
const stop  = document.getElementById('btn-stop');
const next  = document.getElementById('btn-next');
const end   = document.getElementById('btn-end');
const input = document.getElementById('disk-numbers');
const exHanoi1 = document.getElementById('exhanoi_1');
const exHanoi2 = document.getElementById('exhanoi_2');
const exHanoi3 = document.getElementById('exhanoi_3');
const exHanoi4 = document.getElementById('exhanoi_4');
const exHanoi5 = document.getElementById('exhanoi_5');
let exHanoi;
let moves = [];
let backMoves = []
let TIME = 500;

const rods = {
    A : document.getElementById('A'),
    B : document.getElementById('B'),
    C : document.getElementById('C'),
    D : document.getElementById('D')
}

let disks = [];
function diskCreator(number, className){
    for(let i = 0 ; i < number; i++){
        const disk = document.createElement("div");
        disk.classList.add(className);

        if(window.innerWidth < 480)
            disk.style.width = `calc(60px + ${(number - i*2)}px)`;
        else if(window.innerWidth < 768)
            disk.style.width = `calc(90px + ${(number - i*3)}px)`;
        else if(window.innerWidth < 992)
            disk.style.width = `calc(130px + ${(number - i*4)}px)`;
        else
            disk.style.width = `calc(170px + ${(number - i*5)}px)`;
        disk.innerText = i + 1;
        disks.push(disk);
    }
}

// for Move A --> B use this: moves.push([A, B])
function hanoi(from, via, to, n) {
    if (n <= 0) return;

    hanoi(from, to, via, n - 1);
    moves.push([from, to]);
    hanoi(via, from, to, n - 1);
}

function exHanoi_1(start, aux, end, n) {
    const total = 6 * n;
    const position = new Array(total + 1);

    let index = total - 1;

    for (let i = 0; i < n; i++) {
        position[index + 1] = start;
        index--;

        for (let j = 0; j < 2; j++) {
            position[index + 1] = aux;
            index--;
        }

        for (let j = 0; j < 3; j++) {
            position[index + 1] = end;
            index--;
        }
    }

    function solve(disk, target) {
        if (disk > total) return;

        const from = position[disk];

        if (from === target) {
            solve(disk + 1, target);
            return;
        }

        const via = [start, aux, end].find(
            rod => rod !== from && rod !== target
        );

        solve(disk + 1, via);

        moves.push([from, target]);
        position[disk] = target;

        solve(disk + 1, target);
    }

    solve(1, end);
}

function exHanoi_2(A, B, C, D, n) {
    const start = "A".repeat(n);
    const goal = Array.from(
        { length: n },
        (_, i) => (i + 1) % 2 === 1 ? "C" : "D"
    ).join("");

    const queue = [start];
    const previous = new Map([[start, null]]);

    let head = 0;

    while (head < queue.length) {
        const state = queue[head++];

        if (state === goal) break;

        const tops = {};

        for (let i = 0; i < n; i++) {
            tops[state[i]] = i + 1;
        }

        for (const from of [A, B, C, D]) {
            const disk = tops[from];

            if (disk === undefined) continue;

            for (const to of [A, B, C, D]) {
                if (from === to) continue;

                const top = tops[to];

                if (top !== undefined && disk < top) continue;

                const next = state.split("");
                next[disk - 1] = to;

                const nextState = next.join("");

                if (previous.has(nextState)) continue;

                previous.set(nextState, {
                    state,
                    move: [from, to]
                });

                queue.push(nextState);
            }
        }
    }

    if (!previous.has(goal)) return;

    const result = [];
    let state = goal;

    while (previous.get(state) !== null) {
        const step = previous.get(state);
        result.push(step.move);
        state = step.state;
    }

    moves.push(...result.reverse());
}

function exhanoi_3(A, B, C, n) {
    const total = 5 * n;
    const position = new Array(total + 1);

    for (let index = total - 1; index >= 0; index -= 5) {
        position[index + 1] = B;
        position[index] = B;
        position[index - 1] = B;
        position[index - 2] = A;
        position[index - 3] = A;
    }

    function solve(disk, target) {
        if (disk > total) return;

        const from = position[disk];

        if (from === target) {
            solve(disk + 1, target);
            return;
        }

        const via = [A, B, C].find(
            rod => rod !== from && rod !== target
        );

        solve(disk + 1, via);

        moves.push([from, target]);
        position[disk] = target;

        solve(disk + 1, target);
    }

    solve(1, C);
}

function exhanoi_4(A, B, C, D, n) {
    const start = A.repeat(n);
    const goal = C.repeat(n);

    const rods = [A, B, C, D];

    const allowed = {
        [A]: [C, D],
        [B]: [C, D],
        [C]: [A, B],
        [D]: [A, B]
    };

    const queue = [start];
    const previous = new Map([[start, null]]);

    let head = 0;

    while (head < queue.length) {
        const state = queue[head++];

        if (state === goal) break;

        const tops = {};

        for (let i = 0; i < n; i++) {
            tops[state[i]] = i + 1;
        }

        for (const from of rods) {
            const disk = tops[from];

            if (disk === undefined) continue;

            for (const to of allowed[from]) {
                const top = tops[to];

                if (top !== undefined && disk < top) continue;

                const next = state.split("");
                next[disk - 1] = to;

                const nextState = next.join("");

                if (previous.has(nextState)) continue;

                previous.set(nextState, {
                    state,
                    move: [from, to]
                });

                queue.push(nextState);
            }
        }
    }

    if (!previous.has(goal)) return;

    const result = [];
    let state = goal;

    while (previous.get(state) !== null) {
        const step = previous.get(state);
        result.push(step.move);
        state = step.state;
    }

    moves.push(...result.reverse());
}

function exhanoi_5(A, B, C, D, n) {
    const start = A.repeat(n);
    const goal = D.repeat(n);

    const allowed = {
        [A]: [B],
        [B]: [A, C],
        [C]: [B, D],
        [D]: [C]
    };

    const rods = [A, B, C, D];

    const queue = [start];
    const previous = new Map([[start, null]]);

    let head = 0;

    while (head < queue.length) {
        const state = queue[head++];

        if (state === goal) break;

        const tops = {};

        for (let i = 0; i < n; i++) {
            tops[state[i]] = i + 1;
        }

        for (const from of rods) {
            const disk = tops[from];

            if (disk === undefined) continue;

            for (const to of allowed[from]) {
                const top = tops[to];

                if (top !== undefined && disk < top) continue;

                const next = state.split("");
                next[disk - 1] = to;

                const nextState = next.join("");

                if (previous.has(nextState)) continue;

                previous.set(nextState, {
                    state,
                    move: [from, to]
                });

                queue.push(nextState);
            }
        }
    }

    if (!previous.has(goal)) return;

    const result = [];
    let state = goal;

    while (previous.get(state) !== null) {
        const step = previous.get(state);
        result.push(step.move);
        state = step.state;
    }

    moves.push(...result.reverse());
}


function moveDisks(from, to){
    const fromEl = rods[from];
    const toEl = rods[to];
    const disk = fromEl.firstChild;
    if(TIME > 200){
        disk.animate([
            {bottom: "500px"},
            {bottom: "0"}
        ], TIME-200)
    }
    toEl.insertBefore(disk, toEl.firstChild);
}

function start_stop(){
    if(start.classList != "btn-disabled")
        start.classList.add("btn-disabled")
    else
        start.classList.remove("btn-disabled");

    const myInterval = setInterval(() =>{
        if(moves.length === 0)
            return
        const [from, to] = moves.shift();
        backMoves.push([from, to]);
        moveDisks(from, to);
        if(moves.length < 1){
            stop.click();
            next.classList.add("btn-disabled");
            start.classList.add("btn-disabled");
            end.classList.add("btn-disabled");
        }
        console.log(`${from} -----> ${to}`);
    },TIME);

    stop.addEventListener("click", () => {
        stop.classList.add("btn-disabled");
        start.classList.remove("btn-disabled");
        clearInterval(myInterval);
    })
}
function nextMove(){
    next.classList.remove("btn-disabeld");
    prev.classList.remove("btn-disabeld");
    const [from, to] = moves.shift();
    backMoves.push([from, to]);
    moveDisks(from, to);
    console.log(`${from} -----> ${to}`);
    if(moves.length < 1){
        stop.click();
        next.classList.add("btn-disabled");
        start.classList.add("btn-disabled");
        end.classList.add("btn-disabled");
    }

}
function prevMove(){
    if(backMoves.length < 1)
        return;
    const [to, from] = backMoves.pop();
    moves.unshift([to, from]);
    moveDisks(from, to);
    console.log(`${from} -----> ${to}`);
    if(backMoves.length < 1)
        prev.classList.add("btn-disabled")
}
function endMoves(){
    stop.click();
    TIME = 1;
    start.click();
}
input.addEventListener("keydown", (e) => {
    if(e.key == 'Enter')
        exHanoi1.click();
})
document.addEventListener("keydown", (e) => {;
    switch (e.key) {
        case 'a':
            prev.click();
            break;
        case 'd':
            next.click();
            break;
        case 's':
            start.click();
            break;
        case ' ':
            stop.click();
            break;
    }
})
function buttonsWorks(){
    start.classList.remove("btn-disabled");
    if(backMoves.length > 0)
        prev.classList.remove("btn-disabled");


    next.classList.remove("btn-disabled");
    end.classList.remove("btn-disabled");
    exHanoi1.classList.add("btn-disabled");
    exHanoi2.classList.add("btn-disabled");
    exHanoi3.classList.add("btn-disabled");
    exHanoi4.classList.add("btn-disabled");
    exHanoi5.classList.add("btn-disabled");
    input.classList.add("btn-disabled");
    input.disabled = true;

    start.addEventListener("click", () =>{
        stop.classList.remove("btn-disabled");
        start_stop();
        prev.classList.remove("btn-disabled");
        if(moves.length < 1){
            next.classList.add("btn-disabled");
            end.classList.add("btn-disabled");
            stop.click();
            start.classList.add("btn-disabled");
        }
    })
    next.addEventListener("click", () => {
        nextMove();
        prev.classList.remove("btn-disabled");
    })
    prev.addEventListener("click", () => {
        prevMove();
        next.classList.remove("btn-disabled");
        start.classList.remove("btn-disabled");
        end.classList.remove("btn-disabled");
    })
    end.addEventListener("click", () => {
        endMoves();
    })
}
//.............................ExHanoi Number 1..................................\\
exHanoi1.addEventListener("click", () => {
    if(input.value === ""){
        alert("Enter A Number First")
        return
    }
    const number = input.value;
    console.log(number);
    if((number < 0) || (number > 7)){
        alert("Your Number Is Not In The Range")
        location.reload();
        return
    }
    
    diskCreator(6*number, "disk");

    let index = 6*number - 1;
    while(index >= 0){
        rods.A.appendChild(disks[index])
        index--;
        for(let j = 0; j < 2; j++){
            rods.B.appendChild(disks[index])        
            index--;
        }
        for(let j = 0; j < 3; j++){
            rods.C.appendChild(disks[index])        
            index--;
        }
    }
    buttonsWorks()
    exHanoi_1('A', 'B', 'C', number);
    console.log(`Number Of Moves : ${moves.length}`);
    
})

//.............................ExHanoi Number 2..................................\\
exHanoi2.addEventListener("click", () => {
    if (input.value === "") {
        alert("Enter A Number First");
        return;
    }
    const number = Number(input.value);
    if (number < 1 || number > 7) {
        alert("Your Number Is Not In The Range");
        return;
    }
    rods.D.classList.remove("noDisplay");
    diskCreator(number, "disk");
    for (let index = number - 1; index >= 0; index--) {
        rods.A.appendChild(disks.pop());
    }
    buttonsWorks();
    exHanoi_2("A", "B", "C", "D", number);
    console.log(`Number Of Moves : ${moves.length}`);
});


//.............................ExHanoi Number 3..................................\\
exHanoi3.addEventListener("click", () => {
    if (input.value === "") {
        alert("Enter A Number First");
        return;
    }
    const number = Number(input.value);
    if (number < 1 || number > 7) {
        alert("Your Number Is Not In The Range");
        return;
    }
    diskCreator(5 * number, "disk");
    for (let index = 5 * number - 1; index >= 0; index-=5) {
        rods.B.appendChild(disks[index]);
        rods.B.appendChild(disks[index-1]);
        rods.B.appendChild(disks[index-2]);
        rods.A.appendChild(disks[index-3]);
        rods.A.appendChild(disks[index-4]);
    }
    buttonsWorks();
    exhanoi_3("A", "B", "C", number);
    console.log(`Number Of Moves : ${moves.length}`);
});


//.............................ExHanoi Number 4..................................\\
exHanoi4.addEventListener("click", () => {
    if (input.value === "") {
        alert("Enter A Number First")
        return
    }
    const number = input.value;
    if ((number < 0) || (number > 7)) {
        alert("Your Number Is Not In The Range")
        location.reload();
        return
    }
    rods.D.classList.remove("noDisplay")
    diskCreator(number, "disk")

    for (let index = number - 1; index >= 0; index--)
        rods.A.appendChild(disks.pop());
    buttonsWorks()
    exhanoi_4('A', 'B', 'C', 'D', number)
    console.log(`Number Of Moves : ${moves.length}`);
})

//.............................ExHanoi Number 5..................................\\
exHanoi5.addEventListener("click", () => {
    if (input.value === "") {
        alert("Enter A Number First");
        return;
    }
    const number = Number(input.value);
    if (number < 1 || number > 7) {
        alert("Your Number Is Not In The Range");
        return;
    }
    rods.D.classList.remove("noDisplay");
    diskCreator(number, "disk");
    for (let index = number - 1; index >= 0; index--) {
        rods.A.appendChild(disks.pop());
    }
    buttonsWorks();
    exhanoi_5("A", "B", "C", "D", number);
    console.log(`Number Of Moves : ${moves.length}`);
});

