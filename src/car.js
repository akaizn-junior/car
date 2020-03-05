/*!
 * CmdArgsReader (CAR) 🚗 🚗 🚗
 * Reads and validates command line arguments based on a defined list
 * (c) 2019 Verdexdesign
 */

const { validator } = require('./helpers');

/**
 * CAR 🚗 🚗 🚗
 * Reads 'process.argv' for command line argument and validates them following a defined list
 * @param {object} defined The user list of defined arguments
 * @param {function} failed (err: string) => {} A callback for when validation fails for an argument or its value
 * @returns {object} A map of valid arguments
 * @example
 * const defined = {
 *	 '-f': {
 *		flag: true,
 *		cb: () => { }, // the function to call when this option is used
 *      longform: '--flag'
 *	 },
 *	 '-v': {
 *		var: true,
 *		cb: () => { },
 *		help: v_help,
 *      longform: '--var'
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
 * const valid = CAR(defined, err => {
 *	// only runs if validation fails
 *	console.log(err);
 * });
 *
 * // Usage
 * `command -f`
 * // running a command with the '-f' option will run its callback
 */
function CAR(defined, failed = () => {}) {
	const valid_args = validator({ proc_args: process.argv, defined }, failed);
	return valid_args;
}

module.exports = CAR;
