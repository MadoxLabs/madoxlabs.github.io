var Game = {};

Game.init = function ()
{
  Math.seedrandom();
  this.ready = false;
  this.surface = document.getElementById('surface');
  this.context = this.surface.getContext('2d');
  this.sprites = new Image();
  this.sprites.onload = function () { Game.ready = true; }
  this.sprites.src = 'puyo3.png';
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

  // fill the area with sprite blts and see how fast we can do it
  // sprites are 16x16 - draw 14x14 sprites randomly

  for (var x = 0; x < 640; x += 16)
  {
    for (var y = 32; y < 640; y += 16)
    {
      var i = (Math.random() * 20)|0;
      var j = (Math.random() * 12)|0;
      Game.context.drawImage(Game.sprites, i * 16, j * 16, 16, 16, x, y, 16, 16);
    }
  }
}

function main()
{
  Game.init();
  window.setInterval(Game.run, 17);
}