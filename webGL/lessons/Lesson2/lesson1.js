function bindMesh(mesh)
{
  gl.bindBuffer(gl.ARRAY_BUFFER, mesh.buffer);

  for (var code in mesh.attributes)
  {
    var offset = mesh.attributes[code];
    var attr = this.attributes[code];
    var size = this.attributes[attr].size;
    var type = this.attributes[attr].type;
    gl.vertexAttribPointer(attr, size, type, false, this.stride, offset);
  }
}

function setUniforms(vals)
{
  for (var i = 0; i < this.uniforms.length; ++i)
  {
    var name = this.uniforms[i].name;
    gl.uniformMatrix4fv(this[name], false, vals[name]);
  }
}

function createUniform()
{
  var ret = {};
  for (var i = 0; i < this.uniforms.length; ++i)
    ret[this.uniforms[i].name] = 0;
  return ret;
}

function draw(mesh)
{
  this.bindMesh(mesh);
  gl.drawArrays(mesh.type, 0, mesh.prims);
}

var ShaderManager = function()
{
  this.shaders = {};
}

ShaderManager.prototype.compileVertexShader = function (src) 
{
  var shader = gl.createShader(gl.VERTEX_SHADER);

  gl.shaderSource(shader, src);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) { alert(gl.getShaderInfoLog(shader)); return null; }
  return shader;
}

ShaderManager.prototype.compilePixelShader = function (src) 
{
  var shader = gl.createShader(gl.FRAGMENT_SHADER);

  gl.shaderSource(shader, src);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) { alert(gl.getShaderInfoLog(shader)); return null; }
  return shader;
}

ShaderManager.prototype.extractShaderPart = function(src, type)
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

var uniformSizes     = [2,3,4,   2,3,4,   1,2,3,4, 4,9,16, 0,0];
var uniformByteSizes = [8,12,16, 8,12,16, 1,2,3,4, 16,36,64, 0,0];
var uniformTypes = [0x1406,0x1406,0x1406, 0x1404,0x1404,0x1404, 0x1400,0x1400,0x1400,0x1400, 0x1406,0x1406,0x1406, 0,0];

ShaderManager.prototype.findCode = function(src, name)
{
  // find attribute line with the name on it
  var code = "";
  var start = 0;
  for (var i = 0; i < 100; ++i)
  {
    var line = src.indexOf("attribute", start); if (line == -1) return code;
    var end = src.indexOf("\n", line);          if (end == -1) return code;
    var loc = src.indexOf(name, line);          if (loc == -1) return code;
    if (loc > end) { start = end; continue; }

    loc = src.indexOf("//", line);              if (loc == -1) return code;
    code = src.substring(loc+2, end);
    return code.trim();
  }
}

ShaderManager.prototype.processEffect = function(src)
{
  Game.loading -= 1;

  var name   = this.extractShaderPart(src, "[NAME]");
  var vertex = this.extractShaderPart(src, "[VERTEX]");
  var pixel  = this.extractShaderPart(src, "[PIXEL]");
  var common = this.extractShaderPart(src, "[COMMON]");

  var vertexShader   = this.compileVertexShader(common + vertex);
  var fragmentShader = this.compilePixelShader(common + pixel);

  var shaderProgram = gl.createProgram();
  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);
  gl.linkProgram(shaderProgram);

  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) { alert("Could not initialise shaders"); }

  //
  // turn on all the attributes and create properties for each
  shaderProgram.attributes = [];
  shaderProgram.stride = 0;
  for (var i = 0; i < 16; ++i)
  {
    var info = gl.getActiveAttrib(shaderProgram, i);
    if (!info) break;

    shaderProgram[info.name] = gl.getAttribLocation(shaderProgram, info.name);
    gl.enableVertexAttribArray(shaderProgram[info.name]);
    shaderProgram.attributes[i] = {};
    shaderProgram.attributes[i].size = uniformSizes[info.type - 0x8b50];
    shaderProgram.attributes[i].type = uniformTypes[info.type - 0x8b50];
    shaderProgram.stride += uniformByteSizes[info.type - 0x8b50];

    var code = this.findCode(src, info.name);
    if (!code) alert("missing code for " + info.name);
    shaderProgram.attributes[code] = shaderProgram[info.name];
  }

  // 
  // make property for each uniform
  // make a struct also to hand out
  shaderProgram.uniforms = [];
  for (var i = 0; i < 254; ++i)
  {
    var info = gl.getActiveUniform(shaderProgram, i);
    if (!info) break;

    shaderProgram[info.name] = gl.getUniformLocation(shaderProgram, info.name);;
    shaderProgram.uniforms[i] = {};
    shaderProgram.uniforms[i].name = info.name;
  }

  shaderProgram.bindMesh = bindMesh;
  shaderProgram.draw = draw;
  shaderProgram.createUniform = createUniform;
  shaderProgram.setUniforms = setUniforms;

  this.shaders[name.trim()] = shaderProgram;
}

var Mesh = function(verts, attr, prims, type)
{
  this.attributes = attr;
  this.verts = verts;
  this.prims = prims;
  this.type = type;
  this.buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.STATIC_DRAW);
}

var gl;
var Game = {};

function now()
{
  var d = new Date();
  return d.getTime();
}

function loadShaderFile(name)
{
  Game.loading += 1;
  Game.ready = false;

  var client = new XMLHttpRequest();
  client.open('GET', name);
  client.onload = function() { Game.shaderMan.processEffect(client.responseText); }
  client.send();
}

var effect;
var triangle;
var square;
var uniforms;

function initBuffers() 
{
    var attr = { 'POS': 0, 'COLOR0' : 12 }

    var vertices = [
//      | position       | Color            |
         0.0,  1.0,  0.0, 1.0, 0.0, 0.0, 1.0,
        -1.0, -1.0,  0.0, 0.0, 1.0, 0.0, 1.0,
         1.0, -1.0,  0.0, 0.0, 0.0, 1.0, 1.0
    ];
    triangle = new Mesh(vertices, attr, 3, gl.TRIANGLES);

    vertices = [
//      | position       | Color            |
         1.0,  1.0,  0.0, 0.5, 0.5, 1.0, 1.0,
        -1.0,  1.0,  0.0, 0.5, 0.5, 1.0, 1.0,
         1.0, -1.0,  0.0, 0.5, 0.5, 1.0, 1.0,
        -1.0, -1.0,  0.0, 0.5, 0.5, 1.0, 1.0,
    ];
    square = new Mesh(vertices, attr, 4, gl.TRIANGLE_STRIP);
}

Game.init = function ()
{
  this.loading = 0;
  this.ready = false;
  this.shaderMan = new ShaderManager();

  this.surface = document.getElementById("surface");
  this.output = document.getElementById("output");
  this.context = this.output.getContext('2d');

  try {
    gl = this.surface.getContext("experimental-webgl");
    gl.viewportWidth = this.surface.width;
    gl.viewportHeight = this.surface.height;
  } catch (e) { }

  if (!gl) alert("Could not initialise WebGL, sorry :-(");

  loadShaderFile("shaders2.fx");
  initBuffers();
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

Game.run = function ()
{
  if (Game.loading == 0 && Game.ready == false) 
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
  var effect = Game.shaderMan.shaders["shader"];

  gl.useProgram( effect );
  gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  mat4.perspective(uniforms.uPMatrix, 45, gl.viewportWidth / gl.viewportHeight, 0.1, 100.0);
  mat4.identity(uniforms.uMVMatrix);

  mat4.translate(uniforms.uMVMatrix, uniforms.uMVMatrix, [-1.5, 0.0, -7.0]);
  effect.setUniforms(uniforms);
  effect.draw(triangle);

  mat4.translate(uniforms.uMVMatrix, uniforms.uMVMatrix, [3.0, 0.0, 0.0]);
  effect.setUniforms(uniforms);
  effect.draw(square);
}

function main() 
{
  Game.init();
  window.setInterval(Game.run, 17);
}
