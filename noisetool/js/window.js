var svgNS = "http://www.w3.org/2000/svg";
var id = 1;
var point1 = null;
var point2 = null;
var line = null;

var factory;


document.getElementById("mySVG").onclick = function (e)
{
  cancelLine();
}

function cancelLine()
{
  if (point1 && line)
  {
    document.getElementById("mySVG").removeChild(line);
    point1 = null;
    point2 = null;
    line = null;
  }
};

function getPos(el)
{
  for (var lx = 0, ly = 0; el != null; lx += el.offsetLeft, ly += el.offsetTop, el = el.offsetParent);
  return { x: lx, y: ly-22 };
}

document.onmousemove = function (e)
{
  if (moving) { windowMove(e); return; }
  if (sizing) { windowSize(e); return; }

  e = e || window.event;

  if (line) {
    line.setAttribute("x2", e.pageX - 1);
    line.setAttribute("y2", e.pageY - 34);
  }
};

var i = 1;
var z = 20;
var types = [];
types[1] = ["Billow", "Checkerboard", "Constant", "Cylinders", "Gradient", "Perlin", "Ridged Multifractal", "Spheres", "Voronoi"];
types[2] = ["Turbulence", "Displace", "Invert Input", "Rotate", "Scale", "Translate"];
types[3] = ["Absolute", "Clamp", "Curve", "Exponent", "Invert", "ScaleBias", "Terrace", "Cache"];
types[4] = ["Add", "Max", "Min", "Multiply", "Power", "Blend", "Select"];
var points = [0.5, 0.2, 0.8, 0.65];
function newWindow(type)
{
  // create div with canvas and widgets in it
  // make it click draggable
  // make it zorder
  // make it resize

  if (i == 1) document.getElementById("app").removeChild(document.getElementById("title"));

  var w = document.createElement("div");
  w.setAttribute("id", "window" + i);
  w.setAttribute("class", "noisewindow");
  w.style.zIndex = z++;
  var buf = "\
  <li class=\"nav dropdown\">\
  <button type=\"button\" class=\"dropdown-toggle\" data-toggle=\"dropdown\"> Type: <span class=\"caret\"></span></button>\
  <ul class=\"dropdown-menu\" role=\"menu\">";
  for (var t in types[type])
    buf += "<li><a href=\"#\" onclick=\"setWindowType('window"+i+"', '" + types[type][t] + "');\">" + types[type][t] + "</a></li>";
  buf += "</ul></li>";
  w.innerHTML = buf;
  w.addEventListener('mousedown', function (e) { windowPress(e, w); }, false);
  document.getElementById("app").appendChild(w);

  var n = document.createElement("div");
  n.setAttribute("id", "window" + i+"name");
  n.style.position = "absolute";
  n.style.top = "3px";
  n.style.left = "70px";
  n.innerText = "None";
  w.appendChild(n);
  w.ntName = n;

  // drag thumb
  var t = document.createElement("div");
  t.setAttribute("class", "glyphicon glyphicon-signal lightup");
  t.style.position = "absolute";
  t.style.top = "178px";
  t.style.right = "0px";
  t.addEventListener('mousedown', function (e) { windowStartSize(e, w); }, false);
  w.appendChild(t);
  w.ntThumb = t;

  // close
  var c = document.createElement("div");
  c.setAttribute("class", "glyphicon glyphicon-remove-circle lightup");
  c.style.position = "absolute";
  c.style.top = "0px";
  c.style.right = "0px";
  c.addEventListener('mousedown', function (e) { windowClose(e, w); }, false);
  w.appendChild(c);
  w.ntClose = c;

  i += 1;
}

function setWindowType(name, type)
{
  var w = document.getElementById(name);
  document.getElementById(w.id + "name").innerText = type;

  w.ntModule = factory.getModule(type);
  if (!w.ntModule) return;

  // input - up to 4
  w.ntIn = [];
  for (var p = 0; p < w.ntModule.points; ++p)
  {
    var input = document.createElement("div");
    input.setAttribute("class", "glyphicon glyphicon-record lightup dropt");
    input.style.position = "absolute";
    input.style.top = (w.offsetHeight*points[p]) + "px";
    input.style.left = "0px";
    input.ntNum = p;
    input.innerHTML = "<span>" + w.ntModule.pointNames[p] + "</span>";
    w.appendChild(input);
    input.addEventListener('mousedown', function (e) { windowStopLine(e, w); }, false);
    w.ntIn.push(input);
  }

  // output
  var output = document.createElement("div");
  output.setAttribute("class", "glyphicon glyphicon-record lightup");
  output.style.position = "absolute";
  output.style.top = (w.offsetHeight*0.5) + "px";
  output.style.right = "0px";
  output.addEventListener('mousedown', function (e) { windowStartLine(e, w); }, false);
  w.appendChild(output);
  w.ntOut = output;
}

var moving = null;
var sizing = null;
var lastx = 0;
var lasty = 0;
function windowClose(e, w)
{
  // remove all w.ntOut, remove w.ntIn
  for (var p in w.ntIn)
    if (w.ntIn[p].ntLine)
    {
      var i = w.ntIn[p].ntLine.ntPoint1.ntLine.indexOf(w.ntIn[p].ntLine);
      if (i != -1) w.ntIn[p].ntLine.ntPoint1.ntLine.splice(i, 1);
      document.getElementById("mySVG").removeChild(w.ntIn[p].ntLine);
    }
  if (w.ntOut)
  {
    for (var i in w.ntOut.ntLine) {
      w.ntOut.ntLine[i].ntPoint2.ntLine = null;
      document.getElementById("mySVG").removeChild(w.ntOut.ntLine[i]);
    }
  }

  document.getElementById("app").removeChild(w);
}

function windowStartSize(e,w)
{
  cancelLine();
  e = e || window.event;
  e.cancelBubble = true;
  if (e.stopPropagation) e.stopPropagation();
  w.style.zIndex = z++;
  w.style.border = "4px solid red";
  sizing = w;
  lastx = e.pageX;
  lasty = e.pageY;
}

function windowPress(e, w)
{
  cancelLine();
  w.style.zIndex = z++;
  w.style.border = "4px solid green";
  moving = w;
  e = e || window.event;
  lastx = e.pageX;
  lasty = e.pageY;
}

document.onmouseup = function(e)
{
  if (moving) {
    moving.style.border = "4px solid black";
    moving = null;
  }
  if (sizing) {
    sizing.style.border = "4px solid black";
    sizing = null;
  }
}

function windowMove(e)
{
  e = e || window.event;
  var newX = moving.offsetLeft + (e.pageX - lastx);
  var newY = moving.offsetTop + (e.pageY - lasty);
  moving.style.left = newX + "px";
  moving.style.top = newY + "px";
  lastx = e.pageX;
  lasty = e.pageY;

  for (var i in moving.ntIn)
    if (moving.ntIn[i].ntLine)
    {
      moving.ntIn[i].ntLine.setAttribute("x2", newX);
      moving.ntIn[i].ntLine.setAttribute("y2", newY - 22 + moving.offsetHeight * points[i]);
    }
  if (moving.ntOut)
  {
    for (var i in moving.ntOut.ntLine) {
      var line = moving.ntOut.ntLine[i];
      line.setAttribute("x1", newX + moving.offsetWidth);
      line.setAttribute("y1", newY - 22 + moving.offsetHeight * 0.5);
    }
  }
}

function windowSize(e)
{
  e = e || window.event;

  var newX = sizing.offsetWidth + (e.pageX - lastx);
  var newY = sizing.offsetHeight + (e.pageY - lasty);
  if (newX < 100) newX = 100;
  if (newY < 100) newY = 100;
  sizing.style.width  = newX + "px";
  sizing.style.height = newY + "px";
  lastx = e.pageX;
  lasty = e.pageY;

  sizing.ntThumb.style.top = (newY - 20) + "px";
  for (var i in sizing.ntIn)
    sizing.ntIn[i].style.top = (newY * points[i]) + "px";
  if (sizing.ntOut) sizing.ntOut.style.top = (newY*0.5) + "px";

  for (var i in sizing.ntIn)
    if (sizing.ntIn[i].ntLine) {
      sizing.ntIn[i].ntLine.setAttribute("x2", sizing.offsetLeft);
      sizing.ntIn[i].ntLine.setAttribute("y2", sizing.offsetTop - 22 + newY * points[i]);
    }
  if (sizing.ntOut)
    for (var i in sizing.ntOut.ntLine)
    {
      var line = sizing.ntOut.ntLine[i];
      line.setAttribute("x1", sizing.offsetLeft + newX);
      line.setAttribute("y1", sizing.offsetTop - 22 + newY * 0.5);
    }
}

function windowStartLine(e, w)
{
  cancelLine();

  e.cancelBubble = true;
  if (e.stopPropagation) e.stopPropagation();
  point1 = w.ntOut;

  var myid = id++;
  var pos = getPos(point1);
  line = document.createElementNS(svgNS, "line");
  line.setAttributeNS(null, "id", "line" + id);
  line.setAttributeNS(null, "x1", pos.x + 20);
  line.setAttributeNS(null, "y1", pos.y);
  line.setAttributeNS(null, "x2", pos.x + 20);
  line.setAttributeNS(null, "y2", pos.y);
  line.setAttributeNS(null, "stroke", "yellow");
  line.setAttributeNS(null, "stroke-width", 4);
  document.getElementById("mySVG").appendChild(line);

  if (!point1.ntLine) point1.ntLine = [];
  point1.ntLine.push(line);
  line.ntPoint1 = point1;
}

function windowStopLine(e, w)
{
  e.cancelBubble = true;
  if (e.stopPropagation) e.stopPropagation();
  point2 = e.currentTarget;
 
  if (point2.ntLine) {
    var i =  point2.ntLine.ntPoint1.ntLine.indexOf(point2.ntLine);
    if (i != -1) point2.ntLine.ntPoint1.ntLine.splice(i, 1);
//    point2.ntLine.ntPoint1.ntLine.delete(point2.ntLine);
    document.getElementById("mySVG").removeChild(point2.ntLine);
    point2.ntLine = null;
  }

  if (!line) return;
  var pos = getPos(point2);
  line.setAttribute("x2", pos.x);
  line.setAttribute("y2", pos.y);
  point2.ntLine = line;
  line.ntPoint2 = point2;
  point1 = null;
  point2 = null;
  line = null;
}
