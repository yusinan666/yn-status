// =========================================================
//  GTA:Yonder — Main App
// =========================================================

import { initTheme, setupThemeSwitch, themeIcons } from './theme.js'
import { renderServices, renderSkeleton } from './services.js'
import {
  formatTime, formatUptime, formatDateTime,
  getOverallStatus, calculateAvgResponse, calculateOverallUptime,
  getTimeFields, el
} from './utils.js'

const DATA_URL = './data/summary.json'
let currentRange = '7d'
let servicesData = null

// Lucide-style icons
const ICONS = {
  refresh: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/></svg>',
  github: '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>',
  zap: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>',
  activity: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>',
  check: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>'
}

async function fetchData() {
  try {
    const res = await fetch(DATA_URL)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return await res.json()
  } catch (err) {
    console.error('Failed to fetch data:', err)
    return null
  }
}

function renderHeader() {
  return `
    <header class="header">
      <div class="container header-inner">
        <div class="header-brand">
          <span class="header-logo">GTA:Yonder</span>
          <span class="header-divider"></span>
          <span class="header-subtitle">Service Status</span>
        </div>
        <div class="header-actions">
          <a href="/" class="header-link active">${ICONS.activity} <span>Status</span></a>
          <a href="https://github.com/yusinan666/yn-status" target="_blank" class="header-link">${ICONS.github} <span>GitHub</span></a>
          <div class="theme-switch">
            <button class="theme-btn" data-theme="system" title="System">${themeIcons.system}</button>
            <button class="theme-btn" data-theme="dark" title="Dark">${themeIcons.dark}</button>
            <button class="theme-btn" data-theme="light" title="Light">${themeIcons.light}</button>
          </div>
        </div>
      </div>
    </header>
  `
}

function renderHero() {
  return `
    <section class="hero fade-in">
      <div class="container">
        <div class="hero-label">GTA:Yonder</div>
        <h1 class="hero-title">Service Status</h1>
        <p class="hero-desc">Real-time infrastructure monitoring for the GTA:Yonder community.</p>
      </div>
    </section>
  `
}

function renderStatusBanner(services) {
  const status = getOverallStatus(services)
  const now = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })

  return `
    <div class="container fade-in fade-in-delay-1">
      <div class="status-banner">
        <div class="status-banner-left">
          <span class="status-dot ${status.class}"></span>
          <div>
            <div class="status-banner-title">${status.text}</div>
            <div class="status-banner-desc">${status.desc}</div>
          </div>
        </div>
        <div class="status-banner-right">
          <div class="status-banner-label">Updated</div>
          <div class="status-banner-time">${now}</div>
        </div>
      </div>
    </div>
  `
}

function renderOverview(services, range) {
  const fields = getTimeFields(range)
  const avgResponse = calculateAvgResponse(services, fields.time)
  const overallUptime = calculateOverallUptime(services, fields.uptime)
  const operational = services ? services.filter(s => s.status === 'up').length : 0
  const total = services ? services.length : 0

  return `
    <div class="container">
      <div class="section-title fade-in fade-in-delay-2">System Overview</div>
      <div class="overview-grid fade-in fade-in-delay-2">
        <div class="overview-card">
          <div class="overview-value">${formatUptime(overallUptime)}</div>
          <div class="overview-label">Overall Uptime</div>
        </div>
        <div class="overview-card">
          <div class="overview-value">${formatTime(avgResponse)}</div>
          <div class="overview-label">Average Response</div>
        </div>
        <div class="overview-card">
          <div class="overview-value">${operational} / ${total}</div>
          <div class="overview-label">Services Operational</div>
        </div>
      </div>
    </div>
  `
}

function renderTimeTabs() {
  const ranges = [
    { key: '24h', label: '24H' },
    { key: '7d', label: '7D' },
    { key: '30d', label: '30D' },
    { key: '1y', label: '1Y' },
    { key: 'all', label: 'ALL' }
  ]

  return `
    <div class="time-tabs">
      ${ranges.map(r => `
        <button class="time-tab ${r.key === currentRange ? 'active' : ''}" data-range="${r.key}">${r.label}</button>
      `).join('')}
    </div>
  `
}

function renderError() {
  return `
    <div class="container">
      <div class="error-state">
        <div class="error-title">Unable to retrieve service status</div>
        <div class="error-desc">Please check your connection and try again.</div>
        <button class="btn-retry" id="btn-retry">${ICONS.refresh} Retry</button>
      </div>
    </div>
  `
}

function updateOverview(services, range) {
  const fields = getTimeFields(range)
  const avgResponse = calculateAvgResponse(services, fields.time)
  const overallUptime = calculateOverallUptime(services, fields.uptime)
  const operational = services.filter(s => s.status === 'up').length

  const cards = document.querySelectorAll('.overview-card')
  if (cards[0]) cards[0].querySelector('.overview-value').textContent = formatUptime(overallUptime)
  if (cards[1]) cards[1].querySelector('.overview-value').textContent = formatTime(avgResponse)
  if (cards[2]) cards[2].querySelector('.overview-value').textContent = `${operational} / ${services.length}`
}

async function init() {
  // Init theme
  initTheme()

  // Render shell
  const app = document.getElementById('app')
  app.innerHTML = `
    ${renderHeader()}
    ${renderHero()}
    <div id="status-banner"></div>
    <div id="overview"></div>
    <div class="container">
      <div class="section">
        <div class="services-header fade-in fade-in-delay-3">
          <div class="services-title">Services</div>
          <div id="time-tabs">${renderTimeTabs()}</div>
        </div>
        <div id="services"></div>
      </div>
    </div>
    <footer class="footer">
      <div class="container footer-inner">
        <div class="footer-brand">
          <span class="footer-name">GTA:Yonder</span>
          <span class="footer-copy">Service Status</span>
        </div>
        <div class="footer-links">
          <a href="https://github.com/yusinan666/yn-status" target="_blank" class="footer-link">GitHub</a>
        </div>
        <div class="footer-powered">Powered by Upptime</div>
      </div>
    </footer>
  `

  // Setup theme switch
  setupThemeSwitch()

  // Show skeleton
  const servicesContainer = document.getElementById('services')
  renderSkeleton(servicesContainer)

  // Fetch data
  servicesData = await fetchData()

  if (!servicesData) {
    app.innerHTML = renderHeader() + renderHero() + renderError()
    setupThemeSwitch()
    document.getElementById('btn-retry')?.addEventListener('click', () => init())
    return
  }

  // Render status banner
  document.getElementById('status-banner').innerHTML = renderStatusBanner(servicesData)

  // Render overview
  document.getElementById('overview').innerHTML = renderOverview(servicesData, currentRange)

  // Render services
  renderServices(servicesData, currentRange, servicesContainer)

  // Time tab click
  document.getElementById('time-tabs')?.addEventListener('click', (e) => {
    const tab = e.target.closest('.time-tab')
    if (!tab) return

    currentRange = tab.dataset.range
    document.querySelectorAll('.time-tab').forEach(t => t.classList.toggle('active', t === tab))
    updateOverview(servicesData, currentRange)
    renderServices(servicesData, currentRange, servicesContainer)
  })
}

init()
