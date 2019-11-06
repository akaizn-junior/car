const exec = require('child_process').execFile;
const path = require('path');
const pkg = require(path.join(process.cwd(), 'package.json'));

const { done, end } = require('./utils');

const VALID_ARGS = {};
const OPERATOR = {
	equal: '=',
	append: '--',
	arg_indicator: '-'
};

const HELP_OPTIONS = ['--help', 'help', '-h'];

/**
 * Verifies if arguments include the append operator;
 * and reduce all the values after it.
 * @param {array} cmd_args process arguments
 * @returns {string} Arguments read by the append operator or an empty string
 */
function get_data_to_append(cmd_args) {
	const appendOpIndex = cmd_args.indexOf(OPERATOR.append);
	const empty = String();

	if (appendOpIndex !== -1) {
		return cmd_args.reduce((acc = empty, value, i) => {
			if (i > appendOpIndex) {
				return `${acc} ${value}`;
			}
			return empty;
		}).trim();
	}

	return empty;
}

/**
 * Handle CAR vars
 * @param {object} args Arguments data
 * @param {object} values Values to validate
 * @param {object} callbacks Functions to run when operations complete
 * @returns {number} 0 to skip a validation or 1 to end validation
 */
function handle_vars(args, values, callbacks) {
	let { cmd_args, longform, arg_pos } = args;
	let { possible, default_value, helpOptionValue } = values;
	let { help, failed, success } = callbacks;

	// gathered if OPERATOR.append is used
	const data_to_append = get_data_to_append(cmd_args);

	if (!data_to_append.length) {
		read_value(
			{ cmd_args, arg_pos, longform: longform[cmd_args[arg_pos]] },
			{ possible, default_value, helpOptionValue },
			{ success, failed, help }
		);
		// skip
		return 0;
	}

	read_value(
		{ cmd_args, arg_pos, longform: longform[cmd_args[arg_pos]] },
		{ possible: data_to_append, default_value, helpOptionValue },
		{ success, failed, help }
	);
	// done
	return 1;
}

/**
 * Reads the value passed to an argument read as a 'var'
 * @param {object} args Arguments data
 * @param {object} values Values to validate
 * @param {object} callbacks Functions to run when operations complete
 * @returns {void}
 */
function read_value(args, values, callbacks) {
	let { cmd_args, arg_pos, longform } = args;
	let { possible, default_value, helpOptionValue } = values;
	let { success, failed, help } = callbacks;

	let option = cmd_args[arg_pos].split(OPERATOR.equal)[0];
	// translate long form arg if read
	option = longform || option;

	// verify if value already exists to avoid double declaration
	if (!VALID_ARGS[option]) {
		// try input values first
		if (possible) {
			run_help(option, possible, helpOptionValue, help);
			return add_arg(option, possible, success);
		} else if (arg_pos + 1 <= cmd_args.length) {
			// get a valid value on the next index or the default value
			let value = get_valid_value({ option },
				{ value: cmd_args[++arg_pos], default_value, helpOptionValue },
				{ failed }
			);

			run_help(option, value, helpOptionValue, help);
			return add_arg(option, value, success);
		} else {
			// no valid value to read
			failed(`no valid value to read for option "${option}"`);
			end();
		}
	} else {
		// already declared
		failed(`repeated option "${option}"`);
		end();
	}
}

/**
 * Validates the value read, return it if its a valid value,
 * otherwise return the default value
 * @param {object} args Arguments data
 * @param {object} values Values to validate
 * @param {object} callbacks Functions to run when operations complete
 * @returns {string|void} A valid argument value or void
 */
function get_valid_value(args, values, callbacks) {
	let { option } = args;
	const { value, default_value, helpOptionValue } = values;
	let { failed } = callbacks;

	if (value && !value.startsWith(OPERATOR.arg_indicator) && value !== OPERATOR.equal) {
		return value;
	} else if (default_value !== undefined) {
		return default_value;
	} else if (HELP_OPTIONS.includes(value)
		|| HELP_OPTIONS.includes(default_value)
		|| helpOptionValue === value
		|| helpOptionValue === default_value) {
		return value || default_value;
	} else {
		// invalid arg value, maybe another arg or OPERATOR.equal
		failed('invalid value '.concat(value, ' for option ', option));
		end();
	}
}

/**
 * Adds (k,v) like data to a global list of validated arguments
 * @param {string} option A valid command line option
 * @param {string} value The value for the option
 * @param {function} success The callback for when data was added successfully
 * @returns {void}
 */
function add_arg(option, value, success) {
	VALID_ARGS[option] = value;
	success(VALID_ARGS);
	return;
}

function handle_man(str) {
	const man_placeholder = '%man';
	// assume the string as an hash for an index
	const [placeholder, index] = str.split('#');
	const man = pkg.man;
	const man_len = man.length;
	let script_args = [];
	// check if the man setting is valid to use
	let isvalid = false;

	// man is an array of man files ['main.1', 'opt.1']
	// if no index is provided use the first index
	if (!index && placeholder === man_placeholder && typeof man !== 'string') {
		script_args = [`${man[0]}`];
		isvalid = true;
	}

	// if an index is provided, use the index
	if (index && placeholder === man_placeholder && typeof man !== 'string') {
		script_args = [`${man[index % man_len]}`];
		isvalid = true;
	}

	// if man is just a string
	if (!index && placeholder === man_placeholder && typeof man === 'string') {
		script_args = [`${man}`];
		isvalid = true;
	}

	if (isvalid) {
		return exec('man', script_args, { windowsHide: true }, (err, stdout, stderr) => {
			if (!err && !stderr) {
				process.stdout.write(stdout);
			}
		});
	}

	return;
}

/**
 * Read a value matching an option that triggers showing help for a specific option/command.
 * Runs the option help or simply continue.
 * @param {string} option The option to show help for
 * @param {string} value The value read
 * @param {string} helpOptionValue The value set to trigger help for a specific option
 * @param {funtion} call The help function for the option
 * @returns {void}
 */
function run_help(option, value, helpOptionValue, call) {
	const showHelp = HELP_OPTIONS.includes(value) || helpOptionValue === value;
	if (typeof call === 'function' && showHelp) {
		call(option);
		done();
	}

	if (typeof call === 'string' && showHelp) {
		handle_man(call);
	}
}

/**
 * Reads a key inside an object if defined, otherwise returns a default value
 * @param {object} __obj The object to test
 * @param {string} __key The key to test
 * @param {any} __default The value to return in case the object and key are both undefined
 * @returns {boolean}
 */
function value_or_default(__obj, __key, __default) {
	return __obj && __obj[__key] !== undefined ? __obj[__key] : __default;
}

/**
 * Get default values for keys for an option on the defined list
 * @param {object} definedOption An option from the defined list
 */
function get_defaults(definedOption) {
	// can this current arg be combined with other args
	const combine = value_or_default(definedOption, 'combine', true);
	// run this callback if this argument is valid
	const success = value_or_default(definedOption, 'cb', function() { });
	// does this option have help data
	const help = value_or_default(definedOption, 'help', function() { });
	// does this option have its own set help option
	const helpOptionValue = value_or_default(definedOption, 'helpOption', HELP_OPTIONS);
	// if the argument read is a 'mixed flag' aka a 'var' with a default value
	// get the default value
	const default_value = value_or_default(definedOption, 'default', undefined);

	return { combine, success, help, helpOptionValue, default_value };
}

/**
 * Validates cmd args
 * @param {object} args Arguments data
 * @param {object} callbacks Functions to run when operations complete
 * @returns {void}
 */
function validate_args(args, callbacks) {
	const { cmd_args, defined, longform } = args;
	const { failed } = callbacks;

	const len = cmd_args.length;
	// when to start counting possible valid arguments
	const pos_0 = 2;

	for (let i = pos_0; i < len; i++) {
		let curr = cmd_args[i];
		// was OPERATOR.equal used to pass a value?
		let actual = curr.split(OPERATOR.equal)[0];
		// get its possible value
		let possible = curr.split(OPERATOR.equal)[1];

		// verify and translate the actual option if is in long form
		actual = longform[actual] || actual;

		const { combine, success, help, helpOptionValue, default_value } = get_defaults(defined[actual]);

		if (actual && defined[actual]) {
			switch (true) {
			case defined[actual].var:
				const result = handle_vars(
					{ cmd_args, arg_pos: i, longform },
					{ possible, default_value, helpOptionValue },
					{ help, failed, success }
				);
					// skip the index of a possible value if 'var'
					// is not assigned using OPERATOR.equal
				if (!result) {
					!possible && i++;
				} else {
					// end loop
					i = len;
				}
				break;
			case defined[actual].flag && combine:
				add_arg(actual, true, success);
				break;
			case defined[actual].flag && !combine:
				if (i === pos_0) add_arg(actual, true, success);
				// options that cannot be combined w/ others will end the process
				done();
				break;
			}
		} else if (actual !== OPERATOR.append) {
			failed('invalid argument'.concat(' "', cmd_args[i], '"'));
			end();
		}
	}

	return VALID_ARGS;
}

module.exports = { validate_args };
