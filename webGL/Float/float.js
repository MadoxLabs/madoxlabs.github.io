function fGround()
{

}

function fRegion()
{

}

function fWorld()
{
  this.Regions = [];

  var r = new mxRand();

  var mountains = new LibNoise.FastRidgedMultifractal();
  mountains.Seed = r.pop();
  mountains.Frequency = 0.5;
  var baseFlat = new LibNoise.FastBillow();
  baseFlat.Seed = r.pop();
  baseFlat.Frequency = 1;
  var flat = new LibNoise.ScaleBiasOutput(baseFlat);
  flat.Scale = 0.25;
  flat.Bias = -0.75;
  var terrain = new LibNoise.FastPerlin();
  terrain.Seed = r.pop();
  terrain.Frequency = 0.5;
  terrain.Persistence = 0.25;
  var final = new LibNoise.SelectOutput(terrain, mountains, flat);
  final.EdgeFalloff = 0.125;
  final.UpperBound = 1000;
  final.LowerBound = 0;

  this.Generator = final;
}


Game.appInit = function ()
{
  this.World = new fWorld();
}

Game.deviceReady = function ()
{
}

Game.loadingStart = function ()
{

}

Game.loadingStop = function ()
{

}

Game.appUpdate = function ()
{

}

Game.appDrawAux = function ()
{

}

Game.appDraw = function (eye)
{

}

Game.appHandleKeyDown = function (event)
{

}

Game.appHandleKeyUp = function (event)
{

}

/*
 world
   contains regions
            ground def
   draw - delegate to regions

 regions
   contains mesh
            height map, ao map
   draws
 */

/*
PHASE 1

shader includes

create a sized grid with NxN divisions and a skirt for future
have a ground definition object that run noise lib
create a heightmap from ground
create an AO map from raycasting
render the ground provided height, ao maps
  vertex shader: set height from height map
                 get ao factor and interpolate it
  pixel shader: determine the light based on aio factor
sky colour
moving light

camera - fixed looking at center of ground
         rotate about Y
         rotate about X
         in and out

PHASE 2

basic textures
basic shadow map
dual shadow map
 
PHASE 3

wang tiles
water, doesnt use shadows

*/