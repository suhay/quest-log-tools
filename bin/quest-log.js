#!/usr/bin/env node

const program = require('commander');

const { upsert } = require('..');

program
  .version('1.0.0', '-v, --version', 'output the current version');
 
program
  .command('upsert')
  .description('Replace MongoDB with current data.')
  .action(() => {
    try {
      upsert();
    } catch(err) {
      console.log('here');
    }
  });

program.parse(process.argv);
