function fPoint(x,y)
{
  this.X = x;
  this.Y = y;
}

function fRectangle(x,y,w,h)
{
  this.X = x;
  this.Y = y;
  this.Width = w;
  this.Height = h;

}

//----------------------------------------------------------------
function fRay(x,y,z,raySteps)
{
  this.ray = vec3.fromValues(x,y,z);
  this.offsets = [];

  // compute the integer-based cels this ray crosses - up to a max length
  var step = vec3.clone(this.ray);
  var current = vec3.create();
  for (var i = 0; i < raySteps; ++i)     // 100 steps defines the length of the ray casting vector
  {
    var cel = vec3.create();
    cel[0] = current[0];
    cel[1] = current[1] + 0.5;
    cel[2] = current[2];
    this.offsets.push(cel);
    vec3.add(current, current, step);
  }
}

function fRayCasting(numRays)
{
  this.rays = [];
  this.raySteps = 5;
  this.createRays(numRays);
}

fRayCasting.prototype.createRays = function( numRays)
{
  this.rays = [];

  // use a Golden spiral to pick ray directions on a unit sphere - http://cgafaq.info/wiki/Evenly_distributed_points_on_sphere
  var dlong = LibNoise.NMath.PI * (3.0 - Math.sqrt(5.0));
  var dz = 2.0 / numRays;
  var _long = 0;
  var z = 1.0 - dz / 2.0;
  for (var k = 0; k < numRays; ++k)
  {
    var r = Math.sqrt(1.0 - z * z);
    this.rays[k] = new fRay(Math.cos(_long) * r, Math.sin(_long) * r, z, this.raySteps);
    z -= dz;
    _long += dlong;
  }
}

fRayCasting.prototype.calculate = function(x,y,z,ground)
{
  // Ambient Occlusion
  var escapes = 0;
  for (var ray in this.rays)
  {
    if (this.calculateRay(this.rays[ray], x, y, z, ground)) escapes++;
  }
  // convert the influence value to a percent.
  // invert the percent so 1.0 is not occluded
  return escapes / this.rays.length;
}

fRayCasting.prototype.calculateRay = function(ray, x,y,z,ground)
{
  var ok = true;
  for (var offset in ray.offsets)
  {
    var o = ray.offsets[offset];
    var h = ground.getPoint(x - o[0], z - o[2]);
    if (y + o[1] <= h) { ok = false; break; }
  }
  // hit a cel, abort
  return ok;
}
  

//----------------------------------------------------------------------------------------------------
// Define a patch of ground using the area rect. This contains real world whole-number coords
// Its pointless to have ground patches extend fractional amounts.
function fRegion(area)
{
  this.Area = area;
  this.MeshSize = RegionSize+2;
  this.VisibleMeshSize = RegionSize;
  this.Map = new Float32Array(this.MeshSize * this.MeshSize);
  this.mesh = null;
  this.heightmap = null;
  this.aomap = null;

  this.create();
  this.createBuffers();
}

// Resets every point in the ground to 0 height then terraform it
fRegion.prototype.create = function()
{
  var size = this.MeshSize * this.MeshSize;
  for (var i = 0; i < size; ++i) this.Map[i] = 0;
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
      val = noise.GetValue(xf, 0, zf) * NoiseScale;
      this.Map[i++] = val
      if (val > max) max = val;
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
  if (x >= this.VisibleMeshSize || y >= this.VisibleMeshSize || x < 0 || y < 0)  return this.getUnknownPoint(x, y);

  ++x; ++y; // account for skirt to convert to index
  return this.Map[y * (this.MeshSize) + x];
}

// this will map the world coords into the ground array and determine the height by lerping as needed
// anything passed into the ground will be de-scaled so we dont have to care what the world scale is
//
// The logic for this comes from http://www.toymaker.info/Games/html/terrain_follow.html
//
var p0 = vec3.create();
var p1 = vec3.create();
var p2 = vec3.create();
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
    p0.X = x; p0.Y = 0; p0.Z = y;
    p1.X = x + 1; p1.Y = 0; p1.Z = y + 1;
    p2.X = x + 1; p2.Y = 0; p2.Z = y;
  }
  else
  {
    p0.X = x; p0.Y = 0; p0.Z = y;
    p1.X = x; p1.Y = 0; p1.Z = y + 1;
    p2.X = x + 1; p2.Y = 0; p2.Z = y + 1;
  }

  // fill in the 0 y values above
  p0.Y = this.getMapPoint(p0.X, p0.Z);
  p1.Y = this.getMapPoint(p1.X, p1.Z);
  p2.Y = this.getMapPoint(p2.X, p2.Z);

  // get the face normal
  var n = vec3.create();
  vec3.subtract(p1, p1, p0);
  vec3.subtract(p2, p2, p0);
  vec3.cross(n,p1,p2);
  vec3.normalize(n,n);   // normalize( (p1-p0) x (p2-p0) )

  // calculate height at the point using normal
  ret = p0.Y + (n.X * dx + n.Z * dz) / -n.Y;
  return true;
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

  if (!this.aomap)
  {
    // ao data
    var index = 0;
    var savedFactors = new Float32Array(this.MeshSize * this.MeshSize);
    
    var g = 0;
    for (var j = -1; j < this.VisibleMeshSize+1; ++j)
    {
      for (var i = -1; i < this.VisibleMeshSize + 1; ++i)
      {
        g  = this.getMapPoint(i, j);
        savedFactors[index] = Game.World.cast.calculate((this.Area.X + i), g, (this.Area.Y + j), this);
        ++index;
      }
    }

    this.aomap = new Texture('aomap');
    this.aomap.fromArray(this.MeshSize, this.MeshSize, savedFactors, gl.LUMINANCE, gl.FLOAT);
  }
}

//----------------------------------------------------------------------------------------------------
var RegionSize = 100;  // vertex dimension in mesh.  This covers a square integer range in the noise field
var RegionArea = 100;  // physical dimension in world. This covers the vertex mesh
var NoiseScale = 20;

function fWorld()
{
  this.Regions = [];
  var d = new Date(); var r = new mxRand(); r.seed(d.getTime(), true);
  var mountains = new LibNoise.FastRidgedMultifractal();
  mountains.Seed = r.pop();
  mountains.Frequency = 5.0;
  var baseFlat = new LibNoise.FastBillow();
  baseFlat.Seed = r.pop();
  baseFlat.Frequency = 1;
  var flat = new LibNoise.ScaleBiasOutput(baseFlat);
  flat.Scale = 0.25;
  flat.Bias = -0.75;
  var terrain = new LibNoise.FastPerlin();
  terrain.Seed = r.pop();
  terrain.Frequency = 5.0;
  terrain.Persistence = 0.25;
  var final = new LibNoise.SelectOutput(terrain, mountains, flat);
  final.EdgeFalloff = 0.125;
  final.UpperBound = 1000;
  final.LowerBound = 0;

  this.Generator = final;
  this.cast = new fRayCasting(32);
}

// Takes in a location in world coords from player view
// Convert to a scaled region position and create region
// Create region that contains the point (x,y)
fWorld.prototype.createRegionContaining = function(x, y)
{
  var index = this.getIndexForRegionContaining(x, y);
  if (this.Regions[index]) return;

  // figure out the area
  var p = this.getOriginForRegionContaining(x, y);
  var area = new fRectangle(p.X, p.Y, RegionArea, RegionArea);
  this.Regions[index] = new fRegion(area);
}

// return the hash value of a region containing point (x,y) for map lookups
fWorld.prototype.getIndexForRegionContaining = function(x, y)
{
  // scale down to get region coords
  x = Math.floor(x / RegionArea);
  y = Math.floor(y / RegionArea);

  return x * 1000000000 + y;
}

// return the top left point of a region containing point (x,y)
fWorld.prototype.getOriginForRegionContaining = function(x,y)
{
  // scale down to get region coords
  x = Math.floor(x / RegionArea);
  y = Math.floor(y / RegionArea);

  return new fPoint(x * RegionArea,y * RegionArea );
}

// does the region that contains point (x,y) exist yet?
fWorld.prototype.containsSpot = function( x,  y)
{
  var index = this.getIndexForRegionContaining(x, y);
  return this.Regions[index] ? true : false;
}

fWorld.prototype.getHeight = function(x, y)
{
  var index = this.getIndexForRegionContaining(x, y);

  var ret = 0;
  if (this.Regions[index]) ret = this.Regions[index].getPoint(x, y);
  return ret;
}

fWorld.prototype.getRegionContaining = function( x,  y)
{
  var index = this.getIndexForRegionContaining(x, y);
  return this.Regions[index];
}

fWorld.prototype.getRegionByIndex = function( x,  y)
{
  var index = x * 1000000000 + y;
  return Regions[index];
}

//----------------------------------------------------------------------------------------------------

var uPerObject;
var currentlyPressedKeys = [];

Game.appInit = function ()
{
  Game.World = new fWorld();
  Game.World.createRegionContaining(0, 0);
  Game.loadShaderFile("ground.fx");
}

Game.deviceReady = function ()
{
}

Game.loadingStart = function ()
{
  Game.ready = false;
}

Game.loadingStop = function ()
{
  Game.ready = true;

  Game.camera.offset[0] = 0.0;
  Game.camera.offset[1] = 0.0;
  Game.camera.offset[2] = 100.0;
  Game.camera.angles[0] = -0.55;
  Game.camera.lookAt(50.0, 0.0, 50.0);

  var effect = Game.shaderMan.shaders["ground"];
  uPerObject = effect.createUniform('perobject');
  uPerObject.uWorld = mat4.create();
  mat4.identity(uPerObject.uWorld);
}

Game.appUpdate = function ()
{
  if (Game.loading) return;
  if (!Game.camera) return;
  if (currentlyPressedKeys[33])  // Page Up
    Game.camera.offset[2] -= 1;
  if (currentlyPressedKeys[34])  // Page Down
    Game.camera.offset[2] += 1;

  if (currentlyPressedKeys[37])  // Left cursor key
    Game.camera.angles[1] += 0.01;
  if (currentlyPressedKeys[39])  // Right cursor key
    Game.camera.angles[1] -= 0.01;

  if (currentlyPressedKeys[38])  // Up cursor key
    Game.camera.angles[0] += 0.01;
  if (currentlyPressedKeys[40])  // Down cursor key
    Game.camera.angles[0] -= 0.01;
}

Game.appDrawAux = function ()
{

}

Game.appDraw = function (eye)
{
  if (!Game.ready || Game.loading) return;

  var effect = Game.shaderMan.shaders["ground"];
  effect.bind();
  effect.bindCamera(eye);
  effect.setUniforms(uPerObject);
  effect.bindTexture("heightmap", Game.World.Regions[0].heightmap.texture);
  effect.bindTexture("aomap", Game.World.Regions[0].aomap.texture);
  effect.draw(Game.World.Regions[0].mesh);
}

Game.appHandleKeyDown = function (event)
{
  currentlyPressedKeys[event.keyCode] = true;

}

Game.appHandleKeyUp = function (event)
{
  currentlyPressedKeys[event.keyCode] = false;

}

/*
PHASE 1

shader includes

v create a sized grid with NxN divisions and a skirt for future
v have a ground definition object that run noise lib
v create a heightmap from ground
v  create an AO map from raycasting
v  render the ground provided height, ao maps
v    vertex shader: set height from height map
v                   get ao factor and interpolate it
 v   pixel shader: determine the light based on ao factor
  sky colour
  moving light

v  camera - fixed looking at center of ground
v            rotate about Y
v            rotate about X
v            in and out

PHASE 2

basic textures
basic shadow map
dual shadow map
 
PHASE 3

wang tiles
water, doesnt use shadows

*/