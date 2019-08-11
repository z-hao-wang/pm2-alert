"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pm2 = require("pm2");
pm2.launchBus(function (err, bus) {
    bus.on('log:err', function (e) {
        // Send emails
        console.log(`====e`, e.data, e.process.name);
    });
});
