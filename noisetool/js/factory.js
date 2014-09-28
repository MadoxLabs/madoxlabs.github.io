function ntBillow()
{
  this.points = 0;
  this.pointNames = [];
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
