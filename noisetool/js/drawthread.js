importScripts('NoiseLib.js', 'gradients.js', 'factory.js');

function extend(obj, base)
{
  for (var property in base)
    if (base.__proto__.hasOwnProperty(property)) obj[property] = base[property];
}

function copyctor(obj, base)
{
  for (var property in base)
    if (base.hasOwnProperty(property)) obj[property] = base[property];
}

function getModule(name)
{
  if (name == "LibNoise.Billow") return new LibNoise.Billow();
  else if (name == "LibNoise.Checkerboard") return new LibNoise.Checkerboard();
  else if (name == "LibNoise.Constant") return new LibNoise.Constant();
  else if (name == "LibNoise.Cylinders") return new LibNoise.Cylinders();
  else if (name == "LibNoise.Gradient") return new LibNoise.Gradient();
  else if (name == "LibNoise.Perlin") return new LibNoise.Perlin();
  else if (name == "LibNoise.RidgedMultifractal") return new LibNoise.RidgedMultifractal();
  else if (name == "LibNoise.Spheres") return new LibNoise.Spheres();
  else if (name == "LibNoise.Voronoi") return new LibNoise.Voronoi();

  else if (name == "LibNoise.AbsoluteOutput") return new LibNoise.AbsoluteOutput();
  else if (name == "LibNoise.ClampOutput") return new LibNoise.ClampOutput();
  else if (name == "LibNoise.CurveOutput") return new LibNoise.CurveOutput();
  else if (name == "LibNoise.ExponentialOutput") return new LibNoise.ExponentialOutput();
  else if (name == "LibNoise.InvertOutput") return new LibNoise.InvertOutput();
  else if (name == "LibNoise.ScaleBiasOutput") return new LibNoise.ScaleBiasOutput();
  else if (name == "LibNoise.TerraceOutput") return new LibNoise.TerraceOutput();
  else if (name == "LibNoise.CacheOutput") return new LibNoise.CacheOutput();
}

function createModule(startid, mods)
{
  var mod = mods[startid];
  var m = getModule(mod.name);
  copyctor(m, mod.params);
  // set inputs
  for (var i = 0; i < 4; ++i)
    if (mod["in" + i]) m.setInput(i, createModule(mod["in" + i], mods));
  return m;
}

onmessage = function (e)
{
  var imagedata = e.data.imagedata;

  var stepx = e.data.sizex / e.data.newW;
  var stepy = e.data.sizey / e.data.newH;
  extend(e.data.gradient, new ntGradient());
  var module = createModule(e.data.id, e.data.modules);

  var x = 0;  // these loops are done like this because more optimized stopped working
  var y = 0;
  var j = 0;
  var min = module.GetValue(e.data.startx, e.data.starty, 0);
  var max = min;
  var c = { R: 0, G: 0, B: 0 };
  for (var yy = 0; yy < e.data.newH; yy++, y += stepy)
  {
    x = 0;
    for (var xx = 0.0; xx < e.data.newW; xx++, x += stepx)
    {
      var val = module.GetValue(e.data.startx + x, e.data.starty + y, 0);
      if (val < min) min = val;
      if (val > max) max = val;
      e.data.gradient.getColor(val, c);
      imagedata.data[j++] = c.R * 255;
      imagedata.data[j++] = c.G * 255;
      imagedata.data[j++] = c.B * 255;
      imagedata.data[j++] = 255;
    }
  }
  var ret = { id: e.data.id, min: min, max: max, imagedata: imagedata };
  postMessage(ret);
}




