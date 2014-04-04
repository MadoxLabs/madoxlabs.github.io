
var effect;
var square;
var uOnce;
var uPerObject;

var xRot = 0;
var xSpeed = 0;
var yRot = 0;
var ySpeed = 0;
var z = -5.0;

var filter = 0;
var currentlyPressedKeys = {};

function degToRad(degrees)
{
  return degrees * Math.PI / 180;
}

Game.appInit = function ()
{
  Game.loadShaderFile("shaders.fx");
  Game.loadTextureFile("cubeside", "box.jpg", true);

  var attr = { 'POS': 0, 'COLOR0': 12, 'TEX0': 28 }
  var vertices = [
//    | position       | Color            | texture UVs |
      // Front face                         // Front face
      -1.0, -1.0, 1.0, 1.0, 0.0, 0.0, 1.0,  0.0, 0.0,
       1.0, -1.0, 1.0, 1.0, 0.0, 0.0, 1.0,  1.0, 0.0,
       1.0, 1.0, 1.0, 1.0, 0.0, 0.0, 1.0,   1.0, 1.0,
      -1.0, 1.0, 1.0, 1.0, 0.0, 0.0, 1.0,   0.0, 1.0,

      // Back face                          // Back face
      -1.0, -1.0, -1.0, 1.0, 1.0, 0.0, 1.0, 1.0, 0.0,
      -1.0, 1.0, -1.0, 1.0, 1.0, 0.0, 1.0,  1.0, 1.0,
       1.0, 1.0, -1.0, 1.0, 1.0, 0.0, 1.0,  0.0, 1.0,
       1.0, -1.0, -1.0, 1.0, 1.0, 0.0, 1.0, 0.0, 0.0,

      // Top face                           // Top face
      -1.0, 1.0, -1.0, 0.0, 1.0, 0.0, 1.0,  0.0, 1.0,
      -1.0, 1.0, 1.0, 0.0, 1.0, 0.0, 1.0,   0.0, 0.0,
       1.0, 1.0, 1.0, 0.0, 1.0, 0.0, 1.0,   1.0, 0.0,
       1.0, 1.0, -1.0, 0.0, 1.0, 0.0, 1.0,  1.0, 1.0,

      // Bottom face                        // Bottom face
      -1.0, -1.0, -1.0, 1.0, 0.5, 0.5, 1.0, 1.0, 1.0,
       1.0, -1.0, -1.0, 1.0, 0.5, 0.5, 1.0, 0.0, 1.0,
       1.0, -1.0, 1.0, 1.0, 0.5, 0.5, 1.0,  0.0, 0.0,
      -1.0, -1.0, 1.0, 1.0, 0.5, 0.5, 1.0,  1.0, 0.0,

      // Right face                         // Right face
       1.0, -1.0, -1.0, 1.0, 0.0, 1.0, 1.0, 1.0, 0.0,
       1.0, 1.0, -1.0, 1.0, 0.0, 1.0, 1.0,  1.0, 1.0,
       1.0, 1.0, 1.0, 1.0, 0.0, 1.0, 1.0,   0.0, 1.0,
       1.0, -1.0, 1.0, 1.0, 0.0, 1.0, 1.0,  0.0, 0.0,

      // Left face                          // Left face
      -1.0, -1.0, -1.0, 0.0, 0.0, 1.0, 1.0, 0.0, 0.0,
      -1.0, -1.0, 1.0, 0.0, 0.0, 1.0, 1.0,  1.0, 0.0,
      -1.0, 1.0, 1.0, 0.0, 0.0, 1.0, 1.0,   1.0, 1.0,
      -1.0, 1.0, -1.0, 0.0, 0.0, 1.0, 1.0,  0.0, 1.0
  ];
  var indices = [
    0, 1, 2, 0, 2, 3,    // Front face
    4, 5, 6, 4, 6, 7,    // Back face
    8, 9, 10, 8, 10, 11,  // Top face
    12, 13, 14, 12, 14, 15, // Bottom face
    16, 17, 18, 16, 18, 19, // Right face
    20, 21, 22, 20, 22, 23  // Left face
  ]
  square = new Mesh(vertices, indices, attr, 36, gl.TRIANGLES);
}

Game.deviceReady = function ()
{
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.enable(gl.DEPTH_TEST);

  var effect = Game.shaderMan.shaders["shader"];

  uOnce = effect.createUniform('once');
  uOnce.uPMatrix = mat4.create();

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
  var effect = Game.shaderMan.shaders["shader"];

  gl.useProgram(effect);
  gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  mat4.identity(uPerObject.uMVMatrix);
  mat4.translate(uPerObject.uMVMatrix, uPerObject.uMVMatrix, [0.0, 0.0, z]);
  mat4.rotate(uPerObject.uMVMatrix, uPerObject.uMVMatrix, degToRad(xRot), [1, 0, 0]);
  mat4.rotate(uPerObject.uMVMatrix, uPerObject.uMVMatrix, degToRad(yRot), [0, 1, 0]);
  effect.setUniforms(uPerObject);

  switch (filter)
  {
    case 0:
      effect.bindTexture('uSampler', Game.assetMan.assets['cubeside'].texture, gl.NEAREST, gl.NEAREST);
      break;
    case 1:
      effect.bindTexture('uSampler', Game.assetMan.assets['cubeside'].texture, gl.LINEAR, gl.LINEAR);
      break;
    case 2:
      effect.bindTexture('uSampler', Game.assetMan.assets['cubeside'].texture, gl.LINEAR, gl.LINEAR_MIPMAP_NEAREST);
      break;
  }
  effect.draw(square);
}

Game.handleKeyDown = function ()
{
  currentlyPressedKeys[event.keyCode] = true;

  if (String.fromCharCode(event.keyCode) == "F") {
    filter += 1;
    if (filter == 3) {
      filter = 0;
    }
    console.log("filter is " + filter);
  }
}

Game.handleKeyUp = function ()
{
  currentlyPressedKeys[event.keyCode] = false;
}