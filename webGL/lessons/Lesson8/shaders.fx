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
varying vec3 vLight;

[END]

Renderstates require a name followed by the states to set. This just defines the states

[RENDERSTATE]
name noblend
depth true
depthfunc LESS
[END]

[RENDERSTATE]
name blend
blend true
blendfunc SRC_ALPHA ONE
[END]

Apply will pick what state this shader sets. This is also settable in code.

[APPLY]
noblend
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
attribute vec3 aVertexNormal;    // NORM

attribute vec3 aInstanceOffset;  // OFFSET

uniform mat4 uPMatrix;           // group once

uniform vec3 uAmbientColor;      // group light
uniform vec3 uLightingDirection; // group light
uniform vec3 uDirectionalColor;  // group light

uniform mat4 uMVMatrix;          // group perobject

void main(void) 
{
  mat4 offset = mat4(1.0, 0.0, 0.0, 0.0,
                     0.0, 1.0, 0.0, 0.0,
                     0.0, 0.0, 1.0, 0.0,
                     aInstanceOffset.x, aInstanceOffset.y, aInstanceOffset.z, 1.0);
  gl_Position = uPMatrix * uMVMatrix * offset * vec4(aVertexPosition + aInstanceOffset, 1.0);
  vColor = aVertexColor;
  vTextureCoord = aTextureCoord;

  float directionalLightWeighting = max(dot(mat3(uMVMatrix) * aVertexNormal, uLightingDirection), 0.0);
  vLight = uAmbientColor + uDirectionalColor * directionalLightWeighting;
}

[END]

The pixel shader can define texture SAMPLERs as uniforms. 
A SAMPLER can set the mag, min filters and wraps, wrapt settings in the comment that follows it. 
Valid values are ones that exist in the GL object. IE: LINEAR = gl.LINEAR 

[PIXEL]

uniform sampler2D uSampler; // mag LINEAR, min LINEAR_MIPMAP_NEAREST

void main(void) 
{
   vec4 textureColor = texture2D(uSampler, vec2(vTextureCoord.s, vTextureCoord.t));
   gl_FragColor = vec4(textureColor.rgb * vLight, textureColor.a * 0.8);
}

[END]
