// =========================================================
//  GTA:Yonder — Build Script
//  Reads Upptime data and builds the static site
// =========================================================

import { readFileSync, writeFileSync, mkdirSync, cpSync, existsSync, readdirSync, rmSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const SITE_DIR = join(__dirname, 'site')
const DIST_DIR = join(__dirname, 'dist')
const HISTORY_DIR = join(__dirname, 'history')

console.log('🔨 GTA:Yonder Status — Building...')

// Clean dist
if (existsSync(DIST_DIR)) {
  rmSync(DIST_DIR, { recursive: true })
}
mkdirSync(DIST_DIR, { recursive: true })

// Copy site/ to dist/
cpSync(SITE_DIR, DIST_DIR, { recursive: true })

// Create data/ directory
mkdirSync(join(DIST_DIR, 'data'), { recursive: true })

// Read and copy summary.json
const summaryPath = join(HISTORY_DIR, 'summary.json')
if (existsSync(summaryPath)) {
  const summaryData = readFileSync(summaryPath, 'utf-8')
  // Validate JSON
  try {
    JSON.parse(summaryData)
    writeFileSync(join(DIST_DIR, 'data', 'summary.json'), summaryData)
    console.log('✅ Copied summary.json')
  } catch (e) {
    console.error('⚠️ Invalid summary.json, writing empty array')
    writeFileSync(join(DIST_DIR, 'data', 'summary.json'), '[]')
  }
} else {
  console.log('⚠️ No summary.json found, writing empty array')
  writeFileSync(join(DIST_DIR, 'data', 'summary.json'), '[]')
}

// Read history YML files and convert to JSON for potential future use
const historyFiles = readdirSync(HISTORY_DIR).filter(f => f.endsWith('.yml') && f !== 'summary.json')
const historyData = {}
for (const file of historyFiles) {
  const name = file.replace('.yml', '')
  const content = readFileSync(join(HISTORY_DIR, file), 'utf-8')
  // Simple YAML parser for flat key-value pairs
  const data = {}
  for (const line of content.split('\n')) {
    const match = line.match(/^(\w+):\s*(.+)$/)
    if (match) {
      data[match[1]] = match[2].trim()
    }
  }
  historyData[name] = data
}
writeFileSync(join(DIST_DIR, 'data', 'history.json'), JSON.stringify(historyData, null, 2))
console.log(`✅ Processed ${historyFiles.length} history files`)

// Copy CNAME if exists
const cnamePath = join(__dirname, 'CNAME')
if (existsSync(cnamePath)) {
  cpSync(cnamePath, join(DIST_DIR, 'CNAME'))
  console.log('✅ Copied CNAME')
} else {
  // Create CNAME for custom domain
  writeFileSync(join(DIST_DIR, 'CNAME'), 'status.yntech.xyz')
  console.log('✅ Created CNAME')
}

// List dist contents
console.log('\n📦 Build output:')
function listDir(dir, prefix = '') {
  const items = readdirSync(dir, { withFileTypes: true })
  for (const item of items) {
    if (item.isDirectory()) {
      console.log(`${prefix}📁 ${item.name}/`)
      listDir(join(dir, item.name), prefix + '  ')
    } else {
      const size = readFileSync(join(dir, item.name)).length
      console.log(`${prefix}📄 ${item.name} (${size} bytes)`)
    }
  }
}
listDir(DIST_DIR)

console.log('\n✅ Build complete!')
