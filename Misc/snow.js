var Game = {};

// make a scene of houses and snow falling. 
// make flashing lights
// snow accumulates and falls down hills

// scene values
//  0 nothing
//  1 snow
//  2 obsticle
Game.init = function ()
{
  this.surface = document.getElementById('surface');
  this.context = this.surface.getContext('2d');
  this.scene = [];
  this.snow = [];

  // clear
  for (var i = 0; i < 600*600; ++i) this.scene[i] = 0;

  // preset houses
  this.houseSeed = Math.random();
  Math.seedrandom(this.houseSeed);
  this.drawHouse(true);
  this.drawHouse(true);
  this.drawHouse(true);
  this.drawHouse(true);
}

Game.drawCloud = function()
{
  this.context.beginPath();
  this.context.moveTo(170, 80);
  this.context.bezierCurveTo(130, 100, 130, 150, 230, 150);
  this.context.bezierCurveTo(250, 180, 320, 180, 340, 150);
  this.context.bezierCurveTo(420, 150, 420, 120, 390, 100);
  this.context.bezierCurveTo(430, 40, 370, 30, 340, 50);
  this.context.bezierCurveTo(320, 5, 250, 20, 250, 50);
  this.context.bezierCurveTo(200, 5, 150, 20, 170, 80);
  this.context.closePath();
  this.context.lineWidth = 5;
  this.context.fillStyle = 'white';
  this.context.fill();
  this.context.strokeStyle = 'grey';
  this.context.stroke();
}

Game.drawTree = function(sceneMode)
{
  var th = (Math.random()*10 + 10) |0;
  var h = (Math.random()*100 + 70) |0;
  var w = (Math.random()*30 + 30) |0;
  var x = (Math.random()*(600-w)) |0;
  var max = (w/2)|0;

  if (sceneMode)
  {
    this.drawSceneBox(x+max-5, 600-th, 10, th);
    this.drawSceneLine(x, 600-th, x+max, 600-th-h);
    this.drawSceneLine(x+max, 600-th-h, x+w, 600-th);
  }
  else
  {
    this.drawBox(x+max-5, 600-th, 10, th);
    this.context.beginPath();
    this.context.moveTo(x, 600-th);
    this.context.lineTo(x+max, 600-th-h);
    this.context.lineTo(x+w, 600-th);
    this.context.closePath();
    this.context.lineWidth = 1;
    this.context.fillStyle = 'green';
    this.context.fill();
    this.context.strokeStyle = 'white';
    this.context.stroke();
  }
}

Game.drawHouse = function (sceneMode)
{
  var h = (Math.random()*50 + 50) |0;
  var w = (Math.random()*50 + 50) |0;
  var x = (Math.random()*(600-w)) |0;
  var rh = (Math.random()*10 + 20) |0;
  var max = (Math.random()*20 + 20) |0;
  if (max > w/2) max = w/2;

  if (sceneMode)
  {
    this.drawSceneBox(x, 600-h, w, h);
    this.drawSceneLine(x, 600-h, x+max, 600-h-rh);
    this.drawSceneLine(x+max, 600-h-rh, x+max+(w-max-max), 600-h-rh);
    this.drawSceneLine(x+max+(w-max-max), 600-h-rh, x+w, 600-h);
  }
  else
  {
    this.drawBox(x, 600-h, w, h);
    this.context.beginPath();
    this.context.moveTo(x, 600-h);
    this.context.lineTo(x+max, 600-h-rh);
    this.context.lineTo(x+max+(w-max-max), 600-h-rh);
    this.context.lineTo(x+w, 600-h);
    this.context.closePath();
    this.context.lineWidth = 1;
    this.context.fillStyle = 'grey';
    this.context.fill();
    this.context.strokeStyle = 'white';
    this.context.stroke();
  }
}

Game.drawSceneBox = function (x,y,w,h)
{
  for (var i = x; i < x+w; ++i)
  {
    if (i < 0) continue;
    if (i >= 600) continue;
    for (var j = y; j < y+h; ++j)
    {
      if (j < 0) continue;
      if (j >= 600) continue;
      this.scene[j*600+i] = 2;
    }
  }
}

Game.drawBox = function (x,y,w,h)
{
  Game.context.strokeStyle = "white";
  Game.context.fillStyle = "white";
  Game.context.strokeRect(x,y,w,h);
  Game.context.strokeStyle = "black";
  Game.context.fillStyle = "black";
  Game.context.fillRect(x+1,y+1,w-1,h-1);
}

Game.drawSceneLine = function (x1, y1, x2, y2)
{
  if (y1 == y2 && x1 >= x2) return;

  var dx = x2 - x1
  var dy = y2 - y1
  for (var i = x1; i <= x2; ++i)
  {
    j = y1 + dy * (i - x1) / dx
    if (i < 0) continue;
    if (i >= 600) continue;
    if (j < 0) continue;
    if (j >= 600) continue;
    this.scene[j*600+i] = 2;
  }
}

Game.drawLine = function (x1, y1, x2, y2)
{
  if (y1 == y2 && x1 >= x2) return;

  Game.context.strokeStyle = "white";
  Game.context.fillStyle = "white";

  var dx = x2 - x1
  var dy = y2 - y1
  for (var i = x1; i <= x2; ++i)
  {
    j = y1 + dy * (i - x1) / dx
    if (i < 0) continue;
    if (i >= 600) continue;
    if (j < 0) continue;
    if (j >= 600) continue;
    Game.context.strokeRect(i, j, 1, 1);
  }
}

//Array.prototype.remove = function(from, to) 
//{
//  var rest = this.slice((to || from) + 1 || this.length);
//  this.length = from < 0 ? this.length + from : from;
//  return this.push.apply(this, rest);
//};

Game.run = function ()
{
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
  Math.seedrandom();
  if (this.snow.length < 1000) this.snow.push(new Particle());

  for (var p in this.snow) 
  {
    this.snow[p].move(); 
//    if (this.snow[p].alive == false) this.snow.remove(p);
  }
}

Game.draw = function ()
{
  // clear to black
  Game.context.fillStyle = "black";
  Game.context.fillRect(0, 0, 600, 600);

  // houses
  Math.seedrandom(this.houseSeed);
  this.drawCloud();
  this.drawHouse(false);
  this.drawHouse(false);
  this.drawHouse(false);
  this.drawHouse(false);
  this.drawTree(false);
  this.drawTree(false);
  this.drawTree(false);

  // snow
  for (var p in this.snow) 
  {
    Game.context.fillStyle = "white";
    Game.context.fillRect(this.snow[p].x, this.snow[p].y, 1, 1);
  }
}

function main()
{
  Game.init();
  window.setInterval(Game.run, 17);
}