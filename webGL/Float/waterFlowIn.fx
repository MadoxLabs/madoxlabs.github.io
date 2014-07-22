[NAME]
waterFlowIn
[END]

[COMMON]
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif

varying vec2 vTextureCoord;
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

attribute vec2 aVertexPosition;  // POS
attribute vec2 aTextureCoord;    // TEX0

void main(void) 
{
  gl_Position = vec4(aVertexPosition, 0.0, 1.0 );
  vTextureCoord = aTextureCoord;
}
[END]

[PIXEL]

uniform sampler2D water; // mag LINEAR, min LINEAR, wrapu CLAMP_TO_EDGE, wrapv CLAMP_TO_EDGE
uniform sampler2D adjust; // mag LINEAR, min LINEAR, wrapu CLAMP_TO_EDGE, wrapv CLAMP_TO_EDGE
uniform sampler2D flows; // mag LINEAR, min LINEAR, wrapu CLAMP_TO_EDGE, wrapv CLAMP_TO_EDGE

void main(void) 
{
//  float depth = texture2D(water, vTextureCoord).x;
//  float added = texture2D(adjust, vTextureCoord).x;
//  gl_FragColor = vec4(max(0.0, depth + added - 0.01), 0.,0.,0.);

  float tex = 1.0 / 102.0;
  vec2 px = vec2(tex, 0);
  vec2 py = vec2(0, tex);

  vec4 flowC = texture2D(flows, vTextureCoord);
  vec4 flowL = texture2D(flows, vTextureCoord - px);
  vec4 flowR = texture2D(flows, vTextureCoord + px);
  vec4 flowT = texture2D(flows, vTextureCoord - py);
  vec4 flowB = texture2D(flows, vTextureCoord + py);
  float inflows = flowR.x + flowL.y + flowT.z + flowB.w;
  float outflows = flowC.x + flowC.y + flowC.z + flowC.w;
  float oldwater =  texture2D(water, vTextureCoord).x + texture2D(adjust, vTextureCoord).x;
  // oldwater *= 0.01; //evaporate;
  float outwater = oldwater + (0.05 * (inflows - outflows));
  gl_FragColor = vec4(max(0.0, outwater),0.,0.,0.);;
}

[END]