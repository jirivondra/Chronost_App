import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import { buildUrl } from './build-url.js'

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

function findFolder(items, name) {
  for (const item of items) {
    if (item.item && item.name === name) {
      return item
    }
  }
  return null
}

// Only used to copy this collection's own host/URL convention onto a brand-new request — see
// build-url.js for why the host can't just be taken from the generated skeleton.
function findAnyRequestUrl(items) {
  for (const item of items) {
    if (item.item) {
      const found = findAnyRequestUrl(item.item)
      if (found) {
        return found
      }
    } else if (item.request) {
      return item.request.url
    }
  }
  return null
}

function buildTestScript(successStatus) {
  if (!successStatus) {
    return `pm.test('Request succeeds', function () {\n    pm.response.to.be.success;\n});`
  }
  return `pm.test('Status code is ${successStatus}', function () {\n    pm.response.to.have.status(${successStatus});\n});`
}

function main() {
  const argv = process.argv.slice(2)
  const generatedDir = argFor(argv, '--generated')
  const scriptsDir = argFor(argv, '--scripts')
  const manifestPath = argFor(argv, '--manifest')
  const collectionPath = argFor(argv, '--collection')
  const folderName = argFor(argv, '--folder')
  const reportPath = argFor(argv, '--report')

  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'))
  const collection = JSON.parse(fs.readFileSync(collectionPath, 'utf8'))
  const manifestKeys = new Set(Object.keys(manifest))
  const unwiredKeys = generatedKeys(generatedDir).filter((key) => !manifestKeys.has(key))

  if (0 === unwiredKeys.length) {
    fs.writeFileSync(reportPath, '')
    console.log('No new endpoints to wire up.')
    return
  }

  const folder = findFolder(collection.item, folderName)
  if (!folder) {
    throw new Error(`Folder "${folderName}" not found in the collection`)
  }
  const referenceUrl = findAnyRequestUrl(folder.item) ?? findAnyRequestUrl(collection.item)
  if (!referenceUrl) {
    throw new Error('No existing request found in the collection to copy the host convention from')
  }

  const wired = []
  for (const key of unwiredKeys) {
    const skeleton = JSON.parse(fs.readFileSync(path.join(generatedDir, `${key}.json`), 'utf8'))

    fs.writeFileSync(
      path.join(scriptsDir, `${key}.js`),
      `export const test = \`\n${buildTestScript(skeleton._meta?.successStatus)}\n\`\n`
    )

    folder.item.push({
      id: skeleton.id ?? crypto.randomUUID(),
      name: skeleton.name,
      request: {
        method: skeleton.request.method,
        header: skeleton.request.header,
        body: skeleton.request.body,
        url: buildUrl(referenceUrl, skeleton.request.url.path),
        description: skeleton.request.description,
      },
      response: [],
    })

    manifest[key] = skeleton.name
    wired.push({ key, name: skeleton.name })
  }

  fs.writeFileSync(collectionPath, `${JSON.stringify(collection, null, 2)}\n`)
  fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`)

  const lines = [
    '## Auto-created endpoints',
    '',
    `The following ${wired.length} endpoint(s) had no request yet and were added automatically to the "${folderName}" folder, with a minimal generated test (status code only) — review the request and expand its test coverage:`,
    '',
    ...wired.map(({ key, name }) => `- [ ] \`${key}\` ("${name}")`),
  ]
  fs.writeFileSync(reportPath, `${lines.join('\n')}\n`)
  console.log(`Auto-wired ${wired.length} new endpoint(s): ${wired.map((w) => w.key).join(', ')}`)
}

main()
