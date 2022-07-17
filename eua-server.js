const cluster = require('cluster');
const os = require('os');

require('dotenv').config({ path: 'secret.env' });
const express = require('express');
const beapp = express();
const cors = require('cors');
const bodyParser = require('body-parser');
const log = require("electron-log");
const helmet = require("helmet");
 
beapp.use(bodyParser.json());
beapp.use(bodyParser.urlencoded({
  extended: true
}));
beapp.use(cors());
beapp.use(helmet());

global.log = log;

beapp.use(cors());

const apiRoutes = require('./routes/api');

beapp.use('/', apiRoutes);
beapp.use('/.well-known/acme-challenge', express.static(__dirname + '/.well-known/acme-challenge'));

beapp.get("/", (req, res) => {
  res.send("<h3>Server is Up and running<\h3>")
})

if (require.main === module) {
	  beapp.listen(3284, () => {
	  log.info('server is running on 3284');
	})
}

process.on('uncaughtException', (err) => {
  log.info('uncaught exception occured.', err);
});

process.on('exit', async () => {
  process.exit(1);
});

process.on('SIGINT', async () => {
  log.info('ctrl + c ');
  process.exit(1);
});

module.exports = beapp;