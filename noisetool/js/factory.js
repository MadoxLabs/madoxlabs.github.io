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
  this.types["Absolute"] = ntAbsolute;
  this.types["Turbulence"] = ntTurbulence;
  this.types["Add"] = ntAdd;
}

ntFactory.prototype.getModule = function (name)
{
  return new (this.types[name])();
}
