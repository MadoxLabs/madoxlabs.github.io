// camera can be in:
//   free mode - camera has position and orientation
//   offset target mode - camera only has offset, using a target object as reference. Has orientation
//                      - act like on a string, user can still make slight adjustments like Z axis
//   free target mode - camera has position and orientation but always faces target object
//                    - set which axis to lock, x or y or none

var CAMERA_LEFTEYE = 1;
var CAMERA_RIGHTEYE = 2;
var CAMERA_MAIN = 3;

function CameraEye(c, t)
{
  this.camera = c;
  this.type = t;
  this.viewport = vec4.create();
  this.view = mat4.create();
  this.projection = mat4.create();

  this.uniforms = {};
  this.uniforms.camera = c.position;
  this.uniforms.view = this.view;
  this.uniforms.projection = this.projection;

  this.handleSizeChange();
}

CameraEye.prototype.handleSizeChange = function()
{
  if (this.type == CAMERA_MAIN)
  {
    this.viewport[0] = 0;
    this.viewport[1] = 0;
    this.viewport[2] = this.camera.width;
    this.viewport[3] = this.camera.height;
  }
  else if (this.type == CAMERA_LEFTEYE)
  {
    this.viewport[0] = 0;
    this.viewport[1] = 0;
    this.viewport[2] = (this.camera.width / 2) | 0;
    this.viewport[3] = this.camera.height;
  }
  else if (this.type == CAMERA_RIGHTEYE)
  {
    this.viewport[0] = (this.camera.width / 2) | 0;
    this.viewport[1] = 0;
    this.viewport[2] = (this.camera.width / 2) | 0;
    this.viewport[3] = this.camera.height;
  }
}

CameraEye.prototype.update = function (q)
{
  mat4.perspective(this.projection, this.camera.fov, this.viewport[2] / this.viewport[3], this.camera.near, this.camera.far);

  var at = vec3.fromValues(this.camera.position[0], this.camera.position[1], this.camera.position[2] - 1);
  vec3.transformQuat(at, at, q);
  var up = vec3.fromValues(0, 1, 0);
  vec3.transformQuat(up, up, q);
  mat4.lookAt(this.view, this.camera.position, at, up);
}

CameraEye.prototype.engage = function ()
{
  gl.viewport(this.viewport[0], this.viewport[1], this.viewport[2], this.viewport[3]);
}

function Camera(w, h)
{
  this.width = w;
  this.height = h;
  this.fov = Math.PI / 4.0;
  this.near = 0.1;
  this.far = 10000.0;

  this.position = vec3.create();
  this.angles = vec3.create();
  this.orientation = mat4.create();

  this.splitscreen(false);
}

Camera.prototype.handleSizeChange = function(w, h)
{
  this.width = w;
  this.height = h;
  for (var eye in this.eyes) this.eyes[eye].handleSizeChange();
}

Camera.prototype.splitscreen = function (s)
{
  if (s)
  {
    this.eyes = [];
    this.eyes.push(new CameraEye(this, CAMERA_LEFTEYE));
    this.eyes.push(new CameraEye(this, CAMERA_RIGHTEYE));
  }
  else
  {
    this.eyes = [];
    this.eyes.push(new CameraEye(this, CAMERA_MAIN));
  }
  this.update();
}

Camera.prototype.lookAt = function (x, y, z)
{
  // set orientation to look at a point
  var diffx = this.position[0] - x;
  var diffy = this.position[1] - y;
  var diffz = this.position[2] - z;
  this.angles[1] = Math.atan(diffx / diffz);
  this.angles[0] = Math.atan(diffy / diffz);
}

Camera.prototype.update = function ()
{
  var q = quat.create();
  quat.rotateX(q, q, this.angles[0]); quat.rotateY(q, q, this.angles[1]); quat.rotateZ(q, q, this.angles[1]);
  mat4.fromQuat(this.orientation, q);

  for (var eye in this.eyes) this.eyes[eye].update(q);
}
