// =========================================================
//  GTA:Yonder — Utilities
// =========================================================

export function formatTime(ms) {
  if (!ms && ms !== 0) return '—'
  if (ms < 1000) return `${Math.round(ms)} ms`
  return `${(ms / 1000).toFixed(2)} s`
}

export function formatUptime(pct) {
  if (!pct && pct !== 0) return '—'
  return `${parseFloat(pct).toFixed(2)}%`
}

export function formatDate(iso) {
  if (!iso) return '—'
  const d = new Date(iso)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export function formatDateTime(iso) {
  if (!iso) return '—'
  const d = new Date(iso)
  return d.toLocaleString('en-US', {
    month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
    hour12: false
  })
}

export function formatTimeOnly(iso) {
  if (!iso) return '—'
  const d = new Date(iso)
  return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })
}

export function getUptimeClass(pct) {
  const v = parseFloat(pct)
  if (v >= 99.5) return 'excellent'
  if (v >= 95) return 'good'
  if (v >= 90) return 'fair'
  return 'poor'
}

export function getStatusClass(status) {
  if (!status) return 'unknown'
  const s = status.toLowerCase()
  if (s === 'up' || s === 'operational') return 'operational'
  if (s.includes('degraded')) return 'degraded'
  if (s.includes('outage') || s === 'down') return 'outage'
  if (s.includes('maintenance')) return 'maintenance'
  return 'operational'
}

export function getStatusText(status) {
  if (!status) return 'Unknown'
  const s = status.toLowerCase()
  if (s === 'up' || s === 'operational') return 'Operational'
  if (s.includes('degraded')) return 'Degraded'
  if (s.includes('outage') || s === 'down') return 'Outage'
  if (s.includes('maintenance')) return 'Maintenance'
  return 'Unknown'
}

export function getOverallStatus(services) {
  if (!services || !services.length) return { class: 'unknown', text: 'No Services', desc: 'No services configured.' }
  const statuses = services.map(s => getStatusClass(s.status))
  if (statuses.every(s => s === 'operational')) {
    return { class: 'operational', text: 'All Systems Operational', desc: 'All GTA:Yonder services are running normally.' }
  }
  if (statuses.every(s => s === 'outage')) {
    return { class: 'outage', text: 'Major System Outage', desc: 'All services are currently experiencing issues.' }
  }
  if (statuses.some(s => s === 'outage')) {
    return { class: 'outage', text: 'Partial System Outage', desc: 'Some services are currently experiencing issues.' }
  }
  if (statuses.some(s => s === 'degraded')) {
    return { class: 'degraded', text: 'Degraded Performance', desc: 'Some systems are experiencing degraded performance.' }
  }
  if (statuses.some(s => s === 'maintenance')) {
    return { class: 'maintenance', text: 'Scheduled Maintenance', desc: 'Some services are under scheduled maintenance.' }
  }
  return { class: 'operational', text: 'All Systems Operational', desc: 'All GTA:Yonder services are running normally.' }
}

export function calculateAvgResponse(services, field) {
  if (!services || !services.length) return 0
  const times = services.map(s => s[field] || s.time || 0).filter(t => t > 0)
  if (!times.length) return 0
  return Math.round(times.reduce((a, b) => a + b, 0) / times.length)
}

export function calculateOverallUptime(services, field) {
  if (!services || !services.length) return 0
  const uptimes = services.map(s => parseFloat(s[field] || s.uptime || '100')).filter(u => !isNaN(u))
  if (!uptimes.length) return 100
  return (uptimes.reduce((a, b) => a + b, 0) / uptimes.length)
}

export function getTimeFields(range) {
  const map = {
    '24h': { uptime: 'uptimeDay', time: 'timeDay' },
    '7d': { uptime: 'uptimeWeek', time: 'timeWeek' },
    '30d': { uptime: 'uptimeMonth', time: 'timeMonth' },
    '1y': { uptime: 'uptimeYear', time: 'timeYear' },
    'all': { uptime: 'uptime', time: 'time' }
  }
  return map[range] || map['7d']
}

export function el(tag, attrs, ...children) {
  const e = document.createElement(tag)
  if (attrs) Object.entries(attrs).forEach(([k, v]) => {
    if (k === 'className') e.className = v
    else if (k === 'innerHTML') e.innerHTML = v
    else if (k.startsWith('on')) e.addEventListener(k.slice(2).toLowerCase(), v)
    else e.setAttribute(k, v)
  })
  children.forEach(c => {
    if (typeof c === 'string') e.appendChild(document.createTextNode(c))
    else if (c) e.appendChild(c)
  })
  return e
}
