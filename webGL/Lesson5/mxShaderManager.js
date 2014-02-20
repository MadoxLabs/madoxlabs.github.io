

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

var uniformSizes     = [2,3,4,   2,3,4,   1,2,3,4, 4,9,16, 0,0];      // how many elements are in this certain variable type
var uniformByteSizes = [8,12,16, 8,12,16, 1,2,3,4, 16,36,64, 0,0];    // the byte size of this certain variable type
var uniformTypes = [0x1406, 0x1406, 0x1406,                             // the WebGL definition of this certain variable type
                    0x1404, 0x1404, 0x1404, 
                    0x1400, 0x1400, 0x1400, 0x1400, 
                    0x1406, 0x1406, 0x1406, 
                    0,0];
// var uniformTypes = [gl.FLOAT, gl.FLOAT, gl.FLOAT,                             // the WebGL definition of this certain variable type
//                     gl.INT, gl.INT, gl.INT, 
//                     gl.BYTE, gl.BYTE, gl.BYTE, gl.BYTE, 
//                     gl.FLOAT, gl.FLOAT, gl.FLOAT, 
//                     0,0];

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

ShaderManager.prototype.findParam = function(src, name, param, def)
{
  // find uniform line with the name on it
  var code = def;
  var start = 0;
  for (var i = 0; i < 100; ++i)
  {
    var line = src.indexOf("uniform", start); if (line == -1) return code;
    var end = src.indexOf("\n", line);          if (end == -1) return code;
    var loc = src.indexOf(name, line);          if (loc == -1) return code;
    if (loc > end) { start = end; continue; }

    loc = src.indexOf("//", line);              if (loc == -1) return code;
    var params = src.substring(loc+2, end);

    // find the required param
    loc = params.indexOf(param);           if (loc == -1) return code;
    // find the value up to , or end
    var end = params.indexOf(",", loc);           if (end == -1) end = params.length;

    code = params.substring(loc+param.length+1, end);
    return code.trim();
  }
}

ShaderManager.prototype.findTexParam = function(src, name, param, def)
{
  var code = this.findParam(src, name, param, def);
  if (code == def) return code;

  var v =  gl[code.trim()];
  if (!v) v = def;
  return v;
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
    shaderProgram.attributes[i].type = uniformTypes[info.type - 0x8b50];   // convert uniform type to data type
    shaderProgram.stride += uniformByteSizes[info.type - 0x8b50];

    var code = this.findCode(src, info.name);
    if (!code) alert("missing code for " + info.name);
    shaderProgram.attributes[code] = shaderProgram[info.name];
  }

  // 
  // make property for each uniform
  // make a struct also to hand out

  shaderProgram.uniforms = [];
  shaderProgram.textures = [];
  var u = 0;
  var t = 0;
  for (var i = 0; i < 254; ++i)
  {
    var info = gl.getActiveUniform(shaderProgram, i);
    if (!info) break;

    if (info.type == gl.SAMPLER_2D || info.type == gl.SAMPLER_CUBE)
    {
      shaderProgram.textures[t] = {};
      shaderProgram.textures[t].name = info.name;
      shaderProgram.textures[t].loc = gl.getUniformLocation(shaderProgram, info.name);
      shaderProgram.textures[t].mag  = this.findTexParam(src, info.name, 'mag', gl.LINEAR);
      shaderProgram.textures[t].min = this.findTexParam(src, info.name, 'min', gl.NEAREST_MIPMAP_LINEAR);
      shaderProgram.textures[t].wraps = this.findTexParam(src, info.name, 'wrapu', gl.REPEAT);
      shaderProgram.textures[t].wrapt = this.findTexParam(src, info.name, 'wrapv', gl.REPEAT);
      shaderProgram[info.name] = t;
      t += 1;
    }
    else
    {
      shaderProgram[info.name] = gl.getUniformLocation(shaderProgram, info.name);
      shaderProgram[info.name].type = info.type;
      shaderProgram.uniforms[u] = {};
      shaderProgram.uniforms[u].name = info.name;
      shaderProgram.uniforms[u].group = this.findParam(src, info.name, 'group', '');
      u += 1;
    }
  }

  shaderProgram.bindMesh = bindMesh;
  shaderProgram.bindTexture = bindTexture;
  shaderProgram.draw = draw;
  shaderProgram.createUniform = createUniform;
  shaderProgram.setUniforms = setUniforms;

  this.shaders[name.trim()] = shaderProgram;
}

