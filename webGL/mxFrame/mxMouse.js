function Mouse(obj)
{
  this.active = false;
  this.down = false;
  obj.onmouseover = this.mouseOver;
  obj.onmouseout = this.mouseOut;
  obj.onmousemove = this.mouseMove;
  obj.onmouseup = this.mouseDown;
  obj.onmousedown = this.mouseUp;
  obj.onclick = function (e) { e.preventDefault(); }
  obj.oncontextmenu = function (e) { e.preventDefault(); }
}

var MouseEvent = { 'LeftDown': 0, 'LeftUp': 1, 'Move': 2 };

Mouse.prototype.mouseDown = function(event)
{
  if (!this.active) return;
  if (event.button == 0)
  {
    this.down = true;
    this.lastDownX = event.pageX;
    this.lastDownY = event.pageY;
  }
  Game.handleMouseEvent(MouseEvent.LeftDown, this);
}

Mouse.prototype.mouseUp = function (event)
{
  if (!this.active) return;
  this.down = false;
  Game.handleMouseEvent(MouseEvent.LeftUp, this);
}

Mouse.prototype.mouseOver = function (event)
{
  this.active = true;
}

Mouse.prototype.mouseOut = function (event)
{
  this.active = false;
}

Mouse.prototype.mouseMove = function(event)
{
  if (!this.active) return;
  this.lastMoveX = this.X;
  this.lastMoveY = this.Y;
  if (this.down == true)
  {
    this.downX = event.pageX - this.lastDownX;
    this.downY = event.pageY - this.lastDownY;
  }
  else
  {
    this.downX = 0;
    this.downY = 0;
  }
  this.moveX = event.pageX - this.lastMoveX;
  this.moveY = event.pageY - this.lastMoveY;
  this.X = event.pageX;
  this.Y = event.pageY;

  Game.handleMouseEvent(MouseEvent.Move, this);
}


// mouse
// given a element
// - when mouse out, stop reporting events
// - track mouse up/down - left only
// - track wheel deltas
// - track mouse move - since last move, since last down
// - track mouse pos
