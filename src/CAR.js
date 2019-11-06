/*!
 * CmdArgsReader (CAR) 🚗 🚗 🚗
 * Reads and validates command line arguments based on a defined list
 * (c) 2019 Verdexdesign
 */

const { validate_args } = require('./helpers');

/**
 * CAR 🚗 🚗 🚗
 * Reads 'process.argv' for command line argument and validates them following a defined list
 * @param {object} defined A list of defined arguments by the user
 * @param {object} longform A list of long form arguments to match the short form args in the defined list
 * @param {function} failed (err: string) => {} A callback for when validation fails for an argument or its value
 * @returns {object} A map of valid arguments
 * @example
 * const defined = {
 *	 '-f': {
 *		flag: true,
 *		cb: () => { } // the function to call when this option is used
 *	 },
 *	 '-v': {
 *		var: true,
 *		cb: () => { },
 *		help: v_help
 *	 },
 *	 '-m': {
 *		var: true,
 *		cb: () => { },
 *		default: 'chicken-wolf' // mixed flag
 *	 },
 *	 '-o': {
 *		var: true, // variable
 *		cb: () => { },
 *		help: '%man',
 *		helpOption: 'h' // the user can defined their own help option value. However CAR allows the following ['help', '--help', '-h'] by default
 *	 }
 * };
 *
 * const longform = {
 *	'--flag': '-f',
 *	'--var': '-v',
 *	'--mixed': '-m',
 *	'--other': '-o'
 * }
 *
 * const validArgs = CAR(defined, longform, err => {
 *	// only runs if validation fails
 *	console.log(err);
 * });
 *
 * // Usage
 * `command -f`
 * // running a command with the '-f' option will run its callback
 */
function CAR(defined, longform = {}, failed = () => { }, validateValues = value => value) {
	return validate_args(
		{ cmd_args: process.argv, defined, longform },
		{ failed, validateValues }
	);
}

module.exports = CAR; // 🚗 🚗 🚗
