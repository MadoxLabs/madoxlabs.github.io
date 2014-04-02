var gl;
var Game = {};

function now()
{
  var d = new Date();
  return d.getTime();
}

function compileVertexShader(src) 
{
  var shader = gl.createShader(gl.VERTEX_SHADER);

  gl.shaderSource(shader, src);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) { alert(gl.getShaderInfoLog(shader)); return null; }
  return shader;
}

function compilePixelShader(src) 
{
  var shader = gl.createShader(gl.FRAGMENT_SHADER);

  gl.shaderSource(shader, src);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) { alert(gl.getShaderInfoLog(shader)); return null; }
  return shader;
}

function loadShaderFile(name)
{
  Game.loading += 1;
  var client = new XMLHttpRequest();
  client.open('GET', name);
  client.onload = function() { processShaderFile(client.responseText); }
  client.send();
}

function extractShaderPart(src, type)
{
  var part = "";
  var start;
  
  for (;;)
  {
    start = src.indexOf(type);
    if (start == -1) break;
  
    src = src.substring(start+type.length+1);
    var end = src.indexOf("[END]");
    part += src.substring(0, end);
    src = src.substring(end+6);
  }
  return part;
}

function processShaderFile(src)
{
  Game.loading -= 1;

  var name = extractShaderPart(src, "[NAME]");
  var vertex = extractShaderPart(src, "[VERTEX]");
  var pixel = extractShaderPart(src, "[PIXEL]");
  var common = extractShaderPart(src, "[COMMON]");

  var vertexShader = compileVertexShader(common + vertex);
  var fragmentShader = compilePixelShader(common + pixel);

  var shaderProgram = gl.createProgram();
  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);
  gl.linkProgram(shaderProgram);

  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) { alert("Could not initialise shaders"); }
  Game.shaders[name.trim()] = shaderProgram;
}


var effect;
var triangleVertexPositionBuffer;
var squareVertexPositionBuffer;

function initBuffers() 
{
    triangleVertexPositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexPositionBuffer);
    var vertices = [
         0.0,  1.0,  0.0,
        -1.0, -1.0,  0.0,
         1.0, -1.0,  0.0
    ];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    triangleVertexPositionBuffer.itemSize = 3;
    triangleVertexPositionBuffer.numItems = 3;

    squareVertexPositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, squareVertexPositionBuffer);
    vertices = [
         1.0,  1.0,  0.0,
        -1.0,  1.0,  0.0,
         1.0, -1.0,  0.0,
        -1.0, -1.0,  0.0
    ];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    squareVertexPositionBuffer.itemSize = 3;
    squareVertexPositionBuffer.numItems = 4;
}

Game.init = function ()
{
  this.loading = 0;
  this.ready = false;

  this.surface = document.getElementById("surface");
  this.output = document.getElementById("output");
  this.context = this.output.getContext('2d');

  this.shaders = {};

  try {
    gl = this.surface.getContext("experimental-webgl");
    gl.viewportWidth = this.surface.width;
    gl.viewportHeight = this.surface.height;
  } catch (e) { }

  if (!gl) alert("Could not initialise WebGL, sorry :-(");

  loadShaderFile("shaders.fx");
  initBuffers();
}

Game.deviceReady = function ()
{
  effect = Game.shaders["shader"];
  gl.useProgram(effect);

  effect.vertexPositionAttribute = gl.getAttribLocation(effect, "aVertexPosition");
  gl.enableVertexAttribArray(effect.vertexPositionAttribute);

  effect.pMatrixUniform = gl.getUniformLocation(effect, "uPMatrix");
  effect.mvMatrixUniform = gl.getUniformLocation(effect, "uMVMatrix");

  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.enable(gl.DEPTH_TEST);
}

Game.run = function ()
{
  if (Game.loading == 0) 
  {
    Game.ready = true;
    Game.deviceReady();
  }
  
  if (Game.ready == false) return;
  Game.time = now();
  Game.update();         var updateTime = now() - Game.time;
  Game.draw();           var drawTime = now() - Game.time - updateTime;
                         var idleTime = 17 - updateTime - drawTime;

  //////////
  // draw the timing stats
  //
  Game.context.fillStyle = "white";
  Game.context.fillRect(0, 0, 400, 50);
  Game.context.font = "bold 8px Arial";
  Game.context.fillStyle = "#000000";
  if (idleTime < 0) { idleTime = 0; Game.context.fillStyle = "#ff0000"; }
  var perFrame = idleTime + drawTime + updateTime;

  Game.context.fillText("FPS: " + ((1000 / perFrame) | 0) + "  Each frame: " + perFrame + " ms", 0, 10);
  Game.context.fillText("Frame Time: Update: " + updateTime + "ms  Draw: " + drawTime + "ms  Idle: " + idleTime + "ms", 0, 20);
  updateTime = (updateTime / perFrame * 100) | 0;
  drawTime = (drawTime / perFrame * 100) | 0;
  idleTime = (idleTime / perFrame * 100) | 0;
  Game.context.fillText("Frame Time: Update: " + updateTime + "%  Draw: " + drawTime + "%  Idle: " + idleTime + "%", 0, 30);
}

Game.update = function ()
{
}

Game.draw = function ()
{
  var mvMatrix = mat4.create();
  var pMatrix = mat4.create();

  gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  mat4.perspective(pMatrix, 45, gl.viewportWidth / gl.viewportHeight, 0.1, 100.0);

  mat4.identity(mvMatrix);
  mat4.translate(mvMatrix, mvMatrix, [-1.5, 0.0, -7.0]);

  gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexPositionBuffer);
  gl.vertexAttribPointer(effect.vertexPositionAttribute, triangleVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);
  gl.uniformMatrix4fv(effect.pMatrixUniform, false, pMatrix);
  gl.uniformMatrix4fv(effect.mvMatrixUniform, false, mvMatrix);
  gl.drawArrays(gl.TRIANGLES, 0, triangleVertexPositionBuffer.numItems);


  mat4.translate(mvMatrix, mvMatrix, [3.0, 0.0, 0.0]);

  gl.bindBuffer(gl.ARRAY_BUFFER, squareVertexPositionBuffer);
  gl.vertexAttribPointer(effect.vertexPositionAttribute, squareVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);
  gl.uniformMatrix4fv(effect.pMatrixUniform, false, pMatrix);
  gl.uniformMatrix4fv(effect.mvMatrixUniform, false, mvMatrix);
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, squareVertexPositionBuffer.numItems);
}

function main() 
{
  Game.init();
  window.setInterval(Game.run, 17);
}
