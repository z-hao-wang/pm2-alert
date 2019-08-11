import * as pm2 from 'pm2';
import * as _ from 'lodash';
import { Config } from './config';
import { webhook } from './slack';
interface ErrFormat {
  data: string;
  at: number;
  process: {
    rev: string;
    name: string;
    pm_id: number;
  };
}
const globalErrorCache: Record<string, any> = {};
const lastAlerted: Record<string, number> = {};

pm2.launchBus(function(err, bus) {
  bus.on('log:err', function(e: ErrFormat) {
    // Send emails
    const pName = e.process.name;
    const matchingConfig = _.find(Config.processes, p => p.name === e.process.name);
    if (!matchingConfig) return;
    console.log(`====e`, pName, e.data);
    globalErrorCache[pName] = globalErrorCache[pName] || [];
    const now = Date.now();
    globalErrorCache[pName].push({ t: now, errMsg: e.data });
    const errorPeriodMs = matchingConfig.alertPeriod * 1000;
    let newStartIdx = 0;
    while (
      globalErrorCache[pName].length > 0 &&
      globalErrorCache[pName][newStartIdx] &&
      globalErrorCache[pName][newStartIdx].t < now - errorPeriodMs
    ) {
      newStartIdx++;
    }
    if (newStartIdx > 0) {
      globalErrorCache[pName].splice(0, newStartIdx);
    }
    if (globalErrorCache[pName].length >= matchingConfig.alertThreshold && matchingConfig.slackChannel) {
      if (!lastAlerted[pName] || lastAlerted[pName] < now - errorPeriodMs) {
        webhook(
          matchingConfig.slackChannel,
          `${new Date().toISOString()} ${pName} error count ${globalErrorCache[pName].length}`,
        );
        lastAlerted[pName] = Date.now();
      }
    }
  });
});
