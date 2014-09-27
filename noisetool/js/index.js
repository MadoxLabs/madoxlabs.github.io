var svgNS = "http://www.w3.org/2000/svg";
var id = 1;
var point1 = null;
var point2 = null;
var line = null;
var skip = false;

document.getElementById("mySVG").onclick = function (e)
{
  if (skip) { skip = false; return; }

  e = e || window.event;

  if (point1)
  {
    if (line)
    {
      if (point2)
      {
        line.setAttribute("x2", point2.getAttribute("cx"));
        line.setAttribute("y2", point2.getAttribute("cy"));
      } else
      {
        document.getElementById("mySVG").removeChild(line);
      }
      point1 = null;
      point2 = null;
      line = null;
    }
    return;
  }


  var myid = id++;
  var myCircle = document.createElementNS(svgNS, "circle"); //to create a circle. for rectangle use "rectangle"
  myCircle.setAttributeNS(null, "id", "circle" + myid);
  myCircle.setAttributeNS(null, "cx", e.offsetX);
  myCircle.setAttributeNS(null, "cy", e.offsetY);
  myCircle.setAttributeNS(null, "r", 5);
  myCircle.setAttributeNS(null, "fill", "black");
  myCircle.setAttributeNS(null, "stroke", "black");
  document.getElementById("mySVG").appendChild(myCircle);
  document.getElementById("circle" + myid).addEventListener('click',
                                                          function (event)
                                                          {
                                                            if (point1) point2 = document.getElementById("circle" + myid);
                                                            else point1 = document.getElementById("circle" + myid);
                                                          }, false);
  document.getElementById("circle" + myid).addEventListener('mouseover',
                                                          function (event)
                                                          {
                                                            document.getElementById("circle" + myid).setAttribute("fill", "green");                                                            
                                                          }, false);
  document.getElementById("circle" + myid).addEventListener('mouseout',
                                                          function (event)
                                                          {
                                                            document.getElementById("circle" + myid).setAttribute("fill", "black");                                                            
                                                          }, false);
};

document.onmousemove = function (e)
{
  if (moving) { windowMove(e); return; }
  if (!point1) return;

  e = e || window.event;

  if (!line)
  {
    var myid = id++;
    line = document.createElementNS(svgNS, "line");
    line.setAttributeNS(null, "id", "line" + id);
    line.setAttributeNS(null, "x1", point1.getAttribute("cx"));
    line.setAttributeNS(null, "y1", point1.getAttribute("cy"));
    line.setAttributeNS(null, "x2", point1.getAttribute("cx"));
    line.setAttributeNS(null, "y2", point1.getAttribute("cy"));
    line.setAttributeNS(null, "stroke", "blue");
    document.getElementById("mySVG").appendChild(line);
  }
  else
  {
    line.setAttribute("x2", e.offsetX - 1);
    line.setAttribute("y2", e.offsetY - 1);
  }
};

var i = 1;
function newWindow()
{
  // create div with canvas and widgets in it
  // make it click draggable
  // make it zorder
  // make it resize

  var w = document.createElement("div");
  w.setAttribute("id", "window" + i);
  w.style.border = "4px solid black"
  w.style.position = "absolute";
  w.style.width  = "300px";
  w.style.height = "200px";
  w.style.left   = "100px";
  w.style.top    = "100px";
  w.innerHTML = "\
  <li class=\"nav dropdown\">\
  <button type=\"button\" class=\"dropdown-toggle\" data-toggle=\"dropdown\"> Action <span class=\"caret\"></span></button>\
  <ul class=\"dropdown-menu\" role=\"menu\">\
    <li><a href=\"#\">Action</a></li>\
    <li><a href=\"#\">Another action</a></li>\
    <li><a href=\"#\">Something else here</a></li>\
  </ul></li>\
\
Module #" + i;
  w.onmousedown = function (e) { windowPress(e, w); }
  document.getElementById("app").appendChild(w);
  i += 1;
}

var moving = null;
var lastx = 0;
var lasty = 0;
function windowPress(e, w)
{
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
}

function windowMove(e)
{
  e = e || window.event;
  moving.style.left = moving.offsetLeft + (e.pageX - lastx) + "px";
  moving.style.top = moving.offsetTop + (e.pageY - lasty) + "px";
  lastx = e.pageX;
  lasty = e.pageY;
}