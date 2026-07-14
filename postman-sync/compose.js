import fs from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

function argFor(argv, flag) {
  const index = argv.indexOf(flag)
  if (-1 === index) {
    throw new Error(`Missing required argument ${flag}`)
  }
  return argv[index + 1]
}

// Script modules store their text as `\n...\n` template literals for readability;
// strip the surrounding blank lines so the Postman "exec" array matches what was written.
function buildEvent(listen, scriptText) {
  const trimmed = scriptText.replace(/^\n/, '').replace(/\n$/, '')
  return {
    listen,
    script: {
      exec: trimmed.split('\n'),
      type: 'text/javascript',
      packages: {},
      requests: {},
    },
  }
}

// This collection addresses the host via literal variable placeholders baked into the path
// segments (e.g. "{{todo_id}}"), not Postman's ":param" path-variable feature, and the host
// array is a single "{{protocol}}{{host}}{{port}}" placeholder — not a real hostname. Only the
// path *segments* are spec-derived; host/raw prefix always comes from the request being synced,
// so the sync never depends on a "baseUrl" environment variable this collection doesn't define.
function buildUrl(currentUrl, skeletonPathSegments) {
  const path = skeletonPathSegments.map((segment) =>
    segment.startsWith(':') ? `{{${segment.slice(1)}}}` : segment
  )
  const hostPrefix = currentUrl.host.join('')
  return { raw: `${hostPrefix}/${path.join('/')}`, host: currentUrl.host, path }
}

async function loadScript(scriptsDir, key) {
  const scriptPath = path.join(scriptsDir, `${key}.js`)
  if (!fs.existsSync(scriptPath)) {
    return null
  }
  return import(pathToFileURL(scriptPath).href)
}

function walkAndSync(items, reverseManifest, generatedDir, scriptModules, warnings) {
  for (const item of items) {
    if (item.item) {
      walkAndSync(item.item, reverseManifest, generatedDir, scriptModules, warnings)
      continue
    }

    const key = reverseManifest.get(item.name)
    if (!key) {
      continue
    }

    const skeletonPath = path.join(generatedDir, `${key}.json`)
    if (!fs.existsSync(skeletonPath)) {
      warnings.push(
        `Manifest maps "${item.name}" to "${key}", but no generated skeleton exists for it ` +
          '(removed from the spec?) — left untouched.'
      )
      continue
    }

    const skeleton = JSON.parse(fs.readFileSync(skeletonPath, 'utf8'))
    item.request.method = skeleton.request.method
    item.request.url = buildUrl(item.request.url, skeleton.request.url.path)

    const events = []
    const scriptModule = scriptModules.get(key)
    if (scriptModule?.prerequest) {
      events.push(buildEvent('prerequest', scriptModule.prerequest))
    }
    if (scriptModule?.test) {
      events.push(buildEvent('test', scriptModule.test))
    }
    item.event = events
  }
}

async function main() {
  const argv = process.argv.slice(2)
  const generatedDir = argFor(argv, '--generated')
  const scriptsDir = argFor(argv, '--scripts')
  const manifestPath = argFor(argv, '--manifest')
  const currentPath = argFor(argv, '--current')
  const outPath = argFor(argv, '--out')

  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'))
  const reverseManifest = new Map(Object.entries(manifest).map(([key, name]) => [name, key]))
  const collection = JSON.parse(fs.readFileSync(currentPath, 'utf8'))

  const scriptModules = new Map()
  for (const key of Object.keys(manifest)) {
    const scriptModule = await loadScript(scriptsDir, key)
    if (scriptModule) {
      scriptModules.set(key, scriptModule)
    }
  }

  const warnings = []
  walkAndSync(collection.item, reverseManifest, generatedDir, scriptModules, warnings)
  warnings.forEach((warning) => console.warn(warning))

  fs.writeFileSync(outPath, `${JSON.stringify(collection, null, 2)}\n`)
  console.log(`Wrote synced collection to ${outPath}`)
}

main()
