var Texture = function(name)
{
  this.name = name;
  this.texture = gl.createTexture();
  this.mipmap = false;
}

Texture.prototype.load = function(file)
{
  var tex = this;  // cant use 'this' in the onload line below.
  this.image = new Image();
  this.image.onload = function () { Game.assetMan.processTexture(tex); }
  this.image.src = file;
}

var MeshPNG = function (name)
{
  this.name = name;
}

MeshPNG.prototype.load = function (file)
{
  var tex = this;  // cant use 'this' in the onload line below.
  this.image = new Image();
  this.image.onload = function () { Game.assetMan.processMeshPNG(tex); }
  this.image.src = file;
}
