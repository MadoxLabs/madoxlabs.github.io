var oculusDefault = {};
oculusDefault.hResolution = 1280;
oculusDefault.vResolution = 800;
oculusDefault.hScreenSize = 0.14976;
oculusDefault.vScreenSize = 0.0935;
oculusDefault.distortionK = [1.0, 0.22, 0.24, 0.0];
oculusDefault.vScreenCenter = oculusDefault.VScreenSize / 2.0;
oculusDefault.eyeToScreenDistance = 0.041;
oculusDefault.lensSeparationDistance = 0.0635;
oculusDefault.interpupillaryDistance = 0.065;

var gl;
var ext = {};
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
    ext.angle = gl.getExtension("ANGLE_instanced_arrays");
    ext.index = gl.getExtension("OES_element_index_uint");
    ext.std = gl.getExtension("OES_standard_derivitives");
    ext.float = gl.getExtension("OES_texture_float");
    ext.floatlinear = gl.getExtension("OES_texture_float_linear");
    ext.halffloat = gl.getExtension("OES_texture_half_float");
    ext.halffloatlinear = gl.getExtension("OES_texture_half_float_linear");
    gl.viewportWidth = this.surface.clientWidth;
    gl.viewportHeight = this.surface.clientHeight;
  } catch (e) { }

  if (!gl) { alert("Could not initialise WebGL, sorry :-("); return; }
//  if (!angle) alert("Could not find instanced draw calls");
  
  // GL is ready, graphics specific init now happens
  gl.clearColor(0.05, 0.05, 0.05, 1.0);
  Game.camera = new Camera(gl.viewportWidth, gl.viewportHeight);
  Game.makeFSQ();

  // handlers
  document.onkeydown = Game.handleKeyDown;
  document.onkeyup = Game.handleKeyUp;
  window.addEventListener('resize', handleSizeChange);

  addEventListener('fullscreenchange', function () { handlefullscreen(document.fullscreen); });
  addEventListener('mozfullscreenchange', function () { handlefullscreen(document.mozFullScreen); });
  addEventListener('webkitfullscreenchange', function () { handlefullscreen(document.webkitIsFullScreen); });

  this.oculus = oculusDefault;
  this.oculusReady = 0;
  this.oculusBridge = new OculusBridge({
    onConfigUpdate: bridgeConfigUpdated,
    onConnect: bridgeConnected,
    onDisconnect: bridgeDisconnected
  });

  // let game specific stuff init
  Game.loadShaderFile(libdir + "/oculus.fx");
  Game.appInit();

  Game.ready = true;
  Game.lastTime = Game.now();
  handleSizeChange();
  Game.deviceReady();
}

function bridgeConfigUpdated(config)
{
  console.log("Oculus config gotten!");
  Game.oculus = config;
  Game.oculusReady |= 2;
}

function bridgeConnected()
{
  console.log("Bridge gotten!");
  Game.oculusReady |= 1;
}

function bridgeDisconnected()
{
  console.log("Bridge not here!");
  Game.oculusReady = 0;
}

Game.makeFSQ = function ()
{
  fsqvertices = [
   -1.0, -1.0, 0.0, 0.0,
    1.0, -1.0,  1.0, 0.0,
   -1.0, 1.0,   0.0, 1.0,
    1.0, 1.0,   1.0, 1.0
  ];
  var attr = { 'POS': 0, 'TEX0': 8 };
  var fsq = new Mesh();
  fsq.loadFromArrays(fsqvertices, null, attr, gl.TRIANGLE_STRIP, 4);
  Game.assetMan.assets['fsq'] = fsq;

  fsqvertices = [
   -1.0, -1.0, 0.0, 0.0,
    1.0, -1.0, 0.5, 0.0,
   -1.0, 1.0, 0.0, 1.0,
    1.0, 1.0, 0.5, 1.0
  ];
  var fsqleft = new Mesh();
  fsqleft.loadFromArrays(fsqvertices, null, attr, gl.TRIANGLE_STRIP, 4);
  Game.assetMan.assets['fsqleft'] = fsqleft;

  fsqvertices = [
   -1.0, -1.0, 0.5, 0.0,
    1.0, -1.0, 1.0, 0.0,
   -1.0, 1.0, 0.5, 1.0,
    1.0, 1.0, 1.0, 1.0
  ];
  var fsqright = new Mesh();
  fsqright.loadFromArrays(fsqvertices, null, attr, gl.TRIANGLE_STRIP, 4);
  Game.assetMan.assets['fsqright'] = fsqright;
}

Game.postprocess = function (name)
{
  if (!name) Game.frontbuffer = null;
  else Game.frontbuffer = new RenderSurface(gl.viewportWidth, gl.viewportHeight);
  Game.postprocessShader = name;
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
  Game.appDrawAux();

  if (Game.frontbuffer) Game.frontbuffer.engage();
  else gl.bindFramebuffer(gl.FRAMEBUFFER, null);

  gl.clearColor(0.05, 0.05, 0.05, 1.0);
  gl.clearDepth(1.0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  for (var eye in Game.camera.eyes)
  {
    Game.camera.eyes[eye].engage();
    Game.appDraw(Game.camera.eyes[eye]);
  }

  // post process here
  if (Game.isOculus)
  {
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    for (var eye in Game.camera.eyes)
    {
      Game.camera.eyes[eye].engage();
      var uniforms = {};
      uniforms.distortionscale = 0.8;
      uniforms.aspect = Game.oculus.hResolution * 0.5 / Game.oculus.vResolution;
      uniforms.ScreenCenter = Game.camera.eyes[eye].center;
      uniforms.LensCenter = Game.camera.eyes[eye].lenscenter;

      var effect = Game.shaderMan.shaders[Game.postprocessShader];
      effect.bind();
      effect.setUniforms(uniforms);
      effect.bindTexture("uFrontbuffer", Game.frontbuffer.texture);
      effect.draw(Game.assetMan.assets[Game.camera.eyes[eye].fsq]);
    }
  }
}

Game.oculusMode = function(state)
{
  if (state && !Game.isOculus)
  {
    Game.oculusBridge.connect();
    var docElm = document.documentElement;
    if (docElm.requestFullscreen)      docElm.requestFullscreen();
    else if (docElm.mozRequestFullScreen)      docElm.mozRequestFullScreen();
    else if (docElm.webkitRequestFullScreen) { docElm.webkitRequestFullScreen(); docElm.webkitRequestFullScreen(Element.ALLOW_KEYBOARD_INPUT); }
    else if (docElm.msRequestFullscreen) docElm.msRequestFullscreen();
    Game.surface.style.width = "100%";
    Game.surface.style.height = "100%";
    Game.postprocess("oculus");
    Game.camera.splitscreen(true);
    Game.isOculus = true;
  }
  else if (!state && Game.isOculus)
  {
    Game.oculusBridge.disconnect();
    if (document.exitFullscreen) document.exitFullscreen();
    else if (document.mozCancelFullScreen)      document.mozCancelFullScreen();
    else if (document.webkitCancelFullScreen)      document.webkitCancelFullScreen();
    else if (document.msExitFullscreen)      document.msExitFullscreen();
    Game.surface.style.width = "800px";
    Game.surface.style.height = "600px";
    Game.postprocess(null);
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
  gl.viewportWidth = Game.surface.clientWidth;
  gl.viewportHeight = Game.surface.clientHeight;

  Game.oculus.hResolution = Game.surface.clientWidth;
  Game.oculus.vResolution = Game.surface.clientHeight;

  Game.camera.handleSizeChange(Game.surface.width, Game.surface.height);
  if (Game.frontbuffer) Game.frontbuffer = new RenderSurface(gl.viewportWidth, gl.viewportHeight);
//  Game.makeFSQ();
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

Game.handleKeyDown = function (event)
{
  // space and arrow keys dont scroll
  if ([32, 37, 38, 39, 40].indexOf(event.keyCode) > -1) event.preventDefault();
  Game.appHandleKeyDown(event);
}

Game.handleKeyUp = function (event)
{
  Game.appHandleKeyUp(event);
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
// Game.appDrawAux = function ()
// {
// }
// 
// Game.appDrawMain = function (eye)
// {
// }
// 
// Game.appHandleKeyDown = function (event)
// {
// }
//
// Game.appHandleKeyUp = function (event)
// {
// }
// 