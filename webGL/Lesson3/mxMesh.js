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
