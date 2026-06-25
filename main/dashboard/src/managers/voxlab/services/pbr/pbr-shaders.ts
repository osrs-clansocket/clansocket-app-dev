export const QUAD_VERT = `
varying vec2 vUv;
void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const LUM_CONST = "const vec3 LUM_W = vec3(0.299, 0.587, 0.114);";

export const NORMAL_SHADER_FRAG = `
varying vec2 vUv;
uniform sampler2D uSource;
uniform vec2 uTexelSize;
uniform float uStrength;
${LUM_CONST}
void main() {
    float lL = dot(texture2D(uSource, vUv + vec2(-uTexelSize.x, 0.0)).rgb, LUM_W);
    float lR = dot(texture2D(uSource, vUv + vec2( uTexelSize.x, 0.0)).rgb, LUM_W);
    float lU = dot(texture2D(uSource, vUv + vec2(0.0, -uTexelSize.y)).rgb, LUM_W);
    float lD = dot(texture2D(uSource, vUv + vec2(0.0,  uTexelSize.y)).rgb, LUM_W);
    float dx = (lR - lL) * 0.5;
    float dy = (lD - lU) * 0.5;
    vec3 n = normalize(vec3(-dx * uStrength, -dy * uStrength, 1.0));
    gl_FragColor = vec4(n * 0.5 + 0.5, 1.0);
}
`;

export const LUMINANCE_SHADER_FRAG = `
varying vec2 vUv;
uniform sampler2D uSource;
uniform float uInvert;
${LUM_CONST}
void main() {
    vec3 src = texture2D(uSource, vUv).rgb;
    float lum = dot(src, LUM_W);
    float v = uInvert > 0.5 ? 1.0 - lum : lum;
    gl_FragColor = vec4(v, v, v, 1.0);
}
`;

export const THRESHOLD_SHADER_FRAG = `
varying vec2 vUv;
uniform sampler2D uSource;
uniform float uThreshold;
${LUM_CONST}
void main() {
    vec3 src = texture2D(uSource, vUv).rgb;
    float lum = dot(src, LUM_W);
    float v = step(uThreshold, lum);
    gl_FragColor = vec4(v, v, v, 1.0);
}
`;

export const AO_SHADER_FRAG = `
varying vec2 vUv;
uniform sampler2D uSource;
uniform vec2 uTexelSize;
uniform float uRadius;
${LUM_CONST}
void main() {
    vec3 src = texture2D(uSource, vUv).rgb;
    float centerLum = dot(src, LUM_W);
    float sum = 0.0;
    float count = 0.0;
    for (int dy = -16; dy <= 16; dy++) {
        for (int dx = -16; dx <= 16; dx++) {
            float adx = abs(float(dx));
            float ady = abs(float(dy));
            if (adx <= uRadius && ady <= uRadius) {
                vec2 offset = vec2(float(dx), float(dy)) * uTexelSize;
                sum += dot(texture2D(uSource, vUv + offset).rgb, LUM_W);
                count += 1.0;
            }
        }
    }
    float avg = sum / count;
    float ratio = avg < 1e-6 ? 1.0 : centerLum / avg;
    float v = clamp(ratio, 0.0, 1.0);
    gl_FragColor = vec4(v, v, v, 1.0);
}
`;
