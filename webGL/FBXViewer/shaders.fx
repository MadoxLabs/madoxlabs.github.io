[NAME]
meshViewer
[END]

[COMMON]

#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif

varying vec2 vTextureCoord;
varying vec3 vLight;

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

attribute vec3 aVertexPosition;  // POS
attribute vec2 aTextureCoord;    // TEX0
attribute vec3 aVertexNormal;    // NORM

uniform mat4 uPMatrix;           // group once

uniform vec3 uAmbientColor;      // group light
uniform vec3 uLightingDirection; // group light
uniform vec3 uDirectionalColor;  // group light

uniform mat4 uMVMatrix;          // group perobject
uniform mat3 uMVMatrixT;         // group perobject

uniform mat4 local;              // group perpart

void main(void) 
{
  gl_Position = uPMatrix * uMVMatrix * local * vec4(aVertexPosition, 1.0);
  vTextureCoord = aTextureCoord;

  float directionalLightWeighting = max(dot(uMVMatrixT * normalize(aVertexNormal), uLightingDirection), 0.0);
  vLight = uAmbientColor + uDirectionalColor * directionalLightWeighting;
}
[END]

[PIXEL]

void main(void) 
{
  gl_FragColor = vec4(vLight, 1.0);
}

[END]
