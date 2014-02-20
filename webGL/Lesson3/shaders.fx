[NAME]
shader
[END]

[COMMON]
[END]

[VERTEX]

attribute vec3 aVertexPosition;  // POS
attribute vec4 aVertexColor;     // COLOR0

uniform mat4 uMVMatrix;
uniform mat4 uPMatrix;

varying vec4 vColor;

void main(void) 
{
  gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0);
  vColor = aVertexColor;
}

[END]

[PIXEL]

precision mediump float;

varying vec4 vColor;

void main(void) {
    gl_FragColor = vColor;
}

[END]
