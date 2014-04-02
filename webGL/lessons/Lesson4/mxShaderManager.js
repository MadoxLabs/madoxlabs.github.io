//
// These functions get added to each shader object

function bindMesh(mesh)
{
  gl.bindBuffer(gl.ARRAY_BUFFER, mesh.buffer);
  if (mesh.indexbuffer) gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, mesh.indexbuffer);
  else gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

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
  if (mesh.indexbuffer)
    gl.drawElements(mesh.type, mesh.prims, gl.UNSIGNED_SHORT, 0);
  else
    gl.drawArrays(mesh.type, 0, mesh.prims);

}

//
// The shader manager loads effect files and holds all programs

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

