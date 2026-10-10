// =========================================================
//  GTA:Yonder — Services Rendering
// =========================================================

import {
  formatTime, formatUptime, formatDateTime, formatTimeOnly,
  getUptimeClass, getStatusClass, getStatusText,
  getTimeFields, el
} from './utils.js'

// Service icons (Lucide-style SVG)
const ICONS = {
  server: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="8" rx="2"/><rect x="2" y="14" width="20" height="8" rx="2"/><line x1="6" y1="6" x2="6.01" y2="6"/><line x1="6" y1="18" x2="6.01" y2="18"/></svg>',
  globe: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg>',
  database: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>',
  cloud: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 10h-1.26A8 8 0 109 20h9a5 5 0 000-10z"/></svg>',
  github: '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>',
  gamepad: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="6" y1="12" x2="10" y2="12"/><line x1="8" y1="10" x2="8" y2="14"/><line x1="15" y1="13" x2="15.01" y2="13"/><line x1="18" y1="11" x2="18.01" y2="11"/><path d="M17.32 5H6.68a4 4 0 00-3.978 3.59c-.006.052-.01.101-.017.152C2.604 9.416 2 14.456 2 16a3 3 0 003 3c1 0 1.5-.5 2-1l1.414-1.414A2 2 0 019.828 16h4.344a2 2 0 011.414.586L17 18c.5.5 1 1 2 1a3 3 0 003-3c0-1.545-.604-6.584-.685-7.258-.007-.05-.011-.1-.017-.151A4 4 0 0017.32 5z"/></svg>',
  default: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>'
}

function getServiceIcon(name) {
  const n = (name || '').toLowerCase()
  if (n.includes('fivem') || n.includes('game') || n.includes('server')) return ICONS.gamepad
  if (n.includes('web') || n.includes('site') || n.includes('forum')) return ICONS.globe
  if (n.includes('api')) return ICONS.server
  if (n.includes('db') || n.includes('database') || n.includes('mysql')) return ICONS.database
  if (n.includes('cdn') || n.includes('img') || n.includes('image') || n.includes('图床')) return ICONS.cloud
  if (n.includes('github')) return ICONS.github
  return ICONS.default
}

// Generate uptime timeline blocks
function generateTimeline(service) {
  const container = el('div', { className: 'timeline-blocks' })

  // Generate 90 days of timeline
  const days = 90
  const now = new Date()
  const dailyDown = service.dailyMinutesDown || {}

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now)
    date.setDate(date.getDate() - i)
    const dateStr = date.toISOString().split('T')[0]

    const downMinutes = dailyDown[dateStr] || 0
    let status = 'up'
    if (downMinutes > 0 && downMinutes < 1440) status = 'degraded'
    else if (downMinutes >= 1440) status = 'down'

    // If service was just created and we don't have data for this day
    const startDate = service.startTime ? new Date(service.startTime) : null
    if (startDate && date < startDate) status = 'no-data'

    const block = el('div', {
      className: `timeline-block ${status}`,
      style: `height: ${status === 'up' ? '100%' : status === 'no-data' ? '30%' : '70%'}`
    })

    const tooltip = el('div', { className: 'timeline-tooltip' })
    tooltip.innerHTML = `
      <div class="timeline-tooltip-date">${date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
      <div class="timeline-tooltip-status">${status === 'no-data' ? '无数据' : status === 'up' ? '正常' : status === 'degraded' ? '降级' : '中断'}</div>
    `
    block.appendChild(tooltip)
    container.appendChild(block)
  }

  return container
}

// Render a single service card
export function renderServiceCard(service, timeRange) {
  const fields = getTimeFields(timeRange)
  const uptime = service[fields.uptime] || service.uptime || '100.00%'
  const responseTime = service[fields.time] || service.time || 0
  const statusClass = getStatusClass(service.status)
  const uptimeClass = getUptimeClass(uptime)

  const card = el('div', { className: 'service-card fade-in' })

  card.innerHTML = `
    <div class="service-header">
      <div class="service-info">
        <div class="service-icon">${getServiceIcon(service.name)}</div>
        <div>
          <div class="service-name">${escapeHtml(service.name)}</div>
          <div class="service-desc">${escapeHtml(service.url || '')}</div>
        </div>
      </div>
      <div class="service-status ${statusClass}">
        <span class="service-status-dot ${statusClass}"></span>
        ${getStatusText(service.status)}
      </div>
    </div>

    <div class="uptime-section">
      <div class="uptime-label">
        <span class="uptime-text">可用率</span>
        <span class="uptime-value">${formatUptime(uptime)}</span>
      </div>
      <div class="uptime-bar">
        <div class="uptime-bar-fill ${uptimeClass}" style="width: ${parseFloat(uptime)}%"></div>
      </div>
    </div>

    <div class="service-meta">
      <div class="meta-item">
        <span class="meta-icon"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg></span>
        <span>响应：</span>
        <span class="meta-value">${formatTime(responseTime)}</span>
      </div>
      <div class="meta-item">
        <span class="meta-icon"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg></span>
        <span>检测：</span>
        <span class="meta-value">${formatTimeOnly(new Date().toISOString())}</span>
      </div>
    </div>
  `

  // Add timeline
  const timelineSection = el('div', { className: 'timeline-section' })
  timelineSection.innerHTML = `
    <div class="timeline-label">
      <span class="timeline-text">90 天可用率</span>
    </div>
  `
  timelineSection.appendChild(generateTimeline(service))
  card.appendChild(timelineSection)

  return card
}

// Render all services
export function renderServices(services, timeRange, container) {
  container.innerHTML = ''

  if (!services || !services.length) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon"><svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="2" width="20" height="8" rx="2"/><rect x="2" y="14" width="20" height="8" rx="2"/><line x1="6" y1="6" x2="6.01" y2="6"/><line x1="6" y1="18" x2="6.01" y2="18"/></svg></div>
        <div class="empty-title">暂未配置服务</div>
        <div class="empty-desc">配置完成后，服务将显示在此处。</div>
      </div>
    `
    return
  }

  services.forEach(service => {
    container.appendChild(renderServiceCard(service, timeRange))
  })
}

// Render skeleton loading
export function renderSkeleton(container) {
  container.innerHTML = ''
  for (let i = 0; i < 3; i++) {
    const card = el('div', { className: 'skeleton-card' })
    card.innerHTML = `
      <div style="display:flex;justify-content:space-between;margin-bottom:16px">
        <div style="display:flex;gap:12px;align-items:center">
          <div class="skeleton" style="width:40px;height:40px;border-radius:8px"></div>
          <div>
            <div class="skeleton skeleton-line w-40"></div>
            <div class="skeleton skeleton-line w-60" style="height:10px;margin-top:6px"></div>
          </div>
        </div>
        <div class="skeleton skeleton-line" style="width:80px;height:24px"></div>
      </div>
      <div class="skeleton skeleton-line w-100 h-6" style="margin-bottom:8px"></div>
      <div class="skeleton skeleton-line w-80 h-6"></div>
    `
    container.appendChild(card)
  }
}

function escapeHtml(str) {
  const div = document.createElement('div')
  div.textContent = str
  return div.innerHTML
}
