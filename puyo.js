// game config
var movepollrate = 5;

function Animation()
{
  this.speed = 10;
  this.loop = false;
  this.x = 0;
  this.y = [];
}

function AnimationManager()
{
  this.animations = {};
}

var am = new AnimationManager();
var purplesleep = new Animation();
purplesleep.speed = 15;
purplesleep.y = 9;
purplesleep.x = [1, 2, 3, 2, 1, 2, 3, 2, 1, 0];
am.animations[1] = purplesleep;

var bluenerves = new Animation();
bluenerves.speed = 15;
bluenerves.y = 3;
bluenerves.x = [5, 5, 6, 6, 5, 7, 7, 4, 4, 6, 0];
am.animations[2] = bluenerves;

var greenwaves = new Animation();
greenwaves.speed = 15;
greenwaves.y = 7;
greenwaves.x = [8, 9, 8, 10, 11, 10, 8, 9, 8];
am.animations[3] = greenwaves;

var yellowwink = new Animation();
yellowwink.speed = 15;
yellowwink.y = 5;
yellowwink.x = [6, 12, 12, 12, 7, 12, 0, 0, 1, 2, 2, 1];
am.animations[4] = yellowwink;

var redbounce = new Animation();
redbounce.speed = 15;
redbounce.y = 1;
redbounce.x = [3, 4, 5, 6, 6, 5];
am.animations[5] = redbounce;

/*
 * PUYO CLASS
 * 
 * Maintains the state of a puyo at a certain location. This class mainly controls the sprite animation states of the puyo
 * location x and y do not include the board offsets
 */
function Puyo()
{
  this.spritex = 0;
  this.spritey = 0;
  this.origspritex = 0;
  this.origspritey = 0;
  this.x = 0;
  this.y = 0;
  this.stage = 0;

  this.animation = 0;
  this.curframe = 0;
  this.lasttime = 0;
  this.time = 0;

  this.celx = 0;
  this.cely = 0;
}

Puyo.prototype.clone = function(p)
{
  this.animate = 0;
  this.time = 0;
  this.spritex = p.spritex;
  this.spritey = p.spritey;
  this.origspritex = p.origspritex;
  this.origspritey = p.origspritey;
}

Puyo.prototype.place = function (x, y)
{
  this.x = x;
  this.y = y;
}

Puyo.prototype.define = function (x, y)
{
  this.spritex = x;
  this.spritey = y;
  this.origspritex = x;
  this.origspritey = y;
}

Puyo.prototype.shift = function (x, y)
{
  this.animation = 0;
  this.origspritex += x;
  this.spritex = this.origspritex;
  this.spritey = this.origspritey;// + y;
//  this.origspritey += y;
}

Puyo.prototype.update = function ()
{
  this.time++;
  if (this.stage == 1)
    // temp hack for now
  {
    if (Game.playerOne.split == 1)
      this.y += 6;
    else
      this.y += Game.dropspeed;
  }

  this.celx = Math.floor(this.x / Game.spritesize);
  this.cely = Math.floor(this.y / Game.spritesize);

  // if landed, and not animating and chance
  var chance = Math.random();
  if (this.stage == 2 && this.origspritex == 0 && this.animation == 0 && chance < 0.005)
  {
    if (this.spritey == 8) this.startAnimate(1);  // animate purple upon landing
    if (this.spritey == 2) this.startAnimate(2); 
    if (this.spritey == 6) this.startAnimate(3);
    if (this.spritey == 4) this.startAnimate(4);
    if (this.spritey == 0) this.startAnimate(5);
  }

  if (this.animation > 0)                          // if animating
  {
    var anim = am.animations[this.animation];
    if (this.time - this.lasttime >= anim.speed)    // if time for next frame
    {
      this.lasttime = this.time;
      this.curframe++;
      if (this.curframe >= anim.x.length)           // last frame? 
      {
        if (anim.loop)                              // loop means start over
          this.curframe = 0;
        else
        {                                           // turn off animation
          this.animation = 0;
          this.spritex = this.origspritex;
          this.spritey = this.origspritey;
          return;
        }
      }
      else
        this.spritex = anim.x[this.curframe];       // set the current frame
    }
  }
}

Puyo.prototype.startAnimate = function(a)
{
  this.animation = a;
  this.curframe = 0;
  this.lasttime = this.time;

  var anim = am.animations[this.animation];
  this.spritey = anim.y;
  this.spritex = anim.x[this.curframe];
}

Puyo.prototype.stop = function()
{
  this.stage = 2;
}

Puyo.prototype.draw = function (ox, oy)
{
  Game.context.drawImage(Game.sprites, this.spritex * Game.sheetsize, this.spritey * Game.sheetsize, Game.sheetsize, Game.sheetsize, ox + this.x, oy + this.y, Game.spritesize, Game.spritesize);
}

/*
 * PLAYER CLASS
 *
 * Manages the board for a given player. Can be extended to add AI capabilities or user inputs
 */
function Player(p, x, y, nx, ny)
{
  this.rand = new mxRand();
  this.rand.seed(Game.seed);

  this.player = p;
  this.offx = x;
  this.offy = y;
  this.nextoffx = nx;
  this.nextoffy = ny;
  this.nextnextoffx = (p == 1) ? nx + Game.spritesize : nx - Game.spritesize;
  this.nextnextoffy = ny + Game.spritesize/2;

  this.current = [this.makeCelPuyo(2, -1), this.makeCelPuyo(2, -2)];
  this.next = [this.makePuyo(0, 0), this.makePuyo(0, Game.spritesize)];
  this.nextnext = [this.makePuyo(0, 0), this.makePuyo(0, Game.spritesize)];
  this.cels = [[], [], [], [], [], []];

  this.movecounter = 0;
  this.movedir = 0;
  this.split = 0;
}

Player.prototype.moveLeft = function()
{
  if (this.split) return;
  if (this.current[0].celx == 0 || this.current[1].celx == 0) return;                  // cant go left due to edge of board
  // use +1 for the bottom edge
  if (this.cels[this.current[0].celx - 1][this.current[0].cely + 1] !== undefined) return; // cant go left due to puyo in the way
  if (this.cels[this.current[1].celx - 1][this.current[1].cely + 1] !== undefined) return; // cant go left due to puyo in the way

  this.current[0].x -= Game.spritesize;
  this.current[1].x -= Game.spritesize;
}

Player.prototype.moveRight = function ()
{
  if (this.split) return;
  if (this.current[0].celx >= 5 || this.current[1].celx >= 5) return;                  // cant go right due to edge of board
  // use +1 for the bottom edge
  if (this.cels[this.current[0].celx + 1][this.current[0].cely + 1] !== undefined) return; // cant go right due to puyo in the way
  if (this.cels[this.current[1].celx + 1][this.current[1].cely + 1] !== undefined) return; // cant go right due to puyo in the way

  this.current[0].x += Game.spritesize;
  this.current[1].x += Game.spritesize;
}

Player.prototype.moveCW = function()
{
  if (this.split) return;

  if (this.current[0].celx == this.current[1].celx+1) 
  {
    this.current[1].x = this.current[0].x; this.current[1].celx = this.current[0].celx;
    this.current[1].y -= Game.spritesize; this.current[1].cely--;
  }
  else if (this.current[0].celx == this.current[1].celx - 1) {
    this.current[1].x = this.current[0].x; this.current[1].celx = this.current[0].celx;
    this.current[1].y += Game.spritesize; this.current[1].cely++;
  }
  else if (this.current[0].cely == this.current[1].cely + 1) {
    this.current[1].y = this.current[0].y; this.current[1].cely = this.current[0].cely;
    this.current[1].x += Game.spritesize; this.current[1].celx++;
  }
  else if (this.current[0].cely == this.current[1].cely - 1) {
    this.current[1].y = this.current[0].y; this.current[1].cely = this.current[0].cely;
    this.current[1].x -= Game.spritesize; this.current[1].celx--;
  }

  if (this.current[1].x < 0 || this.current[1].x >= 6 * Game.spritesize) this.moveCW();
  if (this.puyoWillLand(this.current[1])) this.moveCW();
}

Player.prototype.makeCelPuyo = function (x, y)
{
  var p = new Puyo;
  p.stage = 1;
  p.define(0, 2 * ((this.rand.pop() * 5) | 0));
  p.place(x * Game.spritesize, y * Game.spritesize);
  return p;
}

Player.prototype.makePuyo = function (x, y)
{
  var p = new Puyo;
  p.stage = 1;
  p.define(0, 2 * ((this.rand.pop() * 5) | 0));
  p.place(x, y);
  return p;
}

Player.prototype.puyoWillLand = function (p)
{
  if (p.cely < -1) return false;

  // get the cel that the bottom edge will be in
  var y = p.y + Game.spritesize + Game.dropspeed;
  var targetcel = (y / Game.spritesize) |0;

  if (targetcel > 11) return true;

  if (this.cels[p.celx][targetcel] === undefined) return false;
  return true;
}

Player.prototype.puyoLand = function (p)
{
  p.cely++;
  p.y = p.cely * Game.spritesize;
  p.stop();

  if (p.cely == 0 && p.celx == 2) { Game.gameover = true; }
  this.cels[p.celx][p.cely] = p;

  // check around for linkages
  var image = 0;
  if (p.cely > 0 && this.cels[p.celx][p.cely - 1] !== undefined && this.cels[p.celx][p.cely - 1].origspritey == p.origspritey) { image += 2; this.cels[p.celx][p.cely - 1].shift(1,0); }
  if (p.cely < 11 && this.cels[p.celx][p.cely + 1] !== undefined && this.cels[p.celx][p.cely + 1].origspritey == p.origspritey) { image += 1; this.cels[p.celx][p.cely + 1].shift(2,0); }
  if (p.celx > 0 && this.cels[p.celx - 1][p.cely] !== undefined && this.cels[p.celx - 1][p.cely].origspritey == p.origspritey) { image += 8; this.cels[p.celx - 1][p.cely].shift(4, 0); }
  if (p.celx < 5 && this.cels[p.celx + 1][p.cely] !== undefined && this.cels[p.celx + 1][p.cely].origspritey == p.origspritey) { image += 4; this.cels[p.celx + 1][p.cely].shift(8, 0); }
  p.origspritex = image;
  p.spritey = p.origspritey;
  p.spritex = image;

  return true;
}

Player.prototype.update = function ()
{
  // check if current puyos are done dropping
  // check the lower one first
  if (this.current[1].y > this.current[0].y)
  {
    if (this.current[1].stage == 1 && this.puyoWillLand(this.current[1])) {
      this.puyoLand(this.current[1]);
      this.split++;
    }

    if (this.current[0].stage == 1 && this.puyoWillLand(this.current[0])) {
      this.puyoLand(this.current[0]);
      this.split++;
    }
  }
  else
  {
    if (this.current[0].stage == 1 && this.puyoWillLand(this.current[0])) {
      this.puyoLand(this.current[0]);
      this.split++;
    }

    if (this.current[1].stage == 1 && this.puyoWillLand(this.current[1])) {
      this.puyoLand(this.current[1]);
      this.split++;
    }
  }

  // are both down?
  if (this.split == 2)
  {
    this.split = 0;
    this.current = [this.makeCelPuyo(2, -1), this.makeCelPuyo(2, -2)];
    this.current[0].clone(this.next[1]); // ya I know
    this.current[1].clone(this.next[0]);

    this.next[0].clone(this.nextnext[0]);
    this.next[1].clone(this.nextnext[1]);
    this.nextnext[0].define(0, 2 * ((this.rand.pop() * 5) | 0));
    this.nextnext[1].define(0, 2 * ((this.rand.pop() * 5) | 0));
  }

  // apply user inputs?
  this.movecounter++;
  if (this.movecounter > movepollrate)
  {
    this.movecounter = 0;
    if (this.movedir > 0) this.moveRight();
    if (this.movedir < 0) this.moveLeft();
  }

  // advance the downward motion of the current puyos
  this.current[0].update();
  this.current[1].update();

  // update all puyo animations
  for (var x = 0; x < 6; x += 1)
  {
    for (var y = 0; y < 12; y += 1)
    {
      if (this.cels[x][y] !== undefined) this.cels[x][y].update();
    }
  }
}

Player.prototype.draw = function ()
{
  for (var x = 0; x < 6; x += 1)
  {
    for (var y = 0; y < 12; y += 1)
    {
      if (this.cels[x][y] !== undefined) this.cels[x][y].draw(this.offx, this.offy);
    }
  }
  this.current[0].draw(this.offx, this.offy);
  this.current[1].draw(this.offx, this.offy);
  this.next[0].draw(this.nextoffx, this.nextoffy);
  this.next[1].draw(this.nextoffx, this.nextoffy);
  this.nextnext[0].draw(this.nextnextoffx, this.nextnextoffy);
  this.nextnext[1].draw(this.nextnextoffx, this.nextnextoffy);
}


/*
 * GAME CLASS
 *
 * The game object. Controls the main game loop
 */
var Game = {};

Game.init = function ()
{
  this.seed = Math.random();
  this.loading = 0;
  this.frame = 29;
  this.sheetsize = 16;
  this.spritesize = 48;
  this.dropspeed = 1;
  this.gameover = false;

  this.playerOne = new Player(1, 48, 79, 360, 15);
  this.playerTwo = new Player(2, 552, 79, 480, 15);

  document.addEventListener('keydown', onKeyDown, false);
  document.addEventListener('keyup', onKeyUp, false);
  this.surface = document.getElementById('surface');
  this.context = this.surface.getContext('2d');

  this.sprites = this.loadImage('puyo.png');
  this.spritebg = this.loadImage('puyoback.png');
  this.spritefg = this.loadImage('puyofront.png');
}

Game.loadImage = function (name)
{
  var img = new Image();
  Game.loading++;
  img.onload = function () { Game.loading -= 1; }
  img.src = name;
  return img;
}

Game.run = function ()
{
  if (Game.loading > 0) return;
  if (Game.gameover) return;
  Game.frame++;

  var d = new Date();
  Game.time = d.getTime();

  Game.update();
  d = new Date();
  var updateTime = d.getTime() - Game.time;

  Game.draw();
  d = new Date();
  var drawTime = d.getTime() - Game.time;

  var idleTime = 17 - updateTime - drawTime;

  Game.context.font = "bold 8px Arial";
  Game.context.fillStyle = "#ffffff";
  if (idleTime < 0) { idleTime = 0; Game.context.fillStyle = "#ff0000"; }
  var perFrame = idleTime + drawTime + updateTime;

  Game.context.fillText("FPS: " + ((1000 / perFrame) | 0) + "  Each frame: " + perFrame + " ms", 0, 10);
  Game.context.fillText("Frame Time: Update: " + updateTime + "ms  Draw: " + drawTime + "ms  Idle: " + idleTime + "ms", 0, 20);
  updateTime = (updateTime / perFrame * 100) | 0;
  drawTime = (drawTime / perFrame * 100) | 0;
  idleTime = (idleTime / perFrame * 100) | 0;
  Game.context.fillText("Frame Time: Update: " + updateTime + "%  Draw: " + drawTime + "%  Idle: " + idleTime + "%", 0, 30);

  if (Game.frame == 60) Game.frame = 0;
}

Game.update = function ()
{
  Game.playerOne.update();
//  Game.playerTwo.update();
}

Game.draw = function ()
{
  Game.context.globalCompositeOperation = "source-over";
  Game.context.imageSmoothingEnabled = false;
  Game.context.webkitImageSmoothingEnabled = false;
  Game.context.mozImageSmoothingEnabled = false;

  Game.context.drawImage(Game.spritebg, 0, 0);
  Game.playerOne.draw();
  Game.playerTwo.draw();
  Game.context.drawImage(Game.spritefg,0,0);
}

function onKeyDown(e)
{
  if (e.keyCode == 39) Game.playerOne.movedir = 1;
  if (e.keyCode == 37) Game.playerOne.movedir = -1;
  if (e.keyCode == 40) Game.dropspeed = 5; 
}

function onKeyUp(e)
{
  if (e.keyCode == 39) Game.playerOne.movedir = 0;
  if (e.keyCode == 37) Game.playerOne.movedir = 0;
  if (e.keyCode == 40) Game.dropspeed = 1;
  if (e.keyCode == 65) Game.playerOne.moveCW();
}

/*
 * MAIN
 *
 * Creates game and hands over control to it
 */
function main()
{
  Game.init();
  window.setInterval(Game.run, 17);
}