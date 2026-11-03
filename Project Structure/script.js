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
    n = Number(n);
    if (n <= 0)
        return;
    hanoi(from, to, via, n - 1);   
    moves.push([from, to]);       
    hanoi(via, from, to, n - 1);   
}

function exHanoi_1(start, aux, end, n) {
    n = Number(n);
    const total = 6 * n;
    const rodsList = [start, aux, end];

   const where = [null];
    for (let k = 1; k <= total; k++) {
        const slot = (k - 1) % 6;
        where.push(slot === 0 ? start : (slot < 3 ? aux : end));
    }

    const other = (a, b) => rodsList.find(r => r !== a && r !== b);

    let count = 0, t = end;
    for (let k = total; k >= 1; k--) {
        if (where[k] !== t) {
            count += Math.pow(2, k - 1);
            t = other(where[k], t);
        }
    }
    if (count > 2500000) {
        alert("This number needs too many moves (" + count.toLocaleString() + "). Please enter a smaller number.");
        location.reload();
        return;
    }

    function gather(k, target) {
        if (k === 0)
            return;
        if (where[k] === target) {          
            gather(k - 1, target);
            return;
        }
        const from = where[k];
        const via = other(from, target);
        gather(k - 1, via);                
        moves.push([from, target]);         
        hanoi(via, from, target, k - 1);   
    }

    gather(total, end);
}

function exHanoi_2(A, B, C, D, n) {
    n = Number(n);

    function separate(m, from, X, Y, spare) {
        if (m === 0)
            return;
        separate(m - 1, from, Y, spare, X);
        moves.push([from, X]);                        
        hanoi(spare, from, X, Math.floor((m - 1) / 2)); 
    }

    separate(n, A, C, D, B);
}

function exhanoi_3(A, B, C, n) {
    n = Number(n);
    const total = 5 * n;
    const rodsList = [A, B, C];

    const where = [null];
    for (let k = 1; k <= total; k++)
        where.push(((k - 1) % 5) < 3 ? B : A);

    const other = (a, b) => rodsList.find(r => r !== a && r !== b);

    let count = 0, t = C;
    for (let k = total; k >= 1; k--) {
        if (where[k] !== t) {
            count += Math.pow(2, k - 1);
            t = other(where[k], t);
        }
    }
    if (count > 2500000) {
        alert("This number needs too many moves (" + count.toLocaleString() + "). Please enter a smaller number.");
        location.reload();
        return;
    }

    function gather(k, target) {
        if (k === 0)
            return;
        if (where[k] === target) {
            gather(k - 1, target);
            return;
        }
        const from = where[k];
        const via = other(from, target);
        gather(k - 1, via);
        moves.push([from, target]);
        hanoi(via, from, target, k - 1);
    }

    gather(total, C);
}

function exhanoi_4(A, B, C, D, n) {
    n = Number(n);
    const ring = [A, C, B, D];

    function go(m, i, j) {
        if (m === 0 || i === j)
            return;
        if ((j - i + 4) % 4 === 2) {
            const u = (i + 1) % 4;
            const v = (i + 3) % 4;               
            go(m - 1, i, v);                     
            moves.push([ring[i], ring[u]]);
            moves.push([ring[u], ring[j]]);
            go(m - 1, v, j);
        } else {
            const z = ((j - i + 4) % 4 === 1) ? (i + 3) % 4 : (i + 1) % 4;
            go(m - 1, i, z);
            moves.push([ring[i], ring[j]]);
            go(m - 1, z, j);
        }
    }

    go(n, 0, 1);   
}

function exhanoi_5(A, B, C, D, n) {
    n = Number(n);
    const line = [A, B, C, D];

    // move m disks from rod i to rod j
    function go(m, i, j) {
        if (m === 0 || i === j)
            return;
        const dir = j > i ? 1 : -1;
        let tower = i;                          
        for (let p = i; p !== j; p += dir) {
            const q = p + dir;
            if (m > 1) {
                let park = -1;
                for (let r = 0; r < 4; r++) {
                    if (r === p || r === q)
                        continue;
                    if (park === -1 || Math.abs(r - tower) < Math.abs(park - tower))
                        park = r;
                }
                go(m - 1, tower, park);
                tower = park;
            }
            moves.push([line[p], line[q]]);
        }
        go(m - 1, tower, j);                
    }

    go(n, 0, 3);   // A ----> D
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
