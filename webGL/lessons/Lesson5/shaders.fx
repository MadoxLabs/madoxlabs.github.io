Text outside of special areas should be ignored.
NAME section is required to set the shader name in code.

[NAME]
shader
[END]

Common section is added to both vertex and pixel shaders

[COMMON]

#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif

varying vec4 vColor;
varying vec2 vTextureCoord;

[END]

Vertex shader has to define the incoming pixel attributes. 
Each attribute should have a commented out SEMANTIC that the code uses to match up byte offsets to.
SEMANTICs can be anything you want, but should follow DX names for clarity

uniforms that are not SAMPLERs can be assigned a group in the comment part
uniforms in a group can be set as a group in javascript, allowing ones that only need to be set
once to not be reset all the time, or once per frame etc instead of per object

[VERTEX]

attribute vec3 aVertexPosition;  // POS
attribute vec4 aVertexColor;     // COLOR0
attribute vec2 aTextureCoord;    // TEX0

uniform mat4 uPMatrix;           // group once

uniform mat4 uMVMatrix;          // group perobject

void main(void) 
{
  gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0);
  vColor = aVertexColor;
  vTextureCoord = aTextureCoord;
}

[END]

The pixel shader can define texture SAMPLERs as uniforms. 
A SAMPLER can set the mag, min filters and wraps, wrapt settings in the comment that follows it. 
Valid values are ones that exist in the GL object. IE: LINEAR = gl.LINEAR 

[PIXEL]

uniform sampler2D uSampler; // mag LINEAR, min LINEAR

void main(void) 
{
  gl_FragColor = texture2D(uSampler, vec2(vTextureCoord.s, vTextureCoord.t));
}

[END]
