
var effect;
var square;

var normals;
var wire;
var explode;

var uOnce;
var uPerObject;
var uPerObjectN;
var uLight;

var xRot = 0;
var xSpeed = 0;
var yRot = 0;
var ySpeed = 0;
var z = -15.0;

var currentlyPressedKeys = {};

function degToRad(degrees)
{
  return degrees * Math.PI / 180;
}

Game.appInit = function ()
{
  Game.loadShaderFile("shaders.fx");
  Game.loadShaderFile("normalShader.fx");
  Game.loadMesh("sample", "teapot.mesh");
}

Game.deviceReady = function ()
{
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  // do setup work for the mesh
  square = Game.assetMan.assets["sample"];
  normals = square.drawNormals();
  wire = square.drawWireframe();
  explode = square.drawExploded();

  // do setup work for the plain object shader
  var effect = Game.shaderMan.shaders["meshViewer"];

  uOnce = effect.createUniform('once');
  uOnce.uPMatrix = mat4.create();

  uLight = effect.createUniform('light');
  uLight.uAmbientColor      = [0.2, 0.2, 0.2];
  uLight.uLightingDirection = [0.5, 0.25, 0.5];
  uLight.uDirectionalColor  = [0.8, 0.8, 0.8];

  uPerObject = effect.createUniform('perobject');
  uPerObject.uMVMatrix = mat4.create();
  uPerObject.uMVMatrixT = mat3.create();
  uPerObject.options = vec4.create();

  mat4.perspective(uOnce.uPMatrix, 45, gl.viewportWidth / gl.viewportHeight, 0.1, 100.0);
  gl.useProgram(effect);
  effect.setUniforms(uOnce);

  // do setup work for the normal shader
  var effect = Game.shaderMan.shaders["normalViewer"];

  uPerObjectN = effect.createUniform('perobject');
  uPerObjectN.uMVMatrix = uPerObject.uMVMatrix;

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

  mat4.identity(uPerObject.uMVMatrix);
  mat4.translate(uPerObject.uMVMatrix, uPerObject.uMVMatrix, [0.0, 0.0, z]);
  mat4.rotate(uPerObject.uMVMatrix, uPerObject.uMVMatrix, degToRad(xRot), [1, 0, 0]);
  mat4.rotate(uPerObject.uMVMatrix, uPerObject.uMVMatrix, degToRad(yRot), [0, 1, 0]);
  mat3.normalFromMat4(uPerObject.uMVMatrixT, uPerObject.uMVMatrix);
}

Game.appDraw = function ()
{
  var effect;

  gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  if (document.getElementById("explode").checked) uPerObject.options[0] = 1;
  else uPerObject.options[0] = 0;
  uPerObject.options[1] = 0;
  if (document.getElementById("uvs").checked) uPerObject.options[1] = 1;
  else if (document.getElementById("xseams").checked) uPerObject.options[1] = 2;
  else if (document.getElementById("yseams").checked) uPerObject.options[1] = 3;

  if (document.getElementById("model").checked || document.getElementById("explode").checked)
  {

    effect = Game.shaderMan.shaders["meshViewer"];
    effect.bind();
    effect.setUniforms(uPerObject);
    effect.setUniforms(uLight);
    if (document.getElementById("explode").checked)
      effect.draw(explode);
    else
      effect.draw(square);
  }

  if (document.getElementById("normals").checked || document.getElementById("wire").checked)
  {
    effect = Game.shaderMan.shaders["normalViewer"];
    effect.bind();
    uPerObjectN.uMVMatrix = uPerObject.uMVMatrix;
    effect.setUniforms(uPerObjectN);
    if (document.getElementById("normals").checked) effect.draw(normals);
    if (document.getElementById("wire").checked) effect.draw(wire);
  }
}

Game.handleKeyDown = function ()
{
  currentlyPressedKeys[event.keyCode] = true;
}

Game.handleKeyUp = function ()
{
  currentlyPressedKeys[event.keyCode] = false;
}
