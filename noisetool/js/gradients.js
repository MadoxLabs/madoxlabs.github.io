function ntGradient()
{
  this.name = "";
  this.Points = [];
}

ntGradient.prototype.getColor = function(p)
{
  var a = null;
  var b = null;

  // find the 2 points we are between
  for (var gg in this.Points)
  {
    var g = this.Points[gg];
    // if exactly a point return it
    if (p == g.Point) return g.color; 
    if (g.Point < p)
    {
      // candidate for point a
      if (a == null || (p - a.Point > p - g.Point)) a = g;
    } 
    else
    {
      // candidate for point b
      if (b == null || (b.Point - p > g.Point - p)) b = g;
    }
  }
  // off the deep end?
  if (a == null && b == null) return {R: 0, G: 0, B: 0 };
  if (a == null) return b.color;
  if (b == null) return a.color;

  // lerp that shit
  var ratio = (p - a.Point) / (b.Point - a.Point);
  var c = {R: 0, G: 0, B: 0 };
  c.R = (a.color.R * (1 - ratio) + b.color.R * ratio);
  c.G = (a.color.G * (1 - ratio) + b.color.G * ratio);
  c.B = (a.color.B * (1 - ratio) + b.color.B * ratio);
  return c;
}

function ntGradients()
{
  this.gradients = {};

  var def = new ntGradient();
  def.name = "Default";
  def.Points.push({ Point: -1.0, color: { R: 0, G: 0, B: 0 } });
  def.Points.push({ Point: 1.0, color: { R: 1, G: 1, B: 1 } });

  this.gradients[def.name] = def;
  this.current = def;
}

ntGradients.prototype.getGradient = function (name)
{
  return this.gradients[name];
}

ntGradients.prototype.setCurrent = function (name)
{
  this.current = this.gradients[name];
}

ntGradients.prototype.showEditor = function()
{
  var w = document.createElement("div");
  var app = document.getElementById("app");
  w.setAttribute("id", "editor");
  w.setAttribute("class", "editor");
  w.style.zIndex = z++;
  w.style.left = (app.offsetWidth * 0.5 - 150 ) + "px";
  w.style.top = (app.offsetHeight * 0.5 + 150) + "px";
  var buf = "<center>Gradient Manager</center>";
  buf += "<select class=\"editorlist\" id=\"editorlist\"></select><button>New</button><br>";
  buf += "Name: <input size=18><button>Add Point</button><br>";
  buf += "<input id=\"picker\" class=\"color {onImmediateChange:'updateInfo(this);'}\">";
  w.innerHTML = buf;
  app.appendChild(w);

  // close
  var c = document.createElement("div");
  c.setAttribute("class", "glyphicon glyphicon-remove-circle lightup");
  c.style.position = "absolute";
  c.style.top = "0px";
  c.style.right = "0px";
  c.addEventListener('mousedown', function (e) { windowClose(e, w); }, false);
  w.appendChild(c);
  w.ntClose = c;

  var list = document.getElementById("editorlist");
  for (g in this.gradients)
    list.options[list.options.length] = new Option(this.gradients[g].name, this.gradients[g].name);

  jscolor.init();

  var picker = document.getElementById("picker");
  picker.color.fromRGB(0.8, 1, 0.2);
}

function updateInfo(color)
{
  console.log(color.rgb[0]);
  console.log(color.rgb[1]);
  console.log(color.rgb[2]);
}