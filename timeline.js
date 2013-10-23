///////////////
// Game object is a singleton that represents the app itself.
///////////////
var Game = {};

var markerHeaderHeight = 15;
var markerHeaderColor = "#F5F5DC"
var markerColor = "#00FF00"
var lineHeaderHeight = 15;
var lineHeaderColor = "#F5F5DC"
var lineColor = "#0000FF"
var lineSeparation = 50;

Game.init = function () {
  this.maxResize = 0;
  this.move = false;
  this.moveMarker = false;
  this.moveMarkerId = 0;
  this.moveObject = false;
  this.sizeObject = false;
  this.moveObjectId = 0;
  this.skipClick = false;

  this.offset = 0;   // left/right scroll state
  this.zoom = 1;     // zoom factor
  this.lines = 1;
  this.objects = [];
  this.markers = [];
  this.surface = document.getElementById('surface');
  this.surface.addEventListener("click", onClick, false);
  this.surface.addEventListener("mousedown", onMouseDown, false);
  this.surface.addEventListener("mouseup", onMouseUp, false);
  this.surface.addEventListener("mouseout", onMouseOut, false);
  this.surface.addEventListener("mousemove", onMouseMove, false);
  this.context = this.surface.getContext('2d');
}

Game.stdout = function (text) {
  document.getElementById('stdout').innerHTML = text;
  console.log(text);
}

Game.run = function () {
  var d = new Date();
  Game.time = d.getTime();

  Game.update();
  d = new Date();
  var updateTime = d.getTime() - Game.time;

  Game.draw();
  d = new Date();
  var drawTime = d.getTime() - Game.time;

  var idleTime = 17 - updateTime - drawTime;

  Game.context.font = "bold 8px Arial";
  Game.context.fillStyle = "#ffffff";
  if (idleTime < 0) { idleTime = 0; Game.context.fillStyle = "#ff0000"; }
  var perFrame = idleTime + drawTime + updateTime;

  Game.context.fillText("FPS: " + ((1000 / perFrame) | 0) + "  Each frame: " + perFrame + " ms", lineHeaderHeight, 600 - 30);
  Game.context.fillText("Frame Time: Update: " + updateTime + "ms  Draw: " + drawTime + "ms  Idle: " + idleTime + "ms", lineHeaderHeight, 600 - 20);
  updateTime = (updateTime / perFrame * 100) | 0;
  drawTime = (drawTime / perFrame * 100) | 0;
  idleTime = (idleTime / perFrame * 100) | 0;
  Game.context.fillText("Frame Time: Update: " + updateTime + "%  Draw: " + drawTime + "%  Idle: " + idleTime + "%", lineHeaderHeight, 600 - 10);
}

Game.update = function () {
}

Game.draw = function () {
  // clear to black
  Game.context.fillStyle = "black";
  Game.context.fillRect(0, 0, 800, 600);
  Game.context.lineWidth = 1;

  // draw the marker creation header
  Game.context.strokeStyle = markerHeaderColor;
  Game.context.fillStyle = markerHeaderColor;
  Game.context.fillRect(0, 0, 800, markerHeaderHeight);

  if (Game.moveMarker == false && Game.moveObject == false && Game.move == false) {
    // Draw ghost marker
    if (Game.mouseY < markerHeaderHeight && hitObjectCol(Game.mouseX) == false) {
      var m = Game.mouseX;
      var rgb = "rgba(0,255,0,0.5)";
      Game.context.strokeStyle = rgb;
      Game.context.fillStyle = rgb;
      Game.context.fillRect(m/Game.zoom - 3, 5, 6, 10);
      Game.context.fillRect(m / Game.zoom, 5, 1, 600);
    }

    // Draw ghost object
    if (hitObject(Game.mouseX, Game.mouseY) == false && hitMarkerRange(Game.mouseX, 30) == false) {
      // closest line that is 10 away
      var y = 0;
      for (var i = 0; i < Game.lines; ++i) {
        if (Math.abs(Game.mouseY - (lineSeparation * (i + 1))) < 20) { y = lineSeparation * (i + 1); break; }
      }
      if (y > 0) {
        // draw initial size obj
        var rgb = "rgba(255,0,0,0.5)";
        Game.context.strokeStyle = rgb;
        Game.context.fillStyle = rgb;
        roundRect(Game.context, Game.mouseX / Game.zoom, (y - 10) / Game.zoom, 30 / Game.zoom, 20 / Game.zoom, 10 / Game.zoom, true, true);
      }
    }
  }

  // Draw Lines
  for (var i = 0; i < Game.lines; ++i) {
    var loc = lineSeparation * (i + 1);
    Game.context.strokeStyle = lineColor;
    Game.context.fillStyle = lineColor;
    Game.context.fillRect(5, loc / Game.zoom, 800, 1);
  }

  // Draw object
  {
    for (var i in Game.objects) {
      var o = Game.objects[i];
      if (o.delete) continue;
      var rgb = "rgb(255,0,0)";
      Game.context.strokeStyle = rgb;
      Game.context.fillStyle = rgb;
      roundRect(Game.context, (Game.offset + o.loc) / Game.zoom, ((o.line * lineSeparation) - 10) / Game.zoom, o.width / Game.zoom, 20 / Game.zoom, 10 / Game.zoom, true, true);
    }
  }

  // draw the line creation header
  Game.context.strokeStyle = lineHeaderColor;
  Game.context.fillStyle = lineHeaderColor;
  Game.context.fillRect(0, markerHeaderHeight, lineHeaderHeight, 600);

  // Draw Line thumbs
  for (var i = 0; i < Game.lines; ++i) {
    var loc = lineSeparation * (i + 1);
    Game.context.strokeStyle = lineColor;
    Game.context.fillStyle = lineColor;
    Game.context.fillRect(5, loc / Game.zoom - 3, 10, 6);
  }

  // Draw Markers
  for (var i in Game.markers) {
    var m = Game.markers[i];
    if (m.delete) continue;
    Game.context.strokeStyle = markerColor;
    Game.context.fillStyle = markerColor;
    Game.context.fillRect((Game.offset + m.loc)/Game.zoom - 3, 5, 6, 10);
    Game.context.fillRect((Game.offset + m.loc)/Game.zoom, 5, 1, 600);
  }
}

function hitMarker(x) {
  x = x - Game.offset;
  for (i in Game.markers) {
    if (Game.markers[i].delete) continue;

    var loc = Game.markers[i].loc;
    if (Math.abs(loc - x) <= 3) {
      Game.moveMarkerId = i;
      return true;
    }
  }
  return false;
}

function hitMarkerRange(x, w) {
  x = x - Game.offset;
  for (i in Game.markers) {
    if (Game.markers[i].delete) continue;

    var loc = Game.markers[i].loc;
    if (loc > x && loc < x + w) {
      return true;
    }
  }
  return false;
}

function hitObject(x, y, self) {
  x = x - Game.offset;
  for (i in Game.objects) {
    if (self !== undefined && i == self) continue;
    if (Game.objects[i].delete) continue;

    var o = Game.objects[i];
    if ((x < o.loc + o.width) && (x > o.loc) && (Math.abs(o.line * lineSeparation - y) < 10)) {
      if (self === undefined) Game.moveObjectId = i;
      return true;
    }
  }
  return false;
}

function hitObjectRange(x, y, w, self) {
  x = x - Game.offset;
  for (i in Game.objects) {
    if (self !== undefined && i == self) continue;
    if (Game.objects[i].delete) continue;

    var o = Game.objects[i];
    if (Math.abs(o.line * lineSeparation - y) >= 10) continue; // different lines
    if (o.loc < x && o.loc + o.width < x) continue;  // entirely to the left
    if (o.loc > x + w && o.loc + o.width > x + w) continue;  // entirely to the right
    return true;
  }
  return false;
}

function hitObjectCol(x, self) {
  x = x - Game.offset;
  for (i in Game.objects) {
    if (self !== undefined && i == self) continue;
    if (Game.objects[i].delete) continue;

    var o = Game.objects[i];
    if (x < (o.loc + o.width) && (x > o.loc)) {
      return true;
    }
  }
  return false;
}

function roundRect(ctx, x, y, width, height, radius, fill, stroke) {
  if (typeof stroke == "undefined") {
    stroke = true;
  }
  if (typeof radius === "undefined") {
    radius = 5;
  }
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
  if (stroke) {
    ctx.stroke();
  }
  if (fill) {
    ctx.fill();
  }
}

///////////////
// Event Handlers
///////////////
function onClick(ev) {
  if (Game.skipClick) { Game.skipClick = false; return; }

  var x = (ev.clientX - Game.surface.offsetLeft) * Game.zoom;
  var y = (ev.clientY - Game.surface.offsetTop) * Game.zoom;

  // find closest line that is 10 away for later
  var line = 0;
  for (var i = 0; i < Game.lines; ++i) if (Math.abs(Game.mouseY - (lineSeparation * (i + 1))) < 20) { line = i + 1; break; }

  if (hitMarker(x)) { return; }

  else if (y < markerHeaderHeight && hitObjectCol(x) == false) {
    var marker = { loc: x - Game.offset, delete: false };
    Game.markers.push(marker);
    Game.markers.sort(function (a, b) { return a.loc - b.loc });
  }

  else if (x < lineHeaderHeight) Game.lines++;

  else if (line > 0 && hitMarkerRange(x, 30) == false) {
    var obj = { line: line, loc: x - Game.offset, width: 30 };
    Game.objects.push(obj);
    Game.objects.sort(function (a, b) { return a.loc - b.loc });
  }
}

function onMouseDown(ev)
{
  Game.moveX = (ev.clientX - Game.surface.offsetLeft) * Game.zoom;
  Game.moveY = (ev.clientY - Game.surface.offsetTop) * Game.zoom;

  if (hitMarker(Game.moveX)) {
    Game.moveMarker = true;
    return;
  }
  else if (hitObject(Game.moveX, Game.moveY)) {
    Game.moveObject = true;
    Game.moveOffset = Game.objects[Game.moveObjectId].loc - Game.moveX + Game.offset;
    if (Game.moveOffset + Game.objects[Game.moveObjectId].width < 5) { Game.sizeObject = true; }
    Game.maxResize = 0;
    return;
  }
  else
  {
    Game.move = true;
    Game.startZoom = Game.zoom;
    Game.startOffset = Game.offset;
  }
}

function onMouseUp(ev) {
  if (Game.moveMarker || Game.moveObject || Game.zoom != Game.startZoom || Game.offset != Game.startOffset)
    Game.skipClick = true;
  Game.moveMarker = false;
  Game.moveObject = false;
  Game.sizeObject = false;
  Game.move = false;
  Game.maxResize = 0;
}

function onMouseOut(ev) {
  Game.moveMarker = false;
  Game.moveObject = false;
  Game.sizeObject = false;
  Game.move = false;
  Game.maxResize = 0;
}

function onMouseMove(ev) {
  Game.mouseX = (ev.clientX - Game.surface.offsetLeft ) * Game.zoom;
  Game.mouseY = (ev.clientY - Game.surface.offsetTop) * Game.zoom;

  if (Game.moveMarker) {
    // if going left, stop at prev marker or object
    if (hitMarker(Game.mouseX) || hitObjectCol(Game.mouseX))
      ;  // ignore this case
    else
      Game.markers[Game.moveMarkerId].loc = Game.mouseX - Game.offset;
    Game.markers[Game.moveMarkerId].delete = (Game.mouseY > markerHeaderHeight + 10 ? true : false)
  }
  else if (Game.moveObject) {
    if (Game.sizeObject) {
      var pos = Game.objects[Game.moveObjectId].loc + Game.objects[Game.moveObjectId].width + (Game.mouseX - Game.moveX) + Game.offset;
      if (Game.maxResize && pos >= Game.maxResize) return;
      if (hitMarker(pos) == false
          && hitObject(pos, Game.objects[Game.moveObjectId].line * lineSeparation, Game.moveObjectId) == false) {
        Game.objects[Game.moveObjectId].width += Game.mouseX - Game.moveX;
        if (Game.objects[Game.moveObjectId].width < 20) Game.objects[Game.moveObjectId].width = 20;
        else Game.moveX = Game.mouseX;
      }
      else
        Game.maxResize = pos;

    }
    else {
      var o = Game.objects[Game.moveObjectId];
      if (hitMarkerRange(Game.mouseX + Game.moveOffset, o.width) == false
          && hitObjectRange(Game.mouseX + Game.moveOffset, o.line * lineSeparation, o.width, Game.moveObjectId) == false)
        Game.objects[Game.moveObjectId].loc = Game.mouseX + Game.moveOffset - Game.offset;

      var line = 0;
      for (var i = 0; i < Game.lines; ++i) if (Math.abs(Game.mouseY - (lineSeparation * (i + 1))) < 20) { line = i + 1; break; }

      Game.objects[Game.moveObjectId].delete = (line == 0 ? true : false);
      if (line > 0) {
        if (hitObjectRange(o.loc, line * lineSeparation, o.loc + o.width) == false)
          Game.objects[Game.moveObjectId].line = line;
      }
    }
  }
  else if (Game.move) {
    Game.offset += Game.mouseX - Game.moveX;
    Game.moveX = Game.mouseX;

    Game.zoom = Game.startZoom + ((Game.mouseY - Game.moveY) / Game.zoom) / 200;
    if (Game.zoom < 1) Game.zoom = 1;
//    if (Game.zoom > 3) Game.zoom = 3;
  }
}

///////////////
// Main
///////////////
function main() {
  Game.init();
  window.setInterval(Game.run, 17);
}