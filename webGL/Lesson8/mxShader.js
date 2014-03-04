//
// These functions get added to each WebGL shader object

function bind()
{
  gl.useProgram(this);
  if (this.renderstate && this.renderstate != Game.shaderMan.currentRenderState)
  {
    if (Game.shaderMan.currentRenderState) Game.shaderMan.currentRenderState.unset();
    Game.shaderMan.currentRenderState = this.renderstate;
    this.renderstate.set();
  }
}

function bindMesh(mesh)
{
  gl.bindBuffer(gl.ARRAY_BUFFER, mesh.buffer);
  if (mesh.indexbuffer) gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, mesh.indexbuffer);
  else gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

  for (var code in mesh.attributes)          // code is what this attribute represents - IE TEX0, POSITION
  {
    var offset = mesh.attributes[code];     // get offset into the vertex buffer definition
    var attr = this.attributes[code];       // look up what attribute number this is in the shader
    var size = this.attributes[attr].size;  // get the size and type for this attribute as set in the shader
    var type = this.attributes[attr].type;
    gl.vertexAttribPointer(attr, size, type, false, this.stride, offset);
  }
}

function bindTexture(name, texture, mag, min, wraps, wrapt)
{
  var tnum = this[name];
  var t = this.textures[tnum];

  gl.activeTexture(gl.TEXTURE0 + tnum);
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.uniform1i(t.loc, tnum);

  if (arguments.length < 3 || !mag) mag = t.mag;
  if (arguments.length < 4 || !min) min = t.min;
  if (arguments.length < 5 || !wraps) wraps = t.wraps;
  if (arguments.length < 6 || !wrapt) wrapt = t.wrapt;

  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, mag);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, min);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, wraps);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, wrapt);
}

function setUniforms(vals)
{
  for (var name in vals)
  {
    switch (this[name].type)
    {
      case gl.FLOAT:
        gl.uniform1f(this[name], vals[name]);
        break;
      case gl.FLOAT_VEC2:
        gl.uniform2fv(this[name], vals[name]);
        break;
      case gl.FLOAT_VEC3:
        gl.uniform3fv(this[name], vals[name]);
        break;
      case gl.FLOAT_VEC4:
        gl.uniform4fv(this[name], vals[name]);
        break;
      case gl.BOOL:
      case gl.INT:
        gl.uniform1i(this[name], vals[name]);
        break;
      case gl.BOOL_VEC2:
      case gl.INT_VEC2:
        gl.uniform2iv(this[name], vals[name]);
        break;
      case gl.BOOL_VEC3:
      case gl.INT_VEC3:
        gl.uniform3iv(this[name], vals[name]);
        break;
      case gl.BOOL_VEC4:
      case gl.INT_VEC4:
        gl.uniform4iv(this[name], vals[name]);
        break;
      case gl.FLOAT_MAT2:
        gl.uniformMatrix2fv(this[name], false, vals[name]);
        break;
      case gl.FLOAT_MAT3:
        gl.uniformMatrix3fv(this[name], false, vals[name]);
        break;
      case gl.FLOAT_MAT4:
        gl.uniformMatrix4fv(this[name], false, vals[name]);
        break;
    }
  }
}

function createUniform(group)
{
  var ret = {};
  for (var i = 0; i < this.uniforms.length; ++i)
  {
    if (this.uniforms[i].group !== group) continue;
    ret[this.uniforms[i].name] = 0;
  }
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