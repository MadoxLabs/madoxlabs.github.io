var Texture = function(name)
{
  this.name = name;
  this.texture = gl.createTexture();
}

Texture.prototype.load = function(file)
{
  var tex = this;  // cant use 'this' in the onload line below.
  this.image = new Image();
  this.image.onload = function () { Game.assetMan.processTexture(tex); }
  this.image.src = file;
}
