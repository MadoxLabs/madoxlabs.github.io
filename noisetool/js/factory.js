function ntBillow()
{
  this.points = 0;
  this.pointNames = [];
  this.module = new LibNoise.Billow();
}

ntBillow.prototype.getValue = function(x, y)
{
  return this.module.GetValue(x, y, 0);
}

function ntFastBillow()
{
  this.points = 0;
  this.pointNames = [];
  this.module = new LibNoise.FastBillow(0);
}

ntFastBillow.prototype.getValue = function (x, y)
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
  this.types["FastBillow"] = ntFastBillow;
  this.types["Absolute"] = ntAbsolute;
  this.types["Turbulence"] = ntTurbulence;
  this.types["Add"] = ntAdd;
}

ntFactory.prototype.getModule = function (name)
{
  return new (this.types[name])();
}
