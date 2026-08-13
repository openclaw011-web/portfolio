import { useEffect, useRef } from 'react'
import { prefersReducedMotion } from '../lib/motion'
import './blackhole.css'

const VERT = `
attribute vec2 a_pos;
varying vec2 v_uv;
void main() {
  v_uv = a_pos * 0.5 + 0.5;
  gl_Position = vec4(a_pos, 0.0, 1.0);
}
`

const FRAG = `
precision highp float;
uniform vec2 u_res;
uniform float u_time;
varying vec2 v_uv;

float hash21(vec2 p) {
  p = fract(p * vec2(234.34, 435.345));
  p += dot(p, p + 34.23);
  return fract(p.x * p.y);
}

// procedural starfield + faint nebula tint
vec3 starfield(vec2 uv, float t) {
  vec3 col = vec3(0.012, 0.010, 0.015);
  col += 0.025 * vec3(0.75, 0.38, 0.9) * exp(-length(uv - vec2(0.35, 0.72)) * 2.2);
  vec2 gv = uv * 150.0;
  vec2 id = floor(gv);
  float h = hash21(id);
  float s = smoothstep(0.93, 0.985, h);
  float tw = 0.55 + 0.45 * sin(t * (1.4 + h * 4.0) + h * 40.0);
  col += s * tw * vec3(0.85, 0.88, 1.0) * (0.3 + h * 0.7);
  return col;
}

void main() {
  vec2 uv = v_uv;
  float aspect = u_res.x / u_res.y;

  // square scene space: x spans +-aspect/2, y +-0.5; a circle here is round on screen
  vec2 p = (uv - 0.5);
  p.x *= aspect;

  // black hole center (slightly below middle for composition)
  vec2 c = vec2(0.0, -0.08);
  vec2 q = p - c;
  float r = length(q);
  float ang = atan(q.y, q.x);

  float rs = 0.34; // horizon radius (square-space units)

  // --- gravitational lensing of the background ---
  vec2 dir = normalize(q);
  float bend = rs * rs / max(r * r, 1e-4);
  vec2 lensed = uv - 0.5 - dir * bend;
  if (r < rs) {
    // inside the horizon: mirror the ray to fake seeing the "underside"
    lensed = uv - 0.5 - dir * (rs * rs / max((rs * 2.0 - r) * (rs * 2.0 - r), 1e-4));
  }
  vec3 col = starfield(lensed * 1.4, u_time);

  // --- accretion disk (nearly edge-on planar disk) ---
  vec2 dp = vec2(q.x, q.y * 3.6);
  float dr = length(dp);
  float din = rs * 1.62;
  float dout = rs * 5.5;
  float disk = smoothstep(din, din + 0.05, dr) * (1.0 - smoothstep(dout, dout - 0.4, dr));
  if (disk > 0.002) {
    float sp = u_time * 0.5;
    float streaks = 0.5 + 0.5 * sin(ang * 24.0 + sp * (4.0 + 7.0 * (din / dr)) + 3.0 * sin(dr * 9.0 + sp * 2.0));
    float side = cos(ang);
    // Doppler beaming: approaching side (right) brighter + cooler, receding warm
    vec3 warm = vec3(1.0, 0.62, 0.3);
    vec3 cool = vec3(0.5, 0.7, 1.0);
    vec3 dc = mix(warm, cool, smoothstep(-0.4, 0.6, side));
    col = mix(col, dc * (0.45 + 0.95 * streaks * (0.8 + 0.5 * side)), disk);
  }

  // --- event horizon: black core ---
  col *= smoothstep(rs * 0.55, rs * 1.05, r);

  // --- photon ring + inner glow ---
  float ring = exp(-abs(r - rs * 1.06) * 60.0);
  col += vec3(1.0, 0.72, 0.42) * ring * 1.35;
  col += vec3(1.0, 0.5, 0.2) * exp(-abs(r - rs * 0.8) * 24.0) * 0.15;

  // soft ambient halo so the hole reads on the page
  col += vec3(0.9, 0.45, 0.2) * 0.05 * exp(-abs(r - rs * 2.2) * 4.0);

  // gentle vignette
  col *= 1.0 - 0.45 * smoothstep(0.8, 2.0, r);

  gl_FragColor = vec4(col, 1.0);
}
`

function compile(gl: WebGLRenderingContext, type: number, src: string): WebGLShader | null {
  const sh = gl.createShader(type)
  if (!sh) return null
  gl.shaderSource(sh, src)
  gl.compileShader(sh)
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
    console.warn('BlackHole shader error:', gl.getShaderInfoLog(sh))
    gl.deleteShader(sh)
    return null
  }
  return sh
}

export default function BlackHole() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const gl = canvas.getContext('webgl', {
      antialias: false,
      alpha: false,
      depth: false,
      stencil: false,
      preserveDrawingBuffer: true,
      powerPreference: 'high-performance',
    })
    if (!gl) return // no WebGL → the CSS placeholder remains

    const vs = compile(gl, gl.VERTEX_SHADER, VERT)
    const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG)
    if (!vs || !fs) return

    const prog = gl.createProgram()!
    gl.attachShader(prog, vs)
    gl.attachShader(prog, fs)
    gl.linkProgram(prog)
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      console.warn('BlackHole program link failed')
      return
    }

    // fullscreen quad
    const buf = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buf)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)
    const loc = gl.getAttribLocation(prog, 'a_pos')

    const uRes = gl.getUniformLocation(prog, 'u_res')
    const uTime = gl.getUniformLocation(prog, 'u_time')

    const reduced = prefersReducedMotion()
    let raf = 0
    let running = true
    let last = performance.now()
    let time = 0

    // NOTE: assigning canvas.width/height RESETS the WebGL context state,
    // so we must re-apply program + buffer + attribute bindings after resize
    const bindState = () => {
      gl.useProgram(prog)
      gl.bindBuffer(gl.ARRAY_BUFFER, buf)
      gl.enableVertexAttribArray(loc)
      gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0)
    }

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5)
      const w = Math.min(canvas.clientWidth, 720)
      const h = Math.min(canvas.clientHeight, 560)
      canvas.width = Math.max(2, Math.round(w * dpr))
      canvas.height = Math.max(2, Math.round(h * dpr))
      gl.viewport(0, 0, canvas.width, canvas.height)
      bindState()
    }
    resize()

    const loop = (t: number) => {
      raf = requestAnimationFrame(loop)
      if (!running || document.hidden) return
      const dt = (t - last) / 1000
      last = t
      time = reduced ? 0 : time + dt
      gl.uniform2f(uRes, canvas.width, canvas.height)
      gl.uniform1f(uTime, time)
      gl.drawArrays(gl.TRIANGLES, 0, 3)
    }
    raf = requestAnimationFrame(loop)

    // pause rendering when the canvas scrolls off-screen
    const io = new IntersectionObserver(
      (entries) => {
        running = entries[0]?.isIntersecting ?? true
        if (running) last = performance.now()
      },
      { rootMargin: '100px' }
    )
    io.observe(canvas)

    const onResize = () => resize()
    window.addEventListener('resize', onResize)

    return () => {
      running = false
      cancelAnimationFrame(raf)
      io.disconnect()
      window.removeEventListener('resize', onResize)
      gl.deleteProgram(prog)
      gl.deleteBuffer(buf)
      gl.deleteShader(vs)
      gl.deleteShader(fs)
    }
  }, [])

  return <canvas ref={canvasRef} className="blackhole" aria-hidden="true" />
}
