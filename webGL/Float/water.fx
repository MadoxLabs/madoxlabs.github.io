[NAME]
water
[END]

[INCLUDE renderstates]
[INCLUDE shadowrecieve]

[COMMON]
uniform sampler2D watermap; // mag NEAREST, min NEAREST, wrapu CLAMP_TO_EDGE, wrapv CLAMP_TO_EDGE
uniform sampler2D heightmap; // mag NEAREST, min NEAREST, wrapu CLAMP_TO_EDGE, wrapv CLAMP_TO_EDGE

varying vec2 vTextureCoord;
varying vec4 vPosition;
varying vec3 vNormal;
varying float vHeight;
[END]

[APPLY]
blend
[END]

[VERTEX]

attribute vec3 aVertexPosition;  // POS
attribute vec2 aTextureCoord;    // TEX0

uniform mat4 projection;         // group camera
uniform mat4 view;               // group camera
uniform mat4 uWorld;             // group perobject
uniform mat4 localTransform;     // group perpart

float getHeight(vec2 tex)
{
  float ret = 0.0;
  float ground = texture2D(heightmap, tex).x;
  float water = texture2D(watermap, tex).x;
  if (water > 0.0) ret = ground + water;
  return ret;
}

void main(void) 
{
  vTextureCoord = aTextureCoord;

  vHeight = texture2D(heightmap, vTextureCoord).x;
  float water = texture2D(watermap, vTextureCoord).x;
  
  vPosition = vec4(aVertexPosition, 1.0);
  if (water == 0.0) vPosition.y = 0.0;
  else 
    vPosition.y = water + vHeight;
  gl_Position = projection * view * uWorld * localTransform * vPosition;

  float tex = 1.0 / 100.0;
  vec2 px = vec2(tex, 0);
  vec2 py = vec2(0, tex);
  float top    = getHeight(vTextureCoord - py);
  float bottom = getHeight(vTextureCoord + py);
  float left   = getHeight(vTextureCoord - px);
  float right  = getHeight(vTextureCoord + px);
  vNormal = normalize( cross( vec3(0.05, right-left, 0), vec3(0, top-bottom, -0.05) ) );
}
[END]

[PIXEL]

uniform vec2 options;            // group perobject
uniform mat4 uWorldToLight;      // group perobject
uniform vec3 uLightPosition    ;  // group perobject

uniform vec3 camera;             // group camera

uniform vec4 materialoptions;    // group material
uniform vec3 ambientcolor;       // group material
uniform vec3 diffusecolor;       // group material
uniform vec3 specularcolor;      // group material
uniform vec3 emissivecolor;      // group material

void main(void) 
{ 
  float depth = max(0.0, vPosition.y - vHeight);
  vec3 color = vec3(0.0,0.0,1.0);
  float alpha = min (0.8, 0.5 + depth * 0.05);

  // lighting
  float nDotL = dot(normalize(vNormal), normalize(uLightPosition - vec3(vPosition)));

  // apply user options
  if (options.x > 0.0) color = color * (0.2 + 0.7 * nDotL);
  if (IsShadow(vPosition, vNormal, uWorldToLight, uLightPosition))  color = color * 0.4;

  // out
  gl_FragColor = vec4(color,alpha);
}

[END]
