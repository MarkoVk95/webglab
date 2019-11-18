precision mediump float;
attribute vec3 vertPosition;
attribute vec2 a_textureVec;
varying vec2 v_textureVec;

uniform mat4 mWorld;
uniform mat4 mView;
uniform mat4 mProj;
void main()
{
v_textureVec = a_textureVec;

gl_Position = mProj * mView * mWorld * vec4(vertPosition, 1.0);
}