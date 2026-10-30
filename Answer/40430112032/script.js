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

// ---------------------------------------------------------------------------
// Classic Hanoi
// pseudocode:
//   hanoi(from, via, to, n):
//       if n == 0: return
//       hanoi(from, to, via, n-1)      // move n-1 disks out of the way (to "via")
//       Move from ----> to             // move the biggest disk
//       hanoi(via, from, to, n-1)      // bring the n-1 disks on top of it
// ---------------------------------------------------------------------------
function hanoi(from, via, to, n) {
    if (n <= 0)
        return;
    hanoi(from, to, via, n - 1);
    moves.push([from, to]);
    hanoi(via, from, to, n - 1);
}

// ---------------------------------------------------------------------------
// Helper for ExHanoi 1 and ExHanoi 3 (three rods, disks scattered on the rods)
// pos[d] = rod of the d-th smallest disk (d = 1 is the smallest disk).
// pseudocode (gather d disks on rod T):
//   if disk d is already on T:
//       gather(d-1, T)
//   else:
//       other = the rod that is neither pos[d] nor T
//       gather(d-1, other)             // free disk d and the target rod
//       Move pos[d] ----> T            // move disk d
//       hanoi(other, pos[d], T, d-1)   // all smaller disks are stacked on "other"
// ---------------------------------------------------------------------------
function gatherAll(d, target, pos, pegs) {
    if (d === 0)
        return;
    const p = pos[d];
    if (p !== target) {
        const other = pegs.find(r => r !== p && r !== target);
        gatherAll(d - 1, other, pos, pegs);
        moves.push([p, target]);
        hanoi(other, p, target, d - 1);
    } else {
        gatherAll(d - 1, target, pos, pegs);
    }
    for (let i = 1; i <= d; i++)
        pos[i] = target;
}

// ExHanoi 1: 3 rods, 6n disks. Counting from the smallest disk, every group of 6:
// 1 disk -> A, next 2 disks -> B, next 3 disks -> C. Move everything to C.
function exHanoi_1(start, aux, end, n) {
    n = Number(n);
    const total = 6 * n;
    const pos = [null];
    for (let r = 1; r <= total; r++) {
        const k = (r - 1) % 6;
        pos.push(k === 0 ? start : (k <= 2 ? aux : end));
    }
    gatherAll(total, end, pos, [start, aux, end]);
}

// ExHanoi 2: 4 rods, n disks on A. Disk labels are the numbers written on the
// disks (1 = biggest disk). Odd labels -> C, even labels -> D. B is auxiliary.
// pseudocode:
//   src = A
//   for m = 1 .. n:                      // from the biggest disk to the smallest
//       T    = (m is odd) ? C : D         // where disk m must finally go
//       next = the other target rod       // where the disks above m must wait
//       hanoi(src, B, next, n - m)        // move the n-m smaller disks away
//       if src != T: Move src ----> T     // place disk m
//       src = next                        // the smaller disks are now on "next"
function exHanoi_2(A, B, C, D, n) {
    n = Number(n);
    const target = (m) => (m % 2 === 1 ? C : D);
    let src = A;
    for (let m = 1; m <= n; m++) {
        const T = target(m);
        const next = target(m + 1);
        hanoi(src, B, next, n - m);
        if (src !== T)
            moves.push([src, T]);
        src = next;
    }
}

// ExHanoi 3: 3 rods, 5n disks. Counting from the smallest disk, every group of 5:
// 3 disks -> B, next 2 disks -> A. C is empty. Move everything to C.
function exhanoi_3(A, B, C, n) {
    n = Number(n);
    const total = 5 * n;
    const pos = [null];
    for (let r = 1; r <= total; r++) {
        const k = (r - 1) % 5;
        pos.push(k <= 2 ? B : A);
    }
    gatherAll(total, C, pos, [A, B, C]);
}

// ExHanoi 4: 4 rods, moves are only allowed between {A,B} and {C,D}.
// Rods are split into two sides: left = {A,B}, right = {C,D}.
// pseudocode:
//   cross(k, X, Y)   (X and Y on different sides, so Move X ----> Y is legal)
//       Z = the other rod on Y's side
//       cross(k-1, X, Z)                 // k-1 disks out of the way
//       Move X ----> Y
//       same(k-1, Z, Y)                  // Z and Y are on the same side
//   same(k, X, Y)    (X and Y on the same side: go through the other side)
//       P, Q = the two rods of the other side
//       cross(k-1, X, Q)
//       Move X ----> P
//       Move P ----> Y
//       cross(k-1, Q, Y)
function exhanoi_4(A, B, C, D, n) {
    n = Number(n);
    const all = [A, B, C, D];
    const side = (r) => (r === A || r === B) ? 0 : 1;
    const partner = (r) => all.find(q => q !== r && side(q) === side(r));
    const otherSide = (r) => all.filter(q => side(q) !== side(r));

    function cross(k, X, Y) {
        if (k === 0)
            return;
        const Z = partner(Y);
        cross(k - 1, X, Z);
        moves.push([X, Y]);
        same(k - 1, Z, Y);
    }

    function same(k, X, Y) {
        if (k === 0)
            return;
        const [P, Q] = otherSide(X);
        cross(k - 1, X, Q);
        moves.push([X, P]);
        moves.push([P, Y]);
        cross(k - 1, Q, Y);
    }

    cross(n, A, C);
}

// ExHanoi 5: 4 rods in a line A <-> B <-> C <-> D, move n disks from A to D.
// pseudocode:
//   go(k, p0, p1, p2, p3):               // move k disks from p0 to p3
//       if k == 0: return
//       go(k-1, p0, p1, p2, p3)          // k-1 disks to the far end
//       Move p0 ----> p1
//       Move p1 ----> p2                 // biggest disk crosses the middle
//       go(k-1, p3, p2, p1, p0)          // k-1 disks back to the start end
//       Move p2 ----> p3
//       go(k-1, p0, p1, p2, p3)          // k-1 disks to the far end again
function exhanoi_5(A, B, C, D, n) {
    n = Number(n);

    function go(k, p0, p1, p2, p3) {
        if (k === 0)
            return;
        go(k - 1, p0, p1, p2, p3);
        moves.push([p0, p1]);
        moves.push([p1, p2]);
        go(k - 1, p3, p2, p1, p0);
        moves.push([p2, p3]);
        go(k - 1, p0, p1, p2, p3);
    }

    go(n, A, B, C, D);
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

