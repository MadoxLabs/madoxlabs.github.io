var Dir = function ()
{
  this.above = 0;
  this.below = 0;
  this.left = 0;
  this.right = 0;
};

var Game = {};

Game.init = function ()
{
  this.surface = document.getElementById('surface');
  this.context = this.surface.getContext('2d');

  this.surface.addEventListener("mousedown", onMouseDown, false);
  this.surface.addEventListener("mouseup", onMouseUp, false);
  this.surface.addEventListener("mousemove", onMouseMove, false);

  this.height = [];
  this.water = [];
  this.visual = [];

  Game.reset();

  this.flowsA = [];
  this.flowsB = [];
  for (var x = 0; x < 400; ++x)
    for (var y = 0; y < 400; ++y) {
      this.flowsA[x + 400 * y] = new Dir();
      this.flowsB[x + 400 * y] = new Dir();
    }

  this.map = Game.context.createImageData(400, 400);

  this.adding = false;
}

Game.reset = function ()
{
  for (var x = 0; x < 400; ++x)
    for (var y = 0; y < 400; ++y)
    {
      // hilly terrain
      this.height[x + 400 * y] = 2 * (2 + Math.sin(x / 100) + Math.cos(y / 100));

      if (fat)
      {
        var i = Math.floor(x / 2) + 400 * Math.floor(y / 2);
        this.water[i] = 5 - this.height[x + 400 * y];
        if (this.water[i] < 0) this.water[i] = 0;
      }
      else
      {
        this.water[x + 400 * y] = 5 - this.height[x + 400 * y];
        if (this.water[x + 400 * y] < 0) this.water[x + 400 * y] = 0;
      }

      // a pond of water
      //      this.height[x+400*y] =  ((x+y) / 800 - 0.5*(x-y)/400) * 10;
      //      this.water[x+400*y] = 10 - this.height[x+400*y];
      this.visual[x + 400 * y] = 0;
    }
}

Game.run = function ()
{
  var d = new Date();
  Game.time = d.getTime();

  Game.update();
  d = new Date();
  var updateTime = d.getTime() - Game.time;

  Game.draw();
  d = new Date();
  var drawTime = d.getTime() - Game.time - updateTime;

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

var heightN = new Dir();
var totalH = new Dir();
var heightDif = new Dir();
var outflow = new Dir();

var rain = false;
var fat = false;

Game.update = function ()
{
  // process water
  //   calc flows

  for (var x = 1; x < 400 - 1; ++x) {
    if (x >= 199 && fat) break;
    for (var y = 1; y < 400 - 1; ++y) {
      if (y >= 199 && fat) break;
      var index = x + 400 * y;
      var waterC = Game.water[index];
      var heightC = Game.height[index];
      var totalHC = waterC + heightC;

      heightN.left = Game.height[(x - 1) + 400 * y];
      heightN.right = Game.height[(x + 1) + 400 * y];
      heightN.above = Game.height[x + 400 * (y - 1)];
      heightN.below = Game.height[x + 400 * (y + 1)];

      totalH.left = Game.water[(x - 1) + 400 * y] + heightN.left;
      totalH.right = Game.water[(x + 1) + 400 * y] + heightN.right;
      totalH.above = Game.water[x + 400 * (y - 1)] + heightN.above;
      totalH.below = Game.water[x + 400 * (y + 1)] + heightN.below;

      heightDif.left = ((totalHC - totalH.left) * 10);
      heightDif.right = ((totalHC - totalH.right) * 10);
      heightDif.above = ((totalHC - totalH.above) * 10);
      heightDif.below = ((totalHC - totalH.below) * 10);

      var f = Game.flowsA[index];
      outflow.left = f.left * 0.97 + heightDif.left * 0.05;
      outflow.right = f.right * 0.97 + heightDif.right * 0.05;
      outflow.above = f.above * 0.97 + heightDif.above * 0.05;
      outflow.below = f.below * 0.97 + heightDif.below * 0.05;

      if (outflow.left < 0) outflow.left = 0;
      if (outflow.right < 0) outflow.right = 0;
      if (outflow.above < 0) outflow.above = 0;
      if (outflow.below < 0) outflow.below = 0;

      var maxWater = waterC;
      var waterOut = (outflow.left + outflow.right + outflow.above + outflow.below) * 0.05;
      if (maxWater == 0 || waterOut == 0) {
        var f = Game.flowsB[index];
        f.left = 0;
        f.right = 0;
        f.above = 0;
        f.below = 0;
        continue;
      }
      else if (waterOut > maxWater) {
        var scale = maxWater / waterOut;
        if (scale > 1) scale = 1;
        outflow.left *= scale;
        outflow.right *= scale;
        outflow.above *= scale;
        outflow.below *= scale;
      }

      var f = Game.flowsB[index];
      f.left = outflow.left;
      f.right = outflow.right;
      f.above = outflow.above;
      f.below = outflow.below;
    }
  }

  var tmp = Game.flowsA;
  Game.flowsA = Game.flowsB;
  Game.flowsB = tmp;

  //   apply flows
  var evaporate = 1.0; //0.99;

  for (var x = 1; x < 400 - 1; ++x)
  {
    if (x >= 199 && fat) break;
    for (var y = 1; y < 400 - 1; ++y)
    {
      if (y >= 199 && fat) break;
      var flowC = Game.flowsA[x + 400 * y];
      var flowL = Game.flowsA[(x - 1) + 400 * y];
      var flowR = Game.flowsA[(x + 1) + 400 * y];
      var flowT = Game.flowsA[x + 400 * (y - 1)];
      var flowB = Game.flowsA[x + 400 * (y + 1)];
      var inflows = flowR.left + flowL.right + flowT.below + flowB.above;
      var outflows = flowC.left + flowC.right + flowC.below + flowC.above;
      var oldwater = Game.water[x + 400 * y];
      if (Game.height[x + 400 * y] > 0) oldwater *= evaporate;
      var outwater = oldwater + (0.05 * (inflows - outflows));
      if (outwater > 0) Game.water[x + 400 * y] = outwater;

      if (rain && Math.random() < 0.00001) Game.water[x + 400 * y] += 0.0002;

      Game.visual[x + 400 * y] = inflows - outflows;
    }
  }
}

var brighter = false;

Game.draw = function ()
{
  var i = 0;
  var sandA = 0;
  var waterA = 0;
  var visual = 0;
  for (var x = 0; x < 400; ++x)
  {
    for (var y = 0; y < 400; ++y) {
      if (fat)
      {
        waterA = Game.water[Math.floor(x / 2) + 400 * Math.floor(y / 2)] / 5.0;
        visual = Game.visual[Math.floor(x / 2) + 400 * Math.floor(y / 2)];
      }
      else
      {
        waterA = Game.water[x + 400 * y] / 5.0;
        visual = Game.visual[x + 400 * y];
      }

      if (brighter) {
        visualA = 1;// - Game.visual[x + 400 * y] / 20.0;
        sandA = Game.height[x + 400 * y] / 14.0 + 0.3;
      }
      else {
        visualA = waterA + 0.5;
        sandA = 1.0 - waterA;
      }

      //                  | sand        |  water       |
      if (visual > 0.00001) {
        Game.map.data[i++] = 237 * sandA + (brighter ? 255 : 0) * visualA;
        Game.map.data[i++] = 201 * sandA + 0 * visualA;
        Game.map.data[i++] = 175 * sandA + (brighter ? 0 : 255) * visualA;
        Game.map.data[i++] = 255;
      }
      else {
        Game.map.data[i++] = 237 * sandA + 0;
        Game.map.data[i++] = 201 * sandA + 0;
        Game.map.data[i++] = 175 * sandA + 255 * waterA;
        Game.map.data[i++] = 255;
      }
    }
  }
  Game.context.putImageData(Game.map, 0, 0, 0, 0, 400, 400);
}

Game.addLand = function (x, y)
{
  if (fat)
  {
    x = (x / 2) | 0;
    y = (y / 2) | 0;
  }
  this.water[y + 400 * x] += 0.1;
}

function onMouseDown(ev)
{
  Game.adding = true;
}

function onMouseUp(ev)
{
  var mouseX = (ev.clientX - Game.surface.offsetLeft);
  var mouseY = (ev.clientY - Game.surface.offsetTop);

  Game.addLand(mouseX, mouseY);
  Game.adding = false;
}

function onMouseMove(ev)
{
  var mouseX = (ev.clientX - Game.surface.offsetLeft);
  var mouseY = (ev.clientY - Game.surface.offsetTop);

  if (Game.adding) Game.addLand(mouseX, mouseY);
}

function main()
{
  Game.init();
  window.setInterval(Game.run, 17);
}