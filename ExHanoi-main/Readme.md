# Extended Hanoi

In this assignment, we delve into one of the most renowned problems in recursive functions: The Towers of Hanoi. However, this assignment is based on the extended form of it.

In this assignment, you won't need to implement the graphic of the project. The only thing you will need to do is to complete five functions below.

Before we start, let me clarify that first of all, you should try to write pseudocode for each function. After that, try to convert it to JavaScript code. To convert your pseudocode to JavaScript code, you can use the following example in this project:

```
pseudocode: Move A ----> B
JS Code: moves.push([A, B])
```

## Hanoi

As you may know, when implementing extended Hanoi problems, you will need to use the Hanoi function. So, first, please implement the normal Hanoi function. This function is created to move n disks from the "from" rod to the "to" rod, with the help of the "via" rod.

## exhanoi_1

The first extended Hanoi problem involves three rods. When you enter a number n, 3 disks go on the third rod, 2 disks go on the second rod, and 1 disk goes on the first rod. This operation continues until the number of disks on the first rod reaches n. Implement this function to move all disks to the third rod.

## exhanoi_2

The second extended Hanoi problem involves four rods. When you enter a number n, all n disks go on the first rod. Your task is to separate the disks based on their sizes: disks with odd numbers must go on the third rod, and disks with even numbers must go on the fourth rod. The second rod can be used as an auxiliary rod.

## exhanoi_3

The third extended Hanoi problem involves three rods. When you enter a number n, 2n disks go on the first rod, and 3n disks go on the second rod. The third rod is initially empty. The task of this function is to move all disks to the third rod.

## exhanoi_4

The fourth extended Hanoi problem involves four rods. When you enter a number n, n disks goes on the first rod. The task of this function is to move all disks to the third rod; but there are some rules.

### exhanoi_4 Rules:

You can only move disks between some rods. You can only move disks between rod A & C, A & D, B & C and B & D
rods A and B cannot move disks from one to another.

## exhanoi_5

The fifth extended Hanoi problem involves four rods. When you enter a number n, all n disks go on the first rod. The task of this function is to move all disks to the fourth rod, but there are some rules.

### exhanoi_5 Rules:

Each rod can only exchange disks with adjacent rods.
A <----> B <----> C <----> D
You can only move disks between rod A & B, B & C and C & D. Direct movements between non-adjacent rods are not allowed.

### Important note

Don't forget that all of these functions act as rules of the classic Hanoi problem, and all of those rules still apply.



This project developed by [Aryan Nourbakhsh](https://github.com/Aryanoor)
