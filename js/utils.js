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
  return d.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric', year: 'numeric' })
}

export function formatDateTime(iso) {
  if (!iso) return '—'
  const d = new Date(iso)
  return d.toLocaleString('zh-CN', {
    month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
    hour12: false
  })
}

export function formatTimeOnly(iso) {
  if (!iso) return '—'
  const d = new Date(iso)
  return d.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })
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
  if (!status) return '未知'
  const s = status.toLowerCase()
  if (s === 'up' || s === 'operational') return '正常'
  if (s.includes('degraded')) return '降级'
  if (s.includes('outage') || s === 'down') return '中断'
  if (s.includes('maintenance')) return '维护中'
  return '未知'
}

export function getOverallStatus(services) {
  if (!services || !services.length) return { class: 'unknown', text: '暂无服务', desc: '暂未配置服务。' }
  const statuses = services.map(s => getStatusClass(s.status))
  if (statuses.every(s => s === 'operational')) {
    return { class: 'operational', text: '所有系统正常运行', desc: '所有 GTA:Yonder 服务运行正常。' }
  }
  if (statuses.every(s => s === 'outage')) {
    return { class: 'outage', text: '大规模服务中断', desc: '所有服务当前均出现问题。' }
  }
  if (statuses.some(s => s === 'outage')) {
    return { class: 'outage', text: '部分服务中断', desc: '部分服务当前出现问题。' }
  }
  if (statuses.some(s => s === 'degraded')) {
    return { class: 'degraded', text: '性能降低', desc: '部分系统性能有所降低。' }
  }
  if (statuses.some(s => s === 'maintenance')) {
    return { class: 'maintenance', text: '计划维护', desc: '部分服务正在进行计划维护。' }
  }
  return { class: 'operational', text: '所有系统正常运行', desc: '所有 GTA:Yonder 服务运行正常。' }
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
