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
}

Puyo.prototype.clone = function(p)
{
  this.animate = 0;
  this.time = 0;
  this.spritex = p.spritex;
  this.spritey = p.spritey;
  this.origspritex = p.spritex;
  this.origspritey = p.spritey;
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
}

Puyo.prototype.update = function ()
{
  this.time++;
  if (this.stage == 1) this.y += Game.dropspeed;

  // if landed, and not animating and chance
  var chance = Math.random();
  if (this.stage == 2 && this.animation == 0 && chance < 0.005)
  {
    if (this.spritey == 8) this.startAnimate(1);  // animate purple upon landing
    if (this.spritey == 2) this.startAnimate(2); 
    if (this.spritey == 6) this.startAnimate(3);
    if (this.spritey == 4) this.startAnimate(4);
    if (this.spritey == 0) this.startAnimate(5);
  }

  if (this.animation > 0)
  {
    var anim = am.animations[this.animation];
    if (this.time - this.lasttime >= anim.speed)
    {
      this.lasttime = this.time;
      this.curframe++;
      if (this.curframe >= anim.x.length)
      {
        if (anim.loop)
          this.curframe = 0;
        else
        {
          this.animation = 0;
          this.spritex = this.origspritex;
          this.spritey = this.origspritey;
          return;
        }
      }
      else
        this.spritex = anim.x[this.curframe];
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

Puyo.prototype.draw = function ()
{
  Game.context.drawImage(Game.sprites, this.spritex * Game.sheetsize, this.spritey * Game.sheetsize, Game.sheetsize, Game.sheetsize, this.x, this.y, Game.spritesize, Game.spritesize);
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

  this.current = [this.makeCelPuyo(2, -1), this.makeCelPuyo(2, -2)];

  this.next = [this.makePuyo(this.nextoffx, this.nextoffy), this.makePuyo(this.nextoffx, this.nextoffy + 32)];
  if (p == 1) this.nextnext = [this.makePuyo(this.nextoffx + 32, this.nextoffy + 16), this.makePuyo(this.nextoffx + 32, this.nextoffy + 16 + 32)];
  else        this.nextnext = [this.makePuyo(this.nextoffx - 32, this.nextoffy + 16), this.makePuyo(this.nextoffx - 32, this.nextoffy + 16 + 32)];

  this.cels = [[], [], [], [], [], []];

  for (var i = 0; i < 6; ++i)
  {
    for (var j = 0; j < 12; ++j)
    {
      this.cels[i][j] = this.makeBlankPuyo(i, j);
    }
  }

  this.movecounter = 0;
  this.movedir = 0;
}

Player.prototype.moveLeft = function()
{
  var celx1 = ((this.current[0].x - this.offx) / Game.spritesize) | 0;
  var celx2 = ((this.current[1].x - this.offx) / Game.spritesize) | 0;
  if (celx1 == 0 || celx2 == 0) return; // cant go left due to edge of board
  
  var cely1 = ((this.current[0].y - this.offy) / Game.spritesize) | 0;
  var cely2 = ((this.current[1].y - this.offy) / Game.spritesize) | 0;
  if (cely1 >= 0 && cely1 <= 11)
  {
    if (this.cels[celx1-1][cely1].stage > 0) return; // cant go left due to puyo in the way
  }
  if (cely2 >= 0 && cely2 <= 11) {
    if (this.cels[celx2 - 1][cely2].stage > 0) return; // cant go left due to puyo in the way
  }

  this.current[0].x -= 32;
  this.current[1].x -= 32;
}

Player.prototype.moveRight = function ()
{
  var celx1 = ((this.current[0].x - this.offx) / Game.spritesize) | 0;
  var celx2 = ((this.current[1].x - this.offx) / Game.spritesize) | 0;
  if (celx1 >= 5 || celx2 >= 5) return; // cant go right due to edge of board

  var cely1 = ((this.current[0].y - this.offy) / Game.spritesize) | 0;
  var cely2 = ((this.current[1].y - this.offy) / Game.spritesize) | 0;
  if (cely1 >= 0 && cely1 <= 11) {
    if (this.cels[celx1 + 1][cely1].stage > 0) return; // cant go right due to puyo in the way
  }
  if (cely2 >= 0 && cely2 <= 11) {
    if (this.cels[celx2 + 1][cely2].stage > 0) return; // cant go right due to puyo in the way
  }

  this.current[0].x += 32;
  this.current[1].x += 32;
}

Player.prototype.makeCelPuyo = function (x, y)
{
  var p = new Puyo;
  p.stage = 1;
  p.define(0, 2 * ((this.rand.pop() * 5) | 0));
  p.place(this.offx + x * Game.spritesize, this.offy + y * Game.spritesize + 32);
  return p;
}

Player.prototype.makeBlankPuyo = function (x, y)
{
  var p = new Puyo;
  p.place(this.offx + x * Game.spritesize, this.offy + y * Game.spritesize + 32);
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

Player.prototype.puyoIsLanded = function (p)
{
  var celx = ((p.x - this.offx) / Game.spritesize) |0;
  var cely = ((p.y+Game.dropspeed - this.offy) / Game.spritesize) |0;
  if (cely < 0) return false;
  if (cely > 11) return true;
  if (this.cels[celx][cely].stage > 0) return true;
  return false;
}

Player.prototype.puyoLand = function (p)
{
  var celx = ((p.x - this.offx) / Game.spritesize) | 0;
  var cely = ((p.y - this.offy) / Game.spritesize) | 0;
  if (cely < 0) { p.stop(); return; }
  if (cely == 0 && celx == 2)
  {
    Game.gameover = true; return false;
  }
  this.cels[celx][cely].clone(p);
  this.cels[celx][cely].stage = 2;
  p.stop();

  return true;
}

Player.prototype.update = function ()
{
  // check if current puyos are done dropping
  if (this.puyoIsLanded(this.current[0]))
  {
    if (this.puyoLand(this.current[0]) == false) return;
    if (this.puyoLand(this.current[1]) == false) return;

    this.current = [this.makeCelPuyo(2, 0), this.makeCelPuyo(2, -1)];
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
      this.cels[x][y].update();
    }
  }
}

Player.prototype.draw = function ()
{
  for (var x = 0; x < 6; x += 1)
  {
    for (var y = 0; y < 12; y += 1)
    {
      if (this.cels[x][y].stage > 0) this.cels[x][y].draw();
    }
  }
  this.current[0].draw();
  this.current[1].draw();
  this.next[0].draw();
  this.next[1].draw();
  this.nextnext[0].draw();
  this.nextnext[1].draw();
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
  this.spritesize = 32;
  this.dropspeed = 1;
  this.gameover = false;

  this.playerOne = new Player(1, 32, 192, 238, 127);
  this.playerTwo = new Player(2, 416, 192, 373, 127);

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
  //Game.playerTwo.update();
}

Game.draw = function ()
{
  Game.context.globalCompositeOperation = "source-over";
  Game.context.imageSmoothingEnabled = false;
  Game.context.webkitImageSmoothingEnabled = false;
  Game.context.mozImageSmoothingEnabled = false;

  Game.context.drawImage(Game.spritebg, 0, 0);
  Game.playerOne.draw();
 // Game.playerTwo.draw();
  Game.context.drawImage(Game.spritefg,0,0);
}

function onKeyDown(e)
{
  if (e.keyCode == 39) Game.playerOne.movedir = 1;
  if (e.keyCode == 37) Game.playerOne.movedir = -1;
//  if (e.keyCode == 83) Game.selected.entity.velY = 1; // down
//  if (e.keyCode == 87) Game.selected.entity.velY = -1; // up
}

function onKeyUp(e)
{
  if (e.keyCode == 39) Game.playerOne.movedir = 0;
  if (e.keyCode == 37) Game.playerOne.movedir = 0; 
//  if (e.keyCode == 83) Game.selected.entity.velY = 0;
//  if (e.keyCode == 87) Game.selected.entity.velY = 0;
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