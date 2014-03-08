[NAME]
normalViewer
[END]

[COMMON]

#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif

[END]

[RENDERSTATE]
name normalrender
depth false
cull false
[END]

[APPLY]
normalrender
[END]

[VERTEX]

attribute vec3 aVertexPosition;  // POS

uniform mat4 uPMatrix;           // group once
uniform mat4 uMVMatrix;          // group perobject
uniform mat4 local;              // group perpart

void main(void) 
{
  gl_Position = uPMatrix * uMVMatrix * local * vec4(aVertexPosition, 1.0);
}
[END]

[PIXEL]

void main(void) 
{
  gl_FragColor = vec4(0.0, 1.0, 0.0, 1.0);
}

[END]
