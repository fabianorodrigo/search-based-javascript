var EventEmitter = require("events").EventEmitter;

const readlineSync = require("readline-sync");
const colors = require("colors");
const fs = require("fs");
const bunyan = require('bunyan');
const RotatingFileStream = require('bunyan-rotating-file-stream');

const HillClimbing = require("./HillClimbing");
const State = require("./State");

const logOptions = {
    name: '/search-based-javascript',
    streams: [{
        stream: new RotatingFileStream({
            level: 'debug',
            path: 'logs/log%Y%m%d.json',
            period: '1d',          // daily rotation 
            totalFiles: 10,        // keep up to 10 back copies 
            rotateExisting: true,  // Give ourselves a clean file when we start up, based on period 
            threshold: '10m',      // Rotate log files larger than 10 megabytes 
            totalSize: '20m',      // Don't keep more than 20mb of archived log files 
            gzip: true,             // Compress the archive log files to save space 
            src: true               // Include info about the source of the error
        })
    }]
};

if (!fs.existsSync("./logs")) {
    fs.mkdirSync("./logs");
}

global.log = bunyan.createLogger(logOptions);

function printCentro(valor) {
    console.log(valor.padStart(Math.floor((WIDTH / 2) + (valor.length / 2)), " ").yellow);
}

function endProcess() {
    console.log('BACKUP DONE'.yellow);
    clearInterval(intervalApp);
    process.exit(0);
}

process.on('uncaughtException', (err) => {
    global.log.error(err);
    console.error(`Caught exception: ${err}\n`);
    console.error(err.stack)
});


const WIDTH = 100;
global.trace = true;


const lineGraph = "#".padStart(WIDTH, "#");
console.log(lineGraph.yellow);
printCentro("Starting Hill Climbing");
console.log(lineGraph.yellow);


//const snapshot = readlineSync.question("What is the requested snapshot (YYWW)?");


//const portaisId = ['dados_al_gov_br', 'dados_gov_br', 'dados_recife_pe_gov_br'];

const initState = ['B', 'C', 'D', 'A'];
const goalState = ['A', 'B', 'C', 'D'];

HillClimbing.getRouteWithHillClimbing(initState, goalState).then(solutionSequence => {
    solutionSequence.forEach(solution => {
        console.log('-'.padStart(WIDTH, '-'));
        solution.state.forEach(stack => {
            while (stack.length > 0) {
                console.log(stack.pop());
            }
            console.log('-');
        })
    })
});

//ee.emit("findFolderEvent");
const intervalApp = setInterval(() => { }, 10000);

