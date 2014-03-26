[NAME]
post
[END]

[COMMON]
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif

varying vec2 vTextureCoord;
[END]

[RENDERSTATE]
name noblend
depth true
depthfunc LESS
[END]

[APPLY]
noblend
[END]

[VERTEX]

uniform vec2 scaleSurfaceToProj; // group post

attribute vec3 aVertexPosition;  // POS
attribute vec2 aTextureCoord;    // TEX0

void main(void) 
{
  // convert screen coords to output position. Scale to [0,2] then translate to [-1,1]
  // We have to subtract half a pixel because the texel origin is in the middle, we want the topleft
  vec2 halfPixel = 0.5 * scaleSurfaceToProj; 
  vec2 pos = ((aVertexPosition.xy * scaleSurfaceToProj) - 1.0) - halfPixel;

  // output position with inverted y axis.
  gl_Position = vec4(pos.x, pos.y * -1.0, aVertexPosition.z, 1.0 );
  vTextureCoord = aTextureCoord;
}
[END]

[PIXEL]

uniform sampler2D uTexture; // mag LINEAR, min LINEAR, wrapu CLAMP_TO_EDGE, wrapv CLAMP_TO_EDGE

void main(void) 
{
  vec4 tex = texture2D(uTexture, vec2(vTextureCoord.x, vTextureCoord.y));
  gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
}

[END]
