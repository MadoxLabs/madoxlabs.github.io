
var uPerObject;
var currentlyPressedKeys = [];
var helper;
var shadowmap;
var lighteye;
var sunpos = 0.0;

Game.appInit = function ()
{
  Game.World = new fWorld();
  Game.World.createRegionContaining(0, 0);

  Game.loadShaderFile("renderstates.fx");
  Game.loadShaderFile("waterFlowIn.fx");
  Game.loadShaderFile("waterFlowOut.fx");
  Game.loadShaderFile("colorlines.fx");

  Game.loadShaderFile("shadowrecieve.fx");
  Game.loadShaderFile("ground.fx");
  Game.loadShaderFile("groundpicker.fx");
  Game.loadShaderFile("water.fx");
  Game.loadShaderFile("shadowcast.fx");

  Game.loadTextureFile("tile", "tile.jpg", true);
  Game.loadTextureFile("grass", "grass.jpg", true);
  Game.loadTextureFile("sand", "sand.jpg", true);
  Game.loadTextureFile("dirt", "dirtcliff.jpg", true);

  Game.loadMeshPNG("ball", "ball.model");
}

Game.deviceReady = function ()
{
  pickmap = new RenderSurface(Game.camera.width, Game.camera.height, gl.RGBA, gl.UNSIGNED_BYTE);
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
  uPerObject.options = vec3.fromValues(1.0, 1.0, 1.0);
  uPerObject.regionsize = (RegionSize - 1);
  mat4.identity(uPerObject.uWorld);

  shadowmap = new RenderSurface(2048, 2048, gl.RGBA, gl.FLOAT);

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
  if (currentlyPressedKeys[33] && Game.camera.offset[2] > 4)  // Page Up
    Game.camera.offset[2] -= 1;
  if (currentlyPressedKeys[34] && Game.camera.offset[2] < 100)  // Page Down
    Game.camera.offset[2] += 1;

  if (currentlyPressedKeys[37] && Game.camera.target[0] > 0)  // Left cursor key
    Game.camera.target[0] -= 0.1;
  if (currentlyPressedKeys[39] && Game.camera.target[0] < 100)  // Right cursor key
    Game.camera.target[0] += 0.1;

  if (currentlyPressedKeys[38] && Game.camera.target[2] > 0)  // Up cursor key
    Game.camera.target[2] -= 0.1;
  if (currentlyPressedKeys[40] && Game.camera.target[2] < 100)  // Down cursor key
    Game.camera.target[2] += 0.1;

  sunpos += 0.01; 
  if (sunpos > 150.0) sunpos = -150.0;
  if (sunpos != lighteye.offset[0])
  {
    lighteye.offset = vec3.fromValues(sunpos, (120.0 - Math.abs(sunpos)) * 2.0, 0.0);
    lighteye.lookAt(50.0, 0.0, 50.0);
    lighteye.update();
    uPerObject.uLightPosition = lighteye.position;
    mat4.multiply(uPerObject.uWorldToLight, lighteye.eyes[0].projection, lighteye.eyes[0].view);
  }
  // UPDATE SUN UI
  var v = document.getElementById("sunval");
  v.innerHTML = sunpos.toString().substr(0,5);
  var s = document.getElementById("sun");
  s.value = sunpos;
  // END UPDATE SUN UI

  if (readback)
  {
    readback = false;
    pickmap.engage();
    var pixel = new Uint8Array(4);
    gl.readPixels(mx, Game.camera.height - my, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixel);
    var i = ((pixel[0] * (RegionSize-1) / 255.0) | 0) +1;
    var j = ((pixel[1] * (RegionSize - 1) / 255.0) | 0) + 1;
    Game.World.Regions[0].addwater(i, j, water);
  }
  Game.camerafix();
}

Game.camerafix = function()
{
  Game.camera.target[1] = Game.World.getHeight(Game.camera.target[0], Game.camera.target[2]) + Game.World.getWaterHeight(Game.camera.target[0], Game.camera.target[2]);

  // check for ground clip
  var x = 0;
  do {
    x++;
    if (x == 100) break; // sanity
    var h = Game.World.getHeight(Game.camera.position[0], Game.camera.position[2]);
    h += Game.World.getWaterHeight(Game.camera.position[0], Game.camera.position[2]);
    if (Game.camera.position[1] - h > 1.0) break;
    Game.camera.angles[0] -= 0.01;
    Game.camera.update();
  } while (true);
}

Game.appDrawAux = function ()
{
  if (Game.loading) return;

  // water
   Game.World.Regions[0].renderflows();

  // shadowing render
  lighteye.engage();
  shadowmap.engage();
  gl.clearColor(1.0, 1.0, 1.0, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  var effect = Game.shaderMan.shaders["shadowcast"];
  effect.bind();
  effect.bindCamera(lighteye);
  mat4.identity(uPerObject.uWorld);
  effect.setUniforms(uPerObject);
  effect.bindTexture("heightmap", Game.World.Regions[0].heightmap.texture);
  effect.draw(Game.World.Regions[0].mesh);

  mat4.identity(uPerObject.uWorld);
  effect.setUniforms(uPerObject);
  effect.draw(Game.assetMan.assets["ball"]);

  if (clicked && !readback)
  {
    Game.camera.eyes[0].engage()
    pickmap.engage();
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    var effect = Game.shaderMan.shaders["picker"];
    effect.bind();
    effect.bindCamera(Game.camera.eyes[0]);
    effect.setUniforms(uPerObject);
    effect.bindTexture("heightmap", Game.World.Regions[0].heightmap.texture);
    effect.bindTexture("watermap", Game.World.Regions[0].watermap.texture);
    effect.draw(Game.World.Regions[0].mesh);
    readback = true;
  }
}

Game.appDraw = function (eye)
{
  if (!Game.ready || Game.loading) return;

  var effect = Game.shaderMan.shaders["ground"];
  effect.bind();
  effect.bindCamera(eye);
  effect.setUniforms(uPerObject);
  effect.bindTexture("heightmap", Game.World.Regions[0].heightmap.texture);
  if (Game.World.Regions[0].aomap) effect.bindTexture("aomap", Game.World.Regions[0].aomap.texture);
  effect.bindTexture("wang", Game.World.Regions[0].wangmap.texture);
   effect.bindTexture("shadow", shadowmap.texture);

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
  mat4.identity(uPerObject.uWorld);
  effect.setUniforms(uPerObject);
  effect.draw(Game.World.Regions[0].mesh);

  mat4.identity(uPerObject.uWorld);
  effect.setUniforms(uPerObject);
  effect.draw(Game.assetMan.assets["ball"]);

  effect = Game.shaderMan.shaders["water"];
  effect.bind();
  effect.bindCamera(eye);
  effect.setUniforms(uPerObject);
  effect.bindTexture("heightmap", Game.World.Regions[0].heightmap.texture);
  effect.bindTexture("watermap", Game.World.Regions[0].watermap.texture);
  effect.bindTexture("shadow", shadowmap.texture);
  effect.draw(Game.World.Regions[0].mesh);

//  effect = Game.shaderMan.shaders["colorlines"];
//  effect.bind();
//  effect.bindCamera(eye);
//  effect.draw(helper.aoBuf);
}

var mx = 0;
var my = 0;
var clicked = false;
var readback = false;
var pickmap;

Game.appHandleMouseEvent = function (type, mouse)
{
  if (mouse.button == 0 && type == MouseEvent.Down)
  {
    mx = mouse.X;
    my = mouse.Y;
    clicked = true;
  }
  if (mouse.button == 0 && type == MouseEvent.Up)
  {
    clicked = false;
  }
  if (clicked && type == MouseEvent.Move)
  {
    mx = mouse.X;
    my = mouse.Y;
  }

  if (mouse.button == 2 && type == MouseEvent.Down)
    mouse.grab();
  if (mouse.button == 2 && type == MouseEvent.Up)
    mouse.release();

  if (type == 8)
  {
    Game.camera.offset[2] -= mouse.wheel * 3;
    if (Game.camera.offset[2] < 4) Game.camera.offset[2] = 4;
    if (Game.camera.offset[2] > 100) Game.camera.offset[2] = 100;
    Game.camerafix();
  }

  if (mouse.grabbed)
  {
    if (mouse.moveOffsetX < 20 && mouse.moveOffsetX > -20) 
    {
      Game.camera.angles[1] += -0.01 * mouse.moveOffsetX;
      Game.camera.angles[0] += -0.01 * mouse.moveOffsetY;
      Game.camerafix();
    }
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
var water = 0.25;

Game.setparam = function(name, value)
{
  if (name == 'ao') uPerObject.options[1] = (value ? 1.0 : 0.0);
  else if (name == 'diffuse') uPerObject.options[0] = (value ? 1.0 : 0.0);
  else if (name == 'wang') showWang = !showWang;
  else if (name == 'shadow') uPerObject.options[2] = (value ? 1.0 : 0.0);
  else if (name == 'count') { Game.World.cast.setRays(value, 0, 0); Game.World.Regions[0].createAOMap(); Game.makeHelper(); }
  else if (name == 'size') { Game.World.cast.setRays(0, 0, value); Game.World.Regions[0].createAOMap(); Game.makeHelper(); }
  else if (name == 'step') { Game.World.cast.setRays(0, value, 0); Game.World.Regions[0].createAOMap(); Game.makeHelper(); }
  else if (name == 'water') water = parseInt(value) * 0.01;
  else if (name == 'sun') {
    if (value[0] == '-')
      sunpos = parseInt(value.substr(1)) * -1.0;
    else
      sunpos = parseInt(value);
  }
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