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
  this.ipd = 0.0;
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
    this.ipd = 0;
    this.viewport[0] = 0;
    this.viewport[1] = 0;
    this.viewport[2] = this.camera.width;
    this.viewport[3] = this.camera.height;
    this.fsq = "fsq";
    this.center = vec2.fromValues(0.5, 0.5);
    this.lenscenter = vec2.fromValues(0.5, 0.5);
  }
  else if (this.type == CAMERA_LEFTEYE)
  {
    this.ipd = Game.oculus.interpupillaryDistance / 2.0;
    this.viewport[0] = 0;
    this.viewport[1] = 0;
    this.viewport[2] = (this.camera.width / 2) | 0;
    this.viewport[3] = this.camera.height;
    this.fsq = "fsqleft";
    this.center = vec2.fromValues(0.25, 0.5);
    this.lenscenter = vec2.fromValues(0.5 - Game.oculus.lensSeparationDistance / Game.oculus.hScreenSize, 0.5);
  }
  else if (this.type == CAMERA_RIGHTEYE)
  {
    this.ipd = Game.oculus.interpupillaryDistance / -2.0;
    this.viewport[0] = (this.camera.width / 2) | 0;
    this.viewport[1] = 0;
    this.viewport[2] = (this.camera.width / 2) | 0;
    this.viewport[3] = this.camera.height;
    this.fsq = "fsqright";
    this.center = vec2.fromValues(0.75, 0.5);
    this.lenscenter = vec2.fromValues(0.5 + Game.oculus.lensSeparationDistance / Game.oculus.hScreenSize, 0.5);
  }
}

CameraEye.prototype.update = function (q)
{
  this.camera.position[0] += this.ipd;

  if (this.ipd)
  {
    var aspectRatio = Game.oculus.hResolution * 0.5 / Game.oculus.vResolution;
    var halfScreenDistance = (Game.oculus.vScreenSize / 2.0);
    var yfov = 2.0 * Math.atan(halfScreenDistance / Game.oculus.eyeToScreenDistance);

    var viewCenter = Game.oculus.hScreenSize * 0.25;
    var eyeProjectionShift = viewCenter - Game.oculus.lensSeparationDistance * 0.5;
    var projectionCenterOffset = 4.0 * eyeProjectionShift / Game.oculus.hScreenSize;
    if (this.type == CAMERA_RIGHTEYE) projectionCenterOffset *= -1;

    mat4.perspective(this.projection, yfov, aspectRatio, this.camera.near, this.camera.far);
    var offset = mat4.create();
    mat4.identity(offset);
    mat4.translate(offset, offset, vec3.fromValues(projectionCenterOffset,0,0));
    mat4.multiply(this.projection, offset, this.projection);
  }
  else   
    mat4.perspective(this.projection, this.camera.fov, this.viewport[2] / this.viewport[3], this.camera.near, this.camera.far);

//  var at = vec3.fromValues(0,0,1);
//  vec3.transformQuat(at, at, q);
//  vec3.add(at, at, this.camera.position);
//
//  var up = vec3.fromValues(0, 1, 0);
//  vec3.transformQuat(up, up, q);
//
//  mat4.lookAt(this.view, this.camera.position, at, up);
 
  var up = vec3.create();
  vec3.transformMat4(up, vec3.fromValues(0,1,0), this.camera.orientation);
  mat4.lookAt(this.view, this.camera.position, this.camera.target, up)
  this.camera.position[0] -= this.ipd;

  this.uniforms.camera = this.camera.position;
  this.uniforms.view = this.view;
  this.uniforms.projection = this.projection;

}

CameraEye.prototype.engage = function ()
{
  gl.viewport(this.viewport[0], this.viewport[1], this.viewport[2], this.viewport[3]);
}

function Camera(w, h)
{
  this.ipd = 0.0;

  this.width = w;
  this.height = h;
  this.fov = Math.PI / 4.0;
  this.near = 0.1;
  this.far = 10000.0;

  this.angles = vec3.create();
  this.target = vec3.create();
  this.offset = vec3.create();

  this.position = vec3.create();
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
  this.target = vec3.fromValues(x, y, z);
}

Camera.prototype.update = function ()
{
  // assume target orient is identity
  // get our orient from angles

  var targetOrient = mat4.create();  mat4.identity(targetOrient);
  var orientX = mat4.create(); mat4.identity(orientX);
  var orientY = mat4.create(); mat4.identity(orientY);
  mat4.rotate(orientX, orientX, this.angles[1], vec3.fromValues(0, 1, 0));
  mat4.rotate(orientY, orientY, this.angles[0], vec3.fromValues(1, 0, 0));
  mat4.multiply(this.orientation, orientX, orientY);

  vec3.transformMat4(this.position, this.offset, this.orientation);
  vec3.add(this.position, this.position, this.target);

//  var q = quat.create();
//  quat.rotateX(q, q, this.angles[0]); quat.rotateY(q, q, this.angles[1]); quat.rotateZ(q, q, this.angles[1]);
//  if (Game.isOculus && Game.oculusReady == 3)
//  {
//    var vals = Game.oculusBridge.getOrientation();
//    var oq = quat.fromValues(vals.x, vals.y, vals.z, vals.w);
//    quat.multiply(q, q, oq);
//  }
//  mat4.fromQuat(this.orientation, q);
//
  for (var eye in this.eyes) this.eyes[eye].update();
}

Camera.prototype.engage = function()
{
  this.eyes[0].engage();
}