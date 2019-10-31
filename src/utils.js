/**
 * Call when something succeeds
 */
const done = () => {
	// eslintrc will complain about process.exit
	// ignore it here, do not allow it anywhere else
	// eslint-disable-next-line
	process.exit(0);
};

/**
 * Call when something fails
 */
const end = () => {
	// eslintrc will complain about process.exit
	// ignore it here, do not allow it anywhere else
	// eslint-disable-next-line
	process.exit(1);
};

module.exports = {
	done,
	end
};
