
var effect;
var triangle;
var square;
var uniforms;

var rPyramid = 10;
var rCube = 0;

function degToRad(degrees)
{
  return degrees * Math.PI / 180;
}

Game.appInit = function ()
{
  Game.loadShaderFile("shaders.fx");

  var attr = { 'POS': 0, 'COLOR0': 12 }
  var vertices = [
//    | position       | Color            |
        // Front face     // Front face
         0.0, 1.0, 0.0,   1.0, 0.0, 0.0, 1.0,
        -1.0, -1.0, 1.0,  0.0, 1.0, 0.0, 1.0,
         1.0, -1.0, 1.0,  0.0, 0.0, 1.0, 1.0,
        // Right face     // Right face
         0.0, 1.0, 0.0,   1.0, 0.0, 0.0, 1.0,
         1.0, -1.0, 1.0,  0.0, 0.0, 1.0, 1.0,
         1.0, -1.0, -1.0, 0.0, 1.0, 0.0, 1.0,
        // Back face      // Back face
         0.0, 1.0, 0.0,   1.0, 0.0, 0.0, 1.0,
         1.0, -1.0, -1.0, 0.0, 1.0, 0.0, 1.0,
        -1.0, -1.0, -1.0, 0.0, 0.0, 1.0, 1.0,
        // Left face      // Left face
         0.0, 1.0, 0.0,   1.0, 0.0, 0.0, 1.0,
        -1.0, -1.0, -1.0, 0.0, 0.0, 1.0, 1.0,
        -1.0, -1.0, 1.0,  0.0, 1.0, 0.0, 1.0 
  ];
  triangle = new Mesh(vertices, null, attr, 12, gl.TRIANGLES);

  vertices = [
//    | position       | Color            |
      // Front face
      -1.0, -1.0, 1.0, 1.0, 0.0, 0.0, 1.0,     // Front face
       1.0, -1.0, 1.0, 1.0, 0.0, 0.0, 1.0,     // Front face
       1.0, 1.0, 1.0, 1.0, 0.0, 0.0, 1.0,     // Front face
      -1.0, 1.0, 1.0, 1.0, 0.0, 0.0, 1.0,     // Front face

      // Back face
      -1.0, -1.0, -1.0, 1.0, 1.0, 0.0, 1.0,
      -1.0, 1.0, -1.0, 1.0, 1.0, 0.0, 1.0,
       1.0, 1.0, -1.0, 1.0, 1.0, 0.0, 1.0,
       1.0, -1.0, -1.0, 1.0, 1.0, 0.0, 1.0,

      // Top face
      -1.0, 1.0, -1.0, 0.0, 1.0, 0.0, 1.0,
      -1.0, 1.0, 1.0, 0.0, 1.0, 0.0, 1.0,
       1.0, 1.0, 1.0, 0.0, 1.0, 0.0, 1.0,
       1.0, 1.0, -1.0, 0.0, 1.0, 0.0, 1.0,

      // Bottom face
      -1.0, -1.0, -1.0, 1.0, 0.5, 0.5, 1.0,
       1.0, -1.0, -1.0, 1.0, 0.5, 0.5, 1.0,
       1.0, -1.0, 1.0, 1.0, 0.5, 0.5, 1.0,
      -1.0, -1.0, 1.0, 1.0, 0.5, 0.5, 1.0,

      // Right face
       1.0, -1.0, -1.0, 1.0, 0.0, 1.0, 1.0,
       1.0, 1.0, -1.0, 1.0, 0.0, 1.0, 1.0,
       1.0, 1.0, 1.0, 1.0, 0.0, 1.0, 1.0,
       1.0, -1.0, 1.0, 1.0, 0.0, 1.0, 1.0,

      // Left face
      -1.0, -1.0, -1.0, 0.0, 0.0, 1.0, 1.0,
      -1.0, -1.0, 1.0, 0.0, 0.0, 1.0, 1.0,
      -1.0, 1.0, 1.0, 0.0, 0.0, 1.0, 1.0,
      -1.0, 1.0, -1.0, 0.0, 0.0, 1.0, 1.0
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
  uniforms = effect.createUniform();
  uniforms.uPMatrix = mat4.create();
  uniforms.uMVMatrix = mat4.create();
}

Game.appUpdate = function ()
{
  rPyramid += (90 * Game.elapsed) / 1000.0;
  rCube += (75 * Game.elapsed) / 1000.0;
}

Game.appDraw = function ()
{
  var effect = Game.shaderMan.shaders["shader"];

  gl.useProgram(effect);
  gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  mat4.perspective(uniforms.uPMatrix, 45, gl.viewportWidth / gl.viewportHeight, 0.1, 100.0);

  mat4.identity(uniforms.uMVMatrix);
  mat4.translate(uniforms.uMVMatrix, uniforms.uMVMatrix, [-1.5, 0.0, -7.0]);
  mat4.rotate(uniforms.uMVMatrix, uniforms.uMVMatrix, degToRad(rPyramid), [0, 1, 0]);
  effect.setUniforms(uniforms);
  effect.draw(triangle);

  mat4.identity(uniforms.uMVMatrix);
  mat4.translate(uniforms.uMVMatrix, uniforms.uMVMatrix, [1.5, 0.0, -7.0]);
  mat4.rotate(uniforms.uMVMatrix, uniforms.uMVMatrix, degToRad(rCube), [1, 1, 1]);
  effect.setUniforms(uniforms);
  effect.draw(square);
}

