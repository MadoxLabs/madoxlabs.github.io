
var effect;
var square;
var uOnce;
var uPerObject;

var xRot = 0;
var yRot = 0;
var z = -5.0;

function degToRad(degrees)
{
  return degrees * Math.PI / 180;
}

Game.appInit = function ()
{
  initMouse();
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
//  xRot += (xSpeed * Game.elapsed) / 1000.0;
//  yRot += (ySpeed * Game.elapsed) / 1000.0;
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
  effect.bindTexture('uSampler', Game.assetMan.assets['cubeside'].texture, gl.LINEAR, gl.LINEAR_MIPMAP_NEAREST);
  effect.draw(square);
}

Game.handleKeyDown = function (){}

Game.handleKeyUp = function (){}

//----------------------------------

// MOUSE


var elem;
var down = false;
var out = true;
var toss = 0;

function initMouse()
{
  document.addEventListener('pointerlockchange', pointerLockChange, false);
  document.addEventListener('mozpointerlockchange', pointerLockChange, false);
  document.addEventListener('webkitpointerlockchange', pointerLockChange, false);

  document.addEventListener('pointerlockerror', pointerLockError, false);
  document.addEventListener('mozpointerlockerror', pointerLockError, false);
  document.addEventListener('webkitpointerlockerror', pointerLockError, false);

  document.exitPointerLock = document.exitPointerLock || document.mozExitPointerLock || document.webkitExitPointerLock;

  var obj = document.getElementById('surface');
  obj.addEventListener("mouseout", function (e)
  {
    console.log("mouse out");
    out = true;
    if (down) {
      down = false;
      document.exitPointerLock();
    }
  }, false);

  obj.addEventListener("mouseover", function (e)
  {
    console.log("mouse in");
    out = false;
  }, false);

  document.addEventListener("mousedown", function (e)
  {
    if (!out && e.button == 2) {
      down = true;
      elem = document.getElementById("surface");
      elem.requestPointerLock = elem.requestPointerLock || elem.mozRequestPointerLock || elem.webkitRequestPointerLock;
      elem.requestPointerLock();
      toss = 1;
    }
  }, false);

  document.addEventListener("mouseup", function (e)
  {
    down = false;
    document.exitPointerLock();
  }, false);

  document.addEventListener("mousemove", function (e)
  {
    if (down) {
      if (toss) { toss -= 1; return; }
      var movementX = e.movementX || e.mozMovementX || e.webkitMovementX || 0;
      var movementY = e.movementY || e.mozMovementY || e.webkitMovementY || 0;
      if (!movementX && !movementY) return;
      console.log("movementX=" + movementX, "movementY=" + movementY);

      xRot += movementY/2.0;
      yRot += movementX/2.0;
    }
  }, false);
}

function pointerLockChange()
{
  if (document.mozPointerLockElement === elem || document.webkitPointerLockElement === elem) {
    console.log("Pointer Lock was successful.");
  } else {
    console.log("Pointer Lock was lost.");
  }
}

function pointerLockError()
{
  console.log("Error while locking pointer.");
}