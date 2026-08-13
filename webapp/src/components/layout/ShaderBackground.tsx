"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface ShaderBackgroundProps {
  className?: string;
}

const MAX_DPR = 1.5;

export function ShaderBackground({ className }: ShaderBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (prefersReducedMotion) return;

    let visible = true;
    let animationFrameId = 0;
    let gl: WebGLRenderingContext | null = null;
    let vShader: WebGLShader | null = null;
    let fShader: WebGLShader | null = null;
    let prog: WebGLProgram | null = null;
    let buf: WebGLBuffer | null = null;

    function syncSize() {
      if (!canvas) return;
      const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
      const w = Math.floor((canvas.clientWidth || 1280) * dpr);
      const h = Math.floor((canvas.clientHeight || 720) * dpr);
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
    }

    const resizeObserver =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(syncSize)
        : null;
    resizeObserver?.observe(canvas);
    syncSize();

    gl =
      canvas.getContext("webgl", { antialias: false, powerPreference: "low-power" }) ||
      (canvas.getContext("experimental-webgl") as WebGLRenderingContext | null);
    if (!gl) return;

    const vs = `attribute vec2 a_position;
varying vec2 v_texCoord;
void main() {
  v_texCoord = a_position * 0.5 + 0.5;
  gl_Position = vec4(a_position, 0.0, 1.0);
}`;
    const fs = `precision mediump float;
varying vec2 v_texCoord;
uniform float u_time;
uniform vec2 u_resolution;

void main() {
    vec2 uv = v_texCoord;
    vec2 p = (uv - 0.5) * 2.0;
    p.x *= u_resolution.x / u_resolution.y;

    float t = u_time * 0.2;
    float noise = sin(p.x * 2.0 + t) * cos(p.y * 2.0 - t * 0.5);
    noise += sin(p.y * 5.0 + t * 1.5) * 0.2;
    
    vec3 color1 = vec3(0.98, 0.97, 1.0);
    vec3 color2 = vec3(0.898, 0.224, 0.208);
    
    float dist = length(p);
    float glow = smoothstep(1.5, 0.0, dist + noise * 0.5);
    vec3 finalColor = mix(color1, color2, glow * 0.08);
    float grid = sin(uv.y * 200.0) * 0.02;
    finalColor -= grid;

    gl_FragColor = vec4(finalColor, 1.0);
}`;

    function createShader(type: number, src: string) {
      const s = gl!.createShader(type);
      if (!s) return null;
      gl!.shaderSource(s, src);
      gl!.compileShader(s);
      if (!gl!.getShaderParameter(s, gl!.COMPILE_STATUS)) {
        gl!.deleteShader(s);
        return null;
      }
      return s;
    }

    prog = gl.createProgram();
    if (!prog) return;

    vShader = createShader(gl.VERTEX_SHADER, vs);
    fShader = createShader(gl.FRAGMENT_SHADER, fs);
    if (!vShader || !fShader) return;

    gl.attachShader(prog, vShader);
    gl.attachShader(prog, fShader);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;

    gl.useProgram(prog);

    buf = gl.createBuffer();
    if (!buf) return;

    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
      gl.STATIC_DRAW,
    );

    const pos = gl.getAttribLocation(prog, "a_position");
    gl.enableVertexAttribArray(pos);
    gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0);

    const uTime = gl.getUniformLocation(prog, "u_time");
    const uRes = gl.getUniformLocation(prog, "u_resolution");

    const visibilityObserver = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        if (visible && !animationFrameId) {
          animationFrameId = requestAnimationFrame(render);
        }
      },
      { threshold: 0 },
    );
    visibilityObserver.observe(canvas);

    function render(t: number) {
      if (!gl || !canvas || !prog) return;
      if (!visible || document.hidden) {
        animationFrameId = 0;
        return;
      }
      if (!resizeObserver) syncSize();
      gl.viewport(0, 0, canvas.width, canvas.height);
      if (uTime) gl.uniform1f(uTime, t * 0.001);
      if (uRes) gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      animationFrameId = requestAnimationFrame(render);
    }

    animationFrameId = requestAnimationFrame(render);

    const onVisibility = () => {
      if (!document.hidden && visible && !animationFrameId) {
        animationFrameId = requestAnimationFrame(render);
      }
    };

    const onContextLost = (e: Event) => {
      e.preventDefault();
      cancelAnimationFrame(animationFrameId);
      animationFrameId = 0;
    };

    const onContextRestored = () => {
      if (visible && !animationFrameId) {
        animationFrameId = requestAnimationFrame(render);
      }
    };

    document.addEventListener("visibilitychange", onVisibility);
    canvas.addEventListener("webglcontextlost", onContextLost);
    canvas.addEventListener("webglcontextrestored", onContextRestored);

    return () => {
      cancelAnimationFrame(animationFrameId);
      visibilityObserver.disconnect();
      resizeObserver?.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      canvas.removeEventListener("webglcontextlost", onContextLost);
      canvas.removeEventListener("webglcontextrestored", onContextRestored);

      if (gl) {
        if (buf) gl.deleteBuffer(buf);
        if (vShader) gl.deleteShader(vShader);
        if (fShader) gl.deleteShader(fShader);
        if (prog) gl.deleteProgram(prog);
        const ext = gl.getExtension("WEBGL_lose_context");
        ext?.loseContext();
      }
    };
  }, []);

  return (
    <div className={cn("absolute inset-0 w-full h-full", className)}>
      <canvas
        ref={canvasRef}
        className="block w-full h-full"
        style={{ width: "100%", height: "100%" }}
      />
    </div>
  );
}
