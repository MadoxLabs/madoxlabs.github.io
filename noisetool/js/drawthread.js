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

  else if (name == "LibNoise.AddOutput") return new LibNoise.AddOutput();
  else if (name == "LibNoise.LargerOutput") return new LibNoise.LargerOutput();
  else if (name == "LibNoise.SmallerOutput") return new LibNoise.SmallerOutput();
  else if (name == "LibNoise.MultiplyOutput") return new LibNoise.MultiplyOutput();
  else if (name == "LibNoise.PowerOutput") return new LibNoise.PowerOutput();
  else if (name == "LibNoise.BlendOutput") return new LibNoise.BlendOutput();
  else if (name == "LibNoise.SelectOutput") return new LibNoise.SelectOutput();

  else if (name == "LibNoise.Turbulence") return new LibNoise.Turbulence();
  else if (name == "LibNoise.DisplaceInput") return new LibNoise.DisplaceInput();
  else if (name == "LibNoise.InvertInput") return new LibNoise.InvertInput();
  else if (name == "LibNoise.RotateInput") return new LibNoise.RotateInput();
  else if (name == "LibNoise.ScaleInput") return new LibNoise.ScaleInput();
  else if (name == "LibNoise.TranslateInput") return new LibNoise.TranslateInput();
}

function createModule(startid, mods)
{
  var mod = mods[startid];
  var m = getModule(mod.name);
  if (m.Seed !== undefined) m.Seed = mod.seed * 10000000000000000;
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

  var total = e.data.newH * e.data.newW;
  var sofar = 0;
  var last = 0;

  if (module.Name == "LibNoise.RotateInput") module.SetAngles();

  for (var yy = 0; yy < e.data.newH; yy++, y += stepy)
  {
    x = 0;
    for (var xx = 0.0; xx < e.data.newW; xx++, x += stepx)
    {
      var val = module.GetValue(e.data.startx + x, e.data.starty + y, 0);
      if (val < min) min = val;
      if (val > max) max = val;
      if (e.data.normalize.on) val = (val - e.data.normalize.min) / (e.data.normalize.max - e.data.normalize.min);
      e.data.gradient.getColor(val, c);
      imagedata.data[j++] = c.R * 255;
      imagedata.data[j++] = c.G * 255;
      imagedata.data[j++] = c.B * 255;
      imagedata.data[j++] = 255;
      sofar++;

      var p = (sofar * 100 / total)|0;
      if (p != last)
      {
        last = p;
        postMessage( { id: e.data.id, percent: p});
      }
    }
  }

  var ret;
  ret = { id: e.data.id, min: min, max: max, imagedata: imagedata };
  postMessage(ret);
}




