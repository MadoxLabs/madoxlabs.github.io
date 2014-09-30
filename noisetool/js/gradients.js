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

function toHex(n)
{
  n = parseInt(n*255, 10);
  if (isNaN(n)) return "00";
  n = Math.max(0, Math.min(n, 255));
  return "0123456789ABCDEF".charAt((n - n % 16) / 16)
       + "0123456789ABCDEF".charAt(n % 16);
}

ntGradient.prototype.getHexFor = function(p)
{
  return toHex(this.Points[p].color.R) + toHex(this.Points[p].color.G) + toHex(this.Points[p].color.B);
}

function ntGradients()
{
  this.gradients = {};

  this.gradientNew("Default");
  this.setCurrent("Default");
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
  buf += "<table border=1><tr><td colspan=2>"
  buf += "<select class=\"editorlist\" id=\"editorlist\"></select><button onclick=\"gradients.gradientNew();\">New</button><br>";
  buf += "Name: <input  id=\"editorname\" size=18><button onclick=\"gradients.pointNew();\">Add Point</button>";
  buf += "</td></tr><tr><td>"
  buf += "<div id=\"editorpoints\" class=\"editorpoints\"></div>";
  buf += "</td><td> <div class=\"editorgrad\"><canvas id=\"editorgrad\" height=200 width=20></div> </td></tr></table>";
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
  
  this.showGradient("Default");
}

ntGradients.prototype.gradientNew = function (name)
{
  var def = new ntGradient();

  var size = 0;
  for (var key in this.gradients) if (this.gradients.hasOwnProperty(key)) size++;

  if (!name) def.name = "Gradient " + size;
  else def.name = name;
  def.Points.push({ Point: -1.0, color: { R: 0, G: 0, B: 0 } });
  def.Points.push({ Point: 1.0, color: { R: 1, G: 1, B: 1 } });
  this.gradients[def.name] = def;

  var list = document.getElementById("editorlist");
  if (list)
  {
    list.options[list.options.length] = new Option(def.name, def.name);
    this.showGradient(def.name);
  }
}

ntGradients.prototype.pointNew = function (name)
{
  if (!this.showing) return;
  this.showing.Points.push({ Point: this.showing.Points.length, color: { R: Math.random(), G: Math.random(), B: Math.random() } });
  this.showGradient(this.showing.name);
}

ntGradients.prototype.showGradient = function(name)
{
  this.showing = this.gradients[name];
  document.getElementById("editorname").value = this.showing.name;
  var buf = "";
  for (var p in this.showing.Points)
    buf += "<div class=\"glyphicon glyphicon-remove-circle lightup\"></div><input id=\"ev" + p + "\" size=1 value=\"" + this.showing.Points[p].Point + "\"><input id=\"ec" + p + "\" class=\"color {onImmediateChange:'updateInfo(this);'}\" value=\"" + this.showing.getHexFor(p) + "\"><br>";
  document.getElementById("editorpoints").innerHTML = buf;
  jscolor.init();
}

function updateInfo(color)
{
  console.log(color.rgb[0]);
  console.log(color.rgb[1]);
  console.log(color.rgb[2]);
}