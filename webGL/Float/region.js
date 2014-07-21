//----------------------------------------------------------------------------------------------------
// Define a patch of ground using the area rect. This contains real world whole-number coords
// Its pointless to have ground patches extend fractional amounts.
function fRegion(area)
{
  this.Area = area;
  this.MeshSize = RegionSize+2;
  this.VisibleMeshSize = RegionSize;
  this.Map = new Float32Array(this.MeshSize * this.MeshSize);
  this.Water = new Float32Array(this.MeshSize * this.MeshSize*3);
  this.mesh = null;
  this.heightmap = null;
  this.aomap = null;
  this.wangmap = null;

  this.watermap = null;
  this.watermapA = null;
  this.watermapB = null;
  this.flowmapA = null;
  this.flowmapB = null;

  this.create();
  this.createBuffers();
}

// Resets every point in the ground to 0 height then terraform it
fRegion.prototype.create = function()
{
  var size = this.MeshSize * this.MeshSize;
  var j;
  for (var i = 0; i < size; ++i)
  {
    this.Map[i] = 0.0;
    j = i * 3;
    this.Water[j+0] = 0.0;
    this.Water[j+1] = 0.0;
    this.Water[j+2] = 0.0;
  }
  this.generate();
}

// This function is to create a height for every point in the ground. It should be overload for different
// terraform styles. A ground patch should also inherit the terraform parameters from its neighbour ground patches
// and slightly change them to create gradual transition between radical changes.
fRegion.prototype.generate = function()
{
  var locx = this.Area.X / this.Area.Width;   // every integer square number space of noise represents a region
  var locy = this.Area.Y / this.Area.Height; 
  var step = 1.0 / (this.VisibleMeshSize - 1);  
  var xf = locx - step;                // to account for the skirt around the edge, we start one step back
  var zf = locy - step;

  var noise = Game.World.Generator;
  var i = 0;

  var max = 0;
  var val;
  for (var y = -1; y < this.VisibleMeshSize + 1; ++y)
  {
    xf = locx - step;

    for (var x = -1; x < this.VisibleMeshSize + 1; ++x)
    {
      if (x < 1 || y < 1 || x >= this.VisibleMeshSize - 1 || y >= this.VisibleMeshSize - 1) { val = -100.0; }
      else {
        val = noise.GetValue(xf, 0, zf) * NoiseScale;
        this.Water[i*3] =  Math.max(0.0 - val, 0.0);
      }
      this.Map[i] = val;
      if (val > max) max = val;
      i++;
      xf += step;
    }
    zf += step;
  }
}

fRegion.prototype.getUnknownPoint = function(x,y)
{
  var locx = this.Area.X / this.Area.Width;
  var locy = this.Area.Y / this.Area.Height;
  var step = 1.0 / (this.VisibleMeshSize - 1);
  var xf = locx + (x * step);
  var zf = locy + (y * step);
  return Game.World.Generator.GetValue(xf, 0, zf) * NoiseScale;
}

// this gets the height at a certain point using the raw array coordinated.
// should only be used internally
fRegion.prototype.getMapPoint = function (x, y)
{
  if (x >= this.VisibleMeshSize || y >= this.VisibleMeshSize || x < 0 || y < 0) return 0;//this.getUnknownPoint(x, y);

  ++x; ++y; // account for skirt to convert to index
  return this.Map[y * (this.MeshSize) + x];
}

// this will map the world coords into the ground array and determine the height by lerping as needed
// anything passed into the ground will be de-scaled so we dont have to care what the world scale is
//
// The logic for this comes from http://www.toymaker.info/Games/html/terrain_follow.html
//
var p0;
var p1;
var p2;
var n ;
fRegion.prototype.getPoint = function( x,  y)
{
  x -= this.Area.X;  // translate to the range 0 to RegionArea
  y -= this.Area.Y;
  x = x * this.VisibleMeshSize / this.Area.Width;  // scale from RegionArea to RegionSize
  y = y * this.VisibleMeshSize / this.Area.Height;

  var dx = (x - Math.floor(x));
  var dz = (y - Math.floor(y));
  x = Math.floor(x);
  y = Math.floor(y);

  // which triangle for this cell is the point in? get the points for that triangle
  if (dx > dz)
  {
    p0[0] = x;     p0[1] = 0; p0[2] = y;
    p1[0] = x + 1; p1[1] = 0; p1[2] = y + 1;
    p2[0] = x + 1; p2[1] = 0; p2[2] = y;
  }
  else
  {
    p0[0] = x;     p0[1] = 0; p0[2] = y;
    p1[0] = x;     p1[1] = 0; p1[2] = y + 1;
    p2[0] = x + 1; p2[1] = 0; p2[2] = y + 1;
  }

  // fill in the 0 y values above
  p0[1] = this.getMapPoint(p0[0], p0[2]);
  p1[1] = this.getMapPoint(p1[0], p1[2]);
  p2[1] = this.getMapPoint(p2[0], p2[2]);

  // get the face normal
//  var n = vec3.create();
  vec3.subtract(p1, p1, p0);
  vec3.subtract(p2, p2, p0);
  vec3.cross(n,p1,p2);
  vec3.normalize(n,n);   // normalize( (p1-p0) x (p2-p0) )

  // calculate height at the point using normal
  return p0[1] + (n[0] * dx + n[2] * dz) / -n[1];
}

fRegion.prototype.createBuffers = function()
{
  if (!this.mesh)
  {
    this.mesh = new Mesh();
    var index = 0;
    var vertexData = [];

    var step = this.Area.Height / (this.VisibleMeshSize - 1);
    for (var j = 0; j < this.VisibleMeshSize; ++j)
    {
      for (var i = 0; i < this.VisibleMeshSize; ++i)
      {
        // position (3)
        vertexData[index++] = this.Area.X + (i * step);
        vertexData[index++] = 0;
        vertexData[index++] = this.Area.Y + (j * step);
        // texture (2)
        vertexData[index++] = ((i + 1) / (this.VisibleMeshSize + 1));
        vertexData[index++] = ((j + 1) / (this.VisibleMeshSize + 1));
      }
    }

    // index buffer
    index = 0;
    var indexData = [];
    for (var j = 0; j < this.VisibleMeshSize - 1; ++j)
    {
      for (var i = 0; i < this.VisibleMeshSize - 1; ++i)
      {
        indexData[index++] = (j + 1) * this.VisibleMeshSize + i;
        indexData[index++] =  j      * this.VisibleMeshSize + (i + 1);
        indexData[index++] =  j      * this.VisibleMeshSize + i;

        indexData[index++] = (j + 1) * this.VisibleMeshSize + (i + 1);
        indexData[index++] =  j      * this.VisibleMeshSize + (i + 1);
        indexData[index++] = (j + 1) * this.VisibleMeshSize + i;
      }
    }

    this.mesh.loadFromArrays(vertexData, indexData, { 'POS': 0, 'TEX0': 12 }, gl.TRIANGLES, vertexData.length / 5.0);
  }

  if (!this.heightmap)
  {
    this.heightmap = new Texture('heightmap');
    this.heightmap.fromArray(this.MeshSize, this.MeshSize, this.Map, gl.LUMINANCE, gl.FLOAT);
  }

  if (!this.watermap)
  {
    this.watermap = new RenderSurface(this.MeshSize, this.MeshSize, gl.RGB, gl.FLOAT, this.Water);
    this.watermapA = new RenderSurface(this.MeshSize, this.MeshSize, gl.RGB, gl.FLOAT, this.Water);
    this.watermapB = new RenderSurface(this.MeshSize, this.MeshSize, gl.RGB, gl.FLOAT, this.Water);

    var size = this.MeshSize * this.MeshSize * 3;
    var zeros = new Float32Array(size);
    for (var i = 0; i < size; ++i) zeros[i] = 0.0;
    this.flowmapA = new RenderSurface(this.MeshSize, this.MeshSize, gl.RGB, gl.FLOAT, zeros);
    this.flowmapB = new RenderSurface(this.MeshSize, this.MeshSize, gl.RGB, gl.FLOAT, zeros);
  }

  if (!this.wangmap)
  {
    var wangsize = 64.0;
    var data = Game.World.wang.Create(wangsize, wangsize);
    this.wangmap = new Texture('wangmap');
    this.wangmap.fromArray(wangsize, wangsize, data, gl.LUMINANCE_ALPHA, gl.FLOAT);
  }

  if (!this.aomap) this.createAOMap();
}

fRegion.prototype.jiggleWater = function()
{
//  var size = this.MeshSize * this.MeshSize;
//  for (var i = 0; i < size; ++i)
//  {
//    this.Water[i] += Math.random() * 0.05 - 0.025;
//  }
//  this.watermap.fromArray(this.MeshSize, this.MeshSize, this.Water, gl.RGB, gl.FLOAT);
}

fRegion.prototype.createAOMap = function ()
{
  // ao data
  var index = 0;
  var savedFactors = new Float32Array(this.MeshSize * this.MeshSize);

  var g = 0;
  for (var j = -1; j < this.VisibleMeshSize + 1; ++j) {
    for (var i = -1; i < this.VisibleMeshSize + 1; ++i) {
      g = this.getMapPoint(i, j);
      savedFactors[index] = Game.World.cast.calculate((this.Area.X + i), g, (this.Area.Y + j), this);
      ++index;
    }
  }
  this.aomap = new Texture('aomap');
  this.aomap.fromArray(this.MeshSize, this.MeshSize, savedFactors, gl.LUMINANCE, gl.FLOAT);
}

fRegion.prototype.renderflows = function()
{
  // flip water and newwater
  var tmp = this.watermap;
  this.watermap = this.watermapA;
  this.watermapA = tmp;
  // flip flows A and B
  var tmp = this.flowmapA;
  this.flowmapA = this.flowmapB;
  this.flowmapB = tmp;

  // step 1
  // needed: height, water, flowsA
  // output to: flowsB
  {
    var uniforms = {};
    uniforms.x = 0.8;

    this.flowmapB.engage();
    gl.viewport(0, 0, this.MeshSize, this.MeshSize);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clearDepth(1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    var effectin = Game.shaderMan.shaders["waterFlowOut"];
    effectin.bind();
    //effect.setUniforms(uniforms);
    effectin.bindTexture("height", this.heightmap.texture);
    effectin.bindTexture("water", this.watermapA.texture);
    effectin.bindTexture("flows", this.flowmapA.texture);
    effectin.draw(Game.assetMan.assets["fsq"]);
  }
  
  // step 2
  // needed: water, flowsB
  // output to: newwater
  {
    var uniforms = {};
    uniforms.x = 0.8;

    this.watermap.engage();
    gl.viewport(0, 0, this.MeshSize, this.MeshSize);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clearDepth(1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    var effectout = Game.shaderMan.shaders["waterFlowIn"];
    effectout.bind();
    //effect.setUniforms(uniforms);
    effectout.bindTexture("water", this.watermapA.texture);
    effectout.bindTexture("flows", this.flowmapB.texture);
    effectout.draw(Game.assetMan.assets["fsq"]);
  }
}