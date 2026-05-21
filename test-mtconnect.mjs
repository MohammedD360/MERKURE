/**
 * Script de test MTConnectAPI
 * Usage: node test-mtconnect.mjs [accountId] [password] [server]
 * Ex:    node test-mtconnect.mjs 204528 3gekzrcU PepperstoneUK-Demo03
 */

const API_URL = 'https://app.mtconnectapi.com/api/api.php'
const CALLER  = 'JehhlQ5wmq0tG0HodnHOkM3xvflJhTrG'

// Usage: node test-mtconnect.mjs <apikey> <accountId> <password> [server]
const [,, apiKey = CALLER, accountId = '204528', upass = '3gekzrcU', server] = process.argv
const CALLER_KEY = apiKey

const SERVERS_TO_TEST = server
  ? [server]
  : [
      '18.175.71.18:443',
      'mt4-global-demo03.mq.pepperstone.com:443',
      'demo03.pepperstone.com:443',
      '18.175.71.18:80',
    ]

async function test(tradeserver) {
  const uid = `merkure${accountId}`.slice(0, 20)
  const params = new URLSearchParams({
    caller:     CALLER_KEY,
    uid,
    tradeserver,
    uacc:       accountId,
    upass,
    suffix:     '',
    lastticket: '0',
  })

  try {
    const res = await fetch(API_URL, {
      method:  'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body:    params.toString(),
    })
    const text = await res.text()
    const hasH = text.includes('\nH,') || text.startsWith('H,')
    const preview = text.slice(0, 200).replace(/\n/g, ' | ')
    return { ok: hasH, preview, status: res.status }
  } catch (err) {
    return { ok: false, preview: err.message, status: 0 }
  }
}

console.log(`\nTest MTConnectAPI — compte ${accountId} | caller: ${CALLER_KEY.slice(0,8)}...\n${'─'.repeat(60)}`)

for (const srv of SERVERS_TO_TEST) {
  process.stdout.write(`Testing: ${srv.padEnd(45)} `)
  const { ok, preview, status } = await test(srv)
  if (ok) {
    console.log(`✅ OK (HTTP ${status})`)
    console.log(`   Réponse: ${preview}`)
  } else {
    console.log(`❌ FAIL (HTTP ${status})`)
    console.log(`   Réponse: ${preview}`)
  }
  // Petite pause pour éviter rate limiting
  await new Promise(r => setTimeout(r, 500))
}
