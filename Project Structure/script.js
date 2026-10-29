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

function hanoi(from, via, to, n) {
    if (n <= 0)
        return;
    hanoi(from, to, via, n - 1);
    moves.push([from, to]);
    hanoi(via, from, to, n - 1);
}

function gatherAll(m, target, loc, rodNames) {
    if (m === 0)
        return;
    const p = loc[m];
    if (p === target) {
        gatherAll(m - 1, target, loc, rodNames);
        return;
    }
    const r = rodNames.find(x => x !== p && x !== target);
    gatherAll(m - 1, r, loc, rodNames);
    moves.push([p, target]);
    loc[m] = target;
    gatherAll(m - 1, target, loc, rodNames);
}


function exHanoi_1(start, aux, end, n) {
    const total = 6 * n;
    const loc = [null];
    for (let s = 1; s <= total; s++) {
        const k = s % 6;
        if (k === 1)
            loc[s] = start;
        else if (k === 2 || k === 3)
            loc[s] = aux;
        else
            loc[s] = end;
    }
    gatherAll(total, end, loc, [start, aux, end]);
}


function exHanoi_2(A, B, C, D, n) {
    let src = A;
    let spare = B;
    for (let k = 1; k <= n; k++) {
        const odd = (k % 2 === 1);
        const dest = odd ? C : D;
        const aux  = odd ? D : C;
        hanoi(src, aux, spare, n - k);
        moves.push([src, dest]);
        [src, spare] = [spare, src];
    }
}

function exhanoi_3(A, B, C, n) {
    const total = 5 * n;
    const loc = [null];
    for (let s = 1; s <= total; s++) {
        const k = s % 5;
        loc[s] = (k >= 1 && k <= 3) ? B : A;
    }
    gatherAll(total, C, loc, [A, B, C]);
}

function exhanoi_4(A, B, C, D, n) {
    const adj = { [A]: [C, D], [B]: [C, D], [C]: [A, B], [D]: [A, B] };
    const other = (rod, excluded) => adj[rod].find(t => t !== excluded);

    function near(k, x, y) {
        if (k === 0)
            return;
        const p = other(x, y);
        near(k - 1, x, p);
        moves.push([x, y]);
        far(k - 1, p, y);
    }

    function far(k, x, z) {
        if (k === 0)
            return;
        const [y, p] = adj[x];
        near(k - 1, x, p);
        moves.push([x, y]);
        moves.push([y, z]);
        near(k - 1, p, z);
    }

    near(n, A, C);
}

function exhanoi_5(A, B, C, D, n) {
    const line = [A, B, C, D];
    const memo = new Map();

    function plan(k, i, j) {
        const key = k + ',' + i + ',' + j;
        if (memo.has(key))
            return memo.get(key);

        let result;
        if (k === 0 || i === j) {
            result = { cost: 0, path: [], stack: [] };
        } else {
            const dir = i < j ? 1 : -1;
            const path = [];
            for (let r = i; r !== j; r += dir)
                path.push(r);
            path.push(j);
            const steps = path.length - 1;

            let best = new Map();
            for (let a = 0; a < 4; a++) {
                if (a === path[0] || a === path[1])
                    continue;
                best.set(a, { c: plan(k - 1, i, a).cost, seq: [a] });
            }
            for (let t = 2; t <= steps; t++) {
                const nextBest = new Map();
                for (let a = 0; a < 4; a++) {
                    if (a === path[t - 1] || a === path[t])
                        continue;
                    let bestCost = Infinity;
                    let bestSeq = null;
                    for (const [pa, v] of best) {
                        const c = v.c + plan(k - 1, pa, a).cost;
                        if (c < bestCost) {
                            bestCost = c;
                            bestSeq = v.seq.concat(a);
                        }
                    }
                    nextBest.set(a, { c: bestCost, seq: bestSeq });
                }
                best = nextBest;
            }
            let bestCost = Infinity;
            let bestSeq = null;
            for (const [pa, v] of best) {
                const c = v.c + plan(k - 1, pa, j).cost;
                if (c < bestCost) {
                    bestCost = c;
                    bestSeq = v.seq;
                }
            }
            result = { cost: bestCost + steps, path: path, stack: bestSeq };
        }
        memo.set(key, result);
        return result;
    }

    function run(k, i, j) {
        if (k === 0 || i === j)
            return;
        const { path, stack } = plan(k, i, j);
        let cur = i;
        for (let t = 0; t < path.length - 1; t++) {
            run(k - 1, cur, stack[t]);
            cur = stack[t];
            moves.push([line[path[t]], line[path[t + 1]]]);
        }
        run(k - 1, cur, j);
    }

    run(n, 0, 3);
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
//.............................ExHanoi Number 1..................................\\
exHanoi1.addEventListener("click", () => {
    if(input.value === ""){
        alert("Enter A Number First")
        return
    }
    const number = Number(input.value);
    console.log(number);
    if(!Number.isInteger(number) || (number < 1) || (number > 7)){
        alert("Your Number Is Not In The Range")
        return
    }

    if(number > 3){
        alert("For this exercise 6n disks are used; please enter a number between 1 and 3 so the browser can handle the number of moves")
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
    if (!Number.isInteger(number) || number < 1 || number > 7) {
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
    if (!Number.isInteger(number) || number < 1 || number > 7) {
        alert("Your Number Is Not In The Range");
        return;
    }
    if (number > 4) {
        alert("For this exercise 5n disks are used; please enter a number between 1 and 4 so the browser can handle the number of moves");
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
    const number = Number(input.value);
    if (!Number.isInteger(number) || (number < 1) || (number > 7)) {
        alert("Your Number Is Not In The Range")
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
    if (!Number.isInteger(number) || number < 1 || number > 7) {
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