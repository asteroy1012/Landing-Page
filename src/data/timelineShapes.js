// Point-cloud silhouettes for the timeline. Every shape is sampled to the
// same number of points, so the cloud can morph between them one-to-one.

export const POINT_COUNT = 1100

// Keyed by timeline step so the mapping survives reordering the timeline.
export const STEP_SHAPES = {
  '01': 'cap', // VIT — graduation
  '02': 'ethereum', // Health record ledger on Ethereum
  '03': 'cloud', // AWS certification
  '04': 'chart', // Geojit — data visualization
  '05': 'waves', // Air quality forecasting
  '06': 'lineage', // Perficient / BNY Mellon — data lineage
}

const JITTER = 0.018
// Converts filled area into the same "weight" units as stroke length.
const FILL_K = 12

function mulberry32(seed) {
  let s = seed
  return () => {
    s = (s + 0x6d2b79f5) | 0
    let t = Math.imul(s ^ (s >>> 15), 1 | s)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

// ---- primitives: each has a weight (share of points) and a sampler ----

const line = (ax, ay, bx, by, density = 1) => ({
  weight: Math.hypot(bx - ax, by - ay) * density,
  at: (u) => [ax + (bx - ax) * u, ay + (by - ay) * u],
})

const arc = (cx, cy, r, a0 = 0, a1 = Math.PI * 2) => ({
  weight: Math.abs(a1 - a0) * r,
  at: (u) => {
    const a = a0 + (a1 - a0) * u
    return [cx + Math.cos(a) * r, cy + Math.sin(a) * r]
  },
})

const curve = (ax, ay, cx, cy, bx, by) => {
  const at = (u) => {
    const v = 1 - u
    return [v * v * ax + 2 * v * u * cx + u * u * bx, v * v * ay + 2 * v * u * cy + u * u * by]
  }
  let length = 0
  let prev = at(0)
  for (let i = 1; i <= 16; i++) {
    const next = at(i / 16)
    length += Math.hypot(next[0] - prev[0], next[1] - prev[1])
    prev = next
  }
  return { weight: length, at }
}

const disc = (cx, cy, r, density = 1) => ({
  weight: Math.PI * r * r * density * FILL_K,
  at: (_u, rand) => {
    const a = rand() * Math.PI * 2
    const rr = Math.sqrt(rand()) * r
    return [cx + Math.cos(a) * rr, cy + Math.sin(a) * rr]
  },
})

const polyFill = (pts, density = 1) => {
  const xs = pts.map((p) => p[0])
  const ys = pts.map((p) => p[1])
  const minX = Math.min(...xs)
  const maxX = Math.max(...xs)
  const minY = Math.min(...ys)
  const maxY = Math.max(...ys)
  let area = 0
  for (let i = 0; i < pts.length; i++) {
    const [x1, y1] = pts[i]
    const [x2, y2] = pts[(i + 1) % pts.length]
    area += x1 * y2 - x2 * y1
  }
  area = Math.abs(area) / 2
  const inside = (x, y) => {
    let hit = false
    for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
      const [xi, yi] = pts[i]
      const [xj, yj] = pts[j]
      if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) hit = !hit
    }
    return hit
  }
  return {
    weight: area * density * FILL_K,
    at: (_u, rand) => {
      for (let k = 0; k < 60; k++) {
        const x = minX + rand() * (maxX - minX)
        const y = minY + rand() * (maxY - minY)
        if (inside(x, y)) return [x, y]
      }
      return pts[0]
    },
  }
}

// A sine wave that turns dashed after `dashFrom` — the dashed tail reads
// as the forecast, the solid part as observed history.
const sine = (x0, x1, y0, amp, freq, phase, dashFrom = Infinity) => {
  const solidEnd = Math.min(dashFrom, x1)
  const solidLen = solidEnd - x0
  const dashLen = Math.max(0, x1 - solidEnd) * 0.5
  const dashes = 5
  return {
    weight: (solidLen + dashLen) * 1.25,
    at: (u) => {
      const d = u * (solidLen + dashLen)
      let x
      if (d <= solidLen || dashLen === 0) {
        x = x0 + Math.min(d, solidLen)
      } else {
        const dd = (d - solidLen) / dashLen
        const k = Math.min(dashes - 1, Math.floor(dd * dashes))
        const f = dd * dashes - k
        x = solidEnd + ((k + f * 0.5) / dashes) * (x1 - solidEnd)
      }
      return [x, y0 + amp * Math.sin(freq * x + phase)]
    },
  }
}

// Outer outline of overlapping circles, clipped at a flat base.
const cloudOutline = (circles, base) => {
  const radiusSum = circles.reduce((s, c) => s + c[2], 0)
  return {
    weight: circles.reduce((s, c) => s + 2 * Math.PI * c[2], 0) * 0.55,
    at: (_u, rand) => {
      for (let k = 0; k < 100; k++) {
        let pick = rand() * radiusSum
        let c = circles[0]
        for (const candidate of circles) {
          pick -= candidate[2]
          if (pick <= 0) {
            c = candidate
            break
          }
        }
        const a = rand() * Math.PI * 2
        const x = c[0] + Math.cos(a) * c[2]
        const y = c[1] + Math.sin(a) * c[2]
        if (y < base) continue
        if (circles.some((o) => o !== c && Math.hypot(x - o[0], y - o[1]) < o[2] - 0.01)) continue
        return [x, y]
      }
      return [0, base]
    },
  }
}

// ---- shapes, all fitted inside roughly x ∈ [-1.1, 1.1], y ∈ [-0.92, 0.92] ----

const DEFINITIONS = {
  cap: () => [
    line(0, 0.62, 1.05, 0.2),
    line(1.05, 0.2, 0, -0.22),
    line(0, -0.22, -1.05, 0.2),
    line(-1.05, 0.2, 0, 0.62),
    polyFill(
      [
        [0, 0.62],
        [1.05, 0.2],
        [0, -0.22],
        [-1.05, 0.2],
      ],
      0.35,
    ),
    line(-0.55, 0.0, -0.55, -0.48),
    line(0.55, 0.0, 0.55, -0.48),
    curve(-0.55, -0.48, 0, -0.68, 0.55, -0.48),
    line(0, 0.2, 0.82, 0.05),
    line(0.82, 0.05, 0.82, -0.42),
    disc(0.82, -0.5, 0.07, 1.4),
  ],

  ethereum: () => [
    line(0, 0.92, -0.58, 0.04),
    line(0, 0.92, 0.58, 0.04),
    line(-0.58, 0.04, 0, -0.2),
    line(0.58, 0.04, 0, -0.2),
    line(0, 0.92, 0, -0.2),
    polyFill(
      [
        [0, 0.92],
        [-0.58, 0.04],
        [0, -0.2],
      ],
      0.55,
    ),
    line(-0.58, -0.1, 0, -0.92),
    line(0.58, -0.1, 0, -0.92),
    line(-0.58, -0.1, 0, -0.34),
    line(0.58, -0.1, 0, -0.34),
    polyFill(
      [
        [-0.58, -0.1],
        [0, -0.34],
        [0, -0.92],
      ],
      0.45,
    ),
  ],

  cloud: () => [
    cloudOutline(
      [
        [-0.62, -0.12, 0.26],
        [-0.18, 0.14, 0.38],
        [0.34, 0.04, 0.31],
        [0.72, -0.18, 0.2],
      ],
      -0.36,
    ),
    line(-0.72, -0.36, 0.81, -0.36),
    // Centred on the cloud's interior (between the base and the top lobe).
    line(-0.26, 0.08, -0.06, -0.1),
    line(-0.06, -0.1, 0.3, 0.28),
  ],

  chart: () => {
    const floor = -0.72
    const w = 0.13
    const bars = [
      [-0.6, -0.2],
      [-0.2, 0.05],
      [0.2, -0.32],
      [0.6, 0.38],
    ]
    const trend = [
      [-0.6, 0.02],
      [-0.2, 0.26],
      [0.2, -0.08],
      [0.6, 0.62],
    ]
    const prims = [line(-0.95, floor, 0.98, floor), line(-0.95, floor, -0.95, 0.78)]
    bars.forEach(([cx, top]) => {
      prims.push(line(cx - w, floor, cx - w, top), line(cx - w, top, cx + w, top), line(cx + w, top, cx + w, floor))
    })
    prims.push(
      polyFill(
        [
          [0.6 - w, floor],
          [0.6 - w, 0.38],
          [0.6 + w, 0.38],
          [0.6 + w, floor],
        ],
        0.6,
      ),
    )
    for (let i = 0; i < trend.length - 1; i++) prims.push(line(...trend[i], ...trend[i + 1]))
    trend.forEach(([x, y]) => prims.push(arc(x, y, 0.055)))
    return prims
  },

  waves: () => [
    sine(-1.1, 1.1, 0.48, 0.14, 4.2, 0.0, 0.35),
    sine(-1.1, 1.1, 0.0, 0.18, 3.4, 1.3, 0.35),
    sine(-1.1, 1.1, -0.48, 0.12, 5.0, 2.4, 0.35),
    line(0.35, -0.8, 0.35, 0.8, 0.45),
  ],

  lineage: () => {
    const sources = [
      [-0.95, 0.58],
      [-0.95, 0.0],
      [-0.95, -0.58],
    ]
    const hub = [0.0, 0.08]
    const target = [0.95, 0.08]
    const side = [0.0, -0.58]
    const prims = []
    sources.forEach(([x, y]) => {
      prims.push(arc(x, y, 0.1), curve(x + 0.1, y, -0.45, y, hub[0] - 0.17, hub[1]))
    })
    prims.push(arc(hub[0], hub[1], 0.17), disc(hub[0], hub[1], 0.15, 1.3))
    prims.push(curve(hub[0] + 0.17, hub[1], 0.45, hub[1] + 0.25, target[0] - 0.12, target[1]), arc(target[0], target[1], 0.12))
    prims.push(
      curve(-0.85, -0.58, -0.4, -0.58, side[0] - 0.08, side[1]),
      arc(side[0], side[1], 0.08),
      curve(side[0] + 0.08, side[1], 0.5, side[1], target[0] - 0.08, target[1] - 0.09),
    )
    return prims
  },
}

function build(prims, seed) {
  const rand = mulberry32(seed)
  const total = prims.reduce((s, p) => s + p.weight, 0)
  const counts = prims.map((p) => Math.floor((p.weight / total) * POINT_COUNT))
  let remainder = POINT_COUNT - counts.reduce((s, c) => s + c, 0)
  for (let i = 0; remainder > 0; i = (i + 1) % counts.length, remainder--) counts[i]++

  const pts = []
  prims.forEach((p, pi) => {
    const n = counts[pi]
    for (let i = 0; i < n; i++) {
      const u = (i + rand() * 0.9) / n
      const [x, y] = p.at(u, rand)
      pts.push([x + (rand() - 0.5) * JITTER, y + (rand() - 0.5) * JITTER, (rand() - 0.5) * 0.08])
    }
  })

  // Ordering by angle keeps the morph coherent: each point travels to a
  // neighbouring region of the next shape instead of across the canvas.
  pts.sort((a, b) => Math.atan2(a[1], a[0]) - Math.atan2(b[1], b[0]))

  const out = new Float32Array(POINT_COUNT * 3)
  pts.forEach((p, i) => out.set(p, i * 3))
  return out
}

export const SHAPES = Object.fromEntries(
  Object.entries(DEFINITIONS).map(([key, define], i) => [key, build(define(), 1009 + i * 97)]),
)
