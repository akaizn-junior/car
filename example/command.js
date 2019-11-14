#! /usr/bin/env node

/*!
 * Example Command
 * An example command to test CAR power
 * Run the example command by `node example/command [args]`
 */

const CAR = require('../src/car');

const opt_help = (opt, lf) => () => {
	console.log([
		`Help for option ${opt}`,
		`${opt}	is a command line argument read and validated by CAR based on a defined list provided by the user`,
		`${lf}	is the long form argument for "${opt}"`
	].join('\n'));
};

const DEFINED = {
	'-v': {
		var: true,
		help: opt_help('-v', '--var'),
		helpOption: 'h',
		cb: () => console.log('var "-v" option must read a value'),
		longform: '--var'
	},
	'-f': {
		flag: true,
		cb: () => console.log('used flag "-f"'),
		longform: '--flag',
		help: opt_help('-f', '--flag'),
		helpOption: 'h',
	},
	'-c': {
		flag: true,
		cb: () => console.log('"-c" must be the first and only option used. Do not combine "-c" option with other options'),
		combine: false,
		longform: '--combo'
	},
	'-m': {
		var: true,
		default: 'mixed',
		cb: () => console.log('mixed flag "-m" may read a value'),
		longform: '--mixed'
	},
	'-w': {
		var: true,
		help: '%man#1',
		longform: '--welp'
	}
};

const validArgs = CAR(DEFINED, err => console.log(err));
// output CAR valid arguments
console.log(validArgs);
