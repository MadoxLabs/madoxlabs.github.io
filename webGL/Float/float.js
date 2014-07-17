
var uPerObject;
var currentlyPressedKeys = [];
var helper;
var shadowmap;
var lighteye;
var sunpos = 0.0;

var highRez = true;

Game.appInit = function ()
{
  Game.World = new fWorld();
  Game.World.createRegionContaining(0, 0);

  Game.loadShaderFile("renderstates.fx");
  //  Game.loadShaderFile("colorlines.fx");

  if (highRez)
  {
    Game.loadShaderFile("shadowrecieve.fx");
    Game.loadShaderFile("ground.fx");
    Game.loadShaderFile("water.fx");
    Game.loadShaderFile("shadowcast.fx");
  }
  else
  {
    Game.loadShaderFile("shadowoff.fx");
    Game.loadShaderFile("groundlow.fx");
    Game.loadShaderFile("waterlow.fx");
  }

  Game.loadTextureFile("tile", "tile.jpg", true);
  Game.loadTextureFile("grass", "grass.jpg", true);
  Game.loadTextureFile("sand", "sand.jpg", true);
  Game.loadTextureFile("dirt", "dirtcliff.jpg", true);
}

Game.deviceReady = function ()
{
}

Game.loadingStart = function ()
{
  Game.ready = false;
}

Game.loadingStop = function ()
{
  Game.ready = true;

  Game.camera.offset[0] = 0.0;
  Game.camera.offset[1] = 0.0;
  Game.camera.offset[2] = 100.0;
  Game.camera.angles[0] = -0.55;
  Game.camera.lookAt(50.0, 0.0, 50.0);

  var effect = Game.shaderMan.shaders["ground"];
  uPerObject = effect.createUniform('perobject');
  uPerObject.uWorld = mat4.create();
  uPerObject.uWorldToLight = mat4.create();
  uPerObject.options = vec2.fromValues(1.0, 1.0);
  mat4.identity(uPerObject.uWorld);

  if (highRez) shadowmap = new RenderSurface(2048, 2048, gl.RGBA, gl.FLOAT);
  lighteye = new Camera(2048, 2048);
  sunpos = 0.0;
  lighteye.offset = vec3.fromValues(sunpos, 150.0 - Math.abs(sunpos), 0.0);
  lighteye.lookAt(50.0, 0.0, 50.0);
  lighteye.update();
  uPerObject.uLightPosition = lighteye.position;
  mat4.multiply(uPerObject.uWorldToLight, lighteye.eyes[0].projection, lighteye.eyes[0].view);

  Game.makeHelper();
}

Game.makeHelper = function()
{
  helper = new aoHelper(Game.World.cast);
  var pos = vec3.fromValues(50.0, Game.World.getHeight(50.0,50.0), 50.0);
  helper.Update(pos);
}

Game.appUpdate = function ()
{
  if (Game.loading) return;
  if (!Game.camera) return;
  if (currentlyPressedKeys[33])  // Page Up
    Game.camera.offset[2] -= 1;
    //sunpos -= 1;
  if (currentlyPressedKeys[34])  // Page Down
    Game.camera.offset[2] += 1;
    //sunpos += 1;

  if (currentlyPressedKeys[37])  // Left cursor key
    Game.camera.target[0] -= 0.1;
  if (currentlyPressedKeys[39])  // Right cursor key
    Game.camera.target[0] += 0.1;

  if (currentlyPressedKeys[38])  // Up cursor key
    Game.camera.target[2] -= 0.1;
  if (currentlyPressedKeys[40])  // Down cursor key
    Game.camera.target[2] += 0.1;

  sunpos += 0.1;
  if (sunpos > 150.0) sunpos = -150.0;
  if (sunpos != lighteye.offset[0])
  {
    lighteye.offset = vec3.fromValues(sunpos, (120.0 - Math.abs(sunpos)) * 2.0, 0.0);
    lighteye.lookAt(50.0, 0.0, 50.0);
    lighteye.update();
    uPerObject.uLightPosition = lighteye.position;
    mat4.multiply(uPerObject.uWorldToLight, lighteye.eyes[0].projection, lighteye.eyes[0].view);
  }

  Game.World.Regions[0].jiggleWater();
}

Game.appDrawAux = function ()
{
  if (Game.loading) return;
  if (!highRez) return;
  
  // shadowing render
  lighteye.engage();
  shadowmap.engage();
  gl.clearColor(1.0, 1.0, 1.0, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  var effect = Game.shaderMan.shaders["shadowcast"];
  effect.bind();
  effect.bindCamera(lighteye);
  effect.setUniforms(uPerObject);
  effect.bindTexture("heightmap", Game.World.Regions[0].heightmap.texture);
  effect.draw(Game.World.Regions[0].mesh);

  // water
  // render pass 1 water: calculate incoming
  // render pass 2 water: calculate output
  // create texture?
}

Game.appDraw = function (eye)
{
  if (!Game.ready || Game.loading) return;

  var effect = Game.shaderMan.shaders["ground"];
  effect.bind();
  effect.bindCamera(eye);
  effect.setUniforms(uPerObject);
  effect.bindTexture("heightmap", Game.World.Regions[0].heightmap.texture);
  effect.bindTexture("aomap", Game.World.Regions[0].aomap.texture);
  effect.bindTexture("wang", Game.World.Regions[0].wangmap.texture);
  if (highRez) effect.bindTexture("shadow", shadowmap.texture);

  if (showWang)
  {
    effect.bindTexture("grass", Game.assetMan.assets['tile'].texture);
    effect.bindTexture("dirt", Game.assetMan.assets['tile'].texture);
    effect.bindTexture("sand", Game.assetMan.assets['tile'].texture);
  }
  else
  {
    effect.bindTexture("grass", Game.assetMan.assets['grass'].texture);
    effect.bindTexture("dirt", Game.assetMan.assets['dirt'].texture);
    effect.bindTexture("sand", Game.assetMan.assets['sand'].texture);
  }
  effect.draw(Game.World.Regions[0].mesh);

  effect = Game.shaderMan.shaders["water"];
  effect.bind();
  effect.bindCamera(eye);
  effect.setUniforms(uPerObject);
  effect.bindTexture("heightmap", Game.World.Regions[0].heightmap.texture);
  effect.bindTexture("watermap", Game.World.Regions[0].watermap.texture);
  if (highRez) effect.bindTexture("shadow", shadowmap.texture);
  effect.draw(Game.World.Regions[0].mesh);

//  effect = Game.shaderMan.shaders["colorlines"];
//  effect.bind();
//  effect.bindCamera(eye);
//  effect.draw(helper.aoBuf);
}

Game.appHandleMouseEvent = function (type, mouse)
{
  if (mouse.button == 2 && type == MouseEvent.Down)
    mouse.grab();
  if (mouse.button == 2 && type == MouseEvent.Up)
    mouse.release();

  if (type == 8)
    Game.camera.offset[2] -= mouse.wheel*3;

  if (mouse.grabbed)
  {
    Game.camera.angles[1] += -0.01 * mouse.moveOffsetX;
    Game.camera.angles[0] += -0.01 * mouse.moveOffsetY;
  }
}

Game.appHandleKeyDown = function (event)
{
  if ([33, 34].indexOf(event.keyCode) > -1) event.preventDefault();
  currentlyPressedKeys[event.keyCode] = true;
}

Game.appHandleKeyUp = function (event)
{
  currentlyPressedKeys[event.keyCode] = false;
  if (event.keyCode == 70) Game.fullscreenMode(!Game.isFullscreen);
  if (event.keyCode == 79) Game.oculusMode(!Game.isOculus);
}

var showWang = false;

Game.setparam = function(name, value)
{
  if (name == 'ao') uPerObject.options[1] = (value ? 1.0 : 0.0);
  else if (name == 'diffuse') uPerObject.options[0] = (value ? 1.0 : 0.0);
  else if (name == 'wang') showWang = !showWang;
  else if (name == 'count') { Game.World.cast.setRays(value, 0, 0); Game.World.Regions[0].createAOMap(); Game.makeHelper(); }
  else if (name == 'size') { Game.World.cast.setRays(0, 0, value); Game.World.Regions[0].createAOMap(); Game.makeHelper(); }
  else if (name == 'step') { Game.World.cast.setRays(0, value, 0); Game.World.Regions[0].createAOMap(); Game.makeHelper(); }
  else if (name == 'sun') sunpos = value;
}

/*
PHASE 1

shader includes

v create a sized grid with NxN divisions and a skirt for future
v have a ground definition object that run noise lib
v create a heightmap from ground
v  create an AO map from raycasting
v  render the ground provided height, ao maps
v    vertex shader: set height from height map
v                   get ao factor and interpolate it
 v   pixel shader: determine the light based on ao factor
  sky colour
v   moving light

v  camera - fixed looking at center of ground
v            rotate about Y
v            rotate about X
v            in and out

PHASE 2

v basic textures
v basic shadow map
dual shadow map
 
PHASE 3

v wang tiles
water, doesnt use shadows

*/