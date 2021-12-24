const fs = require('fs');

let stack = [];
let deadend = 0;
let seen = {}

let id = 0;

let count = 0;
let bad = 0;

function addBoard(b)
{
    let c = b.code();
    if (c in seen) 
    {
        bad++; 
        return; 
    }
    seen[c] = true;
    stack.unshift(b);
}

class board
{
    constructor()
    {
        this.id = id++;
        this.hall = [0,0,0,0,0,0,0,0,0,0,0];
        this.rooms = [];
        this.rooms[0] = [];
        this.rooms[1] = [0,0,0,0];
        this.rooms[2] = [0,0,0,0];
        this.rooms[3] = [0,0,0,0];
        this.rooms[4] = [0,0,0,0];
        this.cost = 0;
        this.step = "";
    }

    code()
    {
        let ret = "";
        for (let h=0; h <= 10; ++h) ret += this.hall[h];
        for (let r=1; r <= 4; ++r) 
        {
            ret += this.rooms[r][0];
            ret += this.rooms[r][1];
            ret += this.rooms[r][2];
            ret += this.rooms[r][3];
        }        
        ret += "."+this.cost;
        return ret;
    }

    copy()
    {
        let ret = new board();
        ret.hall = JSON.parse(JSON.stringify(this.hall));
        ret.rooms = JSON.parse(JSON.stringify(this.rooms));
        ret.cost = this.cost;
        return ret;        
    }

    move()
    {
        let hall = [0,1,2,3,4,5,6,7,8,9,10];
        for (let h in hall)
        {
            this.handleHall(parseInt(hall[h]));
        }
        let rooms = [1,2,3,4];
        for (let r in rooms)
        {
            for (let c = 0; c <= 3; ++c)
            {
                this.handleExit(rooms[r],c);
            }
        }

        deadend++;
        count++;
        if (count == 100000)
        {
            count = 0;
            save();
        }
    }

    handleExit(roomnum, pos)
    {
        let cost = 0;
        let dist = 0;
        switch (roomnum)
        {
            case 1: dist = 2; break;
            case 2: dist = 4; break;
            case 3: dist = 6; break;
            case 4: dist = 8; break;
        }
        switch (this.rooms[roomnum][pos])
        {
            case 1: cost = 1; break;
            case 2: cost = 10; break;
            case 3: cost = 100; break;
            case 4: cost = 1000; break;
        }
        if (this.rooms[roomnum][pos] == 0) return; // no one there to move
        // is the path to hall blocked?
        if (this.hall[dist] != 0) return;
        if (pos == 1 && (this.rooms[roomnum][0] != 0)) return;
        if (pos == 2 && (this.rooms[roomnum][0] != 0 || this.rooms[roomnum][1] != 0)) return;
        if (pos == 3 && (this.rooms[roomnum][0] != 0 || this.rooms[roomnum][1] != 0 || this.rooms[roomnum][2] != 0)) return;
        // are we home? and not blocking anyone
        if (pos == 3 && this.rooms[roomnum][3] == roomnum) return;
        if (pos == 2 && this.rooms[roomnum][3] == roomnum && this.rooms[roomnum][2] == roomnum) return;
        if (pos == 1 && this.rooms[roomnum][3] == roomnum && this.rooms[roomnum][2] == roomnum && this.rooms[roomnum][1] == roomnum) return;
        if (pos == 0 && this.rooms[roomnum][3] == roomnum && this.rooms[roomnum][2] == roomnum && this.rooms[roomnum][1] == roomnum && this.rooms[roomnum][0] == roomnum) return;
        // try to move to every hall space
        // move to the left
        let step = 0;
        for (let p = dist-1; p >= 0; p--)
        {
            step++;
            if (this.hall[p] != 0) break;
            // make new board state
            let newcost = this.cost + step * cost;
            if (pos == 0) { newcost += cost; }
            if (pos == 1) { newcost += cost + cost; }
            if (pos == 2) { newcost += cost + cost + cost; }
            if (pos == 3) { newcost += cost + cost + cost + cost; }
            if (newcost <= low)
            {
                let child = this.copy();
                child.step = this.step + "\n"+ "Move "+this.rooms[roomnum][pos]+" from room "+roomnum+":"+pos+" to hall "+p;
                child.cost = newcost;
                child.hall[p] = this.rooms[roomnum][pos];
                child.rooms[roomnum][pos] = 0;
                addBoard(child);
                child.checkWin();
            }
        }
        // move to the right
        step = 0;
        for (let p = dist+1; p <= 10; p++)
        {
            step++;
            if (this.hall[p] != 0) break;
            // make new board state
            let newcost = this.cost + step * cost;
            if (pos == 0) { newcost += cost; }
            if (pos == 1) { newcost += cost + cost; }
            if (pos == 2) { newcost += cost + cost + cost; }
            if (pos == 3) { newcost += cost + cost + cost + cost; }
            if (newcost <= low)
            {
                let child = this.copy();
                child.step = this.step + "\n"+ "Move "+this.rooms[roomnum][pos]+" from room "+roomnum+":"+pos+" to hall "+p;
                child.cost = newcost;
                child.hall[p] = this.rooms[roomnum][pos];
                child.rooms[roomnum][pos] = 0;
                addBoard(child);
                child.checkWin();
            }
        }
    }

    handleHall(h)
    {
        let dist = 0;
        let cost = 0;
        let type = this.hall[h];
        if (type == 0) return; // no one to move
        // is the target room clear?
        switch (type)
        {
            case 1: dist = 2-h; cost = 1; break;
            case 2: dist = 4-h; cost = 10; break;
            case 3: dist = 6-h; cost = 100; break;
            case 4: dist = 8-h; cost = 1000; break;
        }
        let steps = Math.abs(dist);
        if (this.rooms[type][0] != 0 && this.rooms[type][0] != type) { return; }// cant move into room right now
        if (this.rooms[type][1] != 0 && this.rooms[type][1] != type) { return; }// cant move into room right now
        if (this.rooms[type][2] != 0 && this.rooms[type][2] != type) { return; }// cant move into room right now
        if (this.rooms[type][3] != 0 && this.rooms[type][3] != type) { return; }// cant move into room right now
        // is the way there blocked?
        let step = (dist > 0) ? -1 : 1
        while (dist != 0)
        {
            if (this.hall[h+dist] != 0) { return; } // hall not clear
            dist += step;    
        }
        let newcost = this.cost + cost * steps;
        if (this.rooms[type][3] == 0) { newcost += cost + cost + cost + cost; }
        else if (this.rooms[type][2] == 0) { newcost += cost + cost + cost; }
        else if (this.rooms[type][1] == 0) { newcost += cost + cost; }
        else if (this.rooms[type][0] == 0) { newcost += cost; }
        if (newcost <= low)
        {
            // make new board state
            let child = this.copy();
            child.cost = newcost;
            child.step = this.step + "\n"+ "Move "+type+" from hall "+h+" to room "+type;
            child.hall[h] = 0;
            if (child.rooms[type][3] == 0) { child.rooms[type][3] = type; }
            else if (child.rooms[type][2] == 0) { child.rooms[type][2] = type; }
            else if (child.rooms[type][1] == 0) { child.rooms[type][1] = type; }
            else if (child.rooms[type][0] == 0) { child.rooms[type][0] = type; }
            else console.log("ERROR")
            addBoard(child);
            child.checkWin();               
        }
    }

    checkWin()
    {
        for (let i in this.hall)
        {
            if (this.hall[i] != 0) return false;
        }
        if (this.rooms[1][0] != 1) return false;
        if (this.rooms[1][1] != 1) return false;
        if (this.rooms[1][2] != 1) return false;
        if (this.rooms[1][3] != 1) return false;
        if (this.rooms[2][0] != 2) return false;
        if (this.rooms[2][1] != 2) return false;
        if (this.rooms[2][2] != 2) return false;
        if (this.rooms[2][3] != 2) return false;
        if (this.rooms[3][0] != 3) return false;
        if (this.rooms[3][1] != 3) return false;
        if (this.rooms[3][2] != 3) return false;
        if (this.rooms[3][3] != 3) return false;
        if (this.rooms[4][0] != 4) return false;
        if (this.rooms[4][1] != 4) return false;        
        if (this.rooms[4][2] != 4) return false;
        if (this.rooms[4][3] != 4) return false;        
        if (this.cost < low) 
        {
            winner = this; 
            low = this.cost;
            console.log();
            console.log(this.step);
            console.log();
            save();
        }
        return true;
    }    
}

function save()
{
            // save state
            let data = {};
            data.stack = stack;
            data.deadend = deadend;
            data.low = low;
            data.bad = bad;
            data.seen = seen;
            fs.writeFileSync("memory4.json", JSON.stringify(data));
}

let low = 9999999999;
let log = false;

if (fs.existsSync('./memory4.json')) 
{
    const raw = fs.readFileSync('./memory4.json', {encoding:'utf8', flag:'r'});
    if (raw)
    {
        let data = JSON.parse(raw);
        console.log("resume");
        low = data.low;
        bad = data.bad;
        seen = data.seen;
        deadend = data.deadend;
        for (let src in data.stack)
        {
            let b = new board();
            b.hall  = data.stack[src].hall;
            b.rooms = data.stack[src].rooms;
            b.cost  = data.stack[src].cost;
            b.step  = data.stack[src].step;
            stack.push(b);
        }
    }
}
else
{
    console.log("start");
    let start = new board();
    start.rooms[1] = [3,4,4,4];
    start.rooms[2] = [1,3,2,3];
    start.rooms[3] = [2,2,1,1];
    start.rooms[4] = [4,1,3,2];
    
    start.move();    
}

let winner = null;

while (stack.length)
{
    process.stdout.write("boards: "+stack.length+"    deadends: "+deadend+" win cost: "+low+" avoided loops: "+bad+"           \r");
    let n = 0;
    let board = stack[n];

    stack.splice(n,1);
    board.move();

    if (low == 1) // debugging
    {
        console.log()
        let n = winner;
        while (n)
        {            
            console.log(n.step + " cost: "+ n.cost);
            n = n.parent;
        }
        break;
    }
}
process.stdout.write("boards: "+stack.length+"    deadends: "+deadend+" win cost: "+low+" avoided loops: "+bad+"           \r");
