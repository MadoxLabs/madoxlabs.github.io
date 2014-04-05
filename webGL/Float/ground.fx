[NAME]
ground
[END]

[COMMON]

#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif

uniform sampler2D heightmap; // mag NEAREST, min NEAREST, wrapu CLAMP_TO_EDGE, wrapv CLAMP_TO_EDGE
uniform sampler2D aomap; // mag LINEAR, min LINEAR, wrapu CLAMP_TO_EDGE, wrapv CLAMP_TO_EDGE

varying vec2 vTextureCoord;
varying vec4 vPosition;
varying float vAOFactor;
varying vec3 vNormal;

[END]

[RENDERSTATE]
name plain
depth true
depthfunc LESS
[END]

[APPLY]
plain
[END]

[VERTEX]

attribute vec3 aVertexPosition;  // POS
attribute vec2 aTextureCoord;    // TEX0

uniform mat4 projection;         // group camera
uniform mat4 view;               // group camera
uniform mat4 uWorld;             // group perobject
uniform mat4 localTransform;     // group perpart

void main(void) 
{
  vTextureCoord = aTextureCoord;
  vAOFactor = texture2D(aomap, aTextureCoord).x;

  vPosition = vec4(aVertexPosition, 1.0);
  vPosition.y = texture2D(heightmap, aTextureCoord).x;

  gl_Position = projection * view * uWorld * localTransform * vPosition;

  float tex = 1.0 / 102.0;
  vec2 px = vec2(tex, 0);
  vec2 py = vec2(0, tex);
  float top    = texture2D(heightmap, vTextureCoord - py).x;
  float bottom = texture2D(heightmap, vTextureCoord + py).x;
  float left   = texture2D(heightmap, vTextureCoord - px).x;
  float right  = texture2D(heightmap, vTextureCoord + px).x;
  vNormal = normalize( cross( vec3(2, right-left, 0), vec3(0, top-bottom, -2) ) );
}
[END]

[PIXEL]

uniform vec3 camera;             // group camera

uniform vec4 materialoptions;    // group material
uniform vec3 ambientcolor;       // group material
uniform vec3 diffusecolor;       // group material
uniform vec3 specularcolor;      // group material
uniform vec3 emissivecolor;      // group material


void main(void) 
{ 
//  float tex = 1.0 / 102.0;
//  vec2 px = vec2(tex, 0);
//  vec2 py = vec2(0, tex);
//  float top    = texture2D(heightmap, vTextureCoord - py).x;
//  float bottom = texture2D(heightmap, vTextureCoord + py).x;
//  float left   = texture2D(heightmap, vTextureCoord - px).x;
//  float right  = texture2D(heightmap, vTextureCoord + px).x;
//  vec3 normal = normalize( cross( vec3(2, right-left, 0), vec3(0, top-bottom, -2) ) );
//  normal = mul(normal, (float3x3)World);

  vec3 color = vec3(1.0,1.0,1.0);

  if (vPosition.y > 20.0)  // white snow
  {
    float c = (vPosition.y - 20.0) / 30.0 + 0.80;
    color = vec3(c,c,c);
  }
  else if (vPosition.y > 5.0) // stones
  {
    float c = 0.5 + (vPosition.y-5.0)/20.0;
    color = vec3(c-0.1,c,c);
  }
  else if (vPosition.y > -10.0) // greenery
  {
    float c = 0.2 + (vPosition.y + 10.0)/15.0;
    color = vec3(0.0,c,0.0);
  }
  else  // sand
  {
    color = vec3(237.0/255.0, 201.0/255.0, 175.0/255.0);
  }

//  vec3 lightDir = vec3(1.0,0.0,1.0);
  vec3 lightDir = vec3(0.5,1.0,0.2);
  float nDotL = dot(normalize(vNormal), lightDir);

  gl_FragColor = vec4(color * (nDotL + 0.1) * min(1.0,vAOFactor + 0.9), 1.0);
}

[END]
