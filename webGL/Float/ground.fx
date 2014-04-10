[NAME]
ground
[END]

[INCLUDE renderstates]

[COMMON]
uniform sampler2D heightmap; // mag NEAREST, min NEAREST, wrapu CLAMP_TO_EDGE, wrapv CLAMP_TO_EDGE
uniform sampler2D aomap; // mag LINEAR, min LINEAR, wrapu CLAMP_TO_EDGE, wrapv CLAMP_TO_EDGE

varying vec2 vTextureCoord;
varying vec4 vPosition;
varying float vAOFactor;
varying vec3 vNormal;
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

uniform vec2 options;            // group perobject
uniform mat4 uWorldToLight;      // group perobject
uniform vec3 uLightPosition    ;  // group perobject

uniform vec3 camera;             // group camera

uniform vec4 materialoptions;    // group material
uniform vec3 ambientcolor;       // group material
uniform vec3 diffusecolor;       // group material
uniform vec3 specularcolor;      // group material
uniform vec3 emissivecolor;      // group material

uniform sampler2D wang; // mag LINEAR, min LINEAR, wrapu CLAMP_TO_EDGE, wrapv CLAMP_TO_EDGE
uniform sampler2D grass; // mag LINEAR, min LINEAR_MIPMAP_LINEAR
uniform sampler2D dirt; // mag LINEAR, min LINEAR_MIPMAP_LINEAR
uniform sampler2D sand; // mag LINEAR, min LINEAR_MIPMAP_LINEAR
uniform sampler2D shadow; // mag LINEAR, min LINEAR

bool IsShadow(vec4 position, vec3 normal)
{
  vec4 positionFromLight =  uWorldToLight * position;

  // if face is away from light - shadowed
  vec3 lightDir = uLightPosition - vec3(position);
 // if (dot(normal, lightDir) < 0.0) return true;

  // convert light POV location to a spot on the shadow map
  vec2 shadowLookup = 0.5 + 0.5 * (positionFromLight.xy / positionFromLight.w);
  vec4 depth = texture2D(shadow, shadowLookup);
  float depthFromLight = positionFromLight.z / positionFromLight.w;
  if (depth.x + 0.00001 < depthFromLight) return true;
  return false;
}

void main(void) 
{ 
  float wangsize = 64.0;
  vec4 color = vec4(1.0,1.0,1.0,1.0);

  // wang tiles
  vec2 mappingScale = vec2(wangsize, wangsize);                 // we are hardcoding the fact that each ground segment is made up of 100x100 tiles
  vec2 mappingAddress = vTextureCoord * mappingScale;  // convert the 0:1 uvs to 0:100 tile index
  vec4 whichTile = texture2D(wang, (floor(mappingAddress) + 0.5) / mappingScale ); // floor the tile index to get the interger array indexes into the index
                                                                                               // then convert backto 0:1 range for reading
  vec2 tileScale = vec2(4.0, 4.0);                     // we know the tile textures is always 4x4
  vec2 tileScaledTex = vTextureCoord * vec2(wangsize/4.0, wangsize/4.0);

  float f = abs(vNormal.x) + abs(vNormal.z);
  vec4 texColorA = texture2D(grass, whichTile.xw + fract(mappingAddress)/tileScale);
  vec4 texColorB = texture2D(dirt, whichTile.xw + fract(mappingAddress)/tileScale);
  vec4 texColorC = texture2D(sand, whichTile.xw + fract(mappingAddress)/tileScale);

  // lerp between dirt and grass based on terrain slope
  if (f > 0.9) color = texColorB;
  else if (f > 0.7) 
  {
    f = ((f - 0.7) * 5.0) * 0.7 + 0.3;  // scale to 0 to 1, then bias towards dirt by 30%
    color = texColorB * f + texColorA * (1.0-f);
  }
  else color = texColorA;

  // below a certain height lerp with sand
  float wHeight = vPosition.y;
  if (wHeight <= -11.0) {
    color = texColorC;
  } else
  if (wHeight < -9.0) {
    f = (wHeight + 11.0)/2.0;
    color = color * f + texColorC * (1.0-f);
  }

  // lighting
  vec3 lightDir = vec3(0.5,1.0,0.2);
  float nDotL = dot(normalize(vNormal), normalize(uLightPosition - vec3(vPosition)));

  // apply user options
  float a = color.a;
  if (options.x > 0.0) color = color * (nDotL + 0.1);
  if (options.y > 0.0) color = color * min(1.0,vAOFactor+0.3);

  if (IsShadow(vPosition, vNormal))  color = color * 0.4;

  color.a = a;

  // out
  gl_FragColor = color;
}

[END]
