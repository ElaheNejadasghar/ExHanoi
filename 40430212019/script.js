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

const MAX_MOVES = 2500000;

function tooManyMoves(total) {
    if (total <= MAX_MOVES)
        return false;
    alert(`This number needs ${total.toLocaleString()} moves, which is too many to run in the browser. Please enter a smaller number.`);
    location.reload();
    return true;
}

function hanoi(from, via, to, n) {
    n = Number(n);
    if (n <= 0)
        return;
    hanoi(from, to, via, n - 1);
    moves.push([from, to]);
    hanoi(via, from, to, n - 1);
}

function gatherDisks(k, target, position, rodList) {
    if (k === 0)
        return;
    if (position[k] === target) {
        gatherDisks(k - 1, target, position, rodList);
        return;
    }
    const source = position[k];
    const aux = rodList.find(rod => rod !== source && rod !== target);
    gatherDisks(k - 1, aux, position, rodList);
    moves.push([source, target]);
    hanoi(aux, source, target, k - 1);
}

function countGatherMoves(total, target, position, rodList) {
    let count = 0;
    for (let k = total; k >= 1; k--) {
        if (position[k] === target)
            continue;
        const source = position[k];
        count += Math.pow(2, k - 1);
        target = rodList.find(rod => rod !== source && rod !== target);
    }
    return count;
}

function exHanoi_1(start, aux, end, n) {
    n = Number(n);
    const total = 6 * n;
    const rodList = [start, aux, end];
    const position = [null];
    for (let k = 1; k <= total; k++) {
        const slot = (k - 1) % 6;
        position.push(slot === 0 ? start : (slot < 3 ? aux : end));
    }
    if (tooManyMoves(countGatherMoves(total, end, position, rodList)))
        return;
    gatherDisks(total, end, position, rodList);
}

function splitDisks(m, source, first, second, spare) {
    if (m <= 0)
        return;
    splitDisks(m - 1, source, second, spare, first);
    moves.push([source, first]);
    hanoi(spare, source, first, Math.floor((m - 1) / 2));
}

function exHanoi_2(A, B, C, D, n) {
    n = Number(n);
    splitDisks(n, A, C, D, B);
}

function exhanoi_3(A, B, C, n) {
    n = Number(n);
    const total = 5 * n;
    const rodList = [A, B, C];
    const position = [null];
    for (let k = 1; k <= total; k++) {
        const slot = (k - 1) % 5;
        position.push(slot < 3 ? B : A);
    }
    if (tooManyMoves(countGatherMoves(total, C, position, rodList)))
        return;
    gatherDisks(total, C, position, rodList);
}

function solveRestricted(names, adj, n, fromRod, toRod) {
    const RODS = names.length;
    const memo = new Map();

    function simplePaths(from, to, blocked) {
        const result = [];
        const path = [from];
        function walk(u) {
            if (u === to) {
                result.push(path.slice());
                return;
            }
            for (const v of adj[u]) {
                if (path.includes(v) || ((blocked >> v) & 1))
                    continue;
                path.push(v);
                walk(v);
                path.pop();
            }
        }
        walk(from);
        return result;
    }

    function best(m, from, to, blocked) {
        if (m === 0 || from === to)
            return { cost: 0, plan: null };
        if (((blocked >> from) & 1) || ((blocked >> to) & 1))
            return { cost: Infinity, plan: null };
        const key = m + "|" + from + "|" + to + "|" + blocked;
        if (memo.has(key))
            return memo.get(key);

        let result = { cost: Infinity, plan: null };

        for (const path of simplePaths(from, to, blocked)) {
            const steps = path.length - 1;
            if (m === 1) {
                if (steps < result.cost)
                    result = { cost: steps, plan: { type: "walk", path: path, parks: [] } };
                continue;
            }
            let layer = new Map([[from, { cost: 0, parks: [] }]]);
            for (let s = 1; s <= steps; s++) {
                const nextLayer = new Map();
                for (let q = 0; q < RODS; q++) {
                    if (q === path[s - 1] || q === path[s] || ((blocked >> q) & 1))
                        continue;
                    let bestEntry = null;
                    for (const [cur, entry] of layer) {
                        const c = entry.cost + best(m - 1, cur, q, blocked).cost + 1;
                        if (bestEntry === null || c < bestEntry.cost)
                            bestEntry = { cost: c, parks: entry.parks.concat(q) };
                    }
                    if (bestEntry !== null)
                        nextLayer.set(q, bestEntry);
                }
                layer = nextLayer;
            }
            for (const [cur, entry] of layer) {
                const c = entry.cost + best(m - 1, cur, to, blocked).cost;
                if (c < result.cost)
                    result = { cost: c, plan: { type: "walk", path: path, parks: entry.parks } };
            }
        }

        for (let k = 1; k < m; k++) {
            for (let z = 0; z < RODS; z++) {
                if (z === from || z === to || ((blocked >> z) & 1))
                    continue;
                const c = best(k, from, z, blocked).cost
                        + best(m - k, from, to, blocked | (1 << z)).cost
                        + best(k, z, to, blocked).cost;
                if (c < result.cost)
                    result = { cost: c, plan: { type: "split", k: k, z: z } };
            }
        }

        memo.set(key, result);
        return result;
    }

    function solve(m, from, to, blocked) {
        if (m === 0 || from === to)
            return;
        const plan = best(m, from, to, blocked).plan;
        if (plan.type === "walk") {
            let cur = from;
            for (let s = 1; s < plan.path.length; s++) {
                if (m > 1) {
                    solve(m - 1, cur, plan.parks[s - 1], blocked);
                    cur = plan.parks[s - 1];
                }
                moves.push([names[plan.path[s - 1]], names[plan.path[s]]]);
            }
            if (m > 1)
                solve(m - 1, cur, to, blocked);
        } else {
            solve(plan.k, from, plan.z, blocked);
            solve(m - plan.k, from, to, blocked | (1 << plan.z));
            solve(plan.k, plan.z, to, blocked);
        }
    }

    solve(n, fromRod, toRod, 0);
}

function exhanoi_4(A, B, C, D, n) {
    n = Number(n);
    const allowed = [
        [2, 3],  
        [2, 3],  
        [0, 1],   
        [0, 1]    
    ];
    solveRestricted([A, B, C, D], allowed, n, 0, 2);
}

function exhanoi_5(A, B, C, D, n) {
    n = Number(n);
    const allowed = [
        [1],      
        [0, 2],   
        [1, 3],   
        [2]      
    ];
    solveRestricted([A, B, C, D], allowed, n, 0, 3);
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
    if(moves.length < 1)
        return;
    next.classList.remove("btn-disabled");
    prev.classList.remove("btn-disabled");
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
exHanoi1.addEventListener("click", () => {
    if(input.value === ""){
        alert("Enter A Number First")
        return
    }
    const number = input.value;
    console.log(number);
    if((number < 0) || (number > 5)){
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

exHanoi2.addEventListener("click", () => {
    if (input.value === "") {
        alert("Enter A Number First");
        return;
    }
    const number = Number(input.value);
    if (number < 1 || number > 5) {
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

exHanoi3.addEventListener("click", () => {
    if (input.value === "") {
        alert("Enter A Number First");
        return;
    }
    const number = Number(input.value);
    if (number < 1 || number > 5) {
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

exHanoi4.addEventListener("click", () => {
    if (input.value === "") {
        alert("Enter A Number First")
        return
    }
    const number = input.value;
    if ((number < 0) || (number > 5)) {
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

exHanoi5.addEventListener("click", () => {
    if (input.value === "") {
        alert("Enter A Number First");
        return;
    }
    const number = Number(input.value);
    if (number < 1 || number > 5) {
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