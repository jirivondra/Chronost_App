import fs from 'node:fs'
import path from 'node:path'

function argFor(argv, flag) {
  const index = argv.indexOf(flag)
  if (-1 === index) {
    throw new Error(`Missing required argument ${flag}`)
  }
  return argv[index + 1]
}

function generatedKeys(generatedDir) {
  return fs
    .readdirSync(generatedDir)
    .filter((file) => file.endsWith('.json'))
    .map((file) => file.slice(0, -'.json'.length))
}

function main() {
  const argv = process.argv.slice(2)
  const generatedDir = argFor(argv, '--generated')
  const scriptsDir = argFor(argv, '--scripts')
  const manifestPath = argFor(argv, '--manifest')
  const outPath = argFor(argv, '--out')

  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'))
  const manifestKeys = new Set(Object.keys(manifest))

  const unwiredEndpoints = generatedKeys(generatedDir).filter((key) => !manifestKeys.has(key))
  const missingScripts = Object.keys(manifest).filter(
    (key) => !fs.existsSync(path.join(scriptsDir, `${key}.js`))
  )

  const lines = ['## Postman sync checklist', '']

  if (0 === unwiredEndpoints.length && 0 === missingScripts.length) {
    lines.push('Nothing to review — every endpoint is wired up and has a test script.')
  } else {
    if (unwiredEndpoints.length > 0) {
      lines.push(
        'New endpoints with no request wired up yet (add one to `sync-manifest.json`):',
        ''
      )
      unwiredEndpoints.forEach((key) => lines.push(`- [ ] \`${key}\``))
      lines.push('')
    }
    if (missingScripts.length > 0) {
      lines.push('Requests with no test script yet (add `scripts/<key>.js`):', '')
      missingScripts.forEach((key) => lines.push(`- [ ] \`${key}\``))
    }
  }

  fs.writeFileSync(outPath, `${lines.join('\n')}\n`)
  console.log(
    `Wrote checklist to ${outPath} (${unwiredEndpoints.length} unwired, ${missingScripts.length} missing scripts)`
  )
}

main()
