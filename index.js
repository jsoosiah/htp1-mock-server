const WebSocket = require('ws');
const cron = require('node-cron');
const { applyPatch } = require ('fast-json-patch');

const mso = require('./config.json');
 
const wss = new WebSocket.Server({ port: 8888, path: '/ws/controller' });
 
wss.on('connection', function connection(ws) {
  ws.on('message', function incoming(message) {
    // console.log('received: %s', message);
    const { verb, arg } = parseMSO(message);

    if (verb === 'getmso') {
      ws.send('mso ' + JSON.stringify(mso));
    } else if (verb === 'changemso') {
      applyPatch(mso, arg);
      ws.send('msoupdate ' + JSON.stringify(arg, null, 2));
    }
  });
});

// helper to parse MSO message into verb and argument object
function parseMSO(cmd) {
  const i = cmd.indexOf(' ');
  return i > 0 ? {
    verb: cmd.slice(0, i),
    arg: JSON.parse(cmd.slice(i + 1))
  } : {
    verb: cmd,
    arg: undefined
  }
}

cron.schedule('0 0 * * *', () => {
  // reset mso daily
  mso = require('./config.json');
});