import * as pm2 from 'pm2';
interface ErrFormat {
  data: string;
  at: number;
  process: {
    rev: string;
    name: string;
    pm_id: number;
  }
}
pm2.launchBus(function(err, bus) {
  bus.on('log:err', function(e: ErrFormat) {
    // Send emails
    console.log(`====e`, e.data, e.process.name);
  });
});
