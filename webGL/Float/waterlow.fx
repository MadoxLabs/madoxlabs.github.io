[NAME]
water
[END]

[INCLUDE renderstates]
[INCLUDE shadowoff]

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

void main(void) 
{
  vTextureCoord = aTextureCoord;

  vPosition = vec4(aVertexPosition, 1.0);
  vPosition.y = texture2D(watermap, aTextureCoord).x;

  vHeight = texture2D(heightmap, aTextureCoord).x;

  gl_Position = projection * view * uWorld * localTransform * vPosition;

  float tex = 1.0 / 100.0;
  vec2 px = vec2(tex, 0);
  vec2 py = vec2(0, tex);
  float top    = texture2D(watermap, vTextureCoord - py).x;
  float bottom = texture2D(watermap, vTextureCoord + py).x;
  float left   = texture2D(watermap, vTextureCoord - px).x;
  float right  = texture2D(watermap, vTextureCoord + px).x;
  vNormal = normalize( cross( vec3(2, right-left, 0), vec3(0, top-bottom, -2) ) );
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
  vec4 color = vec4(0.0,0.0,depth*0.5,1.0);

  // lighting
  vec3 lightDir = vec3(0.5,1.0,0.2);
  float nDotL = dot(normalize(vNormal), normalize(uLightPosition - vec3(vPosition)));

  // apply user options
  if (options.x > 0.0) color = color * (nDotL + 0.1);
  if (IsShadow(vPosition, vNormal, uWorldToLight))  color = color * 0.4;
  color.a = depth*0.5 +0.3;

  // out
  gl_FragColor = color;
}

[END]
