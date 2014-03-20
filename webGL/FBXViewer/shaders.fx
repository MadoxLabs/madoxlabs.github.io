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
varying vec4 vPosition;
varying vec3 vNormal;

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

uniform mat4 uWorld;          // group perobject

uniform mat4 localTransform;     // group perpart

void main(void) 
{
  vec3 pos = aVertexPosition;
  if (options.x > 0.0) pos += aVertexNormal * 0.5;

  vPosition = uWorld * localTransform * vec4(pos, 1.0);
  gl_Position = projection * view * vPosition;

  vTextureCoord = aTextureCoord;

  vNormal = mat3(uWorld) * mat3(localTransform) *  aVertexNormal;
}
[END]

[PIXEL]

uniform vec3 partcolor;         // group perpart

uniform vec3 camera;             // group camera

uniform vec3 uGlobalAmbientRGB ;  // group light 
uniform vec3 uLightAmbientRGB  ;  // group light
uniform vec3 uLightDiffuseRGB  ;  // group light
uniform vec3 uLightSpecularRGB ;  // group light
uniform vec3 uLightAttenuation ;  // group light
uniform vec3 uLightPosition    ;  // group light

// material options are: x: texture y/n   y: specular exponant  z: n/a   w: n/a
uniform vec4 materialoptions;    // group material
uniform vec3 ambientcolor;       // group material
uniform vec3 diffusecolor;       // group material
uniform vec3 specularcolor;      // group material
uniform vec3 emissivecolor;      // group material

uniform sampler2D uTexture; // mag LINEAR, min LINEAR

void main(void) 
{
  vec4 tex = vec4(1.0, 1.0, 1.0, 1.0);

  // work out the lighting
  float d = distance(uLightPosition, vec3(vPosition));
  float attenuation = 1.0 / dot (vec3(1, d, d*d), uLightAttenuation);

  vec3 ambient = ambientcolor * (uGlobalAmbientRGB + (uLightAmbientRGB * attenuation));
  vec3 diffuse = diffusecolor * uLightDiffuseRGB * attenuation * dot(vNormal, uLightPosition - vec3(vPosition));

  vec3 cameradir = normalize(camera - vec3(vPosition));
  vec3 reflection = reflect(uLightPosition - vec3(vPosition), vNormal);
  float rDotV = pow(clamp(dot(reflection, cameradir), 0.0, 1.0), 70.0);
  vec3 specular =  specularcolor * uLightSpecularRGB * rDotV ;//* attenuation;

  vec3 light = ambient + diffuse + specular + emissivecolor;

  // work out the texture color

  if (options.y == 1.0)
  {
    // try to draw a checkboard to expose the uv mapping
    float color = 0.2;
    float u = floor(vTextureCoord.x * 10.0);
    float v = floor(vTextureCoord.y * 10.0);
    color = mod((mod(u,2.0) + mod(v,2.0)),2.0) + 0.2;
    tex = vec4(partcolor * color, 1.0);
  }
  else if (options.y == 2.0)
  {
    // just draw the U values
    tex = vec4(0.0, vTextureCoord.x, 0.0, 1.0);
  }
  else if (options.y == 3.0)
  {
    // just draw the V values
    tex = vec4(0.0, vTextureCoord.y, 0.0, 1.0);
  }
  else if (materialoptions.x > 0.0)
  {
    // has a texture
    tex = texture2D(uTexture, vec2(vTextureCoord.x, vTextureCoord.y));
  }

  gl_FragColor = tex * vec4(light, 1.0);
}

[END]
