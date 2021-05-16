const WebSocket = require('ws');
const fs = require('fs');

if (!fs.existsSync('packs')) fs.mkdirSync('packs');

const args = process.argv.slice(2);
if (!args[0]) throw new Error('Guild ID expected as first arg.')

const ws = new WebSocket('ws://localhost:6463/?v=1', {
  origin: 'https://discordapp.com'
});

const packs = [];
let pack = 0;

async function main(payload) {
  payload.emojis[args[0]].emojis.forEach((emoji) => {
    if (!packs[pack]) packs[pack] = { name: `Emoji pack ${pack + 1}`, author: 'Me!', emotes: [] };
    if (packs[pack].emotes.length === 30) {
      fs.writeFileSync(`packs/pack-${pack + 1}.json`, JSON.stringify(packs[pack], null, 2));
      console.log(`wrote packs/pack-${pack + 1}`);
      pack++;
    } else {
      packs[pack].emotes.push({
        name: emoji.name,
        url: emoji.url
      });
    }
  });
}

ws.on('message', async (msg) => {
  const data = JSON.parse(msg);

  switch (data.cmd) {
    case 'DISPATCH':
      if (data.evt === 'READY') {
        ws.send(JSON.stringify({
          cmd: 'SUBSCRIBE',
          args: {},
          evt: 'OVERLAY',
          nonce: 'auth_one'
        }));

        ws.send(JSON.stringify({
          cmd: 'OVERLAY',
          args: {
            type: 'CONNECT',
            pid: -1
          },
          nonce: 'auth_two'
        }));
      } else if (data.evt === 'OVERLAY') {
        const proxyEvent = data.data;

        if (proxyEvent.type === 'DISPATCH' && proxyEvent.payloads) {
          for (const payload of proxyEvent.payloads) {
            if (payload.type === 'OVERLAY_INITIALIZE') {
              main(payload);
              ws.close();
            }
          }
        }
      }
      break;
  }
});
