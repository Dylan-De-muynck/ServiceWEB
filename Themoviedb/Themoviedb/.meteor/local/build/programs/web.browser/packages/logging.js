//////////////////////////////////////////////////////////////////////////
//                                                                      //
// This is a generated file. You can view the original                  //
// source in your browser if your browser supports source maps.         //
// Source maps are supported by all recent versions of Chrome, Safari,  //
// and Firefox, and by Internet Explorer 11.                            //
//                                                                      //
//////////////////////////////////////////////////////////////////////////


(function () {

/* Imports */
var Meteor = Package.meteor.Meteor;
var global = Package.meteor.global;
var meteorEnv = Package.meteor.meteorEnv;
var EJSON = Package.ejson.EJSON;
var meteorInstall = Package.modules.meteorInstall;
var Promise = Package.promise.Promise;

/* Package-scope variables */
var exports, Log;

var require = meteorInstall({"node_modules":{"meteor":{"logging":{"logging.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                             //
// packages/logging/logging.js                                                                                 //
//                                                                                                             //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                               //
let _objectSpread;

module.link("@babel/runtime/helpers/objectSpread2", {
  default(v) {
    _objectSpread = v;
  }

}, 0);
module.export({
  Log: () => Log
});
let Meteor;
module.link("meteor/meteor", {
  Meteor(v) {
    Meteor = v;
  }

}, 0);
const hasOwn = Object.prototype.hasOwnProperty;

function Log() {
  Log.info(...arguments);
} /// FOR TESTING


let intercept = 0;
let interceptedLines = [];
let suppress = 0; // Intercept the next 'count' calls to a Log function. The actual
// lines printed to the console can be cleared and read by calling
// Log._intercepted().

Log._intercept = count => {
  intercept += count;
}; // Suppress the next 'count' calls to a Log function. Use this to stop
// tests from spamming the console, especially with red errors that
// might look like a failing test.


Log._suppress = count => {
  suppress += count;
}; // Returns intercepted lines and resets the intercept counter.


Log._intercepted = () => {
  const lines = interceptedLines;
  interceptedLines = [];
  intercept = 0;
  return lines;
}; // Either 'json' or 'colored-text'.
//
// When this is set to 'json', print JSON documents that are parsed by another
// process ('satellite' or 'meteor run'). This other process should call
// 'Log.format' for nice output.
//
// When this is set to 'colored-text', call 'Log.format' before printing.
// This should be used for logging from within satellite, since there is no
// other process that will be reading its standard output.


Log.outputFormat = 'json';
const LEVEL_COLORS = {
  debug: 'green',
  // leave info as the default color
  warn: 'magenta',
  error: 'red'
};
const META_COLOR = 'blue'; // Default colors cause readability problems on Windows Powershell,
// switch to bright variants. While still capable of millions of
// operations per second, the benchmark showed a 25%+ increase in
// ops per second (on Node 8) by caching "process.platform".

const isWin32 = typeof process === 'object' && process.platform === 'win32';

const platformColor = color => {
  if (isWin32 && typeof color === 'string' && !color.endsWith('Bright')) {
    return "".concat(color, "Bright");
  }

  return color;
}; // XXX package


const RESTRICTED_KEYS = ['time', 'timeInexact', 'level', 'file', 'line', 'program', 'originApp', 'satellite', 'stderr'];
const FORMATTED_KEYS = [...RESTRICTED_KEYS, 'app', 'message'];

const logInBrowser = obj => {
  const str = Log.format(obj); // XXX Some levels should be probably be sent to the server

  const level = obj.level;

  if (typeof console !== 'undefined' && console[level]) {
    console[level](str);
  } else {
    // XXX Uses of Meteor._debug should probably be replaced by Log.debug or
    //     Log.info, and we should have another name for "do your best to
    //     call call console.log".
    Meteor._debug(str);
  }
}; // @returns {Object: { line: Number, file: String }}


Log._getCallerDetails = () => {
  const getStack = () => {
    // We do NOT use Error.prepareStackTrace here (a V8 extension that gets us a
    // pre-parsed stack) since it's impossible to compose it with the use of
    // Error.prepareStackTrace used on the server for source maps.
    const err = new Error();
    const stack = err.stack;
    return stack;
  };

  const stack = getStack();

  if (!stack) {
    return {};
  } // looking for the first line outside the logging package (or an
  // eval if we find that first)


  let line;
  const lines = stack.split('\n').slice(1);

  for (line of lines) {
    if (line.match(/^\s*at eval \(eval/)) {
      return {
        file: "eval"
      };
    }

    if (!line.match(/packages\/(?:local-test[:_])?logging(?:\/|\.js)/)) {
      break;
    }
  }

  const details = {}; // The format for FF is 'functionName@filePath:lineNumber'
  // The format for V8 is 'functionName (packages/logging/logging.js:81)' or
  //                      'packages/logging/logging.js:81'

  const match = /(?:[@(]| at )([^(]+?):([0-9:]+)(?:\)|$)/.exec(line);

  if (!match) {
    return details;
  } // in case the matched block here is line:column


  details.line = match[2].split(':')[0]; // Possible format: https://foo.bar.com/scripts/file.js?random=foobar
  // XXX: if you can write the following in better way, please do it
  // XXX: what about evals?

  details.file = match[1].split('/').slice(-1)[0].split('?')[0];
  return details;
};

['debug', 'info', 'warn', 'error'].forEach(level => {
  // @param arg {String|Object}
  Log[level] = arg => {
    if (suppress) {
      suppress--;
      return;
    }

    let intercepted = false;

    if (intercept) {
      intercept--;
      intercepted = true;
    }

    let obj = arg === Object(arg) && !(arg instanceof RegExp) && !(arg instanceof Date) ? arg : {
      message: new String(arg).toString()
    };
    RESTRICTED_KEYS.forEach(key => {
      if (obj[key]) {
        throw new Error("Can't set '".concat(key, "' in log message"));
      }
    });

    if (hasOwn.call(obj, 'message') && typeof obj.message !== 'string') {
      throw new Error("The 'message' field in log objects must be a string");
    }

    if (!obj.omitCallerDetails) {
      obj = _objectSpread(_objectSpread({}, Log._getCallerDetails()), obj);
    }

    obj.time = new Date();
    obj.level = level; // If we are in production don't write out debug logs.

    if (level === 'debug' && Meteor.isProduction) {
      return;
    }

    if (intercepted) {
      interceptedLines.push(EJSON.stringify(obj));
    } else if (Meteor.isServer) {
      if (Log.outputFormat === 'colored-text') {
        console.log(Log.format(obj, {
          color: true
        }));
      } else if (Log.outputFormat === 'json') {
        console.log(EJSON.stringify(obj));
      } else {
        throw new Error("Unknown logging output format: ".concat(Log.outputFormat));
      }
    } else {
      logInBrowser(obj);
    }
  };
}); // tries to parse line as EJSON. returns object if parse is successful, or null if not

Log.parse = line => {
  let obj = null;

  if (line && line.startsWith('{')) {
    // might be json generated from calling 'Log'
    try {
      obj = EJSON.parse(line);
    } catch (e) {}
  } // XXX should probably check fields other than 'time'


  if (obj && obj.time && obj.time instanceof Date) {
    return obj;
  } else {
    return null;
  }
}; // formats a log object into colored human and machine-readable text


Log.format = function (obj) {
  let options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  obj = _objectSpread({}, obj); // don't mutate the argument

  let {
    time,
    timeInexact,
    level = 'info',
    file,
    line: lineNumber,
    app: appName = '',
    originApp,
    message = '',
    program = '',
    satellite = '',
    stderr = ''
  } = obj;

  if (!(time instanceof Date)) {
    throw new Error("'time' must be a Date object");
  }

  FORMATTED_KEYS.forEach(key => {
    delete obj[key];
  });

  if (Object.keys(obj).length > 0) {
    if (message) {
      message += ' ';
    }

    message += EJSON.stringify(obj);
  }

  const pad2 = n => n.toString().padStart(2, '0');

  const pad3 = n => n.toString().padStart(3, '0');

  const dateStamp = time.getFullYear().toString() + pad2(time.getMonth() + 1
  /*0-based*/
  ) + pad2(time.getDate());
  const timeStamp = pad2(time.getHours()) + ':' + pad2(time.getMinutes()) + ':' + pad2(time.getSeconds()) + '.' + pad3(time.getMilliseconds()); // eg in San Francisco in June this will be '(-7)'

  const utcOffsetStr = "(".concat(-(new Date().getTimezoneOffset() / 60), ")");
  let appInfo = '';

  if (appName) {
    appInfo += appName;
  }

  if (originApp && originApp !== appName) {
    appInfo += " via ".concat(originApp);
  }

  if (appInfo) {
    appInfo = "[".concat(appInfo, "] ");
  }

  const sourceInfoParts = [];

  if (program) {
    sourceInfoParts.push(program);
  }

  if (file) {
    sourceInfoParts.push(file);
  }

  if (lineNumber) {
    sourceInfoParts.push(lineNumber);
  }

  let sourceInfo = !sourceInfoParts.length ? '' : "(".concat(sourceInfoParts.join(':'), ") ");
  if (satellite) sourceInfo += "[".concat(satellite, "]");
  const stderrIndicator = stderr ? '(STDERR) ' : '';
  const metaPrefix = [level.charAt(0).toUpperCase(), dateStamp, '-', timeStamp, utcOffsetStr, timeInexact ? '? ' : ' ', appInfo, sourceInfo, stderrIndicator].join('');

  const prettify = function (line, color) {
    return options.color && Meteor.isServer && color ? require('cli-color')[color](line) : line;
  };

  return prettify(metaPrefix, platformColor(options.metaColor || META_COLOR)) + prettify(message, platformColor(LEVEL_COLORS[level]));
}; // Turn a line of text into a loggable object.
// @param line {String}
// @param override {Object}


Log.objFromText = (line, override) => {
  return _objectSpread({
    message: line,
    level: 'info',
    time: new Date(),
    timeInexact: true
  }, override);
};
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"node_modules":{"cli-color":{"package.json":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                             //
// node_modules/meteor/logging/node_modules/cli-color/package.json                                             //
//                                                                                                             //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                               //
module.exports = {
  "name": "cli-color",
  "version": "2.0.0"
};

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"index.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                             //
// node_modules/meteor/logging/node_modules/cli-color/index.js                                                 //
//                                                                                                             //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                               //
"use strict";

var d = require("d");

module.exports = Object.defineProperties(require("./bare"), {
	windowSize: d(require("./window-size")),
	erase: d(require("./erase")),
	move: d(require("./move")),
	beep: d(require("./beep")),
	columns: d(require("./columns")),
	strip: d(require("./strip")),
	getStrippedLength: d(require("./get-stripped-length")),
	slice: d(require("./slice")),
	throbber: d(require("./throbber")),
	reset: d(require("./reset")),
	art: d(require("./art"))
});

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"bare.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                             //
// node_modules/meteor/logging/node_modules/cli-color/bare.js                                                  //
//                                                                                                             //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                               //
"use strict";

var d              = require("d")
  , assign         = require("es5-ext/object/assign")
  , forEach        = require("es5-ext/object/for-each")
  , map            = require("es5-ext/object/map")
  , primitiveSet   = require("es5-ext/object/primitive-set")
  , setPrototypeOf = require("es5-ext/object/set-prototype-of")
  , memoize        = require("memoizee")
  , memoizeMethods = require("memoizee/methods")
  , sgr            = require("./lib/sgr")
  , supportsColor  = require("./lib/supports-color");

var mods           = sgr.mods
  , join           = Array.prototype.join
  , defineProperty = Object.defineProperty
  , max            = Math.max
  , min            = Math.min
  , variantModes   = primitiveSet("_fg", "_bg")
  , xtermMatch     = process.platform === "win32" ? require("./lib/xterm-match") : null;

var getFn;

// Some use cli-color as: console.log(clc.red('Error!'));
// Which is inefficient as on each call it configures new clc object
// with memoization we reuse once created object
var memoized = memoize(function (scope, mod) {
	return defineProperty(getFn(), "_cliColorData", d(assign({}, scope._cliColorData, mod)));
});

var proto = Object.create(
	Function.prototype,
	assign(
		map(mods, function (mod) {
			return d.gs(function () { return memoized(this, mod); });
		}),
		memoizeMethods({
			// xterm (255) color
			xterm: d(function (code) {
				code = isNaN(code) ? 255 : min(max(code, 0), 255);
				return defineProperty(
					getFn(), "_cliColorData",
					d(
						assign({}, this._cliColorData, {
							_fg: [xtermMatch ? xtermMatch[code] : "38;5;" + code, 39]
						})
					)
				);
			}),
			bgXterm: d(function (code) {
				code = isNaN(code) ? 255 : min(max(code, 0), 255);
				return defineProperty(
					getFn(), "_cliColorData",
					d(
						assign({}, this._cliColorData, {
							_bg: [xtermMatch ? xtermMatch[code] + 10 : "48;5;" + code, 49]
						})
					)
				);
			})
		})
	)
);

var getEndRe = memoize(function (code) { return new RegExp("\x1b\\[" + code + "m", "g"); }, {
	primitive: true
});

getFn = function () {
	return setPrototypeOf(
		function self(/* …msg*/) {
			var start = ""
			  , end = ""
			  , msg = join.call(arguments, " ")
			  , conf = self._cliColorData
			  , hasAnsi = sgr.hasCSI(msg);
			forEach(
				conf,
				function (mod, key) {
					end = sgr(mod[1]) + end;
					start += sgr(mod[0]);
					if (hasAnsi) {
						msg = msg.replace(getEndRe(mod[1]), variantModes[key] ? sgr(mod[0]) : "");
					}
				},
				null,
				true
			);
			if (!supportsColor.isColorSupported()) return msg;
			return start + msg + end;
		},
		proto
	);
};

module.exports = Object.defineProperties(getFn(), {
	xtermSupported: d(!xtermMatch),
	_cliColorData: d("", {})
});

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"lib":{"sgr.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                             //
// node_modules/meteor/logging/node_modules/cli-color/lib/sgr.js                                               //
//                                                                                                             //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                               //
"use strict";

/* CSI - control sequence introducer */
/* SGR - set graphic rendition */

var assign       = require("es5-ext/object/assign")
  , includes     = require("es5-ext/string/#/contains")
  , forOwn       = require("es5-ext/object/for-each")
  , onlyKey      = require("es5-ext/object/first-key")
  , forEachRight = require("es5-ext/array/#/for-each-right")
  , uniq         = require("es5-ext/array/#/uniq.js");

var CSI = "\x1b[";

var sgr = function (code) { return CSI + code + "m"; };

sgr.CSI = CSI;

var mods = assign(
	{
		// Style
		bold: { _bold: [1, 22] },
		italic: { _italic: [3, 23] },
		underline: { _underline: [4, 24] },
		blink: { _blink: [5, 25] },
		inverse: { _inverse: [7, 27] },
		strike: { _strike: [9, 29] }

		// Color
	},
	["black", "red", "green", "yellow", "blue", "magenta", "cyan", "white"].reduce(function (
		obj,
		color,
		index
	) {
		// foreground
		obj[color] = { _fg: [30 + index, 39] };
		obj[color + "Bright"] = { _fg: [90 + index, 39] };

		// background
		obj["bg" + color[0].toUpperCase() + color.slice(1)] = { _bg: [40 + index, 49] };
		obj["bg" + color[0].toUpperCase() + color.slice(1) + "Bright"] = { _bg: [100 + index, 49] };

		return obj;
	}, {})
);

sgr.mods = mods;

sgr.openers = {};
sgr.closers = {};

forOwn(mods, function (mod) {
	var modPair = mod[onlyKey(mod)];

	sgr.openers[modPair[0]] = modPair;
	sgr.closers[modPair[1]] = modPair;
});

sgr.openStyle = function (openedMods, code) { openedMods.push(sgr.openers[code]); };

sgr.closeStyle = function (openedMods, code) {
	forEachRight.call(openedMods, function (modPair, index) {
		if (modPair[1] === code) {
			openedMods.splice(index, 1);
		}
	});
};

/* prepend openers */
sgr.prepend = function (currentMods) {
	return currentMods.map(function (modPair) { return sgr(modPair[0]); });
};

/* complete non-closed openers with corresponding closers */
sgr.complete = function (openedMods, closerCodes) {
	closerCodes.forEach(function (code) { sgr.closeStyle(openedMods, code); });

	// mods must be closed from the last opened to first opened
	openedMods = openedMods.reverse();

	openedMods = openedMods.map(function (modPair) { return modPair[1]; });

	// one closer can close many openers (31, 32 -> 39)
	openedMods = uniq.call(openedMods);

	return openedMods.map(sgr);
};

var hasCSI = function (str) { return includes.call(str, CSI); };

sgr.hasCSI = hasCSI;

var extractCode = function (csi) {
	var code = csi.slice(2, -1);
	code = Number(code);
	return code;
};

sgr.extractCode = extractCode;

module.exports = sgr;

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"supports-color.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                             //
// node_modules/meteor/logging/node_modules/cli-color/lib/supports-color.js                                    //
//                                                                                                             //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                               //
"use strict";

// store whether supports-color mode is enabled or not.
var state = null;

// force supports-color mode
var enableColor = function () { state = true; };

// disable supports-color mode
var disableColor = function () { state = false; };

// use the NO_COLOR environment variable (default)
var autoDetectSupport = function () { state = null; };

// determine whether supports-color mode is enabled.
var isColorSupported = function () { return state === null ? !process.env.NO_COLOR : state; };

module.exports = {
	enableColor: enableColor,
	disableColor: disableColor,
	autoDetectSupport: autoDetectSupport,
	isColorSupported: isColorSupported
};

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"xterm-match.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                             //
// node_modules/meteor/logging/node_modules/cli-color/lib/xterm-match.js                                       //
//                                                                                                             //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                               //
"use strict";

var push = Array.prototype.push
  , reduce = Array.prototype.reduce
  , abs = Math.abs
  , colors
  , match
  , result
  , i;

colors = require("./xterm-colors").map(function (color) {
	return {
		r: parseInt(color.slice(0, 2), 16),
		g: parseInt(color.slice(2, 4), 16),
		b: parseInt(color.slice(4), 16)
	};
});

match = colors.slice(0, 16);

module.exports = result = [];

i = 0;
while (i < 8) {
	result.push(30 + i++);
}
i = 0;
while (i < 8) {
	result.push(90 + i++);
}
push.apply(
	result,
	colors.slice(16).map(function (data) {
		var index, diff = Infinity;
		match.every(function (innerMatch, currentIndex) {
			var ndiff = reduce.call(
				"rgb",
				function (currentDiff, channel) {
					currentDiff += abs(innerMatch[channel] - data[channel]);
					return currentDiff;
				},
				0
			);
			if (ndiff < diff) {
				index = currentIndex;
				diff = ndiff;
			}
			return ndiff;
		});
		return result[index];
	})
);

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"xterm-colors.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                             //
// node_modules/meteor/logging/node_modules/cli-color/lib/xterm-colors.js                                      //
//                                                                                                             //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                               //
"use strict";

module.exports = [
	"000000", "800000", "008000", "808000", "000080", "800080", "008080", "c0c0c0", "808080",
	"ff0000", "00ff00", "ffff00", "0000ff", "ff00ff", "00ffff", "ffffff", "000000", "00005f",
	"000087", "0000af", "0000d7", "0000ff", "005f00", "005f5f", "005f87", "005faf", "005fd7",
	"005fff", "008700", "00875f", "008787", "0087af", "0087d7", "0087ff", "00af00", "00af5f",
	"00af87", "00afaf", "00afd7", "00afff", "00d700", "00d75f", "00d787", "00d7af", "00d7d7",
	"00d7ff", "00ff00", "00ff5f", "00ff87", "00ffaf", "00ffd7", "00ffff", "5f0000", "5f005f",
	"5f0087", "5f00af", "5f00d7", "5f00ff", "5f5f00", "5f5f5f", "5f5f87", "5f5faf", "5f5fd7",
	"5f5fff", "5f8700", "5f875f", "5f8787", "5f87af", "5f87d7", "5f87ff", "5faf00", "5faf5f",
	"5faf87", "5fafaf", "5fafd7", "5fafff", "5fd700", "5fd75f", "5fd787", "5fd7af", "5fd7d7",
	"5fd7ff", "5fff00", "5fff5f", "5fff87", "5fffaf", "5fffd7", "5fffff", "870000", "87005f",
	"870087", "8700af", "8700d7", "8700ff", "875f00", "875f5f", "875f87", "875faf", "875fd7",
	"875fff", "878700", "87875f", "878787", "8787af", "8787d7", "8787ff", "87af00", "87af5f",
	"87af87", "87afaf", "87afd7", "87afff", "87d700", "87d75f", "87d787", "87d7af", "87d7d7",
	"87d7ff", "87ff00", "87ff5f", "87ff87", "87ffaf", "87ffd7", "87ffff", "af0000", "af005f",
	"af0087", "af00af", "af00d7", "af00ff", "af5f00", "af5f5f", "af5f87", "af5faf", "af5fd7",
	"af5fff", "af8700", "af875f", "af8787", "af87af", "af87d7", "af87ff", "afaf00", "afaf5f",
	"afaf87", "afafaf", "afafd7", "afafff", "afd700", "afd75f", "afd787", "afd7af", "afd7d7",
	"afd7ff", "afff00", "afff5f", "afff87", "afffaf", "afffd7", "afffff", "d70000", "d7005f",
	"d70087", "d700af", "d700d7", "d700ff", "d75f00", "d75f5f", "d75f87", "d75faf", "d75fd7",
	"d75fff", "d78700", "d7875f", "d78787", "d787af", "d787d7", "d787ff", "d7af00", "d7af5f",
	"d7af87", "d7afaf", "d7afd7", "d7afff", "d7d700", "d7d75f", "d7d787", "d7d7af", "d7d7d7",
	"d7d7ff", "d7ff00", "d7ff5f", "d7ff87", "d7ffaf", "d7ffd7", "d7ffff", "ff0000", "ff005f",
	"ff0087", "ff00af", "ff00d7", "ff00ff", "ff5f00", "ff5f5f", "ff5f87", "ff5faf", "ff5fd7",
	"ff5fff", "ff8700", "ff875f", "ff8787", "ff87af", "ff87d7", "ff87ff", "ffaf00", "ffaf5f",
	"ffaf87", "ffafaf", "ffafd7", "ffafff", "ffd700", "ffd75f", "ffd787", "ffd7af", "ffd7d7",
	"ffd7ff", "ffff00", "ffff5f", "ffff87", "ffffaf", "ffffd7", "ffffff", "080808", "121212",
	"1c1c1c", "262626", "303030", "3a3a3a", "444444", "4e4e4e", "585858", "626262", "6c6c6c",
	"767676", "808080", "8a8a8a", "949494", "9e9e9e", "a8a8a8", "b2b2b2", "bcbcbc", "c6c6c6",
	"d0d0d0", "dadada", "e4e4e4", "eeeeee"
];

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"window-size.js":function module(require,exports){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                             //
// node_modules/meteor/logging/node_modules/cli-color/window-size.js                                           //
//                                                                                                             //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                               //
"use strict";

var d = require("d");

Object.defineProperties(exports, {
	width: d.gs("ce", function () { return process.stdout.columns || 0; }),
	height: d.gs("ce", function () { return process.stdout.rows || 0; })
});

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"erase.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                             //
// node_modules/meteor/logging/node_modules/cli-color/erase.js                                                 //
//                                                                                                             //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                               //
"use strict";

module.exports = {
	screen: "\x1b[2J",
	screenLeft: "\x1b[1J",
	screenRight: "\x1b[J",
	line: "\x1b[2K",
	lineLeft: "\x1b[1K",
	lineRight: "\x1b[K"
};

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"move.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                             //
// node_modules/meteor/logging/node_modules/cli-color/move.js                                                  //
//                                                                                                             //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                               //
"use strict";

var d     = require("d")
  , trunc = require("es5-ext/math/trunc");

var up, down, right, left, abs = Math.abs, floor = Math.floor, max = Math.max;

var getMove = function (control) {
	return function (num) {
		num = isNaN(num) ? 0 : max(floor(num), 0);
		return num ? "\x1b[" + num + control : "";
	};
};

module.exports = Object.defineProperties(
	function (x, y) {
		x = isNaN(x) ? 0 : floor(x);
		y = isNaN(y) ? 0 : floor(y);
		return (x > 0 ? right(x) : left(-x)) + (y > 0 ? down(y) : up(-y));
	},
	{
		up: d((up = getMove("A"))),
		down: d((down = getMove("B"))),
		right: d((right = getMove("C"))),
		left: d((left = getMove("D"))),
		to: d(function (x, y) {
			x = isNaN(x) ? 1 : max(floor(x), 0) + 1;
			y = isNaN(y) ? 1 : max(floor(y), 0) + 1;
			return "\x1b[" + y + ";" + x + "H";
		}),
		lines: d(function (n) {
			var dir;
			n = trunc(n) || 0;
			dir = n >= 0 ? "E" : "F";
			n = floor(abs(n));
			return "\x1b[" + n + dir;
		}),
		top: d("\x1b[5000F"),
		bottom: d("\x1b[5000B"),
		lineBegin: d("\x1b[5000D"),
		lineEnd: d("\x1b[5000C")
	}
);

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"beep.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                             //
// node_modules/meteor/logging/node_modules/cli-color/beep.js                                                  //
//                                                                                                             //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                               //
"use strict";

module.exports = "\x07";

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"columns.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                             //
// node_modules/meteor/logging/node_modules/cli-color/columns.js                                               //
//                                                                                                             //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                               //
"use strict";

var generate          = require("es5-ext/array/generate")
  , from              = require("es5-ext/array/from")
  , iterable          = require("es5-ext/iterable/validate-object")
  , isValue           = require("es5-ext/object/is-value")
  , stringifiable     = require("es5-ext/object/validate-stringifiable")
  , repeat            = require("es5-ext/string/#/repeat")
  , getStrippedLength = require("./get-stripped-length");

var push = Array.prototype.push;

module.exports = function (inputRows/*, options*/) {
	var options = Object(arguments[1])
	  , colsMeta = []
	  , colsOptions = options.columns || []
	  , rows = [];

	from(iterable(inputRows), function (row) {
		var rowRows = [[]];
		from(iterable(row), function (cellStr, columnIndex) {
			var cellRows = stringifiable(cellStr).split("\n");
			while (cellRows.length > rowRows.length) rowRows.push(generate(columnIndex, ""));
			cellRows.forEach(function (cellRow, rowRowIndex) {
				rowRows[rowRowIndex][columnIndex] = cellRow;
			});
		});
		push.apply(rows, rowRows);
	});

	return (
		rows
			.map(function (row) {
				return from(iterable(row), function (str, index) {
					var col = colsMeta[index], strLength;
					if (!col) col = colsMeta[index] = { width: 0 };
					str = stringifiable(str);
					strLength = getStrippedLength(str);
					if (strLength > col.width) col.width = strLength;
					return { str: str, length: strLength };
				});
			})
			.map(function (row) {
				return row
					.map(function (item, index) {
						var pad, align = "left", colOptions = colsOptions && colsOptions[index];
						align = colOptions && colOptions.align === "right" ? "right" : "left";
						pad = repeat.call(" ", colsMeta[index].width - item.length);
						if (align === "left") return item.str + pad;
						return pad + item.str;
					})
					.join(isValue(options.sep) ? options.sep : " | ");
			})
			.join("\n") + "\n"
	);
};

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"get-stripped-length.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                             //
// node_modules/meteor/logging/node_modules/cli-color/get-stripped-length.js                                   //
//                                                                                                             //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                               //
"use strict";

/*
 * get actual length of ANSI-formatted string
 */

var strip = require("./strip");

module.exports = function (str) { return strip(str).length; };

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"strip.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                             //
// node_modules/meteor/logging/node_modules/cli-color/strip.js                                                 //
//                                                                                                             //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                               //
// Strip ANSI formatting from string

"use strict";

var stringifiable = require("es5-ext/object/validate-stringifiable")
  , r             = require("ansi-regex")();

module.exports = function (str) { return stringifiable(str).replace(r, ""); };

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"slice.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                             //
// node_modules/meteor/logging/node_modules/cli-color/slice.js                                                 //
//                                                                                                             //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                               //
"use strict";

var reAnsi        = require("ansi-regex")
  , stringifiable = require("es5-ext/object/validate-stringifiable-value")
  , length        = require("./get-stripped-length")
  , sgr           = require("./lib/sgr")
  , max           = Math.max;

var Token = function (token) { this.token = token; };

var tokenize = function (str) {
	var match = reAnsi().exec(str);

	if (!match) {
		return [str];
	}

	var index = match.index, head, prehead, tail;

	if (index === 0) {
		head = match[0];
		tail = str.slice(head.length);

		return [new Token(head)].concat(tokenize(tail));
	}

	prehead = str.slice(0, index);
	head = match[0];
	tail = str.slice(index + head.length);

	return [prehead, new Token(head)].concat(tokenize(tail));
};

var isChunkInSlice = function (chunk, index, begin, end) {
	var endIndex = chunk.length + index;

	if (begin > endIndex) return false;
	if (end < index) return false;
	return true;
};

// eslint-disable-next-line max-lines-per-function
var sliceSeq = function (seq, begin, end) {
	var sliced = seq.reduce(
		function (state, chunk) {
			var index = state.index;

			if (chunk instanceof Token) {
				var code = sgr.extractCode(chunk.token);

				if (index <= begin) {
					if (code in sgr.openers) {
						sgr.openStyle(state.preOpeners, code);
					}
					if (code in sgr.closers) {
						sgr.closeStyle(state.preOpeners, code);
					}
				} else if (index < end) {
					if (code in sgr.openers) {
						sgr.openStyle(state.inOpeners, code);
						state.seq.push(chunk);
					} else if (code in sgr.closers) {
						state.inClosers.push(code);
						state.seq.push(chunk);
					}
				}
			} else {
				var nextChunk = "";

				if (isChunkInSlice(chunk, index, begin, end)) {
					var relBegin = Math.max(begin - index, 0)
					  , relEnd = Math.min(end - index, chunk.length);

					nextChunk = chunk.slice(relBegin, relEnd);
				}

				state.seq.push(nextChunk);
				state.index = index + chunk.length;
			}

			return state;
		},
		{
			index: 0,
			seq: [],

			// preOpeners -> [ mod ]
			// preOpeners must be prepended to the slice if they wasn't closed til the end of it
			// preOpeners must be closed if they wasn't closed til the end of the slice
			preOpeners: [],

			// inOpeners  -> [ mod ]
			// inOpeners already in the slice and must not be prepended to the slice
			// inOpeners must be closed if they wasn't closed til the end of the slice
			inOpeners: [], // opener CSI inside slice

			// inClosers -> [ code ]
			// closer CSIs for determining which pre/in-Openers must be closed
			inClosers: []
		}
	);

	sliced.seq = [].concat(
		sgr.prepend(sliced.preOpeners), sliced.seq,
		sgr.complete([].concat(sliced.preOpeners, sliced.inOpeners), sliced.inClosers)
	);

	return sliced.seq;
};

module.exports = function (str/*, begin, end*/) {
	var seq, begin = Number(arguments[1]), end = Number(arguments[2]), len;

	str = stringifiable(str);
	len = length(str);

	if (isNaN(begin)) {
		begin = 0;
	}
	if (isNaN(end)) {
		end = len;
	}
	if (begin < 0) {
		begin = max(len + begin, 0);
	}
	if (end < 0) {
		end = max(len + end, 0);
	}

	seq = tokenize(str);
	seq = sliceSeq(seq, begin, end);
	return seq
		.map(function (chunk) {
			if (chunk instanceof Token) {
				return chunk.token;
			}

			return chunk;
		})
		.join("");
};

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"throbber.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                             //
// node_modules/meteor/logging/node_modules/cli-color/throbber.js                                              //
//                                                                                                             //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                               //
"use strict";

var compose      = require("es5-ext/function/#/compose")
  , callable     = require("es5-ext/object/valid-callable")
  , d            = require("d")
  , validTimeout = require("timers-ext/valid-timeout");

var chars = "-\\|/", l = chars.length, ThrobberIterator;

ThrobberIterator = function () {
	// no setup needed
};
Object.defineProperties(ThrobberIterator.prototype, {
	index: d(-1),
	running: d(false),
	next: d(function () {
		var str = this.running ? "\u0008" : "";
		if (!this.running) this.running = true;
		return str + chars[(this.index = (this.index + 1) % l)];
	}),
	reset: d(function () {
		if (!this.running) return "";
		this.index = -1;
		this.running = false;
		return "\u0008";
	})
});

module.exports = exports = function (write, interval/*, format*/) {
	var format = arguments[2], token, iterator = new ThrobberIterator();
	callable(write);
	interval = validTimeout(interval);
	if (format !== undefined) write = compose.call(write, callable(format));
	return {
		start: function () {
			if (token) return;
			token = setInterval(function () { write(iterator.next()); }, interval);
		},
		restart: function () {
			this.stop();
			this.start();
		},
		stop: function () {
			if (!token) return;
			clearInterval(token);
			token = null;
			write(iterator.reset());
		}
	};
};

Object.defineProperty(exports, "Iterator", d(ThrobberIterator));

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"reset.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                             //
// node_modules/meteor/logging/node_modules/cli-color/reset.js                                                 //
//                                                                                                             //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                               //
"use strict";

module.exports = "\x1b[2J\x1b[0;0H";

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"art.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                             //
// node_modules/meteor/logging/node_modules/cli-color/art.js                                                   //
//                                                                                                             //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                               //
"use strict";

var object        = require("es5-ext/object/valid-object")
  , stringifiable = require("es5-ext/object/validate-stringifiable-value")
  , forOf         = require("es6-iterator/for-of");

module.exports = function (text, style) {
	var result = "";
	text = stringifiable(text);
	object(style);
	forOf(text, function (char) { result += style[char] || char; });
	return result;
};

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"d":{"package.json":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                             //
// node_modules/meteor/logging/node_modules/d/package.json                                                     //
//                                                                                                             //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                               //
module.exports = {
  "name": "d",
  "version": "1.0.1"
};

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"index.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                             //
// node_modules/meteor/logging/node_modules/d/index.js                                                         //
//                                                                                                             //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                               //
"use strict";

var isValue         = require("type/value/is")
  , isPlainFunction = require("type/plain-function/is")
  , assign          = require("es5-ext/object/assign")
  , normalizeOpts   = require("es5-ext/object/normalize-options")
  , contains        = require("es5-ext/string/#/contains");

var d = (module.exports = function (dscr, value/*, options*/) {
	var c, e, w, options, desc;
	if (arguments.length < 2 || typeof dscr !== "string") {
		options = value;
		value = dscr;
		dscr = null;
	} else {
		options = arguments[2];
	}
	if (isValue(dscr)) {
		c = contains.call(dscr, "c");
		e = contains.call(dscr, "e");
		w = contains.call(dscr, "w");
	} else {
		c = w = true;
		e = false;
	}

	desc = { value: value, configurable: c, enumerable: e, writable: w };
	return !options ? desc : assign(normalizeOpts(options), desc);
});

d.gs = function (dscr, get, set/*, options*/) {
	var c, e, options, desc;
	if (typeof dscr !== "string") {
		options = set;
		set = get;
		get = dscr;
		dscr = null;
	} else {
		options = arguments[3];
	}
	if (!isValue(get)) {
		get = undefined;
	} else if (!isPlainFunction(get)) {
		options = get;
		get = set = undefined;
	} else if (!isValue(set)) {
		set = undefined;
	} else if (!isPlainFunction(set)) {
		options = set;
		set = undefined;
	}
	if (isValue(dscr)) {
		c = contains.call(dscr, "c");
		e = contains.call(dscr, "e");
	} else {
		c = true;
		e = false;
	}

	desc = { get: get, set: set, configurable: c, enumerable: e };
	return !options ? desc : assign(normalizeOpts(options), desc);
};

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"lazy.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                             //
// node_modules/meteor/logging/node_modules/d/lazy.js                                                          //
//                                                                                                             //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                               //
"use strict";

var isPlainFunction = require("type/plain-function/is")
  , ensureValue     = require("type/value/ensure")
  , isValue         = require("type/value/is")
  , map             = require("es5-ext/object/map")
  , contains        = require("es5-ext/string/#/contains");

var call = Function.prototype.call
  , defineProperty = Object.defineProperty
  , getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor
  , getPrototypeOf = Object.getPrototypeOf
  , hasOwnProperty = Object.prototype.hasOwnProperty
  , cacheDesc = { configurable: false, enumerable: false, writable: false, value: null }
  , define;

define = function (name, options) {
	var value, dgs, cacheName, desc, writable = false, resolvable, flat;
	options = Object(ensureValue(options));
	cacheName = options.cacheName;
	flat = options.flat;
	if (!isValue(cacheName)) cacheName = name;
	delete options.cacheName;
	value = options.value;
	resolvable = isPlainFunction(value);
	delete options.value;
	dgs = { configurable: Boolean(options.configurable), enumerable: Boolean(options.enumerable) };
	if (name !== cacheName) {
		dgs.get = function () {
			if (hasOwnProperty.call(this, cacheName)) return this[cacheName];
			cacheDesc.value = resolvable ? call.call(value, this, options) : value;
			cacheDesc.writable = writable;
			defineProperty(this, cacheName, cacheDesc);
			cacheDesc.value = null;
			if (desc) defineProperty(this, name, desc);
			return this[cacheName];
		};
	} else if (!flat) {
		dgs.get = function self() {
			var ownDesc;
			if (hasOwnProperty.call(this, name)) {
				ownDesc = getOwnPropertyDescriptor(this, name);
				// It happens in Safari, that getter is still called after property
				// was defined with a value, following workarounds that
				// While in IE11 it may happen that here ownDesc is undefined (go figure)
				if (ownDesc) {
					if (ownDesc.hasOwnProperty("value")) return ownDesc.value;
					if (typeof ownDesc.get === "function" && ownDesc.get !== self) {
						return ownDesc.get.call(this);
					}
					return value;
				}
			}
			desc.value = resolvable ? call.call(value, this, options) : value;
			defineProperty(this, name, desc);
			desc.value = null;
			return this[name];
		};
	} else {
		dgs.get = function self() {
			var base = this, ownDesc;
			if (hasOwnProperty.call(this, name)) {
				// It happens in Safari, that getter is still called after property
				// was defined with a value, following workarounds that
				ownDesc = getOwnPropertyDescriptor(this, name);
				if (ownDesc.hasOwnProperty("value")) return ownDesc.value;
				if (typeof ownDesc.get === "function" && ownDesc.get !== self) {
					return ownDesc.get.call(this);
				}
			}
			while (!hasOwnProperty.call(base, name)) base = getPrototypeOf(base);
			desc.value = resolvable ? call.call(value, base, options) : value;
			defineProperty(base, name, desc);
			desc.value = null;
			return base[name];
		};
	}
	dgs.set = function (value) {
		if (hasOwnProperty.call(this, name)) {
			throw new TypeError("Cannot assign to lazy defined '" + name + "' property of " + this);
		}
		dgs.get.call(this);
		this[cacheName] = value;
	};
	if (options.desc) {
		desc = {
			configurable: contains.call(options.desc, "c"),
			enumerable: contains.call(options.desc, "e")
		};
		if (cacheName === name) {
			desc.writable = contains.call(options.desc, "w");
			desc.value = null;
		} else {
			writable = contains.call(options.desc, "w");
			desc.get = dgs.get;
			desc.set = dgs.set;
		}
		delete options.desc;
	} else if (cacheName === name) {
		desc = {
			configurable: Boolean(options.configurable),
			enumerable: Boolean(options.enumerable),
			writable: Boolean(options.writable),
			value: null
		};
	}
	delete options.configurable;
	delete options.enumerable;
	delete options.writable;
	return dgs;
};

module.exports = function (props) {
	return map(props, function (desc, name) { return define(name, desc); });
};

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"auto-bind.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                             //
// node_modules/meteor/logging/node_modules/d/auto-bind.js                                                     //
//                                                                                                             //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                               //
"use strict";

var isValue             = require("type/value/is")
  , ensureValue         = require("type/value/ensure")
  , ensurePlainFunction = require("type/plain-function/ensure")
  , copy                = require("es5-ext/object/copy")
  , normalizeOptions    = require("es5-ext/object/normalize-options")
  , map                 = require("es5-ext/object/map");

var bind = Function.prototype.bind
  , defineProperty = Object.defineProperty
  , hasOwnProperty = Object.prototype.hasOwnProperty
  , define;

define = function (name, desc, options) {
	var value = ensureValue(desc) && ensurePlainFunction(desc.value), dgs;
	dgs = copy(desc);
	delete dgs.writable;
	delete dgs.value;
	dgs.get = function () {
		if (!options.overwriteDefinition && hasOwnProperty.call(this, name)) return value;
		desc.value = bind.call(value, options.resolveContext ? options.resolveContext(this) : this);
		defineProperty(this, name, desc);
		return this[name];
	};
	return dgs;
};

module.exports = function (props/*, options*/) {
	var options = normalizeOptions(arguments[1]);
	if (isValue(options.resolveContext)) ensurePlainFunction(options.resolveContext);
	return map(props, function (desc, name) { return define(name, desc, options); });
};

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"type":{"value":{"is.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                             //
// node_modules/meteor/logging/node_modules/type/value/is.js                                                   //
//                                                                                                             //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                               //
"use strict";

// ES3 safe
var _undefined = void 0;

module.exports = function (value) { return value !== _undefined && value !== null; };

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"ensure.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                             //
// node_modules/meteor/logging/node_modules/type/value/ensure.js                                               //
//                                                                                                             //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                               //
"use strict";

var resolveException = require("../lib/resolve-exception")
  , is               = require("./is");

module.exports = function (value/*, options*/) {
	if (is(value)) return value;
	return resolveException(value, "Cannot use %v", arguments[1]);
};

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"plain-function":{"is.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                             //
// node_modules/meteor/logging/node_modules/type/plain-function/is.js                                          //
//                                                                                                             //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                               //
"use strict";

var isFunction = require("../function/is");

var classRe = /^\s*class[\s{/}]/, functionToString = Function.prototype.toString;

module.exports = function (value) {
	if (!isFunction(value)) return false;
	if (classRe.test(functionToString.call(value))) return false;
	return true;
};

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"ensure.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                             //
// node_modules/meteor/logging/node_modules/type/plain-function/ensure.js                                      //
//                                                                                                             //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                               //
"use strict";

var resolveException = require("../lib/resolve-exception")
  , is               = require("./is");

module.exports = function (value/*, options*/) {
	if (is(value)) return value;
	return resolveException(value, "%v is not a plain function", arguments[1]);
};

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"function":{"is.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                             //
// node_modules/meteor/logging/node_modules/type/function/is.js                                                //
//                                                                                                             //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                               //
"use strict";

var isPrototype = require("../prototype/is");

module.exports = function (value) {
	if (typeof value !== "function") return false;

	if (!hasOwnProperty.call(value, "length")) return false;

	try {
		if (typeof value.length !== "number") return false;
		if (typeof value.call !== "function") return false;
		if (typeof value.apply !== "function") return false;
	} catch (error) {
		return false;
	}

	return !isPrototype(value);
};

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"prototype":{"is.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                             //
// node_modules/meteor/logging/node_modules/type/prototype/is.js                                               //
//                                                                                                             //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                               //
"use strict";

var isObject = require("../object/is");

module.exports = function (value) {
	if (!isObject(value)) return false;
	try {
		if (!value.constructor) return false;
		return value.constructor.prototype === value;
	} catch (error) {
		return false;
	}
};

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"object":{"is.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                             //
// node_modules/meteor/logging/node_modules/type/object/is.js                                                  //
//                                                                                                             //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                               //
"use strict";

var isValue = require("../value/is");

// prettier-ignore
var possibleTypes = { "object": true, "function": true, "undefined": true /* document.all */ };

module.exports = function (value) {
	if (!isValue(value)) return false;
	return hasOwnProperty.call(possibleTypes, typeof value);
};

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"lib":{"resolve-exception.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                             //
// node_modules/meteor/logging/node_modules/type/lib/resolve-exception.js                                      //
//                                                                                                             //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                               //
"use strict";

var isValue       = require("../value/is")
  , isObject      = require("../object/is")
  , stringCoerce  = require("../string/coerce")
  , toShortString = require("./to-short-string");

var resolveMessage = function (message, value) {
	return message.replace("%v", toShortString(value));
};

module.exports = function (value, defaultMessage, inputOptions) {
	if (!isObject(inputOptions)) throw new TypeError(resolveMessage(defaultMessage, value));
	if (!isValue(value)) {
		if ("default" in inputOptions) return inputOptions["default"];
		if (inputOptions.isOptional) return null;
	}
	var errorMessage = stringCoerce(inputOptions.errorMessage);
	if (!isValue(errorMessage)) errorMessage = defaultMessage;
	throw new TypeError(resolveMessage(errorMessage, value));
};

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"to-short-string.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                             //
// node_modules/meteor/logging/node_modules/type/lib/to-short-string.js                                        //
//                                                                                                             //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                               //
"use strict";

var safeToString = require("./safe-to-string");

var reNewLine = /[\n\r\u2028\u2029]/g;

module.exports = function (value) {
	var string = safeToString(value);
	if (string === null) return "<Non-coercible to string value>";
	// Trim if too long
	if (string.length > 100) string = string.slice(0, 99) + "…";
	// Replace eventual new lines
	string = string.replace(reNewLine, function (char) {
		switch (char) {
			case "\n":
				return "\\n";
			case "\r":
				return "\\r";
			case "\u2028":
				return "\\u2028";
			case "\u2029":
				return "\\u2029";
			/* istanbul ignore next */
			default:
				throw new Error("Unexpected character");
		}
	});
	return string;
};

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"safe-to-string.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                             //
// node_modules/meteor/logging/node_modules/type/lib/safe-to-string.js                                         //
//                                                                                                             //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                               //
"use strict";

module.exports = function (value) {
	try {
		return value.toString();
	} catch (error) {
		try { return String(value); }
		catch (error2) { return null; }
	}
};

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"string":{"coerce.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                             //
// node_modules/meteor/logging/node_modules/type/string/coerce.js                                              //
//                                                                                                             //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                               //
"use strict";

var isValue  = require("../value/is")
  , isObject = require("../object/is");

var objectToString = Object.prototype.toString;

module.exports = function (value) {
	if (!isValue(value)) return null;
	if (isObject(value)) {
		// Reject Object.prototype.toString coercion
		var valueToString = value.toString;
		if (typeof valueToString !== "function") return null;
		if (valueToString === objectToString) return null;
		// Note: It can be object coming from other realm, still as there's no ES3 and CSP compliant
		// way to resolve its realm's Object.prototype.toString it's left as not addressed edge case
	}
	try {
		return "" + value; // Ensure implicit coercion
	} catch (error) {
		return null;
	}
};

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}}},"es5-ext":{"object":{"assign":{"index.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                             //
// node_modules/meteor/logging/node_modules/es5-ext/object/assign/index.js                                     //
//                                                                                                             //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                               //
"use strict";

module.exports = require("./is-implemented")() ? Object.assign : require("./shim");

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"is-implemented.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                             //
// node_modules/meteor/logging/node_modules/es5-ext/object/assign/is-implemented.js                            //
//                                                                                                             //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                               //
"use strict";

module.exports = function () {
	var assign = Object.assign, obj;
	if (typeof assign !== "function") return false;
	obj = { foo: "raz" };
	assign(obj, { bar: "dwa" }, { trzy: "trzy" });
	return obj.foo + obj.bar + obj.trzy === "razdwatrzy";
};

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"shim.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                             //
// node_modules/meteor/logging/node_modules/es5-ext/object/assign/shim.js                                      //
//                                                                                                             //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                               //
"use strict";

var keys  = require("../keys")
  , value = require("../valid-value")
  , max   = Math.max;

module.exports = function (dest, src/*, …srcn*/) {
	var error, i, length = max(arguments.length, 2), assign;
	dest = Object(value(dest));
	assign = function (key) {
		try {
			dest[key] = src[key];
		} catch (e) {
			if (!error) error = e;
		}
	};
	for (i = 1; i < length; ++i) {
		src = arguments[i];
		keys(src).forEach(assign);
	}
	if (error !== undefined) throw error;
	return dest;
};

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"keys":{"index.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                             //
// node_modules/meteor/logging/node_modules/es5-ext/object/keys/index.js                                       //
//                                                                                                             //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                               //
"use strict";

module.exports = require("./is-implemented")() ? Object.keys : require("./shim");

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"is-implemented.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                             //
// node_modules/meteor/logging/node_modules/es5-ext/object/keys/is-implemented.js                              //
//                                                                                                             //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                               //
"use strict";

module.exports = function () {
	try {
		Object.keys("primitive");
		return true;
	} catch (e) {
		return false;
	}
};

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"shim.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                             //
// node_modules/meteor/logging/node_modules/es5-ext/object/keys/shim.js                                        //
//                                                                                                             //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                               //
"use strict";

var isValue = require("../is-value");

var keys = Object.keys;

module.exports = function (object) { return keys(isValue(object) ? Object(object) : object); };

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"is-value.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                             //
// node_modules/meteor/logging/node_modules/es5-ext/object/is-value.js                                         //
//                                                                                                             //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                               //
"use strict";

var _undefined = require("../function/noop")(); // Support ES3 engines

module.exports = function (val) { return val !== _undefined && val !== null; };

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"valid-value.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                             //
// node_modules/meteor/logging/node_modules/es5-ext/object/valid-value.js                                      //
//                                                                                                             //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                               //
"use strict";

var isValue = require("./is-value");

module.exports = function (value) {
	if (!isValue(value)) throw new TypeError("Cannot use null or undefined");
	return value;
};

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"normalize-options.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                             //
// node_modules/meteor/logging/node_modules/es5-ext/object/normalize-options.js                                //
//                                                                                                             //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                               //
"use strict";

var isValue = require("./is-value");

var forEach = Array.prototype.forEach, create = Object.create;

var process = function (src, obj) {
	var key;
	for (key in src) obj[key] = src[key];
};

// eslint-disable-next-line no-unused-vars
module.exports = function (opts1/*, …options*/) {
	var result = create(null);
	forEach.call(arguments, function (options) {
		if (!isValue(options)) return;
		process(Object(options), result);
	});
	return result;
};

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"for-each.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                             //
// node_modules/meteor/logging/node_modules/es5-ext/object/for-each.js                                         //
//                                                                                                             //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                               //
"use strict";

module.exports = require("./_iterate")("forEach");

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"_iterate.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                             //
// node_modules/meteor/logging/node_modules/es5-ext/object/_iterate.js                                         //
//                                                                                                             //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                               //
// Internal method, used by iteration functions.
// Calls a function for each key-value pair found in object
// Optionally takes compareFn to iterate object in specific order

"use strict";

var callable                = require("./valid-callable")
  , value                   = require("./valid-value")
  , bind                    = Function.prototype.bind
  , call                    = Function.prototype.call
  , keys                    = Object.keys
  , objPropertyIsEnumerable = Object.prototype.propertyIsEnumerable;

module.exports = function (method, defVal) {
	return function (obj, cb/*, thisArg, compareFn*/) {
		var list, thisArg = arguments[2], compareFn = arguments[3];
		obj = Object(value(obj));
		callable(cb);

		list = keys(obj);
		if (compareFn) {
			list.sort(typeof compareFn === "function" ? bind.call(compareFn, obj) : undefined);
		}
		if (typeof method !== "function") method = list[method];
		return call.call(method, list, function (key, index) {
			if (!objPropertyIsEnumerable.call(obj, key)) return defVal;
			return call.call(cb, thisArg, obj[key], key, obj, index);
		});
	};
};

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"valid-callable.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                             //
// node_modules/meteor/logging/node_modules/es5-ext/object/valid-callable.js                                   //
//                                                                                                             //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                               //
"use strict";

module.exports = function (fn) {
	if (typeof fn !== "function") throw new TypeError(fn + " is not a function");
	return fn;
};

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"map.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                             //
// node_modules/meteor/logging/node_modules/es5-ext/object/map.js                                              //
//                                                                                                             //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                               //
"use strict";

var callable = require("./valid-callable")
  , forEach  = require("./for-each")
  , call     = Function.prototype.call;

module.exports = function (obj, cb/*, thisArg*/) {
	var result = {}, thisArg = arguments[2];
	callable(cb);
	forEach(obj, function (value, key, targetObj, index) {
		result[key] = call.call(cb, thisArg, value, key, targetObj, index);
	});
	return result;
};

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"primitive-set.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                             //
// node_modules/meteor/logging/node_modules/es5-ext/object/primitive-set.js                                    //
//                                                                                                             //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                               //
"use strict";

var forEach = Array.prototype.forEach, create = Object.create;

// eslint-disable-next-line no-unused-vars
module.exports = function (arg/*, …args*/) {
	var set = create(null);
	forEach.call(arguments, function (name) { set[name] = true; });
	return set;
};

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"set-prototype-of":{"index.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                             //
// node_modules/meteor/logging/node_modules/es5-ext/object/set-prototype-of/index.js                           //
//                                                                                                             //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                               //
"use strict";

module.exports = require("./is-implemented")() ? Object.setPrototypeOf : require("./shim");

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"is-implemented.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                             //
// node_modules/meteor/logging/node_modules/es5-ext/object/set-prototype-of/is-implemented.js                  //
//                                                                                                             //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                               //
"use strict";

var create = Object.create, getPrototypeOf = Object.getPrototypeOf, plainObject = {};

module.exports = function (/* CustomCreate*/) {
	var setPrototypeOf = Object.setPrototypeOf, customCreate = arguments[0] || create;
	if (typeof setPrototypeOf !== "function") return false;
	return getPrototypeOf(setPrototypeOf(customCreate(null), plainObject)) === plainObject;
};

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"shim.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                             //
// node_modules/meteor/logging/node_modules/es5-ext/object/set-prototype-of/shim.js                            //
//                                                                                                             //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                               //
/* eslint no-proto: "off" */

// Big thanks to @WebReflection for sorting this out
// https://gist.github.com/WebReflection/5593554

"use strict";

var isObject         = require("../is-object")
  , value            = require("../valid-value")
  , objIsPrototypeOf = Object.prototype.isPrototypeOf
  , defineProperty   = Object.defineProperty
  , nullDesc         = { configurable: true, enumerable: false, writable: true, value: undefined }
  , validate;

validate = function (obj, prototype) {
	value(obj);
	if (prototype === null || isObject(prototype)) return obj;
	throw new TypeError("Prototype must be null or an object");
};

module.exports = (function (status) {
	var fn, set;
	if (!status) return null;
	if (status.level === 2) {
		if (status.set) {
			set = status.set;
			fn = function (obj, prototype) {
				set.call(validate(obj, prototype), prototype);
				return obj;
			};
		} else {
			fn = function (obj, prototype) {
				validate(obj, prototype).__proto__ = prototype;
				return obj;
			};
		}
	} else {
		fn = function self(obj, prototype) {
			var isNullBase;
			validate(obj, prototype);
			isNullBase = objIsPrototypeOf.call(self.nullPolyfill, obj);
			if (isNullBase) delete self.nullPolyfill.__proto__;
			if (prototype === null) prototype = self.nullPolyfill;
			obj.__proto__ = prototype;
			if (isNullBase) defineProperty(self.nullPolyfill, "__proto__", nullDesc);
			return obj;
		};
	}
	return Object.defineProperty(fn, "level", {
		configurable: false,
		enumerable: false,
		writable: false,
		value: status.level
	});
})(
	(function () {
		var tmpObj1 = Object.create(null)
		  , tmpObj2 = {}
		  , set
		  , desc = Object.getOwnPropertyDescriptor(Object.prototype, "__proto__");

		if (desc) {
			try {
				set = desc.set; // Opera crashes at this point
				set.call(tmpObj1, tmpObj2);
			} catch (ignore) {}
			if (Object.getPrototypeOf(tmpObj1) === tmpObj2) return { set: set, level: 2 };
		}

		tmpObj1.__proto__ = tmpObj2;
		if (Object.getPrototypeOf(tmpObj1) === tmpObj2) return { level: 2 };

		tmpObj1 = {};
		tmpObj1.__proto__ = tmpObj2;
		if (Object.getPrototypeOf(tmpObj1) === tmpObj2) return { level: 1 };

		return false;
	})()
);

require("../create");

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"is-object.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                             //
// node_modules/meteor/logging/node_modules/es5-ext/object/is-object.js                                        //
//                                                                                                             //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                               //
"use strict";

var isValue = require("./is-value");

var map = { function: true, object: true };

module.exports = function (value) { return (isValue(value) && map[typeof value]) || false; };

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"create.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                             //
// node_modules/meteor/logging/node_modules/es5-ext/object/create.js                                           //
//                                                                                                             //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                               //
// Workaround for http://code.google.com/p/v8/issues/detail?id=2804

"use strict";

var create = Object.create, shim;

if (!require("./set-prototype-of/is-implemented")()) {
	shim = require("./set-prototype-of/shim");
}

module.exports = (function () {
	var nullObject, polyProps, desc;
	if (!shim) return create;
	if (shim.level !== 1) return create;

	nullObject = {};
	polyProps = {};
	desc = { configurable: false, enumerable: false, writable: true, value: undefined };
	Object.getOwnPropertyNames(Object.prototype).forEach(function (name) {
		if (name === "__proto__") {
			polyProps[name] = {
				configurable: true,
				enumerable: false,
				writable: true,
				value: undefined
			};
			return;
		}
		polyProps[name] = desc;
	});
	Object.defineProperties(nullObject, polyProps);

	Object.defineProperty(shim, "nullPolyfill", {
		configurable: false,
		enumerable: false,
		writable: false,
		value: nullObject
	});

	return function (prototype, props) {
		return create(prototype === null ? nullObject : prototype, props);
	};
})();

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"mixin.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                             //
// node_modules/meteor/logging/node_modules/es5-ext/object/mixin.js                                            //
//                                                                                                             //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                               //
"use strict";

var value                    = require("./valid-value")
  , defineProperty           = Object.defineProperty
  , getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor
  , getOwnPropertyNames      = Object.getOwnPropertyNames
  , getOwnPropertySymbols    = Object.getOwnPropertySymbols;

module.exports = function (target, source) {
	var error, sourceObject = Object(value(source));
	target = Object(value(target));
	getOwnPropertyNames(sourceObject).forEach(function (name) {
		try {
			defineProperty(target, name, getOwnPropertyDescriptor(source, name));
		} catch (e) { error = e; }
	});
	if (typeof getOwnPropertySymbols === "function") {
		getOwnPropertySymbols(sourceObject).forEach(function (symbol) {
			try {
				defineProperty(target, symbol, getOwnPropertyDescriptor(source, symbol));
			} catch (e) { error = e; }
		});
	}
	if (error !== undefined) throw error;
	return target;
};

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"validate-stringifiable-value.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                             //
// node_modules/meteor/logging/node_modules/es5-ext/object/validate-stringifiable-value.js                     //
//                                                                                                             //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                               //
"use strict";

var ensureValue   = require("./valid-value")
  , stringifiable = require("./validate-stringifiable");

module.exports = function (value) { return stringifiable(ensureValue(value)); };

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"validate-stringifiable.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                             //
// node_modules/meteor/logging/node_modules/es5-ext/object/validate-stringifiable.js                           //
//                                                                                                             //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                               //
"use strict";

var isCallable = require("./is-callable");

module.exports = function (stringifiable) {
	try {
		if (stringifiable && isCallable(stringifiable.toString)) return stringifiable.toString();
		return String(stringifiable);
	} catch (e) {
		throw new TypeError("Passed argument cannot be stringifed");
	}
};

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"is-callable.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                             //
// node_modules/meteor/logging/node_modules/es5-ext/object/is-callable.js                                      //
//                                                                                                             //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                               //
// Deprecated

"use strict";

module.exports = function (obj) { return typeof obj === "function"; };

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"first-key.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                             //
// node_modules/meteor/logging/node_modules/es5-ext/object/first-key.js                                        //
//                                                                                                             //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                               //
"use strict";

var value                   = require("./valid-value")
  , objPropertyIsEnumerable = Object.prototype.propertyIsEnumerable;

module.exports = function (obj) {
	var i;
	value(obj);
	for (i in obj) {
		if (objPropertyIsEnumerable.call(obj, i)) return i;
	}
	return null;
};

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"is-array-like.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                             //
// node_modules/meteor/logging/node_modules/es5-ext/object/is-array-like.js                                    //
//                                                                                                             //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                               //
"use strict";

var isFunction = require("../function/is-function")
  , isObject   = require("./is-object")
  , isValue    = require("./is-value");

module.exports = function (value) {
	return (
		(isValue(value) &&
			typeof value.length === "number" &&
			// Just checking ((typeof x === 'object') && (typeof x !== 'function'))
			// won't work right for some cases, e.g.:
			// type of instance of NodeList in Safari is a 'function'
			((isObject(value) && !isFunction(value)) || typeof value === "string")) ||
		false
	);
};

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"valid-object.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                             //
// node_modules/meteor/logging/node_modules/es5-ext/object/valid-object.js                                     //
//                                                                                                             //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                               //
"use strict";

var isObject = require("./is-object");

module.exports = function (value) {
	if (!isObject(value)) throw new TypeError(value + " is not an Object");
	return value;
};

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"copy.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                             //
// node_modules/meteor/logging/node_modules/es5-ext/object/copy.js                                             //
//                                                                                                             //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                               //
"use strict";

var aFrom  = require("../array/from")
  , assign = require("./assign")
  , value  = require("./valid-value");

module.exports = function (obj/*, propertyNames, options*/) {
	var copy = Object(value(obj)), propertyNames = arguments[1], options = Object(arguments[2]);
	if (copy !== obj && !propertyNames) return copy;
	var result = {};
	if (propertyNames) {
		aFrom(propertyNames, function (propertyName) {
			if (options.ensure || propertyName in obj) result[propertyName] = obj[propertyName];
		});
	} else {
		assign(result, obj);
	}
	return result;
};

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"function":{"noop.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                             //
// node_modules/meteor/logging/node_modules/es5-ext/function/noop.js                                           //
//                                                                                                             //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                               //
"use strict";

// eslint-disable-next-line no-empty-function
module.exports = function () {};

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"_define-length.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                             //
// node_modules/meteor/logging/node_modules/es5-ext/function/_define-length.js                                 //
//                                                                                                             //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                               //
"use strict";

var toPosInt = require("../number/to-pos-integer");

var test = function (arg1, arg2) { return arg2; };

var desc, defineProperty, generate, mixin;

try {
	Object.defineProperty(test, "length", {
		configurable: true,
		writable: false,
		enumerable: false,
		value: 1
	});
}
catch (ignore) {}

if (test.length === 1) {
	// ES6
	desc = { configurable: true, writable: false, enumerable: false };
	defineProperty = Object.defineProperty;
	module.exports = function (fn, length) {
		length = toPosInt(length);
		if (fn.length === length) return fn;
		desc.value = length;
		return defineProperty(fn, "length", desc);
	};
} else {
	mixin = require("../object/mixin");
	generate = (function () {
		var cache = [];
		return function (length) {
			var args, i = 0;
			if (cache[length]) return cache[length];
			args = [];
			while (length--) args.push("a" + (++i).toString(36));
			// eslint-disable-next-line no-new-func
			return new Function(
				"fn",
				"return function (" + args.join(", ") + ") { return fn.apply(this, arguments); };"
			);
		};
	})();
	module.exports = function (src, length) {
		var target;
		length = toPosInt(length);
		if (src.length === length) return src;
		target = generate(length)(src);
		try { mixin(target, src); }
		catch (ignore) {}
		return target;
	};
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"is-arguments.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                             //
// node_modules/meteor/logging/node_modules/es5-ext/function/is-arguments.js                                   //
//                                                                                                             //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                               //
"use strict";

var objToString = Object.prototype.toString
  , id = objToString.call((function () { return arguments; })());

module.exports = function (value) { return objToString.call(value) === id; };

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"is-function.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                             //
// node_modules/meteor/logging/node_modules/es5-ext/function/is-function.js                                    //
//                                                                                                             //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                               //
"use strict";

var objToString = Object.prototype.toString
  , isFunctionStringTag = RegExp.prototype.test.bind(/^[object [A-Za-z0-9]*Function]$/);

module.exports = function (value) {
	return typeof value === "function" && isFunctionStringTag(objToString.call(value));
};

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"#":{"compose.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                             //
// node_modules/meteor/logging/node_modules/es5-ext/function/#/compose.js                                      //
//                                                                                                             //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                               //
"use strict";

var isValue  = require("../../object/is-value")
  , callable = require("../../object/valid-callable")
  , aFrom    = require("../../array/from");

var apply = Function.prototype.apply
  , call = Function.prototype.call
  , callFn = function (arg, fn) { return call.call(fn, this, arg); };

module.exports = function (fnIgnored/*, …fnn*/) {
	var fns, first;
	var args = aFrom(arguments);
	fns = isValue(this) ? [this].concat(args) : args;
	fns.forEach(callable);
	fns = fns.reverse();
	first = fns[0];
	fns = fns.slice(1);
	return function (argIgnored) { return fns.reduce(callFn, apply.call(first, this, arguments)); };
};

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}}},"string":{"#":{"contains":{"index.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                             //
// node_modules/meteor/logging/node_modules/es5-ext/string/#/contains/index.js                                 //
//                                                                                                             //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                               //
"use strict";

module.exports = require("./is-implemented")() ? String.prototype.contains : require("./shim");

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"is-implemented.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                             //
// node_modules/meteor/logging/node_modules/es5-ext/string/#/contains/is-implemented.js                        //
//                                                                                                             //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                               //
"use strict";

var str = "razdwatrzy";

module.exports = function () {
	if (typeof str.contains !== "function") return false;
	return str.contains("dwa") === true && str.contains("foo") === false;
};

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"shim.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                             //
// node_modules/meteor/logging/node_modules/es5-ext/string/#/contains/shim.js                                  //
//                                                                                                             //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                               //
"use strict";

var indexOf = String.prototype.indexOf;

module.exports = function (searchString/*, position*/) {
	return indexOf.call(this, searchString, arguments[1]) > -1;
};

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"repeat":{"index.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                             //
// node_modules/meteor/logging/node_modules/es5-ext/string/#/repeat/index.js                                   //
//                                                                                                             //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                               //
"use strict";

module.exports = require("./is-implemented")() ? String.prototype.repeat : require("./shim");

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"is-implemented.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                             //
// node_modules/meteor/logging/node_modules/es5-ext/string/#/repeat/is-implemented.js                          //
//                                                                                                             //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                               //
"use strict";

var str = "foo";

module.exports = function () {
	if (typeof str.repeat !== "function") return false;
	return str.repeat(2) === "foofoo";
};

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"shim.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                             //
// node_modules/meteor/logging/node_modules/es5-ext/string/#/repeat/shim.js                                    //
//                                                                                                             //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                               //
// Thanks
// @rauchma http://www.2ality.com/2014/01/efficient-string-repeat.html
// @mathiasbynens https://github.com/mathiasbynens/String.prototype.repeat/blob/4a4b567def/repeat.js

"use strict";

var value     = require("../../../object/valid-value")
  , toInteger = require("../../../number/to-integer");

module.exports = function (count) {
	var str = String(value(this)), result;
	count = toInteger(count);
	if (count < 0) throw new RangeError("Count must be >= 0");
	if (!isFinite(count)) throw new RangeError("Count must be < ∞");

	result = "";
	while (count) {
		if (count % 2) result += str;
		if (count > 1) str += str;
		// eslint-disable-next-line no-bitwise
		count >>= 1;
	}
	return result;
};

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}}},"is-string.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                             //
// node_modules/meteor/logging/node_modules/es5-ext/string/is-string.js                                        //
//                                                                                                             //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                               //
"use strict";

var objToString = Object.prototype.toString, id = objToString.call("");

module.exports = function (value) {
	return (
		typeof value === "string" ||
		(value &&
			typeof value === "object" &&
			(value instanceof String || objToString.call(value) === id)) ||
		false
	);
};

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"number":{"to-pos-integer.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                             //
// node_modules/meteor/logging/node_modules/es5-ext/number/to-pos-integer.js                                   //
//                                                                                                             //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                               //
"use strict";

var toInteger = require("./to-integer")
  , max       = Math.max;

module.exports = function (value) { return max(0, toInteger(value)); };

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"to-integer.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                             //
// node_modules/meteor/logging/node_modules/es5-ext/number/to-integer.js                                       //
//                                                                                                             //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                               //
"use strict";

var sign  = require("../math/sign")
  , abs   = Math.abs
  , floor = Math.floor;

module.exports = function (value) {
	if (isNaN(value)) return 0;
	value = Number(value);
	if (value === 0 || !isFinite(value)) return value;
	return sign(value) * floor(abs(value));
};

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"is-nan":{"index.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                             //
// node_modules/meteor/logging/node_modules/es5-ext/number/is-nan/index.js                                     //
//                                                                                                             //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                               //
"use strict";

module.exports = require("./is-implemented")() ? Number.isNaN : require("./shim");

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"is-implemented.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                             //
// node_modules/meteor/logging/node_modules/es5-ext/number/is-nan/is-implemented.js                            //
//                                                                                                             //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                               //
"use strict";

module.exports = function () {
	var numberIsNaN = Number.isNaN;
	if (typeof numberIsNaN !== "function") return false;
	return !numberIsNaN({}) && numberIsNaN(NaN) && !numberIsNaN(34);
};

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"shim.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                             //
// node_modules/meteor/logging/node_modules/es5-ext/number/is-nan/shim.js                                      //
//                                                                                                             //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                               //
"use strict";

module.exports = function (value) {
	// eslint-disable-next-line no-self-compare
	return value !== value;
};

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}}},"math":{"sign":{"index.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                             //
// node_modules/meteor/logging/node_modules/es5-ext/math/sign/index.js                                         //
//                                                                                                             //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                               //
"use strict";

module.exports = require("./is-implemented")() ? Math.sign : require("./shim");

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"is-implemented.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                             //
// node_modules/meteor/logging/node_modules/es5-ext/math/sign/is-implemented.js                                //
//                                                                                                             //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                               //
"use strict";

module.exports = function () {
	var sign = Math.sign;
	if (typeof sign !== "function") return false;
	return sign(10) === 1 && sign(-20) === -1;
};

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"shim.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                             //
// node_modules/meteor/logging/node_modules/es5-ext/math/sign/shim.js                                          //
//                                                                                                             //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                               //
"use strict";

module.exports = function (value) {
	value = Number(value);
	if (isNaN(value) || value === 0) return value;
	return value > 0 ? 1 : -1;
};

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"trunc":{"index.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                             //
// node_modules/meteor/logging/node_modules/es5-ext/math/trunc/index.js                                        //
//                                                                                                             //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                               //
"use strict";

module.exports = require("./is-implemented")() ? Math.trunc : require("./shim");

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"is-implemented.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                             //
// node_modules/meteor/logging/node_modules/es5-ext/math/trunc/is-implemented.js                               //
//                                                                                                             //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                               //
"use strict";

module.exports = function () {
	var trunc = Math.trunc;
	if (typeof trunc !== "function") return false;
	return trunc(13.67) === 13 && trunc(-13.67) === -13;
};

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"shim.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                             //
// node_modules/meteor/logging/node_modules/es5-ext/math/trunc/shim.js                                         //
//                                                                                                             //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                               //
"use strict";

var floor = Math.floor;

module.exports = function (value) {
	if (isNaN(value)) return NaN;
	value = Number(value);
	if (value === 0) return value;
	if (value === Infinity) return Infinity;
	if (value === -Infinity) return -Infinity;
	if (value > 0) return floor(value);
	return -floor(-value);
};

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}}},"error":{"custom.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                             //
// node_modules/meteor/logging/node_modules/es5-ext/error/custom.js                                            //
//                                                                                                             //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                               //
"use strict";

var assign            = require("../object/assign")
  , isObject          = require("../object/is-object")
  , isValue           = require("../object/is-value")
  , captureStackTrace = Error.captureStackTrace;

module.exports = function (message/*, code, ext*/) {
	var err = new Error(message), code = arguments[1], ext = arguments[2];
	if (!isValue(ext)) {
		if (isObject(code)) {
			ext = code;
			code = null;
		}
	}
	if (isValue(ext)) assign(err, ext);
	if (isValue(code)) err.code = code;
	if (captureStackTrace) captureStackTrace(err, module.exports);
	return err;
};

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"array":{"to-array.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                             //
// node_modules/meteor/logging/node_modules/es5-ext/array/to-array.js                                          //
//                                                                                                             //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                               //
"use strict";

var from    = require("./from")
  , isArray = Array.isArray;

module.exports = function (arrayLike) { return isArray(arrayLike) ? arrayLike : from(arrayLike); };

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"from":{"index.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                             //
// node_modules/meteor/logging/node_modules/es5-ext/array/from/index.js                                        //
//                                                                                                             //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                               //
"use strict";

module.exports = require("./is-implemented")() ? Array.from : require("./shim");

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"is-implemented.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                             //
// node_modules/meteor/logging/node_modules/es5-ext/array/from/is-implemented.js                               //
//                                                                                                             //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                               //
"use strict";

module.exports = function () {
	var from = Array.from, arr, result;
	if (typeof from !== "function") return false;
	arr = ["raz", "dwa"];
	result = from(arr);
	return Boolean(result && result !== arr && result[1] === "dwa");
};

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"shim.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                             //
// node_modules/meteor/logging/node_modules/es5-ext/array/from/shim.js                                         //
//                                                                                                             //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                               //
"use strict";

var iteratorSymbol = require("es6-symbol").iterator
  , isArguments    = require("../../function/is-arguments")
  , isFunction     = require("../../function/is-function")
  , toPosInt       = require("../../number/to-pos-integer")
  , callable       = require("../../object/valid-callable")
  , validValue     = require("../../object/valid-value")
  , isValue        = require("../../object/is-value")
  , isString       = require("../../string/is-string")
  , isArray        = Array.isArray
  , call           = Function.prototype.call
  , desc           = { configurable: true, enumerable: true, writable: true, value: null }
  , defineProperty = Object.defineProperty;

// eslint-disable-next-line complexity, max-lines-per-function
module.exports = function (arrayLike/*, mapFn, thisArg*/) {
	var mapFn = arguments[1]
	  , thisArg = arguments[2]
	  , Context
	  , i
	  , j
	  , arr
	  , length
	  , code
	  , iterator
	  , result
	  , getIterator
	  , value;

	arrayLike = Object(validValue(arrayLike));

	if (isValue(mapFn)) callable(mapFn);
	if (!this || this === Array || !isFunction(this)) {
		// Result: Plain array
		if (!mapFn) {
			if (isArguments(arrayLike)) {
				// Source: Arguments
				length = arrayLike.length;
				if (length !== 1) return Array.apply(null, arrayLike);
				arr = new Array(1);
				arr[0] = arrayLike[0];
				return arr;
			}
			if (isArray(arrayLike)) {
				// Source: Array
				arr = new Array((length = arrayLike.length));
				for (i = 0; i < length; ++i) arr[i] = arrayLike[i];
				return arr;
			}
		}
		arr = [];
	} else {
		// Result: Non plain array
		Context = this;
	}

	if (!isArray(arrayLike)) {
		if ((getIterator = arrayLike[iteratorSymbol]) !== undefined) {
			// Source: Iterator
			iterator = callable(getIterator).call(arrayLike);
			if (Context) arr = new Context();
			result = iterator.next();
			i = 0;
			while (!result.done) {
				value = mapFn ? call.call(mapFn, thisArg, result.value, i) : result.value;
				if (Context) {
					desc.value = value;
					defineProperty(arr, i, desc);
				} else {
					arr[i] = value;
				}
				result = iterator.next();
				++i;
			}
			length = i;
		} else if (isString(arrayLike)) {
			// Source: String
			length = arrayLike.length;
			if (Context) arr = new Context();
			for (i = 0, j = 0; i < length; ++i) {
				value = arrayLike[i];
				if (i + 1 < length) {
					code = value.charCodeAt(0);
					// eslint-disable-next-line max-depth
					if (code >= 0xd800 && code <= 0xdbff) value += arrayLike[++i];
				}
				value = mapFn ? call.call(mapFn, thisArg, value, j) : value;
				if (Context) {
					desc.value = value;
					defineProperty(arr, j, desc);
				} else {
					arr[j] = value;
				}
				++j;
			}
			length = j;
		}
	}
	if (length === undefined) {
		// Source: array or array-like
		length = toPosInt(arrayLike.length);
		if (Context) arr = new Context(length);
		for (i = 0; i < length; ++i) {
			value = mapFn ? call.call(mapFn, thisArg, arrayLike[i], i) : arrayLike[i];
			if (Context) {
				desc.value = value;
				defineProperty(arr, i, desc);
			} else {
				arr[i] = value;
			}
		}
	}
	if (Context) {
		desc.value = null;
		arr.length = length;
	}
	return arr;
};

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"#":{"e-index-of.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                             //
// node_modules/meteor/logging/node_modules/es5-ext/array/#/e-index-of.js                                      //
//                                                                                                             //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                               //
"use strict";

var numberIsNaN       = require("../../number/is-nan")
  , toPosInt          = require("../../number/to-pos-integer")
  , value             = require("../../object/valid-value")
  , indexOf           = Array.prototype.indexOf
  , objHasOwnProperty = Object.prototype.hasOwnProperty
  , abs               = Math.abs
  , floor             = Math.floor;

module.exports = function (searchElement/*, fromIndex*/) {
	var i, length, fromIndex, val;
	if (!numberIsNaN(searchElement)) return indexOf.apply(this, arguments);

	length = toPosInt(value(this).length);
	fromIndex = arguments[1];
	if (isNaN(fromIndex)) fromIndex = 0;
	else if (fromIndex >= 0) fromIndex = floor(fromIndex);
	else fromIndex = toPosInt(this.length) - floor(abs(fromIndex));

	for (i = fromIndex; i < length; ++i) {
		if (objHasOwnProperty.call(this, i)) {
			val = this[i];
			if (numberIsNaN(val)) return i; // Jslint: ignore
		}
	}
	return -1;
};

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"for-each-right.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                             //
// node_modules/meteor/logging/node_modules/es5-ext/array/#/for-each-right.js                                  //
//                                                                                                             //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                               //
"use strict";

var toPosInt          = require("../../number/to-pos-integer")
  , callable          = require("../../object/valid-callable")
  , value             = require("../../object/valid-value")
  , objHasOwnProperty = Object.prototype.hasOwnProperty
  , call              = Function.prototype.call;

module.exports = function (cb/*, thisArg*/) {
	var i, self, thisArg;

	self = Object(value(this));
	callable(cb);
	thisArg = arguments[1];

	for (i = toPosInt(self.length) - 1; i >= 0; --i) {
		if (objHasOwnProperty.call(self, i)) call.call(cb, thisArg, self[i], i, self);
	}
};

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"uniq.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                             //
// node_modules/meteor/logging/node_modules/es5-ext/array/#/uniq.js                                            //
//                                                                                                             //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                               //
"use strict";

var indexOf = require("./e-index-of")
  , filter  = Array.prototype.filter
  , isFirst;

isFirst = function (value, index) { return indexOf.call(this, value) === index; };

module.exports = function () { return filter.call(this, isFirst, this); };

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"clear.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                             //
// node_modules/meteor/logging/node_modules/es5-ext/array/#/clear.js                                           //
//                                                                                                             //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                               //
// Inspired by Google Closure:
// http://closure-library.googlecode.com/svn/docs/
// closure_goog_array_array.js.html#goog.array.clear

"use strict";

var value = require("../../object/valid-value");

module.exports = function () {
	value(this).length = 0;
	return this;
};

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"generate.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                             //
// node_modules/meteor/logging/node_modules/es5-ext/array/generate.js                                          //
//                                                                                                             //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                               //
"use strict";

var toPosInt = require("../number/to-pos-integer")
  , value    = require("../object/valid-value")
  , slice    = Array.prototype.slice;

module.exports = function (length/*, …fill*/) {
	var arr, currentLength;
	length = toPosInt(value(length));
	if (length === 0) return [];

	arr = arguments.length < 2 ? [undefined] : slice.call(arguments, 1, 1 + length);

	while ((currentLength = arr.length) < length) {
		arr = arr.concat(arr.slice(0, length - currentLength));
	}
	return arr;
};

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"to-short-string-representation.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                             //
// node_modules/meteor/logging/node_modules/es5-ext/to-short-string-representation.js                          //
//                                                                                                             //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                               //
"use strict";

var safeToString = require("./safe-to-string");

var reNewLine = /[\n\r\u2028\u2029]/g;

module.exports = function (value) {
	var string = safeToString(value);
	// Trim if too long
	if (string.length > 100) string = string.slice(0, 99) + "…";
	// Replace eventual new lines
	string = string.replace(reNewLine, function (char) {
		return JSON.stringify(char).slice(1, -1);
	});
	return string;
};

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"safe-to-string.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                             //
// node_modules/meteor/logging/node_modules/es5-ext/safe-to-string.js                                          //
//                                                                                                             //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                               //
"use strict";

var isCallable = require("./object/is-callable");

module.exports = function (value) {
	try {
		if (value && isCallable(value.toString)) return value.toString();
		return String(value);
	} catch (e) {
		return "<Non-coercible to string value>";
	}
};

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"iterable":{"validate-object.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                             //
// node_modules/meteor/logging/node_modules/es5-ext/iterable/validate-object.js                                //
//                                                                                                             //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                               //
"use strict";

var isObject = require("../object/is-object")
  , is       = require("./is");

module.exports = function (value) {
	if (is(value) && isObject(value)) return value;
	throw new TypeError(value + " is not an iterable or array-like object");
};

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"is.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                             //
// node_modules/meteor/logging/node_modules/es5-ext/iterable/is.js                                             //
//                                                                                                             //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                               //
"use strict";

var iteratorSymbol = require("es6-symbol").iterator
  , isValue        = require("../object/is-value")
  , isArrayLike    = require("../object/is-array-like");

module.exports = function (value) {
	if (!isValue(value)) return false;
	if (typeof value[iteratorSymbol] === "function") return true;
	return isArrayLike(value);
};

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}}},"memoizee":{"package.json":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                             //
// node_modules/meteor/logging/node_modules/memoizee/package.json                                              //
//                                                                                                             //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                               //
module.exports = {
  "name": "memoizee",
  "version": "0.4.14"
};

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"index.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                             //
// node_modules/meteor/logging/node_modules/memoizee/index.js                                                  //
//                                                                                                             //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                               //
"use strict";

var normalizeOpts = require("es5-ext/object/normalize-options")
  , resolveLength = require("./lib/resolve-length")
  , plain         = require("./plain");

module.exports = function (fn/*, options*/) {
	var options = normalizeOpts(arguments[1]), length;

	if (!options.normalizer) {
		length = options.length = resolveLength(options.length, fn.length, options.async);
		if (length !== 0) {
			if (options.primitive) {
				if (length === false) {
					options.normalizer = require("./normalizers/primitive");
				} else if (length > 1) {
					options.normalizer = require("./normalizers/get-primitive-fixed")(length);
				}
			} else if (length === false) options.normalizer = require("./normalizers/get")();
				else if (length === 1) options.normalizer = require("./normalizers/get-1")();
				else options.normalizer = require("./normalizers/get-fixed")(length);
		}
	}

	// Assure extensions
	if (options.async) require("./ext/async");
	if (options.promise) require("./ext/promise");
	if (options.dispose) require("./ext/dispose");
	if (options.maxAge) require("./ext/max-age");
	if (options.max) require("./ext/max");
	if (options.refCounter) require("./ext/ref-counter");

	return plain(fn, options);
};

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"lib":{"resolve-length.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                             //
// node_modules/meteor/logging/node_modules/memoizee/lib/resolve-length.js                                     //
//                                                                                                             //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                               //
"use strict";

var toPosInt = require("es5-ext/number/to-pos-integer");

module.exports = function (optsLength, fnLength, isAsync) {
	var length;
	if (isNaN(optsLength)) {
		length = fnLength;
		if (!(length >= 0)) return 1;
		if (isAsync && length) return length - 1;
		return length;
	}
	if (optsLength === false) return false;
	return toPosInt(optsLength);
};

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"registered-extensions.js":function module(){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                             //
// node_modules/meteor/logging/node_modules/memoizee/lib/registered-extensions.js                              //
//                                                                                                             //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                               //
"use strict";

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"configure-map.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                             //
// node_modules/meteor/logging/node_modules/memoizee/lib/configure-map.js                                      //
//                                                                                                             //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                               //
/* eslint no-eq-null: 0, eqeqeq: 0, no-unused-vars: 0 */

"use strict";

var customError      = require("es5-ext/error/custom")
  , defineLength     = require("es5-ext/function/_define-length")
  , d                = require("d")
  , ee               = require("event-emitter").methods
  , resolveResolve   = require("./resolve-resolve")
  , resolveNormalize = require("./resolve-normalize");

var apply = Function.prototype.apply
  , call = Function.prototype.call
  , create = Object.create
  , defineProperties = Object.defineProperties
  , on = ee.on
  , emit = ee.emit;

module.exports = function (original, length, options) {
	var cache = create(null)
	  , conf
	  , memLength
	  , get
	  , set
	  , del
	  , clear
	  , extDel
	  , extGet
	  , extHas
	  , normalizer
	  , getListeners
	  , setListeners
	  , deleteListeners
	  , memoized
	  , resolve;
	if (length !== false) memLength = length;
	else if (isNaN(original.length)) memLength = 1;
	else memLength = original.length;

	if (options.normalizer) {
		normalizer = resolveNormalize(options.normalizer);
		get = normalizer.get;
		set = normalizer.set;
		del = normalizer.delete;
		clear = normalizer.clear;
	}
	if (options.resolvers != null) resolve = resolveResolve(options.resolvers);

	if (get) {
		memoized = defineLength(function (arg) {
			var id, result, args = arguments;
			if (resolve) args = resolve(args);
			id = get(args);
			if (id !== null) {
				if (hasOwnProperty.call(cache, id)) {
					if (getListeners) conf.emit("get", id, args, this);
					return cache[id];
				}
			}
			if (args.length === 1) result = call.call(original, this, args[0]);
			else result = apply.call(original, this, args);
			if (id === null) {
				id = get(args);
				if (id !== null) throw customError("Circular invocation", "CIRCULAR_INVOCATION");
				id = set(args);
			} else if (hasOwnProperty.call(cache, id)) {
				throw customError("Circular invocation", "CIRCULAR_INVOCATION");
			}
			cache[id] = result;
			if (setListeners) conf.emit("set", id, null, result);
			return result;
		}, memLength);
	} else if (length === 0) {
		memoized = function () {
			var result;
			if (hasOwnProperty.call(cache, "data")) {
				if (getListeners) conf.emit("get", "data", arguments, this);
				return cache.data;
			}
			if (arguments.length) result = apply.call(original, this, arguments);
			else result = call.call(original, this);
			if (hasOwnProperty.call(cache, "data")) {
				throw customError("Circular invocation", "CIRCULAR_INVOCATION");
			}
			cache.data = result;
			if (setListeners) conf.emit("set", "data", null, result);
			return result;
		};
	} else {
		memoized = function (arg) {
			var result, args = arguments, id;
			if (resolve) args = resolve(arguments);
			id = String(args[0]);
			if (hasOwnProperty.call(cache, id)) {
				if (getListeners) conf.emit("get", id, args, this);
				return cache[id];
			}
			if (args.length === 1) result = call.call(original, this, args[0]);
			else result = apply.call(original, this, args);
			if (hasOwnProperty.call(cache, id)) {
				throw customError("Circular invocation", "CIRCULAR_INVOCATION");
			}
			cache[id] = result;
			if (setListeners) conf.emit("set", id, null, result);
			return result;
		};
	}
	conf = {
		original: original,
		memoized: memoized,
		profileName: options.profileName,
		get: function (args) {
			if (resolve) args = resolve(args);
			if (get) return get(args);
			return String(args[0]);
		},
		has: function (id) { return hasOwnProperty.call(cache, id); },
		delete: function (id) {
			var result;
			if (!hasOwnProperty.call(cache, id)) return;
			if (del) del(id);
			result = cache[id];
			delete cache[id];
			if (deleteListeners) conf.emit("delete", id, result);
		},
		clear: function () {
			var oldCache = cache;
			if (clear) clear();
			cache = create(null);
			conf.emit("clear", oldCache);
		},
		on: function (type, listener) {
			if (type === "get") getListeners = true;
			else if (type === "set") setListeners = true;
			else if (type === "delete") deleteListeners = true;
			return on.call(this, type, listener);
		},
		emit: emit,
		updateEnv: function () { original = conf.original; }
	};
	if (get) {
		extDel = defineLength(function (arg) {
			var id, args = arguments;
			if (resolve) args = resolve(args);
			id = get(args);
			if (id === null) return;
			conf.delete(id);
		}, memLength);
	} else if (length === 0) {
		extDel = function () { return conf.delete("data"); };
	} else {
		extDel = function (arg) {
			if (resolve) arg = resolve(arguments)[0];
			return conf.delete(arg);
		};
	}
	extGet = defineLength(function () {
		var id, args = arguments;
		if (length === 0) return cache.data;
		if (resolve) args = resolve(args);
		if (get) id = get(args);
		else id = String(args[0]);
		return cache[id];
	});
	extHas = defineLength(function () {
		var id, args = arguments;
		if (length === 0) return conf.has("data");
		if (resolve) args = resolve(args);
		if (get) id = get(args);
		else id = String(args[0]);
		if (id === null) return false;
		return conf.has(id);
	});
	defineProperties(memoized, {
		__memoized__: d(true),
		delete: d(extDel),
		clear: d(conf.clear),
		_get: d(extGet),
		_has: d(extHas)
	});
	return conf;
};

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"resolve-resolve.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                             //
// node_modules/meteor/logging/node_modules/memoizee/lib/resolve-resolve.js                                    //
//                                                                                                             //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                               //
"use strict";

var toArray  = require("es5-ext/array/to-array")
  , isValue  = require("es5-ext/object/is-value")
  , callable = require("es5-ext/object/valid-callable");

var slice = Array.prototype.slice, resolveArgs;

resolveArgs = function (args) {
	return this.map(function (resolve, i) {
		return resolve ? resolve(args[i]) : args[i];
	}).concat(slice.call(args, this.length));
};

module.exports = function (resolvers) {
	resolvers = toArray(resolvers);
	resolvers.forEach(function (resolve) {
		if (isValue(resolve)) callable(resolve);
	});
	return resolveArgs.bind(resolvers);
};

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"resolve-normalize.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                             //
// node_modules/meteor/logging/node_modules/memoizee/lib/resolve-normalize.js                                  //
//                                                                                                             //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                               //
"use strict";

var callable = require("es5-ext/object/valid-callable");

module.exports = function (userNormalizer) {
	var normalizer;
	if (typeof userNormalizer === "function") return { set: userNormalizer, get: userNormalizer };
	normalizer = { get: callable(userNormalizer.get) };
	if (userNormalizer.set !== undefined) {
		normalizer.set = callable(userNormalizer.set);
		if (userNormalizer.delete) normalizer.delete = callable(userNormalizer.delete);
		if (userNormalizer.clear) normalizer.clear = callable(userNormalizer.clear);
		return normalizer;
	}
	normalizer.set = normalizer.get;
	return normalizer;
};

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"methods.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                             //
// node_modules/meteor/logging/node_modules/memoizee/lib/methods.js                                            //
//                                                                                                             //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                               //
"use strict";

var forEach       = require("es5-ext/object/for-each")
  , normalizeOpts = require("es5-ext/object/normalize-options")
  , callable      = require("es5-ext/object/valid-callable")
  , lazy          = require("d/lazy")
  , resolveLength = require("./resolve-length")
  , extensions    = require("./registered-extensions");

module.exports = function (memoize) {
	return function (props) {
		forEach(props, function (desc) {
			var fn = callable(desc.value), length;
			desc.value = function (options) {
				if (options.getNormalizer) {
					options = normalizeOpts(options);
					if (length === undefined) {
						length = resolveLength(
							options.length,
							fn.length,
							options.async && extensions.async
						);
					}
					options.normalizer = options.getNormalizer(length);
					delete options.getNormalizer;
				}
				return memoize(fn.bind(this), options);
			};
		});
		return lazy(props);
	};
};

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"plain.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                             //
// node_modules/meteor/logging/node_modules/memoizee/plain.js                                                  //
//                                                                                                             //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                               //
"use strict";

var callable      = require("es5-ext/object/valid-callable")
  , forEach       = require("es5-ext/object/for-each")
  , extensions    = require("./lib/registered-extensions")
  , configure     = require("./lib/configure-map")
  , resolveLength = require("./lib/resolve-length");

module.exports = function self(fn /*, options */) {
	var options, length, conf;

	callable(fn);
	options = Object(arguments[1]);

	if (options.async && options.promise) {
		throw new Error("Options 'async' and 'promise' cannot be used together");
	}

	// Do not memoize already memoized function
	if (hasOwnProperty.call(fn, "__memoized__") && !options.force) return fn;

	// Resolve length;
	length = resolveLength(options.length, fn.length, options.async && extensions.async);

	// Configure cache map
	conf = configure(fn, length, options);

	// Bind eventual extensions
	forEach(extensions, function (extFn, name) {
		if (options[name]) extFn(options[name], conf, options);
	});

	if (self.__profiler__) self.__profiler__(conf);

	conf.updateEnv();
	return conf.memoized;
};

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"normalizers":{"primitive.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                             //
// node_modules/meteor/logging/node_modules/memoizee/normalizers/primitive.js                                  //
//                                                                                                             //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                               //
"use strict";

module.exports = function (args) {
	var id, i, length = args.length;
	if (!length) return "\u0002";
	id = String(args[i = 0]);
	while (--length) id += "\u0001" + args[++i];
	return id;
};

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"get-primitive-fixed.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                             //
// node_modules/meteor/logging/node_modules/memoizee/normalizers/get-primitive-fixed.js                        //
//                                                                                                             //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                               //
"use strict";

module.exports = function (length) {
	if (!length) {
		return function () {
			return "";
		};
	}
	return function (args) {
		var id = String(args[0]), i = 0, currentLength = length;
		while (--currentLength) {
			id += "\u0001" + args[++i];
		}
		return id;
	};
};

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"get.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                             //
// node_modules/meteor/logging/node_modules/memoizee/normalizers/get.js                                        //
//                                                                                                             //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                               //
/* eslint max-statements: 0 */

"use strict";

var indexOf = require("es5-ext/array/#/e-index-of");

var create = Object.create;

module.exports = function () {
	var lastId = 0, map = [], cache = create(null);
	return {
		get: function (args) {
			var index = 0, set = map, i, length = args.length;
			if (length === 0) return set[length] || null;
			if ((set = set[length])) {
				while (index < length - 1) {
					i = indexOf.call(set[0], args[index]);
					if (i === -1) return null;
					set = set[1][i];
					++index;
				}
				i = indexOf.call(set[0], args[index]);
				if (i === -1) return null;
				return set[1][i] || null;
			}
			return null;
		},
		set: function (args) {
			var index = 0, set = map, i, length = args.length;
			if (length === 0) {
				set[length] = ++lastId;
			} else {
				if (!set[length]) {
					set[length] = [[], []];
				}
				set = set[length];
				while (index < length - 1) {
					i = indexOf.call(set[0], args[index]);
					if (i === -1) {
						i = set[0].push(args[index]) - 1;
						set[1].push([[], []]);
					}
					set = set[1][i];
					++index;
				}
				i = indexOf.call(set[0], args[index]);
				if (i === -1) {
					i = set[0].push(args[index]) - 1;
				}
				set[1][i] = ++lastId;
			}
			cache[lastId] = args;
			return lastId;
		},
		delete: function (id) {
			var index = 0, set = map, i, args = cache[id], length = args.length, path = [];
			if (length === 0) {
				delete set[length];
			} else if ((set = set[length])) {
				while (index < length - 1) {
					i = indexOf.call(set[0], args[index]);
					if (i === -1) {
						return;
					}
					path.push(set, i);
					set = set[1][i];
					++index;
				}
				i = indexOf.call(set[0], args[index]);
				if (i === -1) {
					return;
				}
				id = set[1][i];
				set[0].splice(i, 1);
				set[1].splice(i, 1);
				while (!set[0].length && path.length) {
					i = path.pop();
					set = path.pop();
					set[0].splice(i, 1);
					set[1].splice(i, 1);
				}
			}
			delete cache[id];
		},
		clear: function () {
			map = [];
			cache = create(null);
		}
	};
};

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"get-1.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                             //
// node_modules/meteor/logging/node_modules/memoizee/normalizers/get-1.js                                      //
//                                                                                                             //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                               //
"use strict";

var indexOf = require("es5-ext/array/#/e-index-of");

module.exports = function () {
	var lastId = 0, argsMap = [], cache = [];
	return {
		get: function (args) {
			var index = indexOf.call(argsMap, args[0]);
			return index === -1 ? null : cache[index];
		},
		set: function (args) {
			argsMap.push(args[0]);
			cache.push(++lastId);
			return lastId;
		},
		delete: function (id) {
			var index = indexOf.call(cache, id);
			if (index !== -1) {
				argsMap.splice(index, 1);
				cache.splice(index, 1);
			}
		},
		clear: function () {
			argsMap = [];
			cache = [];
		}
	};
};

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"get-fixed.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                             //
// node_modules/meteor/logging/node_modules/memoizee/normalizers/get-fixed.js                                  //
//                                                                                                             //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                               //
"use strict";

var indexOf = require("es5-ext/array/#/e-index-of")
  , create  = Object.create;

module.exports = function (length) {
	var lastId = 0, map = [[], []], cache = create(null);
	return {
		get: function (args) {
			var index = 0, set = map, i;
			while (index < length - 1) {
				i = indexOf.call(set[0], args[index]);
				if (i === -1) return null;
				set = set[1][i];
				++index;
			}
			i = indexOf.call(set[0], args[index]);
			if (i === -1) return null;
			return set[1][i] || null;
		},
		set: function (args) {
			var index = 0, set = map, i;
			while (index < length - 1) {
				i = indexOf.call(set[0], args[index]);
				if (i === -1) {
					i = set[0].push(args[index]) - 1;
					set[1].push([[], []]);
				}
				set = set[1][i];
				++index;
			}
			i = indexOf.call(set[0], args[index]);
			if (i === -1) {
				i = set[0].push(args[index]) - 1;
			}
			set[1][i] = ++lastId;
			cache[lastId] = args;
			return lastId;
		},
		delete: function (id) {
			var index = 0, set = map, i, path = [], args = cache[id];
			while (index < length - 1) {
				i = indexOf.call(set[0], args[index]);
				if (i === -1) {
					return;
				}
				path.push(set, i);
				set = set[1][i];
				++index;
			}
			i = indexOf.call(set[0], args[index]);
			if (i === -1) {
				return;
			}
			id = set[1][i];
			set[0].splice(i, 1);
			set[1].splice(i, 1);
			while (!set[0].length && path.length) {
				i = path.pop();
				set = path.pop();
				set[0].splice(i, 1);
				set[1].splice(i, 1);
			}
			delete cache[id];
		},
		clear: function () {
			map = [[], []];
			cache = create(null);
		}
	};
};

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"ext":{"async.js":function module(require){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                             //
// node_modules/meteor/logging/node_modules/memoizee/ext/async.js                                              //
//                                                                                                             //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                               //
/* eslint consistent-this: 0, no-shadow:0, no-eq-null: 0, eqeqeq: 0, no-unused-vars: 0 */

// Support for asynchronous functions

"use strict";

var aFrom        = require("es5-ext/array/from")
  , objectMap    = require("es5-ext/object/map")
  , mixin        = require("es5-ext/object/mixin")
  , defineLength = require("es5-ext/function/_define-length")
  , nextTick     = require("next-tick");

var slice = Array.prototype.slice, apply = Function.prototype.apply, create = Object.create;

require("../lib/registered-extensions").async = function (tbi, conf) {
	var waiting = create(null)
	  , cache = create(null)
	  , base = conf.memoized
	  , original = conf.original
	  , currentCallback
	  , currentContext
	  , currentArgs;

	// Initial
	conf.memoized = defineLength(function (arg) {
		var args = arguments, last = args[args.length - 1];
		if (typeof last === "function") {
			currentCallback = last;
			args = slice.call(args, 0, -1);
		}
		return base.apply(currentContext = this, currentArgs = args);
	}, base);
	try { mixin(conf.memoized, base); }
	catch (ignore) {}

	// From cache (sync)
	conf.on("get", function (id) {
		var cb, context, args;
		if (!currentCallback) return;

		// Unresolved
		if (waiting[id]) {
			if (typeof waiting[id] === "function") waiting[id] = [waiting[id], currentCallback];
			else waiting[id].push(currentCallback);
			currentCallback = null;
			return;
		}

		// Resolved, assure next tick invocation
		cb = currentCallback;
		context = currentContext;
		args = currentArgs;
		currentCallback = currentContext = currentArgs = null;
		nextTick(function () {
			var data;
			if (hasOwnProperty.call(cache, id)) {
				data = cache[id];
				conf.emit("getasync", id, args, context);
				apply.call(cb, data.context, data.args);
			} else {
				// Purged in a meantime, we shouldn't rely on cached value, recall
				currentCallback = cb;
				currentContext = context;
				currentArgs = args;
				base.apply(context, args);
			}
		});
	});

	// Not from cache
	conf.original = function () {
		var args, cb, origCb, result;
		if (!currentCallback) return apply.call(original, this, arguments);
		args = aFrom(arguments);
		cb = function self(err) {
			var cb, args, id = self.id;
			if (id == null) {
				// Shouldn't happen, means async callback was called sync way
				nextTick(apply.bind(self, this, arguments));
				return undefined;
			}
			delete self.id;
			cb = waiting[id];
			delete waiting[id];
			if (!cb) {
				// Already processed,
				// outcome of race condition: asyncFn(1, cb), asyncFn.clear(), asyncFn(1, cb)
				return undefined;
			}
			args = aFrom(arguments);
			if (conf.has(id)) {
				if (err) {
					conf.delete(id);
				} else {
					cache[id] = { context: this, args: args };
					conf.emit("setasync", id, typeof cb === "function" ? 1 : cb.length);
				}
			}
			if (typeof cb === "function") {
				result = apply.call(cb, this, args);
			} else {
				cb.forEach(function (cb) { result = apply.call(cb, this, args); }, this);
			}
			return result;
		};
		origCb = currentCallback;
		currentCallback = currentContext = currentArgs = null;
		args.push(cb);
		result = apply.call(original, this, args);
		cb.cb = origCb;
		currentCallback = cb;
		return result;
	};

	// After not from cache call
	conf.on("set", function (id) {
		if (!currentCallback) {
			conf.delete(id);
			return;
		}
		if (waiting[id]) {
			// Race condition: asyncFn(1, cb), asyncFn.clear(), asyncFn(1, cb)
			if (typeof waiting[id] === "function") waiting[id] = [waiting[id], currentCallback.cb];
			else waiting[id].push(currentCallback.cb);
		} else {
			waiting[id] = currentCallback.cb;
		}
		delete currentCallback.cb;
		currentCallback.id = id;
		currentCallback = null;
	});

	// On delete
	conf.on("delete", function (id) {
		var result;
		// If false, we don't have value yet, so we assume that intention is not
		// to memoize this call. After value is obtained we don't cache it but
		// gracefully pass to callback
		if (hasOwnProperty.call(waiting, id)) return;
		if (!cache[id]) return;
		result = cache[id];
		delete cache[id];
		conf.emit("deleteasync", id, slice.call(result.args, 1));
	});

	// On clear
	conf.on("clear", function () {
		var oldCache = cache;
		cache = create(null);
		conf.emit(
			"clearasync", objectMap(oldCache, function (data) { return slice.call(data.args, 1); })
		);
	});
};

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"promise.js":function module(require){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                             //
// node_modules/meteor/logging/node_modules/memoizee/ext/promise.js                                            //
//                                                                                                             //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                               //
/* eslint max-statements: 0 */

// Support for functions returning promise

"use strict";

var objectMap     = require("es5-ext/object/map")
  , primitiveSet  = require("es5-ext/object/primitive-set")
  , ensureString  = require("es5-ext/object/validate-stringifiable-value")
  , toShortString = require("es5-ext/to-short-string-representation")
  , isPromise     = require("is-promise")
  , nextTick      = require("next-tick");

var create = Object.create
  , supportedModes = primitiveSet("then", "then:finally", "done", "done:finally");

require("../lib/registered-extensions").promise = function (mode, conf) {
	var waiting = create(null), cache = create(null), promises = create(null);

	if (mode === true) {
		mode = null;
	} else {
		mode = ensureString(mode);
		if (!supportedModes[mode]) {
			throw new TypeError("'" + toShortString(mode) + "' is not valid promise mode");
		}
	}

	// After not from cache call
	conf.on("set", function (id, ignore, promise) {
		var isFailed = false;

		if (!isPromise(promise)) {
			// Non promise result
			cache[id] = promise;
			conf.emit("setasync", id, 1);
			return;
		}
		waiting[id] = 1;
		promises[id] = promise;
		var onSuccess = function (result) {
			var count = waiting[id];
			if (isFailed) {
				throw new Error(
					"Memoizee error: Detected unordered then|done & finally resolution, which " +
						"in turn makes proper detection of success/failure impossible (when in " +
						"'done:finally' mode)\n" +
						"Consider to rely on 'then' or 'done' mode instead."
				);
			}
			if (!count) return; // Deleted from cache before resolved
			delete waiting[id];
			cache[id] = result;
			conf.emit("setasync", id, count);
		};
		var onFailure = function () {
			isFailed = true;
			if (!waiting[id]) return; // Deleted from cache (or succeed in case of finally)
			delete waiting[id];
			delete promises[id];
			conf.delete(id);
		};

		var resolvedMode = mode;
		if (!resolvedMode) resolvedMode = "then";

		if (resolvedMode === "then") {
			var nextTickFailure = function () { nextTick(onFailure); };
			// Eventual finally needs to be attached to non rejected promise
			// (so we not force propagation of unhandled rejection)
			promise = promise.then(function (result) {
				nextTick(onSuccess.bind(this, result));
			}, nextTickFailure);
			// If `finally` is a function we attach to it to remove cancelled promises.
			if (typeof promise.finally === "function") {
				promise.finally(nextTickFailure);
			}
		} else if (resolvedMode === "done") {
			// Not recommended, as it may mute any eventual "Unhandled error" events
			if (typeof promise.done !== "function") {
				throw new Error(
					"Memoizee error: Retrieved promise does not implement 'done' " +
						"in 'done' mode"
				);
			}
			promise.done(onSuccess, onFailure);
		} else if (resolvedMode === "done:finally") {
			// The only mode with no side effects assuming library does not throw unconditionally
			// for rejected promises.
			if (typeof promise.done !== "function") {
				throw new Error(
					"Memoizee error: Retrieved promise does not implement 'done' " +
						"in 'done:finally' mode"
				);
			}
			if (typeof promise.finally !== "function") {
				throw new Error(
					"Memoizee error: Retrieved promise does not implement 'finally' " +
						"in 'done:finally' mode"
				);
			}
			promise.done(onSuccess);
			promise.finally(onFailure);
		}
	});

	// From cache (sync)
	conf.on("get", function (id, args, context) {
		var promise;
		if (waiting[id]) {
			++waiting[id]; // Still waiting
			return;
		}
		promise = promises[id];
		var emit = function () { conf.emit("getasync", id, args, context); };
		if (isPromise(promise)) {
			if (typeof promise.done === "function") promise.done(emit);
			else {
				promise.then(function () { nextTick(emit); });
			}
		} else {
			emit();
		}
	});

	// On delete
	conf.on("delete", function (id) {
		delete promises[id];
		if (waiting[id]) {
			delete waiting[id];
			return; // Not yet resolved
		}
		if (!hasOwnProperty.call(cache, id)) return;
		var result = cache[id];
		delete cache[id];
		conf.emit("deleteasync", id, [result]);
	});

	// On clear
	conf.on("clear", function () {
		var oldCache = cache;
		cache = create(null);
		waiting = create(null);
		promises = create(null);
		conf.emit("clearasync", objectMap(oldCache, function (data) { return [data]; }));
	});
};

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"dispose.js":function module(require){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                             //
// node_modules/meteor/logging/node_modules/memoizee/ext/dispose.js                                            //
//                                                                                                             //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                               //
// Call dispose callback on each cache purge

"use strict";

var callable   = require("es5-ext/object/valid-callable")
  , forEach    = require("es5-ext/object/for-each")
  , extensions = require("../lib/registered-extensions")

  , apply = Function.prototype.apply;

extensions.dispose = function (dispose, conf, options) {
	var del;
	callable(dispose);
	if ((options.async && extensions.async) || (options.promise && extensions.promise)) {
		conf.on("deleteasync", del = function (id, resultArray) {
			apply.call(dispose, null, resultArray);
		});
		conf.on("clearasync", function (cache) {
			forEach(cache, function (result, id) {
 del(id, result);
});
		});
		return;
	}
	conf.on("delete", del = function (id, result) {
 dispose(result);
});
	conf.on("clear", function (cache) {
		forEach(cache, function (result, id) {
 del(id, result);
});
	});
};

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"max-age.js":function module(require){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                             //
// node_modules/meteor/logging/node_modules/memoizee/ext/max-age.js                                            //
//                                                                                                             //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                               //
/* eslint consistent-this: 0 */

// Timeout cached values

"use strict";

var aFrom      = require("es5-ext/array/from")
  , forEach    = require("es5-ext/object/for-each")
  , nextTick   = require("next-tick")
  , isPromise  = require("is-promise")
  , timeout    = require("timers-ext/valid-timeout")
  , extensions = require("../lib/registered-extensions");

var noop = Function.prototype, max = Math.max, min = Math.min, create = Object.create;

extensions.maxAge = function (maxAge, conf, options) {
	var timeouts, postfix, preFetchAge, preFetchTimeouts;

	maxAge = timeout(maxAge);
	if (!maxAge) return;

	timeouts = create(null);
	postfix =
		(options.async && extensions.async) || (options.promise && extensions.promise)
			? "async"
			: "";
	conf.on("set" + postfix, function (id) {
		timeouts[id] = setTimeout(function () { conf.delete(id); }, maxAge);
		if (typeof timeouts[id].unref === "function") timeouts[id].unref();
		if (!preFetchTimeouts) return;
		if (preFetchTimeouts[id]) {
			if (preFetchTimeouts[id] !== "nextTick") clearTimeout(preFetchTimeouts[id]);
		}
		preFetchTimeouts[id] = setTimeout(function () {
			delete preFetchTimeouts[id];
		}, preFetchAge);
		if (typeof preFetchTimeouts[id].unref === "function") preFetchTimeouts[id].unref();
	});
	conf.on("delete" + postfix, function (id) {
		clearTimeout(timeouts[id]);
		delete timeouts[id];
		if (!preFetchTimeouts) return;
		if (preFetchTimeouts[id] !== "nextTick") clearTimeout(preFetchTimeouts[id]);
		delete preFetchTimeouts[id];
	});

	if (options.preFetch) {
		if (options.preFetch === true || isNaN(options.preFetch)) {
			preFetchAge = 0.333;
		} else {
			preFetchAge = max(min(Number(options.preFetch), 1), 0);
		}
		if (preFetchAge) {
			preFetchTimeouts = {};
			preFetchAge = (1 - preFetchAge) * maxAge;
			conf.on("get" + postfix, function (id, args, context) {
				if (!preFetchTimeouts[id]) {
					preFetchTimeouts[id] = "nextTick";
					nextTick(function () {
						var result;
						if (preFetchTimeouts[id] !== "nextTick") return;
						delete preFetchTimeouts[id];
						conf.delete(id);
						if (options.async) {
							args = aFrom(args);
							args.push(noop);
						}
						result = conf.memoized.apply(context, args);
						if (options.promise) {
							// Supress eventual error warnings
							if (isPromise(result)) {
								if (typeof result.done === "function") result.done(noop, noop);
								else result.then(noop, noop);
							}
						}
					});
				}
			});
		}
	}

	conf.on("clear" + postfix, function () {
		forEach(timeouts, function (id) { clearTimeout(id); });
		timeouts = {};
		if (preFetchTimeouts) {
			forEach(preFetchTimeouts, function (id) { if (id !== "nextTick") clearTimeout(id); });
			preFetchTimeouts = {};
		}
	});
};

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"max.js":function module(require){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                             //
// node_modules/meteor/logging/node_modules/memoizee/ext/max.js                                                //
//                                                                                                             //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                               //
// Limit cache size, LRU (least recently used) algorithm.

"use strict";

var toPosInteger = require("es5-ext/number/to-pos-integer")
  , lruQueue     = require("lru-queue")
  , extensions   = require("../lib/registered-extensions");

extensions.max = function (max, conf, options) {
	var postfix, queue, hit;

	max = toPosInteger(max);
	if (!max) return;

	queue = lruQueue(max);
	postfix = (options.async && extensions.async) || (options.promise && extensions.promise)
		? "async" : "";

	conf.on("set" + postfix, hit = function (id) {
		id = queue.hit(id);
		if (id === undefined) return;
		conf.delete(id);
	});
	conf.on("get" + postfix, hit);
	conf.on("delete" + postfix, queue.delete);
	conf.on("clear" + postfix, queue.clear);
};

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"ref-counter.js":function module(require){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                             //
// node_modules/meteor/logging/node_modules/memoizee/ext/ref-counter.js                                        //
//                                                                                                             //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                               //
// Reference counter, useful for garbage collector like functionality

"use strict";

var d          = require("d")
  , extensions = require("../lib/registered-extensions")

  , create = Object.create, defineProperties = Object.defineProperties;

extensions.refCounter = function (ignore, conf, options) {
	var cache, postfix;

	cache = create(null);
	postfix = (options.async && extensions.async) || (options.promise && extensions.promise)
		? "async" : "";

	conf.on("set" + postfix, function (id, length) {
 cache[id] = length || 1;
});
	conf.on("get" + postfix, function (id) {
 ++cache[id];
});
	conf.on("delete" + postfix, function (id) {
 delete cache[id];
});
	conf.on("clear" + postfix, function () {
 cache = {};
});

	defineProperties(conf.memoized, {
		deleteRef: d(function () {
			var id = conf.get(arguments);
			if (id === null) return null;
			if (!cache[id]) return null;
			if (!--cache[id]) {
				conf.delete(id);
				return true;
			}
			return false;
		}),
		getRefCount: d(function () {
			var id = conf.get(arguments);
			if (id === null) return 0;
			if (!cache[id]) return 0;
			return cache[id];
		})
	});
};

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"methods.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                             //
// node_modules/meteor/logging/node_modules/memoizee/methods.js                                                //
//                                                                                                             //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                               //
"use strict";

module.exports = require("./lib/methods")(require("./"));

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"event-emitter":{"package.json":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                             //
// node_modules/meteor/logging/node_modules/event-emitter/package.json                                         //
//                                                                                                             //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                               //
module.exports = {
  "name": "event-emitter",
  "version": "0.3.5"
};

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"index.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                             //
// node_modules/meteor/logging/node_modules/event-emitter/index.js                                             //
//                                                                                                             //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                               //
'use strict';

var d        = require('d')
  , callable = require('es5-ext/object/valid-callable')

  , apply = Function.prototype.apply, call = Function.prototype.call
  , create = Object.create, defineProperty = Object.defineProperty
  , defineProperties = Object.defineProperties
  , hasOwnProperty = Object.prototype.hasOwnProperty
  , descriptor = { configurable: true, enumerable: false, writable: true }

  , on, once, off, emit, methods, descriptors, base;

on = function (type, listener) {
	var data;

	callable(listener);

	if (!hasOwnProperty.call(this, '__ee__')) {
		data = descriptor.value = create(null);
		defineProperty(this, '__ee__', descriptor);
		descriptor.value = null;
	} else {
		data = this.__ee__;
	}
	if (!data[type]) data[type] = listener;
	else if (typeof data[type] === 'object') data[type].push(listener);
	else data[type] = [data[type], listener];

	return this;
};

once = function (type, listener) {
	var once, self;

	callable(listener);
	self = this;
	on.call(this, type, once = function () {
		off.call(self, type, once);
		apply.call(listener, this, arguments);
	});

	once.__eeOnceListener__ = listener;
	return this;
};

off = function (type, listener) {
	var data, listeners, candidate, i;

	callable(listener);

	if (!hasOwnProperty.call(this, '__ee__')) return this;
	data = this.__ee__;
	if (!data[type]) return this;
	listeners = data[type];

	if (typeof listeners === 'object') {
		for (i = 0; (candidate = listeners[i]); ++i) {
			if ((candidate === listener) ||
					(candidate.__eeOnceListener__ === listener)) {
				if (listeners.length === 2) data[type] = listeners[i ? 0 : 1];
				else listeners.splice(i, 1);
			}
		}
	} else {
		if ((listeners === listener) ||
				(listeners.__eeOnceListener__ === listener)) {
			delete data[type];
		}
	}

	return this;
};

emit = function (type) {
	var i, l, listener, listeners, args;

	if (!hasOwnProperty.call(this, '__ee__')) return;
	listeners = this.__ee__[type];
	if (!listeners) return;

	if (typeof listeners === 'object') {
		l = arguments.length;
		args = new Array(l - 1);
		for (i = 1; i < l; ++i) args[i - 1] = arguments[i];

		listeners = listeners.slice();
		for (i = 0; (listener = listeners[i]); ++i) {
			apply.call(listener, this, args);
		}
	} else {
		switch (arguments.length) {
		case 1:
			call.call(listeners, this);
			break;
		case 2:
			call.call(listeners, this, arguments[1]);
			break;
		case 3:
			call.call(listeners, this, arguments[1], arguments[2]);
			break;
		default:
			l = arguments.length;
			args = new Array(l - 1);
			for (i = 1; i < l; ++i) {
				args[i - 1] = arguments[i];
			}
			apply.call(listeners, this, args);
		}
	}
};

methods = {
	on: on,
	once: once,
	off: off,
	emit: emit
};

descriptors = {
	on: d(on),
	once: d(once),
	off: d(off),
	emit: d(emit)
};

base = defineProperties({}, descriptors);

module.exports = exports = function (o) {
	return (o == null) ? create(base) : defineProperties(Object(o), descriptors);
};
exports.methods = methods;

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"es6-symbol":{"package.json":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                             //
// node_modules/meteor/logging/node_modules/es6-symbol/package.json                                            //
//                                                                                                             //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                               //
module.exports = {
  "name": "es6-symbol",
  "version": "3.1.3"
};

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"index.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                             //
// node_modules/meteor/logging/node_modules/es6-symbol/index.js                                                //
//                                                                                                             //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                               //
"use strict";

module.exports = require("./is-implemented")()
	? require("ext/global-this").Symbol
	: require("./polyfill");

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"is-implemented.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                             //
// node_modules/meteor/logging/node_modules/es6-symbol/is-implemented.js                                       //
//                                                                                                             //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                               //
"use strict";

var global     = require("ext/global-this")
  , validTypes = { object: true, symbol: true };

module.exports = function () {
	var Symbol = global.Symbol;
	var symbol;
	if (typeof Symbol !== "function") return false;
	symbol = Symbol("test symbol");
	try { String(symbol); }
	catch (e) { return false; }

	// Return 'true' also for polyfills
	if (!validTypes[typeof Symbol.iterator]) return false;
	if (!validTypes[typeof Symbol.toPrimitive]) return false;
	if (!validTypes[typeof Symbol.toStringTag]) return false;

	return true;
};

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"polyfill.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                             //
// node_modules/meteor/logging/node_modules/es6-symbol/polyfill.js                                             //
//                                                                                                             //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                               //
// ES2015 Symbol polyfill for environments that do not (or partially) support it

"use strict";

var d                    = require("d")
  , validateSymbol       = require("./validate-symbol")
  , NativeSymbol         = require("ext/global-this").Symbol
  , generateName         = require("./lib/private/generate-name")
  , setupStandardSymbols = require("./lib/private/setup/standard-symbols")
  , setupSymbolRegistry  = require("./lib/private/setup/symbol-registry");

var create = Object.create
  , defineProperties = Object.defineProperties
  , defineProperty = Object.defineProperty;

var SymbolPolyfill, HiddenSymbol, isNativeSafe;

if (typeof NativeSymbol === "function") {
	try {
		String(NativeSymbol());
		isNativeSafe = true;
	} catch (ignore) {}
} else {
	NativeSymbol = null;
}

// Internal constructor (not one exposed) for creating Symbol instances.
// This one is used to ensure that `someSymbol instanceof Symbol` always return false
HiddenSymbol = function Symbol(description) {
	if (this instanceof HiddenSymbol) throw new TypeError("Symbol is not a constructor");
	return SymbolPolyfill(description);
};

// Exposed `Symbol` constructor
// (returns instances of HiddenSymbol)
module.exports = SymbolPolyfill = function Symbol(description) {
	var symbol;
	if (this instanceof Symbol) throw new TypeError("Symbol is not a constructor");
	if (isNativeSafe) return NativeSymbol(description);
	symbol = create(HiddenSymbol.prototype);
	description = description === undefined ? "" : String(description);
	return defineProperties(symbol, {
		__description__: d("", description),
		__name__: d("", generateName(description))
	});
};

setupStandardSymbols(SymbolPolyfill);
setupSymbolRegistry(SymbolPolyfill);

// Internal tweaks for real symbol producer
defineProperties(HiddenSymbol.prototype, {
	constructor: d(SymbolPolyfill),
	toString: d("", function () { return this.__name__; })
});

// Proper implementation of methods exposed on Symbol.prototype
// They won't be accessible on produced symbol instances as they derive from HiddenSymbol.prototype
defineProperties(SymbolPolyfill.prototype, {
	toString: d(function () { return "Symbol (" + validateSymbol(this).__description__ + ")"; }),
	valueOf: d(function () { return validateSymbol(this); })
});
defineProperty(
	SymbolPolyfill.prototype,
	SymbolPolyfill.toPrimitive,
	d("", function () {
		var symbol = validateSymbol(this);
		if (typeof symbol === "symbol") return symbol;
		return symbol.toString();
	})
);
defineProperty(SymbolPolyfill.prototype, SymbolPolyfill.toStringTag, d("c", "Symbol"));

// Proper implementaton of toPrimitive and toStringTag for returned symbol instances
defineProperty(
	HiddenSymbol.prototype, SymbolPolyfill.toStringTag,
	d("c", SymbolPolyfill.prototype[SymbolPolyfill.toStringTag])
);

// Note: It's important to define `toPrimitive` as last one, as some implementations
// implement `toPrimitive` natively without implementing `toStringTag` (or other specified symbols)
// And that may invoke error in definition flow:
// See: https://github.com/medikoo/es6-symbol/issues/13#issuecomment-164146149
defineProperty(
	HiddenSymbol.prototype, SymbolPolyfill.toPrimitive,
	d("c", SymbolPolyfill.prototype[SymbolPolyfill.toPrimitive])
);

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"validate-symbol.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                             //
// node_modules/meteor/logging/node_modules/es6-symbol/validate-symbol.js                                      //
//                                                                                                             //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                               //
"use strict";

var isSymbol = require("./is-symbol");

module.exports = function (value) {
	if (!isSymbol(value)) throw new TypeError(value + " is not a symbol");
	return value;
};

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"is-symbol.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                             //
// node_modules/meteor/logging/node_modules/es6-symbol/is-symbol.js                                            //
//                                                                                                             //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                               //
"use strict";

module.exports = function (value) {
	if (!value) return false;
	if (typeof value === "symbol") return true;
	if (!value.constructor) return false;
	if (value.constructor.name !== "Symbol") return false;
	return value[value.constructor.toStringTag] === "Symbol";
};

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"lib":{"private":{"generate-name.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                             //
// node_modules/meteor/logging/node_modules/es6-symbol/lib/private/generate-name.js                            //
//                                                                                                             //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                               //
"use strict";

var d = require("d");

var create = Object.create, defineProperty = Object.defineProperty, objPrototype = Object.prototype;

var created = create(null);
module.exports = function (desc) {
	var postfix = 0, name, ie11BugWorkaround;
	while (created[desc + (postfix || "")]) ++postfix;
	desc += postfix || "";
	created[desc] = true;
	name = "@@" + desc;
	defineProperty(
		objPrototype,
		name,
		d.gs(null, function (value) {
			// For IE11 issue see:
			// https://connect.microsoft.com/IE/feedbackdetail/view/1928508/
			//    ie11-broken-getters-on-dom-objects
			// https://github.com/medikoo/es6-symbol/issues/12
			if (ie11BugWorkaround) return;
			ie11BugWorkaround = true;
			defineProperty(this, name, d(value));
			ie11BugWorkaround = false;
		})
	);
	return name;
};

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"setup":{"standard-symbols.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                             //
// node_modules/meteor/logging/node_modules/es6-symbol/lib/private/setup/standard-symbols.js                   //
//                                                                                                             //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                               //
"use strict";

var d            = require("d")
  , NativeSymbol = require("ext/global-this").Symbol;

module.exports = function (SymbolPolyfill) {
	return Object.defineProperties(SymbolPolyfill, {
		// To ensure proper interoperability with other native functions (e.g. Array.from)
		// fallback to eventual native implementation of given symbol
		hasInstance: d(
			"", (NativeSymbol && NativeSymbol.hasInstance) || SymbolPolyfill("hasInstance")
		),
		isConcatSpreadable: d(
			"",
			(NativeSymbol && NativeSymbol.isConcatSpreadable) ||
				SymbolPolyfill("isConcatSpreadable")
		),
		iterator: d("", (NativeSymbol && NativeSymbol.iterator) || SymbolPolyfill("iterator")),
		match: d("", (NativeSymbol && NativeSymbol.match) || SymbolPolyfill("match")),
		replace: d("", (NativeSymbol && NativeSymbol.replace) || SymbolPolyfill("replace")),
		search: d("", (NativeSymbol && NativeSymbol.search) || SymbolPolyfill("search")),
		species: d("", (NativeSymbol && NativeSymbol.species) || SymbolPolyfill("species")),
		split: d("", (NativeSymbol && NativeSymbol.split) || SymbolPolyfill("split")),
		toPrimitive: d(
			"", (NativeSymbol && NativeSymbol.toPrimitive) || SymbolPolyfill("toPrimitive")
		),
		toStringTag: d(
			"", (NativeSymbol && NativeSymbol.toStringTag) || SymbolPolyfill("toStringTag")
		),
		unscopables: d(
			"", (NativeSymbol && NativeSymbol.unscopables) || SymbolPolyfill("unscopables")
		)
	});
};

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"symbol-registry.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                             //
// node_modules/meteor/logging/node_modules/es6-symbol/lib/private/setup/symbol-registry.js                    //
//                                                                                                             //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                               //
"use strict";

var d              = require("d")
  , validateSymbol = require("../../../validate-symbol");

var registry = Object.create(null);

module.exports = function (SymbolPolyfill) {
	return Object.defineProperties(SymbolPolyfill, {
		for: d(function (key) {
			if (registry[key]) return registry[key];
			return (registry[key] = SymbolPolyfill(String(key)));
		}),
		keyFor: d(function (symbol) {
			var key;
			validateSymbol(symbol);
			for (key in registry) {
				if (registry[key] === symbol) return key;
			}
			return undefined;
		})
	});
};

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}}}}},"ext":{"global-this":{"index.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                             //
// node_modules/meteor/logging/node_modules/ext/global-this/index.js                                           //
//                                                                                                             //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                               //
"use strict";

module.exports = require("./is-implemented")() ? globalThis : require("./implementation");

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"is-implemented.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                             //
// node_modules/meteor/logging/node_modules/ext/global-this/is-implemented.js                                  //
//                                                                                                             //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                               //
"use strict";

module.exports = function () {
	if (typeof globalThis !== "object") return false;
	if (!globalThis) return false;
	return globalThis.Array === Array;
};

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"implementation.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                             //
// node_modules/meteor/logging/node_modules/ext/global-this/implementation.js                                  //
//                                                                                                             //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                               //
var naiveFallback = function () {
	if (typeof self === "object" && self) return self;
	if (typeof window === "object" && window) return window;
	throw new Error("Unable to resolve global `this`");
};

module.exports = (function () {
	if (this) return this;

	// Unexpected strict mode (may happen if e.g. bundled into ESM module)

	// Thanks @mathiasbynens -> https://mathiasbynens.be/notes/globalthis
	// In all ES5+ engines global object inherits from Object.prototype
	// (if you approached one that doesn't please report)
	try {
		Object.defineProperty(Object.prototype, "__global__", {
			get: function () { return this; },
			configurable: true
		});
	} catch (error) {
		// Unfortunate case of Object.prototype being sealed (via preventExtensions, seal or freeze)
		return naiveFallback();
	}
	try {
		// Safari case (window.__global__ is resolved with global context, but __global__ does not)
		if (!__global__) return naiveFallback();
		return __global__;
	} finally {
		delete Object.prototype.__global__;
	}
})();

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}}},"next-tick":{"package.json":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                             //
// node_modules/meteor/logging/node_modules/next-tick/package.json                                             //
//                                                                                                             //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                               //
module.exports = {
  "name": "next-tick",
  "version": "1.0.0"
};

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"index.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                             //
// node_modules/meteor/logging/node_modules/next-tick/index.js                                                 //
//                                                                                                             //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                               //
'use strict';

var callable, byObserver;

callable = function (fn) {
	if (typeof fn !== 'function') throw new TypeError(fn + " is not a function");
	return fn;
};

byObserver = function (Observer) {
	var node = document.createTextNode(''), queue, currentQueue, i = 0;
	new Observer(function () {
		var callback;
		if (!queue) {
			if (!currentQueue) return;
			queue = currentQueue;
		} else if (currentQueue) {
			queue = currentQueue.concat(queue);
		}
		currentQueue = queue;
		queue = null;
		if (typeof currentQueue === 'function') {
			callback = currentQueue;
			currentQueue = null;
			callback();
			return;
		}
		node.data = (i = ++i % 2); // Invoke other batch, to handle leftover callbacks in case of crash
		while (currentQueue) {
			callback = currentQueue.shift();
			if (!currentQueue.length) currentQueue = null;
			callback();
		}
	}).observe(node, { characterData: true });
	return function (fn) {
		callable(fn);
		if (queue) {
			if (typeof queue === 'function') queue = [queue, fn];
			else queue.push(fn);
			return;
		}
		queue = fn;
		node.data = (i = ++i % 2);
	};
};

module.exports = (function () {
	// Node.js
	if ((typeof process === 'object') && process && (typeof process.nextTick === 'function')) {
		return process.nextTick;
	}

	// MutationObserver
	if ((typeof document === 'object') && document) {
		if (typeof MutationObserver === 'function') return byObserver(MutationObserver);
		if (typeof WebKitMutationObserver === 'function') return byObserver(WebKitMutationObserver);
	}

	// W3C Draft
	// http://dvcs.w3.org/hg/webperf/raw-file/tip/specs/setImmediate/Overview.html
	if (typeof setImmediate === 'function') {
		return function (cb) { setImmediate(callable(cb)); };
	}

	// Wide available standard
	if ((typeof setTimeout === 'function') || (typeof setTimeout === 'object')) {
		return function (cb) { setTimeout(callable(cb), 0); };
	}

	return null;
}());

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"is-promise":{"package.json":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                             //
// node_modules/meteor/logging/node_modules/is-promise/package.json                                            //
//                                                                                                             //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                               //
module.exports = {
  "name": "is-promise",
  "version": "2.2.2",
  "main": "./index.js"
};

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"index.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                             //
// node_modules/meteor/logging/node_modules/is-promise/index.js                                                //
//                                                                                                             //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                               //
module.exports = isPromise;
module.exports.default = isPromise;

function isPromise(obj) {
  return !!obj && (typeof obj === 'object' || typeof obj === 'function') && typeof obj.then === 'function';
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"timers-ext":{"valid-timeout.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                             //
// node_modules/meteor/logging/node_modules/timers-ext/valid-timeout.js                                        //
//                                                                                                             //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                               //
"use strict";

var toPosInt   = require("es5-ext/number/to-pos-integer")
  , maxTimeout = require("./max-timeout");

module.exports = function (value) {
	value = toPosInt(value);
	if (value > maxTimeout) throw new TypeError(value + " exceeds maximum possible timeout");
	return value;
};

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"max-timeout.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                             //
// node_modules/meteor/logging/node_modules/timers-ext/max-timeout.js                                          //
//                                                                                                             //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                               //
"use strict";

module.exports = 2147483647;

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"lru-queue":{"package.json":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                             //
// node_modules/meteor/logging/node_modules/lru-queue/package.json                                             //
//                                                                                                             //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                               //
module.exports = {
  "name": "lru-queue",
  "version": "0.1.0"
};

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"index.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                             //
// node_modules/meteor/logging/node_modules/lru-queue/index.js                                                 //
//                                                                                                             //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                               //
'use strict';

var toPosInt = require('es5-ext/number/to-pos-integer')

  , create = Object.create, hasOwnProperty = Object.prototype.hasOwnProperty;

module.exports = function (limit) {
	var size = 0, base = 1, queue = create(null), map = create(null), index = 0, del;
	limit = toPosInt(limit);
	return {
		hit: function (id) {
			var oldIndex = map[id], nuIndex = ++index;
			queue[nuIndex] = id;
			map[id] = nuIndex;
			if (!oldIndex) {
				++size;
				if (size <= limit) return;
				id = queue[base];
				del(id);
				return id;
			}
			delete queue[oldIndex];
			if (base !== oldIndex) return;
			while (!hasOwnProperty.call(queue, ++base)) continue; //jslint: skip
		},
		delete: del = function (id) {
			var oldIndex = map[id];
			if (!oldIndex) return;
			delete queue[oldIndex];
			delete map[id];
			--size;
			if (base !== oldIndex) return;
			if (!size) {
				index = 0;
				base = 1;
				return;
			}
			while (!hasOwnProperty.call(queue, ++base)) continue; //jslint: skip
		},
		clear: function () {
			size = 0;
			base = 1;
			queue = create(null);
			map = create(null);
			index = 0;
		}
	};
};

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"ansi-regex":{"package.json":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                             //
// node_modules/meteor/logging/node_modules/ansi-regex/package.json                                            //
//                                                                                                             //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                               //
module.exports = {
  "name": "ansi-regex",
  "version": "2.1.1"
};

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"index.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                             //
// node_modules/meteor/logging/node_modules/ansi-regex/index.js                                                //
//                                                                                                             //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                               //
'use strict';
module.exports = function () {
	return /[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-PRZcf-nqry=><]/g;
};

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"es6-iterator":{"for-of.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                             //
// node_modules/meteor/logging/node_modules/es6-iterator/for-of.js                                             //
//                                                                                                             //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                               //
"use strict";

var isArguments = require("es5-ext/function/is-arguments")
  , callable    = require("es5-ext/object/valid-callable")
  , isString    = require("es5-ext/string/is-string")
  , get         = require("./get");

var isArray = Array.isArray, call = Function.prototype.call, some = Array.prototype.some;

module.exports = function (iterable, cb /*, thisArg*/) {
	var mode, thisArg = arguments[2], result, doBreak, broken, i, length, char, code;
	if (isArray(iterable) || isArguments(iterable)) mode = "array";
	else if (isString(iterable)) mode = "string";
	else iterable = get(iterable);

	callable(cb);
	doBreak = function () {
		broken = true;
	};
	if (mode === "array") {
		some.call(iterable, function (value) {
			call.call(cb, thisArg, value, doBreak);
			return broken;
		});
		return;
	}
	if (mode === "string") {
		length = iterable.length;
		for (i = 0; i < length; ++i) {
			char = iterable[i];
			if (i + 1 < length) {
				code = char.charCodeAt(0);
				if (code >= 0xd800 && code <= 0xdbff) char += iterable[++i];
			}
			call.call(cb, thisArg, char, doBreak);
			if (broken) break;
		}
		return;
	}
	result = iterable.next();

	while (!result.done) {
		call.call(cb, thisArg, result.value, doBreak);
		if (broken) return;
		result = iterable.next();
	}
};

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"get.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                             //
// node_modules/meteor/logging/node_modules/es6-iterator/get.js                                                //
//                                                                                                             //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                               //
"use strict";

var isArguments    = require("es5-ext/function/is-arguments")
  , isString       = require("es5-ext/string/is-string")
  , ArrayIterator  = require("./array")
  , StringIterator = require("./string")
  , iterable       = require("./valid-iterable")
  , iteratorSymbol = require("es6-symbol").iterator;

module.exports = function (obj) {
	if (typeof iterable(obj)[iteratorSymbol] === "function") return obj[iteratorSymbol]();
	if (isArguments(obj)) return new ArrayIterator(obj);
	if (isString(obj)) return new StringIterator(obj);
	return new ArrayIterator(obj);
};

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"array.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                             //
// node_modules/meteor/logging/node_modules/es6-iterator/array.js                                              //
//                                                                                                             //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                               //
"use strict";

var setPrototypeOf = require("es5-ext/object/set-prototype-of")
  , contains       = require("es5-ext/string/#/contains")
  , d              = require("d")
  , Symbol         = require("es6-symbol")
  , Iterator       = require("./");

var defineProperty = Object.defineProperty, ArrayIterator;

ArrayIterator = module.exports = function (arr, kind) {
	if (!(this instanceof ArrayIterator)) throw new TypeError("Constructor requires 'new'");
	Iterator.call(this, arr);
	if (!kind) kind = "value";
	else if (contains.call(kind, "key+value")) kind = "key+value";
	else if (contains.call(kind, "key")) kind = "key";
	else kind = "value";
	defineProperty(this, "__kind__", d("", kind));
};
if (setPrototypeOf) setPrototypeOf(ArrayIterator, Iterator);

// Internal %ArrayIteratorPrototype% doesn't expose its constructor
delete ArrayIterator.prototype.constructor;

ArrayIterator.prototype = Object.create(Iterator.prototype, {
	_resolve: d(function (i) {
		if (this.__kind__ === "value") return this.__list__[i];
		if (this.__kind__ === "key+value") return [i, this.__list__[i]];
		return i;
	})
});
defineProperty(ArrayIterator.prototype, Symbol.toStringTag, d("c", "Array Iterator"));

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"package.json":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                             //
// node_modules/meteor/logging/node_modules/es6-iterator/package.json                                          //
//                                                                                                             //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                               //
module.exports = {
  "name": "es6-iterator",
  "version": "2.0.3"
};

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"index.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                             //
// node_modules/meteor/logging/node_modules/es6-iterator/index.js                                              //
//                                                                                                             //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                               //
"use strict";

var clear    = require("es5-ext/array/#/clear")
  , assign   = require("es5-ext/object/assign")
  , callable = require("es5-ext/object/valid-callable")
  , value    = require("es5-ext/object/valid-value")
  , d        = require("d")
  , autoBind = require("d/auto-bind")
  , Symbol   = require("es6-symbol");

var defineProperty = Object.defineProperty, defineProperties = Object.defineProperties, Iterator;

module.exports = Iterator = function (list, context) {
	if (!(this instanceof Iterator)) throw new TypeError("Constructor requires 'new'");
	defineProperties(this, {
		__list__: d("w", value(list)),
		__context__: d("w", context),
		__nextIndex__: d("w", 0)
	});
	if (!context) return;
	callable(context.on);
	context.on("_add", this._onAdd);
	context.on("_delete", this._onDelete);
	context.on("_clear", this._onClear);
};

// Internal %IteratorPrototype% doesn't expose its constructor
delete Iterator.prototype.constructor;

defineProperties(
	Iterator.prototype,
	assign(
		{
			_next: d(function () {
				var i;
				if (!this.__list__) return undefined;
				if (this.__redo__) {
					i = this.__redo__.shift();
					if (i !== undefined) return i;
				}
				if (this.__nextIndex__ < this.__list__.length) return this.__nextIndex__++;
				this._unBind();
				return undefined;
			}),
			next: d(function () {
				return this._createResult(this._next());
			}),
			_createResult: d(function (i) {
				if (i === undefined) return { done: true, value: undefined };
				return { done: false, value: this._resolve(i) };
			}),
			_resolve: d(function (i) {
				return this.__list__[i];
			}),
			_unBind: d(function () {
				this.__list__ = null;
				delete this.__redo__;
				if (!this.__context__) return;
				this.__context__.off("_add", this._onAdd);
				this.__context__.off("_delete", this._onDelete);
				this.__context__.off("_clear", this._onClear);
				this.__context__ = null;
			}),
			toString: d(function () {
				return "[object " + (this[Symbol.toStringTag] || "Object") + "]";
			})
		},
		autoBind({
			_onAdd: d(function (index) {
				if (index >= this.__nextIndex__) return;
				++this.__nextIndex__;
				if (!this.__redo__) {
					defineProperty(this, "__redo__", d("c", [index]));
					return;
				}
				this.__redo__.forEach(function (redo, i) {
					if (redo >= index) this.__redo__[i] = ++redo;
				}, this);
				this.__redo__.push(index);
			}),
			_onDelete: d(function (index) {
				var i;
				if (index >= this.__nextIndex__) return;
				--this.__nextIndex__;
				if (!this.__redo__) return;
				i = this.__redo__.indexOf(index);
				if (i !== -1) this.__redo__.splice(i, 1);
				this.__redo__.forEach(function (redo, j) {
					if (redo > index) this.__redo__[j] = --redo;
				}, this);
			}),
			_onClear: d(function () {
				if (this.__redo__) clear.call(this.__redo__);
				this.__nextIndex__ = 0;
			})
		})
	)
);

defineProperty(
	Iterator.prototype,
	Symbol.iterator,
	d(function () {
		return this;
	})
);

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"string.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                             //
// node_modules/meteor/logging/node_modules/es6-iterator/string.js                                             //
//                                                                                                             //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                               //
// Thanks @mathiasbynens
// http://mathiasbynens.be/notes/javascript-unicode#iterating-over-symbols

"use strict";

var setPrototypeOf = require("es5-ext/object/set-prototype-of")
  , d              = require("d")
  , Symbol         = require("es6-symbol")
  , Iterator       = require("./");

var defineProperty = Object.defineProperty, StringIterator;

StringIterator = module.exports = function (str) {
	if (!(this instanceof StringIterator)) throw new TypeError("Constructor requires 'new'");
	str = String(str);
	Iterator.call(this, str);
	defineProperty(this, "__length__", d("", str.length));
};
if (setPrototypeOf) setPrototypeOf(StringIterator, Iterator);

// Internal %ArrayIteratorPrototype% doesn't expose its constructor
delete StringIterator.prototype.constructor;

StringIterator.prototype = Object.create(Iterator.prototype, {
	_next: d(function () {
		if (!this.__list__) return undefined;
		if (this.__nextIndex__ < this.__length__) return this.__nextIndex__++;
		this._unBind();
		return undefined;
	}),
	_resolve: d(function (i) {
		var char = this.__list__[i], code;
		if (this.__nextIndex__ === this.__length__) return char;
		code = char.charCodeAt(0);
		if (code >= 0xd800 && code <= 0xdbff) return char + this.__list__[this.__nextIndex__++];
		return char;
	})
});
defineProperty(StringIterator.prototype, Symbol.toStringTag, d("c", "String Iterator"));

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"valid-iterable.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                             //
// node_modules/meteor/logging/node_modules/es6-iterator/valid-iterable.js                                     //
//                                                                                                             //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                               //
"use strict";

var isIterable = require("./is-iterable");

module.exports = function (value) {
	if (!isIterable(value)) throw new TypeError(value + " is not iterable");
	return value;
};

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"is-iterable.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                             //
// node_modules/meteor/logging/node_modules/es6-iterator/is-iterable.js                                        //
//                                                                                                             //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                               //
"use strict";

var isArguments = require("es5-ext/function/is-arguments")
  , isValue     = require("es5-ext/object/is-value")
  , isString    = require("es5-ext/string/is-string");

var iteratorSymbol = require("es6-symbol").iterator
  , isArray        = Array.isArray;

module.exports = function (value) {
	if (!isValue(value)) return false;
	if (isArray(value)) return true;
	if (isString(value)) return true;
	if (isArguments(value)) return true;
	return typeof value[iteratorSymbol] === "function";
};

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}}}}}}},{
  "extensions": [
    ".js",
    ".json"
  ]
});

var exports = require("/node_modules/meteor/logging/logging.js");

/* Exports */
Package._define("logging", exports, {
  Log: Log
});

})();
