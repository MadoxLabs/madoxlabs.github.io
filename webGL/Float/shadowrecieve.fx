[PARTNAME]
shadowrecieve
[END]

[PIXEL]
uniform sampler2D shadow; // mag LINEAR, min LINEAR

bool IsShadow(vec4 position, vec3 normal, mat4 WorldToLight)
{
  vec4 positionFromLight =  WorldToLight * position;

  // if face is away from light - shadowed
//  vec3 lightDir = uLightPosition - vec3(position);
 // if (dot(normal, lightDir) < 0.0) return true;

  // convert light POV location to a spot on the shadow map
  vec2 shadowLookup = 0.5 + 0.5 * (positionFromLight.xy / positionFromLight.w);
  if (shadowLookup.x < 0.0 || shadowLookup.y < 0.0 || shadowLookup.x > 1.0 || shadowLookup.y > 1.0) return false;
  vec4 depth = texture2D(shadow, shadowLookup);
  float depthFromLight = positionFromLight.z / positionFromLight.w;
  if (depth.x + 0.00001 < depthFromLight) return true;
  return false;
}
[END]
