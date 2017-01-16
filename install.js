const plugins = require('./plugins/fetch.json');
const platforms = require('./platforms/platforms.json');
const exec = require('child_process').exec;

console.log('\n\rRunning jobs...\n\r');

var jobs = [];

for (var key in plugins) {
  var src = plugins[key].source.id;
  var cmd = `cordova plugin add ${src}`;
  jobs.push(cmd);
}

for (var platform in platforms) {
  var version = platforms[platform];
  var cmd = `cordova platform add ${platform}@${version}`;
  jobs.push(cmd);
}

function runNextJob() {
  var job = jobs.pop();
  if (!job) return console.log('Done.');
  console.log(job);
  exec(job, (error, stdout, stderr) => {
    stdout && console.log(stdout);
    stderr && console.log(stderr);
    runNextJob();
  });
}

runNextJob();