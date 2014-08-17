var effect;
var square;
var grid;

var normals;
var wire;
var explode;
var bb;

var uPerObject;
var uPerObjectN;
var uLight;
var uGrid;

var xRot = 0;
var xSpeed = 0;
var yRot = 0;
var ySpeed = 0;
var decay = 0.98;

var currentlyPressedKeys = {};

function degToRad(degrees)
{
  return degrees * Math.PI / 180;
}

Game.appInit = function ()
{
  Game.loadShaderFile("shaders.fx");
  Game.loadShaderFile("normalShader.fx");
  Game.loadShaderFile("shadowcast.fx");

  Game.loadMeshPNG("sample", "joan.model");
  Game.loadMeshPNG("floor", "grid.model");
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

  // do setup work for the mesh
  square = Game.assetMan.assets["sample"];
  grid = Game.assetMan.assets["floor"];

  normals = square.drawNormals();
  wire = square.drawWireframe();
  //explode = square.drawExploded();
  bb = square.drawBB();

  var len = 0;
  for (var i = 0; i < 2; ++i)
  {
    var l = square.boundingbox[0].max[i] - square.boundingbox[0].min[i];
    if (l > len) len = l;
  }
  var max = square.boundingbox[0].max[2] - square.boundingbox[0].min[2]
  if (max < len) max = len;

  Game.camera.offset[0] = 0.0;
  Game.camera.offset[1] = 0.0;
  Game.camera.offset[2] = 1.3 * len / (Math.tan(Game.camera.fov));
  Game.camera.lookAt(square.boundingbox[0].min[0] + (square.boundingbox[0].max[0] - square.boundingbox[0].min[0]) / 2.0,
                     square.boundingbox[0].min[1] + (square.boundingbox[0].max[1] - square.boundingbox[0].min[1]) / 2.0,
                     0.0);
  // do setup work for the plain object shader
  var effect = Game.shaderMan.shaders["meshViewer"];

  uLight = effect.createUniform('light');
  uLight.uGlobalAmbientRGB = [0.5, 0.5, 0.5];
  uLight.uLightAmbientRGB = [0,0,0];
  uLight.uLightDiffuseRGB = [1,1,1];
  uLight.uLightSpecularRGB = [1,1,1];
  uLight.uLightAttenuation = [0, 1, 0];
  uLight.uLightPosition = [9.0, 9.0, 39.0];

  uPerObject = effect.createUniform('perobject');
  uPerObject.uWorld = mat4.create();
  uPerObject.uWorldToLight = mat4.create();
  uPerObject.options = vec4.create();

  uGrid = effect.createUniform('perobject');
  uGrid.options = vec4.fromValues(0, 0, 0, 0);
  uGrid.uWorld = mat4.create();
  uGrid.uWorldToLight = mat4.create();
  mat4.identity(uGrid.uWorld);
  mat4.scale(uGrid.uWorld, uGrid.uWorld, vec3.fromValues(max*2, 0, max*2));

  // do setup work for the normal shader
  var effect = Game.shaderMan.shaders["normalViewer"];

  uPerObjectN = effect.createUniform('perobject');
  uPerObjectN.uWorld = uPerObject.uMVMatrix;

  // shadowing support
  shadowmap = new RenderSurface(2048, 2048, gl.RGBA, gl.FLOAT);
  lighteye = new Camera(2048, 2048);
  lighteye.offset = vec3.fromValues(9.0, 9.0, 39.0);
  lighteye.lookAt(0.0,0.0,0.0);
  lighteye.update();

  mat4.multiply(uPerObject.uWorldToLight, lighteye.eyes[0].projection, lighteye.eyes[0].view);
  mat4.multiply(uGrid.uWorldToLight, lighteye.eyes[0].projection, lighteye.eyes[0].view);
}

Game.appUpdate = function ()
{
  if (Game.loading) return;
  if (!Game.camera) return;

  if (currentlyPressedKeys[33])  // Page Up
    Game.camera.offset[2] -= 0.1;
  if (currentlyPressedKeys[34])  // Page Down
    Game.camera.offset[2] += 0.1;
  if (currentlyPressedKeys[37])  // Left cursor key
  {
    if (currentlyPressedKeys[16]) { Game.camera.angles[1] += 0.1; }
    else ySpeed -= 2;
  }
  if (currentlyPressedKeys[39])  // Right cursor key
  {
    if (currentlyPressedKeys[16]) { Game.camera.angles[1] -= 0.1; }
    else ySpeed += 2;
  }
  if (currentlyPressedKeys[38])  // Up cursor key
  {
    if (currentlyPressedKeys[16]) { Game.camera.target.Position[1] += 0.1; }
    else xSpeed -= 2;
  }
  if (currentlyPressedKeys[40])  // Down cursor key
  {
    if (currentlyPressedKeys[16]) { Game.camera.target.Position[1] -= 0.1; }
    else xSpeed += 2;
  }

  ySpeed *= decay;
  xSpeed *= decay;

  xRot += (xSpeed * Game.elapsed) / 1000.0;
  yRot += (ySpeed * Game.elapsed) / 1000.0;

  mat4.identity(uPerObject.uWorld);
  mat4.rotate(uPerObject.uWorld, uPerObject.uWorld, degToRad(xRot), [1, 0, 0]);
  mat4.rotate(uPerObject.uWorld, uPerObject.uWorld, degToRad(yRot), [0, 1, 0]);

  if (document.getElementById("explode").checked) uPerObject.options[0] = 1;
  else uPerObject.options[0] = 0;
  uPerObject.options[1] = 0;
  if (document.getElementById("uvs").checked) uPerObject.options[1] = 1;
  else if (document.getElementById("xseams").checked) uPerObject.options[1] = 2;
  else if (document.getElementById("yseams").checked) uPerObject.options[1] = 3;

  lighteye.update();
}

Game.appDrawAux = function ()
{
  if (Game.loading) return;
  // shadowing render
  lighteye.engage();
  shadowmap.engage();
  gl.clearColor(1.0, 1.0, 1.0, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  var effect = Game.shaderMan.shaders["shadowcast"];
  effect.bind();
  effect.bindCamera(lighteye);
  effect.setUniforms(uPerObject);
  effect.draw(square);
}

Game.appDraw = function (eye)
{
  if (Game.loading) return;

  var effect;

  if (document.getElementById("model").checked || document.getElementById("explode").checked)
  {
    effect = Game.shaderMan.shaders["meshViewer"];
    effect.bind();
    effect.bindCamera(eye);
    effect.setUniforms(uPerObject);
    effect.setUniforms(uLight);
    effect.bindTexture("shadow", shadowmap.texture);
    if (document.getElementById("explode").checked)
      effect.draw(explode);
    else
      effect.draw(square);

    effect.setUniforms(uGrid);
    effect.draw(grid);
  }

  if (document.getElementById("normals").checked || document.getElementById("wire").checked || document.getElementById("bb").checked)
  {
    effect = Game.shaderMan.shaders["normalViewer"];
    effect.bind();
    effect.bindCamera(eye);
    uPerObjectN.uWorld = uPerObject.uWorld;
    effect.setUniforms(uPerObjectN);
    if (document.getElementById("normals").checked) effect.draw(normals);
    if (document.getElementById("wire").checked) effect.draw(wire);
    if (document.getElementById("bb").checked) effect.draw(bb);
  }
}

Game.appHandleKeyDown = function (event)
{
  currentlyPressedKeys[event.keyCode] = true;
  if (event.keyCode == 83) Game.oculusMode(!Game.isOculus);
}

Game.appHandleKeyUp = function (event)
{
  currentlyPressedKeys[event.keyCode] = false;
}

Game.appHandleMouseEvent = function(type, mouse)
{

}