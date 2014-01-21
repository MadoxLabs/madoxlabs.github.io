var Game = {};

Game.init = function ()
{
  Math.seedrandom();
  this.ready = 3;
  this.surface = document.getElementById('surface');
  this.context = this.surface.getContext('2d');

  this.sprites = new Image();
  this.sprites.onload = function () { Game.ready -= 1; }
  this.sprites.src = 'puyo.png';

  this.spritebg = new Image();
  this.spritebg.onload = function () { Game.ready -= 1; }
  this.spritebg.src = 'puyoback.png';

  this.spritefg = new Image();
  this.spritefg.onload = function () { Game.ready -= 1; }
  this.spritefg.src = 'puyofront.png';
}

Game.run = function ()
{
  if (this.ready == false) return;

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
}

Game.update = function ()
{
}

Game.draw = function ()
{
  // clear to black
  Game.context.fillStyle = "black";
  Game.context.fillRect(0, 0, 640, 640);

  Game.context.drawImage(Game.spritebg,0,0);

  // fill the area with sprite blts and see how fast we can do it
  // sprites are 16x16 - draw 14x14 sprites randomly
  // game area is 6x12 sprites

  var sheetsize = 16;
  var spritesize = 32;
  var offx = 32;
  var offy = 224-32;
  for (var x = 0; x < 6; x += 1)
  {
    for (var y = 0; y < 12; y += 1)
    {
      var i = (Math.random() * 19) | 0;
      var j = (Math.random() * 10) | 0;
      Game.context.drawImage(Game.sprites, i * sheetsize, j * sheetsize, sheetsize, sheetsize, offx + x * spritesize, offy + y * spritesize + 32, spritesize, spritesize);
    }
  }
  offx = 320+64+32;
  for (var x = 0; x < 6; x += 1)
  {
    for (var y = 0; y < 12; y += 1)
    {
      var i = (Math.random() * 19) | 0;
      var j = (Math.random() * 10) | 0;
      Game.context.drawImage(Game.sprites, i * sheetsize, j * sheetsize, sheetsize, sheetsize, offx + x * spritesize, offy + y * spritesize + 32, spritesize, spritesize);
    }
  }

  Game.context.drawImage(Game.spritefg,0,0);
}

function main()
{
  Game.init();
  window.setInterval(Game.run, 17);
}