var gl;
var angle;
var Game = {};

Game.init = function ()
{
  this.loading = 0;
  this.ready = false;
  this.shaderMan = new ShaderManager();
  this.assetMan = new AssetManager();

  this.surface = document.getElementById("surface");
  this.output = document.getElementById("output");
  this.context = this.output.getContext('2d');

  this.lastTime = Game.time;
  this.time = Game.now();
  this.elapsed = 0;

  try {
    gl = this.surface.getContext("experimental-webgl");
    angle = gl.getExtension("ANGLE_instanced_arrays");
    gl.viewportWidth = this.surface.width;
    gl.viewportHeight = this.surface.height;
  } catch (e) { }

  if (!gl) { alert("Could not initialise WebGL, sorry :-("); return; }
  if (!angle) alert("Could not find instanced draw calls");

  document.onkeydown = Game.handleKeyDown;
  document.onkeyup = Game.handleKeyUp;

  Game.appInit();
}

Game.run = function ()
{
  if (Game.loading == 0 && Game.ready == false) {
    Game.ready = true;
    Game.lastTime = Game.now();
    Game.deviceReady();
  }
  if (Game.ready == false) return;

  Game.lastTime = Game.time;
  Game.time = Game.now();
  Game.elapsed = Game.time - Game.lastTime;

  Game.update();              var updateTime = Game.now() - Game.time;
  Game.draw();                var drawTime = Game.now() - Game.time - updateTime;
                              var idleTime = 17 - updateTime - drawTime;

  //////////
  // draw the timing stats
  //
  Game.context.fillStyle = "white";
  Game.context.fillRect(0, 0, 400, 50);
  Game.context.font = "bold 8px Arial";
  Game.context.fillStyle = "#000000";
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
  Game.appUpdate();
}

Game.draw = function ()
{
  Game.appDraw();
}

Game.now = function ()
{
  var d = new Date();
  return d.getTime();
}

Game.loadShaderFile = function (name)
{
  Game.loading += 1;
  Game.ready = false;

  var client = new XMLHttpRequest();
  client.open('GET', name);
  client.onload = function () { Game.shaderMan.processEffect(client.responseText); }
  client.send();
}

Game.loadTextureFile = function (name, file, mipmap)
{
  Game.loading += 1;
  Game.ready = false;

  var tex = new Texture(name);
  if (arguments.length == 3) tex.mipmap = mipmap;
  tex.load(file);
}

function main()
{
  Game.init();
  window.setInterval(Game.run, 17);
}


//
// Game.appInit = function ()
// {
// }
// 
// Game.deviceReady = function ()
// {
// }
// 
// Game.appUpdate = function ()
// {
// 
// }
// 
// Game.appDraw = function ()
// {
// }
// 
// Game.handleKeyDown = function (event)
// {
// }
//
// Game.handleKeyUp = function (event)
// {
// }
// 