function Mouse(obj)
{
  this.active = false;
  this.down = false;
  this.grabbed = false;
  this.pendingout = false;

  this.toss = 0;
  this.surface = obj;
  var mouseObj = this;

  document.addEventListener('pointerlockchange', function () { mouseObj.pointerLockChange(); }, false);
  document.addEventListener('mozpointerlockchange', function () { mouseObj.pointerLockChange(); }, false);
  document.addEventListener('webkitpointerlockchange', function () { mouseObj.pointerLockChange(); }, false);
  document.addEventListener('pointerlockerror', function () { mouseObj.pointerLockError(); }, false);
  document.addEventListener('mozpointerlockerror', function () { mouseObj.pointerLockError(); }, false);
  document.addEventListener('webkitpointerlockerror', function () { mouseObj.pointerLockError(); }, false);

  document.exitPointerLock = document.exitPointerLock || document.mozExitPointerLock || document.webkitExitPointerLock;
  obj.requestPointerLock = obj.requestPointerLock || obj.mozRequestPointerLock || obj.webkitRequestPointerLock;

  obj.onmouseover = function (event) { mouseObj.mouseOver(event); };
  obj.onmouseout = function (event) { mouseObj.mouseOut(event); };
  obj.onmousemove = function (event) { mouseObj.mouseMove(event); };
  obj.onmouseup = function (event) { mouseObj.mouseUp(event); };
  obj.onmousedown = function (event) { mouseObj.mouseDown(event); };

  obj.onclick = function (e) { e.preventDefault(); }
  obj.oncontextmenu = function (e) { e.preventDefault(); }
}

var MouseEvent = { 'Down': 0, 'Up': 1, 'Move': 2, 'In': 3, 'Out': 4, 'Grab': 5, 'Release': 6, 'NoGrab': 7 };

Mouse.prototype.grab = function()
{
  console.log("grab");
  if (!this.active) return;
  this.surface.requestPointerLock();
}

Mouse.prototype.release = function ()
{
  console.log("release");
  document.exitPointerLock();
}

Mouse.prototype.pointerLockChange = function ()
{
  if (document.mozPointerLockElement === this.surface || document.webkitPointerLockElement === this.surface)
  {
    this.grabbed = true;
    this.toss = 1;
    this.lastMoveX = 0;
    this.lastMoveY = 0;
    this.X = 0;
    this.Y = 0;
    Game.handleMouseEvent(MouseEvent.Grab, this);
  }
  else
  {
    this.toss = 2;
    this.grabbed = false;
    Game.handleMouseEvent(MouseEvent.Release, this);
  }
}

Mouse.prototype.pointerLockError = function()
{
  this.grabbed = false;
  Game.handleMouseEvent(MouseEvent.NoGrab, this);
}

// normal mouse mode tracks the following:
//   X, Y - current mouse loc
//   lastDownX,Y - the loc of the mouse recent down event
//   lastMoveX,Y - the loc of the mouse prev move event
//   moveOffsetX,Y - the change in mouse position from last move event
//   button - button most recently pressed
// grabbed mouse mode will only track:
//   moveOffsetX,Y - the change in mouse position from last move event
//   button - button most recently pressed

Mouse.prototype.mouseDown = function(event)
{
  if (!this.active) return;
  this.button = event.button;
  this.down = true;
  if (!this.grabbed)
  {
    this.lastDownX = event.pageX;
    this.lastDownY = event.pageY;
    this.X = event.pageX;
    this.Y = event.pageY;
  }
  Game.handleMouseEvent(MouseEvent.Down, this);
}

Mouse.prototype.mouseUp = function (event)
{
  if (!this.active) return;
  this.button = event.button;
  if (!this.grabbed)
  {
    this.X = event.pageX;
    this.Y = event.pageY;
  }
  this.down = false;
  Game.handleMouseEvent(MouseEvent.Up, this);
  if (this.pendingout == true)
  {
    if (this.grabbed) this.release();
    this.out = true;
    Game.handleMouseEvent(MouseEvent.Out, this);
  }
  this.pendingout = false;
}

Mouse.prototype.mouseOver = function (event)
{
  this.active = true;
  Game.handleMouseEvent(MouseEvent.In, this);
}

Mouse.prototype.mouseOut = function (event)
{
  if (this.down) this.pendingout = true;
  else
  {
    if (this.grabbed) this.release();
    this.active = false;
    Game.handleMouseEvent(MouseEvent.Out, this);
  }
}

Mouse.prototype.mouseMove = function(event)
{
  if (!this.active) return;

  if (this.grabbed)
  {
    if (this.toss) { this.toss -= 1; return; }
    this.moveOffsetX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
    this.moveOffsetY = event.movementY || event.mozMovementY || event.webkitMovementY || 0;
  }
  else
  {
    this.lastMoveX = this.X;
    this.lastMoveY = this.Y;
    this.X = event.pageX;
    this.Y = event.pageY;
    if (this.toss)
    {
      this.toss -= 1; return;
    }
    this.moveOffsetX = this.X - this.lastMoveX;
    this.moveOffsetY = this.Y - this.lastMoveY;
  }

  if (!this.moveOffsetX && !this.moveOffsetY) return;
  Game.handleMouseEvent(MouseEvent.Move, this);
}


// mouse
// given a element
// - when mouse out, stop reporting events
// - track mouse up/down - left only
// - track wheel deltas
// - track mouse move - since last move, since last down
// - track mouse pos
