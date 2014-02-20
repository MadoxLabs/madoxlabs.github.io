var AssetManager = function ()
{
  this.assets = {};
}

AssetManager.prototype.processTexture = function(tex)
{
  gl.bindTexture(gl.TEXTURE_2D, tex.texture);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, tex.image);
  gl.bindTexture(gl.TEXTURE_2D, null);
  this.assets[tex.name] = tex;
  Game.loading -= 1;
}
