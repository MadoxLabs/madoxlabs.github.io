/*
 * PUYO CLASS
 * 
 * Maintains the state of a puyo at a certain location. This class mainly controls the sprite animation states of the puyo
 */
function Puyo()
{
  this.spritex = 0;
  this.spritey = 0;
  this.x = 0;
  this.y = 0;
  this.animation = 0;
  this.stage = 0;
  this.curframe = 0;
}

Puyo.prototype.clone = function(p)
{
  this.spritex = p.spritex;
  this.spritey = p.spritey;
}

Puyo.prototype.random = function()
{
  this.spritex = 0;
  this.spritey = (Math.random() * 5) | 0;
  this.spritey *= 2;
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
  if (this.stage == 1)
    this.y += Game.dropspeed;
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
  this.player = p;
  this.offx = x;
  this.offy = y;
  this.nextoffx = nx;
  this.nextoffy = ny;

  this.current = [this.makeCelPuyo(3, -1), this.makeCelPuyo(3, -2)];

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
}

Player.prototype.makeCelPuyo = function (x, y)
{
  var p = new Puyo;
  p.stage = 1;
  p.random();
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
  p.random();
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
  if (cely < 0) { Game.gameover = true; return; }
  this.cels[celx][cely].clone(p);
  this.cels[celx][cely].stage = 1;
  p.stop();
  
}

Player.prototype.update = function ()
{
  // check if we can move
  //  else stop
  // move
  if (this.puyoIsLanded(this.current[0]))
  {
    this.puyoLand(this.current[0]);
    this.puyoLand(this.current[1]);

    this.current = [this.makeCelPuyo(3, 0), this.makeCelPuyo(3, -1)];
    this.current[0].clone(this.next[0]);
    this.current[1].clone(this.next[1]);
    this.next[0].clone(this.nextnext[0]);
    this.next[1].clone(this.nextnext[1]);
    this.nextnext[0].random();
    this.nextnext[1].random();
  }
  this.current[0].update();
  this.current[1].update();
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
  Math.seedrandom();
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
  if (this.loading > 0) return;
  if (this.gmaeover) return;
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
  Game.playerTwo.update();
}

Game.draw = function ()
{
  Game.context.globalCompositeOperation = "source-over";
  Game.context.drawImage(Game.spritebg, 0, 0);
  Game.playerOne.draw();
  Game.playerTwo.draw();
  Game.context.drawImage(Game.spritefg,0,0);
}

function onKeyDown(e)
{
//  if (e.keyCode == 68) Game.selected.entity.velX = 1; // right
//  if (e.keyCode == 65) Game.selected.entity.velX = -1; // left
//  if (e.keyCode == 83) Game.selected.entity.velY = 1; // down
//  if (e.keyCode == 87) Game.selected.entity.velY = -1; // up
}

function onKeyUp(e)
{
//  if (e.keyCode == 68) Game.selected.entity.velX = 0;
//  if (e.keyCode == 65) Game.selected.entity.velX = 0;
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