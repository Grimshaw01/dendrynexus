/* dendry
 * http://github.com/idmillington/dendry
 *
 * MIT License
 */
/*jshint indent:2 */
(function() {
   // TODO: implement random testing
  'use strict';

  var fs = require('fs');
  var async = require('async');

  var utils = require('../utils');
  var cmdCompile = require('./compile').cmd;
  var CLUserInterface = require('../../ui/cli').CommandLineUserInterface;
  var RandomTestPrompt = require('../../ui/random_prompt').RandomTestPrompt;

  var loadGame = function(data, callback) {
    if (data.needsCompilation) {
      return callback(null, data);
    }
    utils.loadCompiledGame(data.compiledPath, function(err, game) {
      if (err) {
        return callback(err);
      }
      data.game = game;
      return callback(null, data);
    });
  };

  var loadState = function(data, callback) {
    if (data.state) {
      fs.readFile(data.state, function(err, json) {
        if (err) {
          return callback(err);
        }
        try {
          data.stateObject = JSON.parse(json);
        } catch (parseErr) {
          return callback(parseErr);
        }
        console.log(('Loaded state from ' + data.state + '.').red);
        return callback(null, data);
      });
    } else {
      callback(null, data);
    }
  };

  // updated to use random prompt
  // updated to use random prompt
  var runGame = function(data, callback) {
    // TODO: use prompt?
    var nruns = data.nruns;
    for (var i = 0; i < nruns; i++) {
        var name = data.data + '_' + i + '.json';
        var randPrompt = new RandomTestPrompt(name);
        var clint = new CLUserInterface(data.game, null, randPrompt, 1000, true);
        clint.run(data.stateObject, callback);
    }
  };


  // ----------------------------------------------------------------------
  // RandomTest: Does a random test...
  // ----------------------------------------------------------------------

  var cmdRun = new utils.Command('random-test');
  cmdRun.createArgumentParser = function(subparsers) {
    var parser = subparsers.addParser(this.name, {
      help: 'Randomly runs through the project..',
      description: 'This does a random test, going through the entirety of the game.'
    });
    parser.addArgument(['project'], {
      nargs: '?',
      help: 'The project to compile (default: the current directory).'
    });
    parser.addArgument(['--nruns'], {
        action: 'store',
        defaultValue: '1',
        help: 'How many runs of random test to run? Default: 1 run (0)',
    });
    parser.addArgument(['-s', '--state'], {
      action: 'store',
      help: 'Use the given dumped state to resume a previous game.'
    });
    parser.addArgument(['-f', '--force'], {
      action: 'storeTrue',
      defaultValue: false,
      help: 'Always recompiles, even if the compiled game is up to date.'
    });
    parser.addArgument(['-d', '--data'], {
      action: 'store',
      defaultValue: 'game-data',
      help: 'File to dump the data at the end. Default: game-data.json.'
    });
    parser.addArgument(['-c', '--choice-dump'], {
      action: 'store',
      help: 'File to dump the choices (as choice indices).'
    });
    parser.addArgument(['-ct', '--choice-text-dump'], {
      action: 'store',
      help: 'File to dump the choices (as strings).'
    });
  };
  cmdRun.run = function(args, callback) {
    var getData = function(callback) {
      cmdCompile.run(args, callback);
    };
    async.waterfall([getData, loadGame, loadState, runGame], callback);
  };

  module.exports = {
    cmd: cmdRun
  };
}());
