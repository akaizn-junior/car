const { done, end } = require('./utils');

// globals

const valid_args = {};
const operator = {
	assign: '=',
	append: '--',
	'--': 'append',
	'=': 'assign'
};

const help_opts = ['--help', 'help', '-h'];

/**
 * Verifies if arguments include the append operator;
 * and reduce all the values after it.
 * @param {array} cmd_args process arguments
 * @returns {string} Arguments read by the append operator or an empty string
 */
function to_append(cmd_args) {
	const appendOpIndex = cmd_args.indexOf(operator.append);
	const empty = String();

	if (appendOpIndex !== -1) {
		return cmd_args.reduce((acc, value, i) => {
			if (i > appendOpIndex) {
				return `${acc} ${value}`;
			}
			return empty;
		}, empty).trim();
	}

	return empty;
}

function get_longform(defined, actual = null) {
	const longform = {};
	// get all longform matches
	for (let key in defined) {
		if (defined[key] && defined[key].longform) {
			longform[defined[key].longform] = key;
		}
	}

	return actual ? longform[actual] : longform;
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
 * Adds (k,v) like data to a global list of validated arguments
 * @param {string} args Args data
 * @param {string} value The value for the option
 * @param {function} success The callback for when data was added successfully
 * @returns {void}
 */
function add_arg(args, value, success) {
	const { defined, option } = args;

	// does this option have a help callback
	const help = value_or_default(defined[option], 'help', function() { });
	// try to run help if the value is a help option
	run_help(option, value, help);
	// otherwise just add the value to the valid list
	valid_args[option] = value;
	success(valid_args);

	return;
}

/**
 * Validates user input value
 * @param {string} value User input value
 */
function validate_values(value) {
	return typeof value === 'string' ? value.replace(/[><,\\/[\]]+/g, '') : '';
}

/**
 * Validates the value read, return it if its a valid value,
 * otherwise return the default value
 * @param {object} args Arguments data
 * @param {object} values Values to validate
 * @param {object} callbacks Functions to run when operations complete
 * @returns {string|void} A valid argument value or void
 */
function get_valid_value(args, values, failed) {
	let { defined, option } = args;
	const { value, default_value } = values;

	const longform = get_longform(defined);
	const is_valid = validator.validate_values;

	if (value && is_valid(value)
		&& !defined[value]
		&& !longform[value] && !operator[value]
	) {
		return is_valid(value);
	} else if (default_value !== undefined
		&& !defined[default_value]
		&& !longform[default_value]
		&& is_valid(default_value)
	) {
		return is_valid(default_value);
	} else {
		// invalid arg value, maybe another arg or operator.assign
		failed('invalid value '.concat(value, ' for option ', option));
		end();
	}
}

/**
 * Read a value matching an option that triggers showing help for a specific option/command.
 * Runs the option help or simply continues.
 * @param {string} option The option to show help for
 * @param {string} value A possible help option read
 * @param {funtion} call The help function for the option
 * @returns {void}
 */
function run_help(option, value, call) {
	const showHelp = help_opts.includes(value);
	if (typeof call === 'function' && showHelp) {
		call(option);
		done();
	}
}

/**
 * Reads the value passed to an argument read as a 'var'
 * @param {object} args Arguments data
 * @param {object} values Values to validate
 * @param {object} callbacks Functions to run when operations complete
 * @returns {void}
 */
function eval_value(args, possible, failed) {
	let { proc_args, pos, defined } = args;

	// get the actual option
	let option = proc_args[pos].split(operator.assign)[0];
	// translate long form option if read
	option = get_longform(defined, option) || option;

	// run this callback on sucess
	const success = value_or_default(defined[option], 'cb', function() { });
	// does this var has a default value
	const default_value = value_or_default(defined[option], 'default', undefined);

	// verify if value already exists to avoid double declaration
	// and verify if the option is defined, because why not
	if (!valid_args[option] && defined[option]) {
		if (possible) {
			const valid_value = get_valid_value(args, { value: possible, default_value }, failed);
			add_arg({ defined, option }, valid_value, success);
		} else if (pos + 1 < proc_args.length || default_value) {
			const next_valid_value = get_valid_value(args, { value: proc_args[++pos], default_value }, failed);
			add_arg({ defined, option }, next_valid_value, success);
		} else {
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
 * Handle CAR vars
 * @param {object} args Arguments data
 * @param {object} values Values to validate
 * @param {object} callbacks Functions to run when operations complete
 * @returns {number} 0 to skip an argument or 1 to end validation
 */
function vars(args, possible, failed) {
	let { proc_args } = args;

	// get data if operator.append is used
	const append = to_append(proc_args);

	// if there is data to append
	if (append.length) {
		eval_value(args, append, failed);
		// end validation
		return 1;
	}

	eval_value(args, possible, failed);
	// skip an argument
	return 0;
}

/**
 * Validates cmd args
 * @param {object} args Arguments data
 * @param {object} failed User callback for when operations fail
 * @returns {void}
 */
function validator(args, failed) {
	const _failed = failed === 'function' ? failed : () => {};
	// get overriden methods first
	validator.validate_values = typeof validator.validate_values === 'function'
		? validator.validate_values : validate_values;

	// process args and the defined list
	const { proc_args, defined } = args;
	const len = proc_args.length;
	// when to start counting possible valid arguments
	const pos_0 = 2;

	// the big loop
	for (let i = pos_0; i < len; i++) {
		// the current arg read
		let curr = proc_args[i];
		// was OPERATOR.assign used to pass a value?
		let actual = curr.split(operator.assign)[0];
		// get its possible value
		let possible = curr.split(operator.assign)[1];
		// verify and translate the actual option if is in long form
		actual = get_longform(defined, actual) || actual;

		// can this current arg be combined with other args
		const combine = value_or_default(defined[actual], 'combine', true);
		// run this callback if this argument is valid
		const success = value_or_default(defined[actual], 'cb', function() { });
		// does this option have its own 'help' option
		const custom_help = value_or_default(defined[actual], 'helpOption', undefined);

		// if the user set a custom value for a help option add it to the list
		custom_help && help_opts.push(custom_help);

		// verify if 'actual' is actually a thing on the defined list
		if (actual && defined[actual]) {
			switch (true) {
			case defined[actual].var:
				const result = vars({ defined, proc_args, pos: i }, possible, _failed);
				if (!result) {
					// skip a possible value
					!possible && i++;
				} else {
					i = len; // end validation
				}
				break;
			case defined[actual].flag && combine:
				add_arg({ defined, option: actual }, true, success);
				break;
			case defined[actual].flag && !combine:
				if (i === pos_0) add_arg({ defined, option: actual }, true, success);
				// options that cannot be combined w/ others will end the process
				done();
				break;
			}
		} else if (!operator[actual]) {
			// 'actual' is not a thing; skip 'failed' if 'actual' is an operator
			_failed('invalid argument'.concat(' "', proc_args[i], '"'));
			end();
		}
	}

	return valid_args;
}

module.exports = { validator };
