
var effect;
var triangle;
var square;
var uniforms;

var rTri = 10;
var rSquare = 0;

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
       0.0, 1.0, 0.0,  1.0, 0.0, 0.0, 1.0,
      -1.0, -1.0, 0.0, 0.0, 1.0, 0.0, 1.0,
       1.0, -1.0, 0.0, 0.0, 0.0, 1.0, 1.0
  ];
  triangle = new Mesh(vertices, attr, 3, gl.TRIANGLES);

  vertices = [
//    | position       | Color            |
       1.0, 1.0, 0.0,  0.5, 0.5, 1.0, 1.0,
      -1.0, 1.0, 0.0,  0.5, 0.5, 1.0, 1.0,
       1.0, -1.0, 0.0, 0.5, 0.5, 1.0, 1.0,
      -1.0, -1.0, 0.0, 0.5, 0.5, 1.0, 1.0,
  ];
  square = new Mesh(vertices, attr, 4, gl.TRIANGLE_STRIP);
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
  rTri += (90 * Game.elapsed) / 1000.0;
  rSquare += (75 * Game.elapsed) / 1000.0;
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
  mat4.rotate(uniforms.uMVMatrix, uniforms.uMVMatrix, degToRad(rTri), [0, 1, 0]);
  effect.setUniforms(uniforms);
  effect.draw(triangle);

  mat4.identity(uniforms.uMVMatrix);
  mat4.translate(uniforms.uMVMatrix, uniforms.uMVMatrix, [1.5, 0.0, -7.0]);
  mat4.rotate(uniforms.uMVMatrix, uniforms.uMVMatrix, degToRad(rSquare), [1, 0, 0]);
  effect.setUniforms(uniforms);
  effect.draw(square);
}

