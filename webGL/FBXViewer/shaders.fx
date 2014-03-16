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

// options from viewer app are: x: explode y/n  y: 1 uv view, 2 x seams, 3 y seams  z: n/a  w: n/a
uniform vec4 options;            // group perobject

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

uniform mat4 projection;         // group camera
uniform mat4 view;               // group camera
uniform vec3 camera;             // group camera

uniform vec3 uAmbientColor;      // group light
uniform vec3 uLightingDirection; // group light
uniform vec3 uDirectionalColor;  // group light

uniform mat4 uWorld;          // group perobject
uniform mat3 uWorldT;         // group perobject

uniform mat4 localTransform;     // group perpart

void main(void) 
{
  vec3 pos = aVertexPosition;
  if (options.x > 0.0) pos += aVertexNormal * 0.5;

  gl_Position = projection * view * uWorld * localTransform * vec4(pos, 1.0);
  vTextureCoord = aTextureCoord;

  float directionalLightWeighting = max(dot(normalize(aVertexNormal) * mat3(localTransform) * mat3(uWorld), uLightingDirection), 0.0);
  vLight = uAmbientColor + uDirectionalColor * directionalLightWeighting;
}
[END]

[PIXEL]

uniform vec3 partcolor;         // group perpart

// material options are: x: texture y/n   y: specular exponant  z: n/a   w: n/a
uniform vec4 materialoptions;    // group material
uniform vec3 ambientcolor;       // group material
uniform vec3 diffusecolor;       // group material
uniform vec3 specularcolor;      // group material
uniform vec3 emissivecolor;      // group material

uniform sampler2D uTexture; // mag LINEAR, min LINEAR

// try to draw a checkboard to expose the uv mapping
void main(void) 
{
  vec4 tex = vec4(1.0, 1.0, 1.0, 1.0);

  if (options.y == 1.0)
  {
    float color = 0.2;
    float u = floor(vTextureCoord.x * 10.0);
    float v = floor(vTextureCoord.y * 10.0);
    color = mod((mod(u,2.0) + mod(v,2.0)),2.0) + 0.2;
    tex = vec4(partcolor * color, 1.0);
  }
  else if (options.y == 2.0)
  {
    tex = vec4(0.0, vTextureCoord.x, 0.0, 1.0);
  }
  else if (options.y == 3.0)
  {
    tex = vec4(0.0, vTextureCoord.y, 0.0, 1.0);
  }
  else if (materialoptions.x > 0.0)
    tex = texture2D(uTexture, vec2(vTextureCoord.x, vTextureCoord.y));

  gl_FragColor = tex * vec4(vLight, 1.0);
}

[END]
