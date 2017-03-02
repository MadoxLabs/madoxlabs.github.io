/*
room id name 
desc
? req ? desc
- dir id

thing id startsin req
text
? req ? text
@ req ? actionid choicetext

action id goto move
text
! set
@ req ? actionid choicetext
*/

// takes in a text block and ouputs it line by line
class inputSource
{
  constructor(text)
  {
    if (text)
    {
      this.text = text.replace("/r", "");
      this.lines = text.split("\n");
    }
    else
    {
      this.text = "";
      this.lines = 0;
    }
    this.line = 0;
  }
  getLine()
  {
    return this.line;
  }
  next()
  {
    if (this.eof()) return "";
    return this.lines[this.line++];
  }
  nextType()
  {
    if (this.eof()) return "";
    return this.lines[this.line][0];
  }
  eof()
  {
    return (this.line >= this.lines.length);
  }
}

// contains the required state to check against, returns if its met or not
class gRequirement
{
  constructor()
  {
    this.stateReq = [];
  }
  parse(input)
  {
    if (!input) return false;
    if (input[0] != '?') return false;

    let end = input.substring(1).indexOf('?');
    if (end < 1) return false;

    this.stateReq = input.substring(1, end).trim().split(" ");
    return end + 1;
  }
  addStateReq(req)
  {
    this.stateReq.push(req);
  }
  isSatisfied(state)
  {
    let ok = true;
    this.stateReq.map((term) => (ok = (!state[term]) ? false : ok));
    return ok;
  }
}

// holds a single optional line of text
class gReqDescription extends gRequirement
{
  constructor()
  {
    super();
    this.text = "";
  }
  setText(text)
  {
    this.text = text;
  }
  parse(input)
  {
    if (input.eof()) return false;

    let line = input.next();
    if (line[0] != '?') return false;

    let end = super.parse(line);
    if (!end || end < 1) return false;

    this.text = line.substring(end + 1).trim();
    return true;
  }
  toString(state)
  {
    if (super.isSatisfied(state)) return this.text;
    return "";
  }
}

// holds a description that has many optional elements
class gDescription
{
  constructor()
  {
    this.reqs = [];
    this.text = "";
  }
  toString(state)
  {
    let ret = this.text;
    this.reqs.map((req) => (ret += req.toString(state)));
    return ret;
  }
  parse(input)
  {
    if (input.eof()) return false;

    this.setText(input.next());
    while (input.nextType() == '?') this.addReq(input);

    return true;
  }
  setText(text)
  {
    this.text = text;
  }
  addReq(req)
  {
    let type = Object.getPrototypeOf(req).constructor.name;
    if (type == "inputSource")
    {
      let r = new gReqDescription();
      if (r.parse(req)) this.reqs.push(r);
      else console.log("Bad requirement line in description. line " + req.getLine());
    }
    if (type == "gRequirement") this.reqs.push(req);
  }
}

// holds an action trigger that is only available under certain conditions
class gTrigger extends gRequirement
{
  constructor()
  {
    super();
    this.id = 0;
    this.text = "";
  }
  parse(line)
  {
//    line.substr[0] = '?';
    let end = super.parse(line.replace("@", "?"));
    if (!end) return false;
    let words = line.substr(end).split(" ");
    this.id = words[0];
    this.text = words.slice(1).join(" ");
    return true;
  }
}

/////////////
// Main objects:

class gThing extends gRequirement
{
  constructor(id, starts, req)
  {
    super();
    this.curaction = 0;
    this._id = id;
    this._starts = starts;
    this.desc = new gDescription();
    this.triggers = [];
    if (req.length) req.map((r) => super.addStateReq(r));
  }
  getDesc(state)
  {
    return this.desc.toString(state);
  }
  get id() { return this._id; }
  get starts() { return this._starts; }
  parse(input)
  {
    if (input.eof()) return false;
    this.desc.parse(input);
    while (true)
    {
      if (input.eof()) break;
      if (input.nextType() != "@") break;

      let line = input.next();
      let t = new gTrigger();
      if (t.parse(line)) this.triggers[t.id] = t;
    }
    return true;
  }
  getActions(state)
  {
    let ret = {};
    this.triggers.map((t) => { if (t.isSatisfied(state)) ret[t.id] = t.text; });
    return ret;
  }
}

class gRoom
{
  constructor(id, name)
  {
    this._id = id;
    this._name = name;
    this.desc = new gDescription();
    this.dir = {};
    this.things = [];
  }
  parse(input)
  {
    if (input.eof()) return false;
    this.desc.parse(input);
    while (true)
    {
      if (input.eof()) break;
      if (input.nextType() != "-") break;

      let line = input.next();
      let end = line.lastIndexOf(" ");
      if (end < 3) return false;
      let id = line.substring(end + 1);
      this.dir[line.substring(2, end).trim()] = id;
    }
    return true;
  }
  addThing(thing) { this.things.push(thing); }
  getDir(dir)
  {
    return this.dir[dir];
  }
  getDesc(state)
  {
    return this.desc.toString(state);
  }
  get id() { return this._id; }
  get name() { return this._name; }
}

class gAction
{
  constructor(id, starts, goto, move)
  {
    this._id = id;
    this._text = "";
    this._starts = starts;
    this._goto = goto;
    this._move = move;
    this.set = [];
    this.triggers = [];
  }
  get text() { return this._text; }
  get id() { return this._id; }
  get starts() { return this._starts; }
  get move() { return this._move; }
  get goto() { return this._goto; }
  parse(input)
  {
    if (input.eof()) return false;
    this._text = input.next;
    while (true)
    {
      if (input.eof()) break;
      if (input.nextType() == "@")
      {
        let line = input.next();
        let t = new gTrigger();
        if (t.parse(line)) this.triggers[t.id] = t;
      }
      if (input.nextType() == "!")
      {
        let vals = input.next().substr(2).split(" ");
        vals.map((v) => (this.set.push(v)));
      }
    }
    return true;
  }
  setState(state)
  {
    for (var i in action.set) 
    this.set.map((s) => { if (s[0] == '!') delete state[s.substr(1)]; else state[s] = true; });
  }
  getActions(state)
  {
    let ret = {};
    this.triggers.map((t) => { if (t.isSatisfied(state)) ret[t.id] = t.text; });
    return ret;
  }
}

class Game
{
  constructor()
  {
    this.rooms = {};
    this.things = {};
    this.actions = {};
    this.state = {};
    this.self = new gDescription();
  }

  parse(input)
  {
    while (input.eof() == false)
    {
      let line = input.next();
      if (line.length == 0) continue;
      let words = line.split(" ");
      if (words.length == 0) continue;
      if (words[0] == "room")
      {
        let r = new gRoom(words[1], words.slice(2).join(" "));
        r.parse(input);
        this.rooms[r.id] = r;
      }
      else if (words[0] == "thing")
      {
        let r = new gThing(words[1], words[2], words.slice(3));
        r.parse(input);
        this.things[r.id] = r;
      }
      else if (words[0] == "action")
      {
        let r = new gAction(words[1], words[2], words[3], words[4]);
        r.parse(input);
        this.actions[r.id] = r;
      }
    }

    // put things in rooms
    for (var i in this.things)
    { 
      let room = this.rooms[this.things[i].starts];
      if (room) room.addThing(this.things[i]);
    }
  }

  process()
  {
    var room = this.rooms[this.state.room];
    document.getElementById("title").innerText = room.name;
    document.getElementById("text").innerHTML = room.getDesc(this.state) + "<br>" + this.self.toString(this.state);

    var objs = "";
    var choices = "";

    for (var i in room.things)
    {
      var obj = this.things[room.things[i]];
      if (obj.isSatisfied(this.state) == false) continue;
      if (objs.length > 0) objs += "<br>";
      objs += obj.getDesc(this.state);

      var choice = obj;
      if (obj.curaction) choice = obj.action[obj.curaction];
      choice = choice.triggers;
      for (var i in choice)
      {
        var action = this.actions[choice[i].id];
        if (action.isSatisfied(this.state) == false) continue;
        choices += "<button onclick='game.perform(" + room.id + "," + obj.id + "," + action.id + ");'>" + choice[i].text + "</button><br>";
      }
    }
    if (objs.length) document.getElementById("objects").innerHTML = objs;
    if (choices.length) document.getElementById("actions").innerHTML = choices;

    var dir = "";
    for (var i in room.dir)
      dir += "<button onclick='game.move(" + room.dir[i] + ");'>" + i + "</button>";
    document.getElementById("directions").innerHTML = dir;
  }

  perform(room, objectid, actionid)
  {
    var obj = this.things[objectid];
    var action = this.actions[actionid];

    action.setState(this.state);

    if (action.triggers.length > 0) obj.curaction = actionid;
    else obj.curaction = 0;

    if (action.goto) obj.curaction = action.goto;
    if (action.move) move(action.move);
    else this.process();
    document.getElementById("actiontext").innerHTML = action.text;
  }

  move(i)
  {
    this.state.room = i;
    for (var i in this.things) this.things[i].curaction = 0;
    document.getElementById("actiontext").innerHTML = "";
    document.getElementById("objects").innerHTML = "Nothing";
    document.getElementById("actions").innerHTML = "None";
    this.process();
  }
}