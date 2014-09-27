var svgNS = "http://www.w3.org/2000/svg";
var id = 1;
var point1 = null;
var point2 = null;
var line = null;

document.getElementById("mySVG").onclick = function (e)
{
  e = e || window.event;

  if (point1)
  {
    if (line)
    {
      document.getElementById("mySVG").removeChild(line);
      point1 = null;
      point2 = null;
      line = null;
    }
    return;
  }
};

function getPos(el)
{
  for (var lx = 0, ly = 0; el != null; lx += el.offsetLeft, ly += el.offsetTop, el = el.offsetParent);
  return { x: lx, y: ly-34+12 };
}

document.onmousemove = function (e)
{
  if (moving) { windowMove(e); return; }
  if (sizing) { windowSize(e); return; }
  if (!point1) return;

  e = e || window.event;

  if (!line)
  {
    var myid = id++;
    var pos = getPos(point1);
    line = document.createElementNS(svgNS, "line");
    line.setAttributeNS(null, "id", "line" + id);
    line.setAttributeNS(null, "x1", pos.x+20);
    line.setAttributeNS(null, "y1", pos.y);
    line.setAttributeNS(null, "x2", pos.x + 20);
    line.setAttributeNS(null, "y2", pos.y);
    line.setAttributeNS(null, "stroke", "blue");
    document.getElementById("mySVG").appendChild(line);
  }
  else
  {
    line.setAttribute("x2", e.pageX - 1);
    line.setAttribute("y2", e.pageY - 34);
  }
};

var i = 1;
var z = 20;
function newWindow()
{
  // create div with canvas and widgets in it
  // make it click draggable
  // make it zorder
  // make it resize

  var w = document.createElement("div");
  w.setAttribute("id", "window" + i);
  w.setAttribute("class", "noisewindow");
  w.style.zIndex = z++;
  w.innerHTML = "\
  <li class=\"nav dropdown\">\
  <button type=\"button\" class=\"dropdown-toggle\" data-toggle=\"dropdown\"> Type: <span class=\"caret\"></span></button>\
  <ul class=\"dropdown-menu\" role=\"menu\">\
    <li><a href=\"#\" onclick=\"document.getElementById('windowname" + i + "').innerText='Billow';\">Billow</a></li>\
    <li><a href=\"#\" onclick=\"document.getElementById('windowname" + i + "').innerText='Checkerboard';\">Checkerboard</a></li>\
    <li><a href=\"#\" onclick=\"document.getElementById('windowname" + i + "').innerText='Constant';\">Constant</a></li>\
  </ul></li>";
  w.addEventListener('mousedown', function (e) { windowPress(e, w); }, false);
  document.getElementById("app").appendChild(w);

  var n = document.createElement("div");
  n.setAttribute("id", "windowname" + i);
  n.style.position = "absolute";
  n.style.top = "3px";
  n.style.left = "70px";
  n.innerText = "None";
  w.appendChild(n);
  w.ntName = n;

  var t = document.createElement("div");
  t.setAttribute("class", "glyphicon glyphicon-signal lightup");
  t.style.position = "absolute";
  t.style.top = "178px";
  t.style.right = "0px";
  t.addEventListener('mousedown', function (e) { windowStartSize(e, w); }, false);
  w.appendChild(t);
  w.ntThumb = t;

  var c = document.createElement("div");
  c.setAttribute("class", "glyphicon glyphicon-remove-circle lightup");
  c.style.position = "absolute";
  c.style.top = "0px";
  c.style.right = "0px";
  c.addEventListener('mousedown', function (e) { windowClose(e, w); }, false);
  w.appendChild(c);
  w.ntClose = c;

  var input = document.createElement("div");
  input.setAttribute("class", "glyphicon glyphicon-record lightup");
  input.style.position = "absolute";
  input.style.top = "100px";
  input.style.left = "00px";
  w.appendChild(input);
  input.addEventListener('mousedown', function (e) { windowStopLine(e, w); }, false);
  w.ntIn = input;

  var output = document.createElement("div");
  output.setAttribute("class", "glyphicon glyphicon-record lightup");
  output.style.position = "absolute";
  output.style.top = "100px";
  output.style.right = "0px";
  output.addEventListener('mousedown', function (e) { windowStartLine(e, w); }, false);
  w.appendChild(output);
  w.ntOut = output;

  i += 1;
}

var moving = null;
var sizing = null;
var lastx = 0;
var lasty = 0;
function windowClose(e, w)
{
  document.getElementById("app").removeChild(w);
}

function windowStartSize(e,w)
{
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
  moving.style.left = moving.offsetLeft + (e.pageX - lastx) + "px";
  moving.style.top = moving.offsetTop + (e.pageY - lasty) + "px";
  lastx = e.pageX;
  lasty = e.pageY;
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
  sizing.ntIn.style.top  = (newY*0.5) + "px";
  sizing.ntOut.style.top = (newY*0.5) + "px";
}

function windowStartLine(e, w)
{
  e.cancelBubble = true;
  if (e.stopPropagation) e.stopPropagation();
  point1 = w.ntOut;
}

function windowStopLine(e, w)
{
  e.cancelBubble = true;
  if (e.stopPropagation) e.stopPropagation();
  point2 = w.ntIn;
 
  var pos = getPos(point2);
  line.setAttribute("x2", pos.x);
  line.setAttribute("y2", pos.y);
  point1 = null;
  point2 = null;
  line = null;
}
