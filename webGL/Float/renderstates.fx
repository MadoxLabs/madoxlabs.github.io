[PARTNAME]
renderstates
[END]

[RENDERSTATE]
name colorlines
depth false
cull false
[END]

[RENDERSTATE]
name plain
depth true
depthfunc LESS
[END]

[RENDERSTATE]
name blend
blend true
blendfunc ONE SRC_ALPHA
depth true
depthfunc LESS
[END]

[COMMON]
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
[END]