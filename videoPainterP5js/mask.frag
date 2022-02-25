#ifdef GL_ES
precision mediump float;
precision mediump int;
#endif

// texcoords from the vertex shader
varying vec2 vTexCoord;
// viewport resolution (in pixels)
uniform vec2  sketchSize;      

// Textures to blend
uniform sampler2D source1;    // Source 
uniform sampler2D source2;    // Source 
uniform sampler2D source3;    // Source 
uniform sampler2D drawing;   
// Previous frame
uniform sampler2D buffer;

void main(void) {
  vec2 uv = vTexCoord;
  // the texture is loaded upside down and backwards by default so lets flip it
  uv.y = 1.0 - uv.y;

  vec3 s1 = texture2D(source1, uv).rgb;
  vec3 s2 = texture2D(source2, uv).rgb;
  vec3 s3 = texture2D(source3, uv).rgb;
  vec4 d = texture2D(drawing, uv).rgba;

  // Normalize the color channels to use as multipliers so that the sum maxes
  // out at 1.0
  vec3 dnorm = d.rgb / (d.r + d.g + d.b);
  
  // Combine the 3 sources using the R G and B channels of the drawing as masks
  // representing how much of each source to use.
  gl_FragColor = vec4(
    // Premultiplying the alpha has the effect of drawing over a black background
    (s1.r * dnorm.r + s2.r * dnorm.g + s3.r * dnorm.b) * d.a,
    (s1.g * dnorm.r + s2.g * dnorm.g + s3.g * dnorm.b) * d.a,
    (s1.b * dnorm.r + s2.b * dnorm.g + s3.b * dnorm.b) * d.a,
    1.0
  );
}
