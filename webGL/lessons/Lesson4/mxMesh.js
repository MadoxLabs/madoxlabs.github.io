var Mesh = function(verts, indexs, attr, prims, type)
{
  this.attributes = attr;
  this.verts = verts;
  this.indexs = indexs;
  this.prims = prims;
  this.type = type;

  this.buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.STATIC_DRAW);

  if (indexs)
  {
    this.indexbuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexbuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indexs), gl.STATIC_DRAW);
  }
  else
    this.indexbuffer = null;
}
