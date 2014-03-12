var AssetManager = function ()
{
  this.assets = {};
}

AssetManager.prototype.processTexture = function(tex)
{
  gl.bindTexture(gl.TEXTURE_2D, tex.texture);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, tex.image);
  if (tex.mipmap) { console.log("mipped"); gl.generateMipmap(gl.TEXTURE_2D); }
  gl.bindTexture(gl.TEXTURE_2D, null);
  this.assets[tex.name] = tex;
  Game.loading -= 1;
}

AssetManager.prototype.processMesh = function(name, mesh)
{
  var model = new Mesh();
  model.loadFromFBX(JSON.parse(mesh));
  this.assets[name] = model;
  Game.loading -= 1;
}

AssetManager.prototype.processMeshPNG = function (tex)
{
  var model = new Mesh();

  var img = document.createElement('canvas');
  img.width = tex.image.width;
  img.height = tex.image.height;
  var context = img.getContext('2d');
  context.drawImage(tex.image, 0, 0);
  var map = context.getImageData(0, 0, img.width, img.height);
  var len = map.data.length;
  var txt = "";
  var j = 0;
  var i = 0;
  for (i = 0; i < len; i++) {
    if (j == 3) { j = 0; continue; }
    if (map.data[i] === 0) break;
    txt += String.fromCharCode(map.data[i]);
    ++j;
  }

  try { model.loadFromFBX(JSON.parse(txt)); } catch(err)
  {
    txt += "}";
    model.loadFromFBX(JSON.parse(txt));
  }

  this.assets[tex.name] = model;
  Game.loading -= 1;
}
