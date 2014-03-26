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

function RenderSurface(w, h)
{
  this.surface = gl.createFramebuffer();
  this.surface.width = w;
  this.surface.height = h;
  gl.bindFramebuffer(gl.FRAMEBUFFER, this.surface);

  this.texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, this.texture);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, this.surface.width, this.surface.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

  this.depth = gl.createRenderbuffer();
  gl.bindRenderbuffer(gl.RENDERBUFFER, this.depth);
  gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, this.surface.width, this.surface.height);

  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.texture, 0);
  gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, this.depth);

  gl.bindRenderbuffer(gl.RENDERBUFFER, null);
  gl.bindTexture(gl.TEXTURE_2D, null);
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
}

RenderSurface.prototype.engage = function ()
{
  gl.bindFramebuffer(gl.FRAMEBUFFER, this.surface);
}
