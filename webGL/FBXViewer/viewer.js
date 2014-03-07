
var effect;
var square;
var cone;
var uOnce;
var uPerObject;
var uLight;

var xRot = 0;
var xSpeed = 0;
var yRot = 0;
var ySpeed = 0;
var z = -5.0;

var currentlyPressedKeys = {};

function degToRad(degrees)
{
  return degrees * Math.PI / 180;
}

Game.appInit = function ()
{
  Game.loadShaderFile("shaders.fx");
  Game.loadMesh("sample", "test.fbx");
}

Game.deviceReady = function ()
{
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  var effect = Game.shaderMan.shaders["meshViewer"];
  var mesh = Game.assetMan.assets["sample"];

  // make verts for sample
  var sampleAttr = { 'POS': 0, 'TEX0': 12, 'NORM': 20 };
  square = new Mesh(mesh[1].models[0].mesh.vertexs, mesh[1].models[0].mesh.indexes, sampleAttr, mesh[1].models[0].mesh.indexes.length, gl.TRIANGLES);
  cone = new Mesh(mesh[0].models[0].mesh.vertexs, mesh[0].models[0].mesh.indexes, sampleAttr, mesh[0].models[0].mesh.indexes.length, gl.TRIANGLES);

  uOnce = effect.createUniform('once');
  uOnce.uPMatrix = mat4.create();

  uLight = effect.createUniform('light');
  uLight.uAmbientColor      = [0.2, 0.2, 0.2];
  uLight.uLightingDirection = [0.5, 0.25, 0.5];
  uLight.uDirectionalColor  = [0.8, 0.8, 0.8];

  uPerObject = effect.createUniform('perobject');
  uPerObject.uMVMatrix = mat4.create();

  mat4.perspective(uOnce.uPMatrix, 45, gl.viewportWidth / gl.viewportHeight, 0.1, 100.0);
  gl.useProgram(effect);
  effect.setUniforms(uOnce);
}

Game.appUpdate = function ()
{
  if (currentlyPressedKeys[33])  // Page Up
    z -= 0.05;
  if (currentlyPressedKeys[34])  // Page Down
    z += 0.05;
  if (currentlyPressedKeys[37])  // Left cursor key
    ySpeed -= 1;
  if (currentlyPressedKeys[39])  // Right cursor key
    ySpeed += 1;
  if (currentlyPressedKeys[38])  // Up cursor key
    xSpeed -= 1;
  if (currentlyPressedKeys[40])  // Down cursor key
    xSpeed += 1;

  xRot += (xSpeed * Game.elapsed) / 1000.0;
  yRot += (ySpeed * Game.elapsed) / 1000.0;
}

Game.appDraw = function ()
{
  var effect = Game.shaderMan.shaders["meshViewer"];
  effect.bind();

  gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  effect.setUniforms(uLight);

  mat4.identity(uPerObject.uMVMatrix);
  mat4.translate(uPerObject.uMVMatrix, uPerObject.uMVMatrix, [0.0, 0.0, z]);
  mat4.rotate(uPerObject.uMVMatrix, uPerObject.uMVMatrix, degToRad(xRot), [1, 0, 0]);
  mat4.rotate(uPerObject.uMVMatrix, uPerObject.uMVMatrix, degToRad(yRot), [0, 1, 0]);
  effect.setUniforms(uPerObject);

//  effect.draw(square);
  effect.draw(cone);
}

Game.handleKeyDown = function ()
{
  currentlyPressedKeys[event.keyCode] = true;
}

Game.handleKeyUp = function ()
{
  currentlyPressedKeys[event.keyCode] = false;
}
