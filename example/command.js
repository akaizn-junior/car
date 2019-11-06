#! /usr/bin/env node

/*!
 * Example Command
 * An example command to test CAR power
 * Run the example command by `node example/command [args]`
 */

const CAR = require('../src/CAR');

function a_help() {
	console.log([
		'-v       is a command line argument read and validated by CAR based on a defined list provided by the user',
		'--var    is the long form argument for "-v"'
	].join('\n'));
}

const DEFINED_ARGS = {
	'-v': {
		var: true,
		help: a_help,
		helpOption: 'h',
		cb: () => console.log('var "-a" option must read a value')
	},
	'-f': {
		flag: true,
		cb: () => console.log('used flag "-f"')
	},
	'-c': {
		flag: true,
		cb: () => console.log('"-c" must be the first and only option used. Do not combine "-c" option with other options'),
		combine: false
	},
	'-m': {
		var: true,
		default: 'mixed',
		cb: () => console.log('mixed flag "-m" may read a value')
	},
	'-w': {
		var: true,
		help: '%man#1'
	}
};

const LONG_FROM = {
	'--var': '-v',
	'--mixed': '-m',
	'--combo': '-c',
	'--flag': '-f',
	'--welp': '-w'
};

const validArgs = CAR(DEFINED_ARGS, LONG_FROM, err => {
	console.log(err);
});

// output CAR valid arguments
console.log(validArgs);
