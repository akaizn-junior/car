#! /usr/bin/env node

/*!
 * Example Command
 * An example command to test CAR power
 * Run the example command by `node example/command [args]`
 */

const CAR = require('../src/car');

function a_help() {
	console.log([
		'-v       is a command line argument read and validated by CAR based on a defined list provided by the user',
		'--var    is the long form argument for "-v"'
	].join('\n'));
}

const DEFINED = {
	'-v': {
		var: true,
		help: a_help,
		helpOption: 'h',
		cb: () => console.log('var "-a" option must read a value'),
		longform: '--var'
	},
	'-f': {
		flag: true,
		cb: () => console.log('used flag "-f"'),
		longform: '--flag'
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
