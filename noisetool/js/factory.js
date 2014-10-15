function ntBillow()
{
  this.points = 0;
  this.pointNames = [];
  this.module = new LibNoise.Billow();
  this.name = "LibNoise.Billow";

  this.parameters = [];
  this.parameters.push( { Name: "Quality", Min: 1, Max: 3, Incr: 1, Rounding: 0, SlideOnly: true } );
  this.parameters.push( { Name: "Octaves", Min: 1, Max: 30, Incr: 1, Rounding: 0, SlideOnly: true });
  this.parameters.push( { Name: "Frequency", Min: 1, Max: 16, Incr: 1, Rounding: 0 });
  this.parameters.push( { Name: "Persistence", Min: 0, Max: 1, Incr: 0.01, Rounding: 2 });
  this.parameters.push( { Name: "Lacunarity", Min: 1, Max: 4, Incr: 0.1, Rounding: 1 });
}

ntBillow.prototype.getValue = function(x, y)
{
  return this.module.GetValue(x, y, 0);
}

function ntCheckerboard()
{
  this.points = 0;
  this.pointNames = [];
  this.module = new LibNoise.Checkerboard();
  this.name = "LibNoise.Checkerboard";

  this.parameters = [];
}

function ntConstant()
{
  this.points = 0;
  this.pointNames = [];
  this.module = new LibNoise.Constant();
  this.name = "LibNoise.Constant";

  this.parameters = [];
  this.parameters.push({ Name: "Value", Min: 0, Max: 1, Incr: 0.01, Rounding: 2 });
}

function ntCylinders()
{
  this.points = 0;
  this.pointNames = [];
  this.module = new LibNoise.Cylinders();
  this.name = "LibNoise.Cylinders";

  this.parameters = [];
  this.parameters.push({ Name: "Frequency", Min: 1, Max: 10, Incr: 0.1, Rounding: 1 });
}

function ntNoiseGradient()
{
  this.points = 0;
  this.pointNames = [];
  this.module = new LibNoise.Gradient();
  this.name = "LibNoise.Gradient";

  this.parameters = [];
  this.parameters.push({ Name: "Axis", Min: 1, Max: 3, Incr: 1, Rounding: 0, SlideOnly: true });
  this.parameters.push({ Name: "Lower", Min: 0, Max: 1, Incr: 0.01, Rounding: 2 });
  this.parameters.push({ Name: "Upper", Min: 0, Max: 1, Incr: 0.01, Rounding: 2 });
}

function ntPerlin()
{
  this.points = 0;
  this.pointNames = [];
  this.module = new LibNoise.Perlin();
  this.name = "LibNoise.Perlin";

  this.parameters = [];
  this.parameters.push({ Name: "Quality", Min: 1, Max: 3, Incr: 1, Rounding: 0, SlideOnly: true });
  this.parameters.push({ Name: "Octaves", Min: 1, Max: 30, Incr: 1, Rounding: 0, SlideOnly: true });
  this.parameters.push({ Name: "Frequency", Min: 1, Max: 16, Incr: 1, Rounding: 0 });
  this.parameters.push({ Name: "Persistence", Min: 0, Max: 1, Incr: 0.01, Rounding: 2 });
  this.parameters.push({ Name: "Lacunarity", Min: 1, Max: 4, Incr: 0.1, Rounding: 1 });
}

function ntRidged()
{
  this.points = 0;
  this.pointNames = [];
  this.module = new LibNoise.RidgedMultifractal();
  this.name = "LibNoise.RidgedMultifractal";

  this.parameters = [];
  this.parameters.push({ Name: "Quality", Min: 1, Max: 3, Incr: 1, Rounding: 0, SlideOnly: true });
  this.parameters.push({ Name: "Octaves", Min: 1, Max: 30, Incr: 1, Rounding: 0, SlideOnly: true });
  this.parameters.push({ Name: "Frequency", Min: 1, Max: 16, Incr: 1, Rounding: 0 });
  this.parameters.push({ Name: "Lacunarity", Min: 1, Max: 4, Incr: 0.1, Rounding: 1 });
}

function ntSpheres()
{
  this.points = 0;
  this.pointNames = [];
  this.module = new LibNoise.Spheres();
  this.name = "LibNoise.Spheres";

  this.parameters = [];
  this.parameters.push({ Name: "Frequency", Min: 1, Max: 10, Incr: 0.1, Rounding: 1 });
}

function ntVoronoi()
{
  this.points = 0;
  this.pointNames = [];
  this.module = new LibNoise.Voronoi();
  this.name = "LibNoise.Voronoi";

  this.parameters = [];
  this.parameters.push({ Name: "Displacement", Min: 1, Max: 30, Incr: 1, Rounding: 0, SlideOnly: true });
  this.parameters.push({ Name: "Frequency", Min: 1, Max: 16, Incr: 1, Rounding: 0 });
  this.parameters.push({ Name: "Distance", Min: 0, Max: 1, Incr: 1, Rounding: 0 });
}

function ntAbsolute()
{
  this.points = 1;
  this.pointNames = ['Source'];
}


function ntTurbulence()
{
  this.points = 1;
  this.pointNames = ['Source'];
}


function ntAdd()
{
  this.points = 2;
  this.pointNames = ['Source A', 'Source B'];
}


function ntFactory()
{
  this.types = {};
  this.types["Billow"] = ntBillow;
  this.types["Checkerboard"] = ntCheckerboard;
  this.types["Constant"] = ntConstant;
  this.types["Cylinders"] = ntCylinders;
  this.types["Gradient"] = ntNoiseGradient;
  this.types["Perlin"] = ntPerlin;
  this.types["Ridged Multifractal"] = ntRidged;
  this.types["Spheres"] = ntSpheres;
  this.types["Voronoi"] = ntVoronoi;

  this.types["Absolute"] = ntAbsolute;

  this.types["Turbulence"] = ntTurbulence;

  this.types["Add"] = ntAdd;
}

ntFactory.prototype.getModule = function (name)
{
  return new (this.types[name])();
}
