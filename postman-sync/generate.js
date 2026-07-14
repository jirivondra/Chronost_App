import fs from 'node:fs'
import path from 'node:path'
import { convert } from 'openapi-to-postmanv2'
import { canonicalKey } from './canonical-key.js'

function argFor(argv, flag) {
  const index = argv.indexOf(flag)
  if (-1 === index) {
    throw new Error(`Missing required argument ${flag}`)
  }
  return argv[index + 1]
}

function collectRequests(items, out) {
  for (const item of items) {
    if (item.item) {
      collectRequests(item.item, out)
    } else if (item.request) {
      out.push(item)
    }
  }
}

function main() {
  const argv = process.argv.slice(2)
  const specPath = argFor(argv, '--spec')
  const outDir = argFor(argv, '--out')
  const specData = fs.readFileSync(specPath, 'utf8')

  // Prefer the OpenAPI schema `example` (set via Pydantic model_config in api/main.py) over
  // generic type placeholders like "<string>", so a freshly wired-up request is directly usable.
  const options = {
    requestParametersResolution: 'example',
    exampleParametersResolution: 'example',
  }

  convert({ type: 'string', data: specData }, options, (err, result) => {
    if (err) {
      console.error(err)
      process.exit(1)
    }
    if (!result.result) {
      console.error(result.reason)
      process.exit(1)
    }

    const requests = []
    collectRequests(result.output[0].data.item, requests)

    fs.mkdirSync(outDir, { recursive: true })
    for (const request of requests) {
      const key = canonicalKey(request.request.method, request.request.url.path)
      fs.writeFileSync(path.join(outDir, `${key}.json`), JSON.stringify(request, null, 2))
    }

    console.log(`Generated ${requests.length} request skeleton(s) into ${outDir}`)
  })
}

main()
