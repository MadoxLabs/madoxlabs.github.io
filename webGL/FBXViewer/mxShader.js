//
// These functions get added to each WebGL shader object

function bind()
{
  if (!this.uMat)
  {
    this.uMat = this.createUniform('material');
    this.uMat.materialoption = vec3.create(); 
  }

  gl.useProgram(this);
  if (this.renderstate && this.renderstate != Game.shaderMan.currentRenderState)
  {
    if (Game.shaderMan.currentRenderState) Game.shaderMan.currentRenderState.unset();
    Game.shaderMan.currentRenderState = this.renderstate;
    this.renderstate.set();
  }
}

function bindCamera(eye)
{
  this.setUniforms(eye.uniforms);
}

function bindMesh(mesh)
{
  if (mesh.indexbuffer) gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, mesh.indexbuffer);
  else gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

  gl.bindBuffer(gl.ARRAY_BUFFER, mesh.buffer);
  for (var code in mesh.attributes)          // code is what this attribute represents - IE TEX0, POSITION
  {
    var offset = mesh.attributes[code];     // get offset into the vertex buffer definition
    var attr = this.attributes[code];       // look up what attribute number this is in the shader
    var size = this.attributes[attr].size;  // get the size and type for this attribute as set in the shader
    var type = this.attributes[attr].type;
    gl.enableVertexAttribArray(attr);
    gl.vertexAttribPointer(attr, size, type, false, this.stride, offset);
  }
}

function bindInstanceData(mesh)
{
  if (!mesh.instanceBuffer) return;

  gl.bindBuffer(gl.ARRAY_BUFFER, mesh.instanceBuffer);
  for (var code in mesh.instance)
  {
    var offset = mesh.instance[code];     // get offset into the vertex buffer definition
    var attr = this.attributes[code];       // look up what attribute number this is in the shader
    var size = this.attributes[attr].size;  // get the size and type for this attribute as set in the shader
    var type = this.attributes[attr].type;
    gl.enableVertexAttribArray(attr);
    gl.vertexAttribPointer(attr, size, type, false, mesh.instanceStride, offset);
    angle.vertexAttribDivisorANGLE(attr, 1); // This makes it instanced!
  }
}

function bindTexture(name, texture, mag, min, wraps, wrapt)
{
  var tnum = this[name];
  var t = this.textures[tnum];

  gl.activeTexture(gl.TEXTURE0 + tnum);
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.uniform1i(t.loc, tnum);
  if (!texture) return;

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
    if (!this[name]) continue;
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
  for (var i = 0; i < mesh.groups.length; ++i)
  {
    // set material
    this.setUniforms(mesh.groups[i].material);
    if (this.textures.length)
    {
      if (mesh.groups[i].texture) this.bindTexture('uTexture', Game.assetMan.assets[mesh.groups[i].texture].texture);
      else this.bindTexture('uTexture', null);
    }

    // render the parts
    for (var p = 0; p < mesh.groups[i].parts.length; ++p)
    {
      var part = mesh.groups[i].parts[p];
      this.setUniforms(part.uniforms);

      this.bindMesh(part);
      if (part.instanceBuffer)
      {
        this.bindInstanceData(part);
        if (part.indexbuffer)
          angle.drawElementsInstancedANGLE(part.type, part.prims, gl.UNSIGNED_SHORT, 0, part.instanceNumber);
        else
          angle.drawArraysInstancedANGLE(part.type, 0, part.prims, part.instanceNumber);
        return;
      }

      if (part.indexbuffer)
        gl.drawElements(part.type, part.prims, gl.UNSIGNED_SHORT, 0);
      else
        gl.drawArrays(part.type, 0, part.prims);
    }
  }
}