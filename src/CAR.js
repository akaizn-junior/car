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
 * const arguments = CAR({
 *	 '-h': {
 *	   flag: true
 *	 },
 *	 '-v': {
 *	   flag: true // flag
 *	 },
 *	 '-c': {
 *	   var: true,
 *	   default: 'chicken-wolf' // mixed flag
 *	 },
 *	 '-o': {
 *	   var: true // variable
 *	 }
 * });
 */
function CAR(defined, longform = {}, failed = () => {}) {
	return validate_args(
		{ cmd_args: process.argv, defined, longform },
		{ failed }
	);
}

module.exports = CAR; // 🚗 🚗 🚗
