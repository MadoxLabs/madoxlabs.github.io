var gl;
var angle;
var Game = {};

// game renders to texture for possible post processing

Game.init = function ()
{
  // initial set up of the game object, init gl, create helpers
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
    gl.viewportWidth = this.surface.clientWidth;
    gl.viewportHeight = this.surface.clientHeight;
  } catch (e) { }

  if (!gl) { alert("Could not initialise WebGL, sorry :-("); return; }
  if (!angle) alert("Could not find instanced draw calls");
  
  // GL is ready, graphics specific init now happens
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  this.camera = new Camera(gl.viewportWidth, gl.viewportHeight);

  document.onkeydown = Game.handleKeyDown;
  document.onkeyup = Game.handleKeyUp;
  window.addEventListener('resize', handleSizeChange);

  addEventListener('fullscreenchange', function () { handlefullscreen(document.fullscreen); });
  addEventListener('mozfullscreenchange', function () { handlefullscreen(document.mozFullScreen); });
  addEventListener('webkitfullscreenchange', function () { handlefullscreen(document.webkitIsFullScreen); });

  // let game specific stuff init
  Game.appInit();

  Game.ready = true;
  Game.lastTime = Game.now();
  handleSizeChange();
  Game.deviceReady();
}

Game.run = function ()
{
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
  Game.context.clearRect(0, 0, 400, 50);
  Game.context.font = "bold 8px Arial";
  Game.context.fillStyle = "#00aa00";
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
  Game.camera.update();
}

Game.draw = function ()
{
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  for (var eye in Game.camera.eyes)
  {
    Game.camera.eyes[eye].engage();
    Game.appDraw(Game.camera.eyes[eye]);
  }
}

Game.oculusMode = function(state)
{
  if (state && !Game.isOculus)
  {
    var docElm = document.documentElement;
    if (docElm.requestFullscreen)      docElm.requestFullscreen();
    else if (docElm.mozRequestFullScreen)      docElm.mozRequestFullScreen();
    else if (docElm.webkitRequestFullScreen) { docElm.webkitRequestFullScreen(); docElm.webkitRequestFullScreen(Element.ALLOW_KEYBOARD_INPUT); }
    else if (docElm.msRequestFullscreen) docElm.msRequestFullscreen();
    Game.surface.style.width = "100%";
    Game.surface.style.height = "100%";
    Game.camera.splitscreen(true);
    Game.isOculus = true;
  }
  else if (!state && Game.isOculus)
  {
    if (document.exitFullscreen) document.exitFullscreen();
    else if (document.mozCancelFullScreen)      document.mozCancelFullScreen();
    else if (document.webkitCancelFullScreen)      document.webkitCancelFullScreen();
    else if (document.msExitFullscreen)      document.msExitFullscreen();
    Game.surface.style.width = "800px";
    Game.surface.style.height = "600px";
    Game.camera.splitscreen(false);
    Game.isOculus = false;
  }
}

function handlefullscreen(state)
{
  Game.oculusMode(state);
}

function handleSizeChange()
{
  Game.surface.width = Game.surface.clientWidth;
  Game.surface.height = Game.surface.clientHeight;
  gl.viewportWidth = this.surface.clientWidth;
  gl.viewportHeight = this.surface.clientHeight;
  Game.camera.handleSizeChange(Game.surface.width, Game.surface.height);
  Game.deviceReady();
}

Game.now = function ()
{
  var d = new Date();
  return d.getTime();
}

Game.loadShaderFile = function (name)
{
  Game.loadingIncr();

  var client = new XMLHttpRequest();
  client.open('GET', name);
  client.onload = function () { Game.shaderMan.processEffect(client.responseText); }
  client.send();
}

Game.loadTextureFile = function (name, file, mipmap)
{
  Game.loadingIncr();

  var tex = new Texture(name);
  if (arguments.length == 3) tex.mipmap = mipmap;
  tex.load(file);
}

Game.loadMeshPNG = function (name, file)
{
  Game.loadingIncr();

  var tex = new MeshPNG(name);
  tex.load(file);
}

Game.loadMesh = function (name, file)
{
  Game.loadingIncr();

  var client = new XMLHttpRequest();
  client.open('GET', file);
  client.onload = function () { Game.assetMan.processMesh(name, client.responseText); }
  client.send();
}

Game.loadingIncr = function() 
{
  if (Game.loading == 0) Game.loadingStart();
  Game.loading += 1;
}

Game.loadingDecr = function ()
{
  if (Game.loading == 1) Game.loadingStop();
  Game.loading -= 1;
}

function main()
{
  Game.init();
  window.setInterval(Game.run, 17);
}


// Start Game specific stuff
// Game.appInit = function ()
// {
// }
// 
// The grapgics device is ready or changed
// Game.deviceReady = function ()
// {
// }
// 
// Game.loadingStart = function ()
// {
// }
//
// Game.loadingEnd = function ()
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