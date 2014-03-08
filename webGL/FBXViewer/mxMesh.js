var Material = function()
{
}

Material.prototype.loadFromFBX = function(data)
{
  // store lighting information
  // store texture asset
}

// a mesh needs to store set of materials and subsets of meshparts
// group { material, [parts] }

var Mesh = function ()
{
  this.groups = [];
}

Mesh.prototype.loadFromArrays = function(verts, indexs, attr, type, prims, group, trans)
{
  var part = {};

  if (arguments.length > 5) part.localTransform = trans;
  else
  {
    part.localTransform = mat4.create();
    mat4.identity(part.localTransform);
  }

  part.attributes = attr;
  part.verts = verts;
  part.indexs = indexs;
  part.type = type;
  part.prims = prims;

  part.buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, part.buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.STATIC_DRAW);

  if (indexs)
  {
    part.prims = indexs.length;
    part.indexbuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, part.indexbuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indexs), gl.STATIC_DRAW);
  }

  if (arguments.length > 4 && this.groups.length > group)
    this.groups[group].parts.push(part);
  else
    this.groups.push( { material: new Material(), parts: [part] } );
}

Mesh.prototype.loadFromFBX = function(data)
{

}

Mesh.prototype.setInstances = function(data, number)
{
  if (!this.instanceBuffer) this.instanceBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, this.instanceBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);
  this.instanceNumber = number;
  this.instanceStride =  4 * (data.length / number); // TODO this assumes everything is all floats
}

Mesh.prototype.drawNormals = function()
{
  var ret = new Mesh();

  for (var i = 0; i < this.groups.length; ++i)
  {
    for (var p = 0; p < this.groups[i].parts.length; ++p)
    {
      var part = this.groups[i].parts[p];

      var verts = [];
      for (var v = 0; v < part.verts.length; v += 8)
      {
        verts.push(part.verts[v]);
        verts.push(part.verts[v + 1]);
        verts.push(part.verts[v + 2]);
        verts.push(part.verts[v]     + part.verts[v + 5]);
        verts.push(part.verts[v + 1] + part.verts[v + 6]);
        verts.push(part.verts[v + 2] + part.verts[v + 7]);
      }

      ret.loadFromArrays(verts, null, { 'POS': 0 }, gl.LINES, verts.length/3.0, 0, part.localTransform);
    }
  }

  return ret;
}

Mesh.prototype.drawWireframe = function () {
  var ret = new Mesh();

  for (var i = 0; i < this.groups.length; ++i) {
    for (var p = 0; p < this.groups[i].parts.length; ++p) {
      var part = this.groups[i].parts[p];

      var verts = [];
      for (var v = 0; v < part.indexs.length; v += 3)
      {
        var v1 = part.indexs[v] * 8;
        var v2 = part.indexs[v + 1] * 8;
        var v3 = part.indexs[v + 2] * 8;

        verts.push(part.verts[v1]);
        verts.push(part.verts[v1 + 1]);
        verts.push(part.verts[v1 + 2]);

        verts.push(part.verts[v2]);
        verts.push(part.verts[v2 + 1]);
        verts.push(part.verts[v2 + 2]);

        verts.push(part.verts[v2]);
        verts.push(part.verts[v2 + 1]);
        verts.push(part.verts[v2 + 2]);

        verts.push(part.verts[v3]);
        verts.push(part.verts[v3 + 1]);
        verts.push(part.verts[v3 + 2]);

        verts.push(part.verts[v3]);
        verts.push(part.verts[v3 + 1]);
        verts.push(part.verts[v3 + 2]);

        verts.push(part.verts[v1]);
        verts.push(part.verts[v1 + 1]);
        verts.push(part.verts[v1 + 2]);
      }

      ret.loadFromArrays(verts, null, { 'POS': 0 }, gl.LINES, verts.length / 3.0, 0, part.localTransform);
    }
  }

  return ret;
}