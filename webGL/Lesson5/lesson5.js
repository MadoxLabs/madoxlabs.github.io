
var effect;
var square;
var uOnce;
var uPerObject;

var rCube = 0;

function degToRad(degrees)
{
  return degrees * Math.PI / 180;
}

Game.appInit = function ()
{
  Game.loadShaderFile("shaders.fx");
  Game.loadTextureFile("cubeside", "madox2.png");

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
  rCube += (75 * Game.elapsed) / 1000.0;
}

Game.appDraw = function ()
{
  var effect = Game.shaderMan.shaders["shader"];

  gl.useProgram(effect);
  gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  mat4.identity(uPerObject.uMVMatrix);
  mat4.translate(uPerObject.uMVMatrix, uPerObject.uMVMatrix, [0.0, 0.0, -5.0]);
  mat4.rotate(uPerObject.uMVMatrix, uPerObject.uMVMatrix, degToRad(rCube), [1, 1, 1]);
  effect.setUniforms(uPerObject);

  effect.bindTexture('uSampler', Game.assetMan.assets['cubeside'].texture)
  effect.draw(square);
}

