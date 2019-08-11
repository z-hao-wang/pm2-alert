import { Response } from 'request';
const request = require('request');

export function webhook(uri: string, message: string, cb?: any) {
  const options = {
    uri,
    headers: { 'Content-Type': 'application/json' },
    json: {
      username: 'data_server',
      text: message,
    },
  };
  request.post(options, function(error: any, response: Response, body: any) {
    if (!error && response.statusCode === 200) {
      console.log(body);
    } else {
      console.log(`error: ${response.statusCode} \n ${response.body}`);
    }
    cb && cb();
  });
}
