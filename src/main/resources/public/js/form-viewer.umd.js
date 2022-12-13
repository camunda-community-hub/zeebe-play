(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.FormViewer = {}));
}(this, (function (exports) { 'use strict';

  function createCommonjsModule(fn, module) {
  	return module = { exports: {} }, fn(module, module.exports), module.exports;
  }

  var hat_1 = createCommonjsModule(function (module) {
  var hat = module.exports = function (bits, base) {
      if (!base) base = 16;
      if (bits === undefined) bits = 128;
      if (bits <= 0) return '0';
      
      var digits = Math.log(Math.pow(2, bits)) / Math.log(base);
      for (var i = 2; digits === Infinity; i *= 2) {
          digits = Math.log(Math.pow(2, bits / i)) / Math.log(base) * i;
      }
      
      var rem = digits - Math.floor(digits);
      
      var res = '';
      
      for (var i = 0; i < Math.floor(digits); i++) {
          var x = Math.floor(Math.random() * base).toString(base);
          res = x + res;
      }
      
      if (rem) {
          var b = Math.pow(base, rem);
          var x = Math.floor(Math.random() * b).toString(base);
          res = x + res;
      }
      
      var parsed = parseInt(res, base);
      if (parsed !== Infinity && parsed >= Math.pow(2, bits)) {
          return hat(bits, base)
      }
      else return res;
  };

  hat.rack = function (bits, base, expandBy) {
      var fn = function (data) {
          var iters = 0;
          do {
              if (iters ++ > 10) {
                  if (expandBy) bits += expandBy;
                  else throw new Error('too many ID collisions, use more bits')
              }
              
              var id = hat(bits, base);
          } while (Object.hasOwnProperty.call(hats, id));
          
          hats[id] = data;
          return id;
      };
      var hats = fn.hats = {};
      
      fn.get = function (id) {
          return fn.hats[id];
      };
      
      fn.set = function (id, value) {
          fn.hats[id] = value;
          return fn;
      };
      
      fn.bits = bits || 128;
      fn.base = base || 16;
      return fn;
  };
  });

  /**
   * Create a new id generator / cache instance.
   *
   * You may optionally provide a seed that is used internally.
   *
   * @param {Seed} seed
   */

  function Ids(seed) {
    if (!(this instanceof Ids)) {
      return new Ids(seed);
    }

    seed = seed || [128, 36, 1];
    this._seed = seed.length ? hat_1.rack(seed[0], seed[1], seed[2]) : seed;
  }
  /**
   * Generate a next id.
   *
   * @param {Object} [element] element to bind the id to
   *
   * @return {String} id
   */

  Ids.prototype.next = function (element) {
    return this._seed(element || true);
  };
  /**
   * Generate a next id with a given prefix.
   *
   * @param {Object} [element] element to bind the id to
   *
   * @return {String} id
   */


  Ids.prototype.nextPrefixed = function (prefix, element) {
    var id;

    do {
      id = prefix + this.next(true);
    } while (this.assigned(id)); // claim {prefix}{random}


    this.claim(id, element); // return

    return id;
  };
  /**
   * Manually claim an existing id.
   *
   * @param {String} id
   * @param {String} [element] element the id is claimed by
   */


  Ids.prototype.claim = function (id, element) {
    this._seed.set(id, element || true);
  };
  /**
   * Returns true if the given id has already been assigned.
   *
   * @param  {String} id
   * @return {Boolean}
   */


  Ids.prototype.assigned = function (id) {
    return this._seed.get(id) || false;
  };
  /**
   * Unclaim an id.
   *
   * @param  {String} id the id to unclaim
   */


  Ids.prototype.unclaim = function (id) {
    delete this._seed.hats[id];
  };
  /**
   * Clear all claimed ids.
   */


  Ids.prototype.clear = function () {
    var hats = this._seed.hats,
        id;

    for (id in hats) {
      this.unclaim(id);
    }
  };

  /**
   * Flatten array, one level deep.
   *
   * @param {Array<?>} arr
   *
   * @return {Array<?>}
   */

  const nativeToString = Object.prototype.toString;
  const nativeHasOwnProperty = Object.prototype.hasOwnProperty;

  function isUndefined$1(obj) {
    return obj === undefined;
  }

  function isDefined(obj) {
    return obj !== undefined;
  }

  function isNil(obj) {
    return obj == null;
  }

  function isArray$2(obj) {
    return nativeToString.call(obj) === '[object Array]';
  }

  function isObject(obj) {
    return nativeToString.call(obj) === '[object Object]';
  }

  function isNumber$2(obj) {
    return nativeToString.call(obj) === '[object Number]';
  }

  function isFunction(obj) {
    const tag = nativeToString.call(obj);

    return (
      tag === '[object Function]' ||
      tag === '[object AsyncFunction]' ||
      tag === '[object GeneratorFunction]' ||
      tag === '[object AsyncGeneratorFunction]' ||
      tag === '[object Proxy]'
    );
  }

  function isString$2(obj) {
    return nativeToString.call(obj) === '[object String]';
  }

  /**
   * Return true, if target owns a property with the given key.
   *
   * @param {Object} target
   * @param {String} key
   *
   * @return {Boolean}
   */
  function has(target, key) {
    return nativeHasOwnProperty.call(target, key);
  }


  /**
   * Iterate over collection; returning something
   * (non-undefined) will stop iteration.
   *
   * @param  {Array|Object} collection
   * @param  {Function} iterator
   *
   * @return {Object} return result that stopped the iteration
   */
  function forEach(collection, iterator) {

    let val,
        result;

    if (isUndefined$1(collection)) {
      return;
    }

    const convertKey = isArray$2(collection) ? toNum : identity;

    for (let key in collection) {

      if (has(collection, key)) {
        val = collection[key];

        result = iterator(val, convertKey(key));

        if (result === false) {
          return val;
        }
      }
    }
  }


  function identity(arg) {
    return arg;
  }

  function toNum(arg) {
    return Number(arg);
  }

  /**
   * Bind function against target <this>.
   *
   * @param  {Function} fn
   * @param  {Object}   target
   *
   * @return {Function} bound function
   */
  function bind(fn, target) {
    return fn.bind(target);
  }

  /**
   * Convenience wrapper for `Object.assign`.
   *
   * @param {Object} target
   * @param {...Object} others
   *
   * @return {Object} the target
   */
  function assign(target, ...others) {
    return Object.assign(target, ...others);
  }

  /**
   * Sets a nested property of a given object to the specified value.
   *
   * This mutates the object and returns it.
   *
   * @param {Object} target The target of the set operation.
   * @param {(string|number)[]} path The path to the nested value.
   * @param {any} value The value to set.
   */
  function set(target, path, value) {

    let currentTarget = target;

    forEach(path, function(key, idx) {

      if (typeof key !== 'number' && typeof key !== 'string') {
        throw new Error('illegal key type: ' + typeof key + '. Key should be of type number or string.');
      }

      if (key === 'constructor') {
        throw new Error('illegal key: constructor');
      }

      if (key === '__proto__') {
        throw new Error('illegal key: __proto__');
      }

      let nextKey = path[idx + 1];
      let nextTarget = currentTarget[key];

      if (isDefined(nextKey) && isNil(nextTarget)) {
        nextTarget = currentTarget[key] = isNaN(+nextKey) ? {} : [];
      }

      if (isUndefined$1(nextKey)) {
        if (isUndefined$1(value)) {
          delete currentTarget[key];
        } else {
          currentTarget[key] = value;
        }
      } else {
        currentTarget = nextTarget;
      }
    });

    return target;
  }


  /**
   * Gets a nested property of a given object.
   *
   * @param {Object} target The target of the get operation.
   * @param {(string|number)[]} path The path to the nested value.
   * @param {any} [defaultValue] The value to return if no value exists.
   */
  function get(target, path, defaultValue) {

    let currentTarget = target;

    forEach(path, function(key) {

      // accessing nil property yields <undefined>
      if (isNil(currentTarget)) {
        currentTarget = undefined;

        return false;
      }

      currentTarget = currentTarget[key];
    });

    return isUndefined$1(currentTarget) ? defaultValue : currentTarget;
  }

  // these aren't really private, but nor are they really useful to document

  /**
   * @private
   */
  class LuxonError extends Error {}

  /**
   * @private
   */
  class InvalidDateTimeError extends LuxonError {
    constructor(reason) {
      super(`Invalid DateTime: ${reason.toMessage()}`);
    }
  }

  /**
   * @private
   */
  class InvalidIntervalError extends LuxonError {
    constructor(reason) {
      super(`Invalid Interval: ${reason.toMessage()}`);
    }
  }

  /**
   * @private
   */
  class InvalidDurationError extends LuxonError {
    constructor(reason) {
      super(`Invalid Duration: ${reason.toMessage()}`);
    }
  }

  /**
   * @private
   */
  class ConflictingSpecificationError extends LuxonError {}

  /**
   * @private
   */
  class InvalidUnitError extends LuxonError {
    constructor(unit) {
      super(`Invalid unit ${unit}`);
    }
  }

  /**
   * @private
   */
  class InvalidArgumentError extends LuxonError {}

  /**
   * @private
   */
  class ZoneIsAbstractError extends LuxonError {
    constructor() {
      super("Zone is an abstract class");
    }
  }

  /**
   * @private
   */

  const n$3 = "numeric",
    s$2 = "short",
    l$3 = "long";

  const DATE_SHORT = {
    year: n$3,
    month: n$3,
    day: n$3,
  };

  const DATE_MED = {
    year: n$3,
    month: s$2,
    day: n$3,
  };

  const DATE_MED_WITH_WEEKDAY = {
    year: n$3,
    month: s$2,
    day: n$3,
    weekday: s$2,
  };

  const DATE_FULL = {
    year: n$3,
    month: l$3,
    day: n$3,
  };

  const DATE_HUGE = {
    year: n$3,
    month: l$3,
    day: n$3,
    weekday: l$3,
  };

  const TIME_SIMPLE = {
    hour: n$3,
    minute: n$3,
  };

  const TIME_WITH_SECONDS = {
    hour: n$3,
    minute: n$3,
    second: n$3,
  };

  const TIME_WITH_SHORT_OFFSET = {
    hour: n$3,
    minute: n$3,
    second: n$3,
    timeZoneName: s$2,
  };

  const TIME_WITH_LONG_OFFSET = {
    hour: n$3,
    minute: n$3,
    second: n$3,
    timeZoneName: l$3,
  };

  const TIME_24_SIMPLE = {
    hour: n$3,
    minute: n$3,
    hourCycle: "h23",
  };

  const TIME_24_WITH_SECONDS = {
    hour: n$3,
    minute: n$3,
    second: n$3,
    hourCycle: "h23",
  };

  const TIME_24_WITH_SHORT_OFFSET = {
    hour: n$3,
    minute: n$3,
    second: n$3,
    hourCycle: "h23",
    timeZoneName: s$2,
  };

  const TIME_24_WITH_LONG_OFFSET = {
    hour: n$3,
    minute: n$3,
    second: n$3,
    hourCycle: "h23",
    timeZoneName: l$3,
  };

  const DATETIME_SHORT = {
    year: n$3,
    month: n$3,
    day: n$3,
    hour: n$3,
    minute: n$3,
  };

  const DATETIME_SHORT_WITH_SECONDS = {
    year: n$3,
    month: n$3,
    day: n$3,
    hour: n$3,
    minute: n$3,
    second: n$3,
  };

  const DATETIME_MED = {
    year: n$3,
    month: s$2,
    day: n$3,
    hour: n$3,
    minute: n$3,
  };

  const DATETIME_MED_WITH_SECONDS = {
    year: n$3,
    month: s$2,
    day: n$3,
    hour: n$3,
    minute: n$3,
    second: n$3,
  };

  const DATETIME_MED_WITH_WEEKDAY = {
    year: n$3,
    month: s$2,
    day: n$3,
    weekday: s$2,
    hour: n$3,
    minute: n$3,
  };

  const DATETIME_FULL = {
    year: n$3,
    month: l$3,
    day: n$3,
    hour: n$3,
    minute: n$3,
    timeZoneName: s$2,
  };

  const DATETIME_FULL_WITH_SECONDS = {
    year: n$3,
    month: l$3,
    day: n$3,
    hour: n$3,
    minute: n$3,
    second: n$3,
    timeZoneName: s$2,
  };

  const DATETIME_HUGE = {
    year: n$3,
    month: l$3,
    day: n$3,
    weekday: l$3,
    hour: n$3,
    minute: n$3,
    timeZoneName: l$3,
  };

  const DATETIME_HUGE_WITH_SECONDS = {
    year: n$3,
    month: l$3,
    day: n$3,
    weekday: l$3,
    hour: n$3,
    minute: n$3,
    second: n$3,
    timeZoneName: l$3,
  };

  /*
    This is just a junk drawer, containing anything used across multiple classes.
    Because Luxon is small(ish), this should stay small and we won't worry about splitting
    it up into, say, parsingUtil.js and basicUtil.js and so on. But they are divided up by feature area.
  */

  /**
   * @private
   */

  // TYPES

  function isUndefined(o) {
    return typeof o === "undefined";
  }

  function isNumber$1(o) {
    return typeof o === "number";
  }

  function isInteger(o) {
    return typeof o === "number" && o % 1 === 0;
  }

  function isString$1(o) {
    return typeof o === "string";
  }

  function isDate(o) {
    return Object.prototype.toString.call(o) === "[object Date]";
  }

  // CAPABILITIES

  function hasRelative() {
    try {
      return typeof Intl !== "undefined" && !!Intl.RelativeTimeFormat;
    } catch (e) {
      return false;
    }
  }

  // OBJECTS AND ARRAYS

  function maybeArray(thing) {
    return Array.isArray(thing) ? thing : [thing];
  }

  function bestBy(arr, by, compare) {
    if (arr.length === 0) {
      return undefined;
    }
    return arr.reduce((best, next) => {
      const pair = [by(next), next];
      if (!best) {
        return pair;
      } else if (compare(best[0], pair[0]) === best[0]) {
        return best;
      } else {
        return pair;
      }
    }, null)[1];
  }

  function pick(obj, keys) {
    return keys.reduce((a, k) => {
      a[k] = obj[k];
      return a;
    }, {});
  }

  function hasOwnProperty(obj, prop) {
    return Object.prototype.hasOwnProperty.call(obj, prop);
  }

  // NUMBERS AND STRINGS

  function integerBetween(thing, bottom, top) {
    return isInteger(thing) && thing >= bottom && thing <= top;
  }

  // x % n but takes the sign of n instead of x
  function floorMod(x, n) {
    return x - n * Math.floor(x / n);
  }

  function padStart(input, n = 2) {
    const isNeg = input < 0;
    let padded;
    if (isNeg) {
      padded = "-" + ("" + -input).padStart(n, "0");
    } else {
      padded = ("" + input).padStart(n, "0");
    }
    return padded;
  }

  function parseInteger(string) {
    if (isUndefined(string) || string === null || string === "") {
      return undefined;
    } else {
      return parseInt(string, 10);
    }
  }

  function parseFloating(string) {
    if (isUndefined(string) || string === null || string === "") {
      return undefined;
    } else {
      return parseFloat(string);
    }
  }

  function parseMillis(fraction) {
    // Return undefined (instead of 0) in these cases, where fraction is not set
    if (isUndefined(fraction) || fraction === null || fraction === "") {
      return undefined;
    } else {
      const f = parseFloat("0." + fraction) * 1000;
      return Math.floor(f);
    }
  }

  function roundTo(number, digits, towardZero = false) {
    const factor = 10 ** digits,
      rounder = towardZero ? Math.trunc : Math.round;
    return rounder(number * factor) / factor;
  }

  // DATE BASICS

  function isLeapYear(year) {
    return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
  }

  function daysInYear(year) {
    return isLeapYear(year) ? 366 : 365;
  }

  function daysInMonth(year, month) {
    const modMonth = floorMod(month - 1, 12) + 1,
      modYear = year + (month - modMonth) / 12;

    if (modMonth === 2) {
      return isLeapYear(modYear) ? 29 : 28;
    } else {
      return [31, null, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][modMonth - 1];
    }
  }

  // covert a calendar object to a local timestamp (epoch, but with the offset baked in)
  function objToLocalTS(obj) {
    let d = Date.UTC(
      obj.year,
      obj.month - 1,
      obj.day,
      obj.hour,
      obj.minute,
      obj.second,
      obj.millisecond
    );

    // for legacy reasons, years between 0 and 99 are interpreted as 19XX; revert that
    if (obj.year < 100 && obj.year >= 0) {
      d = new Date(d);
      d.setUTCFullYear(d.getUTCFullYear() - 1900);
    }
    return +d;
  }

  function weeksInWeekYear(weekYear) {
    const p1 =
        (weekYear +
          Math.floor(weekYear / 4) -
          Math.floor(weekYear / 100) +
          Math.floor(weekYear / 400)) %
        7,
      last = weekYear - 1,
      p2 = (last + Math.floor(last / 4) - Math.floor(last / 100) + Math.floor(last / 400)) % 7;
    return p1 === 4 || p2 === 3 ? 53 : 52;
  }

  function untruncateYear(year) {
    if (year > 99) {
      return year;
    } else return year > 60 ? 1900 + year : 2000 + year;
  }

  // PARSING

  function parseZoneInfo(ts, offsetFormat, locale, timeZone = null) {
    const date = new Date(ts),
      intlOpts = {
        hourCycle: "h23",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      };

    if (timeZone) {
      intlOpts.timeZone = timeZone;
    }

    const modified = { timeZoneName: offsetFormat, ...intlOpts };

    const parsed = new Intl.DateTimeFormat(locale, modified)
      .formatToParts(date)
      .find((m) => m.type.toLowerCase() === "timezonename");
    return parsed ? parsed.value : null;
  }

  // signedOffset('-5', '30') -> -330
  function signedOffset(offHourStr, offMinuteStr) {
    let offHour = parseInt(offHourStr, 10);

    // don't || this because we want to preserve -0
    if (Number.isNaN(offHour)) {
      offHour = 0;
    }

    const offMin = parseInt(offMinuteStr, 10) || 0,
      offMinSigned = offHour < 0 || Object.is(offHour, -0) ? -offMin : offMin;
    return offHour * 60 + offMinSigned;
  }

  // COERCION

  function asNumber(value) {
    const numericValue = Number(value);
    if (typeof value === "boolean" || value === "" || Number.isNaN(numericValue))
      throw new InvalidArgumentError(`Invalid unit value ${value}`);
    return numericValue;
  }

  function normalizeObject(obj, normalizer) {
    const normalized = {};
    for (const u in obj) {
      if (hasOwnProperty(obj, u)) {
        const v = obj[u];
        if (v === undefined || v === null) continue;
        normalized[normalizer(u)] = asNumber(v);
      }
    }
    return normalized;
  }

  function formatOffset(offset, format) {
    const hours = Math.trunc(Math.abs(offset / 60)),
      minutes = Math.trunc(Math.abs(offset % 60)),
      sign = offset >= 0 ? "+" : "-";

    switch (format) {
      case "short":
        return `${sign}${padStart(hours, 2)}:${padStart(minutes, 2)}`;
      case "narrow":
        return `${sign}${hours}${minutes > 0 ? `:${minutes}` : ""}`;
      case "techie":
        return `${sign}${padStart(hours, 2)}${padStart(minutes, 2)}`;
      default:
        throw new RangeError(`Value format ${format} is out of range for property format`);
    }
  }

  function timeObject(obj) {
    return pick(obj, ["hour", "minute", "second", "millisecond"]);
  }

  const ianaRegex =
    /[A-Za-z_+-]{1,256}(?::?\/[A-Za-z0-9_+-]{1,256}(?:\/[A-Za-z0-9_+-]{1,256})?)?/;

  /**
   * @private
   */

  const monthsLong = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const monthsShort = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  const monthsNarrow = ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"];

  function months(length) {
    switch (length) {
      case "narrow":
        return [...monthsNarrow];
      case "short":
        return [...monthsShort];
      case "long":
        return [...monthsLong];
      case "numeric":
        return ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"];
      case "2-digit":
        return ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"];
      default:
        return null;
    }
  }

  const weekdaysLong = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  const weekdaysShort = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  const weekdaysNarrow = ["M", "T", "W", "T", "F", "S", "S"];

  function weekdays(length) {
    switch (length) {
      case "narrow":
        return [...weekdaysNarrow];
      case "short":
        return [...weekdaysShort];
      case "long":
        return [...weekdaysLong];
      case "numeric":
        return ["1", "2", "3", "4", "5", "6", "7"];
      default:
        return null;
    }
  }

  const meridiems = ["AM", "PM"];

  const erasLong = ["Before Christ", "Anno Domini"];

  const erasShort = ["BC", "AD"];

  const erasNarrow = ["B", "A"];

  function eras(length) {
    switch (length) {
      case "narrow":
        return [...erasNarrow];
      case "short":
        return [...erasShort];
      case "long":
        return [...erasLong];
      default:
        return null;
    }
  }

  function meridiemForDateTime(dt) {
    return meridiems[dt.hour < 12 ? 0 : 1];
  }

  function weekdayForDateTime(dt, length) {
    return weekdays(length)[dt.weekday - 1];
  }

  function monthForDateTime(dt, length) {
    return months(length)[dt.month - 1];
  }

  function eraForDateTime(dt, length) {
    return eras(length)[dt.year < 0 ? 0 : 1];
  }

  function formatRelativeTime(unit, count, numeric = "always", narrow = false) {
    const units = {
      years: ["year", "yr."],
      quarters: ["quarter", "qtr."],
      months: ["month", "mo."],
      weeks: ["week", "wk."],
      days: ["day", "day", "days"],
      hours: ["hour", "hr."],
      minutes: ["minute", "min."],
      seconds: ["second", "sec."],
    };

    const lastable = ["hours", "minutes", "seconds"].indexOf(unit) === -1;

    if (numeric === "auto" && lastable) {
      const isDay = unit === "days";
      switch (count) {
        case 1:
          return isDay ? "tomorrow" : `next ${units[unit][0]}`;
        case -1:
          return isDay ? "yesterday" : `last ${units[unit][0]}`;
        case 0:
          return isDay ? "today" : `this ${units[unit][0]}`;
      }
    }

    const isInPast = Object.is(count, -0) || count < 0,
      fmtValue = Math.abs(count),
      singular = fmtValue === 1,
      lilUnits = units[unit],
      fmtUnit = narrow
        ? singular
          ? lilUnits[1]
          : lilUnits[2] || lilUnits[1]
        : singular
        ? units[unit][0]
        : unit;
    return isInPast ? `${fmtValue} ${fmtUnit} ago` : `in ${fmtValue} ${fmtUnit}`;
  }

  function stringifyTokens(splits, tokenToString) {
    let s = "";
    for (const token of splits) {
      if (token.literal) {
        s += token.val;
      } else {
        s += tokenToString(token.val);
      }
    }
    return s;
  }

  const macroTokenToFormatOpts = {
    D: DATE_SHORT,
    DD: DATE_MED,
    DDD: DATE_FULL,
    DDDD: DATE_HUGE,
    t: TIME_SIMPLE,
    tt: TIME_WITH_SECONDS,
    ttt: TIME_WITH_SHORT_OFFSET,
    tttt: TIME_WITH_LONG_OFFSET,
    T: TIME_24_SIMPLE,
    TT: TIME_24_WITH_SECONDS,
    TTT: TIME_24_WITH_SHORT_OFFSET,
    TTTT: TIME_24_WITH_LONG_OFFSET,
    f: DATETIME_SHORT,
    ff: DATETIME_MED,
    fff: DATETIME_FULL,
    ffff: DATETIME_HUGE,
    F: DATETIME_SHORT_WITH_SECONDS,
    FF: DATETIME_MED_WITH_SECONDS,
    FFF: DATETIME_FULL_WITH_SECONDS,
    FFFF: DATETIME_HUGE_WITH_SECONDS,
  };

  /**
   * @private
   */

  class Formatter {
    static create(locale, opts = {}) {
      return new Formatter(locale, opts);
    }

    static parseFormat(fmt) {
      let current = null,
        currentFull = "",
        bracketed = false;
      const splits = [];
      for (let i = 0; i < fmt.length; i++) {
        const c = fmt.charAt(i);
        if (c === "'") {
          if (currentFull.length > 0) {
            splits.push({ literal: bracketed, val: currentFull });
          }
          current = null;
          currentFull = "";
          bracketed = !bracketed;
        } else if (bracketed) {
          currentFull += c;
        } else if (c === current) {
          currentFull += c;
        } else {
          if (currentFull.length > 0) {
            splits.push({ literal: false, val: currentFull });
          }
          currentFull = c;
          current = c;
        }
      }

      if (currentFull.length > 0) {
        splits.push({ literal: bracketed, val: currentFull });
      }

      return splits;
    }

    static macroTokenToFormatOpts(token) {
      return macroTokenToFormatOpts[token];
    }

    constructor(locale, formatOpts) {
      this.opts = formatOpts;
      this.loc = locale;
      this.systemLoc = null;
    }

    formatWithSystemDefault(dt, opts) {
      if (this.systemLoc === null) {
        this.systemLoc = this.loc.redefaultToSystem();
      }
      const df = this.systemLoc.dtFormatter(dt, { ...this.opts, ...opts });
      return df.format();
    }

    formatDateTime(dt, opts = {}) {
      const df = this.loc.dtFormatter(dt, { ...this.opts, ...opts });
      return df.format();
    }

    formatDateTimeParts(dt, opts = {}) {
      const df = this.loc.dtFormatter(dt, { ...this.opts, ...opts });
      return df.formatToParts();
    }

    resolvedOptions(dt, opts = {}) {
      const df = this.loc.dtFormatter(dt, { ...this.opts, ...opts });
      return df.resolvedOptions();
    }

    num(n, p = 0) {
      // we get some perf out of doing this here, annoyingly
      if (this.opts.forceSimple) {
        return padStart(n, p);
      }

      const opts = { ...this.opts };

      if (p > 0) {
        opts.padTo = p;
      }

      return this.loc.numberFormatter(opts).format(n);
    }

    formatDateTimeFromString(dt, fmt) {
      const knownEnglish = this.loc.listingMode() === "en",
        useDateTimeFormatter = this.loc.outputCalendar && this.loc.outputCalendar !== "gregory",
        string = (opts, extract) => this.loc.extract(dt, opts, extract),
        formatOffset = (opts) => {
          if (dt.isOffsetFixed && dt.offset === 0 && opts.allowZ) {
            return "Z";
          }

          return dt.isValid ? dt.zone.formatOffset(dt.ts, opts.format) : "";
        },
        meridiem = () =>
          knownEnglish
            ? meridiemForDateTime(dt)
            : string({ hour: "numeric", hourCycle: "h12" }, "dayperiod"),
        month = (length, standalone) =>
          knownEnglish
            ? monthForDateTime(dt, length)
            : string(standalone ? { month: length } : { month: length, day: "numeric" }, "month"),
        weekday = (length, standalone) =>
          knownEnglish
            ? weekdayForDateTime(dt, length)
            : string(
                standalone ? { weekday: length } : { weekday: length, month: "long", day: "numeric" },
                "weekday"
              ),
        maybeMacro = (token) => {
          const formatOpts = Formatter.macroTokenToFormatOpts(token);
          if (formatOpts) {
            return this.formatWithSystemDefault(dt, formatOpts);
          } else {
            return token;
          }
        },
        era = (length) =>
          knownEnglish ? eraForDateTime(dt, length) : string({ era: length }, "era"),
        tokenToString = (token) => {
          // Where possible: http://cldr.unicode.org/translation/date-time-1/date-time#TOC-Standalone-vs.-Format-Styles
          switch (token) {
            // ms
            case "S":
              return this.num(dt.millisecond);
            case "u":
            // falls through
            case "SSS":
              return this.num(dt.millisecond, 3);
            // seconds
            case "s":
              return this.num(dt.second);
            case "ss":
              return this.num(dt.second, 2);
            // fractional seconds
            case "uu":
              return this.num(Math.floor(dt.millisecond / 10), 2);
            case "uuu":
              return this.num(Math.floor(dt.millisecond / 100));
            // minutes
            case "m":
              return this.num(dt.minute);
            case "mm":
              return this.num(dt.minute, 2);
            // hours
            case "h":
              return this.num(dt.hour % 12 === 0 ? 12 : dt.hour % 12);
            case "hh":
              return this.num(dt.hour % 12 === 0 ? 12 : dt.hour % 12, 2);
            case "H":
              return this.num(dt.hour);
            case "HH":
              return this.num(dt.hour, 2);
            // offset
            case "Z":
              // like +6
              return formatOffset({ format: "narrow", allowZ: this.opts.allowZ });
            case "ZZ":
              // like +06:00
              return formatOffset({ format: "short", allowZ: this.opts.allowZ });
            case "ZZZ":
              // like +0600
              return formatOffset({ format: "techie", allowZ: this.opts.allowZ });
            case "ZZZZ":
              // like EST
              return dt.zone.offsetName(dt.ts, { format: "short", locale: this.loc.locale });
            case "ZZZZZ":
              // like Eastern Standard Time
              return dt.zone.offsetName(dt.ts, { format: "long", locale: this.loc.locale });
            // zone
            case "z":
              // like America/New_York
              return dt.zoneName;
            // meridiems
            case "a":
              return meridiem();
            // dates
            case "d":
              return useDateTimeFormatter ? string({ day: "numeric" }, "day") : this.num(dt.day);
            case "dd":
              return useDateTimeFormatter ? string({ day: "2-digit" }, "day") : this.num(dt.day, 2);
            // weekdays - standalone
            case "c":
              // like 1
              return this.num(dt.weekday);
            case "ccc":
              // like 'Tues'
              return weekday("short", true);
            case "cccc":
              // like 'Tuesday'
              return weekday("long", true);
            case "ccccc":
              // like 'T'
              return weekday("narrow", true);
            // weekdays - format
            case "E":
              // like 1
              return this.num(dt.weekday);
            case "EEE":
              // like 'Tues'
              return weekday("short", false);
            case "EEEE":
              // like 'Tuesday'
              return weekday("long", false);
            case "EEEEE":
              // like 'T'
              return weekday("narrow", false);
            // months - standalone
            case "L":
              // like 1
              return useDateTimeFormatter
                ? string({ month: "numeric", day: "numeric" }, "month")
                : this.num(dt.month);
            case "LL":
              // like 01, doesn't seem to work
              return useDateTimeFormatter
                ? string({ month: "2-digit", day: "numeric" }, "month")
                : this.num(dt.month, 2);
            case "LLL":
              // like Jan
              return month("short", true);
            case "LLLL":
              // like January
              return month("long", true);
            case "LLLLL":
              // like J
              return month("narrow", true);
            // months - format
            case "M":
              // like 1
              return useDateTimeFormatter
                ? string({ month: "numeric" }, "month")
                : this.num(dt.month);
            case "MM":
              // like 01
              return useDateTimeFormatter
                ? string({ month: "2-digit" }, "month")
                : this.num(dt.month, 2);
            case "MMM":
              // like Jan
              return month("short", false);
            case "MMMM":
              // like January
              return month("long", false);
            case "MMMMM":
              // like J
              return month("narrow", false);
            // years
            case "y":
              // like 2014
              return useDateTimeFormatter ? string({ year: "numeric" }, "year") : this.num(dt.year);
            case "yy":
              // like 14
              return useDateTimeFormatter
                ? string({ year: "2-digit" }, "year")
                : this.num(dt.year.toString().slice(-2), 2);
            case "yyyy":
              // like 0012
              return useDateTimeFormatter
                ? string({ year: "numeric" }, "year")
                : this.num(dt.year, 4);
            case "yyyyyy":
              // like 000012
              return useDateTimeFormatter
                ? string({ year: "numeric" }, "year")
                : this.num(dt.year, 6);
            // eras
            case "G":
              // like AD
              return era("short");
            case "GG":
              // like Anno Domini
              return era("long");
            case "GGGGG":
              return era("narrow");
            case "kk":
              return this.num(dt.weekYear.toString().slice(-2), 2);
            case "kkkk":
              return this.num(dt.weekYear, 4);
            case "W":
              return this.num(dt.weekNumber);
            case "WW":
              return this.num(dt.weekNumber, 2);
            case "o":
              return this.num(dt.ordinal);
            case "ooo":
              return this.num(dt.ordinal, 3);
            case "q":
              // like 1
              return this.num(dt.quarter);
            case "qq":
              // like 01
              return this.num(dt.quarter, 2);
            case "X":
              return this.num(Math.floor(dt.ts / 1000));
            case "x":
              return this.num(dt.ts);
            default:
              return maybeMacro(token);
          }
        };

      return stringifyTokens(Formatter.parseFormat(fmt), tokenToString);
    }

    formatDurationFromString(dur, fmt) {
      const tokenToField = (token) => {
          switch (token[0]) {
            case "S":
              return "millisecond";
            case "s":
              return "second";
            case "m":
              return "minute";
            case "h":
              return "hour";
            case "d":
              return "day";
            case "w":
              return "week";
            case "M":
              return "month";
            case "y":
              return "year";
            default:
              return null;
          }
        },
        tokenToString = (lildur) => (token) => {
          const mapped = tokenToField(token);
          if (mapped) {
            return this.num(lildur.get(mapped), token.length);
          } else {
            return token;
          }
        },
        tokens = Formatter.parseFormat(fmt),
        realTokens = tokens.reduce(
          (found, { literal, val }) => (literal ? found : found.concat(val)),
          []
        ),
        collapsed = dur.shiftTo(...realTokens.map(tokenToField).filter((t) => t));
      return stringifyTokens(tokens, tokenToString(collapsed));
    }
  }

  class Invalid {
    constructor(reason, explanation) {
      this.reason = reason;
      this.explanation = explanation;
    }

    toMessage() {
      if (this.explanation) {
        return `${this.reason}: ${this.explanation}`;
      } else {
        return this.reason;
      }
    }
  }

  /**
   * @interface
   */
  class Zone {
    /**
     * The type of zone
     * @abstract
     * @type {string}
     */
    get type() {
      throw new ZoneIsAbstractError();
    }

    /**
     * The name of this zone.
     * @abstract
     * @type {string}
     */
    get name() {
      throw new ZoneIsAbstractError();
    }

    get ianaName() {
      return this.name;
    }

    /**
     * Returns whether the offset is known to be fixed for the whole year.
     * @abstract
     * @type {boolean}
     */
    get isUniversal() {
      throw new ZoneIsAbstractError();
    }

    /**
     * Returns the offset's common name (such as EST) at the specified timestamp
     * @abstract
     * @param {number} ts - Epoch milliseconds for which to get the name
     * @param {Object} opts - Options to affect the format
     * @param {string} opts.format - What style of offset to return. Accepts 'long' or 'short'.
     * @param {string} opts.locale - What locale to return the offset name in.
     * @return {string}
     */
    offsetName(ts, opts) {
      throw new ZoneIsAbstractError();
    }

    /**
     * Returns the offset's value as a string
     * @abstract
     * @param {number} ts - Epoch milliseconds for which to get the offset
     * @param {string} format - What style of offset to return.
     *                          Accepts 'narrow', 'short', or 'techie'. Returning '+6', '+06:00', or '+0600' respectively
     * @return {string}
     */
    formatOffset(ts, format) {
      throw new ZoneIsAbstractError();
    }

    /**
     * Return the offset in minutes for this zone at the specified timestamp.
     * @abstract
     * @param {number} ts - Epoch milliseconds for which to compute the offset
     * @return {number}
     */
    offset(ts) {
      throw new ZoneIsAbstractError();
    }

    /**
     * Return whether this Zone is equal to another zone
     * @abstract
     * @param {Zone} otherZone - the zone to compare
     * @return {boolean}
     */
    equals(otherZone) {
      throw new ZoneIsAbstractError();
    }

    /**
     * Return whether this Zone is valid.
     * @abstract
     * @type {boolean}
     */
    get isValid() {
      throw new ZoneIsAbstractError();
    }
  }

  let singleton$1 = null;

  /**
   * Represents the local zone for this JavaScript environment.
   * @implements {Zone}
   */
  class SystemZone extends Zone {
    /**
     * Get a singleton instance of the local zone
     * @return {SystemZone}
     */
    static get instance() {
      if (singleton$1 === null) {
        singleton$1 = new SystemZone();
      }
      return singleton$1;
    }

    /** @override **/
    get type() {
      return "system";
    }

    /** @override **/
    get name() {
      return new Intl.DateTimeFormat().resolvedOptions().timeZone;
    }

    /** @override **/
    get isUniversal() {
      return false;
    }

    /** @override **/
    offsetName(ts, { format, locale }) {
      return parseZoneInfo(ts, format, locale);
    }

    /** @override **/
    formatOffset(ts, format) {
      return formatOffset(this.offset(ts), format);
    }

    /** @override **/
    offset(ts) {
      return -new Date(ts).getTimezoneOffset();
    }

    /** @override **/
    equals(otherZone) {
      return otherZone.type === "system";
    }

    /** @override **/
    get isValid() {
      return true;
    }
  }

  let dtfCache = {};
  function makeDTF(zone) {
    if (!dtfCache[zone]) {
      dtfCache[zone] = new Intl.DateTimeFormat("en-US", {
        hour12: false,
        timeZone: zone,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        era: "short",
      });
    }
    return dtfCache[zone];
  }

  const typeToPos = {
    year: 0,
    month: 1,
    day: 2,
    era: 3,
    hour: 4,
    minute: 5,
    second: 6,
  };

  function hackyOffset(dtf, date) {
    const formatted = dtf.format(date).replace(/\u200E/g, ""),
      parsed = /(\d+)\/(\d+)\/(\d+) (AD|BC),? (\d+):(\d+):(\d+)/.exec(formatted),
      [, fMonth, fDay, fYear, fadOrBc, fHour, fMinute, fSecond] = parsed;
    return [fYear, fMonth, fDay, fadOrBc, fHour, fMinute, fSecond];
  }

  function partsOffset(dtf, date) {
    const formatted = dtf.formatToParts(date);
    const filled = [];
    for (let i = 0; i < formatted.length; i++) {
      const { type, value } = formatted[i];
      const pos = typeToPos[type];

      if (type === "era") {
        filled[pos] = value;
      } else if (!isUndefined(pos)) {
        filled[pos] = parseInt(value, 10);
      }
    }
    return filled;
  }

  let ianaZoneCache = {};
  /**
   * A zone identified by an IANA identifier, like America/New_York
   * @implements {Zone}
   */
  class IANAZone extends Zone {
    /**
     * @param {string} name - Zone name
     * @return {IANAZone}
     */
    static create(name) {
      if (!ianaZoneCache[name]) {
        ianaZoneCache[name] = new IANAZone(name);
      }
      return ianaZoneCache[name];
    }

    /**
     * Reset local caches. Should only be necessary in testing scenarios.
     * @return {void}
     */
    static resetCache() {
      ianaZoneCache = {};
      dtfCache = {};
    }

    /**
     * Returns whether the provided string is a valid specifier. This only checks the string's format, not that the specifier identifies a known zone; see isValidZone for that.
     * @param {string} s - The string to check validity on
     * @example IANAZone.isValidSpecifier("America/New_York") //=> true
     * @example IANAZone.isValidSpecifier("Sport~~blorp") //=> false
     * @deprecated This method returns false for some valid IANA names. Use isValidZone instead.
     * @return {boolean}
     */
    static isValidSpecifier(s) {
      return this.isValidZone(s);
    }

    /**
     * Returns whether the provided string identifies a real zone
     * @param {string} zone - The string to check
     * @example IANAZone.isValidZone("America/New_York") //=> true
     * @example IANAZone.isValidZone("Fantasia/Castle") //=> false
     * @example IANAZone.isValidZone("Sport~~blorp") //=> false
     * @return {boolean}
     */
    static isValidZone(zone) {
      if (!zone) {
        return false;
      }
      try {
        new Intl.DateTimeFormat("en-US", { timeZone: zone }).format();
        return true;
      } catch (e) {
        return false;
      }
    }

    constructor(name) {
      super();
      /** @private **/
      this.zoneName = name;
      /** @private **/
      this.valid = IANAZone.isValidZone(name);
    }

    /** @override **/
    get type() {
      return "iana";
    }

    /** @override **/
    get name() {
      return this.zoneName;
    }

    /** @override **/
    get isUniversal() {
      return false;
    }

    /** @override **/
    offsetName(ts, { format, locale }) {
      return parseZoneInfo(ts, format, locale, this.name);
    }

    /** @override **/
    formatOffset(ts, format) {
      return formatOffset(this.offset(ts), format);
    }

    /** @override **/
    offset(ts) {
      const date = new Date(ts);

      if (isNaN(date)) return NaN;

      const dtf = makeDTF(this.name);
      let [year, month, day, adOrBc, hour, minute, second] = dtf.formatToParts
        ? partsOffset(dtf, date)
        : hackyOffset(dtf, date);

      if (adOrBc === "BC") {
        year = -Math.abs(year) + 1;
      }

      // because we're using hour12 and https://bugs.chromium.org/p/chromium/issues/detail?id=1025564&can=2&q=%2224%3A00%22%20datetimeformat
      const adjustedHour = hour === 24 ? 0 : hour;

      const asUTC = objToLocalTS({
        year,
        month,
        day,
        hour: adjustedHour,
        minute,
        second,
        millisecond: 0,
      });

      let asTS = +date;
      const over = asTS % 1000;
      asTS -= over >= 0 ? over : 1000 + over;
      return (asUTC - asTS) / (60 * 1000);
    }

    /** @override **/
    equals(otherZone) {
      return otherZone.type === "iana" && otherZone.name === this.name;
    }

    /** @override **/
    get isValid() {
      return this.valid;
    }
  }

  let singleton = null;

  /**
   * A zone with a fixed offset (meaning no DST)
   * @implements {Zone}
   */
  class FixedOffsetZone extends Zone {
    /**
     * Get a singleton instance of UTC
     * @return {FixedOffsetZone}
     */
    static get utcInstance() {
      if (singleton === null) {
        singleton = new FixedOffsetZone(0);
      }
      return singleton;
    }

    /**
     * Get an instance with a specified offset
     * @param {number} offset - The offset in minutes
     * @return {FixedOffsetZone}
     */
    static instance(offset) {
      return offset === 0 ? FixedOffsetZone.utcInstance : new FixedOffsetZone(offset);
    }

    /**
     * Get an instance of FixedOffsetZone from a UTC offset string, like "UTC+6"
     * @param {string} s - The offset string to parse
     * @example FixedOffsetZone.parseSpecifier("UTC+6")
     * @example FixedOffsetZone.parseSpecifier("UTC+06")
     * @example FixedOffsetZone.parseSpecifier("UTC-6:00")
     * @return {FixedOffsetZone}
     */
    static parseSpecifier(s) {
      if (s) {
        const r = s.match(/^utc(?:([+-]\d{1,2})(?::(\d{2}))?)?$/i);
        if (r) {
          return new FixedOffsetZone(signedOffset(r[1], r[2]));
        }
      }
      return null;
    }

    constructor(offset) {
      super();
      /** @private **/
      this.fixed = offset;
    }

    /** @override **/
    get type() {
      return "fixed";
    }

    /** @override **/
    get name() {
      return this.fixed === 0 ? "UTC" : `UTC${formatOffset(this.fixed, "narrow")}`;
    }

    get ianaName() {
      if (this.fixed === 0) {
        return "Etc/UTC";
      } else {
        return `Etc/GMT${formatOffset(-this.fixed, "narrow")}`;
      }
    }

    /** @override **/
    offsetName() {
      return this.name;
    }

    /** @override **/
    formatOffset(ts, format) {
      return formatOffset(this.fixed, format);
    }

    /** @override **/
    get isUniversal() {
      return true;
    }

    /** @override **/
    offset() {
      return this.fixed;
    }

    /** @override **/
    equals(otherZone) {
      return otherZone.type === "fixed" && otherZone.fixed === this.fixed;
    }

    /** @override **/
    get isValid() {
      return true;
    }
  }

  /**
   * A zone that failed to parse. You should never need to instantiate this.
   * @implements {Zone}
   */
  class InvalidZone extends Zone {
    constructor(zoneName) {
      super();
      /**  @private */
      this.zoneName = zoneName;
    }

    /** @override **/
    get type() {
      return "invalid";
    }

    /** @override **/
    get name() {
      return this.zoneName;
    }

    /** @override **/
    get isUniversal() {
      return false;
    }

    /** @override **/
    offsetName() {
      return null;
    }

    /** @override **/
    formatOffset() {
      return "";
    }

    /** @override **/
    offset() {
      return NaN;
    }

    /** @override **/
    equals() {
      return false;
    }

    /** @override **/
    get isValid() {
      return false;
    }
  }

  /**
   * @private
   */

  function normalizeZone(input, defaultZone) {
    if (isUndefined(input) || input === null) {
      return defaultZone;
    } else if (input instanceof Zone) {
      return input;
    } else if (isString$1(input)) {
      const lowered = input.toLowerCase();
      if (lowered === "default") return defaultZone;
      else if (lowered === "local" || lowered === "system") return SystemZone.instance;
      else if (lowered === "utc" || lowered === "gmt") return FixedOffsetZone.utcInstance;
      else return FixedOffsetZone.parseSpecifier(lowered) || IANAZone.create(input);
    } else if (isNumber$1(input)) {
      return FixedOffsetZone.instance(input);
    } else if (typeof input === "object" && input.offset && typeof input.offset === "number") {
      // This is dumb, but the instanceof check above doesn't seem to really work
      // so we're duck checking it
      return input;
    } else {
      return new InvalidZone(input);
    }
  }

  let now = () => Date.now(),
    defaultZone = "system",
    defaultLocale = null,
    defaultNumberingSystem = null,
    defaultOutputCalendar = null,
    throwOnInvalid;

  /**
   * Settings contains static getters and setters that control Luxon's overall behavior. Luxon is a simple library with few options, but the ones it does have live here.
   */
  class Settings {
    /**
     * Get the callback for returning the current timestamp.
     * @type {function}
     */
    static get now() {
      return now;
    }

    /**
     * Set the callback for returning the current timestamp.
     * The function should return a number, which will be interpreted as an Epoch millisecond count
     * @type {function}
     * @example Settings.now = () => Date.now() + 3000 // pretend it is 3 seconds in the future
     * @example Settings.now = () => 0 // always pretend it's Jan 1, 1970 at midnight in UTC time
     */
    static set now(n) {
      now = n;
    }

    /**
     * Set the default time zone to create DateTimes in. Does not affect existing instances.
     * Use the value "system" to reset this value to the system's time zone.
     * @type {string}
     */
    static set defaultZone(zone) {
      defaultZone = zone;
    }

    /**
     * Get the default time zone object currently used to create DateTimes. Does not affect existing instances.
     * The default value is the system's time zone (the one set on the machine that runs this code).
     * @type {Zone}
     */
    static get defaultZone() {
      return normalizeZone(defaultZone, SystemZone.instance);
    }

    /**
     * Get the default locale to create DateTimes with. Does not affect existing instances.
     * @type {string}
     */
    static get defaultLocale() {
      return defaultLocale;
    }

    /**
     * Set the default locale to create DateTimes with. Does not affect existing instances.
     * @type {string}
     */
    static set defaultLocale(locale) {
      defaultLocale = locale;
    }

    /**
     * Get the default numbering system to create DateTimes with. Does not affect existing instances.
     * @type {string}
     */
    static get defaultNumberingSystem() {
      return defaultNumberingSystem;
    }

    /**
     * Set the default numbering system to create DateTimes with. Does not affect existing instances.
     * @type {string}
     */
    static set defaultNumberingSystem(numberingSystem) {
      defaultNumberingSystem = numberingSystem;
    }

    /**
     * Get the default output calendar to create DateTimes with. Does not affect existing instances.
     * @type {string}
     */
    static get defaultOutputCalendar() {
      return defaultOutputCalendar;
    }

    /**
     * Set the default output calendar to create DateTimes with. Does not affect existing instances.
     * @type {string}
     */
    static set defaultOutputCalendar(outputCalendar) {
      defaultOutputCalendar = outputCalendar;
    }

    /**
     * Get whether Luxon will throw when it encounters invalid DateTimes, Durations, or Intervals
     * @type {boolean}
     */
    static get throwOnInvalid() {
      return throwOnInvalid;
    }

    /**
     * Set whether Luxon will throw when it encounters invalid DateTimes, Durations, or Intervals
     * @type {boolean}
     */
    static set throwOnInvalid(t) {
      throwOnInvalid = t;
    }

    /**
     * Reset Luxon's global caches. Should only be necessary in testing scenarios.
     * @return {void}
     */
    static resetCaches() {
      Locale.resetCache();
      IANAZone.resetCache();
    }
  }

  // todo - remap caching

  let intlLFCache = {};
  function getCachedLF(locString, opts = {}) {
    const key = JSON.stringify([locString, opts]);
    let dtf = intlLFCache[key];
    if (!dtf) {
      dtf = new Intl.ListFormat(locString, opts);
      intlLFCache[key] = dtf;
    }
    return dtf;
  }

  let intlDTCache = {};
  function getCachedDTF(locString, opts = {}) {
    const key = JSON.stringify([locString, opts]);
    let dtf = intlDTCache[key];
    if (!dtf) {
      dtf = new Intl.DateTimeFormat(locString, opts);
      intlDTCache[key] = dtf;
    }
    return dtf;
  }

  let intlNumCache = {};
  function getCachedINF(locString, opts = {}) {
    const key = JSON.stringify([locString, opts]);
    let inf = intlNumCache[key];
    if (!inf) {
      inf = new Intl.NumberFormat(locString, opts);
      intlNumCache[key] = inf;
    }
    return inf;
  }

  let intlRelCache = {};
  function getCachedRTF(locString, opts = {}) {
    const { base, ...cacheKeyOpts } = opts; // exclude `base` from the options
    const key = JSON.stringify([locString, cacheKeyOpts]);
    let inf = intlRelCache[key];
    if (!inf) {
      inf = new Intl.RelativeTimeFormat(locString, opts);
      intlRelCache[key] = inf;
    }
    return inf;
  }

  let sysLocaleCache = null;
  function systemLocale() {
    if (sysLocaleCache) {
      return sysLocaleCache;
    } else {
      sysLocaleCache = new Intl.DateTimeFormat().resolvedOptions().locale;
      return sysLocaleCache;
    }
  }

  function parseLocaleString(localeStr) {
    // I really want to avoid writing a BCP 47 parser
    // see, e.g. https://github.com/wooorm/bcp-47
    // Instead, we'll do this:

    // a) if the string has no -u extensions, just leave it alone
    // b) if it does, use Intl to resolve everything
    // c) if Intl fails, try again without the -u

    const uIndex = localeStr.indexOf("-u-");
    if (uIndex === -1) {
      return [localeStr];
    } else {
      let options;
      const smaller = localeStr.substring(0, uIndex);
      try {
        options = getCachedDTF(localeStr).resolvedOptions();
      } catch (e) {
        options = getCachedDTF(smaller).resolvedOptions();
      }

      const { numberingSystem, calendar } = options;
      // return the smaller one so that we can append the calendar and numbering overrides to it
      return [smaller, numberingSystem, calendar];
    }
  }

  function intlConfigString(localeStr, numberingSystem, outputCalendar) {
    if (outputCalendar || numberingSystem) {
      localeStr += "-u";

      if (outputCalendar) {
        localeStr += `-ca-${outputCalendar}`;
      }

      if (numberingSystem) {
        localeStr += `-nu-${numberingSystem}`;
      }
      return localeStr;
    } else {
      return localeStr;
    }
  }

  function mapMonths(f) {
    const ms = [];
    for (let i = 1; i <= 12; i++) {
      const dt = DateTime.utc(2016, i, 1);
      ms.push(f(dt));
    }
    return ms;
  }

  function mapWeekdays(f) {
    const ms = [];
    for (let i = 1; i <= 7; i++) {
      const dt = DateTime.utc(2016, 11, 13 + i);
      ms.push(f(dt));
    }
    return ms;
  }

  function listStuff(loc, length, defaultOK, englishFn, intlFn) {
    const mode = loc.listingMode(defaultOK);

    if (mode === "error") {
      return null;
    } else if (mode === "en") {
      return englishFn(length);
    } else {
      return intlFn(length);
    }
  }

  function supportsFastNumbers(loc) {
    if (loc.numberingSystem && loc.numberingSystem !== "latn") {
      return false;
    } else {
      return (
        loc.numberingSystem === "latn" ||
        !loc.locale ||
        loc.locale.startsWith("en") ||
        new Intl.DateTimeFormat(loc.intl).resolvedOptions().numberingSystem === "latn"
      );
    }
  }

  /**
   * @private
   */

  class PolyNumberFormatter {
    constructor(intl, forceSimple, opts) {
      this.padTo = opts.padTo || 0;
      this.floor = opts.floor || false;

      const { padTo, floor, ...otherOpts } = opts;

      if (!forceSimple || Object.keys(otherOpts).length > 0) {
        const intlOpts = { useGrouping: false, ...opts };
        if (opts.padTo > 0) intlOpts.minimumIntegerDigits = opts.padTo;
        this.inf = getCachedINF(intl, intlOpts);
      }
    }

    format(i) {
      if (this.inf) {
        const fixed = this.floor ? Math.floor(i) : i;
        return this.inf.format(fixed);
      } else {
        // to match the browser's numberformatter defaults
        const fixed = this.floor ? Math.floor(i) : roundTo(i, 3);
        return padStart(fixed, this.padTo);
      }
    }
  }

  /**
   * @private
   */

  class PolyDateFormatter {
    constructor(dt, intl, opts) {
      this.opts = opts;

      let z;
      if (dt.zone.isUniversal) {
        // UTC-8 or Etc/UTC-8 are not part of tzdata, only Etc/GMT+8 and the like.
        // That is why fixed-offset TZ is set to that unless it is:
        // 1. Representing offset 0 when UTC is used to maintain previous behavior and does not become GMT.
        // 2. Unsupported by the browser:
        //    - some do not support Etc/
        //    - < Etc/GMT-14, > Etc/GMT+12, and 30-minute or 45-minute offsets are not part of tzdata
        const gmtOffset = -1 * (dt.offset / 60);
        const offsetZ = gmtOffset >= 0 ? `Etc/GMT+${gmtOffset}` : `Etc/GMT${gmtOffset}`;
        if (dt.offset !== 0 && IANAZone.create(offsetZ).valid) {
          z = offsetZ;
          this.dt = dt;
        } else {
          // Not all fixed-offset zones like Etc/+4:30 are present in tzdata.
          // So we have to make do. Two cases:
          // 1. The format options tell us to show the zone. We can't do that, so the best
          // we can do is format the date in UTC.
          // 2. The format options don't tell us to show the zone. Then we can adjust them
          // the time and tell the formatter to show it to us in UTC, so that the time is right
          // and the bad zone doesn't show up.
          z = "UTC";
          if (opts.timeZoneName) {
            this.dt = dt;
          } else {
            this.dt = dt.offset === 0 ? dt : DateTime.fromMillis(dt.ts + dt.offset * 60 * 1000);
          }
        }
      } else if (dt.zone.type === "system") {
        this.dt = dt;
      } else {
        this.dt = dt;
        z = dt.zone.name;
      }

      const intlOpts = { ...this.opts };
      if (z) {
        intlOpts.timeZone = z;
      }
      this.dtf = getCachedDTF(intl, intlOpts);
    }

    format() {
      return this.dtf.format(this.dt.toJSDate());
    }

    formatToParts() {
      return this.dtf.formatToParts(this.dt.toJSDate());
    }

    resolvedOptions() {
      return this.dtf.resolvedOptions();
    }
  }

  /**
   * @private
   */
  class PolyRelFormatter {
    constructor(intl, isEnglish, opts) {
      this.opts = { style: "long", ...opts };
      if (!isEnglish && hasRelative()) {
        this.rtf = getCachedRTF(intl, opts);
      }
    }

    format(count, unit) {
      if (this.rtf) {
        return this.rtf.format(count, unit);
      } else {
        return formatRelativeTime(unit, count, this.opts.numeric, this.opts.style !== "long");
      }
    }

    formatToParts(count, unit) {
      if (this.rtf) {
        return this.rtf.formatToParts(count, unit);
      } else {
        return [];
      }
    }
  }

  /**
   * @private
   */

  class Locale {
    static fromOpts(opts) {
      return Locale.create(opts.locale, opts.numberingSystem, opts.outputCalendar, opts.defaultToEN);
    }

    static create(locale, numberingSystem, outputCalendar, defaultToEN = false) {
      const specifiedLocale = locale || Settings.defaultLocale;
      // the system locale is useful for human readable strings but annoying for parsing/formatting known formats
      const localeR = specifiedLocale || (defaultToEN ? "en-US" : systemLocale());
      const numberingSystemR = numberingSystem || Settings.defaultNumberingSystem;
      const outputCalendarR = outputCalendar || Settings.defaultOutputCalendar;
      return new Locale(localeR, numberingSystemR, outputCalendarR, specifiedLocale);
    }

    static resetCache() {
      sysLocaleCache = null;
      intlDTCache = {};
      intlNumCache = {};
      intlRelCache = {};
    }

    static fromObject({ locale, numberingSystem, outputCalendar } = {}) {
      return Locale.create(locale, numberingSystem, outputCalendar);
    }

    constructor(locale, numbering, outputCalendar, specifiedLocale) {
      const [parsedLocale, parsedNumberingSystem, parsedOutputCalendar] = parseLocaleString(locale);

      this.locale = parsedLocale;
      this.numberingSystem = numbering || parsedNumberingSystem || null;
      this.outputCalendar = outputCalendar || parsedOutputCalendar || null;
      this.intl = intlConfigString(this.locale, this.numberingSystem, this.outputCalendar);

      this.weekdaysCache = { format: {}, standalone: {} };
      this.monthsCache = { format: {}, standalone: {} };
      this.meridiemCache = null;
      this.eraCache = {};

      this.specifiedLocale = specifiedLocale;
      this.fastNumbersCached = null;
    }

    get fastNumbers() {
      if (this.fastNumbersCached == null) {
        this.fastNumbersCached = supportsFastNumbers(this);
      }

      return this.fastNumbersCached;
    }

    listingMode() {
      const isActuallyEn = this.isEnglish();
      const hasNoWeirdness =
        (this.numberingSystem === null || this.numberingSystem === "latn") &&
        (this.outputCalendar === null || this.outputCalendar === "gregory");
      return isActuallyEn && hasNoWeirdness ? "en" : "intl";
    }

    clone(alts) {
      if (!alts || Object.getOwnPropertyNames(alts).length === 0) {
        return this;
      } else {
        return Locale.create(
          alts.locale || this.specifiedLocale,
          alts.numberingSystem || this.numberingSystem,
          alts.outputCalendar || this.outputCalendar,
          alts.defaultToEN || false
        );
      }
    }

    redefaultToEN(alts = {}) {
      return this.clone({ ...alts, defaultToEN: true });
    }

    redefaultToSystem(alts = {}) {
      return this.clone({ ...alts, defaultToEN: false });
    }

    months(length, format = false, defaultOK = true) {
      return listStuff(this, length, defaultOK, months, () => {
        const intl = format ? { month: length, day: "numeric" } : { month: length },
          formatStr = format ? "format" : "standalone";
        if (!this.monthsCache[formatStr][length]) {
          this.monthsCache[formatStr][length] = mapMonths((dt) => this.extract(dt, intl, "month"));
        }
        return this.monthsCache[formatStr][length];
      });
    }

    weekdays(length, format = false, defaultOK = true) {
      return listStuff(this, length, defaultOK, weekdays, () => {
        const intl = format
            ? { weekday: length, year: "numeric", month: "long", day: "numeric" }
            : { weekday: length },
          formatStr = format ? "format" : "standalone";
        if (!this.weekdaysCache[formatStr][length]) {
          this.weekdaysCache[formatStr][length] = mapWeekdays((dt) =>
            this.extract(dt, intl, "weekday")
          );
        }
        return this.weekdaysCache[formatStr][length];
      });
    }

    meridiems(defaultOK = true) {
      return listStuff(
        this,
        undefined,
        defaultOK,
        () => meridiems,
        () => {
          // In theory there could be aribitrary day periods. We're gonna assume there are exactly two
          // for AM and PM. This is probably wrong, but it's makes parsing way easier.
          if (!this.meridiemCache) {
            const intl = { hour: "numeric", hourCycle: "h12" };
            this.meridiemCache = [DateTime.utc(2016, 11, 13, 9), DateTime.utc(2016, 11, 13, 19)].map(
              (dt) => this.extract(dt, intl, "dayperiod")
            );
          }

          return this.meridiemCache;
        }
      );
    }

    eras(length, defaultOK = true) {
      return listStuff(this, length, defaultOK, eras, () => {
        const intl = { era: length };

        // This is problematic. Different calendars are going to define eras totally differently. What I need is the minimum set of dates
        // to definitely enumerate them.
        if (!this.eraCache[length]) {
          this.eraCache[length] = [DateTime.utc(-40, 1, 1), DateTime.utc(2017, 1, 1)].map((dt) =>
            this.extract(dt, intl, "era")
          );
        }

        return this.eraCache[length];
      });
    }

    extract(dt, intlOpts, field) {
      const df = this.dtFormatter(dt, intlOpts),
        results = df.formatToParts(),
        matching = results.find((m) => m.type.toLowerCase() === field);
      return matching ? matching.value : null;
    }

    numberFormatter(opts = {}) {
      // this forcesimple option is never used (the only caller short-circuits on it, but it seems safer to leave)
      // (in contrast, the rest of the condition is used heavily)
      return new PolyNumberFormatter(this.intl, opts.forceSimple || this.fastNumbers, opts);
    }

    dtFormatter(dt, intlOpts = {}) {
      return new PolyDateFormatter(dt, this.intl, intlOpts);
    }

    relFormatter(opts = {}) {
      return new PolyRelFormatter(this.intl, this.isEnglish(), opts);
    }

    listFormatter(opts = {}) {
      return getCachedLF(this.intl, opts);
    }

    isEnglish() {
      return (
        this.locale === "en" ||
        this.locale.toLowerCase() === "en-us" ||
        new Intl.DateTimeFormat(this.intl).resolvedOptions().locale.startsWith("en-us")
      );
    }

    equals(other) {
      return (
        this.locale === other.locale &&
        this.numberingSystem === other.numberingSystem &&
        this.outputCalendar === other.outputCalendar
      );
    }
  }

  /*
   * This file handles parsing for well-specified formats. Here's how it works:
   * Two things go into parsing: a regex to match with and an extractor to take apart the groups in the match.
   * An extractor is just a function that takes a regex match array and returns a { year: ..., month: ... } object
   * parse() does the work of executing the regex and applying the extractor. It takes multiple regex/extractor pairs to try in sequence.
   * Extractors can take a "cursor" representing the offset in the match to look at. This makes it easy to combine extractors.
   * combineExtractors() does the work of combining them, keeping track of the cursor through multiple extractions.
   * Some extractions are super dumb and simpleParse and fromStrings help DRY them.
   */

  function combineRegexes(...regexes) {
    const full = regexes.reduce((f, r) => f + r.source, "");
    return RegExp(`^${full}$`);
  }

  function combineExtractors(...extractors) {
    return (m) =>
      extractors
        .reduce(
          ([mergedVals, mergedZone, cursor], ex) => {
            const [val, zone, next] = ex(m, cursor);
            return [{ ...mergedVals, ...val }, zone || mergedZone, next];
          },
          [{}, null, 1]
        )
        .slice(0, 2);
  }

  function parse$1(s, ...patterns) {
    if (s == null) {
      return [null, null];
    }

    for (const [regex, extractor] of patterns) {
      const m = regex.exec(s);
      if (m) {
        return extractor(m);
      }
    }
    return [null, null];
  }

  function simpleParse(...keys) {
    return (match, cursor) => {
      const ret = {};
      let i;

      for (i = 0; i < keys.length; i++) {
        ret[keys[i]] = parseInteger(match[cursor + i]);
      }
      return [ret, null, cursor + i];
    };
  }

  // ISO and SQL parsing
  const offsetRegex = /(?:(Z)|([+-]\d\d)(?::?(\d\d))?)/;
  const isoExtendedZone = `(?:${offsetRegex.source}?(?:\\[(${ianaRegex.source})\\])?)?`;
  const isoTimeBaseRegex = /(\d\d)(?::?(\d\d)(?::?(\d\d)(?:[.,](\d{1,30}))?)?)?/;
  const isoTimeRegex = RegExp(`${isoTimeBaseRegex.source}${isoExtendedZone}`);
  const isoTimeExtensionRegex = RegExp(`(?:T${isoTimeRegex.source})?`);
  const isoYmdRegex = /([+-]\d{6}|\d{4})(?:-?(\d\d)(?:-?(\d\d))?)?/;
  const isoWeekRegex = /(\d{4})-?W(\d\d)(?:-?(\d))?/;
  const isoOrdinalRegex = /(\d{4})-?(\d{3})/;
  const extractISOWeekData = simpleParse("weekYear", "weekNumber", "weekDay");
  const extractISOOrdinalData = simpleParse("year", "ordinal");
  const sqlYmdRegex = /(\d{4})-(\d\d)-(\d\d)/; // dumbed-down version of the ISO one
  const sqlTimeRegex = RegExp(
    `${isoTimeBaseRegex.source} ?(?:${offsetRegex.source}|(${ianaRegex.source}))?`
  );
  const sqlTimeExtensionRegex = RegExp(`(?: ${sqlTimeRegex.source})?`);

  function int$1(match, pos, fallback) {
    const m = match[pos];
    return isUndefined(m) ? fallback : parseInteger(m);
  }

  function extractISOYmd(match, cursor) {
    const item = {
      year: int$1(match, cursor),
      month: int$1(match, cursor + 1, 1),
      day: int$1(match, cursor + 2, 1),
    };

    return [item, null, cursor + 3];
  }

  function extractISOTime(match, cursor) {
    const item = {
      hours: int$1(match, cursor, 0),
      minutes: int$1(match, cursor + 1, 0),
      seconds: int$1(match, cursor + 2, 0),
      milliseconds: parseMillis(match[cursor + 3]),
    };

    return [item, null, cursor + 4];
  }

  function extractISOOffset(match, cursor) {
    const local = !match[cursor] && !match[cursor + 1],
      fullOffset = signedOffset(match[cursor + 1], match[cursor + 2]),
      zone = local ? null : FixedOffsetZone.instance(fullOffset);
    return [{}, zone, cursor + 3];
  }

  function extractIANAZone(match, cursor) {
    const zone = match[cursor] ? IANAZone.create(match[cursor]) : null;
    return [{}, zone, cursor + 1];
  }

  // ISO time parsing

  const isoTimeOnly = RegExp(`^T?${isoTimeBaseRegex.source}$`);

  // ISO duration parsing

  const isoDuration =
    /^-?P(?:(?:(-?\d{1,20}(?:\.\d{1,20})?)Y)?(?:(-?\d{1,20}(?:\.\d{1,20})?)M)?(?:(-?\d{1,20}(?:\.\d{1,20})?)W)?(?:(-?\d{1,20}(?:\.\d{1,20})?)D)?(?:T(?:(-?\d{1,20}(?:\.\d{1,20})?)H)?(?:(-?\d{1,20}(?:\.\d{1,20})?)M)?(?:(-?\d{1,20})(?:[.,](-?\d{1,20}))?S)?)?)$/;

  function extractISODuration(match) {
    const [s, yearStr, monthStr, weekStr, dayStr, hourStr, minuteStr, secondStr, millisecondsStr] =
      match;

    const hasNegativePrefix = s[0] === "-";
    const negativeSeconds = secondStr && secondStr[0] === "-";

    const maybeNegate = (num, force = false) =>
      num !== undefined && (force || (num && hasNegativePrefix)) ? -num : num;

    return [
      {
        years: maybeNegate(parseFloating(yearStr)),
        months: maybeNegate(parseFloating(monthStr)),
        weeks: maybeNegate(parseFloating(weekStr)),
        days: maybeNegate(parseFloating(dayStr)),
        hours: maybeNegate(parseFloating(hourStr)),
        minutes: maybeNegate(parseFloating(minuteStr)),
        seconds: maybeNegate(parseFloating(secondStr), secondStr === "-0"),
        milliseconds: maybeNegate(parseMillis(millisecondsStr), negativeSeconds),
      },
    ];
  }

  // These are a little braindead. EDT *should* tell us that we're in, say, America/New_York
  // and not just that we're in -240 *right now*. But since I don't think these are used that often
  // I'm just going to ignore that
  const obsOffsets = {
    GMT: 0,
    EDT: -4 * 60,
    EST: -5 * 60,
    CDT: -5 * 60,
    CST: -6 * 60,
    MDT: -6 * 60,
    MST: -7 * 60,
    PDT: -7 * 60,
    PST: -8 * 60,
  };

  function fromStrings(weekdayStr, yearStr, monthStr, dayStr, hourStr, minuteStr, secondStr) {
    const result = {
      year: yearStr.length === 2 ? untruncateYear(parseInteger(yearStr)) : parseInteger(yearStr),
      month: monthsShort.indexOf(monthStr) + 1,
      day: parseInteger(dayStr),
      hour: parseInteger(hourStr),
      minute: parseInteger(minuteStr),
    };

    if (secondStr) result.second = parseInteger(secondStr);
    if (weekdayStr) {
      result.weekday =
        weekdayStr.length > 3
          ? weekdaysLong.indexOf(weekdayStr) + 1
          : weekdaysShort.indexOf(weekdayStr) + 1;
    }

    return result;
  }

  // RFC 2822/5322
  const rfc2822 =
    /^(?:(Mon|Tue|Wed|Thu|Fri|Sat|Sun),\s)?(\d{1,2})\s(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s(\d{2,4})\s(\d\d):(\d\d)(?::(\d\d))?\s(?:(UT|GMT|[ECMP][SD]T)|([Zz])|(?:([+-]\d\d)(\d\d)))$/;

  function extractRFC2822(match) {
    const [
        ,
        weekdayStr,
        dayStr,
        monthStr,
        yearStr,
        hourStr,
        minuteStr,
        secondStr,
        obsOffset,
        milOffset,
        offHourStr,
        offMinuteStr,
      ] = match,
      result = fromStrings(weekdayStr, yearStr, monthStr, dayStr, hourStr, minuteStr, secondStr);

    let offset;
    if (obsOffset) {
      offset = obsOffsets[obsOffset];
    } else if (milOffset) {
      offset = 0;
    } else {
      offset = signedOffset(offHourStr, offMinuteStr);
    }

    return [result, new FixedOffsetZone(offset)];
  }

  function preprocessRFC2822(s) {
    // Remove comments and folding whitespace and replace multiple-spaces with a single space
    return s
      .replace(/\([^)]*\)|[\n\t]/g, " ")
      .replace(/(\s\s+)/g, " ")
      .trim();
  }

  // http date

  const rfc1123 =
      /^(Mon|Tue|Wed|Thu|Fri|Sat|Sun), (\d\d) (Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) (\d{4}) (\d\d):(\d\d):(\d\d) GMT$/,
    rfc850 =
      /^(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday), (\d\d)-(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)-(\d\d) (\d\d):(\d\d):(\d\d) GMT$/,
    ascii =
      /^(Mon|Tue|Wed|Thu|Fri|Sat|Sun) (Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) ( \d|\d\d) (\d\d):(\d\d):(\d\d) (\d{4})$/;

  function extractRFC1123Or850(match) {
    const [, weekdayStr, dayStr, monthStr, yearStr, hourStr, minuteStr, secondStr] = match,
      result = fromStrings(weekdayStr, yearStr, monthStr, dayStr, hourStr, minuteStr, secondStr);
    return [result, FixedOffsetZone.utcInstance];
  }

  function extractASCII(match) {
    const [, weekdayStr, monthStr, dayStr, hourStr, minuteStr, secondStr, yearStr] = match,
      result = fromStrings(weekdayStr, yearStr, monthStr, dayStr, hourStr, minuteStr, secondStr);
    return [result, FixedOffsetZone.utcInstance];
  }

  const isoYmdWithTimeExtensionRegex = combineRegexes(isoYmdRegex, isoTimeExtensionRegex);
  const isoWeekWithTimeExtensionRegex = combineRegexes(isoWeekRegex, isoTimeExtensionRegex);
  const isoOrdinalWithTimeExtensionRegex = combineRegexes(isoOrdinalRegex, isoTimeExtensionRegex);
  const isoTimeCombinedRegex = combineRegexes(isoTimeRegex);

  const extractISOYmdTimeAndOffset = combineExtractors(
    extractISOYmd,
    extractISOTime,
    extractISOOffset,
    extractIANAZone
  );
  const extractISOWeekTimeAndOffset = combineExtractors(
    extractISOWeekData,
    extractISOTime,
    extractISOOffset,
    extractIANAZone
  );
  const extractISOOrdinalDateAndTime = combineExtractors(
    extractISOOrdinalData,
    extractISOTime,
    extractISOOffset,
    extractIANAZone
  );
  const extractISOTimeAndOffset = combineExtractors(
    extractISOTime,
    extractISOOffset,
    extractIANAZone
  );

  /*
   * @private
   */

  function parseISODate(s) {
    return parse$1(
      s,
      [isoYmdWithTimeExtensionRegex, extractISOYmdTimeAndOffset],
      [isoWeekWithTimeExtensionRegex, extractISOWeekTimeAndOffset],
      [isoOrdinalWithTimeExtensionRegex, extractISOOrdinalDateAndTime],
      [isoTimeCombinedRegex, extractISOTimeAndOffset]
    );
  }

  function parseRFC2822Date(s) {
    return parse$1(preprocessRFC2822(s), [rfc2822, extractRFC2822]);
  }

  function parseHTTPDate(s) {
    return parse$1(
      s,
      [rfc1123, extractRFC1123Or850],
      [rfc850, extractRFC1123Or850],
      [ascii, extractASCII]
    );
  }

  function parseISODuration(s) {
    return parse$1(s, [isoDuration, extractISODuration]);
  }

  const extractISOTimeOnly = combineExtractors(extractISOTime);

  function parseISOTimeOnly(s) {
    return parse$1(s, [isoTimeOnly, extractISOTimeOnly]);
  }

  const sqlYmdWithTimeExtensionRegex = combineRegexes(sqlYmdRegex, sqlTimeExtensionRegex);
  const sqlTimeCombinedRegex = combineRegexes(sqlTimeRegex);

  const extractISOTimeOffsetAndIANAZone = combineExtractors(
    extractISOTime,
    extractISOOffset,
    extractIANAZone
  );

  function parseSQL(s) {
    return parse$1(
      s,
      [sqlYmdWithTimeExtensionRegex, extractISOYmdTimeAndOffset],
      [sqlTimeCombinedRegex, extractISOTimeOffsetAndIANAZone]
    );
  }

  const INVALID$3 = "Invalid Duration";

  // unit conversion constants
  const lowOrderMatrix = {
      weeks: {
        days: 7,
        hours: 7 * 24,
        minutes: 7 * 24 * 60,
        seconds: 7 * 24 * 60 * 60,
        milliseconds: 7 * 24 * 60 * 60 * 1000,
      },
      days: {
        hours: 24,
        minutes: 24 * 60,
        seconds: 24 * 60 * 60,
        milliseconds: 24 * 60 * 60 * 1000,
      },
      hours: { minutes: 60, seconds: 60 * 60, milliseconds: 60 * 60 * 1000 },
      minutes: { seconds: 60, milliseconds: 60 * 1000 },
      seconds: { milliseconds: 1000 },
    },
    casualMatrix = {
      years: {
        quarters: 4,
        months: 12,
        weeks: 52,
        days: 365,
        hours: 365 * 24,
        minutes: 365 * 24 * 60,
        seconds: 365 * 24 * 60 * 60,
        milliseconds: 365 * 24 * 60 * 60 * 1000,
      },
      quarters: {
        months: 3,
        weeks: 13,
        days: 91,
        hours: 91 * 24,
        minutes: 91 * 24 * 60,
        seconds: 91 * 24 * 60 * 60,
        milliseconds: 91 * 24 * 60 * 60 * 1000,
      },
      months: {
        weeks: 4,
        days: 30,
        hours: 30 * 24,
        minutes: 30 * 24 * 60,
        seconds: 30 * 24 * 60 * 60,
        milliseconds: 30 * 24 * 60 * 60 * 1000,
      },

      ...lowOrderMatrix,
    },
    daysInYearAccurate = 146097.0 / 400,
    daysInMonthAccurate = 146097.0 / 4800,
    accurateMatrix = {
      years: {
        quarters: 4,
        months: 12,
        weeks: daysInYearAccurate / 7,
        days: daysInYearAccurate,
        hours: daysInYearAccurate * 24,
        minutes: daysInYearAccurate * 24 * 60,
        seconds: daysInYearAccurate * 24 * 60 * 60,
        milliseconds: daysInYearAccurate * 24 * 60 * 60 * 1000,
      },
      quarters: {
        months: 3,
        weeks: daysInYearAccurate / 28,
        days: daysInYearAccurate / 4,
        hours: (daysInYearAccurate * 24) / 4,
        minutes: (daysInYearAccurate * 24 * 60) / 4,
        seconds: (daysInYearAccurate * 24 * 60 * 60) / 4,
        milliseconds: (daysInYearAccurate * 24 * 60 * 60 * 1000) / 4,
      },
      months: {
        weeks: daysInMonthAccurate / 7,
        days: daysInMonthAccurate,
        hours: daysInMonthAccurate * 24,
        minutes: daysInMonthAccurate * 24 * 60,
        seconds: daysInMonthAccurate * 24 * 60 * 60,
        milliseconds: daysInMonthAccurate * 24 * 60 * 60 * 1000,
      },
      ...lowOrderMatrix,
    };

  // units ordered by size
  const orderedUnits$1 = [
    "years",
    "quarters",
    "months",
    "weeks",
    "days",
    "hours",
    "minutes",
    "seconds",
    "milliseconds",
  ];

  const reverseUnits = orderedUnits$1.slice(0).reverse();

  // clone really means "create another instance just like this one, but with these changes"
  function clone$2(dur, alts, clear = false) {
    // deep merge for vals
    const conf = {
      values: clear ? alts.values : { ...dur.values, ...(alts.values || {}) },
      loc: dur.loc.clone(alts.loc),
      conversionAccuracy: alts.conversionAccuracy || dur.conversionAccuracy,
      matrix: alts.matrix || dur.matrix,
    };
    return new Duration(conf);
  }

  function antiTrunc(n) {
    return n < 0 ? Math.floor(n) : Math.ceil(n);
  }

  // NB: mutates parameters
  function convert(matrix, fromMap, fromUnit, toMap, toUnit) {
    const conv = matrix[toUnit][fromUnit],
      raw = fromMap[fromUnit] / conv,
      sameSign = Math.sign(raw) === Math.sign(toMap[toUnit]),
      // ok, so this is wild, but see the matrix in the tests
      added =
        !sameSign && toMap[toUnit] !== 0 && Math.abs(raw) <= 1 ? antiTrunc(raw) : Math.trunc(raw);
    toMap[toUnit] += added;
    fromMap[fromUnit] -= added * conv;
  }

  // NB: mutates parameters
  function normalizeValues(matrix, vals) {
    reverseUnits.reduce((previous, current) => {
      if (!isUndefined(vals[current])) {
        if (previous) {
          convert(matrix, vals, previous, vals, current);
        }
        return current;
      } else {
        return previous;
      }
    }, null);
  }

  /**
   * A Duration object represents a period of time, like "2 months" or "1 day, 1 hour". Conceptually, it's just a map of units to their quantities, accompanied by some additional configuration and methods for creating, parsing, interrogating, transforming, and formatting them. They can be used on their own or in conjunction with other Luxon types; for example, you can use {@link DateTime#plus} to add a Duration object to a DateTime, producing another DateTime.
   *
   * Here is a brief overview of commonly used methods and getters in Duration:
   *
   * * **Creation** To create a Duration, use {@link Duration.fromMillis}, {@link Duration.fromObject}, or {@link Duration.fromISO}.
   * * **Unit values** See the {@link Duration#years}, {@link Duration#months}, {@link Duration#weeks}, {@link Duration#days}, {@link Duration#hours}, {@link Duration#minutes}, {@link Duration#seconds}, {@link Duration#milliseconds} accessors.
   * * **Configuration** See  {@link Duration#locale} and {@link Duration#numberingSystem} accessors.
   * * **Transformation** To create new Durations out of old ones use {@link Duration#plus}, {@link Duration#minus}, {@link Duration#normalize}, {@link Duration#set}, {@link Duration#reconfigure}, {@link Duration#shiftTo}, and {@link Duration#negate}.
   * * **Output** To convert the Duration into other representations, see {@link Duration#as}, {@link Duration#toISO}, {@link Duration#toFormat}, and {@link Duration#toJSON}
   *
   * There's are more methods documented below. In addition, for more information on subtler topics like internationalization and validity, see the external documentation.
   */
  class Duration {
    /**
     * @private
     */
    constructor(config) {
      const accurate = config.conversionAccuracy === "longterm" || false;
      let matrix = accurate ? accurateMatrix : casualMatrix;

      if (config.matrix) {
        matrix = config.matrix;
      }

      /**
       * @access private
       */
      this.values = config.values;
      /**
       * @access private
       */
      this.loc = config.loc || Locale.create();
      /**
       * @access private
       */
      this.conversionAccuracy = accurate ? "longterm" : "casual";
      /**
       * @access private
       */
      this.invalid = config.invalid || null;
      /**
       * @access private
       */
      this.matrix = matrix;
      /**
       * @access private
       */
      this.isLuxonDuration = true;
    }

    /**
     * Create Duration from a number of milliseconds.
     * @param {number} count of milliseconds
     * @param {Object} opts - options for parsing
     * @param {string} [opts.locale='en-US'] - the locale to use
     * @param {string} opts.numberingSystem - the numbering system to use
     * @param {string} [opts.conversionAccuracy='casual'] - the conversion system to use
     * @return {Duration}
     */
    static fromMillis(count, opts) {
      return Duration.fromObject({ milliseconds: count }, opts);
    }

    /**
     * Create a Duration from a JavaScript object with keys like 'years' and 'hours'.
     * If this object is empty then a zero milliseconds duration is returned.
     * @param {Object} obj - the object to create the DateTime from
     * @param {number} obj.years
     * @param {number} obj.quarters
     * @param {number} obj.months
     * @param {number} obj.weeks
     * @param {number} obj.days
     * @param {number} obj.hours
     * @param {number} obj.minutes
     * @param {number} obj.seconds
     * @param {number} obj.milliseconds
     * @param {Object} [opts=[]] - options for creating this Duration
     * @param {string} [opts.locale='en-US'] - the locale to use
     * @param {string} opts.numberingSystem - the numbering system to use
     * @param {string} [opts.conversionAccuracy='casual'] - the preset conversion system to use
     * @param {string} [opts.matrix=Object] - the custom conversion system to use
     * @return {Duration}
     */
    static fromObject(obj, opts = {}) {
      if (obj == null || typeof obj !== "object") {
        throw new InvalidArgumentError(
          `Duration.fromObject: argument expected to be an object, got ${
          obj === null ? "null" : typeof obj
        }`
        );
      }

      return new Duration({
        values: normalizeObject(obj, Duration.normalizeUnit),
        loc: Locale.fromObject(opts),
        conversionAccuracy: opts.conversionAccuracy,
        matrix: opts.matrix,
      });
    }

    /**
     * Create a Duration from DurationLike.
     *
     * @param {Object | number | Duration} durationLike
     * One of:
     * - object with keys like 'years' and 'hours'.
     * - number representing milliseconds
     * - Duration instance
     * @return {Duration}
     */
    static fromDurationLike(durationLike) {
      if (isNumber$1(durationLike)) {
        return Duration.fromMillis(durationLike);
      } else if (Duration.isDuration(durationLike)) {
        return durationLike;
      } else if (typeof durationLike === "object") {
        return Duration.fromObject(durationLike);
      } else {
        throw new InvalidArgumentError(
          `Unknown duration argument ${durationLike} of type ${typeof durationLike}`
        );
      }
    }

    /**
     * Create a Duration from an ISO 8601 duration string.
     * @param {string} text - text to parse
     * @param {Object} opts - options for parsing
     * @param {string} [opts.locale='en-US'] - the locale to use
     * @param {string} opts.numberingSystem - the numbering system to use
     * @param {string} [opts.conversionAccuracy='casual'] - the preset conversion system to use
     * @param {string} [opts.matrix=Object] - the preset conversion system to use
     * @see https://en.wikipedia.org/wiki/ISO_8601#Durations
     * @example Duration.fromISO('P3Y6M1W4DT12H30M5S').toObject() //=> { years: 3, months: 6, weeks: 1, days: 4, hours: 12, minutes: 30, seconds: 5 }
     * @example Duration.fromISO('PT23H').toObject() //=> { hours: 23 }
     * @example Duration.fromISO('P5Y3M').toObject() //=> { years: 5, months: 3 }
     * @return {Duration}
     */
    static fromISO(text, opts) {
      const [parsed] = parseISODuration(text);
      if (parsed) {
        return Duration.fromObject(parsed, opts);
      } else {
        return Duration.invalid("unparsable", `the input "${text}" can't be parsed as ISO 8601`);
      }
    }

    /**
     * Create a Duration from an ISO 8601 time string.
     * @param {string} text - text to parse
     * @param {Object} opts - options for parsing
     * @param {string} [opts.locale='en-US'] - the locale to use
     * @param {string} opts.numberingSystem - the numbering system to use
     * @param {string} [opts.conversionAccuracy='casual'] - the preset conversion system to use
     * @param {string} [opts.matrix=Object] - the conversion system to use
     * @see https://en.wikipedia.org/wiki/ISO_8601#Times
     * @example Duration.fromISOTime('11:22:33.444').toObject() //=> { hours: 11, minutes: 22, seconds: 33, milliseconds: 444 }
     * @example Duration.fromISOTime('11:00').toObject() //=> { hours: 11, minutes: 0, seconds: 0 }
     * @example Duration.fromISOTime('T11:00').toObject() //=> { hours: 11, minutes: 0, seconds: 0 }
     * @example Duration.fromISOTime('1100').toObject() //=> { hours: 11, minutes: 0, seconds: 0 }
     * @example Duration.fromISOTime('T1100').toObject() //=> { hours: 11, minutes: 0, seconds: 0 }
     * @return {Duration}
     */
    static fromISOTime(text, opts) {
      const [parsed] = parseISOTimeOnly(text);
      if (parsed) {
        return Duration.fromObject(parsed, opts);
      } else {
        return Duration.invalid("unparsable", `the input "${text}" can't be parsed as ISO 8601`);
      }
    }

    /**
     * Create an invalid Duration.
     * @param {string} reason - simple string of why this datetime is invalid. Should not contain parameters or anything else data-dependent
     * @param {string} [explanation=null] - longer explanation, may include parameters and other useful debugging information
     * @return {Duration}
     */
    static invalid(reason, explanation = null) {
      if (!reason) {
        throw new InvalidArgumentError("need to specify a reason the Duration is invalid");
      }

      const invalid = reason instanceof Invalid ? reason : new Invalid(reason, explanation);

      if (Settings.throwOnInvalid) {
        throw new InvalidDurationError(invalid);
      } else {
        return new Duration({ invalid });
      }
    }

    /**
     * @private
     */
    static normalizeUnit(unit) {
      const normalized = {
        year: "years",
        years: "years",
        quarter: "quarters",
        quarters: "quarters",
        month: "months",
        months: "months",
        week: "weeks",
        weeks: "weeks",
        day: "days",
        days: "days",
        hour: "hours",
        hours: "hours",
        minute: "minutes",
        minutes: "minutes",
        second: "seconds",
        seconds: "seconds",
        millisecond: "milliseconds",
        milliseconds: "milliseconds",
      }[unit ? unit.toLowerCase() : unit];

      if (!normalized) throw new InvalidUnitError(unit);

      return normalized;
    }

    /**
     * Check if an object is a Duration. Works across context boundaries
     * @param {object} o
     * @return {boolean}
     */
    static isDuration(o) {
      return (o && o.isLuxonDuration) || false;
    }

    /**
     * Get  the locale of a Duration, such 'en-GB'
     * @type {string}
     */
    get locale() {
      return this.isValid ? this.loc.locale : null;
    }

    /**
     * Get the numbering system of a Duration, such 'beng'. The numbering system is used when formatting the Duration
     *
     * @type {string}
     */
    get numberingSystem() {
      return this.isValid ? this.loc.numberingSystem : null;
    }

    /**
     * Returns a string representation of this Duration formatted according to the specified format string. You may use these tokens:
     * * `S` for milliseconds
     * * `s` for seconds
     * * `m` for minutes
     * * `h` for hours
     * * `d` for days
     * * `w` for weeks
     * * `M` for months
     * * `y` for years
     * Notes:
     * * Add padding by repeating the token, e.g. "yy" pads the years to two digits, "hhhh" pads the hours out to four digits
     * * Tokens can be escaped by wrapping with single quotes.
     * * The duration will be converted to the set of units in the format string using {@link Duration#shiftTo} and the Durations's conversion accuracy setting.
     * @param {string} fmt - the format string
     * @param {Object} opts - options
     * @param {boolean} [opts.floor=true] - floor numerical values
     * @example Duration.fromObject({ years: 1, days: 6, seconds: 2 }).toFormat("y d s") //=> "1 6 2"
     * @example Duration.fromObject({ years: 1, days: 6, seconds: 2 }).toFormat("yy dd sss") //=> "01 06 002"
     * @example Duration.fromObject({ years: 1, days: 6, seconds: 2 }).toFormat("M S") //=> "12 518402000"
     * @return {string}
     */
    toFormat(fmt, opts = {}) {
      // reverse-compat since 1.2; we always round down now, never up, and we do it by default
      const fmtOpts = {
        ...opts,
        floor: opts.round !== false && opts.floor !== false,
      };
      return this.isValid
        ? Formatter.create(this.loc, fmtOpts).formatDurationFromString(this, fmt)
        : INVALID$3;
    }

    /**
     * Returns a string representation of a Duration with all units included.
     * To modify its behavior use the `listStyle` and any Intl.NumberFormat option, though `unitDisplay` is especially relevant.
     * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat
     * @param opts - On option object to override the formatting. Accepts the same keys as the options parameter of the native `Int.NumberFormat` constructor, as well as `listStyle`.
     * @example
     * ```js
     * var dur = Duration.fromObject({ days: 1, hours: 5, minutes: 6 })
     * dur.toHuman() //=> '1 day, 5 hours, 6 minutes'
     * dur.toHuman({ listStyle: "long" }) //=> '1 day, 5 hours, and 6 minutes'
     * dur.toHuman({ unitDisplay: "short" }) //=> '1 day, 5 hr, 6 min'
     * ```
     */
    toHuman(opts = {}) {
      const l = orderedUnits$1
        .map((unit) => {
          const val = this.values[unit];
          if (isUndefined(val)) {
            return null;
          }
          return this.loc
            .numberFormatter({ style: "unit", unitDisplay: "long", ...opts, unit: unit.slice(0, -1) })
            .format(val);
        })
        .filter((n) => n);

      return this.loc
        .listFormatter({ type: "conjunction", style: opts.listStyle || "narrow", ...opts })
        .format(l);
    }

    /**
     * Returns a JavaScript object with this Duration's values.
     * @example Duration.fromObject({ years: 1, days: 6, seconds: 2 }).toObject() //=> { years: 1, days: 6, seconds: 2 }
     * @return {Object}
     */
    toObject() {
      if (!this.isValid) return {};
      return { ...this.values };
    }

    /**
     * Returns an ISO 8601-compliant string representation of this Duration.
     * @see https://en.wikipedia.org/wiki/ISO_8601#Durations
     * @example Duration.fromObject({ years: 3, seconds: 45 }).toISO() //=> 'P3YT45S'
     * @example Duration.fromObject({ months: 4, seconds: 45 }).toISO() //=> 'P4MT45S'
     * @example Duration.fromObject({ months: 5 }).toISO() //=> 'P5M'
     * @example Duration.fromObject({ minutes: 5 }).toISO() //=> 'PT5M'
     * @example Duration.fromObject({ milliseconds: 6 }).toISO() //=> 'PT0.006S'
     * @return {string}
     */
    toISO() {
      // we could use the formatter, but this is an easier way to get the minimum string
      if (!this.isValid) return null;

      let s = "P";
      if (this.years !== 0) s += this.years + "Y";
      if (this.months !== 0 || this.quarters !== 0) s += this.months + this.quarters * 3 + "M";
      if (this.weeks !== 0) s += this.weeks + "W";
      if (this.days !== 0) s += this.days + "D";
      if (this.hours !== 0 || this.minutes !== 0 || this.seconds !== 0 || this.milliseconds !== 0)
        s += "T";
      if (this.hours !== 0) s += this.hours + "H";
      if (this.minutes !== 0) s += this.minutes + "M";
      if (this.seconds !== 0 || this.milliseconds !== 0)
        // this will handle "floating point madness" by removing extra decimal places
        // https://stackoverflow.com/questions/588004/is-floating-point-math-broken
        s += roundTo(this.seconds + this.milliseconds / 1000, 3) + "S";
      if (s === "P") s += "T0S";
      return s;
    }

    /**
     * Returns an ISO 8601-compliant string representation of this Duration, formatted as a time of day.
     * Note that this will return null if the duration is invalid, negative, or equal to or greater than 24 hours.
     * @see https://en.wikipedia.org/wiki/ISO_8601#Times
     * @param {Object} opts - options
     * @param {boolean} [opts.suppressMilliseconds=false] - exclude milliseconds from the format if they're 0
     * @param {boolean} [opts.suppressSeconds=false] - exclude seconds from the format if they're 0
     * @param {boolean} [opts.includePrefix=false] - include the `T` prefix
     * @param {string} [opts.format='extended'] - choose between the basic and extended format
     * @example Duration.fromObject({ hours: 11 }).toISOTime() //=> '11:00:00.000'
     * @example Duration.fromObject({ hours: 11 }).toISOTime({ suppressMilliseconds: true }) //=> '11:00:00'
     * @example Duration.fromObject({ hours: 11 }).toISOTime({ suppressSeconds: true }) //=> '11:00'
     * @example Duration.fromObject({ hours: 11 }).toISOTime({ includePrefix: true }) //=> 'T11:00:00.000'
     * @example Duration.fromObject({ hours: 11 }).toISOTime({ format: 'basic' }) //=> '110000.000'
     * @return {string}
     */
    toISOTime(opts = {}) {
      if (!this.isValid) return null;

      const millis = this.toMillis();
      if (millis < 0 || millis >= 86400000) return null;

      opts = {
        suppressMilliseconds: false,
        suppressSeconds: false,
        includePrefix: false,
        format: "extended",
        ...opts,
      };

      const value = this.shiftTo("hours", "minutes", "seconds", "milliseconds");

      let fmt = opts.format === "basic" ? "hhmm" : "hh:mm";

      if (!opts.suppressSeconds || value.seconds !== 0 || value.milliseconds !== 0) {
        fmt += opts.format === "basic" ? "ss" : ":ss";
        if (!opts.suppressMilliseconds || value.milliseconds !== 0) {
          fmt += ".SSS";
        }
      }

      let str = value.toFormat(fmt);

      if (opts.includePrefix) {
        str = "T" + str;
      }

      return str;
    }

    /**
     * Returns an ISO 8601 representation of this Duration appropriate for use in JSON.
     * @return {string}
     */
    toJSON() {
      return this.toISO();
    }

    /**
     * Returns an ISO 8601 representation of this Duration appropriate for use in debugging.
     * @return {string}
     */
    toString() {
      return this.toISO();
    }

    /**
     * Returns an milliseconds value of this Duration.
     * @return {number}
     */
    toMillis() {
      return this.as("milliseconds");
    }

    /**
     * Returns an milliseconds value of this Duration. Alias of {@link toMillis}
     * @return {number}
     */
    valueOf() {
      return this.toMillis();
    }

    /**
     * Make this Duration longer by the specified amount. Return a newly-constructed Duration.
     * @param {Duration|Object|number} duration - The amount to add. Either a Luxon Duration, a number of milliseconds, the object argument to Duration.fromObject()
     * @return {Duration}
     */
    plus(duration) {
      if (!this.isValid) return this;

      const dur = Duration.fromDurationLike(duration),
        result = {};

      for (const k of orderedUnits$1) {
        if (hasOwnProperty(dur.values, k) || hasOwnProperty(this.values, k)) {
          result[k] = dur.get(k) + this.get(k);
        }
      }

      return clone$2(this, { values: result }, true);
    }

    /**
     * Make this Duration shorter by the specified amount. Return a newly-constructed Duration.
     * @param {Duration|Object|number} duration - The amount to subtract. Either a Luxon Duration, a number of milliseconds, the object argument to Duration.fromObject()
     * @return {Duration}
     */
    minus(duration) {
      if (!this.isValid) return this;

      const dur = Duration.fromDurationLike(duration);
      return this.plus(dur.negate());
    }

    /**
     * Scale this Duration by the specified amount. Return a newly-constructed Duration.
     * @param {function} fn - The function to apply to each unit. Arity is 1 or 2: the value of the unit and, optionally, the unit name. Must return a number.
     * @example Duration.fromObject({ hours: 1, minutes: 30 }).mapUnits(x => x * 2) //=> { hours: 2, minutes: 60 }
     * @example Duration.fromObject({ hours: 1, minutes: 30 }).mapUnits((x, u) => u === "hours" ? x * 2 : x) //=> { hours: 2, minutes: 30 }
     * @return {Duration}
     */
    mapUnits(fn) {
      if (!this.isValid) return this;
      const result = {};
      for (const k of Object.keys(this.values)) {
        result[k] = asNumber(fn(this.values[k], k));
      }
      return clone$2(this, { values: result }, true);
    }

    /**
     * Get the value of unit.
     * @param {string} unit - a unit such as 'minute' or 'day'
     * @example Duration.fromObject({years: 2, days: 3}).get('years') //=> 2
     * @example Duration.fromObject({years: 2, days: 3}).get('months') //=> 0
     * @example Duration.fromObject({years: 2, days: 3}).get('days') //=> 3
     * @return {number}
     */
    get(unit) {
      return this[Duration.normalizeUnit(unit)];
    }

    /**
     * "Set" the values of specified units. Return a newly-constructed Duration.
     * @param {Object} values - a mapping of units to numbers
     * @example dur.set({ years: 2017 })
     * @example dur.set({ hours: 8, minutes: 30 })
     * @return {Duration}
     */
    set(values) {
      if (!this.isValid) return this;

      const mixed = { ...this.values, ...normalizeObject(values, Duration.normalizeUnit) };
      return clone$2(this, { values: mixed });
    }

    /**
     * "Set" the locale and/or numberingSystem.  Returns a newly-constructed Duration.
     * @example dur.reconfigure({ locale: 'en-GB' })
     * @return {Duration}
     */
    reconfigure({ locale, numberingSystem, conversionAccuracy, matrix } = {}) {
      const loc = this.loc.clone({ locale, numberingSystem });
      const opts = { loc, matrix, conversionAccuracy };
      return clone$2(this, opts);
    }

    /**
     * Return the length of the duration in the specified unit.
     * @param {string} unit - a unit such as 'minutes' or 'days'
     * @example Duration.fromObject({years: 1}).as('days') //=> 365
     * @example Duration.fromObject({years: 1}).as('months') //=> 12
     * @example Duration.fromObject({hours: 60}).as('days') //=> 2.5
     * @return {number}
     */
    as(unit) {
      return this.isValid ? this.shiftTo(unit).get(unit) : NaN;
    }

    /**
     * Reduce this Duration to its canonical representation in its current units.
     * @example Duration.fromObject({ years: 2, days: 5000 }).normalize().toObject() //=> { years: 15, days: 255 }
     * @example Duration.fromObject({ hours: 12, minutes: -45 }).normalize().toObject() //=> { hours: 11, minutes: 15 }
     * @return {Duration}
     */
    normalize() {
      if (!this.isValid) return this;
      const vals = this.toObject();
      normalizeValues(this.matrix, vals);
      return clone$2(this, { values: vals }, true);
    }

    /**
     * Convert this Duration into its representation in a different set of units.
     * @example Duration.fromObject({ hours: 1, seconds: 30 }).shiftTo('minutes', 'milliseconds').toObject() //=> { minutes: 60, milliseconds: 30000 }
     * @return {Duration}
     */
    shiftTo(...units) {
      if (!this.isValid) return this;

      if (units.length === 0) {
        return this;
      }

      units = units.map((u) => Duration.normalizeUnit(u));

      const built = {},
        accumulated = {},
        vals = this.toObject();
      let lastUnit;

      for (const k of orderedUnits$1) {
        if (units.indexOf(k) >= 0) {
          lastUnit = k;

          let own = 0;

          // anything we haven't boiled down yet should get boiled to this unit
          for (const ak in accumulated) {
            own += this.matrix[ak][k] * accumulated[ak];
            accumulated[ak] = 0;
          }

          // plus anything that's already in this unit
          if (isNumber$1(vals[k])) {
            own += vals[k];
          }

          const i = Math.trunc(own);
          built[k] = i;
          accumulated[k] = (own * 1000 - i * 1000) / 1000;

          // plus anything further down the chain that should be rolled up in to this
          for (const down in vals) {
            if (orderedUnits$1.indexOf(down) > orderedUnits$1.indexOf(k)) {
              convert(this.matrix, vals, down, built, k);
            }
          }
          // otherwise, keep it in the wings to boil it later
        } else if (isNumber$1(vals[k])) {
          accumulated[k] = vals[k];
        }
      }

      // anything leftover becomes the decimal for the last unit
      // lastUnit must be defined since units is not empty
      for (const key in accumulated) {
        if (accumulated[key] !== 0) {
          built[lastUnit] +=
            key === lastUnit ? accumulated[key] : accumulated[key] / this.matrix[lastUnit][key];
        }
      }

      return clone$2(this, { values: built }, true).normalize();
    }

    /**
     * Return the negative of this Duration.
     * @example Duration.fromObject({ hours: 1, seconds: 30 }).negate().toObject() //=> { hours: -1, seconds: -30 }
     * @return {Duration}
     */
    negate() {
      if (!this.isValid) return this;
      const negated = {};
      for (const k of Object.keys(this.values)) {
        negated[k] = this.values[k] === 0 ? 0 : -this.values[k];
      }
      return clone$2(this, { values: negated }, true);
    }

    /**
     * Get the years.
     * @type {number}
     */
    get years() {
      return this.isValid ? this.values.years || 0 : NaN;
    }

    /**
     * Get the quarters.
     * @type {number}
     */
    get quarters() {
      return this.isValid ? this.values.quarters || 0 : NaN;
    }

    /**
     * Get the months.
     * @type {number}
     */
    get months() {
      return this.isValid ? this.values.months || 0 : NaN;
    }

    /**
     * Get the weeks
     * @type {number}
     */
    get weeks() {
      return this.isValid ? this.values.weeks || 0 : NaN;
    }

    /**
     * Get the days.
     * @type {number}
     */
    get days() {
      return this.isValid ? this.values.days || 0 : NaN;
    }

    /**
     * Get the hours.
     * @type {number}
     */
    get hours() {
      return this.isValid ? this.values.hours || 0 : NaN;
    }

    /**
     * Get the minutes.
     * @type {number}
     */
    get minutes() {
      return this.isValid ? this.values.minutes || 0 : NaN;
    }

    /**
     * Get the seconds.
     * @return {number}
     */
    get seconds() {
      return this.isValid ? this.values.seconds || 0 : NaN;
    }

    /**
     * Get the milliseconds.
     * @return {number}
     */
    get milliseconds() {
      return this.isValid ? this.values.milliseconds || 0 : NaN;
    }

    /**
     * Returns whether the Duration is invalid. Invalid durations are returned by diff operations
     * on invalid DateTimes or Intervals.
     * @return {boolean}
     */
    get isValid() {
      return this.invalid === null;
    }

    /**
     * Returns an error code if this Duration became invalid, or null if the Duration is valid
     * @return {string}
     */
    get invalidReason() {
      return this.invalid ? this.invalid.reason : null;
    }

    /**
     * Returns an explanation of why this Duration became invalid, or null if the Duration is valid
     * @type {string}
     */
    get invalidExplanation() {
      return this.invalid ? this.invalid.explanation : null;
    }

    /**
     * Equality check
     * Two Durations are equal iff they have the same units and the same values for each unit.
     * @param {Duration} other
     * @return {boolean}
     */
    equals(other) {
      if (!this.isValid || !other.isValid) {
        return false;
      }

      if (!this.loc.equals(other.loc)) {
        return false;
      }

      function eq(v1, v2) {
        // Consider 0 and undefined as equal
        if (v1 === undefined || v1 === 0) return v2 === undefined || v2 === 0;
        return v1 === v2;
      }

      for (const u of orderedUnits$1) {
        if (!eq(this.values[u], other.values[u])) {
          return false;
        }
      }
      return true;
    }
  }

  const INVALID$2 = "Invalid Interval";

  // checks if the start is equal to or before the end
  function validateStartEnd(start, end) {
    if (!start || !start.isValid) {
      return Interval.invalid("missing or invalid start");
    } else if (!end || !end.isValid) {
      return Interval.invalid("missing or invalid end");
    } else if (end < start) {
      return Interval.invalid(
        "end before start",
        `The end of an interval must be after its start, but you had start=${start.toISO()} and end=${end.toISO()}`
      );
    } else {
      return null;
    }
  }

  /**
   * An Interval object represents a half-open interval of time, where each endpoint is a {@link DateTime}. Conceptually, it's a container for those two endpoints, accompanied by methods for creating, parsing, interrogating, comparing, transforming, and formatting them.
   *
   * Here is a brief overview of the most commonly used methods and getters in Interval:
   *
   * * **Creation** To create an Interval, use {@link Interval.fromDateTimes}, {@link Interval.after}, {@link Interval.before}, or {@link Interval.fromISO}.
   * * **Accessors** Use {@link Interval#start} and {@link Interval#end} to get the start and end.
   * * **Interrogation** To analyze the Interval, use {@link Interval#count}, {@link Interval#length}, {@link Interval#hasSame}, {@link Interval#contains}, {@link Interval#isAfter}, or {@link Interval#isBefore}.
   * * **Transformation** To create other Intervals out of this one, use {@link Interval#set}, {@link Interval#splitAt}, {@link Interval#splitBy}, {@link Interval#divideEqually}, {@link Interval.merge}, {@link Interval.xor}, {@link Interval#union}, {@link Interval#intersection}, or {@link Interval#difference}.
   * * **Comparison** To compare this Interval to another one, use {@link Interval#equals}, {@link Interval#overlaps}, {@link Interval#abutsStart}, {@link Interval#abutsEnd}, {@link Interval#engulfs}
   * * **Output** To convert the Interval into other representations, see {@link Interval#toString}, {@link Interval#toISO}, {@link Interval#toISODate}, {@link Interval#toISOTime}, {@link Interval#toFormat}, and {@link Interval#toDuration}.
   */
  class Interval {
    /**
     * @private
     */
    constructor(config) {
      /**
       * @access private
       */
      this.s = config.start;
      /**
       * @access private
       */
      this.e = config.end;
      /**
       * @access private
       */
      this.invalid = config.invalid || null;
      /**
       * @access private
       */
      this.isLuxonInterval = true;
    }

    /**
     * Create an invalid Interval.
     * @param {string} reason - simple string of why this Interval is invalid. Should not contain parameters or anything else data-dependent
     * @param {string} [explanation=null] - longer explanation, may include parameters and other useful debugging information
     * @return {Interval}
     */
    static invalid(reason, explanation = null) {
      if (!reason) {
        throw new InvalidArgumentError("need to specify a reason the Interval is invalid");
      }

      const invalid = reason instanceof Invalid ? reason : new Invalid(reason, explanation);

      if (Settings.throwOnInvalid) {
        throw new InvalidIntervalError(invalid);
      } else {
        return new Interval({ invalid });
      }
    }

    /**
     * Create an Interval from a start DateTime and an end DateTime. Inclusive of the start but not the end.
     * @param {DateTime|Date|Object} start
     * @param {DateTime|Date|Object} end
     * @return {Interval}
     */
    static fromDateTimes(start, end) {
      const builtStart = friendlyDateTime(start),
        builtEnd = friendlyDateTime(end);

      const validateError = validateStartEnd(builtStart, builtEnd);

      if (validateError == null) {
        return new Interval({
          start: builtStart,
          end: builtEnd,
        });
      } else {
        return validateError;
      }
    }

    /**
     * Create an Interval from a start DateTime and a Duration to extend to.
     * @param {DateTime|Date|Object} start
     * @param {Duration|Object|number} duration - the length of the Interval.
     * @return {Interval}
     */
    static after(start, duration) {
      const dur = Duration.fromDurationLike(duration),
        dt = friendlyDateTime(start);
      return Interval.fromDateTimes(dt, dt.plus(dur));
    }

    /**
     * Create an Interval from an end DateTime and a Duration to extend backwards to.
     * @param {DateTime|Date|Object} end
     * @param {Duration|Object|number} duration - the length of the Interval.
     * @return {Interval}
     */
    static before(end, duration) {
      const dur = Duration.fromDurationLike(duration),
        dt = friendlyDateTime(end);
      return Interval.fromDateTimes(dt.minus(dur), dt);
    }

    /**
     * Create an Interval from an ISO 8601 string.
     * Accepts `<start>/<end>`, `<start>/<duration>`, and `<duration>/<end>` formats.
     * @param {string} text - the ISO string to parse
     * @param {Object} [opts] - options to pass {@link DateTime#fromISO} and optionally {@link Duration#fromISO}
     * @see https://en.wikipedia.org/wiki/ISO_8601#Time_intervals
     * @return {Interval}
     */
    static fromISO(text, opts) {
      const [s, e] = (text || "").split("/", 2);
      if (s && e) {
        let start, startIsValid;
        try {
          start = DateTime.fromISO(s, opts);
          startIsValid = start.isValid;
        } catch (e) {
          startIsValid = false;
        }

        let end, endIsValid;
        try {
          end = DateTime.fromISO(e, opts);
          endIsValid = end.isValid;
        } catch (e) {
          endIsValid = false;
        }

        if (startIsValid && endIsValid) {
          return Interval.fromDateTimes(start, end);
        }

        if (startIsValid) {
          const dur = Duration.fromISO(e, opts);
          if (dur.isValid) {
            return Interval.after(start, dur);
          }
        } else if (endIsValid) {
          const dur = Duration.fromISO(s, opts);
          if (dur.isValid) {
            return Interval.before(end, dur);
          }
        }
      }
      return Interval.invalid("unparsable", `the input "${text}" can't be parsed as ISO 8601`);
    }

    /**
     * Check if an object is an Interval. Works across context boundaries
     * @param {object} o
     * @return {boolean}
     */
    static isInterval(o) {
      return (o && o.isLuxonInterval) || false;
    }

    /**
     * Returns the start of the Interval
     * @type {DateTime}
     */
    get start() {
      return this.isValid ? this.s : null;
    }

    /**
     * Returns the end of the Interval
     * @type {DateTime}
     */
    get end() {
      return this.isValid ? this.e : null;
    }

    /**
     * Returns whether this Interval's end is at least its start, meaning that the Interval isn't 'backwards'.
     * @type {boolean}
     */
    get isValid() {
      return this.invalidReason === null;
    }

    /**
     * Returns an error code if this Interval is invalid, or null if the Interval is valid
     * @type {string}
     */
    get invalidReason() {
      return this.invalid ? this.invalid.reason : null;
    }

    /**
     * Returns an explanation of why this Interval became invalid, or null if the Interval is valid
     * @type {string}
     */
    get invalidExplanation() {
      return this.invalid ? this.invalid.explanation : null;
    }

    /**
     * Returns the length of the Interval in the specified unit.
     * @param {string} unit - the unit (such as 'hours' or 'days') to return the length in.
     * @return {number}
     */
    length(unit = "milliseconds") {
      return this.isValid ? this.toDuration(...[unit]).get(unit) : NaN;
    }

    /**
     * Returns the count of minutes, hours, days, months, or years included in the Interval, even in part.
     * Unlike {@link Interval#length} this counts sections of the calendar, not periods of time, e.g. specifying 'day'
     * asks 'what dates are included in this interval?', not 'how many days long is this interval?'
     * @param {string} [unit='milliseconds'] - the unit of time to count.
     * @return {number}
     */
    count(unit = "milliseconds") {
      if (!this.isValid) return NaN;
      const start = this.start.startOf(unit),
        end = this.end.startOf(unit);
      return Math.floor(end.diff(start, unit).get(unit)) + 1;
    }

    /**
     * Returns whether this Interval's start and end are both in the same unit of time
     * @param {string} unit - the unit of time to check sameness on
     * @return {boolean}
     */
    hasSame(unit) {
      return this.isValid ? this.isEmpty() || this.e.minus(1).hasSame(this.s, unit) : false;
    }

    /**
     * Return whether this Interval has the same start and end DateTimes.
     * @return {boolean}
     */
    isEmpty() {
      return this.s.valueOf() === this.e.valueOf();
    }

    /**
     * Return whether this Interval's start is after the specified DateTime.
     * @param {DateTime} dateTime
     * @return {boolean}
     */
    isAfter(dateTime) {
      if (!this.isValid) return false;
      return this.s > dateTime;
    }

    /**
     * Return whether this Interval's end is before the specified DateTime.
     * @param {DateTime} dateTime
     * @return {boolean}
     */
    isBefore(dateTime) {
      if (!this.isValid) return false;
      return this.e <= dateTime;
    }

    /**
     * Return whether this Interval contains the specified DateTime.
     * @param {DateTime} dateTime
     * @return {boolean}
     */
    contains(dateTime) {
      if (!this.isValid) return false;
      return this.s <= dateTime && this.e > dateTime;
    }

    /**
     * "Sets" the start and/or end dates. Returns a newly-constructed Interval.
     * @param {Object} values - the values to set
     * @param {DateTime} values.start - the starting DateTime
     * @param {DateTime} values.end - the ending DateTime
     * @return {Interval}
     */
    set({ start, end } = {}) {
      if (!this.isValid) return this;
      return Interval.fromDateTimes(start || this.s, end || this.e);
    }

    /**
     * Split this Interval at each of the specified DateTimes
     * @param {...DateTime} dateTimes - the unit of time to count.
     * @return {Array}
     */
    splitAt(...dateTimes) {
      if (!this.isValid) return [];
      const sorted = dateTimes
          .map(friendlyDateTime)
          .filter((d) => this.contains(d))
          .sort(),
        results = [];
      let { s } = this,
        i = 0;

      while (s < this.e) {
        const added = sorted[i] || this.e,
          next = +added > +this.e ? this.e : added;
        results.push(Interval.fromDateTimes(s, next));
        s = next;
        i += 1;
      }

      return results;
    }

    /**
     * Split this Interval into smaller Intervals, each of the specified length.
     * Left over time is grouped into a smaller interval
     * @param {Duration|Object|number} duration - The length of each resulting interval.
     * @return {Array}
     */
    splitBy(duration) {
      const dur = Duration.fromDurationLike(duration);

      if (!this.isValid || !dur.isValid || dur.as("milliseconds") === 0) {
        return [];
      }

      let { s } = this,
        idx = 1,
        next;

      const results = [];
      while (s < this.e) {
        const added = this.start.plus(dur.mapUnits((x) => x * idx));
        next = +added > +this.e ? this.e : added;
        results.push(Interval.fromDateTimes(s, next));
        s = next;
        idx += 1;
      }

      return results;
    }

    /**
     * Split this Interval into the specified number of smaller intervals.
     * @param {number} numberOfParts - The number of Intervals to divide the Interval into.
     * @return {Array}
     */
    divideEqually(numberOfParts) {
      if (!this.isValid) return [];
      return this.splitBy(this.length() / numberOfParts).slice(0, numberOfParts);
    }

    /**
     * Return whether this Interval overlaps with the specified Interval
     * @param {Interval} other
     * @return {boolean}
     */
    overlaps(other) {
      return this.e > other.s && this.s < other.e;
    }

    /**
     * Return whether this Interval's end is adjacent to the specified Interval's start.
     * @param {Interval} other
     * @return {boolean}
     */
    abutsStart(other) {
      if (!this.isValid) return false;
      return +this.e === +other.s;
    }

    /**
     * Return whether this Interval's start is adjacent to the specified Interval's end.
     * @param {Interval} other
     * @return {boolean}
     */
    abutsEnd(other) {
      if (!this.isValid) return false;
      return +other.e === +this.s;
    }

    /**
     * Return whether this Interval engulfs the start and end of the specified Interval.
     * @param {Interval} other
     * @return {boolean}
     */
    engulfs(other) {
      if (!this.isValid) return false;
      return this.s <= other.s && this.e >= other.e;
    }

    /**
     * Return whether this Interval has the same start and end as the specified Interval.
     * @param {Interval} other
     * @return {boolean}
     */
    equals(other) {
      if (!this.isValid || !other.isValid) {
        return false;
      }

      return this.s.equals(other.s) && this.e.equals(other.e);
    }

    /**
     * Return an Interval representing the intersection of this Interval and the specified Interval.
     * Specifically, the resulting Interval has the maximum start time and the minimum end time of the two Intervals.
     * Returns null if the intersection is empty, meaning, the intervals don't intersect.
     * @param {Interval} other
     * @return {Interval}
     */
    intersection(other) {
      if (!this.isValid) return this;
      const s = this.s > other.s ? this.s : other.s,
        e = this.e < other.e ? this.e : other.e;

      if (s >= e) {
        return null;
      } else {
        return Interval.fromDateTimes(s, e);
      }
    }

    /**
     * Return an Interval representing the union of this Interval and the specified Interval.
     * Specifically, the resulting Interval has the minimum start time and the maximum end time of the two Intervals.
     * @param {Interval} other
     * @return {Interval}
     */
    union(other) {
      if (!this.isValid) return this;
      const s = this.s < other.s ? this.s : other.s,
        e = this.e > other.e ? this.e : other.e;
      return Interval.fromDateTimes(s, e);
    }

    /**
     * Merge an array of Intervals into a equivalent minimal set of Intervals.
     * Combines overlapping and adjacent Intervals.
     * @param {Array} intervals
     * @return {Array}
     */
    static merge(intervals) {
      const [found, final] = intervals
        .sort((a, b) => a.s - b.s)
        .reduce(
          ([sofar, current], item) => {
            if (!current) {
              return [sofar, item];
            } else if (current.overlaps(item) || current.abutsStart(item)) {
              return [sofar, current.union(item)];
            } else {
              return [sofar.concat([current]), item];
            }
          },
          [[], null]
        );
      if (final) {
        found.push(final);
      }
      return found;
    }

    /**
     * Return an array of Intervals representing the spans of time that only appear in one of the specified Intervals.
     * @param {Array} intervals
     * @return {Array}
     */
    static xor(intervals) {
      let start = null,
        currentCount = 0;
      const results = [],
        ends = intervals.map((i) => [
          { time: i.s, type: "s" },
          { time: i.e, type: "e" },
        ]),
        flattened = Array.prototype.concat(...ends),
        arr = flattened.sort((a, b) => a.time - b.time);

      for (const i of arr) {
        currentCount += i.type === "s" ? 1 : -1;

        if (currentCount === 1) {
          start = i.time;
        } else {
          if (start && +start !== +i.time) {
            results.push(Interval.fromDateTimes(start, i.time));
          }

          start = null;
        }
      }

      return Interval.merge(results);
    }

    /**
     * Return an Interval representing the span of time in this Interval that doesn't overlap with any of the specified Intervals.
     * @param {...Interval} intervals
     * @return {Array}
     */
    difference(...intervals) {
      return Interval.xor([this].concat(intervals))
        .map((i) => this.intersection(i))
        .filter((i) => i && !i.isEmpty());
    }

    /**
     * Returns a string representation of this Interval appropriate for debugging.
     * @return {string}
     */
    toString() {
      if (!this.isValid) return INVALID$2;
      return `[${this.s.toISO()} – ${this.e.toISO()})`;
    }

    /**
     * Returns an ISO 8601-compliant string representation of this Interval.
     * @see https://en.wikipedia.org/wiki/ISO_8601#Time_intervals
     * @param {Object} opts - The same options as {@link DateTime#toISO}
     * @return {string}
     */
    toISO(opts) {
      if (!this.isValid) return INVALID$2;
      return `${this.s.toISO(opts)}/${this.e.toISO(opts)}`;
    }

    /**
     * Returns an ISO 8601-compliant string representation of date of this Interval.
     * The time components are ignored.
     * @see https://en.wikipedia.org/wiki/ISO_8601#Time_intervals
     * @return {string}
     */
    toISODate() {
      if (!this.isValid) return INVALID$2;
      return `${this.s.toISODate()}/${this.e.toISODate()}`;
    }

    /**
     * Returns an ISO 8601-compliant string representation of time of this Interval.
     * The date components are ignored.
     * @see https://en.wikipedia.org/wiki/ISO_8601#Time_intervals
     * @param {Object} opts - The same options as {@link DateTime#toISO}
     * @return {string}
     */
    toISOTime(opts) {
      if (!this.isValid) return INVALID$2;
      return `${this.s.toISOTime(opts)}/${this.e.toISOTime(opts)}`;
    }

    /**
     * Returns a string representation of this Interval formatted according to the specified format string.
     * @param {string} dateFormat - the format string. This string formats the start and end time. See {@link DateTime#toFormat} for details.
     * @param {Object} opts - options
     * @param {string} [opts.separator =  ' – '] - a separator to place between the start and end representations
     * @return {string}
     */
    toFormat(dateFormat, { separator = " – " } = {}) {
      if (!this.isValid) return INVALID$2;
      return `${this.s.toFormat(dateFormat)}${separator}${this.e.toFormat(dateFormat)}`;
    }

    /**
     * Return a Duration representing the time spanned by this interval.
     * @param {string|string[]} [unit=['milliseconds']] - the unit or units (such as 'hours' or 'days') to include in the duration.
     * @param {Object} opts - options that affect the creation of the Duration
     * @param {string} [opts.conversionAccuracy='casual'] - the conversion system to use
     * @example Interval.fromDateTimes(dt1, dt2).toDuration().toObject() //=> { milliseconds: 88489257 }
     * @example Interval.fromDateTimes(dt1, dt2).toDuration('days').toObject() //=> { days: 1.0241812152777778 }
     * @example Interval.fromDateTimes(dt1, dt2).toDuration(['hours', 'minutes']).toObject() //=> { hours: 24, minutes: 34.82095 }
     * @example Interval.fromDateTimes(dt1, dt2).toDuration(['hours', 'minutes', 'seconds']).toObject() //=> { hours: 24, minutes: 34, seconds: 49.257 }
     * @example Interval.fromDateTimes(dt1, dt2).toDuration('seconds').toObject() //=> { seconds: 88489.257 }
     * @return {Duration}
     */
    toDuration(unit, opts) {
      if (!this.isValid) {
        return Duration.invalid(this.invalidReason);
      }
      return this.e.diff(this.s, unit, opts);
    }

    /**
     * Run mapFn on the interval start and end, returning a new Interval from the resulting DateTimes
     * @param {function} mapFn
     * @return {Interval}
     * @example Interval.fromDateTimes(dt1, dt2).mapEndpoints(endpoint => endpoint.toUTC())
     * @example Interval.fromDateTimes(dt1, dt2).mapEndpoints(endpoint => endpoint.plus({ hours: 2 }))
     */
    mapEndpoints(mapFn) {
      return Interval.fromDateTimes(mapFn(this.s), mapFn(this.e));
    }
  }

  /**
   * The Info class contains static methods for retrieving general time and date related data. For example, it has methods for finding out if a time zone has a DST, for listing the months in any supported locale, and for discovering which of Luxon features are available in the current environment.
   */
  class Info {
    /**
     * Return whether the specified zone contains a DST.
     * @param {string|Zone} [zone='local'] - Zone to check. Defaults to the environment's local zone.
     * @return {boolean}
     */
    static hasDST(zone = Settings.defaultZone) {
      const proto = DateTime.now().setZone(zone).set({ month: 12 });

      return !zone.isUniversal && proto.offset !== proto.set({ month: 6 }).offset;
    }

    /**
     * Return whether the specified zone is a valid IANA specifier.
     * @param {string} zone - Zone to check
     * @return {boolean}
     */
    static isValidIANAZone(zone) {
      return IANAZone.isValidZone(zone);
    }

    /**
     * Converts the input into a {@link Zone} instance.
     *
     * * If `input` is already a Zone instance, it is returned unchanged.
     * * If `input` is a string containing a valid time zone name, a Zone instance
     *   with that name is returned.
     * * If `input` is a string that doesn't refer to a known time zone, a Zone
     *   instance with {@link Zone#isValid} == false is returned.
     * * If `input is a number, a Zone instance with the specified fixed offset
     *   in minutes is returned.
     * * If `input` is `null` or `undefined`, the default zone is returned.
     * @param {string|Zone|number} [input] - the value to be converted
     * @return {Zone}
     */
    static normalizeZone(input) {
      return normalizeZone(input, Settings.defaultZone);
    }

    /**
     * Return an array of standalone month names.
     * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/DateTimeFormat
     * @param {string} [length='long'] - the length of the month representation, such as "numeric", "2-digit", "narrow", "short", "long"
     * @param {Object} opts - options
     * @param {string} [opts.locale] - the locale code
     * @param {string} [opts.numberingSystem=null] - the numbering system
     * @param {string} [opts.locObj=null] - an existing locale object to use
     * @param {string} [opts.outputCalendar='gregory'] - the calendar
     * @example Info.months()[0] //=> 'January'
     * @example Info.months('short')[0] //=> 'Jan'
     * @example Info.months('numeric')[0] //=> '1'
     * @example Info.months('short', { locale: 'fr-CA' } )[0] //=> 'janv.'
     * @example Info.months('numeric', { locale: 'ar' })[0] //=> '١'
     * @example Info.months('long', { outputCalendar: 'islamic' })[0] //=> 'Rabiʻ I'
     * @return {Array}
     */
    static months(
      length = "long",
      { locale = null, numberingSystem = null, locObj = null, outputCalendar = "gregory" } = {}
    ) {
      return (locObj || Locale.create(locale, numberingSystem, outputCalendar)).months(length);
    }

    /**
     * Return an array of format month names.
     * Format months differ from standalone months in that they're meant to appear next to the day of the month. In some languages, that
     * changes the string.
     * See {@link Info#months}
     * @param {string} [length='long'] - the length of the month representation, such as "numeric", "2-digit", "narrow", "short", "long"
     * @param {Object} opts - options
     * @param {string} [opts.locale] - the locale code
     * @param {string} [opts.numberingSystem=null] - the numbering system
     * @param {string} [opts.locObj=null] - an existing locale object to use
     * @param {string} [opts.outputCalendar='gregory'] - the calendar
     * @return {Array}
     */
    static monthsFormat(
      length = "long",
      { locale = null, numberingSystem = null, locObj = null, outputCalendar = "gregory" } = {}
    ) {
      return (locObj || Locale.create(locale, numberingSystem, outputCalendar)).months(length, true);
    }

    /**
     * Return an array of standalone week names.
     * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/DateTimeFormat
     * @param {string} [length='long'] - the length of the weekday representation, such as "narrow", "short", "long".
     * @param {Object} opts - options
     * @param {string} [opts.locale] - the locale code
     * @param {string} [opts.numberingSystem=null] - the numbering system
     * @param {string} [opts.locObj=null] - an existing locale object to use
     * @example Info.weekdays()[0] //=> 'Monday'
     * @example Info.weekdays('short')[0] //=> 'Mon'
     * @example Info.weekdays('short', { locale: 'fr-CA' })[0] //=> 'lun.'
     * @example Info.weekdays('short', { locale: 'ar' })[0] //=> 'الاثنين'
     * @return {Array}
     */
    static weekdays(length = "long", { locale = null, numberingSystem = null, locObj = null } = {}) {
      return (locObj || Locale.create(locale, numberingSystem, null)).weekdays(length);
    }

    /**
     * Return an array of format week names.
     * Format weekdays differ from standalone weekdays in that they're meant to appear next to more date information. In some languages, that
     * changes the string.
     * See {@link Info#weekdays}
     * @param {string} [length='long'] - the length of the month representation, such as "narrow", "short", "long".
     * @param {Object} opts - options
     * @param {string} [opts.locale=null] - the locale code
     * @param {string} [opts.numberingSystem=null] - the numbering system
     * @param {string} [opts.locObj=null] - an existing locale object to use
     * @return {Array}
     */
    static weekdaysFormat(
      length = "long",
      { locale = null, numberingSystem = null, locObj = null } = {}
    ) {
      return (locObj || Locale.create(locale, numberingSystem, null)).weekdays(length, true);
    }

    /**
     * Return an array of meridiems.
     * @param {Object} opts - options
     * @param {string} [opts.locale] - the locale code
     * @example Info.meridiems() //=> [ 'AM', 'PM' ]
     * @example Info.meridiems({ locale: 'my' }) //=> [ 'နံနက်', 'ညနေ' ]
     * @return {Array}
     */
    static meridiems({ locale = null } = {}) {
      return Locale.create(locale).meridiems();
    }

    /**
     * Return an array of eras, such as ['BC', 'AD']. The locale can be specified, but the calendar system is always Gregorian.
     * @param {string} [length='short'] - the length of the era representation, such as "short" or "long".
     * @param {Object} opts - options
     * @param {string} [opts.locale] - the locale code
     * @example Info.eras() //=> [ 'BC', 'AD' ]
     * @example Info.eras('long') //=> [ 'Before Christ', 'Anno Domini' ]
     * @example Info.eras('long', { locale: 'fr' }) //=> [ 'avant Jésus-Christ', 'après Jésus-Christ' ]
     * @return {Array}
     */
    static eras(length = "short", { locale = null } = {}) {
      return Locale.create(locale, null, "gregory").eras(length);
    }

    /**
     * Return the set of available features in this environment.
     * Some features of Luxon are not available in all environments. For example, on older browsers, relative time formatting support is not available. Use this function to figure out if that's the case.
     * Keys:
     * * `relative`: whether this environment supports relative time formatting
     * @example Info.features() //=> { relative: false }
     * @return {Object}
     */
    static features() {
      return { relative: hasRelative() };
    }
  }

  function dayDiff(earlier, later) {
    const utcDayStart = (dt) => dt.toUTC(0, { keepLocalTime: true }).startOf("day").valueOf(),
      ms = utcDayStart(later) - utcDayStart(earlier);
    return Math.floor(Duration.fromMillis(ms).as("days"));
  }

  function highOrderDiffs(cursor, later, units) {
    const differs = [
      ["years", (a, b) => b.year - a.year],
      ["quarters", (a, b) => b.quarter - a.quarter + (b.year - a.year) * 4],
      ["months", (a, b) => b.month - a.month + (b.year - a.year) * 12],
      [
        "weeks",
        (a, b) => {
          const days = dayDiff(a, b);
          return (days - (days % 7)) / 7;
        },
      ],
      ["days", dayDiff],
    ];

    const results = {};
    let lowestOrder, highWater;

    for (const [unit, differ] of differs) {
      if (units.indexOf(unit) >= 0) {
        lowestOrder = unit;

        let delta = differ(cursor, later);
        highWater = cursor.plus({ [unit]: delta });

        if (highWater > later) {
          cursor = cursor.plus({ [unit]: delta - 1 });
          delta -= 1;
        } else {
          cursor = highWater;
        }

        results[unit] = delta;
      }
    }

    return [cursor, results, highWater, lowestOrder];
  }

  function diff (earlier, later, units, opts) {
    let [cursor, results, highWater, lowestOrder] = highOrderDiffs(earlier, later, units);

    const remainingMillis = later - cursor;

    const lowerOrderUnits = units.filter(
      (u) => ["hours", "minutes", "seconds", "milliseconds"].indexOf(u) >= 0
    );

    if (lowerOrderUnits.length === 0) {
      if (highWater < later) {
        highWater = cursor.plus({ [lowestOrder]: 1 });
      }

      if (highWater !== cursor) {
        results[lowestOrder] = (results[lowestOrder] || 0) + remainingMillis / (highWater - cursor);
      }
    }

    const duration = Duration.fromObject(results, opts);

    if (lowerOrderUnits.length > 0) {
      return Duration.fromMillis(remainingMillis, opts)
        .shiftTo(...lowerOrderUnits)
        .plus(duration);
    } else {
      return duration;
    }
  }

  const numberingSystems = {
    arab: "[\u0660-\u0669]",
    arabext: "[\u06F0-\u06F9]",
    bali: "[\u1B50-\u1B59]",
    beng: "[\u09E6-\u09EF]",
    deva: "[\u0966-\u096F]",
    fullwide: "[\uFF10-\uFF19]",
    gujr: "[\u0AE6-\u0AEF]",
    hanidec: "[〇|一|二|三|四|五|六|七|八|九]",
    khmr: "[\u17E0-\u17E9]",
    knda: "[\u0CE6-\u0CEF]",
    laoo: "[\u0ED0-\u0ED9]",
    limb: "[\u1946-\u194F]",
    mlym: "[\u0D66-\u0D6F]",
    mong: "[\u1810-\u1819]",
    mymr: "[\u1040-\u1049]",
    orya: "[\u0B66-\u0B6F]",
    tamldec: "[\u0BE6-\u0BEF]",
    telu: "[\u0C66-\u0C6F]",
    thai: "[\u0E50-\u0E59]",
    tibt: "[\u0F20-\u0F29]",
    latn: "\\d",
  };

  const numberingSystemsUTF16 = {
    arab: [1632, 1641],
    arabext: [1776, 1785],
    bali: [6992, 7001],
    beng: [2534, 2543],
    deva: [2406, 2415],
    fullwide: [65296, 65303],
    gujr: [2790, 2799],
    khmr: [6112, 6121],
    knda: [3302, 3311],
    laoo: [3792, 3801],
    limb: [6470, 6479],
    mlym: [3430, 3439],
    mong: [6160, 6169],
    mymr: [4160, 4169],
    orya: [2918, 2927],
    tamldec: [3046, 3055],
    telu: [3174, 3183],
    thai: [3664, 3673],
    tibt: [3872, 3881],
  };

  const hanidecChars = numberingSystems.hanidec.replace(/[\[|\]]/g, "").split("");

  function parseDigits(str) {
    let value = parseInt(str, 10);
    if (isNaN(value)) {
      value = "";
      for (let i = 0; i < str.length; i++) {
        const code = str.charCodeAt(i);

        if (str[i].search(numberingSystems.hanidec) !== -1) {
          value += hanidecChars.indexOf(str[i]);
        } else {
          for (const key in numberingSystemsUTF16) {
            const [min, max] = numberingSystemsUTF16[key];
            if (code >= min && code <= max) {
              value += code - min;
            }
          }
        }
      }
      return parseInt(value, 10);
    } else {
      return value;
    }
  }

  function digitRegex({ numberingSystem }, append = "") {
    return new RegExp(`${numberingSystems[numberingSystem || "latn"]}${append}`);
  }

  const MISSING_FTP = "missing Intl.DateTimeFormat.formatToParts support";

  function intUnit(regex, post = (i) => i) {
    return { regex, deser: ([s]) => post(parseDigits(s)) };
  }

  const NBSP = String.fromCharCode(160);
  const spaceOrNBSP = `[ ${NBSP}]`;
  const spaceOrNBSPRegExp = new RegExp(spaceOrNBSP, "g");

  function fixListRegex(s) {
    // make dots optional and also make them literal
    // make space and non breakable space characters interchangeable
    return s.replace(/\./g, "\\.?").replace(spaceOrNBSPRegExp, spaceOrNBSP);
  }

  function stripInsensitivities(s) {
    return s
      .replace(/\./g, "") // ignore dots that were made optional
      .replace(spaceOrNBSPRegExp, " ") // interchange space and nbsp
      .toLowerCase();
  }

  function oneOf(strings, startIndex) {
    if (strings === null) {
      return null;
    } else {
      return {
        regex: RegExp(strings.map(fixListRegex).join("|")),
        deser: ([s]) =>
          strings.findIndex((i) => stripInsensitivities(s) === stripInsensitivities(i)) + startIndex,
      };
    }
  }

  function offset(regex, groups) {
    return { regex, deser: ([, h, m]) => signedOffset(h, m), groups };
  }

  function simple(regex) {
    return { regex, deser: ([s]) => s };
  }

  function escapeToken(value) {
    return value.replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g, "\\$&");
  }

  function unitForToken(token, loc) {
    const one = digitRegex(loc),
      two = digitRegex(loc, "{2}"),
      three = digitRegex(loc, "{3}"),
      four = digitRegex(loc, "{4}"),
      six = digitRegex(loc, "{6}"),
      oneOrTwo = digitRegex(loc, "{1,2}"),
      oneToThree = digitRegex(loc, "{1,3}"),
      oneToSix = digitRegex(loc, "{1,6}"),
      oneToNine = digitRegex(loc, "{1,9}"),
      twoToFour = digitRegex(loc, "{2,4}"),
      fourToSix = digitRegex(loc, "{4,6}"),
      literal = (t) => ({ regex: RegExp(escapeToken(t.val)), deser: ([s]) => s, literal: true }),
      unitate = (t) => {
        if (token.literal) {
          return literal(t);
        }
        switch (t.val) {
          // era
          case "G":
            return oneOf(loc.eras("short", false), 0);
          case "GG":
            return oneOf(loc.eras("long", false), 0);
          // years
          case "y":
            return intUnit(oneToSix);
          case "yy":
            return intUnit(twoToFour, untruncateYear);
          case "yyyy":
            return intUnit(four);
          case "yyyyy":
            return intUnit(fourToSix);
          case "yyyyyy":
            return intUnit(six);
          // months
          case "M":
            return intUnit(oneOrTwo);
          case "MM":
            return intUnit(two);
          case "MMM":
            return oneOf(loc.months("short", true, false), 1);
          case "MMMM":
            return oneOf(loc.months("long", true, false), 1);
          case "L":
            return intUnit(oneOrTwo);
          case "LL":
            return intUnit(two);
          case "LLL":
            return oneOf(loc.months("short", false, false), 1);
          case "LLLL":
            return oneOf(loc.months("long", false, false), 1);
          // dates
          case "d":
            return intUnit(oneOrTwo);
          case "dd":
            return intUnit(two);
          // ordinals
          case "o":
            return intUnit(oneToThree);
          case "ooo":
            return intUnit(three);
          // time
          case "HH":
            return intUnit(two);
          case "H":
            return intUnit(oneOrTwo);
          case "hh":
            return intUnit(two);
          case "h":
            return intUnit(oneOrTwo);
          case "mm":
            return intUnit(two);
          case "m":
            return intUnit(oneOrTwo);
          case "q":
            return intUnit(oneOrTwo);
          case "qq":
            return intUnit(two);
          case "s":
            return intUnit(oneOrTwo);
          case "ss":
            return intUnit(two);
          case "S":
            return intUnit(oneToThree);
          case "SSS":
            return intUnit(three);
          case "u":
            return simple(oneToNine);
          case "uu":
            return simple(oneOrTwo);
          case "uuu":
            return intUnit(one);
          // meridiem
          case "a":
            return oneOf(loc.meridiems(), 0);
          // weekYear (k)
          case "kkkk":
            return intUnit(four);
          case "kk":
            return intUnit(twoToFour, untruncateYear);
          // weekNumber (W)
          case "W":
            return intUnit(oneOrTwo);
          case "WW":
            return intUnit(two);
          // weekdays
          case "E":
          case "c":
            return intUnit(one);
          case "EEE":
            return oneOf(loc.weekdays("short", false, false), 1);
          case "EEEE":
            return oneOf(loc.weekdays("long", false, false), 1);
          case "ccc":
            return oneOf(loc.weekdays("short", true, false), 1);
          case "cccc":
            return oneOf(loc.weekdays("long", true, false), 1);
          // offset/zone
          case "Z":
          case "ZZ":
            return offset(new RegExp(`([+-]${oneOrTwo.source})(?::(${two.source}))?`), 2);
          case "ZZZ":
            return offset(new RegExp(`([+-]${oneOrTwo.source})(${two.source})?`), 2);
          // we don't support ZZZZ (PST) or ZZZZZ (Pacific Standard Time) in parsing
          // because we don't have any way to figure out what they are
          case "z":
            return simple(/[a-z_+-/]{1,256}?/i);
          default:
            return literal(t);
        }
      };

    const unit = unitate(token) || {
      invalidReason: MISSING_FTP,
    };

    unit.token = token;

    return unit;
  }

  const partTypeStyleToTokenVal = {
    year: {
      "2-digit": "yy",
      numeric: "yyyyy",
    },
    month: {
      numeric: "M",
      "2-digit": "MM",
      short: "MMM",
      long: "MMMM",
    },
    day: {
      numeric: "d",
      "2-digit": "dd",
    },
    weekday: {
      short: "EEE",
      long: "EEEE",
    },
    dayperiod: "a",
    dayPeriod: "a",
    hour: {
      numeric: "h",
      "2-digit": "hh",
    },
    minute: {
      numeric: "m",
      "2-digit": "mm",
    },
    second: {
      numeric: "s",
      "2-digit": "ss",
    },
    timeZoneName: {
      long: "ZZZZZ",
      short: "ZZZ",
    },
  };

  function tokenForPart(part, locale, formatOpts) {
    const { type, value } = part;

    if (type === "literal") {
      return {
        literal: true,
        val: value,
      };
    }

    const style = formatOpts[type];

    let val = partTypeStyleToTokenVal[type];
    if (typeof val === "object") {
      val = val[style];
    }

    if (val) {
      return {
        literal: false,
        val,
      };
    }

    return undefined;
  }

  function buildRegex(units) {
    const re = units.map((u) => u.regex).reduce((f, r) => `${f}(${r.source})`, "");
    return [`^${re}$`, units];
  }

  function match(input, regex, handlers) {
    const matches = input.match(regex);

    if (matches) {
      const all = {};
      let matchIndex = 1;
      for (const i in handlers) {
        if (hasOwnProperty(handlers, i)) {
          const h = handlers[i],
            groups = h.groups ? h.groups + 1 : 1;
          if (!h.literal && h.token) {
            all[h.token.val[0]] = h.deser(matches.slice(matchIndex, matchIndex + groups));
          }
          matchIndex += groups;
        }
      }
      return [matches, all];
    } else {
      return [matches, {}];
    }
  }

  function dateTimeFromMatches(matches) {
    const toField = (token) => {
      switch (token) {
        case "S":
          return "millisecond";
        case "s":
          return "second";
        case "m":
          return "minute";
        case "h":
        case "H":
          return "hour";
        case "d":
          return "day";
        case "o":
          return "ordinal";
        case "L":
        case "M":
          return "month";
        case "y":
          return "year";
        case "E":
        case "c":
          return "weekday";
        case "W":
          return "weekNumber";
        case "k":
          return "weekYear";
        case "q":
          return "quarter";
        default:
          return null;
      }
    };

    let zone = null;
    let specificOffset;
    if (!isUndefined(matches.z)) {
      zone = IANAZone.create(matches.z);
    }

    if (!isUndefined(matches.Z)) {
      if (!zone) {
        zone = new FixedOffsetZone(matches.Z);
      }
      specificOffset = matches.Z;
    }

    if (!isUndefined(matches.q)) {
      matches.M = (matches.q - 1) * 3 + 1;
    }

    if (!isUndefined(matches.h)) {
      if (matches.h < 12 && matches.a === 1) {
        matches.h += 12;
      } else if (matches.h === 12 && matches.a === 0) {
        matches.h = 0;
      }
    }

    if (matches.G === 0 && matches.y) {
      matches.y = -matches.y;
    }

    if (!isUndefined(matches.u)) {
      matches.S = parseMillis(matches.u);
    }

    const vals = Object.keys(matches).reduce((r, k) => {
      const f = toField(k);
      if (f) {
        r[f] = matches[k];
      }

      return r;
    }, {});

    return [vals, zone, specificOffset];
  }

  let dummyDateTimeCache = null;

  function getDummyDateTime() {
    if (!dummyDateTimeCache) {
      dummyDateTimeCache = DateTime.fromMillis(1555555555555);
    }

    return dummyDateTimeCache;
  }

  function maybeExpandMacroToken(token, locale) {
    if (token.literal) {
      return token;
    }

    const formatOpts = Formatter.macroTokenToFormatOpts(token.val);
    const tokens = formatOptsToTokens(formatOpts, locale);

    if (tokens == null || tokens.includes(undefined)) {
      return token;
    }

    return tokens;
  }

  function expandMacroTokens(tokens, locale) {
    return Array.prototype.concat(...tokens.map((t) => maybeExpandMacroToken(t, locale)));
  }

  /**
   * @private
   */

  function explainFromTokens(locale, input, format) {
    const tokens = expandMacroTokens(Formatter.parseFormat(format), locale),
      units = tokens.map((t) => unitForToken(t, locale)),
      disqualifyingUnit = units.find((t) => t.invalidReason);

    if (disqualifyingUnit) {
      return { input, tokens, invalidReason: disqualifyingUnit.invalidReason };
    } else {
      const [regexString, handlers] = buildRegex(units),
        regex = RegExp(regexString, "i"),
        [rawMatches, matches] = match(input, regex, handlers),
        [result, zone, specificOffset] = matches
          ? dateTimeFromMatches(matches)
          : [null, null, undefined];
      if (hasOwnProperty(matches, "a") && hasOwnProperty(matches, "H")) {
        throw new ConflictingSpecificationError(
          "Can't include meridiem when specifying 24-hour format"
        );
      }
      return { input, tokens, regex, rawMatches, matches, result, zone, specificOffset };
    }
  }

  function parseFromTokens(locale, input, format) {
    const { result, zone, specificOffset, invalidReason } = explainFromTokens(locale, input, format);
    return [result, zone, specificOffset, invalidReason];
  }

  function formatOptsToTokens(formatOpts, locale) {
    if (!formatOpts) {
      return null;
    }

    const formatter = Formatter.create(locale, formatOpts);
    const parts = formatter.formatDateTimeParts(getDummyDateTime());
    return parts.map((p) => tokenForPart(p, locale, formatOpts));
  }

  const nonLeapLadder = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334],
    leapLadder = [0, 31, 60, 91, 121, 152, 182, 213, 244, 274, 305, 335];

  function unitOutOfRange(unit, value) {
    return new Invalid(
      "unit out of range",
      `you specified ${value} (of type ${typeof value}) as a ${unit}, which is invalid`
    );
  }

  function dayOfWeek(year, month, day) {
    const d = new Date(Date.UTC(year, month - 1, day));

    if (year < 100 && year >= 0) {
      d.setUTCFullYear(d.getUTCFullYear() - 1900);
    }

    const js = d.getUTCDay();

    return js === 0 ? 7 : js;
  }

  function computeOrdinal(year, month, day) {
    return day + (isLeapYear(year) ? leapLadder : nonLeapLadder)[month - 1];
  }

  function uncomputeOrdinal(year, ordinal) {
    const table = isLeapYear(year) ? leapLadder : nonLeapLadder,
      month0 = table.findIndex((i) => i < ordinal),
      day = ordinal - table[month0];
    return { month: month0 + 1, day };
  }

  /**
   * @private
   */

  function gregorianToWeek(gregObj) {
    const { year, month, day } = gregObj,
      ordinal = computeOrdinal(year, month, day),
      weekday = dayOfWeek(year, month, day);

    let weekNumber = Math.floor((ordinal - weekday + 10) / 7),
      weekYear;

    if (weekNumber < 1) {
      weekYear = year - 1;
      weekNumber = weeksInWeekYear(weekYear);
    } else if (weekNumber > weeksInWeekYear(year)) {
      weekYear = year + 1;
      weekNumber = 1;
    } else {
      weekYear = year;
    }

    return { weekYear, weekNumber, weekday, ...timeObject(gregObj) };
  }

  function weekToGregorian(weekData) {
    const { weekYear, weekNumber, weekday } = weekData,
      weekdayOfJan4 = dayOfWeek(weekYear, 1, 4),
      yearInDays = daysInYear(weekYear);

    let ordinal = weekNumber * 7 + weekday - weekdayOfJan4 - 3,
      year;

    if (ordinal < 1) {
      year = weekYear - 1;
      ordinal += daysInYear(year);
    } else if (ordinal > yearInDays) {
      year = weekYear + 1;
      ordinal -= daysInYear(weekYear);
    } else {
      year = weekYear;
    }

    const { month, day } = uncomputeOrdinal(year, ordinal);
    return { year, month, day, ...timeObject(weekData) };
  }

  function gregorianToOrdinal(gregData) {
    const { year, month, day } = gregData;
    const ordinal = computeOrdinal(year, month, day);
    return { year, ordinal, ...timeObject(gregData) };
  }

  function ordinalToGregorian(ordinalData) {
    const { year, ordinal } = ordinalData;
    const { month, day } = uncomputeOrdinal(year, ordinal);
    return { year, month, day, ...timeObject(ordinalData) };
  }

  function hasInvalidWeekData(obj) {
    const validYear = isInteger(obj.weekYear),
      validWeek = integerBetween(obj.weekNumber, 1, weeksInWeekYear(obj.weekYear)),
      validWeekday = integerBetween(obj.weekday, 1, 7);

    if (!validYear) {
      return unitOutOfRange("weekYear", obj.weekYear);
    } else if (!validWeek) {
      return unitOutOfRange("week", obj.week);
    } else if (!validWeekday) {
      return unitOutOfRange("weekday", obj.weekday);
    } else return false;
  }

  function hasInvalidOrdinalData(obj) {
    const validYear = isInteger(obj.year),
      validOrdinal = integerBetween(obj.ordinal, 1, daysInYear(obj.year));

    if (!validYear) {
      return unitOutOfRange("year", obj.year);
    } else if (!validOrdinal) {
      return unitOutOfRange("ordinal", obj.ordinal);
    } else return false;
  }

  function hasInvalidGregorianData(obj) {
    const validYear = isInteger(obj.year),
      validMonth = integerBetween(obj.month, 1, 12),
      validDay = integerBetween(obj.day, 1, daysInMonth(obj.year, obj.month));

    if (!validYear) {
      return unitOutOfRange("year", obj.year);
    } else if (!validMonth) {
      return unitOutOfRange("month", obj.month);
    } else if (!validDay) {
      return unitOutOfRange("day", obj.day);
    } else return false;
  }

  function hasInvalidTimeData(obj) {
    const { hour, minute, second, millisecond } = obj;
    const validHour =
        integerBetween(hour, 0, 23) ||
        (hour === 24 && minute === 0 && second === 0 && millisecond === 0),
      validMinute = integerBetween(minute, 0, 59),
      validSecond = integerBetween(second, 0, 59),
      validMillisecond = integerBetween(millisecond, 0, 999);

    if (!validHour) {
      return unitOutOfRange("hour", hour);
    } else if (!validMinute) {
      return unitOutOfRange("minute", minute);
    } else if (!validSecond) {
      return unitOutOfRange("second", second);
    } else if (!validMillisecond) {
      return unitOutOfRange("millisecond", millisecond);
    } else return false;
  }

  const INVALID$1 = "Invalid DateTime";
  const MAX_DATE = 8.64e15;

  function unsupportedZone(zone) {
    return new Invalid("unsupported zone", `the zone "${zone.name}" is not supported`);
  }

  // we cache week data on the DT object and this intermediates the cache
  function possiblyCachedWeekData(dt) {
    if (dt.weekData === null) {
      dt.weekData = gregorianToWeek(dt.c);
    }
    return dt.weekData;
  }

  // clone really means, "make a new object with these modifications". all "setters" really use this
  // to create a new object while only changing some of the properties
  function clone$1(inst, alts) {
    const current = {
      ts: inst.ts,
      zone: inst.zone,
      c: inst.c,
      o: inst.o,
      loc: inst.loc,
      invalid: inst.invalid,
    };
    return new DateTime({ ...current, ...alts, old: current });
  }

  // find the right offset a given local time. The o input is our guess, which determines which
  // offset we'll pick in ambiguous cases (e.g. there are two 3 AMs b/c Fallback DST)
  function fixOffset(localTS, o, tz) {
    // Our UTC time is just a guess because our offset is just a guess
    let utcGuess = localTS - o * 60 * 1000;

    // Test whether the zone matches the offset for this ts
    const o2 = tz.offset(utcGuess);

    // If so, offset didn't change and we're done
    if (o === o2) {
      return [utcGuess, o];
    }

    // If not, change the ts by the difference in the offset
    utcGuess -= (o2 - o) * 60 * 1000;

    // If that gives us the local time we want, we're done
    const o3 = tz.offset(utcGuess);
    if (o2 === o3) {
      return [utcGuess, o2];
    }

    // If it's different, we're in a hole time. The offset has changed, but the we don't adjust the time
    return [localTS - Math.min(o2, o3) * 60 * 1000, Math.max(o2, o3)];
  }

  // convert an epoch timestamp into a calendar object with the given offset
  function tsToObj(ts, offset) {
    ts += offset * 60 * 1000;

    const d = new Date(ts);

    return {
      year: d.getUTCFullYear(),
      month: d.getUTCMonth() + 1,
      day: d.getUTCDate(),
      hour: d.getUTCHours(),
      minute: d.getUTCMinutes(),
      second: d.getUTCSeconds(),
      millisecond: d.getUTCMilliseconds(),
    };
  }

  // convert a calendar object to a epoch timestamp
  function objToTS(obj, offset, zone) {
    return fixOffset(objToLocalTS(obj), offset, zone);
  }

  // create a new DT instance by adding a duration, adjusting for DSTs
  function adjustTime(inst, dur) {
    const oPre = inst.o,
      year = inst.c.year + Math.trunc(dur.years),
      month = inst.c.month + Math.trunc(dur.months) + Math.trunc(dur.quarters) * 3,
      c = {
        ...inst.c,
        year,
        month,
        day:
          Math.min(inst.c.day, daysInMonth(year, month)) +
          Math.trunc(dur.days) +
          Math.trunc(dur.weeks) * 7,
      },
      millisToAdd = Duration.fromObject({
        years: dur.years - Math.trunc(dur.years),
        quarters: dur.quarters - Math.trunc(dur.quarters),
        months: dur.months - Math.trunc(dur.months),
        weeks: dur.weeks - Math.trunc(dur.weeks),
        days: dur.days - Math.trunc(dur.days),
        hours: dur.hours,
        minutes: dur.minutes,
        seconds: dur.seconds,
        milliseconds: dur.milliseconds,
      }).as("milliseconds"),
      localTS = objToLocalTS(c);

    let [ts, o] = fixOffset(localTS, oPre, inst.zone);

    if (millisToAdd !== 0) {
      ts += millisToAdd;
      // that could have changed the offset by going over a DST, but we want to keep the ts the same
      o = inst.zone.offset(ts);
    }

    return { ts, o };
  }

  // helper useful in turning the results of parsing into real dates
  // by handling the zone options
  function parseDataToDateTime(parsed, parsedZone, opts, format, text, specificOffset) {
    const { setZone, zone } = opts;
    if (parsed && Object.keys(parsed).length !== 0) {
      const interpretationZone = parsedZone || zone,
        inst = DateTime.fromObject(parsed, {
          ...opts,
          zone: interpretationZone,
          specificOffset,
        });
      return setZone ? inst : inst.setZone(zone);
    } else {
      return DateTime.invalid(
        new Invalid("unparsable", `the input "${text}" can't be parsed as ${format}`)
      );
    }
  }

  // if you want to output a technical format (e.g. RFC 2822), this helper
  // helps handle the details
  function toTechFormat(dt, format, allowZ = true) {
    return dt.isValid
      ? Formatter.create(Locale.create("en-US"), {
          allowZ,
          forceSimple: true,
        }).formatDateTimeFromString(dt, format)
      : null;
  }

  function toISODate(o, extended) {
    const longFormat = o.c.year > 9999 || o.c.year < 0;
    let c = "";
    if (longFormat && o.c.year >= 0) c += "+";
    c += padStart(o.c.year, longFormat ? 6 : 4);

    if (extended) {
      c += "-";
      c += padStart(o.c.month);
      c += "-";
      c += padStart(o.c.day);
    } else {
      c += padStart(o.c.month);
      c += padStart(o.c.day);
    }
    return c;
  }

  function toISOTime(
    o,
    extended,
    suppressSeconds,
    suppressMilliseconds,
    includeOffset,
    extendedZone
  ) {
    let c = padStart(o.c.hour);
    if (extended) {
      c += ":";
      c += padStart(o.c.minute);
      if (o.c.second !== 0 || !suppressSeconds) {
        c += ":";
      }
    } else {
      c += padStart(o.c.minute);
    }

    if (o.c.second !== 0 || !suppressSeconds) {
      c += padStart(o.c.second);

      if (o.c.millisecond !== 0 || !suppressMilliseconds) {
        c += ".";
        c += padStart(o.c.millisecond, 3);
      }
    }

    if (includeOffset) {
      if (o.isOffsetFixed && o.offset === 0 && !extendedZone) {
        c += "Z";
      } else if (o.o < 0) {
        c += "-";
        c += padStart(Math.trunc(-o.o / 60));
        c += ":";
        c += padStart(Math.trunc(-o.o % 60));
      } else {
        c += "+";
        c += padStart(Math.trunc(o.o / 60));
        c += ":";
        c += padStart(Math.trunc(o.o % 60));
      }
    }

    if (extendedZone) {
      c += "[" + o.zone.ianaName + "]";
    }
    return c;
  }

  // defaults for unspecified units in the supported calendars
  const defaultUnitValues = {
      month: 1,
      day: 1,
      hour: 0,
      minute: 0,
      second: 0,
      millisecond: 0,
    },
    defaultWeekUnitValues = {
      weekNumber: 1,
      weekday: 1,
      hour: 0,
      minute: 0,
      second: 0,
      millisecond: 0,
    },
    defaultOrdinalUnitValues = {
      ordinal: 1,
      hour: 0,
      minute: 0,
      second: 0,
      millisecond: 0,
    };

  // Units in the supported calendars, sorted by bigness
  const orderedUnits = ["year", "month", "day", "hour", "minute", "second", "millisecond"],
    orderedWeekUnits = [
      "weekYear",
      "weekNumber",
      "weekday",
      "hour",
      "minute",
      "second",
      "millisecond",
    ],
    orderedOrdinalUnits = ["year", "ordinal", "hour", "minute", "second", "millisecond"];

  // standardize case and plurality in units
  function normalizeUnit(unit) {
    const normalized = {
      year: "year",
      years: "year",
      month: "month",
      months: "month",
      day: "day",
      days: "day",
      hour: "hour",
      hours: "hour",
      minute: "minute",
      minutes: "minute",
      quarter: "quarter",
      quarters: "quarter",
      second: "second",
      seconds: "second",
      millisecond: "millisecond",
      milliseconds: "millisecond",
      weekday: "weekday",
      weekdays: "weekday",
      weeknumber: "weekNumber",
      weeksnumber: "weekNumber",
      weeknumbers: "weekNumber",
      weekyear: "weekYear",
      weekyears: "weekYear",
      ordinal: "ordinal",
    }[unit.toLowerCase()];

    if (!normalized) throw new InvalidUnitError(unit);

    return normalized;
  }

  // this is a dumbed down version of fromObject() that runs about 60% faster
  // but doesn't do any validation, makes a bunch of assumptions about what units
  // are present, and so on.
  function quickDT(obj, opts) {
    const zone = normalizeZone(opts.zone, Settings.defaultZone),
      loc = Locale.fromObject(opts),
      tsNow = Settings.now();

    let ts, o;

    // assume we have the higher-order units
    if (!isUndefined(obj.year)) {
      for (const u of orderedUnits) {
        if (isUndefined(obj[u])) {
          obj[u] = defaultUnitValues[u];
        }
      }

      const invalid = hasInvalidGregorianData(obj) || hasInvalidTimeData(obj);
      if (invalid) {
        return DateTime.invalid(invalid);
      }

      const offsetProvis = zone.offset(tsNow);
      [ts, o] = objToTS(obj, offsetProvis, zone);
    } else {
      ts = tsNow;
    }

    return new DateTime({ ts, zone, loc, o });
  }

  function diffRelative(start, end, opts) {
    const round = isUndefined(opts.round) ? true : opts.round,
      format = (c, unit) => {
        c = roundTo(c, round || opts.calendary ? 0 : 2, true);
        const formatter = end.loc.clone(opts).relFormatter(opts);
        return formatter.format(c, unit);
      },
      differ = (unit) => {
        if (opts.calendary) {
          if (!end.hasSame(start, unit)) {
            return end.startOf(unit).diff(start.startOf(unit), unit).get(unit);
          } else return 0;
        } else {
          return end.diff(start, unit).get(unit);
        }
      };

    if (opts.unit) {
      return format(differ(opts.unit), opts.unit);
    }

    for (const unit of opts.units) {
      const count = differ(unit);
      if (Math.abs(count) >= 1) {
        return format(count, unit);
      }
    }
    return format(start > end ? -0 : 0, opts.units[opts.units.length - 1]);
  }

  function lastOpts(argList) {
    let opts = {},
      args;
    if (argList.length > 0 && typeof argList[argList.length - 1] === "object") {
      opts = argList[argList.length - 1];
      args = Array.from(argList).slice(0, argList.length - 1);
    } else {
      args = Array.from(argList);
    }
    return [opts, args];
  }

  /**
   * A DateTime is an immutable data structure representing a specific date and time and accompanying methods. It contains class and instance methods for creating, parsing, interrogating, transforming, and formatting them.
   *
   * A DateTime comprises of:
   * * A timestamp. Each DateTime instance refers to a specific millisecond of the Unix epoch.
   * * A time zone. Each instance is considered in the context of a specific zone (by default the local system's zone).
   * * Configuration properties that effect how output strings are formatted, such as `locale`, `numberingSystem`, and `outputCalendar`.
   *
   * Here is a brief overview of the most commonly used functionality it provides:
   *
   * * **Creation**: To create a DateTime from its components, use one of its factory class methods: {@link DateTime.local}, {@link DateTime.utc}, and (most flexibly) {@link DateTime.fromObject}. To create one from a standard string format, use {@link DateTime.fromISO}, {@link DateTime.fromHTTP}, and {@link DateTime.fromRFC2822}. To create one from a custom string format, use {@link DateTime.fromFormat}. To create one from a native JS date, use {@link DateTime.fromJSDate}.
   * * **Gregorian calendar and time**: To examine the Gregorian properties of a DateTime individually (i.e as opposed to collectively through {@link DateTime#toObject}), use the {@link DateTime#year}, {@link DateTime#month},
   * {@link DateTime#day}, {@link DateTime#hour}, {@link DateTime#minute}, {@link DateTime#second}, {@link DateTime#millisecond} accessors.
   * * **Week calendar**: For ISO week calendar attributes, see the {@link DateTime#weekYear}, {@link DateTime#weekNumber}, and {@link DateTime#weekday} accessors.
   * * **Configuration** See the {@link DateTime#locale} and {@link DateTime#numberingSystem} accessors.
   * * **Transformation**: To transform the DateTime into other DateTimes, use {@link DateTime#set}, {@link DateTime#reconfigure}, {@link DateTime#setZone}, {@link DateTime#setLocale}, {@link DateTime.plus}, {@link DateTime#minus}, {@link DateTime#endOf}, {@link DateTime#startOf}, {@link DateTime#toUTC}, and {@link DateTime#toLocal}.
   * * **Output**: To convert the DateTime to other representations, use the {@link DateTime#toRelative}, {@link DateTime#toRelativeCalendar}, {@link DateTime#toJSON}, {@link DateTime#toISO}, {@link DateTime#toHTTP}, {@link DateTime#toObject}, {@link DateTime#toRFC2822}, {@link DateTime#toString}, {@link DateTime#toLocaleString}, {@link DateTime#toFormat}, {@link DateTime#toMillis} and {@link DateTime#toJSDate}.
   *
   * There's plenty others documented below. In addition, for more information on subtler topics like internationalization, time zones, alternative calendars, validity, and so on, see the external documentation.
   */
  class DateTime {
    /**
     * @access private
     */
    constructor(config) {
      const zone = config.zone || Settings.defaultZone;

      let invalid =
        config.invalid ||
        (Number.isNaN(config.ts) ? new Invalid("invalid input") : null) ||
        (!zone.isValid ? unsupportedZone(zone) : null);
      /**
       * @access private
       */
      this.ts = isUndefined(config.ts) ? Settings.now() : config.ts;

      let c = null,
        o = null;
      if (!invalid) {
        const unchanged = config.old && config.old.ts === this.ts && config.old.zone.equals(zone);

        if (unchanged) {
          [c, o] = [config.old.c, config.old.o];
        } else {
          const ot = zone.offset(this.ts);
          c = tsToObj(this.ts, ot);
          invalid = Number.isNaN(c.year) ? new Invalid("invalid input") : null;
          c = invalid ? null : c;
          o = invalid ? null : ot;
        }
      }

      /**
       * @access private
       */
      this._zone = zone;
      /**
       * @access private
       */
      this.loc = config.loc || Locale.create();
      /**
       * @access private
       */
      this.invalid = invalid;
      /**
       * @access private
       */
      this.weekData = null;
      /**
       * @access private
       */
      this.c = c;
      /**
       * @access private
       */
      this.o = o;
      /**
       * @access private
       */
      this.isLuxonDateTime = true;
    }

    // CONSTRUCT

    /**
     * Create a DateTime for the current instant, in the system's time zone.
     *
     * Use Settings to override these default values if needed.
     * @example DateTime.now().toISO() //~> now in the ISO format
     * @return {DateTime}
     */
    static now() {
      return new DateTime({});
    }

    /**
     * Create a local DateTime
     * @param {number} [year] - The calendar year. If omitted (as in, call `local()` with no arguments), the current time will be used
     * @param {number} [month=1] - The month, 1-indexed
     * @param {number} [day=1] - The day of the month, 1-indexed
     * @param {number} [hour=0] - The hour of the day, in 24-hour time
     * @param {number} [minute=0] - The minute of the hour, meaning a number between 0 and 59
     * @param {number} [second=0] - The second of the minute, meaning a number between 0 and 59
     * @param {number} [millisecond=0] - The millisecond of the second, meaning a number between 0 and 999
     * @example DateTime.local()                                  //~> now
     * @example DateTime.local({ zone: "America/New_York" })      //~> now, in US east coast time
     * @example DateTime.local(2017)                              //~> 2017-01-01T00:00:00
     * @example DateTime.local(2017, 3)                           //~> 2017-03-01T00:00:00
     * @example DateTime.local(2017, 3, 12, { locale: "fr" })     //~> 2017-03-12T00:00:00, with a French locale
     * @example DateTime.local(2017, 3, 12, 5)                    //~> 2017-03-12T05:00:00
     * @example DateTime.local(2017, 3, 12, 5, { zone: "utc" })   //~> 2017-03-12T05:00:00, in UTC
     * @example DateTime.local(2017, 3, 12, 5, 45)                //~> 2017-03-12T05:45:00
     * @example DateTime.local(2017, 3, 12, 5, 45, 10)            //~> 2017-03-12T05:45:10
     * @example DateTime.local(2017, 3, 12, 5, 45, 10, 765)       //~> 2017-03-12T05:45:10.765
     * @return {DateTime}
     */
    static local() {
      const [opts, args] = lastOpts(arguments),
        [year, month, day, hour, minute, second, millisecond] = args;
      return quickDT({ year, month, day, hour, minute, second, millisecond }, opts);
    }

    /**
     * Create a DateTime in UTC
     * @param {number} [year] - The calendar year. If omitted (as in, call `utc()` with no arguments), the current time will be used
     * @param {number} [month=1] - The month, 1-indexed
     * @param {number} [day=1] - The day of the month
     * @param {number} [hour=0] - The hour of the day, in 24-hour time
     * @param {number} [minute=0] - The minute of the hour, meaning a number between 0 and 59
     * @param {number} [second=0] - The second of the minute, meaning a number between 0 and 59
     * @param {number} [millisecond=0] - The millisecond of the second, meaning a number between 0 and 999
     * @param {Object} options - configuration options for the DateTime
     * @param {string} [options.locale] - a locale to set on the resulting DateTime instance
     * @param {string} [options.outputCalendar] - the output calendar to set on the resulting DateTime instance
     * @param {string} [options.numberingSystem] - the numbering system to set on the resulting DateTime instance
     * @example DateTime.utc()                                              //~> now
     * @example DateTime.utc(2017)                                          //~> 2017-01-01T00:00:00Z
     * @example DateTime.utc(2017, 3)                                       //~> 2017-03-01T00:00:00Z
     * @example DateTime.utc(2017, 3, 12)                                   //~> 2017-03-12T00:00:00Z
     * @example DateTime.utc(2017, 3, 12, 5)                                //~> 2017-03-12T05:00:00Z
     * @example DateTime.utc(2017, 3, 12, 5, 45)                            //~> 2017-03-12T05:45:00Z
     * @example DateTime.utc(2017, 3, 12, 5, 45, { locale: "fr" })          //~> 2017-03-12T05:45:00Z with a French locale
     * @example DateTime.utc(2017, 3, 12, 5, 45, 10)                        //~> 2017-03-12T05:45:10Z
     * @example DateTime.utc(2017, 3, 12, 5, 45, 10, 765, { locale: "fr" }) //~> 2017-03-12T05:45:10.765Z with a French locale
     * @return {DateTime}
     */
    static utc() {
      const [opts, args] = lastOpts(arguments),
        [year, month, day, hour, minute, second, millisecond] = args;

      opts.zone = FixedOffsetZone.utcInstance;
      return quickDT({ year, month, day, hour, minute, second, millisecond }, opts);
    }

    /**
     * Create a DateTime from a JavaScript Date object. Uses the default zone.
     * @param {Date} date - a JavaScript Date object
     * @param {Object} options - configuration options for the DateTime
     * @param {string|Zone} [options.zone='local'] - the zone to place the DateTime into
     * @return {DateTime}
     */
    static fromJSDate(date, options = {}) {
      const ts = isDate(date) ? date.valueOf() : NaN;
      if (Number.isNaN(ts)) {
        return DateTime.invalid("invalid input");
      }

      const zoneToUse = normalizeZone(options.zone, Settings.defaultZone);
      if (!zoneToUse.isValid) {
        return DateTime.invalid(unsupportedZone(zoneToUse));
      }

      return new DateTime({
        ts: ts,
        zone: zoneToUse,
        loc: Locale.fromObject(options),
      });
    }

    /**
     * Create a DateTime from a number of milliseconds since the epoch (meaning since 1 January 1970 00:00:00 UTC). Uses the default zone.
     * @param {number} milliseconds - a number of milliseconds since 1970 UTC
     * @param {Object} options - configuration options for the DateTime
     * @param {string|Zone} [options.zone='local'] - the zone to place the DateTime into
     * @param {string} [options.locale] - a locale to set on the resulting DateTime instance
     * @param {string} options.outputCalendar - the output calendar to set on the resulting DateTime instance
     * @param {string} options.numberingSystem - the numbering system to set on the resulting DateTime instance
     * @return {DateTime}
     */
    static fromMillis(milliseconds, options = {}) {
      if (!isNumber$1(milliseconds)) {
        throw new InvalidArgumentError(
          `fromMillis requires a numerical input, but received a ${typeof milliseconds} with value ${milliseconds}`
        );
      } else if (milliseconds < -MAX_DATE || milliseconds > MAX_DATE) {
        // this isn't perfect because because we can still end up out of range because of additional shifting, but it's a start
        return DateTime.invalid("Timestamp out of range");
      } else {
        return new DateTime({
          ts: milliseconds,
          zone: normalizeZone(options.zone, Settings.defaultZone),
          loc: Locale.fromObject(options),
        });
      }
    }

    /**
     * Create a DateTime from a number of seconds since the epoch (meaning since 1 January 1970 00:00:00 UTC). Uses the default zone.
     * @param {number} seconds - a number of seconds since 1970 UTC
     * @param {Object} options - configuration options for the DateTime
     * @param {string|Zone} [options.zone='local'] - the zone to place the DateTime into
     * @param {string} [options.locale] - a locale to set on the resulting DateTime instance
     * @param {string} options.outputCalendar - the output calendar to set on the resulting DateTime instance
     * @param {string} options.numberingSystem - the numbering system to set on the resulting DateTime instance
     * @return {DateTime}
     */
    static fromSeconds(seconds, options = {}) {
      if (!isNumber$1(seconds)) {
        throw new InvalidArgumentError("fromSeconds requires a numerical input");
      } else {
        return new DateTime({
          ts: seconds * 1000,
          zone: normalizeZone(options.zone, Settings.defaultZone),
          loc: Locale.fromObject(options),
        });
      }
    }

    /**
     * Create a DateTime from a JavaScript object with keys like 'year' and 'hour' with reasonable defaults.
     * @param {Object} obj - the object to create the DateTime from
     * @param {number} obj.year - a year, such as 1987
     * @param {number} obj.month - a month, 1-12
     * @param {number} obj.day - a day of the month, 1-31, depending on the month
     * @param {number} obj.ordinal - day of the year, 1-365 or 366
     * @param {number} obj.weekYear - an ISO week year
     * @param {number} obj.weekNumber - an ISO week number, between 1 and 52 or 53, depending on the year
     * @param {number} obj.weekday - an ISO weekday, 1-7, where 1 is Monday and 7 is Sunday
     * @param {number} obj.hour - hour of the day, 0-23
     * @param {number} obj.minute - minute of the hour, 0-59
     * @param {number} obj.second - second of the minute, 0-59
     * @param {number} obj.millisecond - millisecond of the second, 0-999
     * @param {Object} opts - options for creating this DateTime
     * @param {string|Zone} [opts.zone='local'] - interpret the numbers in the context of a particular zone. Can take any value taken as the first argument to setZone()
     * @param {string} [opts.locale='system's locale'] - a locale to set on the resulting DateTime instance
     * @param {string} opts.outputCalendar - the output calendar to set on the resulting DateTime instance
     * @param {string} opts.numberingSystem - the numbering system to set on the resulting DateTime instance
     * @example DateTime.fromObject({ year: 1982, month: 5, day: 25}).toISODate() //=> '1982-05-25'
     * @example DateTime.fromObject({ year: 1982 }).toISODate() //=> '1982-01-01'
     * @example DateTime.fromObject({ hour: 10, minute: 26, second: 6 }) //~> today at 10:26:06
     * @example DateTime.fromObject({ hour: 10, minute: 26, second: 6 }, { zone: 'utc' }),
     * @example DateTime.fromObject({ hour: 10, minute: 26, second: 6 }, { zone: 'local' })
     * @example DateTime.fromObject({ hour: 10, minute: 26, second: 6 }, { zone: 'America/New_York' })
     * @example DateTime.fromObject({ weekYear: 2016, weekNumber: 2, weekday: 3 }).toISODate() //=> '2016-01-13'
     * @return {DateTime}
     */
    static fromObject(obj, opts = {}) {
      obj = obj || {};
      const zoneToUse = normalizeZone(opts.zone, Settings.defaultZone);
      if (!zoneToUse.isValid) {
        return DateTime.invalid(unsupportedZone(zoneToUse));
      }

      const tsNow = Settings.now(),
        offsetProvis = !isUndefined(opts.specificOffset)
          ? opts.specificOffset
          : zoneToUse.offset(tsNow),
        normalized = normalizeObject(obj, normalizeUnit),
        containsOrdinal = !isUndefined(normalized.ordinal),
        containsGregorYear = !isUndefined(normalized.year),
        containsGregorMD = !isUndefined(normalized.month) || !isUndefined(normalized.day),
        containsGregor = containsGregorYear || containsGregorMD,
        definiteWeekDef = normalized.weekYear || normalized.weekNumber,
        loc = Locale.fromObject(opts);

      // cases:
      // just a weekday -> this week's instance of that weekday, no worries
      // (gregorian data or ordinal) + (weekYear or weekNumber) -> error
      // (gregorian month or day) + ordinal -> error
      // otherwise just use weeks or ordinals or gregorian, depending on what's specified

      if ((containsGregor || containsOrdinal) && definiteWeekDef) {
        throw new ConflictingSpecificationError(
          "Can't mix weekYear/weekNumber units with year/month/day or ordinals"
        );
      }

      if (containsGregorMD && containsOrdinal) {
        throw new ConflictingSpecificationError("Can't mix ordinal dates with month/day");
      }

      const useWeekData = definiteWeekDef || (normalized.weekday && !containsGregor);

      // configure ourselves to deal with gregorian dates or week stuff
      let units,
        defaultValues,
        objNow = tsToObj(tsNow, offsetProvis);
      if (useWeekData) {
        units = orderedWeekUnits;
        defaultValues = defaultWeekUnitValues;
        objNow = gregorianToWeek(objNow);
      } else if (containsOrdinal) {
        units = orderedOrdinalUnits;
        defaultValues = defaultOrdinalUnitValues;
        objNow = gregorianToOrdinal(objNow);
      } else {
        units = orderedUnits;
        defaultValues = defaultUnitValues;
      }

      // set default values for missing stuff
      let foundFirst = false;
      for (const u of units) {
        const v = normalized[u];
        if (!isUndefined(v)) {
          foundFirst = true;
        } else if (foundFirst) {
          normalized[u] = defaultValues[u];
        } else {
          normalized[u] = objNow[u];
        }
      }

      // make sure the values we have are in range
      const higherOrderInvalid = useWeekData
          ? hasInvalidWeekData(normalized)
          : containsOrdinal
          ? hasInvalidOrdinalData(normalized)
          : hasInvalidGregorianData(normalized),
        invalid = higherOrderInvalid || hasInvalidTimeData(normalized);

      if (invalid) {
        return DateTime.invalid(invalid);
      }

      // compute the actual time
      const gregorian = useWeekData
          ? weekToGregorian(normalized)
          : containsOrdinal
          ? ordinalToGregorian(normalized)
          : normalized,
        [tsFinal, offsetFinal] = objToTS(gregorian, offsetProvis, zoneToUse),
        inst = new DateTime({
          ts: tsFinal,
          zone: zoneToUse,
          o: offsetFinal,
          loc,
        });

      // gregorian data + weekday serves only to validate
      if (normalized.weekday && containsGregor && obj.weekday !== inst.weekday) {
        return DateTime.invalid(
          "mismatched weekday",
          `you can't specify both a weekday of ${normalized.weekday} and a date of ${inst.toISO()}`
        );
      }

      return inst;
    }

    /**
     * Create a DateTime from an ISO 8601 string
     * @param {string} text - the ISO string
     * @param {Object} opts - options to affect the creation
     * @param {string|Zone} [opts.zone='local'] - use this zone if no offset is specified in the input string itself. Will also convert the time to this zone
     * @param {boolean} [opts.setZone=false] - override the zone with a fixed-offset zone specified in the string itself, if it specifies one
     * @param {string} [opts.locale='system's locale'] - a locale to set on the resulting DateTime instance
     * @param {string} [opts.outputCalendar] - the output calendar to set on the resulting DateTime instance
     * @param {string} [opts.numberingSystem] - the numbering system to set on the resulting DateTime instance
     * @example DateTime.fromISO('2016-05-25T09:08:34.123')
     * @example DateTime.fromISO('2016-05-25T09:08:34.123+06:00')
     * @example DateTime.fromISO('2016-05-25T09:08:34.123+06:00', {setZone: true})
     * @example DateTime.fromISO('2016-05-25T09:08:34.123', {zone: 'utc'})
     * @example DateTime.fromISO('2016-W05-4')
     * @return {DateTime}
     */
    static fromISO(text, opts = {}) {
      const [vals, parsedZone] = parseISODate(text);
      return parseDataToDateTime(vals, parsedZone, opts, "ISO 8601", text);
    }

    /**
     * Create a DateTime from an RFC 2822 string
     * @param {string} text - the RFC 2822 string
     * @param {Object} opts - options to affect the creation
     * @param {string|Zone} [opts.zone='local'] - convert the time to this zone. Since the offset is always specified in the string itself, this has no effect on the interpretation of string, merely the zone the resulting DateTime is expressed in.
     * @param {boolean} [opts.setZone=false] - override the zone with a fixed-offset zone specified in the string itself, if it specifies one
     * @param {string} [opts.locale='system's locale'] - a locale to set on the resulting DateTime instance
     * @param {string} opts.outputCalendar - the output calendar to set on the resulting DateTime instance
     * @param {string} opts.numberingSystem - the numbering system to set on the resulting DateTime instance
     * @example DateTime.fromRFC2822('25 Nov 2016 13:23:12 GMT')
     * @example DateTime.fromRFC2822('Fri, 25 Nov 2016 13:23:12 +0600')
     * @example DateTime.fromRFC2822('25 Nov 2016 13:23 Z')
     * @return {DateTime}
     */
    static fromRFC2822(text, opts = {}) {
      const [vals, parsedZone] = parseRFC2822Date(text);
      return parseDataToDateTime(vals, parsedZone, opts, "RFC 2822", text);
    }

    /**
     * Create a DateTime from an HTTP header date
     * @see https://www.w3.org/Protocols/rfc2616/rfc2616-sec3.html#sec3.3.1
     * @param {string} text - the HTTP header date
     * @param {Object} opts - options to affect the creation
     * @param {string|Zone} [opts.zone='local'] - convert the time to this zone. Since HTTP dates are always in UTC, this has no effect on the interpretation of string, merely the zone the resulting DateTime is expressed in.
     * @param {boolean} [opts.setZone=false] - override the zone with the fixed-offset zone specified in the string. For HTTP dates, this is always UTC, so this option is equivalent to setting the `zone` option to 'utc', but this option is included for consistency with similar methods.
     * @param {string} [opts.locale='system's locale'] - a locale to set on the resulting DateTime instance
     * @param {string} opts.outputCalendar - the output calendar to set on the resulting DateTime instance
     * @param {string} opts.numberingSystem - the numbering system to set on the resulting DateTime instance
     * @example DateTime.fromHTTP('Sun, 06 Nov 1994 08:49:37 GMT')
     * @example DateTime.fromHTTP('Sunday, 06-Nov-94 08:49:37 GMT')
     * @example DateTime.fromHTTP('Sun Nov  6 08:49:37 1994')
     * @return {DateTime}
     */
    static fromHTTP(text, opts = {}) {
      const [vals, parsedZone] = parseHTTPDate(text);
      return parseDataToDateTime(vals, parsedZone, opts, "HTTP", opts);
    }

    /**
     * Create a DateTime from an input string and format string.
     * Defaults to en-US if no locale has been specified, regardless of the system's locale. For a table of tokens and their interpretations, see [here](https://moment.github.io/luxon/#/parsing?id=table-of-tokens).
     * @param {string} text - the string to parse
     * @param {string} fmt - the format the string is expected to be in (see the link below for the formats)
     * @param {Object} opts - options to affect the creation
     * @param {string|Zone} [opts.zone='local'] - use this zone if no offset is specified in the input string itself. Will also convert the DateTime to this zone
     * @param {boolean} [opts.setZone=false] - override the zone with a zone specified in the string itself, if it specifies one
     * @param {string} [opts.locale='en-US'] - a locale string to use when parsing. Will also set the DateTime to this locale
     * @param {string} opts.numberingSystem - the numbering system to use when parsing. Will also set the resulting DateTime to this numbering system
     * @param {string} opts.outputCalendar - the output calendar to set on the resulting DateTime instance
     * @return {DateTime}
     */
    static fromFormat(text, fmt, opts = {}) {
      if (isUndefined(text) || isUndefined(fmt)) {
        throw new InvalidArgumentError("fromFormat requires an input string and a format");
      }

      const { locale = null, numberingSystem = null } = opts,
        localeToUse = Locale.fromOpts({
          locale,
          numberingSystem,
          defaultToEN: true,
        }),
        [vals, parsedZone, specificOffset, invalid] = parseFromTokens(localeToUse, text, fmt);
      if (invalid) {
        return DateTime.invalid(invalid);
      } else {
        return parseDataToDateTime(vals, parsedZone, opts, `format ${fmt}`, text, specificOffset);
      }
    }

    /**
     * @deprecated use fromFormat instead
     */
    static fromString(text, fmt, opts = {}) {
      return DateTime.fromFormat(text, fmt, opts);
    }

    /**
     * Create a DateTime from a SQL date, time, or datetime
     * Defaults to en-US if no locale has been specified, regardless of the system's locale
     * @param {string} text - the string to parse
     * @param {Object} opts - options to affect the creation
     * @param {string|Zone} [opts.zone='local'] - use this zone if no offset is specified in the input string itself. Will also convert the DateTime to this zone
     * @param {boolean} [opts.setZone=false] - override the zone with a zone specified in the string itself, if it specifies one
     * @param {string} [opts.locale='en-US'] - a locale string to use when parsing. Will also set the DateTime to this locale
     * @param {string} opts.numberingSystem - the numbering system to use when parsing. Will also set the resulting DateTime to this numbering system
     * @param {string} opts.outputCalendar - the output calendar to set on the resulting DateTime instance
     * @example DateTime.fromSQL('2017-05-15')
     * @example DateTime.fromSQL('2017-05-15 09:12:34')
     * @example DateTime.fromSQL('2017-05-15 09:12:34.342')
     * @example DateTime.fromSQL('2017-05-15 09:12:34.342+06:00')
     * @example DateTime.fromSQL('2017-05-15 09:12:34.342 America/Los_Angeles')
     * @example DateTime.fromSQL('2017-05-15 09:12:34.342 America/Los_Angeles', { setZone: true })
     * @example DateTime.fromSQL('2017-05-15 09:12:34.342', { zone: 'America/Los_Angeles' })
     * @example DateTime.fromSQL('09:12:34.342')
     * @return {DateTime}
     */
    static fromSQL(text, opts = {}) {
      const [vals, parsedZone] = parseSQL(text);
      return parseDataToDateTime(vals, parsedZone, opts, "SQL", text);
    }

    /**
     * Create an invalid DateTime.
     * @param {DateTime} reason - simple string of why this DateTime is invalid. Should not contain parameters or anything else data-dependent
     * @param {string} [explanation=null] - longer explanation, may include parameters and other useful debugging information
     * @return {DateTime}
     */
    static invalid(reason, explanation = null) {
      if (!reason) {
        throw new InvalidArgumentError("need to specify a reason the DateTime is invalid");
      }

      const invalid = reason instanceof Invalid ? reason : new Invalid(reason, explanation);

      if (Settings.throwOnInvalid) {
        throw new InvalidDateTimeError(invalid);
      } else {
        return new DateTime({ invalid });
      }
    }

    /**
     * Check if an object is an instance of DateTime. Works across context boundaries
     * @param {object} o
     * @return {boolean}
     */
    static isDateTime(o) {
      return (o && o.isLuxonDateTime) || false;
    }

    /**
     * Produce the format string for a set of options
     * @param formatOpts
     * @param localeOpts
     * @returns {string}
     */
    static parseFormatForOpts(formatOpts, localeOpts = {}) {
      const tokenList = formatOptsToTokens(formatOpts, Locale.fromObject(localeOpts));
      return !tokenList ? null : tokenList.map((t) => (t ? t.val : null)).join("");
    }

    /**
     * Produce the the fully expanded format token for the locale
     * Does NOT quote characters, so quoted tokens will not round trip correctly
     * @param fmt
     * @param localeOpts
     * @returns {string}
     */
    static expandFormat(fmt, localeOpts = {}) {
      const expanded = expandMacroTokens(Formatter.parseFormat(fmt), Locale.fromObject(localeOpts));
      return expanded.map((t) => t.val).join("");
    }

    // INFO

    /**
     * Get the value of unit.
     * @param {string} unit - a unit such as 'minute' or 'day'
     * @example DateTime.local(2017, 7, 4).get('month'); //=> 7
     * @example DateTime.local(2017, 7, 4).get('day'); //=> 4
     * @return {number}
     */
    get(unit) {
      return this[unit];
    }

    /**
     * Returns whether the DateTime is valid. Invalid DateTimes occur when:
     * * The DateTime was created from invalid calendar information, such as the 13th month or February 30
     * * The DateTime was created by an operation on another invalid date
     * @type {boolean}
     */
    get isValid() {
      return this.invalid === null;
    }

    /**
     * Returns an error code if this DateTime is invalid, or null if the DateTime is valid
     * @type {string}
     */
    get invalidReason() {
      return this.invalid ? this.invalid.reason : null;
    }

    /**
     * Returns an explanation of why this DateTime became invalid, or null if the DateTime is valid
     * @type {string}
     */
    get invalidExplanation() {
      return this.invalid ? this.invalid.explanation : null;
    }

    /**
     * Get the locale of a DateTime, such 'en-GB'. The locale is used when formatting the DateTime
     *
     * @type {string}
     */
    get locale() {
      return this.isValid ? this.loc.locale : null;
    }

    /**
     * Get the numbering system of a DateTime, such 'beng'. The numbering system is used when formatting the DateTime
     *
     * @type {string}
     */
    get numberingSystem() {
      return this.isValid ? this.loc.numberingSystem : null;
    }

    /**
     * Get the output calendar of a DateTime, such 'islamic'. The output calendar is used when formatting the DateTime
     *
     * @type {string}
     */
    get outputCalendar() {
      return this.isValid ? this.loc.outputCalendar : null;
    }

    /**
     * Get the time zone associated with this DateTime.
     * @type {Zone}
     */
    get zone() {
      return this._zone;
    }

    /**
     * Get the name of the time zone.
     * @type {string}
     */
    get zoneName() {
      return this.isValid ? this.zone.name : null;
    }

    /**
     * Get the year
     * @example DateTime.local(2017, 5, 25).year //=> 2017
     * @type {number}
     */
    get year() {
      return this.isValid ? this.c.year : NaN;
    }

    /**
     * Get the quarter
     * @example DateTime.local(2017, 5, 25).quarter //=> 2
     * @type {number}
     */
    get quarter() {
      return this.isValid ? Math.ceil(this.c.month / 3) : NaN;
    }

    /**
     * Get the month (1-12).
     * @example DateTime.local(2017, 5, 25).month //=> 5
     * @type {number}
     */
    get month() {
      return this.isValid ? this.c.month : NaN;
    }

    /**
     * Get the day of the month (1-30ish).
     * @example DateTime.local(2017, 5, 25).day //=> 25
     * @type {number}
     */
    get day() {
      return this.isValid ? this.c.day : NaN;
    }

    /**
     * Get the hour of the day (0-23).
     * @example DateTime.local(2017, 5, 25, 9).hour //=> 9
     * @type {number}
     */
    get hour() {
      return this.isValid ? this.c.hour : NaN;
    }

    /**
     * Get the minute of the hour (0-59).
     * @example DateTime.local(2017, 5, 25, 9, 30).minute //=> 30
     * @type {number}
     */
    get minute() {
      return this.isValid ? this.c.minute : NaN;
    }

    /**
     * Get the second of the minute (0-59).
     * @example DateTime.local(2017, 5, 25, 9, 30, 52).second //=> 52
     * @type {number}
     */
    get second() {
      return this.isValid ? this.c.second : NaN;
    }

    /**
     * Get the millisecond of the second (0-999).
     * @example DateTime.local(2017, 5, 25, 9, 30, 52, 654).millisecond //=> 654
     * @type {number}
     */
    get millisecond() {
      return this.isValid ? this.c.millisecond : NaN;
    }

    /**
     * Get the week year
     * @see https://en.wikipedia.org/wiki/ISO_week_date
     * @example DateTime.local(2014, 12, 31).weekYear //=> 2015
     * @type {number}
     */
    get weekYear() {
      return this.isValid ? possiblyCachedWeekData(this).weekYear : NaN;
    }

    /**
     * Get the week number of the week year (1-52ish).
     * @see https://en.wikipedia.org/wiki/ISO_week_date
     * @example DateTime.local(2017, 5, 25).weekNumber //=> 21
     * @type {number}
     */
    get weekNumber() {
      return this.isValid ? possiblyCachedWeekData(this).weekNumber : NaN;
    }

    /**
     * Get the day of the week.
     * 1 is Monday and 7 is Sunday
     * @see https://en.wikipedia.org/wiki/ISO_week_date
     * @example DateTime.local(2014, 11, 31).weekday //=> 4
     * @type {number}
     */
    get weekday() {
      return this.isValid ? possiblyCachedWeekData(this).weekday : NaN;
    }

    /**
     * Get the ordinal (meaning the day of the year)
     * @example DateTime.local(2017, 5, 25).ordinal //=> 145
     * @type {number|DateTime}
     */
    get ordinal() {
      return this.isValid ? gregorianToOrdinal(this.c).ordinal : NaN;
    }

    /**
     * Get the human readable short month name, such as 'Oct'.
     * Defaults to the system's locale if no locale has been specified
     * @example DateTime.local(2017, 10, 30).monthShort //=> Oct
     * @type {string}
     */
    get monthShort() {
      return this.isValid ? Info.months("short", { locObj: this.loc })[this.month - 1] : null;
    }

    /**
     * Get the human readable long month name, such as 'October'.
     * Defaults to the system's locale if no locale has been specified
     * @example DateTime.local(2017, 10, 30).monthLong //=> October
     * @type {string}
     */
    get monthLong() {
      return this.isValid ? Info.months("long", { locObj: this.loc })[this.month - 1] : null;
    }

    /**
     * Get the human readable short weekday, such as 'Mon'.
     * Defaults to the system's locale if no locale has been specified
     * @example DateTime.local(2017, 10, 30).weekdayShort //=> Mon
     * @type {string}
     */
    get weekdayShort() {
      return this.isValid ? Info.weekdays("short", { locObj: this.loc })[this.weekday - 1] : null;
    }

    /**
     * Get the human readable long weekday, such as 'Monday'.
     * Defaults to the system's locale if no locale has been specified
     * @example DateTime.local(2017, 10, 30).weekdayLong //=> Monday
     * @type {string}
     */
    get weekdayLong() {
      return this.isValid ? Info.weekdays("long", { locObj: this.loc })[this.weekday - 1] : null;
    }

    /**
     * Get the UTC offset of this DateTime in minutes
     * @example DateTime.now().offset //=> -240
     * @example DateTime.utc().offset //=> 0
     * @type {number}
     */
    get offset() {
      return this.isValid ? +this.o : NaN;
    }

    /**
     * Get the short human name for the zone's current offset, for example "EST" or "EDT".
     * Defaults to the system's locale if no locale has been specified
     * @type {string}
     */
    get offsetNameShort() {
      if (this.isValid) {
        return this.zone.offsetName(this.ts, {
          format: "short",
          locale: this.locale,
        });
      } else {
        return null;
      }
    }

    /**
     * Get the long human name for the zone's current offset, for example "Eastern Standard Time" or "Eastern Daylight Time".
     * Defaults to the system's locale if no locale has been specified
     * @type {string}
     */
    get offsetNameLong() {
      if (this.isValid) {
        return this.zone.offsetName(this.ts, {
          format: "long",
          locale: this.locale,
        });
      } else {
        return null;
      }
    }

    /**
     * Get whether this zone's offset ever changes, as in a DST.
     * @type {boolean}
     */
    get isOffsetFixed() {
      return this.isValid ? this.zone.isUniversal : null;
    }

    /**
     * Get whether the DateTime is in a DST.
     * @type {boolean}
     */
    get isInDST() {
      if (this.isOffsetFixed) {
        return false;
      } else {
        return (
          this.offset > this.set({ month: 1, day: 1 }).offset ||
          this.offset > this.set({ month: 5 }).offset
        );
      }
    }

    /**
     * Returns true if this DateTime is in a leap year, false otherwise
     * @example DateTime.local(2016).isInLeapYear //=> true
     * @example DateTime.local(2013).isInLeapYear //=> false
     * @type {boolean}
     */
    get isInLeapYear() {
      return isLeapYear(this.year);
    }

    /**
     * Returns the number of days in this DateTime's month
     * @example DateTime.local(2016, 2).daysInMonth //=> 29
     * @example DateTime.local(2016, 3).daysInMonth //=> 31
     * @type {number}
     */
    get daysInMonth() {
      return daysInMonth(this.year, this.month);
    }

    /**
     * Returns the number of days in this DateTime's year
     * @example DateTime.local(2016).daysInYear //=> 366
     * @example DateTime.local(2013).daysInYear //=> 365
     * @type {number}
     */
    get daysInYear() {
      return this.isValid ? daysInYear(this.year) : NaN;
    }

    /**
     * Returns the number of weeks in this DateTime's year
     * @see https://en.wikipedia.org/wiki/ISO_week_date
     * @example DateTime.local(2004).weeksInWeekYear //=> 53
     * @example DateTime.local(2013).weeksInWeekYear //=> 52
     * @type {number}
     */
    get weeksInWeekYear() {
      return this.isValid ? weeksInWeekYear(this.weekYear) : NaN;
    }

    /**
     * Returns the resolved Intl options for this DateTime.
     * This is useful in understanding the behavior of formatting methods
     * @param {Object} opts - the same options as toLocaleString
     * @return {Object}
     */
    resolvedLocaleOptions(opts = {}) {
      const { locale, numberingSystem, calendar } = Formatter.create(
        this.loc.clone(opts),
        opts
      ).resolvedOptions(this);
      return { locale, numberingSystem, outputCalendar: calendar };
    }

    // TRANSFORM

    /**
     * "Set" the DateTime's zone to UTC. Returns a newly-constructed DateTime.
     *
     * Equivalent to {@link DateTime#setZone}('utc')
     * @param {number} [offset=0] - optionally, an offset from UTC in minutes
     * @param {Object} [opts={}] - options to pass to `setZone()`
     * @return {DateTime}
     */
    toUTC(offset = 0, opts = {}) {
      return this.setZone(FixedOffsetZone.instance(offset), opts);
    }

    /**
     * "Set" the DateTime's zone to the host's local zone. Returns a newly-constructed DateTime.
     *
     * Equivalent to `setZone('local')`
     * @return {DateTime}
     */
    toLocal() {
      return this.setZone(Settings.defaultZone);
    }

    /**
     * "Set" the DateTime's zone to specified zone. Returns a newly-constructed DateTime.
     *
     * By default, the setter keeps the underlying time the same (as in, the same timestamp), but the new instance will report different local times and consider DSTs when making computations, as with {@link DateTime#plus}. You may wish to use {@link DateTime#toLocal} and {@link DateTime#toUTC} which provide simple convenience wrappers for commonly used zones.
     * @param {string|Zone} [zone='local'] - a zone identifier. As a string, that can be any IANA zone supported by the host environment, or a fixed-offset name of the form 'UTC+3', or the strings 'local' or 'utc'. You may also supply an instance of a {@link DateTime#Zone} class.
     * @param {Object} opts - options
     * @param {boolean} [opts.keepLocalTime=false] - If true, adjust the underlying time so that the local time stays the same, but in the target zone. You should rarely need this.
     * @return {DateTime}
     */
    setZone(zone, { keepLocalTime = false, keepCalendarTime = false } = {}) {
      zone = normalizeZone(zone, Settings.defaultZone);
      if (zone.equals(this.zone)) {
        return this;
      } else if (!zone.isValid) {
        return DateTime.invalid(unsupportedZone(zone));
      } else {
        let newTS = this.ts;
        if (keepLocalTime || keepCalendarTime) {
          const offsetGuess = zone.offset(this.ts);
          const asObj = this.toObject();
          [newTS] = objToTS(asObj, offsetGuess, zone);
        }
        return clone$1(this, { ts: newTS, zone });
      }
    }

    /**
     * "Set" the locale, numberingSystem, or outputCalendar. Returns a newly-constructed DateTime.
     * @param {Object} properties - the properties to set
     * @example DateTime.local(2017, 5, 25).reconfigure({ locale: 'en-GB' })
     * @return {DateTime}
     */
    reconfigure({ locale, numberingSystem, outputCalendar } = {}) {
      const loc = this.loc.clone({ locale, numberingSystem, outputCalendar });
      return clone$1(this, { loc });
    }

    /**
     * "Set" the locale. Returns a newly-constructed DateTime.
     * Just a convenient alias for reconfigure({ locale })
     * @example DateTime.local(2017, 5, 25).setLocale('en-GB')
     * @return {DateTime}
     */
    setLocale(locale) {
      return this.reconfigure({ locale });
    }

    /**
     * "Set" the values of specified units. Returns a newly-constructed DateTime.
     * You can only set units with this method; for "setting" metadata, see {@link DateTime#reconfigure} and {@link DateTime#setZone}.
     * @param {Object} values - a mapping of units to numbers
     * @example dt.set({ year: 2017 })
     * @example dt.set({ hour: 8, minute: 30 })
     * @example dt.set({ weekday: 5 })
     * @example dt.set({ year: 2005, ordinal: 234 })
     * @return {DateTime}
     */
    set(values) {
      if (!this.isValid) return this;

      const normalized = normalizeObject(values, normalizeUnit),
        settingWeekStuff =
          !isUndefined(normalized.weekYear) ||
          !isUndefined(normalized.weekNumber) ||
          !isUndefined(normalized.weekday),
        containsOrdinal = !isUndefined(normalized.ordinal),
        containsGregorYear = !isUndefined(normalized.year),
        containsGregorMD = !isUndefined(normalized.month) || !isUndefined(normalized.day),
        containsGregor = containsGregorYear || containsGregorMD,
        definiteWeekDef = normalized.weekYear || normalized.weekNumber;

      if ((containsGregor || containsOrdinal) && definiteWeekDef) {
        throw new ConflictingSpecificationError(
          "Can't mix weekYear/weekNumber units with year/month/day or ordinals"
        );
      }

      if (containsGregorMD && containsOrdinal) {
        throw new ConflictingSpecificationError("Can't mix ordinal dates with month/day");
      }

      let mixed;
      if (settingWeekStuff) {
        mixed = weekToGregorian({ ...gregorianToWeek(this.c), ...normalized });
      } else if (!isUndefined(normalized.ordinal)) {
        mixed = ordinalToGregorian({ ...gregorianToOrdinal(this.c), ...normalized });
      } else {
        mixed = { ...this.toObject(), ...normalized };

        // if we didn't set the day but we ended up on an overflow date,
        // use the last day of the right month
        if (isUndefined(normalized.day)) {
          mixed.day = Math.min(daysInMonth(mixed.year, mixed.month), mixed.day);
        }
      }

      const [ts, o] = objToTS(mixed, this.o, this.zone);
      return clone$1(this, { ts, o });
    }

    /**
     * Add a period of time to this DateTime and return the resulting DateTime
     *
     * Adding hours, minutes, seconds, or milliseconds increases the timestamp by the right number of milliseconds. Adding days, months, or years shifts the calendar, accounting for DSTs and leap years along the way. Thus, `dt.plus({ hours: 24 })` may result in a different time than `dt.plus({ days: 1 })` if there's a DST shift in between.
     * @param {Duration|Object|number} duration - The amount to add. Either a Luxon Duration, a number of milliseconds, the object argument to Duration.fromObject()
     * @example DateTime.now().plus(123) //~> in 123 milliseconds
     * @example DateTime.now().plus({ minutes: 15 }) //~> in 15 minutes
     * @example DateTime.now().plus({ days: 1 }) //~> this time tomorrow
     * @example DateTime.now().plus({ days: -1 }) //~> this time yesterday
     * @example DateTime.now().plus({ hours: 3, minutes: 13 }) //~> in 3 hr, 13 min
     * @example DateTime.now().plus(Duration.fromObject({ hours: 3, minutes: 13 })) //~> in 3 hr, 13 min
     * @return {DateTime}
     */
    plus(duration) {
      if (!this.isValid) return this;
      const dur = Duration.fromDurationLike(duration);
      return clone$1(this, adjustTime(this, dur));
    }

    /**
     * Subtract a period of time to this DateTime and return the resulting DateTime
     * See {@link DateTime#plus}
     * @param {Duration|Object|number} duration - The amount to subtract. Either a Luxon Duration, a number of milliseconds, the object argument to Duration.fromObject()
     @return {DateTime}
     */
    minus(duration) {
      if (!this.isValid) return this;
      const dur = Duration.fromDurationLike(duration).negate();
      return clone$1(this, adjustTime(this, dur));
    }

    /**
     * "Set" this DateTime to the beginning of a unit of time.
     * @param {string} unit - The unit to go to the beginning of. Can be 'year', 'quarter', 'month', 'week', 'day', 'hour', 'minute', 'second', or 'millisecond'.
     * @example DateTime.local(2014, 3, 3).startOf('month').toISODate(); //=> '2014-03-01'
     * @example DateTime.local(2014, 3, 3).startOf('year').toISODate(); //=> '2014-01-01'
     * @example DateTime.local(2014, 3, 3).startOf('week').toISODate(); //=> '2014-03-03', weeks always start on Mondays
     * @example DateTime.local(2014, 3, 3, 5, 30).startOf('day').toISOTime(); //=> '00:00.000-05:00'
     * @example DateTime.local(2014, 3, 3, 5, 30).startOf('hour').toISOTime(); //=> '05:00:00.000-05:00'
     * @return {DateTime}
     */
    startOf(unit) {
      if (!this.isValid) return this;
      const o = {},
        normalizedUnit = Duration.normalizeUnit(unit);
      switch (normalizedUnit) {
        case "years":
          o.month = 1;
        // falls through
        case "quarters":
        case "months":
          o.day = 1;
        // falls through
        case "weeks":
        case "days":
          o.hour = 0;
        // falls through
        case "hours":
          o.minute = 0;
        // falls through
        case "minutes":
          o.second = 0;
        // falls through
        case "seconds":
          o.millisecond = 0;
          break;
        // no default, invalid units throw in normalizeUnit()
      }

      if (normalizedUnit === "weeks") {
        o.weekday = 1;
      }

      if (normalizedUnit === "quarters") {
        const q = Math.ceil(this.month / 3);
        o.month = (q - 1) * 3 + 1;
      }

      return this.set(o);
    }

    /**
     * "Set" this DateTime to the end (meaning the last millisecond) of a unit of time
     * @param {string} unit - The unit to go to the end of. Can be 'year', 'quarter', 'month', 'week', 'day', 'hour', 'minute', 'second', or 'millisecond'.
     * @example DateTime.local(2014, 3, 3).endOf('month').toISO(); //=> '2014-03-31T23:59:59.999-05:00'
     * @example DateTime.local(2014, 3, 3).endOf('year').toISO(); //=> '2014-12-31T23:59:59.999-05:00'
     * @example DateTime.local(2014, 3, 3).endOf('week').toISO(); // => '2014-03-09T23:59:59.999-05:00', weeks start on Mondays
     * @example DateTime.local(2014, 3, 3, 5, 30).endOf('day').toISO(); //=> '2014-03-03T23:59:59.999-05:00'
     * @example DateTime.local(2014, 3, 3, 5, 30).endOf('hour').toISO(); //=> '2014-03-03T05:59:59.999-05:00'
     * @return {DateTime}
     */
    endOf(unit) {
      return this.isValid
        ? this.plus({ [unit]: 1 })
            .startOf(unit)
            .minus(1)
        : this;
    }

    // OUTPUT

    /**
     * Returns a string representation of this DateTime formatted according to the specified format string.
     * **You may not want this.** See {@link DateTime#toLocaleString} for a more flexible formatting tool. For a table of tokens and their interpretations, see [here](https://moment.github.io/luxon/#/formatting?id=table-of-tokens).
     * Defaults to en-US if no locale has been specified, regardless of the system's locale.
     * @param {string} fmt - the format string
     * @param {Object} opts - opts to override the configuration options on this DateTime
     * @example DateTime.now().toFormat('yyyy LLL dd') //=> '2017 Apr 22'
     * @example DateTime.now().setLocale('fr').toFormat('yyyy LLL dd') //=> '2017 avr. 22'
     * @example DateTime.now().toFormat('yyyy LLL dd', { locale: "fr" }) //=> '2017 avr. 22'
     * @example DateTime.now().toFormat("HH 'hours and' mm 'minutes'") //=> '20 hours and 55 minutes'
     * @return {string}
     */
    toFormat(fmt, opts = {}) {
      return this.isValid
        ? Formatter.create(this.loc.redefaultToEN(opts)).formatDateTimeFromString(this, fmt)
        : INVALID$1;
    }

    /**
     * Returns a localized string representing this date. Accepts the same options as the Intl.DateTimeFormat constructor and any presets defined by Luxon, such as `DateTime.DATE_FULL` or `DateTime.TIME_SIMPLE`.
     * The exact behavior of this method is browser-specific, but in general it will return an appropriate representation
     * of the DateTime in the assigned locale.
     * Defaults to the system's locale if no locale has been specified
     * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/DateTimeFormat
     * @param formatOpts {Object} - Intl.DateTimeFormat constructor options and configuration options
     * @param {Object} opts - opts to override the configuration options on this DateTime
     * @example DateTime.now().toLocaleString(); //=> 4/20/2017
     * @example DateTime.now().setLocale('en-gb').toLocaleString(); //=> '20/04/2017'
     * @example DateTime.now().toLocaleString(DateTime.DATE_FULL); //=> 'April 20, 2017'
     * @example DateTime.now().toLocaleString(DateTime.DATE_FULL, { locale: 'fr' }); //=> '28 août 2022'
     * @example DateTime.now().toLocaleString(DateTime.TIME_SIMPLE); //=> '11:32 AM'
     * @example DateTime.now().toLocaleString(DateTime.DATETIME_SHORT); //=> '4/20/2017, 11:32 AM'
     * @example DateTime.now().toLocaleString({ weekday: 'long', month: 'long', day: '2-digit' }); //=> 'Thursday, April 20'
     * @example DateTime.now().toLocaleString({ weekday: 'short', month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' }); //=> 'Thu, Apr 20, 11:27 AM'
     * @example DateTime.now().toLocaleString({ hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }); //=> '11:32'
     * @return {string}
     */
    toLocaleString(formatOpts = DATE_SHORT, opts = {}) {
      return this.isValid
        ? Formatter.create(this.loc.clone(opts), formatOpts).formatDateTime(this)
        : INVALID$1;
    }

    /**
     * Returns an array of format "parts", meaning individual tokens along with metadata. This is allows callers to post-process individual sections of the formatted output.
     * Defaults to the system's locale if no locale has been specified
     * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/DateTimeFormat/formatToParts
     * @param opts {Object} - Intl.DateTimeFormat constructor options, same as `toLocaleString`.
     * @example DateTime.now().toLocaleParts(); //=> [
     *                                   //=>   { type: 'day', value: '25' },
     *                                   //=>   { type: 'literal', value: '/' },
     *                                   //=>   { type: 'month', value: '05' },
     *                                   //=>   { type: 'literal', value: '/' },
     *                                   //=>   { type: 'year', value: '1982' }
     *                                   //=> ]
     */
    toLocaleParts(opts = {}) {
      return this.isValid
        ? Formatter.create(this.loc.clone(opts), opts).formatDateTimeParts(this)
        : [];
    }

    /**
     * Returns an ISO 8601-compliant string representation of this DateTime
     * @param {Object} opts - options
     * @param {boolean} [opts.suppressMilliseconds=false] - exclude milliseconds from the format if they're 0
     * @param {boolean} [opts.suppressSeconds=false] - exclude seconds from the format if they're 0
     * @param {boolean} [opts.includeOffset=true] - include the offset, such as 'Z' or '-04:00'
     * @param {boolean} [opts.extendedZone=false] - add the time zone format extension
     * @param {string} [opts.format='extended'] - choose between the basic and extended format
     * @example DateTime.utc(1983, 5, 25).toISO() //=> '1982-05-25T00:00:00.000Z'
     * @example DateTime.now().toISO() //=> '2017-04-22T20:47:05.335-04:00'
     * @example DateTime.now().toISO({ includeOffset: false }) //=> '2017-04-22T20:47:05.335'
     * @example DateTime.now().toISO({ format: 'basic' }) //=> '20170422T204705.335-0400'
     * @return {string}
     */
    toISO({
      format = "extended",
      suppressSeconds = false,
      suppressMilliseconds = false,
      includeOffset = true,
      extendedZone = false,
    } = {}) {
      if (!this.isValid) {
        return null;
      }

      const ext = format === "extended";

      let c = toISODate(this, ext);
      c += "T";
      c += toISOTime(this, ext, suppressSeconds, suppressMilliseconds, includeOffset, extendedZone);
      return c;
    }

    /**
     * Returns an ISO 8601-compliant string representation of this DateTime's date component
     * @param {Object} opts - options
     * @param {string} [opts.format='extended'] - choose between the basic and extended format
     * @example DateTime.utc(1982, 5, 25).toISODate() //=> '1982-05-25'
     * @example DateTime.utc(1982, 5, 25).toISODate({ format: 'basic' }) //=> '19820525'
     * @return {string}
     */
    toISODate({ format = "extended" } = {}) {
      if (!this.isValid) {
        return null;
      }

      return toISODate(this, format === "extended");
    }

    /**
     * Returns an ISO 8601-compliant string representation of this DateTime's week date
     * @example DateTime.utc(1982, 5, 25).toISOWeekDate() //=> '1982-W21-2'
     * @return {string}
     */
    toISOWeekDate() {
      return toTechFormat(this, "kkkk-'W'WW-c");
    }

    /**
     * Returns an ISO 8601-compliant string representation of this DateTime's time component
     * @param {Object} opts - options
     * @param {boolean} [opts.suppressMilliseconds=false] - exclude milliseconds from the format if they're 0
     * @param {boolean} [opts.suppressSeconds=false] - exclude seconds from the format if they're 0
     * @param {boolean} [opts.includeOffset=true] - include the offset, such as 'Z' or '-04:00'
     * @param {boolean} [opts.extendedZone=true] - add the time zone format extension
     * @param {boolean} [opts.includePrefix=false] - include the `T` prefix
     * @param {string} [opts.format='extended'] - choose between the basic and extended format
     * @example DateTime.utc().set({ hour: 7, minute: 34 }).toISOTime() //=> '07:34:19.361Z'
     * @example DateTime.utc().set({ hour: 7, minute: 34, seconds: 0, milliseconds: 0 }).toISOTime({ suppressSeconds: true }) //=> '07:34Z'
     * @example DateTime.utc().set({ hour: 7, minute: 34 }).toISOTime({ format: 'basic' }) //=> '073419.361Z'
     * @example DateTime.utc().set({ hour: 7, minute: 34 }).toISOTime({ includePrefix: true }) //=> 'T07:34:19.361Z'
     * @return {string}
     */
    toISOTime({
      suppressMilliseconds = false,
      suppressSeconds = false,
      includeOffset = true,
      includePrefix = false,
      extendedZone = false,
      format = "extended",
    } = {}) {
      if (!this.isValid) {
        return null;
      }

      let c = includePrefix ? "T" : "";
      return (
        c +
        toISOTime(
          this,
          format === "extended",
          suppressSeconds,
          suppressMilliseconds,
          includeOffset,
          extendedZone
        )
      );
    }

    /**
     * Returns an RFC 2822-compatible string representation of this DateTime
     * @example DateTime.utc(2014, 7, 13).toRFC2822() //=> 'Sun, 13 Jul 2014 00:00:00 +0000'
     * @example DateTime.local(2014, 7, 13).toRFC2822() //=> 'Sun, 13 Jul 2014 00:00:00 -0400'
     * @return {string}
     */
    toRFC2822() {
      return toTechFormat(this, "EEE, dd LLL yyyy HH:mm:ss ZZZ", false);
    }

    /**
     * Returns a string representation of this DateTime appropriate for use in HTTP headers. The output is always expressed in GMT.
     * Specifically, the string conforms to RFC 1123.
     * @see https://www.w3.org/Protocols/rfc2616/rfc2616-sec3.html#sec3.3.1
     * @example DateTime.utc(2014, 7, 13).toHTTP() //=> 'Sun, 13 Jul 2014 00:00:00 GMT'
     * @example DateTime.utc(2014, 7, 13, 19).toHTTP() //=> 'Sun, 13 Jul 2014 19:00:00 GMT'
     * @return {string}
     */
    toHTTP() {
      return toTechFormat(this.toUTC(), "EEE, dd LLL yyyy HH:mm:ss 'GMT'");
    }

    /**
     * Returns a string representation of this DateTime appropriate for use in SQL Date
     * @example DateTime.utc(2014, 7, 13).toSQLDate() //=> '2014-07-13'
     * @return {string}
     */
    toSQLDate() {
      if (!this.isValid) {
        return null;
      }
      return toISODate(this, true);
    }

    /**
     * Returns a string representation of this DateTime appropriate for use in SQL Time
     * @param {Object} opts - options
     * @param {boolean} [opts.includeZone=false] - include the zone, such as 'America/New_York'. Overrides includeOffset.
     * @param {boolean} [opts.includeOffset=true] - include the offset, such as 'Z' or '-04:00'
     * @param {boolean} [opts.includeOffsetSpace=true] - include the space between the time and the offset, such as '05:15:16.345 -04:00'
     * @example DateTime.utc().toSQL() //=> '05:15:16.345'
     * @example DateTime.now().toSQL() //=> '05:15:16.345 -04:00'
     * @example DateTime.now().toSQL({ includeOffset: false }) //=> '05:15:16.345'
     * @example DateTime.now().toSQL({ includeZone: false }) //=> '05:15:16.345 America/New_York'
     * @return {string}
     */
    toSQLTime({ includeOffset = true, includeZone = false, includeOffsetSpace = true } = {}) {
      let fmt = "HH:mm:ss.SSS";

      if (includeZone || includeOffset) {
        if (includeOffsetSpace) {
          fmt += " ";
        }
        if (includeZone) {
          fmt += "z";
        } else if (includeOffset) {
          fmt += "ZZ";
        }
      }

      return toTechFormat(this, fmt, true);
    }

    /**
     * Returns a string representation of this DateTime appropriate for use in SQL DateTime
     * @param {Object} opts - options
     * @param {boolean} [opts.includeZone=false] - include the zone, such as 'America/New_York'. Overrides includeOffset.
     * @param {boolean} [opts.includeOffset=true] - include the offset, such as 'Z' or '-04:00'
     * @param {boolean} [opts.includeOffsetSpace=true] - include the space between the time and the offset, such as '05:15:16.345 -04:00'
     * @example DateTime.utc(2014, 7, 13).toSQL() //=> '2014-07-13 00:00:00.000 Z'
     * @example DateTime.local(2014, 7, 13).toSQL() //=> '2014-07-13 00:00:00.000 -04:00'
     * @example DateTime.local(2014, 7, 13).toSQL({ includeOffset: false }) //=> '2014-07-13 00:00:00.000'
     * @example DateTime.local(2014, 7, 13).toSQL({ includeZone: true }) //=> '2014-07-13 00:00:00.000 America/New_York'
     * @return {string}
     */
    toSQL(opts = {}) {
      if (!this.isValid) {
        return null;
      }

      return `${this.toSQLDate()} ${this.toSQLTime(opts)}`;
    }

    /**
     * Returns a string representation of this DateTime appropriate for debugging
     * @return {string}
     */
    toString() {
      return this.isValid ? this.toISO() : INVALID$1;
    }

    /**
     * Returns the epoch milliseconds of this DateTime. Alias of {@link DateTime#toMillis}
     * @return {number}
     */
    valueOf() {
      return this.toMillis();
    }

    /**
     * Returns the epoch milliseconds of this DateTime.
     * @return {number}
     */
    toMillis() {
      return this.isValid ? this.ts : NaN;
    }

    /**
     * Returns the epoch seconds of this DateTime.
     * @return {number}
     */
    toSeconds() {
      return this.isValid ? this.ts / 1000 : NaN;
    }

    /**
     * Returns the epoch seconds (as a whole number) of this DateTime.
     * @return {number}
     */
    toUnixInteger() {
      return this.isValid ? Math.floor(this.ts / 1000) : NaN;
    }

    /**
     * Returns an ISO 8601 representation of this DateTime appropriate for use in JSON.
     * @return {string}
     */
    toJSON() {
      return this.toISO();
    }

    /**
     * Returns a BSON serializable equivalent to this DateTime.
     * @return {Date}
     */
    toBSON() {
      return this.toJSDate();
    }

    /**
     * Returns a JavaScript object with this DateTime's year, month, day, and so on.
     * @param opts - options for generating the object
     * @param {boolean} [opts.includeConfig=false] - include configuration attributes in the output
     * @example DateTime.now().toObject() //=> { year: 2017, month: 4, day: 22, hour: 20, minute: 49, second: 42, millisecond: 268 }
     * @return {Object}
     */
    toObject(opts = {}) {
      if (!this.isValid) return {};

      const base = { ...this.c };

      if (opts.includeConfig) {
        base.outputCalendar = this.outputCalendar;
        base.numberingSystem = this.loc.numberingSystem;
        base.locale = this.loc.locale;
      }
      return base;
    }

    /**
     * Returns a JavaScript Date equivalent to this DateTime.
     * @return {Date}
     */
    toJSDate() {
      return new Date(this.isValid ? this.ts : NaN);
    }

    // COMPARE

    /**
     * Return the difference between two DateTimes as a Duration.
     * @param {DateTime} otherDateTime - the DateTime to compare this one to
     * @param {string|string[]} [unit=['milliseconds']] - the unit or array of units (such as 'hours' or 'days') to include in the duration.
     * @param {Object} opts - options that affect the creation of the Duration
     * @param {string} [opts.conversionAccuracy='casual'] - the conversion system to use
     * @example
     * var i1 = DateTime.fromISO('1982-05-25T09:45'),
     *     i2 = DateTime.fromISO('1983-10-14T10:30');
     * i2.diff(i1).toObject() //=> { milliseconds: 43807500000 }
     * i2.diff(i1, 'hours').toObject() //=> { hours: 12168.75 }
     * i2.diff(i1, ['months', 'days']).toObject() //=> { months: 16, days: 19.03125 }
     * i2.diff(i1, ['months', 'days', 'hours']).toObject() //=> { months: 16, days: 19, hours: 0.75 }
     * @return {Duration}
     */
    diff(otherDateTime, unit = "milliseconds", opts = {}) {
      if (!this.isValid || !otherDateTime.isValid) {
        return Duration.invalid("created by diffing an invalid DateTime");
      }

      const durOpts = { locale: this.locale, numberingSystem: this.numberingSystem, ...opts };

      const units = maybeArray(unit).map(Duration.normalizeUnit),
        otherIsLater = otherDateTime.valueOf() > this.valueOf(),
        earlier = otherIsLater ? this : otherDateTime,
        later = otherIsLater ? otherDateTime : this,
        diffed = diff(earlier, later, units, durOpts);

      return otherIsLater ? diffed.negate() : diffed;
    }

    /**
     * Return the difference between this DateTime and right now.
     * See {@link DateTime#diff}
     * @param {string|string[]} [unit=['milliseconds']] - the unit or units units (such as 'hours' or 'days') to include in the duration
     * @param {Object} opts - options that affect the creation of the Duration
     * @param {string} [opts.conversionAccuracy='casual'] - the conversion system to use
     * @return {Duration}
     */
    diffNow(unit = "milliseconds", opts = {}) {
      return this.diff(DateTime.now(), unit, opts);
    }

    /**
     * Return an Interval spanning between this DateTime and another DateTime
     * @param {DateTime} otherDateTime - the other end point of the Interval
     * @return {Interval}
     */
    until(otherDateTime) {
      return this.isValid ? Interval.fromDateTimes(this, otherDateTime) : this;
    }

    /**
     * Return whether this DateTime is in the same unit of time as another DateTime.
     * Higher-order units must also be identical for this function to return `true`.
     * Note that time zones are **ignored** in this comparison, which compares the **local** calendar time. Use {@link DateTime#setZone} to convert one of the dates if needed.
     * @param {DateTime} otherDateTime - the other DateTime
     * @param {string} unit - the unit of time to check sameness on
     * @example DateTime.now().hasSame(otherDT, 'day'); //~> true if otherDT is in the same current calendar day
     * @return {boolean}
     */
    hasSame(otherDateTime, unit) {
      if (!this.isValid) return false;

      const inputMs = otherDateTime.valueOf();
      const adjustedToZone = this.setZone(otherDateTime.zone, { keepLocalTime: true });
      return adjustedToZone.startOf(unit) <= inputMs && inputMs <= adjustedToZone.endOf(unit);
    }

    /**
     * Equality check
     * Two DateTimes are equal iff they represent the same millisecond, have the same zone and location, and are both valid.
     * To compare just the millisecond values, use `+dt1 === +dt2`.
     * @param {DateTime} other - the other DateTime
     * @return {boolean}
     */
    equals(other) {
      return (
        this.isValid &&
        other.isValid &&
        this.valueOf() === other.valueOf() &&
        this.zone.equals(other.zone) &&
        this.loc.equals(other.loc)
      );
    }

    /**
     * Returns a string representation of a this time relative to now, such as "in two days". Can only internationalize if your
     * platform supports Intl.RelativeTimeFormat. Rounds down by default.
     * @param {Object} options - options that affect the output
     * @param {DateTime} [options.base=DateTime.now()] - the DateTime to use as the basis to which this time is compared. Defaults to now.
     * @param {string} [options.style="long"] - the style of units, must be "long", "short", or "narrow"
     * @param {string|string[]} options.unit - use a specific unit or array of units; if omitted, or an array, the method will pick the best unit. Use an array or one of "years", "quarters", "months", "weeks", "days", "hours", "minutes", or "seconds"
     * @param {boolean} [options.round=true] - whether to round the numbers in the output.
     * @param {number} [options.padding=0] - padding in milliseconds. This allows you to round up the result if it fits inside the threshold. Don't use in combination with {round: false} because the decimal output will include the padding.
     * @param {string} options.locale - override the locale of this DateTime
     * @param {string} options.numberingSystem - override the numberingSystem of this DateTime. The Intl system may choose not to honor this
     * @example DateTime.now().plus({ days: 1 }).toRelative() //=> "in 1 day"
     * @example DateTime.now().setLocale("es").toRelative({ days: 1 }) //=> "dentro de 1 día"
     * @example DateTime.now().plus({ days: 1 }).toRelative({ locale: "fr" }) //=> "dans 23 heures"
     * @example DateTime.now().minus({ days: 2 }).toRelative() //=> "2 days ago"
     * @example DateTime.now().minus({ days: 2 }).toRelative({ unit: "hours" }) //=> "48 hours ago"
     * @example DateTime.now().minus({ hours: 36 }).toRelative({ round: false }) //=> "1.5 days ago"
     */
    toRelative(options = {}) {
      if (!this.isValid) return null;
      const base = options.base || DateTime.fromObject({}, { zone: this.zone }),
        padding = options.padding ? (this < base ? -options.padding : options.padding) : 0;
      let units = ["years", "months", "days", "hours", "minutes", "seconds"];
      let unit = options.unit;
      if (Array.isArray(options.unit)) {
        units = options.unit;
        unit = undefined;
      }
      return diffRelative(base, this.plus(padding), {
        ...options,
        numeric: "always",
        units,
        unit,
      });
    }

    /**
     * Returns a string representation of this date relative to today, such as "yesterday" or "next month".
     * Only internationalizes on platforms that supports Intl.RelativeTimeFormat.
     * @param {Object} options - options that affect the output
     * @param {DateTime} [options.base=DateTime.now()] - the DateTime to use as the basis to which this time is compared. Defaults to now.
     * @param {string} options.locale - override the locale of this DateTime
     * @param {string} options.unit - use a specific unit; if omitted, the method will pick the unit. Use one of "years", "quarters", "months", "weeks", or "days"
     * @param {string} options.numberingSystem - override the numberingSystem of this DateTime. The Intl system may choose not to honor this
     * @example DateTime.now().plus({ days: 1 }).toRelativeCalendar() //=> "tomorrow"
     * @example DateTime.now().setLocale("es").plus({ days: 1 }).toRelative() //=> ""mañana"
     * @example DateTime.now().plus({ days: 1 }).toRelativeCalendar({ locale: "fr" }) //=> "demain"
     * @example DateTime.now().minus({ days: 2 }).toRelativeCalendar() //=> "2 days ago"
     */
    toRelativeCalendar(options = {}) {
      if (!this.isValid) return null;

      return diffRelative(options.base || DateTime.fromObject({}, { zone: this.zone }), this, {
        ...options,
        numeric: "auto",
        units: ["years", "months", "days"],
        calendary: true,
      });
    }

    /**
     * Return the min of several date times
     * @param {...DateTime} dateTimes - the DateTimes from which to choose the minimum
     * @return {DateTime} the min DateTime, or undefined if called with no argument
     */
    static min(...dateTimes) {
      if (!dateTimes.every(DateTime.isDateTime)) {
        throw new InvalidArgumentError("min requires all arguments be DateTimes");
      }
      return bestBy(dateTimes, (i) => i.valueOf(), Math.min);
    }

    /**
     * Return the max of several date times
     * @param {...DateTime} dateTimes - the DateTimes from which to choose the maximum
     * @return {DateTime} the max DateTime, or undefined if called with no argument
     */
    static max(...dateTimes) {
      if (!dateTimes.every(DateTime.isDateTime)) {
        throw new InvalidArgumentError("max requires all arguments be DateTimes");
      }
      return bestBy(dateTimes, (i) => i.valueOf(), Math.max);
    }

    // MISC

    /**
     * Explain how a string would be parsed by fromFormat()
     * @param {string} text - the string to parse
     * @param {string} fmt - the format the string is expected to be in (see description)
     * @param {Object} options - options taken by fromFormat()
     * @return {Object}
     */
    static fromFormatExplain(text, fmt, options = {}) {
      const { locale = null, numberingSystem = null } = options,
        localeToUse = Locale.fromOpts({
          locale,
          numberingSystem,
          defaultToEN: true,
        });
      return explainFromTokens(localeToUse, text, fmt);
    }

    /**
     * @deprecated use fromFormatExplain instead
     */
    static fromStringExplain(text, fmt, options = {}) {
      return DateTime.fromFormatExplain(text, fmt, options);
    }

    // FORMAT PRESETS

    /**
     * {@link DateTime#toLocaleString} format like 10/14/1983
     * @type {Object}
     */
    static get DATE_SHORT() {
      return DATE_SHORT;
    }

    /**
     * {@link DateTime#toLocaleString} format like 'Oct 14, 1983'
     * @type {Object}
     */
    static get DATE_MED() {
      return DATE_MED;
    }

    /**
     * {@link DateTime#toLocaleString} format like 'Fri, Oct 14, 1983'
     * @type {Object}
     */
    static get DATE_MED_WITH_WEEKDAY() {
      return DATE_MED_WITH_WEEKDAY;
    }

    /**
     * {@link DateTime#toLocaleString} format like 'October 14, 1983'
     * @type {Object}
     */
    static get DATE_FULL() {
      return DATE_FULL;
    }

    /**
     * {@link DateTime#toLocaleString} format like 'Tuesday, October 14, 1983'
     * @type {Object}
     */
    static get DATE_HUGE() {
      return DATE_HUGE;
    }

    /**
     * {@link DateTime#toLocaleString} format like '09:30 AM'. Only 12-hour if the locale is.
     * @type {Object}
     */
    static get TIME_SIMPLE() {
      return TIME_SIMPLE;
    }

    /**
     * {@link DateTime#toLocaleString} format like '09:30:23 AM'. Only 12-hour if the locale is.
     * @type {Object}
     */
    static get TIME_WITH_SECONDS() {
      return TIME_WITH_SECONDS;
    }

    /**
     * {@link DateTime#toLocaleString} format like '09:30:23 AM EDT'. Only 12-hour if the locale is.
     * @type {Object}
     */
    static get TIME_WITH_SHORT_OFFSET() {
      return TIME_WITH_SHORT_OFFSET;
    }

    /**
     * {@link DateTime#toLocaleString} format like '09:30:23 AM Eastern Daylight Time'. Only 12-hour if the locale is.
     * @type {Object}
     */
    static get TIME_WITH_LONG_OFFSET() {
      return TIME_WITH_LONG_OFFSET;
    }

    /**
     * {@link DateTime#toLocaleString} format like '09:30', always 24-hour.
     * @type {Object}
     */
    static get TIME_24_SIMPLE() {
      return TIME_24_SIMPLE;
    }

    /**
     * {@link DateTime#toLocaleString} format like '09:30:23', always 24-hour.
     * @type {Object}
     */
    static get TIME_24_WITH_SECONDS() {
      return TIME_24_WITH_SECONDS;
    }

    /**
     * {@link DateTime#toLocaleString} format like '09:30:23 EDT', always 24-hour.
     * @type {Object}
     */
    static get TIME_24_WITH_SHORT_OFFSET() {
      return TIME_24_WITH_SHORT_OFFSET;
    }

    /**
     * {@link DateTime#toLocaleString} format like '09:30:23 Eastern Daylight Time', always 24-hour.
     * @type {Object}
     */
    static get TIME_24_WITH_LONG_OFFSET() {
      return TIME_24_WITH_LONG_OFFSET;
    }

    /**
     * {@link DateTime#toLocaleString} format like '10/14/1983, 9:30 AM'. Only 12-hour if the locale is.
     * @type {Object}
     */
    static get DATETIME_SHORT() {
      return DATETIME_SHORT;
    }

    /**
     * {@link DateTime#toLocaleString} format like '10/14/1983, 9:30:33 AM'. Only 12-hour if the locale is.
     * @type {Object}
     */
    static get DATETIME_SHORT_WITH_SECONDS() {
      return DATETIME_SHORT_WITH_SECONDS;
    }

    /**
     * {@link DateTime#toLocaleString} format like 'Oct 14, 1983, 9:30 AM'. Only 12-hour if the locale is.
     * @type {Object}
     */
    static get DATETIME_MED() {
      return DATETIME_MED;
    }

    /**
     * {@link DateTime#toLocaleString} format like 'Oct 14, 1983, 9:30:33 AM'. Only 12-hour if the locale is.
     * @type {Object}
     */
    static get DATETIME_MED_WITH_SECONDS() {
      return DATETIME_MED_WITH_SECONDS;
    }

    /**
     * {@link DateTime#toLocaleString} format like 'Fri, 14 Oct 1983, 9:30 AM'. Only 12-hour if the locale is.
     * @type {Object}
     */
    static get DATETIME_MED_WITH_WEEKDAY() {
      return DATETIME_MED_WITH_WEEKDAY;
    }

    /**
     * {@link DateTime#toLocaleString} format like 'October 14, 1983, 9:30 AM EDT'. Only 12-hour if the locale is.
     * @type {Object}
     */
    static get DATETIME_FULL() {
      return DATETIME_FULL;
    }

    /**
     * {@link DateTime#toLocaleString} format like 'October 14, 1983, 9:30:33 AM EDT'. Only 12-hour if the locale is.
     * @type {Object}
     */
    static get DATETIME_FULL_WITH_SECONDS() {
      return DATETIME_FULL_WITH_SECONDS;
    }

    /**
     * {@link DateTime#toLocaleString} format like 'Friday, October 14, 1983, 9:30 AM Eastern Daylight Time'. Only 12-hour if the locale is.
     * @type {Object}
     */
    static get DATETIME_HUGE() {
      return DATETIME_HUGE;
    }

    /**
     * {@link DateTime#toLocaleString} format like 'Friday, October 14, 1983, 9:30:33 AM Eastern Daylight Time'. Only 12-hour if the locale is.
     * @type {Object}
     */
    static get DATETIME_HUGE_WITH_SECONDS() {
      return DATETIME_HUGE_WITH_SECONDS;
    }
  }

  /**
   * @private
   */
  function friendlyDateTime(dateTimeish) {
    if (DateTime.isDateTime(dateTimeish)) {
      return dateTimeish;
    } else if (dateTimeish && dateTimeish.valueOf && isNumber$1(dateTimeish.valueOf())) {
      return DateTime.fromJSDate(dateTimeish);
    } else if (dateTimeish && typeof dateTimeish === "object") {
      return DateTime.fromObject(dateTimeish);
    } else {
      throw new InvalidArgumentError(
        `Unknown datetime argument: ${dateTimeish}, of type ${typeof dateTimeish}`
      );
    }
  }

  // FIXME profile adding a per-Tree TreeNode cache, validating it by
  // parent pointer
  /// The default maximum length of a `TreeBuffer` node.
  const DefaultBufferLength = 1024;
  let nextPropID = 0;
  class Range$1 {
      constructor(from, to) {
          this.from = from;
          this.to = to;
      }
  }
  /// Each [node type](#common.NodeType) or [individual tree](#common.Tree)
  /// can have metadata associated with it in props. Instances of this
  /// class represent prop names.
  class NodeProp {
      /// Create a new node prop type.
      constructor(config = {}) {
          this.id = nextPropID++;
          this.perNode = !!config.perNode;
          this.deserialize = config.deserialize || (() => {
              throw new Error("This node type doesn't define a deserialize function");
          });
      }
      /// This is meant to be used with
      /// [`NodeSet.extend`](#common.NodeSet.extend) or
      /// [`LRParser.configure`](#lr.ParserConfig.props) to compute
      /// prop values for each node type in the set. Takes a [match
      /// object](#common.NodeType^match) or function that returns undefined
      /// if the node type doesn't get this prop, and the prop's value if
      /// it does.
      add(match) {
          if (this.perNode)
              throw new RangeError("Can't add per-node props to node types");
          if (typeof match != "function")
              match = NodeType.match(match);
          return (type) => {
              let result = match(type);
              return result === undefined ? null : [this, result];
          };
      }
  }
  /// Prop that is used to describe matching delimiters. For opening
  /// delimiters, this holds an array of node names (written as a
  /// space-separated string when declaring this prop in a grammar)
  /// for the node types of closing delimiters that match it.
  NodeProp.closedBy = new NodeProp({ deserialize: str => str.split(" ") });
  /// The inverse of [`closedBy`](#common.NodeProp^closedBy). This is
  /// attached to closing delimiters, holding an array of node names
  /// of types of matching opening delimiters.
  NodeProp.openedBy = new NodeProp({ deserialize: str => str.split(" ") });
  /// Used to assign node types to groups (for example, all node
  /// types that represent an expression could be tagged with an
  /// `"Expression"` group).
  NodeProp.group = new NodeProp({ deserialize: str => str.split(" ") });
  /// The hash of the [context](#lr.ContextTracker.constructor)
  /// that the node was parsed in, if any. Used to limit reuse of
  /// contextual nodes.
  NodeProp.contextHash = new NodeProp({ perNode: true });
  /// The distance beyond the end of the node that the tokenizer
  /// looked ahead for any of the tokens inside the node. (The LR
  /// parser only stores this when it is larger than 25, for
  /// efficiency reasons.)
  NodeProp.lookAhead = new NodeProp({ perNode: true });
  /// This per-node prop is used to replace a given node, or part of a
  /// node, with another tree. This is useful to include trees from
  /// different languages in mixed-language parsers.
  NodeProp.mounted = new NodeProp({ perNode: true });
  const noProps = Object.create(null);
  /// Each node in a syntax tree has a node type associated with it.
  class NodeType {
      /// @internal
      constructor(
      /// The name of the node type. Not necessarily unique, but if the
      /// grammar was written properly, different node types with the
      /// same name within a node set should play the same semantic
      /// role.
      name, 
      /// @internal
      props, 
      /// The id of this node in its set. Corresponds to the term ids
      /// used in the parser.
      id, 
      /// @internal
      flags = 0) {
          this.name = name;
          this.props = props;
          this.id = id;
          this.flags = flags;
      }
      /// Define a node type.
      static define(spec) {
          let props = spec.props && spec.props.length ? Object.create(null) : noProps;
          let flags = (spec.top ? 1 /* Top */ : 0) | (spec.skipped ? 2 /* Skipped */ : 0) |
              (spec.error ? 4 /* Error */ : 0) | (spec.name == null ? 8 /* Anonymous */ : 0);
          let type = new NodeType(spec.name || "", props, spec.id, flags);
          if (spec.props)
              for (let src of spec.props) {
                  if (!Array.isArray(src))
                      src = src(type);
                  if (src) {
                      if (src[0].perNode)
                          throw new RangeError("Can't store a per-node prop on a node type");
                      props[src[0].id] = src[1];
                  }
              }
          return type;
      }
      /// Retrieves a node prop for this type. Will return `undefined` if
      /// the prop isn't present on this node.
      prop(prop) { return this.props[prop.id]; }
      /// True when this is the top node of a grammar.
      get isTop() { return (this.flags & 1 /* Top */) > 0; }
      /// True when this node is produced by a skip rule.
      get isSkipped() { return (this.flags & 2 /* Skipped */) > 0; }
      /// Indicates whether this is an error node.
      get isError() { return (this.flags & 4 /* Error */) > 0; }
      /// When true, this node type doesn't correspond to a user-declared
      /// named node, for example because it is used to cache repetition.
      get isAnonymous() { return (this.flags & 8 /* Anonymous */) > 0; }
      /// Returns true when this node's name or one of its
      /// [groups](#common.NodeProp^group) matches the given string.
      is(name) {
          if (typeof name == 'string') {
              if (this.name == name)
                  return true;
              let group = this.prop(NodeProp.group);
              return group ? group.indexOf(name) > -1 : false;
          }
          return this.id == name;
      }
      /// Create a function from node types to arbitrary values by
      /// specifying an object whose property names are node or
      /// [group](#common.NodeProp^group) names. Often useful with
      /// [`NodeProp.add`](#common.NodeProp.add). You can put multiple
      /// names, separated by spaces, in a single property name to map
      /// multiple node names to a single value.
      static match(map) {
          let direct = Object.create(null);
          for (let prop in map)
              for (let name of prop.split(" "))
                  direct[name] = map[prop];
          return (node) => {
              for (let groups = node.prop(NodeProp.group), i = -1; i < (groups ? groups.length : 0); i++) {
                  let found = direct[i < 0 ? node.name : groups[i]];
                  if (found)
                      return found;
              }
          };
      }
  }
  /// An empty dummy node type to use when no actual type is available.
  NodeType.none = new NodeType("", Object.create(null), 0, 8 /* Anonymous */);
  /// A node set holds a collection of node types. It is used to
  /// compactly represent trees by storing their type ids, rather than a
  /// full pointer to the type object, in a numeric array. Each parser
  /// [has](#lr.LRParser.nodeSet) a node set, and [tree
  /// buffers](#common.TreeBuffer) can only store collections of nodes
  /// from the same set. A set can have a maximum of 2**16 (65536) node
  /// types in it, so that the ids fit into 16-bit typed array slots.
  class NodeSet {
      /// Create a set with the given types. The `id` property of each
      /// type should correspond to its position within the array.
      constructor(
      /// The node types in this set, by id.
      types) {
          this.types = types;
          for (let i = 0; i < types.length; i++)
              if (types[i].id != i)
                  throw new RangeError("Node type ids should correspond to array positions when creating a node set");
      }
      /// Create a copy of this set with some node properties added. The
      /// arguments to this method can be created with
      /// [`NodeProp.add`](#common.NodeProp.add).
      extend(...props) {
          let newTypes = [];
          for (let type of this.types) {
              let newProps = null;
              for (let source of props) {
                  let add = source(type);
                  if (add) {
                      if (!newProps)
                          newProps = Object.assign({}, type.props);
                      newProps[add[0].id] = add[1];
                  }
              }
              newTypes.push(newProps ? new NodeType(type.name, newProps, type.id, type.flags) : type);
          }
          return new NodeSet(newTypes);
      }
  }
  const CachedNode = new WeakMap(), CachedInnerNode = new WeakMap();
  /// Options that control iteration. Can be combined with the `|`
  /// operator to enable multiple ones.
  var IterMode;
  (function (IterMode) {
      /// When enabled, iteration will only visit [`Tree`](#common.Tree)
      /// objects, not nodes packed into
      /// [`TreeBuffer`](#common.TreeBuffer)s.
      IterMode[IterMode["ExcludeBuffers"] = 1] = "ExcludeBuffers";
      /// Enable this to make iteration include anonymous nodes (such as
      /// the nodes that wrap repeated grammar constructs into a balanced
      /// tree).
      IterMode[IterMode["IncludeAnonymous"] = 2] = "IncludeAnonymous";
      /// By default, regular [mounted](#common.NodeProp^mounted) nodes
      /// replace their base node in iteration. Enable this to ignore them
      /// instead.
      IterMode[IterMode["IgnoreMounts"] = 4] = "IgnoreMounts";
      /// This option only applies in
      /// [`enter`](#common.SyntaxNode.enter)-style methods. It tells the
      /// library to not enter mounted overlays if one covers the given
      /// position.
      IterMode[IterMode["IgnoreOverlays"] = 8] = "IgnoreOverlays";
  })(IterMode || (IterMode = {}));
  /// A piece of syntax tree. There are two ways to approach these
  /// trees: the way they are actually stored in memory, and the
  /// convenient way.
  ///
  /// Syntax trees are stored as a tree of `Tree` and `TreeBuffer`
  /// objects. By packing detail information into `TreeBuffer` leaf
  /// nodes, the representation is made a lot more memory-efficient.
  ///
  /// However, when you want to actually work with tree nodes, this
  /// representation is very awkward, so most client code will want to
  /// use the [`TreeCursor`](#common.TreeCursor) or
  /// [`SyntaxNode`](#common.SyntaxNode) interface instead, which provides
  /// a view on some part of this data structure, and can be used to
  /// move around to adjacent nodes.
  class Tree {
      /// Construct a new tree. See also [`Tree.build`](#common.Tree^build).
      constructor(
      /// The type of the top node.
      type, 
      /// This node's child nodes.
      children, 
      /// The positions (offsets relative to the start of this tree) of
      /// the children.
      positions, 
      /// The total length of this tree
      length, 
      /// Per-node [node props](#common.NodeProp) to associate with this node.
      props) {
          this.type = type;
          this.children = children;
          this.positions = positions;
          this.length = length;
          /// @internal
          this.props = null;
          if (props && props.length) {
              this.props = Object.create(null);
              for (let [prop, value] of props)
                  this.props[typeof prop == "number" ? prop : prop.id] = value;
          }
      }
      /// @internal
      toString() {
          let mounted = this.prop(NodeProp.mounted);
          if (mounted && !mounted.overlay)
              return mounted.tree.toString();
          let children = "";
          for (let ch of this.children) {
              let str = ch.toString();
              if (str) {
                  if (children)
                      children += ",";
                  children += str;
              }
          }
          return !this.type.name ? children :
              (/\W/.test(this.type.name) && !this.type.isError ? JSON.stringify(this.type.name) : this.type.name) +
                  (children.length ? "(" + children + ")" : "");
      }
      /// Get a [tree cursor](#common.TreeCursor) positioned at the top of
      /// the tree. Mode can be used to [control](#common.IterMode) which
      /// nodes the cursor visits.
      cursor(mode = 0) {
          return new TreeCursor(this.topNode, mode);
      }
      /// Get a [tree cursor](#common.TreeCursor) pointing into this tree
      /// at the given position and side (see
      /// [`moveTo`](#common.TreeCursor.moveTo).
      cursorAt(pos, side = 0, mode = 0) {
          let scope = CachedNode.get(this) || this.topNode;
          let cursor = new TreeCursor(scope);
          cursor.moveTo(pos, side);
          CachedNode.set(this, cursor._tree);
          return cursor;
      }
      /// Get a [syntax node](#common.SyntaxNode) object for the top of the
      /// tree.
      get topNode() {
          return new TreeNode(this, 0, 0, null);
      }
      /// Get the [syntax node](#common.SyntaxNode) at the given position.
      /// If `side` is -1, this will move into nodes that end at the
      /// position. If 1, it'll move into nodes that start at the
      /// position. With 0, it'll only enter nodes that cover the position
      /// from both sides.
      ///
      /// Note that this will not enter
      /// [overlays](#common.MountedTree.overlay), and you often want
      /// [`resolveInner`](#common.Tree.resolveInner) instead.
      resolve(pos, side = 0) {
          let node = resolveNode(CachedNode.get(this) || this.topNode, pos, side, false);
          CachedNode.set(this, node);
          return node;
      }
      /// Like [`resolve`](#common.Tree.resolve), but will enter
      /// [overlaid](#common.MountedTree.overlay) nodes, producing a syntax node
      /// pointing into the innermost overlaid tree at the given position
      /// (with parent links going through all parent structure, including
      /// the host trees).
      resolveInner(pos, side = 0) {
          let node = resolveNode(CachedInnerNode.get(this) || this.topNode, pos, side, true);
          CachedInnerNode.set(this, node);
          return node;
      }
      /// Iterate over the tree and its children, calling `enter` for any
      /// node that touches the `from`/`to` region (if given) before
      /// running over such a node's children, and `leave` (if given) when
      /// leaving the node. When `enter` returns `false`, that node will
      /// not have its children iterated over (or `leave` called).
      iterate(spec) {
          let { enter, leave, from = 0, to = this.length } = spec;
          for (let c = this.cursor((spec.mode || 0) | IterMode.IncludeAnonymous);;) {
              let entered = false;
              if (c.from <= to && c.to >= from && (c.type.isAnonymous || enter(c) !== false)) {
                  if (c.firstChild())
                      continue;
                  entered = true;
              }
              for (;;) {
                  if (entered && leave && !c.type.isAnonymous)
                      leave(c);
                  if (c.nextSibling())
                      break;
                  if (!c.parent())
                      return;
                  entered = true;
              }
          }
      }
      /// Get the value of the given [node prop](#common.NodeProp) for this
      /// node. Works with both per-node and per-type props.
      prop(prop) {
          return !prop.perNode ? this.type.prop(prop) : this.props ? this.props[prop.id] : undefined;
      }
      /// Returns the node's [per-node props](#common.NodeProp.perNode) in a
      /// format that can be passed to the [`Tree`](#common.Tree)
      /// constructor.
      get propValues() {
          let result = [];
          if (this.props)
              for (let id in this.props)
                  result.push([+id, this.props[id]]);
          return result;
      }
      /// Balance the direct children of this tree, producing a copy of
      /// which may have children grouped into subtrees with type
      /// [`NodeType.none`](#common.NodeType^none).
      balance(config = {}) {
          return this.children.length <= 8 /* BranchFactor */ ? this :
              balanceRange(NodeType.none, this.children, this.positions, 0, this.children.length, 0, this.length, (children, positions, length) => new Tree(this.type, children, positions, length, this.propValues), config.makeTree || ((children, positions, length) => new Tree(NodeType.none, children, positions, length)));
      }
      /// Build a tree from a postfix-ordered buffer of node information,
      /// or a cursor over such a buffer.
      static build(data) { return buildTree(data); }
  }
  /// The empty tree
  Tree.empty = new Tree(NodeType.none, [], [], 0);
  class FlatBufferCursor {
      constructor(buffer, index) {
          this.buffer = buffer;
          this.index = index;
      }
      get id() { return this.buffer[this.index - 4]; }
      get start() { return this.buffer[this.index - 3]; }
      get end() { return this.buffer[this.index - 2]; }
      get size() { return this.buffer[this.index - 1]; }
      get pos() { return this.index; }
      next() { this.index -= 4; }
      fork() { return new FlatBufferCursor(this.buffer, this.index); }
  }
  /// Tree buffers contain (type, start, end, endIndex) quads for each
  /// node. In such a buffer, nodes are stored in prefix order (parents
  /// before children, with the endIndex of the parent indicating which
  /// children belong to it).
  class TreeBuffer {
      /// Create a tree buffer.
      constructor(
      /// The buffer's content.
      buffer, 
      /// The total length of the group of nodes in the buffer.
      length, 
      /// The node set used in this buffer.
      set) {
          this.buffer = buffer;
          this.length = length;
          this.set = set;
      }
      /// @internal
      get type() { return NodeType.none; }
      /// @internal
      toString() {
          let result = [];
          for (let index = 0; index < this.buffer.length;) {
              result.push(this.childString(index));
              index = this.buffer[index + 3];
          }
          return result.join(",");
      }
      /// @internal
      childString(index) {
          let id = this.buffer[index], endIndex = this.buffer[index + 3];
          let type = this.set.types[id], result = type.name;
          if (/\W/.test(result) && !type.isError)
              result = JSON.stringify(result);
          index += 4;
          if (endIndex == index)
              return result;
          let children = [];
          while (index < endIndex) {
              children.push(this.childString(index));
              index = this.buffer[index + 3];
          }
          return result + "(" + children.join(",") + ")";
      }
      /// @internal
      findChild(startIndex, endIndex, dir, pos, side) {
          let { buffer } = this, pick = -1;
          for (let i = startIndex; i != endIndex; i = buffer[i + 3]) {
              if (checkSide(side, pos, buffer[i + 1], buffer[i + 2])) {
                  pick = i;
                  if (dir > 0)
                      break;
              }
          }
          return pick;
      }
      /// @internal
      slice(startI, endI, from, to) {
          let b = this.buffer;
          let copy = new Uint16Array(endI - startI);
          for (let i = startI, j = 0; i < endI;) {
              copy[j++] = b[i++];
              copy[j++] = b[i++] - from;
              copy[j++] = b[i++] - from;
              copy[j++] = b[i++] - startI;
          }
          return new TreeBuffer(copy, to - from, this.set);
      }
  }
  function checkSide(side, pos, from, to) {
      switch (side) {
          case -2 /* Before */: return from < pos;
          case -1 /* AtOrBefore */: return to >= pos && from < pos;
          case 0 /* Around */: return from < pos && to > pos;
          case 1 /* AtOrAfter */: return from <= pos && to > pos;
          case 2 /* After */: return to > pos;
          case 4 /* DontCare */: return true;
      }
  }
  function enterUnfinishedNodesBefore(node, pos) {
      let scan = node.childBefore(pos);
      while (scan) {
          let last = scan.lastChild;
          if (!last || last.to != scan.to)
              break;
          if (last.type.isError && last.from == last.to) {
              node = scan;
              scan = last.prevSibling;
          }
          else {
              scan = last;
          }
      }
      return node;
  }
  function resolveNode(node, pos, side, overlays) {
      var _a;
      // Move up to a node that actually holds the position, if possible
      while (node.from == node.to ||
          (side < 1 ? node.from >= pos : node.from > pos) ||
          (side > -1 ? node.to <= pos : node.to < pos)) {
          let parent = !overlays && node instanceof TreeNode && node.index < 0 ? null : node.parent;
          if (!parent)
              return node;
          node = parent;
      }
      let mode = overlays ? 0 : IterMode.IgnoreOverlays;
      // Must go up out of overlays when those do not overlap with pos
      if (overlays)
          for (let scan = node, parent = scan.parent; parent; scan = parent, parent = scan.parent) {
              if (scan instanceof TreeNode && scan.index < 0 && ((_a = parent.enter(pos, side, mode)) === null || _a === void 0 ? void 0 : _a.from) != scan.from)
                  node = parent;
          }
      for (;;) {
          let inner = node.enter(pos, side, mode);
          if (!inner)
              return node;
          node = inner;
      }
  }
  class TreeNode {
      constructor(_tree, from, 
      // Index in parent node, set to -1 if the node is not a direct child of _parent.node (overlay)
      index, _parent) {
          this._tree = _tree;
          this.from = from;
          this.index = index;
          this._parent = _parent;
      }
      get type() { return this._tree.type; }
      get name() { return this._tree.type.name; }
      get to() { return this.from + this._tree.length; }
      nextChild(i, dir, pos, side, mode = 0) {
          for (let parent = this;;) {
              for (let { children, positions } = parent._tree, e = dir > 0 ? children.length : -1; i != e; i += dir) {
                  let next = children[i], start = positions[i] + parent.from;
                  if (!checkSide(side, pos, start, start + next.length))
                      continue;
                  if (next instanceof TreeBuffer) {
                      if (mode & IterMode.ExcludeBuffers)
                          continue;
                      let index = next.findChild(0, next.buffer.length, dir, pos - start, side);
                      if (index > -1)
                          return new BufferNode(new BufferContext(parent, next, i, start), null, index);
                  }
                  else if ((mode & IterMode.IncludeAnonymous) || (!next.type.isAnonymous || hasChild(next))) {
                      let mounted;
                      if (!(mode & IterMode.IgnoreMounts) &&
                          next.props && (mounted = next.prop(NodeProp.mounted)) && !mounted.overlay)
                          return new TreeNode(mounted.tree, start, i, parent);
                      let inner = new TreeNode(next, start, i, parent);
                      return (mode & IterMode.IncludeAnonymous) || !inner.type.isAnonymous ? inner
                          : inner.nextChild(dir < 0 ? next.children.length - 1 : 0, dir, pos, side);
                  }
              }
              if ((mode & IterMode.IncludeAnonymous) || !parent.type.isAnonymous)
                  return null;
              if (parent.index >= 0)
                  i = parent.index + dir;
              else
                  i = dir < 0 ? -1 : parent._parent._tree.children.length;
              parent = parent._parent;
              if (!parent)
                  return null;
          }
      }
      get firstChild() { return this.nextChild(0, 1, 0, 4 /* DontCare */); }
      get lastChild() { return this.nextChild(this._tree.children.length - 1, -1, 0, 4 /* DontCare */); }
      childAfter(pos) { return this.nextChild(0, 1, pos, 2 /* After */); }
      childBefore(pos) { return this.nextChild(this._tree.children.length - 1, -1, pos, -2 /* Before */); }
      enter(pos, side, mode = 0) {
          let mounted;
          if (!(mode & IterMode.IgnoreOverlays) && (mounted = this._tree.prop(NodeProp.mounted)) && mounted.overlay) {
              let rPos = pos - this.from;
              for (let { from, to } of mounted.overlay) {
                  if ((side > 0 ? from <= rPos : from < rPos) &&
                      (side < 0 ? to >= rPos : to > rPos))
                      return new TreeNode(mounted.tree, mounted.overlay[0].from + this.from, -1, this);
              }
          }
          return this.nextChild(0, 1, pos, side, mode);
      }
      nextSignificantParent() {
          let val = this;
          while (val.type.isAnonymous && val._parent)
              val = val._parent;
          return val;
      }
      get parent() {
          return this._parent ? this._parent.nextSignificantParent() : null;
      }
      get nextSibling() {
          return this._parent && this.index >= 0 ? this._parent.nextChild(this.index + 1, 1, 0, 4 /* DontCare */) : null;
      }
      get prevSibling() {
          return this._parent && this.index >= 0 ? this._parent.nextChild(this.index - 1, -1, 0, 4 /* DontCare */) : null;
      }
      cursor(mode = 0) { return new TreeCursor(this, mode); }
      get tree() { return this._tree; }
      toTree() { return this._tree; }
      resolve(pos, side = 0) {
          return resolveNode(this, pos, side, false);
      }
      resolveInner(pos, side = 0) {
          return resolveNode(this, pos, side, true);
      }
      enterUnfinishedNodesBefore(pos) { return enterUnfinishedNodesBefore(this, pos); }
      getChild(type, before = null, after = null) {
          let r = getChildren(this, type, before, after);
          return r.length ? r[0] : null;
      }
      getChildren(type, before = null, after = null) {
          return getChildren(this, type, before, after);
      }
      /// @internal
      toString() { return this._tree.toString(); }
      get node() { return this; }
      matchContext(context) { return matchNodeContext(this, context); }
  }
  function getChildren(node, type, before, after) {
      let cur = node.cursor(), result = [];
      if (!cur.firstChild())
          return result;
      if (before != null)
          while (!cur.type.is(before))
              if (!cur.nextSibling())
                  return result;
      for (;;) {
          if (after != null && cur.type.is(after))
              return result;
          if (cur.type.is(type))
              result.push(cur.node);
          if (!cur.nextSibling())
              return after == null ? result : [];
      }
  }
  function matchNodeContext(node, context, i = context.length - 1) {
      for (let p = node.parent; i >= 0; p = p.parent) {
          if (!p)
              return false;
          if (!p.type.isAnonymous) {
              if (context[i] && context[i] != p.name)
                  return false;
              i--;
          }
      }
      return true;
  }
  class BufferContext {
      constructor(parent, buffer, index, start) {
          this.parent = parent;
          this.buffer = buffer;
          this.index = index;
          this.start = start;
      }
  }
  class BufferNode {
      constructor(context, _parent, index) {
          this.context = context;
          this._parent = _parent;
          this.index = index;
          this.type = context.buffer.set.types[context.buffer.buffer[index]];
      }
      get name() { return this.type.name; }
      get from() { return this.context.start + this.context.buffer.buffer[this.index + 1]; }
      get to() { return this.context.start + this.context.buffer.buffer[this.index + 2]; }
      child(dir, pos, side) {
          let { buffer } = this.context;
          let index = buffer.findChild(this.index + 4, buffer.buffer[this.index + 3], dir, pos - this.context.start, side);
          return index < 0 ? null : new BufferNode(this.context, this, index);
      }
      get firstChild() { return this.child(1, 0, 4 /* DontCare */); }
      get lastChild() { return this.child(-1, 0, 4 /* DontCare */); }
      childAfter(pos) { return this.child(1, pos, 2 /* After */); }
      childBefore(pos) { return this.child(-1, pos, -2 /* Before */); }
      enter(pos, side, mode = 0) {
          if (mode & IterMode.ExcludeBuffers)
              return null;
          let { buffer } = this.context;
          let index = buffer.findChild(this.index + 4, buffer.buffer[this.index + 3], side > 0 ? 1 : -1, pos - this.context.start, side);
          return index < 0 ? null : new BufferNode(this.context, this, index);
      }
      get parent() {
          return this._parent || this.context.parent.nextSignificantParent();
      }
      externalSibling(dir) {
          return this._parent ? null : this.context.parent.nextChild(this.context.index + dir, dir, 0, 4 /* DontCare */);
      }
      get nextSibling() {
          let { buffer } = this.context;
          let after = buffer.buffer[this.index + 3];
          if (after < (this._parent ? buffer.buffer[this._parent.index + 3] : buffer.buffer.length))
              return new BufferNode(this.context, this._parent, after);
          return this.externalSibling(1);
      }
      get prevSibling() {
          let { buffer } = this.context;
          let parentStart = this._parent ? this._parent.index + 4 : 0;
          if (this.index == parentStart)
              return this.externalSibling(-1);
          return new BufferNode(this.context, this._parent, buffer.findChild(parentStart, this.index, -1, 0, 4 /* DontCare */));
      }
      cursor(mode = 0) { return new TreeCursor(this, mode); }
      get tree() { return null; }
      toTree() {
          let children = [], positions = [];
          let { buffer } = this.context;
          let startI = this.index + 4, endI = buffer.buffer[this.index + 3];
          if (endI > startI) {
              let from = buffer.buffer[this.index + 1], to = buffer.buffer[this.index + 2];
              children.push(buffer.slice(startI, endI, from, to));
              positions.push(0);
          }
          return new Tree(this.type, children, positions, this.to - this.from);
      }
      resolve(pos, side = 0) {
          return resolveNode(this, pos, side, false);
      }
      resolveInner(pos, side = 0) {
          return resolveNode(this, pos, side, true);
      }
      enterUnfinishedNodesBefore(pos) { return enterUnfinishedNodesBefore(this, pos); }
      /// @internal
      toString() { return this.context.buffer.childString(this.index); }
      getChild(type, before = null, after = null) {
          let r = getChildren(this, type, before, after);
          return r.length ? r[0] : null;
      }
      getChildren(type, before = null, after = null) {
          return getChildren(this, type, before, after);
      }
      get node() { return this; }
      matchContext(context) { return matchNodeContext(this, context); }
  }
  /// A tree cursor object focuses on a given node in a syntax tree, and
  /// allows you to move to adjacent nodes.
  class TreeCursor {
      /// @internal
      constructor(node, 
      /// @internal
      mode = 0) {
          this.mode = mode;
          /// @internal
          this.buffer = null;
          this.stack = [];
          /// @internal
          this.index = 0;
          this.bufferNode = null;
          if (node instanceof TreeNode) {
              this.yieldNode(node);
          }
          else {
              this._tree = node.context.parent;
              this.buffer = node.context;
              for (let n = node._parent; n; n = n._parent)
                  this.stack.unshift(n.index);
              this.bufferNode = node;
              this.yieldBuf(node.index);
          }
      }
      /// Shorthand for `.type.name`.
      get name() { return this.type.name; }
      yieldNode(node) {
          if (!node)
              return false;
          this._tree = node;
          this.type = node.type;
          this.from = node.from;
          this.to = node.to;
          return true;
      }
      yieldBuf(index, type) {
          this.index = index;
          let { start, buffer } = this.buffer;
          this.type = type || buffer.set.types[buffer.buffer[index]];
          this.from = start + buffer.buffer[index + 1];
          this.to = start + buffer.buffer[index + 2];
          return true;
      }
      yield(node) {
          if (!node)
              return false;
          if (node instanceof TreeNode) {
              this.buffer = null;
              return this.yieldNode(node);
          }
          this.buffer = node.context;
          return this.yieldBuf(node.index, node.type);
      }
      /// @internal
      toString() {
          return this.buffer ? this.buffer.buffer.childString(this.index) : this._tree.toString();
      }
      /// @internal
      enterChild(dir, pos, side) {
          if (!this.buffer)
              return this.yield(this._tree.nextChild(dir < 0 ? this._tree._tree.children.length - 1 : 0, dir, pos, side, this.mode));
          let { buffer } = this.buffer;
          let index = buffer.findChild(this.index + 4, buffer.buffer[this.index + 3], dir, pos - this.buffer.start, side);
          if (index < 0)
              return false;
          this.stack.push(this.index);
          return this.yieldBuf(index);
      }
      /// Move the cursor to this node's first child. When this returns
      /// false, the node has no child, and the cursor has not been moved.
      firstChild() { return this.enterChild(1, 0, 4 /* DontCare */); }
      /// Move the cursor to this node's last child.
      lastChild() { return this.enterChild(-1, 0, 4 /* DontCare */); }
      /// Move the cursor to the first child that ends after `pos`.
      childAfter(pos) { return this.enterChild(1, pos, 2 /* After */); }
      /// Move to the last child that starts before `pos`.
      childBefore(pos) { return this.enterChild(-1, pos, -2 /* Before */); }
      /// Move the cursor to the child around `pos`. If side is -1 the
      /// child may end at that position, when 1 it may start there. This
      /// will also enter [overlaid](#common.MountedTree.overlay)
      /// [mounted](#common.NodeProp^mounted) trees unless `overlays` is
      /// set to false.
      enter(pos, side, mode = this.mode) {
          if (!this.buffer)
              return this.yield(this._tree.enter(pos, side, mode));
          return mode & IterMode.ExcludeBuffers ? false : this.enterChild(1, pos, side);
      }
      /// Move to the node's parent node, if this isn't the top node.
      parent() {
          if (!this.buffer)
              return this.yieldNode((this.mode & IterMode.IncludeAnonymous) ? this._tree._parent : this._tree.parent);
          if (this.stack.length)
              return this.yieldBuf(this.stack.pop());
          let parent = (this.mode & IterMode.IncludeAnonymous) ? this.buffer.parent : this.buffer.parent.nextSignificantParent();
          this.buffer = null;
          return this.yieldNode(parent);
      }
      /// @internal
      sibling(dir) {
          if (!this.buffer)
              return !this._tree._parent ? false
                  : this.yield(this._tree.index < 0 ? null
                      : this._tree._parent.nextChild(this._tree.index + dir, dir, 0, 4 /* DontCare */, this.mode));
          let { buffer } = this.buffer, d = this.stack.length - 1;
          if (dir < 0) {
              let parentStart = d < 0 ? 0 : this.stack[d] + 4;
              if (this.index != parentStart)
                  return this.yieldBuf(buffer.findChild(parentStart, this.index, -1, 0, 4 /* DontCare */));
          }
          else {
              let after = buffer.buffer[this.index + 3];
              if (after < (d < 0 ? buffer.buffer.length : buffer.buffer[this.stack[d] + 3]))
                  return this.yieldBuf(after);
          }
          return d < 0 ? this.yield(this.buffer.parent.nextChild(this.buffer.index + dir, dir, 0, 4 /* DontCare */, this.mode)) : false;
      }
      /// Move to this node's next sibling, if any.
      nextSibling() { return this.sibling(1); }
      /// Move to this node's previous sibling, if any.
      prevSibling() { return this.sibling(-1); }
      atLastNode(dir) {
          let index, parent, { buffer } = this;
          if (buffer) {
              if (dir > 0) {
                  if (this.index < buffer.buffer.buffer.length)
                      return false;
              }
              else {
                  for (let i = 0; i < this.index; i++)
                      if (buffer.buffer.buffer[i + 3] < this.index)
                          return false;
              }
              ({ index, parent } = buffer);
          }
          else {
              ({ index, _parent: parent } = this._tree);
          }
          for (; parent; { index, _parent: parent } = parent) {
              if (index > -1)
                  for (let i = index + dir, e = dir < 0 ? -1 : parent._tree.children.length; i != e; i += dir) {
                      let child = parent._tree.children[i];
                      if ((this.mode & IterMode.IncludeAnonymous) ||
                          child instanceof TreeBuffer ||
                          !child.type.isAnonymous ||
                          hasChild(child))
                          return false;
                  }
          }
          return true;
      }
      move(dir, enter) {
          if (enter && this.enterChild(dir, 0, 4 /* DontCare */))
              return true;
          for (;;) {
              if (this.sibling(dir))
                  return true;
              if (this.atLastNode(dir) || !this.parent())
                  return false;
          }
      }
      /// Move to the next node in a
      /// [pre-order](https://en.wikipedia.org/wiki/Tree_traversal#Pre-order_(NLR))
      /// traversal, going from a node to its first child or, if the
      /// current node is empty or `enter` is false, its next sibling or
      /// the next sibling of the first parent node that has one.
      next(enter = true) { return this.move(1, enter); }
      /// Move to the next node in a last-to-first pre-order traveral. A
      /// node is followed by its last child or, if it has none, its
      /// previous sibling or the previous sibling of the first parent
      /// node that has one.
      prev(enter = true) { return this.move(-1, enter); }
      /// Move the cursor to the innermost node that covers `pos`. If
      /// `side` is -1, it will enter nodes that end at `pos`. If it is 1,
      /// it will enter nodes that start at `pos`.
      moveTo(pos, side = 0) {
          // Move up to a node that actually holds the position, if possible
          while (this.from == this.to ||
              (side < 1 ? this.from >= pos : this.from > pos) ||
              (side > -1 ? this.to <= pos : this.to < pos))
              if (!this.parent())
                  break;
          // Then scan down into child nodes as far as possible
          while (this.enterChild(1, pos, side)) { }
          return this;
      }
      /// Get a [syntax node](#common.SyntaxNode) at the cursor's current
      /// position.
      get node() {
          if (!this.buffer)
              return this._tree;
          let cache = this.bufferNode, result = null, depth = 0;
          if (cache && cache.context == this.buffer) {
              scan: for (let index = this.index, d = this.stack.length; d >= 0;) {
                  for (let c = cache; c; c = c._parent)
                      if (c.index == index) {
                          if (index == this.index)
                              return c;
                          result = c;
                          depth = d + 1;
                          break scan;
                      }
                  index = this.stack[--d];
              }
          }
          for (let i = depth; i < this.stack.length; i++)
              result = new BufferNode(this.buffer, result, this.stack[i]);
          return this.bufferNode = new BufferNode(this.buffer, result, this.index);
      }
      /// Get the [tree](#common.Tree) that represents the current node, if
      /// any. Will return null when the node is in a [tree
      /// buffer](#common.TreeBuffer).
      get tree() {
          return this.buffer ? null : this._tree._tree;
      }
      /// Iterate over the current node and all its descendants, calling
      /// `enter` when entering a node and `leave`, if given, when leaving
      /// one. When `enter` returns `false`, any children of that node are
      /// skipped, and `leave` isn't called for it.
      iterate(enter, leave) {
          for (let depth = 0;;) {
              let mustLeave = false;
              if (this.type.isAnonymous || enter(this) !== false) {
                  if (this.firstChild()) {
                      depth++;
                      continue;
                  }
                  if (!this.type.isAnonymous)
                      mustLeave = true;
              }
              for (;;) {
                  if (mustLeave && leave)
                      leave(this);
                  mustLeave = this.type.isAnonymous;
                  if (this.nextSibling())
                      break;
                  if (!depth)
                      return;
                  this.parent();
                  depth--;
                  mustLeave = true;
              }
          }
      }
      /// Test whether the current node matches a given context—a sequence
      /// of direct parent node names. Empty strings in the context array
      /// are treated as wildcards.
      matchContext(context) {
          if (!this.buffer)
              return matchNodeContext(this.node, context);
          let { buffer } = this.buffer, { types } = buffer.set;
          for (let i = context.length - 1, d = this.stack.length - 1; i >= 0; d--) {
              if (d < 0)
                  return matchNodeContext(this.node, context, i);
              let type = types[buffer.buffer[this.stack[d]]];
              if (!type.isAnonymous) {
                  if (context[i] && context[i] != type.name)
                      return false;
                  i--;
              }
          }
          return true;
      }
  }
  function hasChild(tree) {
      return tree.children.some(ch => ch instanceof TreeBuffer || !ch.type.isAnonymous || hasChild(ch));
  }
  function buildTree(data) {
      var _a;
      let { buffer, nodeSet, maxBufferLength = DefaultBufferLength, reused = [], minRepeatType = nodeSet.types.length } = data;
      let cursor = Array.isArray(buffer) ? new FlatBufferCursor(buffer, buffer.length) : buffer;
      let types = nodeSet.types;
      let contextHash = 0, lookAhead = 0;
      function takeNode(parentStart, minPos, children, positions, inRepeat) {
          let { id, start, end, size } = cursor;
          let lookAheadAtStart = lookAhead;
          while (size < 0) {
              cursor.next();
              if (size == -1 /* Reuse */) {
                  let node = reused[id];
                  children.push(node);
                  positions.push(start - parentStart);
                  return;
              }
              else if (size == -3 /* ContextChange */) { // Context change
                  contextHash = id;
                  return;
              }
              else if (size == -4 /* LookAhead */) {
                  lookAhead = id;
                  return;
              }
              else {
                  throw new RangeError(`Unrecognized record size: ${size}`);
              }
          }
          let type = types[id], node, buffer;
          let startPos = start - parentStart;
          if (end - start <= maxBufferLength && (buffer = findBufferSize(cursor.pos - minPos, inRepeat))) {
              // Small enough for a buffer, and no reused nodes inside
              let data = new Uint16Array(buffer.size - buffer.skip);
              let endPos = cursor.pos - buffer.size, index = data.length;
              while (cursor.pos > endPos)
                  index = copyToBuffer(buffer.start, data, index);
              node = new TreeBuffer(data, end - buffer.start, nodeSet);
              startPos = buffer.start - parentStart;
          }
          else { // Make it a node
              let endPos = cursor.pos - size;
              cursor.next();
              let localChildren = [], localPositions = [];
              let localInRepeat = id >= minRepeatType ? id : -1;
              let lastGroup = 0, lastEnd = end;
              while (cursor.pos > endPos) {
                  if (localInRepeat >= 0 && cursor.id == localInRepeat && cursor.size >= 0) {
                      if (cursor.end <= lastEnd - maxBufferLength) {
                          makeRepeatLeaf(localChildren, localPositions, start, lastGroup, cursor.end, lastEnd, localInRepeat, lookAheadAtStart);
                          lastGroup = localChildren.length;
                          lastEnd = cursor.end;
                      }
                      cursor.next();
                  }
                  else {
                      takeNode(start, endPos, localChildren, localPositions, localInRepeat);
                  }
              }
              if (localInRepeat >= 0 && lastGroup > 0 && lastGroup < localChildren.length)
                  makeRepeatLeaf(localChildren, localPositions, start, lastGroup, start, lastEnd, localInRepeat, lookAheadAtStart);
              localChildren.reverse();
              localPositions.reverse();
              if (localInRepeat > -1 && lastGroup > 0) {
                  let make = makeBalanced(type);
                  node = balanceRange(type, localChildren, localPositions, 0, localChildren.length, 0, end - start, make, make);
              }
              else {
                  node = makeTree(type, localChildren, localPositions, end - start, lookAheadAtStart - end);
              }
          }
          children.push(node);
          positions.push(startPos);
      }
      function makeBalanced(type) {
          return (children, positions, length) => {
              let lookAhead = 0, lastI = children.length - 1, last, lookAheadProp;
              if (lastI >= 0 && (last = children[lastI]) instanceof Tree) {
                  if (!lastI && last.type == type && last.length == length)
                      return last;
                  if (lookAheadProp = last.prop(NodeProp.lookAhead))
                      lookAhead = positions[lastI] + last.length + lookAheadProp;
              }
              return makeTree(type, children, positions, length, lookAhead);
          };
      }
      function makeRepeatLeaf(children, positions, base, i, from, to, type, lookAhead) {
          let localChildren = [], localPositions = [];
          while (children.length > i) {
              localChildren.push(children.pop());
              localPositions.push(positions.pop() + base - from);
          }
          children.push(makeTree(nodeSet.types[type], localChildren, localPositions, to - from, lookAhead - to));
          positions.push(from - base);
      }
      function makeTree(type, children, positions, length, lookAhead = 0, props) {
          if (contextHash) {
              let pair = [NodeProp.contextHash, contextHash];
              props = props ? [pair].concat(props) : [pair];
          }
          if (lookAhead > 25) {
              let pair = [NodeProp.lookAhead, lookAhead];
              props = props ? [pair].concat(props) : [pair];
          }
          return new Tree(type, children, positions, length, props);
      }
      function findBufferSize(maxSize, inRepeat) {
          // Scan through the buffer to find previous siblings that fit
          // together in a TreeBuffer, and don't contain any reused nodes
          // (which can't be stored in a buffer).
          // If `inRepeat` is > -1, ignore node boundaries of that type for
          // nesting, but make sure the end falls either at the start
          // (`maxSize`) or before such a node.
          let fork = cursor.fork();
          let size = 0, start = 0, skip = 0, minStart = fork.end - maxBufferLength;
          let result = { size: 0, start: 0, skip: 0 };
          scan: for (let minPos = fork.pos - maxSize; fork.pos > minPos;) {
              let nodeSize = fork.size;
              // Pretend nested repeat nodes of the same type don't exist
              if (fork.id == inRepeat && nodeSize >= 0) {
                  // Except that we store the current state as a valid return
                  // value.
                  result.size = size;
                  result.start = start;
                  result.skip = skip;
                  skip += 4;
                  size += 4;
                  fork.next();
                  continue;
              }
              let startPos = fork.pos - nodeSize;
              if (nodeSize < 0 || startPos < minPos || fork.start < minStart)
                  break;
              let localSkipped = fork.id >= minRepeatType ? 4 : 0;
              let nodeStart = fork.start;
              fork.next();
              while (fork.pos > startPos) {
                  if (fork.size < 0) {
                      if (fork.size == -3 /* ContextChange */)
                          localSkipped += 4;
                      else
                          break scan;
                  }
                  else if (fork.id >= minRepeatType) {
                      localSkipped += 4;
                  }
                  fork.next();
              }
              start = nodeStart;
              size += nodeSize;
              skip += localSkipped;
          }
          if (inRepeat < 0 || size == maxSize) {
              result.size = size;
              result.start = start;
              result.skip = skip;
          }
          return result.size > 4 ? result : undefined;
      }
      function copyToBuffer(bufferStart, buffer, index) {
          let { id, start, end, size } = cursor;
          cursor.next();
          if (size >= 0 && id < minRepeatType) {
              let startIndex = index;
              if (size > 4) {
                  let endPos = cursor.pos - (size - 4);
                  while (cursor.pos > endPos)
                      index = copyToBuffer(bufferStart, buffer, index);
              }
              buffer[--index] = startIndex;
              buffer[--index] = end - bufferStart;
              buffer[--index] = start - bufferStart;
              buffer[--index] = id;
          }
          else if (size == -3 /* ContextChange */) {
              contextHash = id;
          }
          else if (size == -4 /* LookAhead */) {
              lookAhead = id;
          }
          return index;
      }
      let children = [], positions = [];
      while (cursor.pos > 0)
          takeNode(data.start || 0, data.bufferStart || 0, children, positions, -1);
      let length = (_a = data.length) !== null && _a !== void 0 ? _a : (children.length ? positions[0] + children[0].length : 0);
      return new Tree(types[data.topID], children.reverse(), positions.reverse(), length);
  }
  const nodeSizeCache = new WeakMap;
  function nodeSize(balanceType, node) {
      if (!balanceType.isAnonymous || node instanceof TreeBuffer || node.type != balanceType)
          return 1;
      let size = nodeSizeCache.get(node);
      if (size == null) {
          size = 1;
          for (let child of node.children) {
              if (child.type != balanceType || !(child instanceof Tree)) {
                  size = 1;
                  break;
              }
              size += nodeSize(balanceType, child);
          }
          nodeSizeCache.set(node, size);
      }
      return size;
  }
  function balanceRange(
  // The type the balanced tree's inner nodes.
  balanceType, 
  // The direct children and their positions
  children, positions, 
  // The index range in children/positions to use
  from, to, 
  // The start position of the nodes, relative to their parent.
  start, 
  // Length of the outer node
  length, 
  // Function to build the top node of the balanced tree
  mkTop, 
  // Function to build internal nodes for the balanced tree
  mkTree) {
      let total = 0;
      for (let i = from; i < to; i++)
          total += nodeSize(balanceType, children[i]);
      let maxChild = Math.ceil((total * 1.5) / 8 /* BranchFactor */);
      let localChildren = [], localPositions = [];
      function divide(children, positions, from, to, offset) {
          for (let i = from; i < to;) {
              let groupFrom = i, groupStart = positions[i], groupSize = nodeSize(balanceType, children[i]);
              i++;
              for (; i < to; i++) {
                  let nextSize = nodeSize(balanceType, children[i]);
                  if (groupSize + nextSize >= maxChild)
                      break;
                  groupSize += nextSize;
              }
              if (i == groupFrom + 1) {
                  if (groupSize > maxChild) {
                      let only = children[groupFrom]; // Only trees can have a size > 1
                      divide(only.children, only.positions, 0, only.children.length, positions[groupFrom] + offset);
                      continue;
                  }
                  localChildren.push(children[groupFrom]);
              }
              else {
                  let length = positions[i - 1] + children[i - 1].length - groupStart;
                  localChildren.push(balanceRange(balanceType, children, positions, groupFrom, i, groupStart, length, null, mkTree));
              }
              localPositions.push(groupStart + offset - start);
          }
      }
      divide(children, positions, from, to, 0);
      return (mkTop || mkTree)(localChildren, localPositions, length);
  }
  /// A superclass that parsers should extend.
  class Parser {
      /// Start a parse, returning a [partial parse](#common.PartialParse)
      /// object. [`fragments`](#common.TreeFragment) can be passed in to
      /// make the parse incremental.
      ///
      /// By default, the entire input is parsed. You can pass `ranges`,
      /// which should be a sorted array of non-empty, non-overlapping
      /// ranges, to parse only those ranges. The tree returned in that
      /// case will start at `ranges[0].from`.
      startParse(input, fragments, ranges) {
          if (typeof input == "string")
              input = new StringInput(input);
          ranges = !ranges ? [new Range$1(0, input.length)] : ranges.length ? ranges.map(r => new Range$1(r.from, r.to)) : [new Range$1(0, 0)];
          return this.createParse(input, fragments || [], ranges);
      }
      /// Run a full parse, returning the resulting tree.
      parse(input, fragments, ranges) {
          let parse = this.startParse(input, fragments, ranges);
          for (;;) {
              let done = parse.advance();
              if (done)
                  return done;
          }
      }
  }
  class StringInput {
      constructor(string) {
          this.string = string;
      }
      get length() { return this.string.length; }
      chunk(from) { return this.string.slice(from); }
      get lineChunks() { return false; }
      read(from, to) { return this.string.slice(from, to); }
  }
  new NodeProp({ perNode: true });

  /// A parse stack. These are used internally by the parser to track
  /// parsing progress. They also provide some properties and methods
  /// that external code such as a tokenizer can use to get information
  /// about the parse state.
  class Stack {
      /// @internal
      constructor(
      /// The parse that this stack is part of @internal
      p, 
      /// Holds state, input pos, buffer index triplets for all but the
      /// top state @internal
      stack, 
      /// The current parse state @internal
      state, 
      // The position at which the next reduce should take place. This
      // can be less than `this.pos` when skipped expressions have been
      // added to the stack (which should be moved outside of the next
      // reduction)
      /// @internal
      reducePos, 
      /// The input position up to which this stack has parsed.
      pos, 
      /// The dynamic score of the stack, including dynamic precedence
      /// and error-recovery penalties
      /// @internal
      score, 
      // The output buffer. Holds (type, start, end, size) quads
      // representing nodes created by the parser, where `size` is
      // amount of buffer array entries covered by this node.
      /// @internal
      buffer, 
      // The base offset of the buffer. When stacks are split, the split
      // instance shared the buffer history with its parent up to
      // `bufferBase`, which is the absolute offset (including the
      // offset of previous splits) into the buffer at which this stack
      // starts writing.
      /// @internal
      bufferBase, 
      /// @internal
      curContext, 
      /// @internal
      lookAhead = 0, 
      // A parent stack from which this was split off, if any. This is
      // set up so that it always points to a stack that has some
      // additional buffer content, never to a stack with an equal
      // `bufferBase`.
      /// @internal
      parent) {
          this.p = p;
          this.stack = stack;
          this.state = state;
          this.reducePos = reducePos;
          this.pos = pos;
          this.score = score;
          this.buffer = buffer;
          this.bufferBase = bufferBase;
          this.curContext = curContext;
          this.lookAhead = lookAhead;
          this.parent = parent;
      }
      /// @internal
      toString() {
          return `[${this.stack.filter((_, i) => i % 3 == 0).concat(this.state)}]@${this.pos}${this.score ? "!" + this.score : ""}`;
      }
      // Start an empty stack
      /// @internal
      static start(p, state, pos = 0) {
          let cx = p.parser.context;
          return new Stack(p, [], state, pos, pos, 0, [], 0, cx ? new StackContext(cx, cx.start) : null, 0, null);
      }
      /// The stack's current [context](#lr.ContextTracker) value, if
      /// any. Its type will depend on the context tracker's type
      /// parameter, or it will be `null` if there is no context
      /// tracker.
      get context() { return this.curContext ? this.curContext.context : null; }
      // Push a state onto the stack, tracking its start position as well
      // as the buffer base at that point.
      /// @internal
      pushState(state, start) {
          this.stack.push(this.state, start, this.bufferBase + this.buffer.length);
          this.state = state;
      }
      // Apply a reduce action
      /// @internal
      reduce(action) {
          let depth = action >> 19 /* ReduceDepthShift */, type = action & 65535 /* ValueMask */;
          let { parser } = this.p;
          let dPrec = parser.dynamicPrecedence(type);
          if (dPrec)
              this.score += dPrec;
          if (depth == 0) {
              this.pushState(parser.getGoto(this.state, type, true), this.reducePos);
              // Zero-depth reductions are a special case—they add stuff to
              // the stack without popping anything off.
              if (type < parser.minRepeatTerm)
                  this.storeNode(type, this.reducePos, this.reducePos, 4, true);
              this.reduceContext(type, this.reducePos);
              return;
          }
          // Find the base index into `this.stack`, content after which will
          // be dropped. Note that with `StayFlag` reductions we need to
          // consume two extra frames (the dummy parent node for the skipped
          // expression and the state that we'll be staying in, which should
          // be moved to `this.state`).
          let base = this.stack.length - ((depth - 1) * 3) - (action & 262144 /* StayFlag */ ? 6 : 0);
          let start = this.stack[base - 2];
          let bufferBase = this.stack[base - 1], count = this.bufferBase + this.buffer.length - bufferBase;
          // Store normal terms or `R -> R R` repeat reductions
          if (type < parser.minRepeatTerm || (action & 131072 /* RepeatFlag */)) {
              let pos = parser.stateFlag(this.state, 1 /* Skipped */) ? this.pos : this.reducePos;
              this.storeNode(type, start, pos, count + 4, true);
          }
          if (action & 262144 /* StayFlag */) {
              this.state = this.stack[base];
          }
          else {
              let baseStateID = this.stack[base - 3];
              this.state = parser.getGoto(baseStateID, type, true);
          }
          while (this.stack.length > base)
              this.stack.pop();
          this.reduceContext(type, start);
      }
      // Shift a value into the buffer
      /// @internal
      storeNode(term, start, end, size = 4, isReduce = false) {
          if (term == 0 /* Err */ &&
              (!this.stack.length || this.stack[this.stack.length - 1] < this.buffer.length + this.bufferBase)) {
              // Try to omit/merge adjacent error nodes
              let cur = this, top = this.buffer.length;
              if (top == 0 && cur.parent) {
                  top = cur.bufferBase - cur.parent.bufferBase;
                  cur = cur.parent;
              }
              if (top > 0 && cur.buffer[top - 4] == 0 /* Err */ && cur.buffer[top - 1] > -1) {
                  if (start == end)
                      return;
                  if (cur.buffer[top - 2] >= start) {
                      cur.buffer[top - 2] = end;
                      return;
                  }
              }
          }
          if (!isReduce || this.pos == end) { // Simple case, just append
              this.buffer.push(term, start, end, size);
          }
          else { // There may be skipped nodes that have to be moved forward
              let index = this.buffer.length;
              if (index > 0 && this.buffer[index - 4] != 0 /* Err */)
                  while (index > 0 && this.buffer[index - 2] > end) {
                      // Move this record forward
                      this.buffer[index] = this.buffer[index - 4];
                      this.buffer[index + 1] = this.buffer[index - 3];
                      this.buffer[index + 2] = this.buffer[index - 2];
                      this.buffer[index + 3] = this.buffer[index - 1];
                      index -= 4;
                      if (size > 4)
                          size -= 4;
                  }
              this.buffer[index] = term;
              this.buffer[index + 1] = start;
              this.buffer[index + 2] = end;
              this.buffer[index + 3] = size;
          }
      }
      // Apply a shift action
      /// @internal
      shift(action, next, nextEnd) {
          let start = this.pos;
          if (action & 131072 /* GotoFlag */) {
              this.pushState(action & 65535 /* ValueMask */, this.pos);
          }
          else if ((action & 262144 /* StayFlag */) == 0) { // Regular shift
              let nextState = action, { parser } = this.p;
              if (nextEnd > this.pos || next <= parser.maxNode) {
                  this.pos = nextEnd;
                  if (!parser.stateFlag(nextState, 1 /* Skipped */))
                      this.reducePos = nextEnd;
              }
              this.pushState(nextState, start);
              this.shiftContext(next, start);
              if (next <= parser.maxNode)
                  this.buffer.push(next, start, nextEnd, 4);
          }
          else { // Shift-and-stay, which means this is a skipped token
              this.pos = nextEnd;
              this.shiftContext(next, start);
              if (next <= this.p.parser.maxNode)
                  this.buffer.push(next, start, nextEnd, 4);
          }
      }
      // Apply an action
      /// @internal
      apply(action, next, nextEnd) {
          if (action & 65536 /* ReduceFlag */)
              this.reduce(action);
          else
              this.shift(action, next, nextEnd);
      }
      // Add a prebuilt (reused) node into the buffer.
      /// @internal
      useNode(value, next) {
          let index = this.p.reused.length - 1;
          if (index < 0 || this.p.reused[index] != value) {
              this.p.reused.push(value);
              index++;
          }
          let start = this.pos;
          this.reducePos = this.pos = start + value.length;
          this.pushState(next, start);
          this.buffer.push(index, start, this.reducePos, -1 /* size == -1 means this is a reused value */);
          if (this.curContext)
              this.updateContext(this.curContext.tracker.reuse(this.curContext.context, value, this, this.p.stream.reset(this.pos - value.length)));
      }
      // Split the stack. Due to the buffer sharing and the fact
      // that `this.stack` tends to stay quite shallow, this isn't very
      // expensive.
      /// @internal
      split() {
          let parent = this;
          let off = parent.buffer.length;
          // Because the top of the buffer (after this.pos) may be mutated
          // to reorder reductions and skipped tokens, and shared buffers
          // should be immutable, this copies any outstanding skipped tokens
          // to the new buffer, and puts the base pointer before them.
          while (off > 0 && parent.buffer[off - 2] > parent.reducePos)
              off -= 4;
          let buffer = parent.buffer.slice(off), base = parent.bufferBase + off;
          // Make sure parent points to an actual parent with content, if there is such a parent.
          while (parent && base == parent.bufferBase)
              parent = parent.parent;
          return new Stack(this.p, this.stack.slice(), this.state, this.reducePos, this.pos, this.score, buffer, base, this.curContext, this.lookAhead, parent);
      }
      // Try to recover from an error by 'deleting' (ignoring) one token.
      /// @internal
      recoverByDelete(next, nextEnd) {
          let isNode = next <= this.p.parser.maxNode;
          if (isNode)
              this.storeNode(next, this.pos, nextEnd, 4);
          this.storeNode(0 /* Err */, this.pos, nextEnd, isNode ? 8 : 4);
          this.pos = this.reducePos = nextEnd;
          this.score -= 190 /* Delete */;
      }
      /// Check if the given term would be able to be shifted (optionally
      /// after some reductions) on this stack. This can be useful for
      /// external tokenizers that want to make sure they only provide a
      /// given token when it applies.
      canShift(term) {
          for (let sim = new SimulatedStack(this);;) {
              let action = this.p.parser.stateSlot(sim.state, 4 /* DefaultReduce */) || this.p.parser.hasAction(sim.state, term);
              if (action == 0)
                  return false;
              if ((action & 65536 /* ReduceFlag */) == 0)
                  return true;
              sim.reduce(action);
          }
      }
      // Apply up to Recover.MaxNext recovery actions that conceptually
      // inserts some missing token or rule.
      /// @internal
      recoverByInsert(next) {
          if (this.stack.length >= 300 /* MaxInsertStackDepth */)
              return [];
          let nextStates = this.p.parser.nextStates(this.state);
          if (nextStates.length > 4 /* MaxNext */ << 1 || this.stack.length >= 120 /* DampenInsertStackDepth */) {
              let best = [];
              for (let i = 0, s; i < nextStates.length; i += 2) {
                  if ((s = nextStates[i + 1]) != this.state && this.p.parser.hasAction(s, next))
                      best.push(nextStates[i], s);
              }
              if (this.stack.length < 120 /* DampenInsertStackDepth */)
                  for (let i = 0; best.length < 4 /* MaxNext */ << 1 && i < nextStates.length; i += 2) {
                      let s = nextStates[i + 1];
                      if (!best.some((v, i) => (i & 1) && v == s))
                          best.push(nextStates[i], s);
                  }
              nextStates = best;
          }
          let result = [];
          for (let i = 0; i < nextStates.length && result.length < 4 /* MaxNext */; i += 2) {
              let s = nextStates[i + 1];
              if (s == this.state)
                  continue;
              let stack = this.split();
              stack.pushState(s, this.pos);
              stack.storeNode(0 /* Err */, stack.pos, stack.pos, 4, true);
              stack.shiftContext(nextStates[i], this.pos);
              stack.score -= 200 /* Insert */;
              result.push(stack);
          }
          return result;
      }
      // Force a reduce, if possible. Return false if that can't
      // be done.
      /// @internal
      forceReduce() {
          let reduce = this.p.parser.stateSlot(this.state, 5 /* ForcedReduce */);
          if ((reduce & 65536 /* ReduceFlag */) == 0)
              return false;
          let { parser } = this.p;
          if (!parser.validAction(this.state, reduce)) {
              let depth = reduce >> 19 /* ReduceDepthShift */, term = reduce & 65535 /* ValueMask */;
              let target = this.stack.length - depth * 3;
              if (target < 0 || parser.getGoto(this.stack[target], term, false) < 0)
                  return false;
              this.storeNode(0 /* Err */, this.reducePos, this.reducePos, 4, true);
              this.score -= 100 /* Reduce */;
          }
          this.reducePos = this.pos;
          this.reduce(reduce);
          return true;
      }
      /// @internal
      forceAll() {
          while (!this.p.parser.stateFlag(this.state, 2 /* Accepting */)) {
              if (!this.forceReduce()) {
                  this.storeNode(0 /* Err */, this.pos, this.pos, 4, true);
                  break;
              }
          }
          return this;
      }
      /// Check whether this state has no further actions (assumed to be a direct descendant of the
      /// top state, since any other states must be able to continue
      /// somehow). @internal
      get deadEnd() {
          if (this.stack.length != 3)
              return false;
          let { parser } = this.p;
          return parser.data[parser.stateSlot(this.state, 1 /* Actions */)] == 65535 /* End */ &&
              !parser.stateSlot(this.state, 4 /* DefaultReduce */);
      }
      /// Restart the stack (put it back in its start state). Only safe
      /// when this.stack.length == 3 (state is directly below the top
      /// state). @internal
      restart() {
          this.state = this.stack[0];
          this.stack.length = 0;
      }
      /// @internal
      sameState(other) {
          if (this.state != other.state || this.stack.length != other.stack.length)
              return false;
          for (let i = 0; i < this.stack.length; i += 3)
              if (this.stack[i] != other.stack[i])
                  return false;
          return true;
      }
      /// Get the parser used by this stack.
      get parser() { return this.p.parser; }
      /// Test whether a given dialect (by numeric ID, as exported from
      /// the terms file) is enabled.
      dialectEnabled(dialectID) { return this.p.parser.dialect.flags[dialectID]; }
      shiftContext(term, start) {
          if (this.curContext)
              this.updateContext(this.curContext.tracker.shift(this.curContext.context, term, this, this.p.stream.reset(start)));
      }
      reduceContext(term, start) {
          if (this.curContext)
              this.updateContext(this.curContext.tracker.reduce(this.curContext.context, term, this, this.p.stream.reset(start)));
      }
      /// @internal
      emitContext() {
          let last = this.buffer.length - 1;
          if (last < 0 || this.buffer[last] != -3)
              this.buffer.push(this.curContext.hash, this.reducePos, this.reducePos, -3);
      }
      /// @internal
      emitLookAhead() {
          let last = this.buffer.length - 1;
          if (last < 0 || this.buffer[last] != -4)
              this.buffer.push(this.lookAhead, this.reducePos, this.reducePos, -4);
      }
      updateContext(context) {
          if (context != this.curContext.context) {
              let newCx = new StackContext(this.curContext.tracker, context);
              if (newCx.hash != this.curContext.hash)
                  this.emitContext();
              this.curContext = newCx;
          }
      }
      /// @internal
      setLookAhead(lookAhead) {
          if (lookAhead > this.lookAhead) {
              this.emitLookAhead();
              this.lookAhead = lookAhead;
          }
      }
      /// @internal
      close() {
          if (this.curContext && this.curContext.tracker.strict)
              this.emitContext();
          if (this.lookAhead > 0)
              this.emitLookAhead();
      }
  }
  class StackContext {
      constructor(tracker, context) {
          this.tracker = tracker;
          this.context = context;
          this.hash = tracker.strict ? tracker.hash(context) : 0;
      }
  }
  var Recover;
  (function (Recover) {
      Recover[Recover["Insert"] = 200] = "Insert";
      Recover[Recover["Delete"] = 190] = "Delete";
      Recover[Recover["Reduce"] = 100] = "Reduce";
      Recover[Recover["MaxNext"] = 4] = "MaxNext";
      Recover[Recover["MaxInsertStackDepth"] = 300] = "MaxInsertStackDepth";
      Recover[Recover["DampenInsertStackDepth"] = 120] = "DampenInsertStackDepth";
  })(Recover || (Recover = {}));
  // Used to cheaply run some reductions to scan ahead without mutating
  // an entire stack
  class SimulatedStack {
      constructor(start) {
          this.start = start;
          this.state = start.state;
          this.stack = start.stack;
          this.base = this.stack.length;
      }
      reduce(action) {
          let term = action & 65535 /* ValueMask */, depth = action >> 19 /* ReduceDepthShift */;
          if (depth == 0) {
              if (this.stack == this.start.stack)
                  this.stack = this.stack.slice();
              this.stack.push(this.state, 0, 0);
              this.base += 3;
          }
          else {
              this.base -= (depth - 1) * 3;
          }
          let goto = this.start.p.parser.getGoto(this.stack[this.base - 3], term, true);
          this.state = goto;
      }
  }
  // This is given to `Tree.build` to build a buffer, and encapsulates
  // the parent-stack-walking necessary to read the nodes.
  class StackBufferCursor {
      constructor(stack, pos, index) {
          this.stack = stack;
          this.pos = pos;
          this.index = index;
          this.buffer = stack.buffer;
          if (this.index == 0)
              this.maybeNext();
      }
      static create(stack, pos = stack.bufferBase + stack.buffer.length) {
          return new StackBufferCursor(stack, pos, pos - stack.bufferBase);
      }
      maybeNext() {
          let next = this.stack.parent;
          if (next != null) {
              this.index = this.stack.bufferBase - next.bufferBase;
              this.stack = next;
              this.buffer = next.buffer;
          }
      }
      get id() { return this.buffer[this.index - 4]; }
      get start() { return this.buffer[this.index - 3]; }
      get end() { return this.buffer[this.index - 2]; }
      get size() { return this.buffer[this.index - 1]; }
      next() {
          this.index -= 4;
          this.pos -= 4;
          if (this.index == 0)
              this.maybeNext();
      }
      fork() {
          return new StackBufferCursor(this.stack, this.pos, this.index);
      }
  }

  class CachedToken {
      constructor() {
          this.start = -1;
          this.value = -1;
          this.end = -1;
          this.extended = -1;
          this.lookAhead = 0;
          this.mask = 0;
          this.context = 0;
      }
  }
  const nullToken = new CachedToken;
  /// [Tokenizers](#lr.ExternalTokenizer) interact with the input
  /// through this interface. It presents the input as a stream of
  /// characters, tracking lookahead and hiding the complexity of
  /// [ranges](#common.Parser.parse^ranges) from tokenizer code.
  class InputStream {
      /// @internal
      constructor(
      /// @internal
      input, 
      /// @internal
      ranges) {
          this.input = input;
          this.ranges = ranges;
          /// @internal
          this.chunk = "";
          /// @internal
          this.chunkOff = 0;
          /// Backup chunk
          this.chunk2 = "";
          this.chunk2Pos = 0;
          /// The character code of the next code unit in the input, or -1
          /// when the stream is at the end of the input.
          this.next = -1;
          /// @internal
          this.token = nullToken;
          this.rangeIndex = 0;
          this.pos = this.chunkPos = ranges[0].from;
          this.range = ranges[0];
          this.end = ranges[ranges.length - 1].to;
          this.readNext();
      }
      /// @internal
      resolveOffset(offset, assoc) {
          let range = this.range, index = this.rangeIndex;
          let pos = this.pos + offset;
          while (pos < range.from) {
              if (!index)
                  return null;
              let next = this.ranges[--index];
              pos -= range.from - next.to;
              range = next;
          }
          while (assoc < 0 ? pos > range.to : pos >= range.to) {
              if (index == this.ranges.length - 1)
                  return null;
              let next = this.ranges[++index];
              pos += next.from - range.to;
              range = next;
          }
          return pos;
      }
      /// @internal
      clipPos(pos) {
          if (pos >= this.range.from && pos < this.range.to)
              return pos;
          for (let range of this.ranges)
              if (range.to > pos)
                  return Math.max(pos, range.from);
          return this.end;
      }
      /// Look at a code unit near the stream position. `.peek(0)` equals
      /// `.next`, `.peek(-1)` gives you the previous character, and so
      /// on.
      ///
      /// Note that looking around during tokenizing creates dependencies
      /// on potentially far-away content, which may reduce the
      /// effectiveness incremental parsing—when looking forward—or even
      /// cause invalid reparses when looking backward more than 25 code
      /// units, since the library does not track lookbehind.
      peek(offset) {
          let idx = this.chunkOff + offset, pos, result;
          if (idx >= 0 && idx < this.chunk.length) {
              pos = this.pos + offset;
              result = this.chunk.charCodeAt(idx);
          }
          else {
              let resolved = this.resolveOffset(offset, 1);
              if (resolved == null)
                  return -1;
              pos = resolved;
              if (pos >= this.chunk2Pos && pos < this.chunk2Pos + this.chunk2.length) {
                  result = this.chunk2.charCodeAt(pos - this.chunk2Pos);
              }
              else {
                  let i = this.rangeIndex, range = this.range;
                  while (range.to <= pos)
                      range = this.ranges[++i];
                  this.chunk2 = this.input.chunk(this.chunk2Pos = pos);
                  if (pos + this.chunk2.length > range.to)
                      this.chunk2 = this.chunk2.slice(0, range.to - pos);
                  result = this.chunk2.charCodeAt(0);
              }
          }
          if (pos >= this.token.lookAhead)
              this.token.lookAhead = pos + 1;
          return result;
      }
      /// Accept a token. By default, the end of the token is set to the
      /// current stream position, but you can pass an offset (relative to
      /// the stream position) to change that.
      acceptToken(token, endOffset = 0) {
          let end = endOffset ? this.resolveOffset(endOffset, -1) : this.pos;
          if (end == null || end < this.token.start)
              throw new RangeError("Token end out of bounds");
          this.token.value = token;
          this.token.end = end;
      }
      getChunk() {
          if (this.pos >= this.chunk2Pos && this.pos < this.chunk2Pos + this.chunk2.length) {
              let { chunk, chunkPos } = this;
              this.chunk = this.chunk2;
              this.chunkPos = this.chunk2Pos;
              this.chunk2 = chunk;
              this.chunk2Pos = chunkPos;
              this.chunkOff = this.pos - this.chunkPos;
          }
          else {
              this.chunk2 = this.chunk;
              this.chunk2Pos = this.chunkPos;
              let nextChunk = this.input.chunk(this.pos);
              let end = this.pos + nextChunk.length;
              this.chunk = end > this.range.to ? nextChunk.slice(0, this.range.to - this.pos) : nextChunk;
              this.chunkPos = this.pos;
              this.chunkOff = 0;
          }
      }
      readNext() {
          if (this.chunkOff >= this.chunk.length) {
              this.getChunk();
              if (this.chunkOff == this.chunk.length)
                  return this.next = -1;
          }
          return this.next = this.chunk.charCodeAt(this.chunkOff);
      }
      /// Move the stream forward N (defaults to 1) code units. Returns
      /// the new value of [`next`](#lr.InputStream.next).
      advance(n = 1) {
          this.chunkOff += n;
          while (this.pos + n >= this.range.to) {
              if (this.rangeIndex == this.ranges.length - 1)
                  return this.setDone();
              n -= this.range.to - this.pos;
              this.range = this.ranges[++this.rangeIndex];
              this.pos = this.range.from;
          }
          this.pos += n;
          if (this.pos >= this.token.lookAhead)
              this.token.lookAhead = this.pos + 1;
          return this.readNext();
      }
      setDone() {
          this.pos = this.chunkPos = this.end;
          this.range = this.ranges[this.rangeIndex = this.ranges.length - 1];
          this.chunk = "";
          return this.next = -1;
      }
      /// @internal
      reset(pos, token) {
          if (token) {
              this.token = token;
              token.start = pos;
              token.lookAhead = pos + 1;
              token.value = token.extended = -1;
          }
          else {
              this.token = nullToken;
          }
          if (this.pos != pos) {
              this.pos = pos;
              if (pos == this.end) {
                  this.setDone();
                  return this;
              }
              while (pos < this.range.from)
                  this.range = this.ranges[--this.rangeIndex];
              while (pos >= this.range.to)
                  this.range = this.ranges[++this.rangeIndex];
              if (pos >= this.chunkPos && pos < this.chunkPos + this.chunk.length) {
                  this.chunkOff = pos - this.chunkPos;
              }
              else {
                  this.chunk = "";
                  this.chunkOff = 0;
              }
              this.readNext();
          }
          return this;
      }
      /// @internal
      read(from, to) {
          if (from >= this.chunkPos && to <= this.chunkPos + this.chunk.length)
              return this.chunk.slice(from - this.chunkPos, to - this.chunkPos);
          if (from >= this.chunk2Pos && to <= this.chunk2Pos + this.chunk2.length)
              return this.chunk2.slice(from - this.chunk2Pos, to - this.chunk2Pos);
          if (from >= this.range.from && to <= this.range.to)
              return this.input.read(from, to);
          let result = "";
          for (let r of this.ranges) {
              if (r.from >= to)
                  break;
              if (r.to > from)
                  result += this.input.read(Math.max(r.from, from), Math.min(r.to, to));
          }
          return result;
      }
  }
  /// @internal
  class TokenGroup {
      constructor(data, id) {
          this.data = data;
          this.id = id;
      }
      token(input, stack) { readToken(this.data, input, stack, this.id); }
  }
  TokenGroup.prototype.contextual = TokenGroup.prototype.fallback = TokenGroup.prototype.extend = false;
  /// `@external tokens` declarations in the grammar should resolve to
  /// an instance of this class.
  class ExternalTokenizer {
      /// Create a tokenizer. The first argument is the function that,
      /// given an input stream, scans for the types of tokens it
      /// recognizes at the stream's position, and calls
      /// [`acceptToken`](#lr.InputStream.acceptToken) when it finds
      /// one.
      constructor(
      /// @internal
      token, options = {}) {
          this.token = token;
          this.contextual = !!options.contextual;
          this.fallback = !!options.fallback;
          this.extend = !!options.extend;
      }
  }
  // Tokenizer data is stored a big uint16 array containing, for each
  // state:
  //
  //  - A group bitmask, indicating what token groups are reachable from
  //    this state, so that paths that can only lead to tokens not in
  //    any of the current groups can be cut off early.
  //
  //  - The position of the end of the state's sequence of accepting
  //    tokens
  //
  //  - The number of outgoing edges for the state
  //
  //  - The accepting tokens, as (token id, group mask) pairs
  //
  //  - The outgoing edges, as (start character, end character, state
  //    index) triples, with end character being exclusive
  //
  // This function interprets that data, running through a stream as
  // long as new states with the a matching group mask can be reached,
  // and updating `input.token` when it matches a token.
  function readToken(data, input, stack, group) {
      let state = 0, groupMask = 1 << group, { parser } = stack.p, { dialect } = parser;
      scan: for (;;) {
          if ((groupMask & data[state]) == 0)
              break;
          let accEnd = data[state + 1];
          // Check whether this state can lead to a token in the current group
          // Accept tokens in this state, possibly overwriting
          // lower-precedence / shorter tokens
          for (let i = state + 3; i < accEnd; i += 2)
              if ((data[i + 1] & groupMask) > 0) {
                  let term = data[i];
                  if (dialect.allows(term) &&
                      (input.token.value == -1 || input.token.value == term || parser.overrides(term, input.token.value))) {
                      input.acceptToken(term);
                      break;
                  }
              }
          let next = input.next, low = 0, high = data[state + 2];
          // Special case for EOF
          if (input.next < 0 && high > low && data[accEnd + high * 3 - 3] == 65535 /* End */ && data[accEnd + high * 3 - 3] == 65535 /* End */) {
              state = data[accEnd + high * 3 - 1];
              continue scan;
          }
          // Do a binary search on the state's edges
          for (; low < high;) {
              let mid = (low + high) >> 1;
              let index = accEnd + mid + (mid << 1);
              let from = data[index], to = data[index + 1] || 0x10000;
              if (next < from)
                  high = mid;
              else if (next >= to)
                  low = mid + 1;
              else {
                  state = data[index + 2];
                  input.advance();
                  continue scan;
              }
          }
          break;
      }
  }

  // See lezer-generator/src/encode.ts for comments about the encoding
  // used here
  function decodeArray(input, Type = Uint16Array) {
      if (typeof input != "string")
          return input;
      let array = null;
      for (let pos = 0, out = 0; pos < input.length;) {
          let value = 0;
          for (;;) {
              let next = input.charCodeAt(pos++), stop = false;
              if (next == 126 /* BigValCode */) {
                  value = 65535 /* BigVal */;
                  break;
              }
              if (next >= 92 /* Gap2 */)
                  next--;
              if (next >= 34 /* Gap1 */)
                  next--;
              let digit = next - 32 /* Start */;
              if (digit >= 46 /* Base */) {
                  digit -= 46 /* Base */;
                  stop = true;
              }
              value += digit;
              if (stop)
                  break;
              value *= 46 /* Base */;
          }
          if (array)
              array[out++] = value;
          else
              array = new Type(value);
      }
      return array;
  }

  // Environment variable used to control console output
  const verbose = typeof process != "undefined" && process.env && /\bparse\b/.test(process.env.LOG);
  let stackIDs = null;
  var Safety;
  (function (Safety) {
      Safety[Safety["Margin"] = 25] = "Margin";
  })(Safety || (Safety = {}));
  function cutAt(tree, pos, side) {
      let cursor = tree.cursor(IterMode.IncludeAnonymous);
      cursor.moveTo(pos);
      for (;;) {
          if (!(side < 0 ? cursor.childBefore(pos) : cursor.childAfter(pos)))
              for (;;) {
                  if ((side < 0 ? cursor.to < pos : cursor.from > pos) && !cursor.type.isError)
                      return side < 0 ? Math.max(0, Math.min(cursor.to - 1, pos - 25 /* Margin */))
                          : Math.min(tree.length, Math.max(cursor.from + 1, pos + 25 /* Margin */));
                  if (side < 0 ? cursor.prevSibling() : cursor.nextSibling())
                      break;
                  if (!cursor.parent())
                      return side < 0 ? 0 : tree.length;
              }
      }
  }
  class FragmentCursor {
      constructor(fragments, nodeSet) {
          this.fragments = fragments;
          this.nodeSet = nodeSet;
          this.i = 0;
          this.fragment = null;
          this.safeFrom = -1;
          this.safeTo = -1;
          this.trees = [];
          this.start = [];
          this.index = [];
          this.nextFragment();
      }
      nextFragment() {
          let fr = this.fragment = this.i == this.fragments.length ? null : this.fragments[this.i++];
          if (fr) {
              this.safeFrom = fr.openStart ? cutAt(fr.tree, fr.from + fr.offset, 1) - fr.offset : fr.from;
              this.safeTo = fr.openEnd ? cutAt(fr.tree, fr.to + fr.offset, -1) - fr.offset : fr.to;
              while (this.trees.length) {
                  this.trees.pop();
                  this.start.pop();
                  this.index.pop();
              }
              this.trees.push(fr.tree);
              this.start.push(-fr.offset);
              this.index.push(0);
              this.nextStart = this.safeFrom;
          }
          else {
              this.nextStart = 1e9;
          }
      }
      // `pos` must be >= any previously given `pos` for this cursor
      nodeAt(pos) {
          if (pos < this.nextStart)
              return null;
          while (this.fragment && this.safeTo <= pos)
              this.nextFragment();
          if (!this.fragment)
              return null;
          for (;;) {
              let last = this.trees.length - 1;
              if (last < 0) { // End of tree
                  this.nextFragment();
                  return null;
              }
              let top = this.trees[last], index = this.index[last];
              if (index == top.children.length) {
                  this.trees.pop();
                  this.start.pop();
                  this.index.pop();
                  continue;
              }
              let next = top.children[index];
              let start = this.start[last] + top.positions[index];
              if (start > pos) {
                  this.nextStart = start;
                  return null;
              }
              if (next instanceof Tree) {
                  if (start == pos) {
                      if (start < this.safeFrom)
                          return null;
                      let end = start + next.length;
                      if (end <= this.safeTo) {
                          let lookAhead = next.prop(NodeProp.lookAhead);
                          if (!lookAhead || end + lookAhead < this.fragment.to)
                              return next;
                      }
                  }
                  this.index[last]++;
                  if (start + next.length >= Math.max(this.safeFrom, pos)) { // Enter this node
                      this.trees.push(next);
                      this.start.push(start);
                      this.index.push(0);
                  }
              }
              else {
                  this.index[last]++;
                  this.nextStart = start + next.length;
              }
          }
      }
  }
  class TokenCache {
      constructor(parser, stream) {
          this.stream = stream;
          this.tokens = [];
          this.mainToken = null;
          this.actions = [];
          this.tokens = parser.tokenizers.map(_ => new CachedToken);
      }
      getActions(stack) {
          let actionIndex = 0;
          let main = null;
          let { parser } = stack.p, { tokenizers } = parser;
          let mask = parser.stateSlot(stack.state, 3 /* TokenizerMask */);
          let context = stack.curContext ? stack.curContext.hash : 0;
          let lookAhead = 0;
          for (let i = 0; i < tokenizers.length; i++) {
              if (((1 << i) & mask) == 0)
                  continue;
              let tokenizer = tokenizers[i], token = this.tokens[i];
              if (main && !tokenizer.fallback)
                  continue;
              if (tokenizer.contextual || token.start != stack.pos || token.mask != mask || token.context != context) {
                  this.updateCachedToken(token, tokenizer, stack);
                  token.mask = mask;
                  token.context = context;
              }
              if (token.lookAhead > token.end + 25 /* Margin */)
                  lookAhead = Math.max(token.lookAhead, lookAhead);
              if (token.value != 0 /* Err */) {
                  let startIndex = actionIndex;
                  if (token.extended > -1)
                      actionIndex = this.addActions(stack, token.extended, token.end, actionIndex);
                  actionIndex = this.addActions(stack, token.value, token.end, actionIndex);
                  if (!tokenizer.extend) {
                      main = token;
                      if (actionIndex > startIndex)
                          break;
                  }
              }
          }
          while (this.actions.length > actionIndex)
              this.actions.pop();
          if (lookAhead)
              stack.setLookAhead(lookAhead);
          if (!main && stack.pos == this.stream.end) {
              main = new CachedToken;
              main.value = stack.p.parser.eofTerm;
              main.start = main.end = stack.pos;
              actionIndex = this.addActions(stack, main.value, main.end, actionIndex);
          }
          this.mainToken = main;
          return this.actions;
      }
      getMainToken(stack) {
          if (this.mainToken)
              return this.mainToken;
          let main = new CachedToken, { pos, p } = stack;
          main.start = pos;
          main.end = Math.min(pos + 1, p.stream.end);
          main.value = pos == p.stream.end ? p.parser.eofTerm : 0 /* Err */;
          return main;
      }
      updateCachedToken(token, tokenizer, stack) {
          let start = this.stream.clipPos(stack.pos);
          tokenizer.token(this.stream.reset(start, token), stack);
          if (token.value > -1) {
              let { parser } = stack.p;
              for (let i = 0; i < parser.specialized.length; i++)
                  if (parser.specialized[i] == token.value) {
                      let result = parser.specializers[i](this.stream.read(token.start, token.end), stack);
                      if (result >= 0 && stack.p.parser.dialect.allows(result >> 1)) {
                          if ((result & 1) == 0 /* Specialize */)
                              token.value = result >> 1;
                          else
                              token.extended = result >> 1;
                          break;
                      }
                  }
          }
          else {
              token.value = 0 /* Err */;
              token.end = this.stream.clipPos(start + 1);
          }
      }
      putAction(action, token, end, index) {
          // Don't add duplicate actions
          for (let i = 0; i < index; i += 3)
              if (this.actions[i] == action)
                  return index;
          this.actions[index++] = action;
          this.actions[index++] = token;
          this.actions[index++] = end;
          return index;
      }
      addActions(stack, token, end, index) {
          let { state } = stack, { parser } = stack.p, { data } = parser;
          for (let set = 0; set < 2; set++) {
              for (let i = parser.stateSlot(state, set ? 2 /* Skip */ : 1 /* Actions */);; i += 3) {
                  if (data[i] == 65535 /* End */) {
                      if (data[i + 1] == 1 /* Next */) {
                          i = pair(data, i + 2);
                      }
                      else {
                          if (index == 0 && data[i + 1] == 2 /* Other */)
                              index = this.putAction(pair(data, i + 2), token, end, index);
                          break;
                      }
                  }
                  if (data[i] == token)
                      index = this.putAction(pair(data, i + 1), token, end, index);
              }
          }
          return index;
      }
  }
  var Rec;
  (function (Rec) {
      Rec[Rec["Distance"] = 5] = "Distance";
      Rec[Rec["MaxRemainingPerStep"] = 3] = "MaxRemainingPerStep";
      // When two stacks have been running independently long enough to
      // add this many elements to their buffers, prune one.
      Rec[Rec["MinBufferLengthPrune"] = 500] = "MinBufferLengthPrune";
      Rec[Rec["ForceReduceLimit"] = 10] = "ForceReduceLimit";
      // Once a stack reaches this depth (in .stack.length) force-reduce
      // it back to CutTo to avoid creating trees that overflow the stack
      // on recursive traversal.
      Rec[Rec["CutDepth"] = 15000] = "CutDepth";
      Rec[Rec["CutTo"] = 9000] = "CutTo";
  })(Rec || (Rec = {}));
  class Parse {
      constructor(parser, input, fragments, ranges) {
          this.parser = parser;
          this.input = input;
          this.ranges = ranges;
          this.recovering = 0;
          this.nextStackID = 0x2654; // ♔, ♕, ♖, ♗, ♘, ♙, ♠, ♡, ♢, ♣, ♤, ♥, ♦, ♧
          this.minStackPos = 0;
          this.reused = [];
          this.stoppedAt = null;
          this.stream = new InputStream(input, ranges);
          this.tokens = new TokenCache(parser, this.stream);
          this.topTerm = parser.top[1];
          let { from } = ranges[0];
          this.stacks = [Stack.start(this, parser.top[0], from)];
          this.fragments = fragments.length && this.stream.end - from > parser.bufferLength * 4
              ? new FragmentCursor(fragments, parser.nodeSet) : null;
      }
      get parsedPos() {
          return this.minStackPos;
      }
      // Move the parser forward. This will process all parse stacks at
      // `this.pos` and try to advance them to a further position. If no
      // stack for such a position is found, it'll start error-recovery.
      //
      // When the parse is finished, this will return a syntax tree. When
      // not, it returns `null`.
      advance() {
          let stacks = this.stacks, pos = this.minStackPos;
          // This will hold stacks beyond `pos`.
          let newStacks = this.stacks = [];
          let stopped, stoppedTokens;
          // Keep advancing any stacks at `pos` until they either move
          // forward or can't be advanced. Gather stacks that can't be
          // advanced further in `stopped`.
          for (let i = 0; i < stacks.length; i++) {
              let stack = stacks[i];
              for (;;) {
                  this.tokens.mainToken = null;
                  if (stack.pos > pos) {
                      newStacks.push(stack);
                  }
                  else if (this.advanceStack(stack, newStacks, stacks)) {
                      continue;
                  }
                  else {
                      if (!stopped) {
                          stopped = [];
                          stoppedTokens = [];
                      }
                      stopped.push(stack);
                      let tok = this.tokens.getMainToken(stack);
                      stoppedTokens.push(tok.value, tok.end);
                  }
                  break;
              }
          }
          if (!newStacks.length) {
              let finished = stopped && findFinished(stopped);
              if (finished)
                  return this.stackToTree(finished);
              if (this.parser.strict) {
                  if (verbose && stopped)
                      console.log("Stuck with token " + (this.tokens.mainToken ? this.parser.getName(this.tokens.mainToken.value) : "none"));
                  throw new SyntaxError("No parse at " + pos);
              }
              if (!this.recovering)
                  this.recovering = 5 /* Distance */;
          }
          if (this.recovering && stopped) {
              let finished = this.stoppedAt != null && stopped[0].pos > this.stoppedAt ? stopped[0]
                  : this.runRecovery(stopped, stoppedTokens, newStacks);
              if (finished)
                  return this.stackToTree(finished.forceAll());
          }
          if (this.recovering) {
              let maxRemaining = this.recovering == 1 ? 1 : this.recovering * 3 /* MaxRemainingPerStep */;
              if (newStacks.length > maxRemaining) {
                  newStacks.sort((a, b) => b.score - a.score);
                  while (newStacks.length > maxRemaining)
                      newStacks.pop();
              }
              if (newStacks.some(s => s.reducePos > pos))
                  this.recovering--;
          }
          else if (newStacks.length > 1) {
              // Prune stacks that are in the same state, or that have been
              // running without splitting for a while, to avoid getting stuck
              // with multiple successful stacks running endlessly on.
              outer: for (let i = 0; i < newStacks.length - 1; i++) {
                  let stack = newStacks[i];
                  for (let j = i + 1; j < newStacks.length; j++) {
                      let other = newStacks[j];
                      if (stack.sameState(other) ||
                          stack.buffer.length > 500 /* MinBufferLengthPrune */ && other.buffer.length > 500 /* MinBufferLengthPrune */) {
                          if (((stack.score - other.score) || (stack.buffer.length - other.buffer.length)) > 0) {
                              newStacks.splice(j--, 1);
                          }
                          else {
                              newStacks.splice(i--, 1);
                              continue outer;
                          }
                      }
                  }
              }
          }
          this.minStackPos = newStacks[0].pos;
          for (let i = 1; i < newStacks.length; i++)
              if (newStacks[i].pos < this.minStackPos)
                  this.minStackPos = newStacks[i].pos;
          return null;
      }
      stopAt(pos) {
          if (this.stoppedAt != null && this.stoppedAt < pos)
              throw new RangeError("Can't move stoppedAt forward");
          this.stoppedAt = pos;
      }
      // Returns an updated version of the given stack, or null if the
      // stack can't advance normally. When `split` and `stacks` are
      // given, stacks split off by ambiguous operations will be pushed to
      // `split`, or added to `stacks` if they move `pos` forward.
      advanceStack(stack, stacks, split) {
          let start = stack.pos, { parser } = this;
          let base = verbose ? this.stackID(stack) + " -> " : "";
          if (this.stoppedAt != null && start > this.stoppedAt)
              return stack.forceReduce() ? stack : null;
          if (this.fragments) {
              let strictCx = stack.curContext && stack.curContext.tracker.strict, cxHash = strictCx ? stack.curContext.hash : 0;
              for (let cached = this.fragments.nodeAt(start); cached;) {
                  let match = this.parser.nodeSet.types[cached.type.id] == cached.type ? parser.getGoto(stack.state, cached.type.id) : -1;
                  if (match > -1 && cached.length && (!strictCx || (cached.prop(NodeProp.contextHash) || 0) == cxHash)) {
                      stack.useNode(cached, match);
                      if (verbose)
                          console.log(base + this.stackID(stack) + ` (via reuse of ${parser.getName(cached.type.id)})`);
                      return true;
                  }
                  if (!(cached instanceof Tree) || cached.children.length == 0 || cached.positions[0] > 0)
                      break;
                  let inner = cached.children[0];
                  if (inner instanceof Tree && cached.positions[0] == 0)
                      cached = inner;
                  else
                      break;
              }
          }
          let defaultReduce = parser.stateSlot(stack.state, 4 /* DefaultReduce */);
          if (defaultReduce > 0) {
              stack.reduce(defaultReduce);
              if (verbose)
                  console.log(base + this.stackID(stack) + ` (via always-reduce ${parser.getName(defaultReduce & 65535 /* ValueMask */)})`);
              return true;
          }
          if (stack.stack.length >= 15000 /* CutDepth */) {
              while (stack.stack.length > 9000 /* CutTo */ && stack.forceReduce()) { }
          }
          let actions = this.tokens.getActions(stack);
          for (let i = 0; i < actions.length;) {
              let action = actions[i++], term = actions[i++], end = actions[i++];
              let last = i == actions.length || !split;
              let localStack = last ? stack : stack.split();
              localStack.apply(action, term, end);
              if (verbose)
                  console.log(base + this.stackID(localStack) + ` (via ${(action & 65536 /* ReduceFlag */) == 0 ? "shift"
                    : `reduce of ${parser.getName(action & 65535 /* ValueMask */)}`} for ${parser.getName(term)} @ ${start}${localStack == stack ? "" : ", split"})`);
              if (last)
                  return true;
              else if (localStack.pos > start)
                  stacks.push(localStack);
              else
                  split.push(localStack);
          }
          return false;
      }
      // Advance a given stack forward as far as it will go. Returns the
      // (possibly updated) stack if it got stuck, or null if it moved
      // forward and was given to `pushStackDedup`.
      advanceFully(stack, newStacks) {
          let pos = stack.pos;
          for (;;) {
              if (!this.advanceStack(stack, null, null))
                  return false;
              if (stack.pos > pos) {
                  pushStackDedup(stack, newStacks);
                  return true;
              }
          }
      }
      runRecovery(stacks, tokens, newStacks) {
          let finished = null, restarted = false;
          for (let i = 0; i < stacks.length; i++) {
              let stack = stacks[i], token = tokens[i << 1], tokenEnd = tokens[(i << 1) + 1];
              let base = verbose ? this.stackID(stack) + " -> " : "";
              if (stack.deadEnd) {
                  if (restarted)
                      continue;
                  restarted = true;
                  stack.restart();
                  if (verbose)
                      console.log(base + this.stackID(stack) + " (restarted)");
                  let done = this.advanceFully(stack, newStacks);
                  if (done)
                      continue;
              }
              let force = stack.split(), forceBase = base;
              for (let j = 0; force.forceReduce() && j < 10 /* ForceReduceLimit */; j++) {
                  if (verbose)
                      console.log(forceBase + this.stackID(force) + " (via force-reduce)");
                  let done = this.advanceFully(force, newStacks);
                  if (done)
                      break;
                  if (verbose)
                      forceBase = this.stackID(force) + " -> ";
              }
              for (let insert of stack.recoverByInsert(token)) {
                  if (verbose)
                      console.log(base + this.stackID(insert) + " (via recover-insert)");
                  this.advanceFully(insert, newStacks);
              }
              if (this.stream.end > stack.pos) {
                  if (tokenEnd == stack.pos) {
                      tokenEnd++;
                      token = 0 /* Err */;
                  }
                  stack.recoverByDelete(token, tokenEnd);
                  if (verbose)
                      console.log(base + this.stackID(stack) + ` (via recover-delete ${this.parser.getName(token)})`);
                  pushStackDedup(stack, newStacks);
              }
              else if (!finished || finished.score < stack.score) {
                  finished = stack;
              }
          }
          return finished;
      }
      // Convert the stack's buffer to a syntax tree.
      stackToTree(stack) {
          stack.close();
          return Tree.build({ buffer: StackBufferCursor.create(stack),
              nodeSet: this.parser.nodeSet,
              topID: this.topTerm,
              maxBufferLength: this.parser.bufferLength,
              reused: this.reused,
              start: this.ranges[0].from,
              length: stack.pos - this.ranges[0].from,
              minRepeatType: this.parser.minRepeatTerm });
      }
      stackID(stack) {
          let id = (stackIDs || (stackIDs = new WeakMap)).get(stack);
          if (!id)
              stackIDs.set(stack, id = String.fromCodePoint(this.nextStackID++));
          return id + stack;
      }
  }
  function pushStackDedup(stack, newStacks) {
      for (let i = 0; i < newStacks.length; i++) {
          let other = newStacks[i];
          if (other.pos == stack.pos && other.sameState(stack)) {
              if (newStacks[i].score < stack.score)
                  newStacks[i] = stack;
              return;
          }
      }
      newStacks.push(stack);
  }
  class Dialect {
      constructor(source, flags, disabled) {
          this.source = source;
          this.flags = flags;
          this.disabled = disabled;
      }
      allows(term) { return !this.disabled || this.disabled[term] == 0; }
  }
  const id = x => x;
  /// Context trackers are used to track stateful context (such as
  /// indentation in the Python grammar, or parent elements in the XML
  /// grammar) needed by external tokenizers. You declare them in a
  /// grammar file as `@context exportName from "module"`.
  ///
  /// Context values should be immutable, and can be updated (replaced)
  /// on shift or reduce actions.
  ///
  /// The export used in a `@context` declaration should be of this
  /// type.
  class ContextTracker {
      /// Define a context tracker.
      constructor(spec) {
          this.start = spec.start;
          this.shift = spec.shift || id;
          this.reduce = spec.reduce || id;
          this.reuse = spec.reuse || id;
          this.hash = spec.hash || (() => 0);
          this.strict = spec.strict !== false;
      }
  }
  /// Holds the parse tables for a given grammar, as generated by
  /// `lezer-generator`, and provides [methods](#common.Parser) to parse
  /// content with.
  class LRParser extends Parser {
      /// @internal
      constructor(spec) {
          super();
          /// @internal
          this.wrappers = [];
          if (spec.version != 14 /* Version */)
              throw new RangeError(`Parser version (${spec.version}) doesn't match runtime version (${14 /* Version */})`);
          let nodeNames = spec.nodeNames.split(" ");
          this.minRepeatTerm = nodeNames.length;
          for (let i = 0; i < spec.repeatNodeCount; i++)
              nodeNames.push("");
          let topTerms = Object.keys(spec.topRules).map(r => spec.topRules[r][1]);
          let nodeProps = [];
          for (let i = 0; i < nodeNames.length; i++)
              nodeProps.push([]);
          function setProp(nodeID, prop, value) {
              nodeProps[nodeID].push([prop, prop.deserialize(String(value))]);
          }
          if (spec.nodeProps)
              for (let propSpec of spec.nodeProps) {
                  let prop = propSpec[0];
                  if (typeof prop == "string")
                      prop = NodeProp[prop];
                  for (let i = 1; i < propSpec.length;) {
                      let next = propSpec[i++];
                      if (next >= 0) {
                          setProp(next, prop, propSpec[i++]);
                      }
                      else {
                          let value = propSpec[i + -next];
                          for (let j = -next; j > 0; j--)
                              setProp(propSpec[i++], prop, value);
                          i++;
                      }
                  }
              }
          this.nodeSet = new NodeSet(nodeNames.map((name, i) => NodeType.define({
              name: i >= this.minRepeatTerm ? undefined : name,
              id: i,
              props: nodeProps[i],
              top: topTerms.indexOf(i) > -1,
              error: i == 0,
              skipped: spec.skippedNodes && spec.skippedNodes.indexOf(i) > -1
          })));
          if (spec.propSources)
              this.nodeSet = this.nodeSet.extend(...spec.propSources);
          this.strict = false;
          this.bufferLength = DefaultBufferLength;
          let tokenArray = decodeArray(spec.tokenData);
          this.context = spec.context;
          this.specializerSpecs = spec.specialized || [];
          this.specialized = new Uint16Array(this.specializerSpecs.length);
          for (let i = 0; i < this.specializerSpecs.length; i++)
              this.specialized[i] = this.specializerSpecs[i].term;
          this.specializers = this.specializerSpecs.map(getSpecializer);
          this.states = decodeArray(spec.states, Uint32Array);
          this.data = decodeArray(spec.stateData);
          this.goto = decodeArray(spec.goto);
          this.maxTerm = spec.maxTerm;
          this.tokenizers = spec.tokenizers.map(value => typeof value == "number" ? new TokenGroup(tokenArray, value) : value);
          this.topRules = spec.topRules;
          this.dialects = spec.dialects || {};
          this.dynamicPrecedences = spec.dynamicPrecedences || null;
          this.tokenPrecTable = spec.tokenPrec;
          this.termNames = spec.termNames || null;
          this.maxNode = this.nodeSet.types.length - 1;
          this.dialect = this.parseDialect();
          this.top = this.topRules[Object.keys(this.topRules)[0]];
      }
      createParse(input, fragments, ranges) {
          let parse = new Parse(this, input, fragments, ranges);
          for (let w of this.wrappers)
              parse = w(parse, input, fragments, ranges);
          return parse;
      }
      /// Get a goto table entry @internal
      getGoto(state, term, loose = false) {
          let table = this.goto;
          if (term >= table[0])
              return -1;
          for (let pos = table[term + 1];;) {
              let groupTag = table[pos++], last = groupTag & 1;
              let target = table[pos++];
              if (last && loose)
                  return target;
              for (let end = pos + (groupTag >> 1); pos < end; pos++)
                  if (table[pos] == state)
                      return target;
              if (last)
                  return -1;
          }
      }
      /// Check if this state has an action for a given terminal @internal
      hasAction(state, terminal) {
          let data = this.data;
          for (let set = 0; set < 2; set++) {
              for (let i = this.stateSlot(state, set ? 2 /* Skip */ : 1 /* Actions */), next;; i += 3) {
                  if ((next = data[i]) == 65535 /* End */) {
                      if (data[i + 1] == 1 /* Next */)
                          next = data[i = pair(data, i + 2)];
                      else if (data[i + 1] == 2 /* Other */)
                          return pair(data, i + 2);
                      else
                          break;
                  }
                  if (next == terminal || next == 0 /* Err */)
                      return pair(data, i + 1);
              }
          }
          return 0;
      }
      /// @internal
      stateSlot(state, slot) {
          return this.states[(state * 6 /* Size */) + slot];
      }
      /// @internal
      stateFlag(state, flag) {
          return (this.stateSlot(state, 0 /* Flags */) & flag) > 0;
      }
      /// @internal
      validAction(state, action) {
          if (action == this.stateSlot(state, 4 /* DefaultReduce */))
              return true;
          for (let i = this.stateSlot(state, 1 /* Actions */);; i += 3) {
              if (this.data[i] == 65535 /* End */) {
                  if (this.data[i + 1] == 1 /* Next */)
                      i = pair(this.data, i + 2);
                  else
                      return false;
              }
              if (action == pair(this.data, i + 1))
                  return true;
          }
      }
      /// Get the states that can follow this one through shift actions or
      /// goto jumps. @internal
      nextStates(state) {
          let result = [];
          for (let i = this.stateSlot(state, 1 /* Actions */);; i += 3) {
              if (this.data[i] == 65535 /* End */) {
                  if (this.data[i + 1] == 1 /* Next */)
                      i = pair(this.data, i + 2);
                  else
                      break;
              }
              if ((this.data[i + 2] & (65536 /* ReduceFlag */ >> 16)) == 0) {
                  let value = this.data[i + 1];
                  if (!result.some((v, i) => (i & 1) && v == value))
                      result.push(this.data[i], value);
              }
          }
          return result;
      }
      /// @internal
      overrides(token, prev) {
          let iPrev = findOffset(this.data, this.tokenPrecTable, prev);
          return iPrev < 0 || findOffset(this.data, this.tokenPrecTable, token) < iPrev;
      }
      /// Configure the parser. Returns a new parser instance that has the
      /// given settings modified. Settings not provided in `config` are
      /// kept from the original parser.
      configure(config) {
          // Hideous reflection-based kludge to make it easy to create a
          // slightly modified copy of a parser.
          let copy = Object.assign(Object.create(LRParser.prototype), this);
          if (config.props)
              copy.nodeSet = this.nodeSet.extend(...config.props);
          if (config.top) {
              let info = this.topRules[config.top];
              if (!info)
                  throw new RangeError(`Invalid top rule name ${config.top}`);
              copy.top = info;
          }
          if (config.tokenizers)
              copy.tokenizers = this.tokenizers.map(t => {
                  let found = config.tokenizers.find(r => r.from == t);
                  return found ? found.to : t;
              });
          if (config.specializers) {
              copy.specializers = this.specializers.slice();
              copy.specializerSpecs = this.specializerSpecs.map((s, i) => {
                  let found = config.specializers.find(r => r.from == s.external);
                  if (!found)
                      return s;
                  let spec = Object.assign(Object.assign({}, s), { external: found.to });
                  copy.specializers[i] = getSpecializer(spec);
                  return spec;
              });
          }
          if (config.contextTracker)
              copy.context = config.contextTracker;
          if (config.dialect)
              copy.dialect = this.parseDialect(config.dialect);
          if (config.strict != null)
              copy.strict = config.strict;
          if (config.wrap)
              copy.wrappers = copy.wrappers.concat(config.wrap);
          if (config.bufferLength != null)
              copy.bufferLength = config.bufferLength;
          return copy;
      }
      /// Tells you whether any [parse wrappers](#lr.ParserConfig.wrap)
      /// are registered for this parser.
      hasWrappers() {
          return this.wrappers.length > 0;
      }
      /// Returns the name associated with a given term. This will only
      /// work for all terms when the parser was generated with the
      /// `--names` option. By default, only the names of tagged terms are
      /// stored.
      getName(term) {
          return this.termNames ? this.termNames[term] : String(term <= this.maxNode && this.nodeSet.types[term].name || term);
      }
      /// The eof term id is always allocated directly after the node
      /// types. @internal
      get eofTerm() { return this.maxNode + 1; }
      /// The type of top node produced by the parser.
      get topNode() { return this.nodeSet.types[this.top[1]]; }
      /// @internal
      dynamicPrecedence(term) {
          let prec = this.dynamicPrecedences;
          return prec == null ? 0 : prec[term] || 0;
      }
      /// @internal
      parseDialect(dialect) {
          let values = Object.keys(this.dialects), flags = values.map(() => false);
          if (dialect)
              for (let part of dialect.split(" ")) {
                  let id = values.indexOf(part);
                  if (id >= 0)
                      flags[id] = true;
              }
          let disabled = null;
          for (let i = 0; i < values.length; i++)
              if (!flags[i]) {
                  for (let j = this.dialects[values[i]], id; (id = this.data[j++]) != 65535 /* End */;)
                      (disabled || (disabled = new Uint8Array(this.maxTerm + 1)))[id] = 1;
              }
          return new Dialect(dialect, flags, disabled);
      }
      /// Used by the output of the parser generator. Not available to
      /// user code.
      static deserialize(spec) {
          return new LRParser(spec);
      }
  }
  function pair(data, off) { return data[off] | (data[off + 1] << 16); }
  function findOffset(data, start, term) {
      for (let i = start, next; (next = data[i]) != 65535 /* End */; i++)
          if (next == term)
              return i - start;
      return -1;
  }
  function findFinished(stacks) {
      let best = null;
      for (let stack of stacks) {
          let stopped = stack.p.stoppedAt;
          if ((stack.pos == stack.p.stream.end || stopped != null && stack.pos > stopped) &&
              stack.p.parser.stateFlag(stack.state, 2 /* Accepting */) &&
              (!best || best.score < stack.score))
              best = stack;
      }
      return best;
  }
  function getSpecializer(spec) {
      if (spec.external) {
          let mask = spec.extend ? 1 /* Extend */ : 0 /* Specialize */;
          return (value, stack) => (spec.external(value, stack) << 1) | mask;
      }
      return spec.get;
  }

  let nextTagID = 0;
  /// Highlighting tags are markers that denote a highlighting category.
  /// They are [associated](#highlight.styleTags) with parts of a syntax
  /// tree by a language mode, and then mapped to an actual CSS style by
  /// a [highlighter](#highlight.Highlighter).
  ///
  /// Because syntax tree node types and highlight styles have to be
  /// able to talk the same language, CodeMirror uses a mostly _closed_
  /// [vocabulary](#highlight.tags) of syntax tags (as opposed to
  /// traditional open string-based systems, which make it hard for
  /// highlighting themes to cover all the tokens produced by the
  /// various languages).
  ///
  /// It _is_ possible to [define](#highlight.Tag^define) your own
  /// highlighting tags for system-internal use (where you control both
  /// the language package and the highlighter), but such tags will not
  /// be picked up by regular highlighters (though you can derive them
  /// from standard tags to allow highlighters to fall back to those).
  class Tag {
      /// @internal
      constructor(
      /// The set of this tag and all its parent tags, starting with
      /// this one itself and sorted in order of decreasing specificity.
      set, 
      /// The base unmodified tag that this one is based on, if it's
      /// modified @internal
      base, 
      /// The modifiers applied to this.base @internal
      modified) {
          this.set = set;
          this.base = base;
          this.modified = modified;
          /// @internal
          this.id = nextTagID++;
      }
      /// Define a new tag. If `parent` is given, the tag is treated as a
      /// sub-tag of that parent, and
      /// [highlighters](#highlight.tagHighlighter) that don't mention
      /// this tag will try to fall back to the parent tag (or grandparent
      /// tag, etc).
      static define(parent) {
          if (parent === null || parent === void 0 ? void 0 : parent.base)
              throw new Error("Can not derive from a modified tag");
          let tag = new Tag([], null, []);
          tag.set.push(tag);
          if (parent)
              for (let t of parent.set)
                  tag.set.push(t);
          return tag;
      }
      /// Define a tag _modifier_, which is a function that, given a tag,
      /// will return a tag that is a subtag of the original. Applying the
      /// same modifier to a twice tag will return the same value (`m1(t1)
      /// == m1(t1)`) and applying multiple modifiers will, regardless or
      /// order, produce the same tag (`m1(m2(t1)) == m2(m1(t1))`).
      ///
      /// When multiple modifiers are applied to a given base tag, each
      /// smaller set of modifiers is registered as a parent, so that for
      /// example `m1(m2(m3(t1)))` is a subtype of `m1(m2(t1))`,
      /// `m1(m3(t1)`, and so on.
      static defineModifier() {
          let mod = new Modifier;
          return (tag) => {
              if (tag.modified.indexOf(mod) > -1)
                  return tag;
              return Modifier.get(tag.base || tag, tag.modified.concat(mod).sort((a, b) => a.id - b.id));
          };
      }
  }
  let nextModifierID = 0;
  class Modifier {
      constructor() {
          this.instances = [];
          this.id = nextModifierID++;
      }
      static get(base, mods) {
          if (!mods.length)
              return base;
          let exists = mods[0].instances.find(t => t.base == base && sameArray(mods, t.modified));
          if (exists)
              return exists;
          let set = [], tag = new Tag(set, base, mods);
          for (let m of mods)
              m.instances.push(tag);
          let configs = powerSet(mods);
          for (let parent of base.set)
              if (!parent.modified.length)
                  for (let config of configs)
                      set.push(Modifier.get(parent, config));
          return tag;
      }
  }
  function sameArray(a, b) {
      return a.length == b.length && a.every((x, i) => x == b[i]);
  }
  function powerSet(array) {
      let sets = [[]];
      for (let i = 0; i < array.length; i++) {
          for (let j = 0, e = sets.length; j < e; j++) {
              sets.push(sets[j].concat(array[i]));
          }
      }
      return sets.sort((a, b) => b.length - a.length);
  }
  /// This function is used to add a set of tags to a language syntax
  /// via [`NodeSet.extend`](#common.NodeSet.extend) or
  /// [`LRParser.configure`](#lr.LRParser.configure).
  ///
  /// The argument object maps node selectors to [highlighting
  /// tags](#highlight.Tag) or arrays of tags.
  ///
  /// Node selectors may hold one or more (space-separated) node paths.
  /// Such a path can be a [node name](#common.NodeType.name), or
  /// multiple node names (or `*` wildcards) separated by slash
  /// characters, as in `"Block/Declaration/VariableName"`. Such a path
  /// matches the final node but only if its direct parent nodes are the
  /// other nodes mentioned. A `*` in such a path matches any parent,
  /// but only a single level—wildcards that match multiple parents
  /// aren't supported, both for efficiency reasons and because Lezer
  /// trees make it rather hard to reason about what they would match.)
  ///
  /// A path can be ended with `/...` to indicate that the tag assigned
  /// to the node should also apply to all child nodes, even if they
  /// match their own style (by default, only the innermost style is
  /// used).
  ///
  /// When a path ends in `!`, as in `Attribute!`, no further matching
  /// happens for the node's child nodes, and the entire node gets the
  /// given style.
  ///
  /// In this notation, node names that contain `/`, `!`, `*`, or `...`
  /// must be quoted as JSON strings.
  ///
  /// For example:
  ///
  /// ```javascript
  /// parser.withProps(
  ///   styleTags({
  ///     // Style Number and BigNumber nodes
  ///     "Number BigNumber": tags.number,
  ///     // Style Escape nodes whose parent is String
  ///     "String/Escape": tags.escape,
  ///     // Style anything inside Attributes nodes
  ///     "Attributes!": tags.meta,
  ///     // Add a style to all content inside Italic nodes
  ///     "Italic/...": tags.emphasis,
  ///     // Style InvalidString nodes as both `string` and `invalid`
  ///     "InvalidString": [tags.string, tags.invalid],
  ///     // Style the node named "/" as punctuation
  ///     '"/"': tags.punctuation
  ///   })
  /// )
  /// ```
  function styleTags(spec) {
      let byName = Object.create(null);
      for (let prop in spec) {
          let tags = spec[prop];
          if (!Array.isArray(tags))
              tags = [tags];
          for (let part of prop.split(" "))
              if (part) {
                  let pieces = [], mode = 2 /* Normal */, rest = part;
                  for (let pos = 0;;) {
                      if (rest == "..." && pos > 0 && pos + 3 == part.length) {
                          mode = 1 /* Inherit */;
                          break;
                      }
                      let m = /^"(?:[^"\\]|\\.)*?"|[^\/!]+/.exec(rest);
                      if (!m)
                          throw new RangeError("Invalid path: " + part);
                      pieces.push(m[0] == "*" ? "" : m[0][0] == '"' ? JSON.parse(m[0]) : m[0]);
                      pos += m[0].length;
                      if (pos == part.length)
                          break;
                      let next = part[pos++];
                      if (pos == part.length && next == "!") {
                          mode = 0 /* Opaque */;
                          break;
                      }
                      if (next != "/")
                          throw new RangeError("Invalid path: " + part);
                      rest = part.slice(pos);
                  }
                  let last = pieces.length - 1, inner = pieces[last];
                  if (!inner)
                      throw new RangeError("Invalid path: " + part);
                  let rule = new Rule(tags, mode, last > 0 ? pieces.slice(0, last) : null);
                  byName[inner] = rule.sort(byName[inner]);
              }
      }
      return ruleNodeProp.add(byName);
  }
  const ruleNodeProp = new NodeProp();
  class Rule {
      constructor(tags, mode, context, next) {
          this.tags = tags;
          this.mode = mode;
          this.context = context;
          this.next = next;
      }
      get opaque() { return this.mode == 0 /* Opaque */; }
      get inherit() { return this.mode == 1 /* Inherit */; }
      sort(other) {
          if (!other || other.depth < this.depth) {
              this.next = other;
              return this;
          }
          other.next = this.sort(other.next);
          return other;
      }
      get depth() { return this.context ? this.context.length : 0; }
  }
  Rule.empty = new Rule([], 2 /* Normal */, null);
  /// Define a [highlighter](#highlight.Highlighter) from an array of
  /// tag/class pairs. Classes associated with more specific tags will
  /// take precedence.
  function tagHighlighter(tags, options) {
      let map = Object.create(null);
      for (let style of tags) {
          if (!Array.isArray(style.tag))
              map[style.tag.id] = style.class;
          else
              for (let tag of style.tag)
                  map[tag.id] = style.class;
      }
      let { scope, all = null } = options || {};
      return {
          style: (tags) => {
              let cls = all;
              for (let tag of tags) {
                  for (let sub of tag.set) {
                      let tagClass = map[sub.id];
                      if (tagClass) {
                          cls = cls ? cls + " " + tagClass : tagClass;
                          break;
                      }
                  }
              }
              return cls;
          },
          scope
      };
  }
  const t$3 = Tag.define;
  const comment = t$3(), name = t$3(), typeName = t$3(name), propertyName = t$3(name), literal = t$3(), string = t$3(literal), number = t$3(literal), content = t$3(), heading = t$3(content), keyword = t$3(), operator = t$3(), punctuation = t$3(), bracket = t$3(punctuation), meta = t$3();
  /// The default set of highlighting [tags](#highlight.Tag).
  ///
  /// This collection is heavily biased towards programming languages,
  /// and necessarily incomplete. A full ontology of syntactic
  /// constructs would fill a stack of books, and be impractical to
  /// write themes for. So try to make do with this set. If all else
  /// fails, [open an
  /// issue](https://github.com/codemirror/codemirror.next) to propose a
  /// new tag, or [define](#highlight.Tag^define) a local custom tag for
  /// your use case.
  ///
  /// Note that it is not obligatory to always attach the most specific
  /// tag possible to an element—if your grammar can't easily
  /// distinguish a certain type of element (such as a local variable),
  /// it is okay to style it as its more general variant (a variable).
  /// 
  /// For tags that extend some parent tag, the documentation links to
  /// the parent.
  const tags = {
      /// A comment.
      comment,
      /// A line [comment](#highlight.tags.comment).
      lineComment: t$3(comment),
      /// A block [comment](#highlight.tags.comment).
      blockComment: t$3(comment),
      /// A documentation [comment](#highlight.tags.comment).
      docComment: t$3(comment),
      /// Any kind of identifier.
      name,
      /// The [name](#highlight.tags.name) of a variable.
      variableName: t$3(name),
      /// A type [name](#highlight.tags.name).
      typeName: typeName,
      /// A tag name (subtag of [`typeName`](#highlight.tags.typeName)).
      tagName: t$3(typeName),
      /// A property or field [name](#highlight.tags.name).
      propertyName: propertyName,
      /// An attribute name (subtag of [`propertyName`](#highlight.tags.propertyName)).
      attributeName: t$3(propertyName),
      /// The [name](#highlight.tags.name) of a class.
      className: t$3(name),
      /// A label [name](#highlight.tags.name).
      labelName: t$3(name),
      /// A namespace [name](#highlight.tags.name).
      namespace: t$3(name),
      /// The [name](#highlight.tags.name) of a macro.
      macroName: t$3(name),
      /// A literal value.
      literal,
      /// A string [literal](#highlight.tags.literal).
      string,
      /// A documentation [string](#highlight.tags.string).
      docString: t$3(string),
      /// A character literal (subtag of [string](#highlight.tags.string)).
      character: t$3(string),
      /// An attribute value (subtag of [string](#highlight.tags.string)).
      attributeValue: t$3(string),
      /// A number [literal](#highlight.tags.literal).
      number,
      /// An integer [number](#highlight.tags.number) literal.
      integer: t$3(number),
      /// A floating-point [number](#highlight.tags.number) literal.
      float: t$3(number),
      /// A boolean [literal](#highlight.tags.literal).
      bool: t$3(literal),
      /// Regular expression [literal](#highlight.tags.literal).
      regexp: t$3(literal),
      /// An escape [literal](#highlight.tags.literal), for example a
      /// backslash escape in a string.
      escape: t$3(literal),
      /// A color [literal](#highlight.tags.literal).
      color: t$3(literal),
      /// A URL [literal](#highlight.tags.literal).
      url: t$3(literal),
      /// A language keyword.
      keyword,
      /// The [keyword](#highlight.tags.keyword) for the self or this
      /// object.
      self: t$3(keyword),
      /// The [keyword](#highlight.tags.keyword) for null.
      null: t$3(keyword),
      /// A [keyword](#highlight.tags.keyword) denoting some atomic value.
      atom: t$3(keyword),
      /// A [keyword](#highlight.tags.keyword) that represents a unit.
      unit: t$3(keyword),
      /// A modifier [keyword](#highlight.tags.keyword).
      modifier: t$3(keyword),
      /// A [keyword](#highlight.tags.keyword) that acts as an operator.
      operatorKeyword: t$3(keyword),
      /// A control-flow related [keyword](#highlight.tags.keyword).
      controlKeyword: t$3(keyword),
      /// A [keyword](#highlight.tags.keyword) that defines something.
      definitionKeyword: t$3(keyword),
      /// A [keyword](#highlight.tags.keyword) related to defining or
      /// interfacing with modules.
      moduleKeyword: t$3(keyword),
      /// An operator.
      operator,
      /// An [operator](#highlight.tags.operator) that dereferences something.
      derefOperator: t$3(operator),
      /// Arithmetic-related [operator](#highlight.tags.operator).
      arithmeticOperator: t$3(operator),
      /// Logical [operator](#highlight.tags.operator).
      logicOperator: t$3(operator),
      /// Bit [operator](#highlight.tags.operator).
      bitwiseOperator: t$3(operator),
      /// Comparison [operator](#highlight.tags.operator).
      compareOperator: t$3(operator),
      /// [Operator](#highlight.tags.operator) that updates its operand.
      updateOperator: t$3(operator),
      /// [Operator](#highlight.tags.operator) that defines something.
      definitionOperator: t$3(operator),
      /// Type-related [operator](#highlight.tags.operator).
      typeOperator: t$3(operator),
      /// Control-flow [operator](#highlight.tags.operator).
      controlOperator: t$3(operator),
      /// Program or markup punctuation.
      punctuation,
      /// [Punctuation](#highlight.tags.punctuation) that separates
      /// things.
      separator: t$3(punctuation),
      /// Bracket-style [punctuation](#highlight.tags.punctuation).
      bracket,
      /// Angle [brackets](#highlight.tags.bracket) (usually `<` and `>`
      /// tokens).
      angleBracket: t$3(bracket),
      /// Square [brackets](#highlight.tags.bracket) (usually `[` and `]`
      /// tokens).
      squareBracket: t$3(bracket),
      /// Parentheses (usually `(` and `)` tokens). Subtag of
      /// [bracket](#highlight.tags.bracket).
      paren: t$3(bracket),
      /// Braces (usually `{` and `}` tokens). Subtag of
      /// [bracket](#highlight.tags.bracket).
      brace: t$3(bracket),
      /// Content, for example plain text in XML or markup documents.
      content,
      /// [Content](#highlight.tags.content) that represents a heading.
      heading,
      /// A level 1 [heading](#highlight.tags.heading).
      heading1: t$3(heading),
      /// A level 2 [heading](#highlight.tags.heading).
      heading2: t$3(heading),
      /// A level 3 [heading](#highlight.tags.heading).
      heading3: t$3(heading),
      /// A level 4 [heading](#highlight.tags.heading).
      heading4: t$3(heading),
      /// A level 5 [heading](#highlight.tags.heading).
      heading5: t$3(heading),
      /// A level 6 [heading](#highlight.tags.heading).
      heading6: t$3(heading),
      /// A prose separator (such as a horizontal rule).
      contentSeparator: t$3(content),
      /// [Content](#highlight.tags.content) that represents a list.
      list: t$3(content),
      /// [Content](#highlight.tags.content) that represents a quote.
      quote: t$3(content),
      /// [Content](#highlight.tags.content) that is emphasized.
      emphasis: t$3(content),
      /// [Content](#highlight.tags.content) that is styled strong.
      strong: t$3(content),
      /// [Content](#highlight.tags.content) that is part of a link.
      link: t$3(content),
      /// [Content](#highlight.tags.content) that is styled as code or
      /// monospace.
      monospace: t$3(content),
      /// [Content](#highlight.tags.content) that has a strike-through
      /// style.
      strikethrough: t$3(content),
      /// Inserted text in a change-tracking format.
      inserted: t$3(),
      /// Deleted text.
      deleted: t$3(),
      /// Changed text.
      changed: t$3(),
      /// An invalid or unsyntactic element.
      invalid: t$3(),
      /// Metadata or meta-instruction.
      meta,
      /// [Metadata](#highlight.tags.meta) that applies to the entire
      /// document.
      documentMeta: t$3(meta),
      /// [Metadata](#highlight.tags.meta) that annotates or adds
      /// attributes to a given syntactic element.
      annotation: t$3(meta),
      /// Processing instruction or preprocessor directive. Subtag of
      /// [meta](#highlight.tags.meta).
      processingInstruction: t$3(meta),
      /// [Modifier](#highlight.Tag^defineModifier) that indicates that a
      /// given element is being defined. Expected to be used with the
      /// various [name](#highlight.tags.name) tags.
      definition: Tag.defineModifier(),
      /// [Modifier](#highlight.Tag^defineModifier) that indicates that
      /// something is constant. Mostly expected to be used with
      /// [variable names](#highlight.tags.variableName).
      constant: Tag.defineModifier(),
      /// [Modifier](#highlight.Tag^defineModifier) used to indicate that
      /// a [variable](#highlight.tags.variableName) or [property
      /// name](#highlight.tags.propertyName) is being called or defined
      /// as a function.
      function: Tag.defineModifier(),
      /// [Modifier](#highlight.Tag^defineModifier) that can be applied to
      /// [names](#highlight.tags.name) to indicate that they belong to
      /// the language's standard environment.
      standard: Tag.defineModifier(),
      /// [Modifier](#highlight.Tag^defineModifier) that indicates a given
      /// [names](#highlight.tags.name) is local to some scope.
      local: Tag.defineModifier(),
      /// A generic variant [modifier](#highlight.Tag^defineModifier) that
      /// can be used to tag language-specific alternative variants of
      /// some common tag. It is recommended for themes to define special
      /// forms of at least the [string](#highlight.tags.string) and
      /// [variable name](#highlight.tags.variableName) tags, since those
      /// come up a lot.
      special: Tag.defineModifier()
  };
  /// This is a highlighter that adds stable, predictable classes to
  /// tokens, for styling with external CSS.
  ///
  /// The following tags are mapped to their name prefixed with `"tok-"`
  /// (for example `"tok-comment"`):
  ///
  /// * [`link`](#highlight.tags.link)
  /// * [`heading`](#highlight.tags.heading)
  /// * [`emphasis`](#highlight.tags.emphasis)
  /// * [`strong`](#highlight.tags.strong)
  /// * [`keyword`](#highlight.tags.keyword)
  /// * [`atom`](#highlight.tags.atom)
  /// * [`bool`](#highlight.tags.bool)
  /// * [`url`](#highlight.tags.url)
  /// * [`labelName`](#highlight.tags.labelName)
  /// * [`inserted`](#highlight.tags.inserted)
  /// * [`deleted`](#highlight.tags.deleted)
  /// * [`literal`](#highlight.tags.literal)
  /// * [`string`](#highlight.tags.string)
  /// * [`number`](#highlight.tags.number)
  /// * [`variableName`](#highlight.tags.variableName)
  /// * [`typeName`](#highlight.tags.typeName)
  /// * [`namespace`](#highlight.tags.namespace)
  /// * [`className`](#highlight.tags.className)
  /// * [`macroName`](#highlight.tags.macroName)
  /// * [`propertyName`](#highlight.tags.propertyName)
  /// * [`operator`](#highlight.tags.operator)
  /// * [`comment`](#highlight.tags.comment)
  /// * [`meta`](#highlight.tags.meta)
  /// * [`punctuation`](#highlight.tags.punctuation)
  /// * [`invalid`](#highlight.tags.invalid)
  ///
  /// In addition, these mappings are provided:
  ///
  /// * [`regexp`](#highlight.tags.regexp),
  ///   [`escape`](#highlight.tags.escape), and
  ///   [`special`](#highlight.tags.special)[`(string)`](#highlight.tags.string)
  ///   are mapped to `"tok-string2"`
  /// * [`special`](#highlight.tags.special)[`(variableName)`](#highlight.tags.variableName)
  ///   to `"tok-variableName2"`
  /// * [`local`](#highlight.tags.local)[`(variableName)`](#highlight.tags.variableName)
  ///   to `"tok-variableName tok-local"`
  /// * [`definition`](#highlight.tags.definition)[`(variableName)`](#highlight.tags.variableName)
  ///   to `"tok-variableName tok-definition"`
  /// * [`definition`](#highlight.tags.definition)[`(propertyName)`](#highlight.tags.propertyName)
  ///   to `"tok-propertyName tok-definition"`
  tagHighlighter([
      { tag: tags.link, class: "tok-link" },
      { tag: tags.heading, class: "tok-heading" },
      { tag: tags.emphasis, class: "tok-emphasis" },
      { tag: tags.strong, class: "tok-strong" },
      { tag: tags.keyword, class: "tok-keyword" },
      { tag: tags.atom, class: "tok-atom" },
      { tag: tags.bool, class: "tok-bool" },
      { tag: tags.url, class: "tok-url" },
      { tag: tags.labelName, class: "tok-labelName" },
      { tag: tags.inserted, class: "tok-inserted" },
      { tag: tags.deleted, class: "tok-deleted" },
      { tag: tags.literal, class: "tok-literal" },
      { tag: tags.string, class: "tok-string" },
      { tag: tags.number, class: "tok-number" },
      { tag: [tags.regexp, tags.escape, tags.special(tags.string)], class: "tok-string2" },
      { tag: tags.variableName, class: "tok-variableName" },
      { tag: tags.local(tags.variableName), class: "tok-variableName tok-local" },
      { tag: tags.definition(tags.variableName), class: "tok-variableName tok-definition" },
      { tag: tags.special(tags.variableName), class: "tok-variableName2" },
      { tag: tags.definition(tags.propertyName), class: "tok-propertyName tok-definition" },
      { tag: tags.typeName, class: "tok-typeName" },
      { tag: tags.namespace, class: "tok-namespace" },
      { tag: tags.className, class: "tok-className" },
      { tag: tags.macroName, class: "tok-macroName" },
      { tag: tags.propertyName, class: "tok-propertyName" },
      { tag: tags.operator, class: "tok-operator" },
      { tag: tags.comment, class: "tok-comment" },
      { tag: tags.meta, class: "tok-meta" },
      { tag: tags.invalid, class: "tok-invalid" },
      { tag: tags.punctuation, class: "tok-punctuation" }
  ]);

  // This file was generated by lezer-generator. You probably shouldn't edit it.
  const propertyIdentifier = 147,
    identifier = 148,
    nameIdentifier = 149,
    insertSemi = 150,
    expression0 = 154,
    ForExpression = 4,
    forExpressionStart = 157,
    ForInExpression = 7,
    Name = 8,
    Identifier = 9,
    AdditionalIdentifier = 10,
    forExpressionBodyStart = 165,
    IfExpression = 18,
    ifExpressionStart = 166,
    QuantifiedExpression = 22,
    quantifiedExpressionStart = 167,
    QuantifiedInExpression = 26,
    PositiveUnaryTest = 36,
    ArithmeticExpression = 40,
    arithmeticPlusStart = 171,
    arithmeticTimesStart = 172,
    arithmeticExpStart = 173,
    arithmeticUnaryStart = 174,
    VariableName = 47,
    PathExpression = 67,
    pathExpressionStart = 179,
    FilterExpression = 69,
    filterExpressionStart = 180,
    FunctionInvocation = 71,
    functionInvocationStart = 181,
    ParameterName = 103,
    nil = 186,
    NumericLiteral = 106,
    StringLiteral = 107,
    BooleanLiteral = 108,
    FunctionDefinition = 117,
    functionDefinitionStart = 194,
    Context = 124,
    contextStart = 196,
    ContextEntry = 125,
    PropertyName = 127,
    PropertyIdentifier = 128;

  const LOG_PARSE = typeof process != 'undefined' && process.env && /\bfparse(:dbg)?\b/.test(process.env.LOG);
  const LOG_PARSE_DEBUG = typeof process != 'undefined' && process.env && /\fparse:dbg\b/.test(process.env.LOG);
  const LOG_VARS = typeof process != 'undefined' && process.env && /\bcontext?\b/.test(process.env.LOG);

  const spaceChars = [
    9, 11, 12, 32, 133, 160,
    5760, 8192, 8193, 8194, 8195, 8196, 8197, 8198,
    8199, 8200, 8201, 8202, 8232, 8233, 8239, 8287, 12288
  ];

  const newlineChars = chars$1('\n\r');

  const additionalNameChars = chars$1("'./-+*");

  /**
   * @param { string } str
   * @return { number[] }
   */
  function chars$1(str) {
    return Array.from(str).map(s => s.charCodeAt(0));
  }

  /**
   * @param { number } ch
   * @return { boolean }
   */
  function isStartChar(ch) {
    return (
      ch === 63 // ?
    ) || (
      ch === 95 // _
    ) || (
      ch >= 65 && ch <= 90 // A-Z
    ) || (
      ch >= 97 && ch <= 122 // a-z
    ) || (
      ch >= 161 && !isPartChar(ch) && !isSpace(ch)
    );
  }

  /**
   * @param { number } ch
   * @return { boolean }
   */
  function isAdditional(ch) {
    return additionalNameChars.includes(ch);
  }

  /**
   * @param { number } ch
   * @return { boolean }
   */
  function isPartChar(ch) {
    return (
      ch >= 48 && ch <= 57 // 0-9
    ) || (
      ch === 0xB7
    ) || (
      ch >= 0x0300 && ch <= 0x036F
    ) || (
      ch >= 0x203F && ch <= 0x2040
    );
  }

  /**
   * @param { number } ch
   * @return { boolean }
   */
  function isSpace(ch) {
    return spaceChars.includes(ch);
  }

  // eslint-disable-next-line
  function indent(str, spaces) {
    return spaces.concat(
      str.split(/\n/g).join('\n' + spaces)
    );
  }

  /**
   * @param { import('@lezer/lr').InputStream } input
   * @param  { number } [offset]
   * @param { boolean } [includeOperators]
   *
   * @return { { token: string, offset: number } | null }
   */
  function parseAdditionalSymbol(input, offset = 0) {

    const next = input.peek(offset);

    if (isAdditional(next)) {
      return {
        offset: 1,
        token: String.fromCharCode(next)
      };
    }

    return null;
  }

  /**
   * @param { import('@lezer/lr').InputStream } input
   * @param { number } [offset]
   * @param { boolean } [namePart]
   *
   * @return { { token: string, offset: number } | null }
   */
  function parseIdentifier(input, offset = 0, namePart = false) {
    for (let inside = false, chars = [], i = 0;; i++) {
      const next = input.peek(offset + i);

      if (isStartChar(next) || ((inside || namePart) && isPartChar(next))) {
        if (!inside) {
          inside = true;
        }

        chars.push(next);
      } else {

        if (chars.length) {
          return {
            token: String.fromCharCode(...chars),
            offset: i
          };
        }

        return null;
      }
    }
  }

  /**
   * @param { import('@lezer/lr').InputStream } input
   * @param  { number } offset
   *
   * @return { { token: string, offset: number } | null }
   */
  function parseSpaces(input, offset) {

    for (let inside = false, i = 0;; i++) {
      let next = input.peek(offset + i);

      if (isSpace(next)) {
        if (!inside) {
          inside = true;
        }
      } else {
        if (inside) {
          return {
            token: ' ',
            offset: i
          };
        }

        return null;
      }
    }
  }

  /**
   * Parse a name from the input and return the first match, if any.
   *
   * @param { import('@lezer/lr').InputStream } input
   * @param { Variables } variables
   *
   * @return { { token: string, offset: number, term: number } | null }
   */
  function parseName(input, variables) {
    const contextKeys = variables.contextKeys();

    const start = variables.tokens;

    for (let i = 0, tokens = [], nextMatch = null;;) {

      const namePart = (start.length + tokens.length) > 0;
      const maybeSpace = tokens.length > 0;

      const match = (
        parseIdentifier(input, i, namePart) ||
        namePart && parseAdditionalSymbol(input, i) ||
        maybeSpace && parseSpaces(input, i)
      );

      // match is required
      if (!match) {
        return nextMatch;
      }

      const {
        token,
        offset
      } = match;

      i += offset;

      if (token === ' ') {
        continue;
      }

      tokens = [ ...tokens, token ];

      const name = [ ...start, ...tokens ].join(' ');

      if (contextKeys.some(el => el === name)) {
        const token = tokens[0];

        nextMatch = {
          token,
          offset: token.length,
          term: nameIdentifier
        };
      }

      if (dateTimeIdentifiers.some(el => el === name)) {
        const token = tokens[0];

        // parse date time identifiers as normal
        // identifiers to allow specialization to kick in
        //
        // cf. https://github.com/nikku/lezer-feel/issues/8
        nextMatch = {
          token,
          offset: token.length,
          term: identifier
        };
      }

      if (
        !contextKeys.some(el => el.startsWith(name)) &&
        !dateTimeIdentifiers.some(el => el.startsWith(name))
      ) {
        return nextMatch;
      }
    }

  }

  const identifiersMap = {
    [ identifier ]: 'identifier',
    [ nameIdentifier ]: 'nameIdentifier'
  };

  const identifiers = new ExternalTokenizer((input, stack) => {

    LOG_PARSE_DEBUG && console.log('%s: T <identifier | nameIdentifier>', input.pos);

    const nameMatch = parseName(input, stack.context);

    const start = stack.context.tokens;

    const match = nameMatch || parseIdentifier(input, 0, start.length > 0);

    if (match) {
      input.advance(match.offset);
      input.acceptToken(nameMatch ? nameMatch.term : identifier);

      LOG_PARSE && console.log('%s: MATCH <%s> <%s>', input.pos, nameMatch ? identifiersMap[nameMatch.term] : 'identifier', match.token);
    }
  }, { contextual: true });


  const propertyIdentifiers = new ExternalTokenizer((input, stack) => {

    LOG_PARSE_DEBUG && console.log('%s: T <propertyIdentifier>', input.pos);

    const start = stack.context.tokens;

    const match = parseIdentifier(input, 0, start.length > 0);

    if (match) {
      input.advance(match.offset);
      input.acceptToken(propertyIdentifier);

      LOG_PARSE && console.log('%s: MATCH <propertyIdentifier> <%s>', input.pos, match.token);
    }
  });


  const insertSemicolon = new ExternalTokenizer((input, stack) => {

    LOG_PARSE_DEBUG && console.log('%s: T <insertSemi>', input.pos);

    let offset;
    let insert = false;

    for (offset = 0;; offset++) {
      const char = input.peek(offset);

      if (spaceChars.includes(char)) {
        continue;
      }

      if (newlineChars.includes(char)) {
        insert = true;
      }

      break;
    }

    if (insert) {

      const identifier = parseIdentifier(input, offset + 1);
      const spaces = parseSpaces(input, offset + 1);

      if (spaces || identifier && /^(then|else|return|satisfies)$/.test(identifier.token)) {
        return;
      }

      LOG_PARSE && console.log('%s: MATCH <insertSemi>', input.pos);
      input.acceptToken(insertSemi);
    }
  });

  const prefixedContextStarts = {
    [ functionInvocationStart ]: 'FunctionInvocation',
    [ filterExpressionStart ]: 'FilterExpression',
    [ pathExpressionStart ]: 'PathExpression'
  };

  const contextStarts = {
    [ contextStart ]: 'Context',
    [ functionDefinitionStart ]: 'FunctionDefinition',
    [ forExpressionStart ]: 'ForExpression',
    [ ifExpressionStart ]: 'IfExpression',
    [ quantifiedExpressionStart ]: 'QuantifiedExpression'
  };

  const contextEnds = {
    [ Context ]: 'Context',
    [ FunctionDefinition ]: 'FunctionDefinition',
    [ ForExpression ]: 'ForExpression',
    [ IfExpression ]: 'IfExpression',
    [ QuantifiedExpression ]: 'QuantifiedExpression',
    [ PathExpression ]: 'PathExpression',
    [ FunctionInvocation ]: 'FunctionInvocation',
    [ FilterExpression ]: 'FilterExpression',
    [ ArithmeticExpression ]: 'ArithmeticExpression'
  };

  class ValueProducer {

    /**
     * @param { Function } fn
     */
    constructor(fn) {
      this.fn = fn;
    }

    get(variables) {
      return this.fn(variables);
    }

    /**
     * @param { Function }
     *
     * @return { ValueProducer }
     */
    static of(fn) {
      return new ValueProducer(fn);
    }

  }

  const dateTimeLiterals = {
    'date and time': 1,
    'date': 1,
    'time': 1,
    'duration': 1
  };

  const dateTimeIdentifiers = Object.keys(dateTimeLiterals);

  class Variables {

    constructor({
      name = 'Expressions',
      tokens = [],
      children = [],
      parent = null,
      context = { },
      value,
      raw
    } = {}) {
      this.name = name;
      this.tokens = tokens;
      this.children = children;
      this.parent = parent;
      this.context = context;
      this.value = value;
      this.raw = raw;
    }

    enterScope(name) {

      const childScope = this.of({
        name,
        parent: this
      });

      LOG_VARS && console.log('[%s] enter', childScope.path, childScope.context);

      return childScope;
    }

    exitScope(str) {

      if (!this.parent) {
        LOG_VARS && console.log('[%s] NO exit %o\n%s', this.path, this.context, indent(str, '  '));

        return this;
      }

      LOG_VARS && console.log('[%s] exit %o\n%s', this.path, this.context, indent(str, '  '));

      return this.parent.pushChild(this);
    }

    token(part) {

      LOG_VARS && console.log('[%s] token <%s> + <%s>', this.path, this.tokens.join(' '), part);

      return this.assign({
        tokens: [ ...this.tokens, part ]
      });
    }

    literal(value) {

      LOG_VARS && console.log('[%s] literal %o', this.path, value);

      return this.pushChild(this.of({
        name: 'Literal',
        value
      }));
    }

    /**
     * Return computed scope value
     *
     * @return {any}
     */
    computedValue() {
      for (let scope = this;;scope = scope.children.slice(-1)[0]) {

        if (!scope) {
          return null;
        }

        if (scope.value) {
          return scope.value;
        }
      }
    }

    contextKeys() {
      return Object.keys(this.context).map(normalizeContextKey);
    }

    get path() {
      return this.parent?.path?.concat(' > ', this.name) || this.name;
    }

    /**
     * Return value of variable.
     *
     * @param { string } variable
     * @return { any } value
     */
    get(variable) {

      const names = [ variable, variable && normalizeContextKey(variable) ];

      const contextKey = Object.keys(this.context).find(
        key => names.includes(normalizeContextKey(key))
      );

      if (typeof contextKey === 'undefined') {
        return undefined;
      }

      const val = this.context[contextKey];

      if (val instanceof ValueProducer) {
        return val.get(this);
      } else {
        return val;
      }
    }

    resolveName() {

      const variable = this.tokens.join(' ');
      const tokens = [];

      const parentScope = this.assign({
        tokens
      });

      const variableScope = this.of({
        name: 'VariableName',
        parent: parentScope,
        value: this.get(variable),
        raw: variable
      });

      LOG_VARS && console.log('[%s] resolve name <%s=%s>', variableScope.path, variable, this.get(variable));

      return parentScope.pushChild(variableScope);
    }

    pushChild(child) {

      if (!child) {
        return this;
      }

      const parent = this.assign({
        children: [ ...this.children, child ]
      });

      child.parent = parent;

      return parent;
    }

    pushChildren(children) {

      let parent = this;

      for (const child of children) {
        parent = parent.pushChild(child);
      }

      return parent;
    }

    declareName() {

      if (this.tokens.length === 0) {
        throw Error('no tokens to declare name');
      }

      const variableName = this.tokens.join(' ');

      LOG_VARS && console.log('[%s] declareName <%s>', this.path, variableName);

      return this.assign({
        tokens: []
      }).pushChild(
        this.of({
          name: 'Name',
          value: variableName
        })
      );
    }

    define(name, value) {

      if (typeof name !== 'string') {
        LOG_VARS && console.log('[%s] no define <%s=%s>', this.path, name, value);

        return this;
      }

      LOG_VARS && console.log('[%s] define <%s=%s>', this.path, name, value);

      const context = {
        ...this.context,
        [name]: value
      };

      return this.assign({
        context
      });
    }

    /**
     * @param { Record<string, any> } [options]
     *
     * @return { Variables }
     */
    assign(options = {}) {

      return Variables.of({
        ...this,
        ...options
      });
    }

    /**
     * @param { Record<string, any> } [options]
     *
     * @return { Variables }
     */
    of(options = {}) {

      const defaultOptions = {
        context: this.context,
        parent: this.parent
      };

      return Variables.of({
        ...defaultOptions,
        ...options
      });
    }

    static of(options) {
      const {
        name,
        tokens = [],
        children = [],
        parent = null,
        context = {},
        value,
        raw
      } = options;

      return new Variables({
        name,
        tokens: [ ...tokens ],
        children: [ ...children ],
        context: {
          ...context
        },
        parent,
        value,
        raw
      });
    }

  }

  /**
   * @param { string } name
   *
   * @return { string } normalizedName
   */
  function normalizeContextKey(name) {
    return name.replace(/\s*([./\-'+*])\s*/g, ' $1 ').replace(/\s{2,}/g, ' ').trim();
  }

  /**
   * Wrap children of variables under the given named child.
   *
   * @param { Variables } variables
   * @param { string } name
   * @param { string } code
   * @return { Variables }
   */
  function wrap(variables, scopeName, code) {

    const parts = variables.children.filter(c => c.name !== scopeName);
    const children = variables.children.filter(c => c.name === scopeName);

    const namePart = parts[0];
    const valuePart = parts[Math.max(1, parts.length - 1)];

    const name = namePart.computedValue();
    const value = valuePart?.computedValue() || null;

    return variables
      .assign({
        children
      })
      .enterScope(scopeName)
      .pushChildren(parts)
      .exitScope(code)
      .define(name, value);
  }

  /**
   * @param { any } context
   *
   * @return { ContextTracker<Variables> }
   */
  function trackVariables(context = {}) {

    const start = Variables.of({
      context
    });

    return new ContextTracker({
      start,
      reduce(variables, term, stack, input) {

        if (term === Context) {
          variables = variables.assign({
            value: variables.context
          });
        }

        if (term === IfExpression) {
          const [ thenPart, elsePart ] = variables.children.slice(-2);

          variables = variables.assign({
            value: {
              ...thenPart?.computedValue(),
              ...elsePart?.computedValue()
            }
          });
        }

        if (term === FilterExpression) {
          const [ sourcePart, _ ] = variables.children.slice(-2);

          variables = variables.assign({
            value: sourcePart?.computedValue()
          });
        }

        if (term === FunctionInvocation) {

          const [
            name,
            ...args
          ] = variables.children;

          // preserve type information through `get value(context, key)` utility
          if (name?.raw === 'get value') {
            variables = getContextValue(variables, args);
          }
        }

        const start = contextStarts[term];

        if (start) {
          return variables.enterScope(start);
        }

        const prefixedStart = prefixedContextStarts[term];

        // pull <expression> into new <prefixedStart> context
        if (prefixedStart) {

          const children = variables.children.slice(0, -1);
          const lastChild = variables.children.slice(-1)[0];

          return variables.assign({
            children
          }).enterScope(prefixedStart).pushChild(lastChild).assign({
            context: {
              ...variables.context,
              ...lastChild?.computedValue()
            }
          });
        }

        const code = input.read(input.pos, stack.pos);

        const end = contextEnds[term];

        if (end) {
          return variables.exitScope(code);
        }

        if (term === ContextEntry) {
          return wrap(variables, 'ContextEntry', code);
        }

        if (
          term === ForInExpression ||
          term === QuantifiedInExpression
        ) {
          return wrap(variables, 'InExpression', code);
        }

        // define <partial> within ForExpression body
        if (term === forExpressionBodyStart) {

          return variables.define(
            'partial',
            ValueProducer.of(variables => {
              return variables.children[variables.children.length - 1]?.computedValue();
            })
          );
        }

        if (
          term === ParameterName
        ) {
          const [ left ] = variables.children.slice(-1);

          const name = left.computedValue();

          // TODO: attach type information
          return variables.define(name, 1);
        }

        // pull <expression> into ArithmeticExpression child
        if (
          term === arithmeticPlusStart ||
          term === arithmeticTimesStart ||
          term === arithmeticExpStart
        ) {
          const children = variables.children.slice(0, -1);
          const lastChild = variables.children.slice(-1)[0];

          return variables.assign({
            children
          }).enterScope('ArithmeticExpression').pushChild(lastChild);
        }

        if (term === arithmeticUnaryStart) {
          return variables.enterScope('ArithmeticExpression');
        }

        if (
          term === Identifier ||
          term === AdditionalIdentifier ||
          term === PropertyIdentifier
        ) {
          return variables.token(code);
        }

        if (
          term === StringLiteral
        ) {
          return variables.literal(code.replace(/^"|"$/g, ''));
        }

        if (term === BooleanLiteral) {
          return variables.literal(code === 'true' ? true : false);
        }

        if (term === NumericLiteral) {
          return variables.literal(parseFloat(code));
        }

        if (term === nil) {
          return variables.literal(null);
        }

        if (
          term === VariableName
        ) {
          return variables.resolveName();
        }

        if (
          term === Name ||
          term === PropertyName
        ) {
          return variables.declareName();
        }

        if (
          term === expression0 ||
          term === PositiveUnaryTest
        ) {
          if (variables.tokens.length > 0) {
            throw new Error('uncleared name');
          }
        }

        if (term === expression0) {

          let parent = variables;

          while (parent.parent) {
            parent = parent.exitScope(code);
          }

          return parent;
        }

        return variables;
      }
    });
  }

  const variableTracker = trackVariables({});


  // helpers //////////////

  function getContextValue(variables, args) {

    if (!args.length) {
      return variables.assign({
        value: null
      });
    }

    if (args[0].name === 'Name') {
      args = extractNamedArgs(args, [ 'm', 'key' ]);
    }

    if (args.length !== 2) {
      return variables.assign({
        value: null
      });
    }

    const [
      context,
      key
    ] = args;

    const keyValue = key?.computedValue();
    const contextValue = context?.computedValue();

    if (
      (!contextValue || typeof contextValue !== 'object') || typeof keyValue !== 'string'
    ) {
      return variables.assign({
        value: null
      });
    }

    return variables.assign({
      value: [ normalizeContextKey(keyValue), keyValue ].reduce((value, keyValue) => {
        if (keyValue in contextValue) {
          return contextValue[keyValue];
        }

        return value;
      }, null)
    });
  }

  function extractNamedArgs(args, argNames) {

    const context = {};

    for (let i = 0; i < args.length; i += 2) {
      const [ name, value ] = args.slice(i, i + 2);

      context[name.value] = value;
    }

    return argNames.map(name => context[name]);
  }

  const feelHighlighting = styleTags({
    'StringLiteral': tags.string,
    'NumericLiteral': tags.number,
    'BooleanLiteral': tags.bool,
    'Name QualifiedName': tags.name,
    'CompareOp': tags.compareOperator,
    'ArithOp': tags.arithmeticOperator,
    'PropertyName PathExpression/Name Key': tags.propertyName,
    'for if then else some every satisfies between': tags.controlKeyword,
    'in return instance of and or': tags.operatorKeyword,
    'function': tags.definitionKeyword,
    'FormalParameter/Type!': tags.typeName,
    'as': tags.keyword,
    'Wildcard': tags.special,
    'null': tags.null,
    ',': tags.separator,
    '[ ]': tags.squareBracket,
    '{ }': tags.brace,
    '( )': tags.paren,
    'LineComment': tags.lineComment,
    'BlockComment': tags.blockComment,
    'ParameterName VariableName ?': tags.variableName,
    'DateTimeConstructor! SpecialFunctionName BuiltInFunctionName': tags.function(tags.special(tags.variableName)),
    'FunctionInvocation/VariableName': tags.function(tags.variableName),
    'List Interval': tags.list,
    'BuiltInType ListType ContextType FunctionType': tags.function(tags.typeName),
    'Context': tags.definition(tags.literal),
    'ContextEntry/Key': tags.variableName,
    'InExpression/Name': tags.local(tags.variableName),
    'ParameterName/Name': tags.local(tags.variableName),
    'IterationContext/".." Interval/".." "."': tags.punctuation
  });

  // This file was generated by lezer-generator. You probably shouldn't edit it.
  const spec_identifier = {__proto__:null,for:10, in:30, return:34, if:38, then:40, else:42, some:46, every:48, satisfies:55, or:58, and:62, between:70, instance:86, of:89, days:99, time:101, duration:103, years:105, months:107, date:109, list:115, context:121, function:128, string:147, length:149, upper:151, case:153, lower:155, substring:157, before:159, after:161, starts:163, with:165, ends:167, contains:169, insert:171, index:173, distinct:175, values:177, met:179, by:181, overlaps:183, finished:185, started:187, day:189, year:191, week:193, month:195, get:197, value:199, entries:201, null:210, true:380, false:380, "?":224, external:240, not:263};
  const parser = LRParser.deserialize({
    version: 14,
    states: "!&nO`QYOOO&wQYOOOOQU'#Ce'#CeO'RQYO'#C`O([Q^O'#FlOOQQ'#GQ'#GQO*|QYO'#GQO`QYO'#DUOOQU'#FZ'#FZO-rQ^O'#D]OOQO'#GX'#GXO1yQWO'#DuOOQU'#Ej'#EjOOQU'#Ek'#EkOOQU'#El'#ElO2OOWO'#EoO1yQWO'#EmOOQU'#Em'#EmOOQU'#G_'#G_OOQU'#G]'#G]O2TQYO'#ErO`QYO'#EsO2uQYO'#EtO2TQYO'#EqOOQU'#Eq'#EqOOQU'#Fn'#FnO4ZQ^O'#FnO6uQWO'#EuOOQP'#Gh'#GhO6zQXO'#E|OOQU'#Ge'#GeOOQU'#Fm'#FmOOQQ'#FU'#FUQ`QYOOOOQQ'#Fo'#FoOOQQ'#Fx'#FxO`QYO'#CnOOQQ'#Fy'#FyO'RQYO'#CrO7VQYO'#DvO7[QYO'#DvO7aQYO'#DvO7fQYO'#DvO7nQYO'#DvO7sQYO'#DvO7xQYO'#DvO7}QYO'#DvO8SQYO'#DvO8XQYO'#DvO8^QYO'#DvO8cQYO'#DvO8hQYO'#DvOOQU'#G^'#G^O8pQYO'#EnOOQO'#En'#EnOOQO'#Gf'#GfO:SQYO'#DQO:jQWO'#F|OOQO'#DS'#DSO:uQYO'#GQQOQWOOO:|QWOOO;pQYO'#CdO;}QYO'#FqOOQQ'#Cc'#CcO<SQYO'#FpOOQQ'#Cb'#CbO<[QYO,58zO`QYO,59hOOQQ'#F}'#F}OOQQ'#GO'#GOOOQQ'#GP'#GPO`QYO,59pO`QYO,59pO`QYO,59pOOQQ'#GV'#GVO'RQYO,5:]OOQQ'#GW'#GWO`QYO,5:_OOQQ,5<W,5<WO`QYO,59dO`QYO,59fO`QYO,59hO<aQYO,59hO?VQYO,59rOOQU,5;U,5;UO?[Q^O,59pOOQU-E9X-E9XOCcQYO'#GYOOQU,5:a,5:aOOQU,5;Z,5;ZOOQU,5;X,5;XOCjQ^O'#D[OGqQWO'#EjOOQU'#Gd'#GdOGvQWO,5;^OG{QYO,5;_OJZQ^O'#D[OJeQYO'#G]OLsQYO'#G[OMQQWO,5;`OOQU,5;],5;]OOQU,5<Y,5<YOMVQYO,5;aOOQP'#FQ'#FQOMyQXO'#FPOOQO'#FO'#FOONQQWO'#E}ONVQWO'#GiON_QWO,5;hOOQQ-E9S-E9SONdQYO,59YO;}QYO'#F{OOQQ'#Cv'#CvONkQYO'#FzOOQQ'#Cu'#CuONsQYO,59^ONxQYO,5:bOOQO,5:b,5:bON}QYO,5:bO! VQYO,5:bO! [QYO,5;YO`QYO'#FYO! aQWO,5<hO`QYOOOOQR'#Cf'#CfOOQQ'#FV'#FVO!!WQYO,59OO`QYO,5<]OOQQ'#Ft'#FtO'RQYO'#FWO!!hQYO,5<[O`QYO1G.fOOQQ'#Fw'#FwO!!pQ^O1G/SO!&_Q^O1G/[O!)|Q^O1G/[O!1YQ^O1G/[OOQU1G/w1G/wO!1vQYO1G/yO!5]Q^O1G/OO!9RQ^O1G/QO!:aQYO1G/SO`QYO1G/SOOQU1G/S1G/SO!:hQYO1G/^O!;SQ^O'#CdOOQO'#Eg'#EgO!<fQWO'#EfO!<kQWO'#GZOOQO'#Ee'#EeOOQO'#Eh'#EhO!<sQWO,5<tO'RQYO'#F[O!<xQ^O,59vO2TQYO1G0xOOQU1G0y1G0yO`QYO'#F`O!APQWO,5<vOOQU1G0z1G0zO!A[QWO'#EwO!AgQWO'#GgOOQO'#Ev'#EvO!AoQWO1G0{OOQP'#Fb'#FbO!AtQXO,5;kO`QYO,5;iO!A{QXO'#FcO!BTQWO,5=TOOQU1G1S1G1SO`QYO1G.tO`QYO,5<gO'RQYO'#FXO!B]QYO,5<fO`QYO1G.xO!BeQYO1G/|OOQO1G/|1G/|OOQO1G0t1G0tOOQO,5;t,5;tOOQO-E9W-E9WO!BjQWOOOOQQ-E9T-E9TO!BoQYO'#ClOOQQ1G1w1G1wOOQQ,5;r,5;rOOQQ-E9U-E9UO!B|Q^O7+$QOOQU7+%e7+%eO`QYO7+$nO!EnQYO,5;_O!EuQWO7+$nOOQU'#DZ'#DZO!EzQYO'#D^O!FPQYO'#D^O!FUQYO'#D^O!FZQ`O'#DfO!F`Q`O'#DiO!FeQ`O'#DmOOQU7+$x7+$xO`QYO,5;QO'RQYO'#F_O!FjQWO,5<uOOQU1G2`1G2`OOQU,5;v,5;vOOQU-E9Y-E9YO!FrQWO7+&dO!F}QYO,5;zOOQO-E9^-E9^O!:hQYO,5;cO'RQYO'#FaO!G[QWO,5=RO!GdQYO7+&gOOQP-E9`-E9`O!GkQYO1G1TOOQO,5;},5;}OOQO-E9a-E9aO!KdQ^O7+$`O!KkQYO1G2ROOQQ,5;s,5;sOOQQ-E9V-E9VO!KuQ^O7+$dOOQO7+%h7+%hO`QYO,59WO!NgQ^O<<HYOOQU<<HY<<HYO#$UQYO,59xO#$ZQYO,59xO#$`QYO,59xO#$eQYO,5:QO'RQYO,5:TO#%PQbO,5:XO#%WQYO1G0lOOQO,5;y,5;yOOQO-E9]-E9]OOQU<<JO<<JOOOQO1G0}1G0}OOQO,5;{,5;{OOQO-E9_-E9_O#%bQ^O'#EyOOQU<<JR<<JRO`QYO<<JRO`QYO<<GzO#(SQYO1G.rO#(^QYO1G/dOOQU1G/d1G/dO#(cQbO'#D]O#(tQ`O'#D[O#)PQ`O1G/lO#)UQWO'#DlO#)ZQ`O'#GROOQO'#Dk'#DkO#)cQ`O1G/oOOQO'#Dp'#DpO#)hQ`O'#GTOOQO'#Do'#DoO#)pQ`O1G/sOOQUAN?mAN?mO#)uQ^OAN=fOOQU7+%O7+%OO#,gQ`O,59vOOQU7+%W7+%WO#$eQYO,5:WO'RQYO'#F]O#,rQ`O,5<mOOQU7+%Z7+%ZO#$eQYO'#F^O#,zQ`O,5<oO#-SQ`O7+%_OOQO1G/r1G/rOOQO,5;w,5;wOOQO-E9Z-E9ZOOQO,5;x,5;xOOQO-E9[-E9[O!:hQYO<<HyOOQUAN>eAN>eO#-XQ^O'#FnO`QYO,59hO`QYO,59pO`QYO,59pO`QYO,59pO`QYO,59dO`QYO,59fO<aQYO,59hO`QYO1G.fO#-rQYO1G/SO#/`QYO1G/[O#0|QYO1G/[O#3wQYO1G/OO#5lQYO1G/QO'RQYO'#F[O`QYO1G.tO`QYO1G.xO#5|QYO7+$QO`QYO7+$nO#6mQYO7+&gO#8bQYO7+$`O#8iQYO7+$`O#8pQ^O7+$`O#8wQYO7+$dO#9hQYO<<HYO#;UQYO'#EyO`QYO<<JRO`QYO<<GzO#;uQYOAN=fO#$eQYO<<HyO`QYO'#DUO#<fQ^O'#DQO<[QYO,58zO#?WQYO,59YO#?_QYO,59^O#?dQYO1G/SO#?kQWO1G0{O`QYO1G.tO#?pQ`O7+%_O`QYO1G.tO'RQYO'#C`O`QYO'#CnO'RQYO'#CrO`QYO,59hOMVQYO,5;aO#?uQYO,59YO#?|Q`O1G/sO#@RQYO,59YO#@YQWO'#EuO`QYO'#CnO`QYO,59hO`QYO,59pO`QYO,59pO`QYO,59pO`QYO,59dO`QYO,59fO<aQYO,59hO`QYO1G.fO#@_Q^O1G/SO#@fQ^O1G/[O#@mQ^O1G/[O#@tQ^O1G/OO#A[Q^O1G/QO`QYO1G.xO#BpQ^O7+$QO`QYO7+$nO#EeQYO7+&gO#ElQ^O7+$dO#HaQ^O<<HYO#%PQbO,5:XO#HhQ^O'#EyO`QYO<<JRP`QYO<<GzP#K]Q^OAN=fO#L`Q^O'#DQO`QYO'#CnO`QYO'#DUO<[QYO,58zO$ TQYO,59^O$ YQYO1G/SO$ aQWO1G0{O$ fQ`O'#DmO`QYO,59hO`QYO,59pO`QYO,59pO`QYO,59pO`QYO,59dO`QYO,59fO<aQYO,59hO`QYO1G.fO$ kQYO1G/SO$ rQYO1G/[O$ yQYO1G/[O$!QQYO1G/OO$!hQYO1G/QO`QYO1G.xO$#|QYO7+$QO`QYO7+$nO$$pQYO7+&gO$$wQYO7+$dO$%kQYO<<HYO$%rQYO'#EyO`QYO<<JRP`QYO<<GzP$&fQYOAN=fO`QYO'#DUO<[QYO,58zO$'iQYO,59^O$'nQYO1G/SO$'uQWO1G0{O'RQYO'#C`O'RQYO'#CrO`QYO,59hOMVQYO,5;aO$'zQWO'#EuO'RQYO'#C`O'RQYO'#CrO$(PQYO'#DQO`QYO,59hOMVQYO,5;aO$(jQWO'#Eu",
    stateData: "$(o~O$^OS$_OSPOSQOS~OTrOZUO[TOcsOguOhuOrgOueO!S!WO!T!WO!UwO!W!VO!Z|O!b!XO!fdO!hfO!kxO!myO!oyO!pzO!s{O!u{O!w}O!x!OO!y!PO!{!QO!}zO#O!QO#P!QO#Q!RO#S!SO#T!SO#U!TO#]!UO#diO#olO$YQO$ZQO%S[O%T]O%U^O%V_O~OTrO[TOcsOguOhuOrgOueO!S!WO!T!WO!UwO!W!VO!Z|O!b!XO!fdO!hfO!kxO!myO!oyO!pzO!s{O!u{O!w}O!x!OO!y!PO!{!QO!}zO#O!QO#P!QO#Q!RO#S!SO#T!SO#U!TO#]!UO#diO#olO$YQO$ZQO%S[O%T]O%U^O%V_O~OZ!]O#w!_O~P$UO$YQO$ZQO~OZ!gO[!gO]!hO^!hO_!uOm!rOo!sOq!fOr!fOs!tOy!iO{!vO!h!oO$f!mOu${X~O$[!qO%^!qOT$`Xc$`Xg$`Xh$`X!S$`X!T$`X!U$`X!W$`X!Z$`X!b$`X!f$`X!k$`X!m$`X!o$`X!p$`X!s$`X!u$`X!w$`X!x$`X!y$`X!{$`X!}$`X#O$`X#P$`X#Q$`X#S$`X#T$`X#U$`X#]$`X#d$`X#o$`X$W$`X$Y$`X$Z$`X%S$`X%T$`X%U$`X%V$`X~P'ZO%S!wOT$tXZ$tX[$tXc$tXg$tXh$tXr$tXu$tX!S$tX!T$tX!U$tX!W$tX!Z$tX!b$tX!f$tX!h$tX!k$tX!m$tX!o$tX!p$tX!s$tX!u$tX!w$tX!x$tX!y$tX!{$tX!}$tX#O$tX#P$tX#Q$tX#S$tX#T$tX#U$tX#]$tX#d$tX#o$tX$Y$tX$Z$tX%T$tX%U$tX%V$tX~O$YQO$ZQOT!PXZ!PX[!PX]!PX^!PX_!PXc!PXg!PXh!PXm!PXo!PXq!PXr!PXs!PXu!PXy!PX{!PX!S!PX!T!PX!U!PX!W!PX!Z!PX!b!PX!f!PX!h!PX!k!PX!m!PX!o!PX!p!PX!s!PX!u!PX!w!PX!x!PX!y!PX!{!PX!}!PX#O!PX#P!PX#Q!PX#S!PX#T!PX#U!PX#]!PX#d!PX#o!PX$W!PX$[!PX$f!PX%S!PX%T!PX%U!PX%V!PX%^!PX$j!PX$i!PXw!PXd!PXa!PX#n!PXe!PXk!PX~Ou!zO~O%T]O~OZ#PO!S!WO!T!WO!W!VO$YQO$ZQO%S[O%T]O%U^O%V_O~O!f%OP~P`O$[#YOZ$bX[$bX]$bX^$bX_$bXm$bXo$bXq$bXr$bXs$bXu$bXy$bX{$bX!f$bX!h$bX$W$bX$f$bXe$bX~OT$bXc$bXg$bXh$bX!S$bX!T$bX!U$bX!W$bX!Z$bX!b$bX!k$bX!m$bX!o$bX!p$bX!s$bX!u$bX!w$bX!x$bX!y$bX!{$bX!}$bX#O$bX#P$bX#Q$bX#S$bX#T$bX#U$bX#]$bX#d$bX#o$bX$Y$bX$Z$bX$[$bX%S$bX%T$bX%U$bX%V$bX%^$bX~P2|Ou#ZO~O$X#[O%T]O#n%]P~Oo#iO~O!l#jO~O!n#jO~O!q#jO!r#jO~O!t#jO~O!v#jO~O!q#jO~O|#jO~O!z#jO~O!|#jO~O|#kO~O|#lO~O#V#jO#W#jO~Oo#mOu#bX~OZ!gO[!gO]!hO^!hOy!iO{!vO!h!oO$f!mOu${X$WtX$jtXwtX!ftXdtXatX$itX#ntXktX~O_'UOm'SOo'TOq'OOr'OOs'zO~P8xO$j#nO$W$pXw$pX~O$W#vX~P*|Ou#pO~OZ#qO[#qO]#qO^#qO$YQO$ZQO$f#qO$g#qO$vWX~O_WXwWX$jWX~P;RO_#uO~O$j#vOa$dX~Oa#yO~OTrOZUO[TOcsOguOhuOrgOu$TO!S!WO!T!WO!UwO!W!VO!Z|O!b!XO!fdO!hfO!kxO!myO!oyO!pzO!s{O!u{O!w}O!x!OO!y!PO!{!QO!}zO#O!QO#P!QO#Q!RO#S!SO#T!SO#U!TO#]!UO#diO#olO$YQO$ZQO%S[O%T]O%U^O%V_O~O|$VO~O{!vO!h!oO$f!mOTxaZxa[xa]xa^xa_xacxagxahxamxaoxaqxarxasxau${Xyxa!Sxa!Txa!Uxa!Wxa!Zxa!bxa!fxa!kxa!mxa!oxa!pxa!sxa!uxa!wxa!xxa!yxa!{xa!}xa#Oxa#Pxa#Qxa#Sxa#Txa#Uxa#]xa#dxa#oxa$Wxa$Yxa$Zxa$[xa%Sxa%Txa%Uxa%Vxa%^xa$jxawxadxaaxa$ixa#nxaexakxa~Ow%OP~P`O$f$_O$i!OXT!OXZ!OX[!OX]!OX^!OX_!OXc!OXg!OXh!OXm!OXo!OXq!OXr!OXs!OXu!OXy!OX{!OX!S!OX!T!OX!U!OX!W!OX!Z!OX!b!OX!f!OX!h!OX!k!OX!m!OX!o!OX!p!OX!s!OX!u!OX!w!OX!x!OX!y!OX!{!OX!}!OX#O!OX#P!OX#Q!OX#S!OX#T!OX#U!OX#]!OX#d!OX#o!OX$W!OX$Y!OX$Z!OX$[!OX%S!OX%T!OX%U!OX%V!OX%^!OX$j!OXw!OXd!OXa!OX#n!OXe!OXk!OX~O%S!wO~O$i$aO~OZ!gO[!gO]!hO^!hO_'UOm'SOo'TOq'OOr'OOs'zOw$bOy!iO{!vO!h!oO$f!mOu${X~O$[#YOZ$bX[$bX]$bX^$bX_$bXm$bXo$bXq$bXr$bXs$bXu$bXw$bXy$bX{$bX!h$bX!f$bX$j$bX~O$f$_O$i!OX~PIPOZ%PX[%PX]%PX^%PX_%PXm%PXo%PXq%PXr%PXs%PXu%PXw%PXy%PX{%PX!h%PX$f%PX$i%WX!f%PX$j%PX~OZ!gO[!gO]!hO^!hO_'UOm'SOo'TOq'OOr'OOs'zOy!iO{!vO!h!oO$f!mOu${X~O$j$cO!f%OXw%OX~PKrO!f$eO~O$YQO$ZQOw%ZP~OZ#qO[#qO]#qO^#qO$X#[O$f#qO$g#qO~O$v#sX~PMbO$v$lO~O$j$mO#n%]X~O#n$oO~Od$pO~PKrO$j$rOk$nX~Ok$tO~O!V$uO~O#R$vO#S$vO~O#R$vO~O!S$wO~O$j#nO$W$paw$pa~OZ#qO[#qO]#qO^#qO$YQO$ZQO$f#qO$g#qO~O_Wa$vWawWa$jWa~P! lO$j#vOa$da~OZ!gO[!gO]!hO^!hOy!iO{!vO!h!oO$f!mOTpi_picpigpihpimpiopiqpirpispiu${X!Spi!Tpi!Upi!Wpi!Zpi!bpi!fpi!kpi!mpi!opi!ppi!spi!upi!wpi!xpi!ypi!{pi!}pi#Opi#Ppi#Qpi#Spi#Tpi#Upi#]pi#dpi#opi$Wpi$Ypi$Zpi$[pi%Spi%Tpi%Upi%Vpi%^pi~O]!hO^!hOy!iO{!vO!h!oO$f!mOTxiZxi[xi_xicxigxihximxioxiqxirxisxiu${X!Sxi!Txi!Uxi!Wxi!Zxi!bxi!fxi!kxi!mxi!oxi!pxi!sxi!uxi!wxi!xxi!yxi!{xi!}xi#Oxi#Pxi#Qxi#Sxi#Txi#Uxi#]xi#dxi#oxi$Wxi$Yxi$Zxi$[xi%Sxi%Txi%Uxi%Vxi%^xi~Oy!iO{!vO!h!oO$f!mOTxiZxi[xi]xi^xi_xicxigxihximxioxiqxirxisxiu${X!Sxi!Txi!Uxi!Wxi!Zxi!bxi!fxi!kxi!mxi!oxi!pxi!sxi!uxi!wxi!xxi!yxi!{xi!}xi#Oxi#Pxi#Qxi#Sxi#Txi#Uxi#]xi#dxi#oxi$Wxi$Yxi$Zxi$[xi%Sxi%Txi%Uxi%Vxi%^xi~O{!vO!h!oO$f!mOTxiZxi[xi]xi^xi_xicxigxihximxioxiqxirxisxiu${X!Sxi!Txi!Uxi!Wxi!Zxi!bxi!fxi!kxi!mxi!oxi!pxi!sxi!uxi!wxi!xxi!yxi!{xi!}xi#Oxi#Pxi#Qxi#Sxi#Txi#Uxi#]xi#dxi#oxi$Wxi$Yxi$Zxi$[xi%Sxi%Txi%Uxi%Vxi%^xiexi~Oyxi$jxiwxidxiaxi$ixi#nxikxi~P!-kO!f%RO~PKrOZ!gO[!gO]!hO^!hOy!iO{!vO!h!oO$f!mOTlicliglihlimliu${X!Sli!Tli!Uli!Wli!Zli!bli!fli!kli!mli!oli!pli!sli!uli!wli!xli!yli!{li!}li#Oli#Pli#Qli#Sli#Tli#Uli#]li#dli#oli$Wli$Yli$Zli$[li%Sli%Tli%Uli%Vli%^li~O_!uOo!sOq!fOr!fOs!tO~P!1}OZ!gO[!gO]!hO^!hOy!iO{!vO!h!oO$f!mOTnicnignihnimnioniu${X!Sni!Tni!Uni!Wni!Zni!bni!fni!kni!mni!oni!pni!sni!uni!wni!xni!yni!{ni!}ni#Oni#Pni#Qni#Sni#Tni#Uni#]ni#dni#oni$Wni$Yni$Zni$[ni%Sni%Tni%Uni%Vni%^ni~O_!uOq!fOr!fOs!tO~P!5pOZ!gO[!gO]!hO^!hO_'UOm'SOq'OOr'OOs'zOy!iO{!vO!h!oO$f!mOu${X~Oo%SO~P!9cO!R%WO!U%XO!W%YO!Z%ZO!^%[O!b%]O$YQO$ZQO~OZ#}X[#}X]#}X^#}X_#}Xm#}Xo#}Xq#}Xr#}Xs#}Xu#}Xw#}Xy#}X{#}X!h#}X$Y#}X$Z#}X$[#}X$f#}X$j#}X~P;RO$v%_O~O$j%`Ow$}X~Ow%bO~O$f$_O$i!OaT!OaZ!Oa[!Oa]!Oa^!Oa_!Oac!Oag!Oah!Oam!Oao!Oaq!Oar!Oas!Oau!Oay!Oa{!Oa!S!Oa!T!Oa!U!Oa!W!Oa!Z!Oa!b!Oa!f!Oa!h!Oa!k!Oa!m!Oa!o!Oa!p!Oa!s!Oa!u!Oa!w!Oa!x!Oa!y!Oa!{!Oa!}!Oa#O!Oa#P!Oa#Q!Oa#S!Oa#T!Oa#U!Oa#]!Oa#d!Oa#o!Oa$W!Oa$Y!Oa$Z!Oa$[!Oa%S!Oa%T!Oa%U!Oa%V!Oa%^!Oa$j!Oaw!Oad!Oaa!Oa#n!Oae!Oak!Oa~O$j$cO!f%Oaw%Oa~O$v%hOw#kX$j#kX~O$j%iOw%ZX~Ow%kO~O$v#sa~PMbO$X#[O%T]O~O$j$mO#n%]a~O$j$rOk$na~O!T%uO~Ow!^O~O$i%vOa`X$j`X~PKrOTSqcSqgSqhSq!SSq!TSq!USq!WSq!ZSq!bSq!fSq!kSq!mSq!oSq!pSq!sSq!uSq!wSq!xSq!ySq!{Sq!}Sq#OSq#PSq#QSq#SSq#TSq#USq#]Sq#dSq#oSq$WSq$YSq$ZSq$[Sq%SSq%TSq%USq%VSq%^Sq~P'ZO$jtX~PG{Ow%xO~Oo%yO~Oo%zO~Oo%{O~O![%|O~O![%}O~O![&OO~O$j%`Ow$}a~Ow&SO!f&SO!h&SO~O!f$Sa$j$Saw$Sa~PKrO$j%iOw%Za~O#l&YO~P`O#n#qi$j#qi~PKrOZ!gO[!gO]!hO^!hO_(XOm(VOo(WOq(ROr(ROs)iOy!iO{!vO!h!oO$f!mOTbqcbqgbqhbqu${X!Sbq!Tbq!Ubq!Wbq!Zbq!bbq!fbq!kbq!mbq!obq!pbq!sbq!ubq!wbq!xbq!ybq!{bq!}bq#Obq#Pbq#Qbq#Sbq#Tbq#Ubq#]bq#dbq#obq$Wbq$Ybq$Zbq$[bq%Sbq%Tbq%Ubq%Vbq%^bq~Oe&ZO~P!GuOk$oi$j$oi~PKrOTfqcfqgfqhfq!Sfq!Tfq!Ufq!Wfq!Zfq!bfq!ffq!kfq!mfq!ofq!pfq!sfq!ufq!wfq!xfq!yfq!{fq!}fq#Ofq#Pfq#Qfq#Sfq#Tfq#Ufq#]fq#dfq#ofq$Wfq$Yfq$Zfq$[fq%Sfq%Tfq%Ufq%Vfq%^fq~P'ZOZ!gO[!gO]!hO^!hOy!iO{!vO!h!oO$f!mOTpy_pycpygpyhpympyopyqpyrpyspyu${X!Spy!Tpy!Upy!Wpy!Zpy!bpy!fpy!kpy!mpy!opy!ppy!spy!upy!wpy!xpy!ypy!{py!}py#Opy#Ppy#Qpy#Spy#Tpy#Upy#]py#dpy#opy$Wpy$Ypy$Zpy$[py%Spy%Tpy%Upy%Vpy%^py~O!S&]O~O!V&]O~O!S&^O~O!R%WO!U%XO!W%YO!Z%ZO!^%[O!b(rO$YQO$ZQO~O!X$wP~P#$eOw#Yi$j#Yi~PKrOT#mXc#mXg#mXh#mX!S#mX!T#mX!U#mX!W#mX!Z#mX!b#mX!f#mX!k#mX!m#mX!o#mX!p#mX!s#mX!u#mX!w#mX!x#mX!y#mX!{#mX!}#mX#O#mX#P#mX#Q#mX#S#mX#T#mX#U#mX#]#mX#d#mX#o#mX$W#mX$Y#mX$Z#mX$[#mX%S#mX%T#mX%U#mX%V#mX%^#mX~P'ZOa`i$j`i~PKrO!T&lO~O$YQO$ZQO!X!PX$f!PX$j!PX~O$f']O!X!OX$j!OX~O!X&nO~O$v&oO~O$j&pO!X$uX~O!X&rO~O$j&sO!X$wX~O!X&uO~OTb!Rcb!Rgb!Rhb!R!Sb!R!Tb!R!Ub!R!Wb!R!Zb!R!bb!R!fb!R!kb!R!mb!R!ob!R!pb!R!sb!R!ub!R!wb!R!xb!R!yb!R!{b!R!}b!R#Ob!R#Pb!R#Qb!R#Sb!R#Tb!R#Ub!R#]b!R#db!R#ob!R$Wb!R$Yb!R$Zb!R$[b!R%Sb!R%Tb!R%Ub!R%Vb!R%^b!R~P'ZO$f']O!X!Oa$j!Oa~O$j&pO!X$ua~O$j&sO!X$wa~O$x&{O~O$j$bXd$bXw$bXa$bX$i$bX#n$bXk$bX~P2|OZ!gO[!gO]!hO^!hOy!iO{!vO!h!oO$f!mO_pimpiopiqpirpispiu${X$Wpi$jpiwpi!fpidpiapi$ipi#npikpi~O]!hO^!hOy!iO{!vO!h!oO$f!mOZxi[xi_ximxioxiqxirxisxiu${X$Wxi$jxiwxi!fxidxiaxi$ixi#nxikxi~Oy!iO{!vO!h!oO$f!mOZxi[xi]xi^xi_ximxioxiqxirxisxiu${X$Wxi$jxiwxi!fxidxiaxi$ixi#nxikxi~OZ!gO[!gO]!hO^!hOy!iO{!vO!h!oO$f!mOmliu${X$Wli$jliwli!flidliali$ili#nlikli~O_'UOo'TOq'OOr'OOs'zO~P#2jOZ!gO[!gO]!hO^!hOy!iO{!vO!h!oO$f!mOmnioniu${X$Wni$jniwni!fnidniani$ini#nnikni~O_'UOq'OOr'OOs'zO~P#4[O$WSq$jSqwSq!fSqdSqaSq$iSq#nSqkSq~PKrO#l'iO~P`OZ!gO[!gO]!hO^!hO_(yOm(wOo(xOq(sOr(sOs)cOy!iO{!vO!h!oO$f!mOu${X$Wbq$jbqwbq!fbqdbqabq$ibq#nbqkbq~Oe'jO~P#6tOebq~P#6tOebq~P!GuO$Wfq$jfqwfq!ffqdfqafq$ifq#nfqkfq~PKrOZ!gO[!gO]!hO^!hOy!iO{!vO!h!oO$f!mO_pympyopyqpyrpyspyu${X$Wpy$jpywpy!fpydpyapy$ipy#npykpy~O$W#mX$j#mXw#mX!f#mXd#mXa#mX$i#mX#n#mXk#mX~PKrO$Wb!R$jb!Rwb!R!fb!Rdb!Rab!R$ib!R#nb!Rkb!R~PKrOTtXctXgtXhtX!StX!TtX!UtX!WtX!ZtX!btX!ftX!ktX!mtX!otX!ptX!stX!utX!wtX!xtX!ytX!{tX!}tX#OtX#PtX#QtX#StX#TtX#UtX#]tX#dtX#otX$WtX$YtX$ZtX$[tX%StX%TtX%UtX%VtX%^tX~P'ZOd'^O~PKrOk'_O~Oo'aO~P!9cOw'bO~O$x'lO~Od'tO~PKrO!X'uO~Od'vO~PKrOu'{O~Oepi~P!!pOexi~P!&_Oexi~P!)|O_(XOo(WOq(ROr(ROs)iOeli~P!1}O_(XOq(ROr(ROs)iOeni~P!5pOZ!gO[!gO]!hO^!hO_(XOm(VOo(WOq(ROr(ROs)iOy!iO{!vO!h!oO$f!mOu${X~OTSqcSqeSqgSqhSq!SSq!TSq!USq!WSq!ZSq!bSq!fSq!kSq!mSq!oSq!pSq!sSq!uSq!wSq!xSq!ySq!{Sq!}Sq#OSq#PSq#QSq#SSq#TSq#USq#]Sq#dSq#oSq$WSq$YSq$ZSq$[Sq%SSq%TSq%USq%VSq%^Sq~P#AoO#l(hO~P`OTfqcfqefqgfqhfq!Sfq!Tfq!Ufq!Wfq!Zfq!bfq!ffq!kfq!mfq!ofq!pfq!sfq!ufq!wfq!xfq!yfq!{fq!}fq#Ofq#Pfq#Qfq#Sfq#Tfq#Ufq#]fq#dfq#ofq$Wfq$Yfq$Zfq$[fq%Sfq%Tfq%Ufq%Vfq%^fq~P#AoOepy~P!NgOT#mXc#mXe#mXg#mXh#mX!S#mX!T#mX!U#mX!W#mX!Z#mX!b#mX!f#mX!k#mX!m#mX!o#mX!p#mX!s#mX!u#mX!w#mX!x#mX!y#mX!{#mX!}#mX#O#mX#P#mX#Q#mX#S#mX#T#mX#U#mX#]#mX#d#mX#o#mX$W#mX$Y#mX$Z#mX$[#mX%S#mX%T#mX%U#mX%V#mX%^#mX~P#AoOZ!gO[!gO]!hO^!hO_(XOm(VOo(WOq(ROr(ROs)iOy!iO{!vO!h!oO$f!mOu${X~Qb!RTtXctXetXgtXhtX!StX!TtX!UtX!WtX!ZtX!btX!ftX!ktX!mtX!otX!ptX!stX!utX!wtX!xtX!ytX!{tX!}tX#OtX#PtX#QtX#StX#TtX#UtX#]tX#dtX#otX$WtX$YtX$ZtX$[tX%StX%TtX%UtX%VtX%^tX~P#AoOk(`O~Oo(bO~P!9cOw(cO~O![(fO~Oepi~P#-rOexi~P#/`Oexi~P#0|O_(yOo(xOq(sOr(sOs)cOeli~P#2jO_(yOq(sOr(sOs)cOeni~P#4[OZ!gO[!gO]!hO^!hO_(yOm(wOo(xOq(sOr(sOs)cOy!iO{!vO!h!oO$f!mOu${X~OeSq$WSq$jSqwSq!fSqdSqaSq$iSq#nSqkSq~P$!{O#l)XO~P`Oefq$Wfq$jfqwfq!ffqdfqafq$ifq#nfqkfq~P$!{Oepy~P#9hOe#mX$W#mX$j#mXw#mX!f#mXd#mXa#mX$i#mX#n#mXk#mX~P$!{OZ!gO[!gO]!hO^!hO_(yOm(wOo(xOq(sOr(sOs)cOy!iO{!vO!h!oO$f!mOu${X~Qb!Rk)QO~Oo)SO~P!9cOw)TO~Ou)dO~O_(yOm(wOo(xOq(sOr(sOs)cOetX~P8xOu)jO~O",
    goto: "!7f%^PPPP%_P'X'e'n(Z+RPPPPP+[P%_PPP%_PP+_+kP%_P%_P%_PPP+tP,SP%_P%_PP,],r-V,zPPPPPPP,zPP,zP/l/o,zP/u/{%_P%_P%_0SPPPPPPPPPPPPPPPPPPPPPPPPPPPP1|2P2V1|P2b4_2b2b6c8`P%_:]%_<V<V>P>]P>fPP<V>r>x6_>|P?UP?X?_?f?l?r?xBXBdBjBpBvB|CSCYPPPPPPPPC`CdH[JULUL[PPLcPPLiLuNu!!u!!{!#S!#X!$n!&X!'v!)vP!)yP!)}!+h!-R!.{!/R!/U%_!/[!1UPPPP!3VH[!3c!5c!5i!7c$oiOPVefqt!f!j!k!l!p!r!s!t!u!z#n#p#t#x$T$c$l$p$q$t%S%_%k%v&Y&Z'O'P'Q'R'S'T'U'V'^'_'a'b'i'j'm't'v'x'z(Q(R(S(T(U(V(W(X(Y(`(b(c(h(i(l(m(s(t(u(v(w(x(y(z)Q)S)T)X)Y)[)c)iQ!eRQ'o'wQ(n)fR)])aW!cR'w)a)fR%O#vY!aR#v'w)a)fY#dv$r'y)b)g^$X!z#Z%`%i'{)d)jT&b%}&p%`WOPVXdefgqt!f!j!k!l!n!p!r!s!t!u#n#p#t#x$T$V$_$a$c$l$p$q$t%S%_%h%k%v%|&O&Y&Z&_&o&s&{'O'P'Q'R'S'T'U'V']'^'_'a'b'i'j'l'm't'v'x'z(Q(R(S(T(U(V(W(X(Y(`(b(c(f(h(i(l(m(s(t(u(v(w(x(y(z)Q)S)T)X)Y)[)c)it!`Rv#Z#v$r%`%i%}&p'w'y'{)a)b)d)f)g)jU#r!`#s$WR$W!zU#r!`#s$WT$j#]$kR$}#tQ#hvQ'q'yQ(o)gR)^)bW#fv'y)b)gR%r$rU!ZP#p$TW$U!u'U(X(yR$x#nQ!^PQ$z#pR%U$TQ%^$VQ&T%hQ&a%|U&f&O&s(fQ&v&oT&|&{'l[#Qdefg$T$ac%V$V%h%|&O&o&s&{'l(f!bjOVq!f!j!k!l!r!s!u#x$p$t%S%k&Y&Z't(R(S(T(U(V(W(X(Y(`(b(c(h(i(m[#Odg$V$a%h&{U#Tef$TQ$O!nS%c$_'][&`%|&O&o&s'l(f#V&}Pt!p!t!z#n#p#t$c$l$q%_%v'O'P'Q'R'S'T'U'V'^'_'a'b'i'j'm'v'x'z(Q(l(s(t(u(v(w(x(y(z)Q)S)T)X)Y)[)c)iR&e%}Q&c%}R&w&pQ&i&OR'}(fS&g&O(fR&y&s$oYOPVefqt!f!j!k!l!p!r!s!t!u!z#n#p#t#x$T$c$l$p$q$t%S%_%k%v&Y&Z'O'P'Q'R'S'T'U'V'^'_'a'b'i'j'm't'v'x'z(Q(R(S(T(U(V(W(X(Y(`(b(c(h(i(l(m(s(t(u(v(w(x(y(z)Q)S)T)X)Y)[)c)iR$^!zQ$Z!zR&Q%`S$Y!z%`Z$f#Z%i'{)d)j$ubOPVdefgqt!f!j!k!l!p!r!s!t!u!z#n#p#t#x$T$a$c$l$p$q$t%S%_%k%v&Y&Z'O'P'Q'R'S'T'U'V'^'_'a'b'i'j'm't'v'x'z(Q(R(S(T(U(V(W(X(Y(`(b(c(h(i(l(m(s(t(u(v(w(x(y(z)Q)S)T)X)Y)[)c)i$tbOPVdefgqt!f!j!k!l!p!r!s!t!u!z#n#p#t#x$T$a$c$l$p$q$t%S%_%k%v&Y&Z'O'P'Q'R'S'T'U'V'^'_'a'b'i'j'm't'v'x'z(Q(R(S(T(U(V(W(X(Y(`(b(c(h(i(l(m(s(t(u(v(w(x(y(z)Q)S)T)X)Y)[)c)iQ!|_T#^m$m$u`OPVdefgqt!f!j!k!l!p!r!s!t!u!z#n#p#t#x$T$a$c$l$p$q$t%S%_%k%v&Y&Z'O'P'Q'R'S'T'U'V'^'_'a'b'i'j'm't'v'x'z(Q(R(S(T(U(V(W(X(Y(`(b(c(h(i(l(m(s(t(u(v(w(x(y(z)Q)S)T)X)Y)[)c)i$uaOPVdefgqt!f!j!k!l!p!r!s!t!u!z#n#p#t#x$T$a$c$l$p$q$t%S%_%k%v&Y&Z'O'P'Q'R'S'T'U'V'^'_'a'b'i'j'm't'v'x'z(Q(R(S(T(U(V(W(X(Y(`(b(c(h(i(l(m(s(t(u(v(w(x(y(z)Q)S)T)X)Y)[)c)i$ohOPVefqt!f!j!k!l!p!r!s!t!u!z#n#p#t#x$T$c$l$p$q$t%S%_%k%v&Y&Z'O'P'Q'R'S'T'U'V'^'_'a'b'i'j'm't'v'x'z(Q(R(S(T(U(V(W(X(Y(`(b(c(h(i(l(m(s(t(u(v(w(x(y(z)Q)S)T)X)Y)[)c)i$onOPVefqt!f!j!k!l!p!r!s!t!u!z#n#p#t#x$T$c$l$p$q$t%S%_%k%v&Y&Z'O'P'Q'R'S'T'U'V'^'_'a'b'i'j'm't'v'x'z(Q(R(S(T(U(V(W(X(Y(`(b(c(h(i(l(m(s(t(u(v(w(x(y(z)Q)S)T)X)Y)[)c)iQ$i#ZQ's'{Q(q)jR)`)dW$g#Z'{)d)jR&U%iW&X%k'b(c)TX&j&Y'i(h)XQ#`mR%n$mT#_m$mS#]m$mT$j#]$kR!^PQqOR#bqS#s!`$WR${#sQ#w!cR%P#wQ$s#fR%s$sQ#o!ZR$y#o%OXOPVdefgqt!f!j!k!l!n!p!r!s!t!u!z#n#p#t#x$T$V$_$a$c$l$p$q$t%S%_%h%k%v&Y&Z&{'O'P'Q'R'S'T'U'V'^'_'a'b'i'j'm't'v'x'z(Q(R(S(T(U(V(W(X(Y(`(b(c(h(i(l(m(s(t(u(v(w(x(y(z)Q)S)T)X)Y)[)c)iS!yX&__&_%|&O&o&s']'l(fS$`#O#TS%d$`&mR&m&`Q&q&cR&x&qQ&t&gR&z&tQ%a$ZR&R%aQ$d#VR%g$dQ%j$gR&V%jQ$k#]R%l$kQ$n#`R%o$nTpOqSSOqW!YP#n#p'UW!xV'm(m)[Q#SeS#Vf!zQ#ctQ#z!fQ#{!jQ#|!kW#}!l'R(U(vQ$P!pQ$Q!rQ$R!sQ$S!tQ$|#tQ%Q#xQ%T$TQ%f$cQ%m$lQ%p$pQ%q$qQ%t$tQ%w%SQ&P%_S&W%k&YQ&[%vQ&k&ZQ'W'OQ'X'PQ'Y'QQ'Z'SQ'['TQ'`'VQ'c'^Q'd'vQ'e'tQ'f'_Q'g'aS'h'b'iQ'k'jQ'n!uQ'p'xQ'r'zQ'|(QQ(O(lQ(Z(RQ([(SQ(](TQ(^(VQ(_(WQ(a(YQ(d(`Q(e(bS(g(c(hQ(j(iQ(k(XQ(p)iQ({(sQ(|(tQ(}(uQ)O(wQ)P(xQ)R(zQ)U)QQ)V)SS)W)T)XQ)Z)YQ)_)cR)h(y$ooOPVefqt!f!j!k!l!p!r!s!t!u!z#n#p#t#x$T$c$l$p$q$t%S%_%k%v&Y&Z'O'P'Q'R'S'T'U'V'^'_'a'b'i'j'm't'v'x'z(Q(R(S(T(U(V(W(X(Y(`(b(c(h(i(l(m(s(t(u(v(w(x(y(z)Q)S)T)X)Y)[)c)ipROVq!f!j!k!l!r!s!u#x$t%S%k&Y&Z!j'wPeft!p!t!z#n#p#t$T$c$l$q%_%v'O'P'Q'R'S'T'U'V'_'a'b'i'j'm'x'z(Q(l)c)ip)a'^'v(s(t(u(v(w(x(y(z)Q)S)T)X)Y)[q)f$p't(R(S(T(U(V(W(X(Y(`(b(c(h(i(mX!dR'w)a)fZ!bR#v'w)a)fQ#t!aR$q#dQ#x!eQ'V'oQ(Y(nR(z)]ptOVq!f!j!k!l!r!s!u#x$t%S%k&Y&Z!j'xPeft!p!t!z#n#p#t$T$c$l$q%_%v'O'P'Q'R'S'T'U'V'_'a'b'i'j'm'x'z(Q(l)c)ip(Q$p't(R(S(T(U(V(W(X(Y(`(b(c(h(i(mq(l'^'v(s(t(u(v(w(x(y(z)Q)S)T)X)Y)[pvOVq!f!j!k!l!r!s!u#x$t%S%k&Y&Z!j'yPeft!p!t!z#n#p#t$T$c$l$q%_%v'O'P'Q'R'S'T'U'V'_'a'b'i'j'm'x'z(Q(l)c)ip)b'^'v(s(t(u(v(w(x(y(z)Q)S)T)X)Y)[q)g$p't(R(S(T(U(V(W(X(Y(`(b(c(h(i(mX#gv'y)b)gZ#ev$r'y)b)gV![P#p$Td!jS#z$Q$R%Q%t%w&W&k'n!W'P!Y#S#V#c$P$S$|%T%f%m%q&P&['W'Z'['`'f'g'h'k'p'r'|(O(p)_f(S%p'e(Z(^(_(a(d(e(g(j(kg(t'c'd({)O)P)R)U)V)W)Z)hf!kS#z#{$Q$R%Q%t%w&W&k'n!Y'Q!Y#S#V#c$P$S$|%T%f%m%q&P&['W'X'Z'['`'f'g'h'k'p'r'|(O(p)_h(T%p'e(Z([(^(_(a(d(e(g(j(ki(u'c'd({(|)O)P)R)U)V)W)Z)hh!lS#z#{#|$Q$R%Q%t%w&W&k'n!['R!Y#S#V#c$P$S$|%T%f%m%q&P&['W'X'Y'Z'['`'f'g'h'k'p'r'|(O(p)_j(U%p'e(Z([(](^(_(a(d(e(g(j(kk(v'c'd({(|(})O)P)R)U)V)W)Z)hpVOVq!f!j!k!l!r!s!u#x$t%S%k&Y&Z!j'mPeft!p!t!z#n#p#t$T$c$l$q%_%v'O'P'Q'R'S'T'U'V'_'a'b'i'j'm'x'z(Q(l)c)ip(m$p't(R(S(T(U(V(W(X(Y(`(b(c(h(i(mq)['^'v(s(t(u(v(w(x(y(z)Q)S)T)X)Y)[R&d%}T&h&O(f$P!nS!Y!x#S#V#c#z#{#|#}$P$Q$R$S$|%Q%T%f%m%p%q%t%w&P&W&[&k'W'X'Y'Z'['`'c'd'e'f'g'h'k'n'p'r'|(O(Z([(](^(_(a(d(e(g(j(k(p({(|(})O)P)R)U)V)W)Z)_)h$P!pS!Y!x#S#V#c#z#{#|#}$P$Q$R$S$|%Q%T%f%m%p%q%t%w&P&W&[&k'W'X'Y'Z'['`'c'd'e'f'g'h'k'n'p'r'|(O(Z([(](^(_(a(d(e(g(j(k(p({(|(})O)P)R)U)V)W)Z)_)h$oZOPVefqt!f!j!k!l!p!r!s!t!u!z#n#p#t#x$T$c$l$p$q$t%S%_%k%v&Y&Z'O'P'Q'R'S'T'U'V'^'_'a'b'i'j'm't'v'x'z(Q(R(S(T(U(V(W(X(Y(`(b(c(h(i(l(m(s(t(u(v(w(x(y(z)Q)S)T)X)Y)[)c)iQ!{ZR!}`R$[!zQ#WfR$]!z$ocOPVefqt!f!j!k!l!p!r!s!t!u!z#n#p#t#x$T$c$l$p$q$t%S%_%k%v&Y&Z'O'P'Q'R'S'T'U'V'^'_'a'b'i'j'm't'v'x'z(Q(R(S(T(U(V(W(X(Y(`(b(c(h(i(l(m(s(t(u(v(w(x(y(z)Q)S)T)X)Y)[)c)i$hcOPVqt!f!j!k!l!p!r!s!t!u!z#n#p#t#x$c$l$p$q$t%S%_%k%v&Y&Z'O'P'Q'R'S'T'U'V'^'_'a'b'i'j'm't'v'x'z(Q(R(S(T(U(V(W(X(Y(`(b(c(h(i(l(m(s(t(u(v(w(x(y(z)Q)S)T)X)Y)[)c)iU#Qdg$aV#Uef$TW#Rdef$TQ#XgR%e$apkOVq!f!j!k!l!r!s!u#x$t%S%k&Y&Z!j(PPeft!p!t!z#n#p#t$T$c$l$q%_%v'O'P'Q'R'S'T'U'V'_'a'b'i'j'm'x'z(Q(l)c)ip)e'^'v(s(t(u(v(w(x(y(z)Q)S)T)X)Y)[q)k$p't(R(S(T(U(V(W(X(Y(`(b(c(h(i(mX$h#Z'{)d)j$omOPVefqt!f!j!k!l!p!r!s!t!u!z#n#p#t#x$T$c$l$p$q$t%S%_%k%v&Y&Z'O'P'Q'R'S'T'U'V'^'_'a'b'i'j'm't'v'x'z(Q(R(S(T(U(V(W(X(Y(`(b(c(h(i(l(m(s(t(u(v(w(x(y(z)Q)S)T)X)Y)[)c)iR#am",
    nodeNames: "⚠ LineComment BlockComment Expressions ForExpression for InExpressions InExpression Name Identifier Identifier ArithOp ArithOp ArithOp ArithOp in IterationContext return IfExpression if then else QuantifiedExpression some every InExpressions InExpression satisfies Disjunction or Conjunction and Comparison CompareOp CompareOp between PositiveUnaryTest ( PositiveUnaryTests ) ArithmeticExpression ArithOp InstanceOfExpression instance of Type QualifiedName VariableName SpecialType days time duration years months date > ListType list < ContextType context ContextEntryTypes ContextEntryType FunctionType function ArgumentTypes ArgumentType PathExpression ] FilterExpression [ FunctionInvocation SpecialFunctionName string length upper case lower substring before after starts with ends contains insert index distinct values met by overlaps finished started day year week month get value entries NamedParameters NamedParameter ParameterName PositionalParameters null NumericLiteral StringLiteral BooleanLiteral DateTimeLiteral DateTimeConstructor AtLiteral ? SimplePositiveUnaryTest Interval ParenthesizedExpression List FunctionDefinition FormalParameters FormalParameter external FunctionBody } { Context ContextEntry Key Name Identifier UnaryTests Wildcard not",
    maxTerm: 198,
    context: variableTracker,
    nodeProps: [
      ["group", -17,4,18,22,28,30,32,40,42,67,69,71,112,113,115,116,117,124,"Expression",47,"Expression Expression",-5,105,106,107,108,109,"Expression Literal"],
      ["closedBy", 37,")",70,"]",123,"}"],
      ["openedBy", 39,"(",68,"[",122,"{"]
    ],
    propSources: [feelHighlighting],
    skippedNodes: [0,1,2],
    repeatNodeCount: 14,
    tokenData: ")x~RuXY#fYZ$ZZ[#f]^$Zpq#fqr$`rs$kwx%_xy%dyz%iz{%n{|%{|}&Q}!O&V!O!P&d!P!Q&|!Q![(X![!](j!]!^(o!^!_(t!_!`$f!`!a)T!b!c)_!}#O)d#P#Q)i#Q#R%v#o#p)n#q#r)s$f$g#f#BY#BZ#f$IS$I_#f$I|$I}$Z$I}$JO$Z$JT$JU#f$KV$KW#f&FU&FV#f?HT?HU#f~#kY$^~XY#fZ[#fpq#f$f$g#f#BY#BZ#f$IS$I_#f$JT$JU#f$KV$KW#f&FU&FV#f?HT?HU#f~$`O$_~~$cP!_!`$f~$kOq~~$pU%T~OY$kZr$krs%Ss#O$k#O#P%X#P~$k~%XO%T~~%[PO~$k~%dO$g~~%iOu~~%nOw~~%sP^~z{%v~%{Oy~~&QO[~~&VO$j~R&[PZP!`!a&_Q&dO$xQ~&iQ$f~!O!P&o!Q![&t~&tO$i~~&yP%S~!Q![&t~'RQ]~z{'X!P!Q'|~'[ROz'Xz{'e{~'X~'hTOz'Xz{'e{!P'X!P!Q'w!Q~'X~'|OQ~~(RQP~OY'|Z~'|~(^Q%S~!O!P(d!Q![(X~(gP!Q![&t~(oO$v~~(tO%^~R({P![QrP!_!`)OP)TOrPR)[P!XQrP!_!`)O~)dO%V~~)iO!h~~)nO!f~~)sO#o~~)xO#n~",
    tokenizers: [propertyIdentifiers, identifiers, insertSemicolon, 0, 1],
    topRules: {"Expressions":[0,3],"UnaryTests":[1,129]},
    dynamicPrecedences: {"30":-1,"71":-1,"101":-1,"154":-1},
    specialized: [{term: 148, get: value => spec_identifier[value] || -1}],
    tokenPrec: 0
  });

  function parseParameterNames(fn) {
      if (Array.isArray(fn.$args)) {
          return fn.$args;
      }
      const code = fn.toString();
      const match = /^(?:[^(]*\s*)?\(([^)]+)?\)/.exec(code);
      if (!match) {
          throw new Error('failed to parse params: ' + code);
      }
      const [_, params] = match;
      if (!params) {
          return [];
      }
      return params.split(',').map(p => p.trim());
  }
  function notImplemented(thing) {
      return new Error(`not implemented: ${thing}`);
  }
  /**
   * @param {string} name
   * @param {Record<string, any>} context
   *
   * @return {any}
   */
  function getFromContext(name, context) {
      if (['nil', 'boolean', 'number', 'string'].includes(getType(context))) {
          return null;
      }
      if (name in context) {
          return context[name];
      }
      const normalizedName = normalizeContextKey(name);
      if (normalizedName in context) {
          return context[normalizedName];
      }
      const entry = Object.entries(context).find(([key]) => normalizedName === normalizeContextKey(key));
      if (entry) {
          return entry[1];
      }
      return null;
  }

  function isDateTime(obj) {
      return DateTime.isDateTime(obj);
  }
  function isDuration(obj) {
      return Duration.isDuration(obj);
  }
  function duration$1(opts) {
      if (typeof opts === 'number') {
          return Duration.fromMillis(opts);
      }
      return Duration.fromISO(opts);
  }
  function date(str = null, time = null, zone = null) {
      if (time) {
          if (str) {
              throw new Error('<str> and <time> provided');
          }
          return date(`1900-01-01T${time}`);
      }
      if (typeof str === 'string') {
          if (str.startsWith('-')) {
              throw notImplemented('negative date');
          }
          if (!str.includes('T')) {
              // raw dates are in UTC time zone
              return date(str + 'T00:00:00.000Z');
          }
          if (str.includes('@')) {
              if (zone) {
                  throw new Error('<zone> already provided');
              }
              const [datePart, zonePart] = str.split('@');
              return date(datePart, null, Info.normalizeZone(zonePart));
          }
          return DateTime.fromISO(str.toUpperCase(), {
              setZone: true,
              zone
          });
      }
      return DateTime.now();
  }

  function isContext(e) {
      return Object.getPrototypeOf(e) === Object.prototype;
  }
  function isArray$1(e) {
      return Array.isArray(e);
  }
  function isBoolean(e) {
      return typeof e === 'boolean';
  }
  function getType(e) {
      if (e === null || e === undefined) {
          return 'nil';
      }
      if (isBoolean(e)) {
          return 'boolean';
      }
      if (isNumber(e)) {
          return 'number';
      }
      if (isString(e)) {
          return 'string';
      }
      if (isContext(e)) {
          return 'context';
      }
      if (isArray$1(e)) {
          return 'list';
      }
      if (isDuration(e)) {
          return 'duration';
      }
      if (isDateTime(e)) {
          if (e.year === 1900 &&
              e.month === 1 &&
              e.day === 1) {
              return 'time';
          }
          if (e.hour === 0 &&
              e.minute === 0 &&
              e.second === 0 &&
              e.millisecond === 0 &&
              e.zone === FixedOffsetZone.utcInstance) {
              return 'date';
          }
          return 'date time';
      }
      if (e instanceof Range) {
          return 'range';
      }
      if (e instanceof FunctionWrapper) {
          return 'function';
      }
      return 'literal';
  }
  function isType(el, type) {
      return getType(el) === type;
  }
  function typeCast(obj, type) {
      if (isDateTime(obj)) {
          if (type === 'time') {
              return obj.set({
                  year: 1900,
                  month: 1,
                  day: 1
              });
          }
          if (type === 'date') {
              return obj.setZone('utc', { keepLocalTime: true }).startOf('day');
          }
          if (type === 'date time') {
              return obj;
          }
      }
      return null;
  }
  class Range {
      constructor(props) {
          Object.assign(this, props);
      }
  }
  function isNumber(obj) {
      return typeof obj === 'number';
  }
  function isString(obj) {
      return typeof obj === 'string';
  }
  function equals(a, b) {
      if (a === null && b !== null ||
          a !== null && b === null) {
          return false;
      }
      if (isArray$1(a) && a.length < 2) {
          a = a[0];
      }
      if (isArray$1(b) && b.length < 2) {
          b = b[0];
      }
      const aType = getType(a);
      const bType = getType(b);
      if (aType !== bType) {
          return null;
      }
      if (aType === 'nil') {
          return true;
      }
      if (aType === 'list') {
          if (a.length !== b.length) {
              return false;
          }
          return a.every((element, idx) => equals(element, b[idx]));
      }
      if (aType === 'date time' || aType === 'time' || aType === 'date') {
          return (a.toUTC().valueOf() === b.toUTC().valueOf());
      }
      if (aType === 'duration') {
          // years and months duration -> months
          if (Math.abs(a.as('days')) > 180) {
              return Math.trunc(a.minus(b).as('months')) === 0;
          }
          // days and time duration -> seconds
          else {
              return Math.trunc(a.minus(b).as('seconds')) === 0;
          }
      }
      if (aType === 'context') {
          const aEntries = Object.entries(a);
          const bEntries = Object.entries(b);
          if (aEntries.length !== bEntries.length) {
              return false;
          }
          return aEntries.every(([key, value]) => key in b && equals(value, b[key]));
      }
      if (aType === 'range') {
          return [
              [a.start, b.start],
              [a.end, b.end],
              [a['start included'], b['start included']],
              [a['end included'], b['end included']]
          ].every(([a, b]) => a === b);
      }
      if (a == b) {
          return true;
      }
      return aType === bType ? false : null;
  }
  class FunctionWrapper {
      constructor(fn, parameterNames) {
          this.fn = fn;
          this.parameterNames = parameterNames;
      }
      invoke(contextOrArgs) {
          let params;
          if (isArray$1(contextOrArgs)) {
              params = contextOrArgs;
          }
          else {
              params = this.parameterNames.map(n => contextOrArgs[n]);
          }
          return this.fn.call(null, ...params);
      }
  }

  // 10.3.4 Built-in functions
  const builtins = {
      // 10.3.4.1 Conversion functions
      'number': function () {
          throw notImplemented('number');
      },
      'string': fn(function (from) {
          if (arguments.length !== 1) {
              return null;
          }
          return toString(from);
      }, ['any']),
      // date(from) => date string
      // date(from) => date and time
      // date(year, month, day)
      'date': fn(function (year, month, day, from) {
          if (!from && !isNumber(year)) {
              from = year;
              year = null;
          }
          let d;
          if (isString(from)) {
              d = date(from);
          }
          if (isDateTime(from)) {
              d = from;
          }
          if (year) {
              d = date().setZone('utc').set({
                  year,
                  month,
                  day
              });
          }
          return d && ifValid(d.setZone('utc').startOf('day')) || null;
      }, ['any?', 'number?', 'number?', 'any?']),
      // date and time(from) => date time string
      // date and time(date, time)
      'date and time': fn(function (d, time, from) {
          let dt;
          if (isDateTime(d) && isDateTime(time)) {
              dt = time.set({
                  year: d.year,
                  month: d.month,
                  day: d.day
              });
          }
          if (isString(d)) {
              from = d;
              d = null;
          }
          if (isString(from)) {
              dt = date(from);
          }
          return dt && ifValid(dt) || null;
      }, ['any?', 'time?', 'string?'], ['date', 'time', 'from']),
      // time(from) => time string
      // time(from) => time, date and time
      // time(hour, minute, second, offset?) => ...
      'time': fn(function (hour, minute, second, offset, from) {
          let t;
          if (offset) {
              throw notImplemented('time(..., offset)');
          }
          if (isString(hour) || isDateTime(hour)) {
              from = hour;
              hour = null;
          }
          if (isString(from)) {
              t = date(null, from);
          }
          if (isDateTime(from)) {
              t = from.set({
                  year: 1900,
                  month: 1,
                  day: 1
              });
          }
          if (isNumber(hour)) {
              // TODO: support offset = days and time duration
              t = date().set({
                  hour,
                  minute,
                  second
              }).set({
                  year: 1900,
                  month: 1,
                  day: 1,
                  millisecond: 0
              });
          }
          return t && ifValid(t) || null;
      }, ['any?', 'number?', 'number?', 'any?', 'any?']),
      'duration': fn(function (from) {
          return ifValid(duration$1(from));
      }, ['string']),
      'years and months duration': fn(function (from, to) {
          return ifValid(to.diff(from, ['years', 'months']));
      }, ['date', 'date']),
      '@': fn(function (string) {
          let t;
          if (/^-?P/.test(string)) {
              t = duration$1(string);
          }
          else if (/^[\d]{1,2}:[\d]{1,2}:[\d]{1,2}/.test(string)) {
              t = date(null, string);
          }
          else {
              t = date(string);
          }
          return t && ifValid(t) || null;
      }, ['string']),
      'now': fn(function () {
          return date();
      }, []),
      'today': fn(function () {
          return date().startOf('day');
      }, []),
      // 10.3.4.2 Boolean function
      'not': fn(function (bool) {
          return isType(bool, 'boolean') ? !bool : null;
      }, ['any']),
      // 10.3.4.3 String functions
      'substring': fn(function (string, start, length) {
          const _start = (start < 0 ? string.length + start : start - 1);
          const arr = Array.from(string);
          return (typeof length !== 'undefined'
              ? arr.slice(_start, _start + length)
              : arr.slice(_start)).join('');
      }, ['string', 'number', 'number?'], ['string', 'start position', 'length']),
      'string length': fn(function (string) {
          return countSymbols(string);
      }, ['string']),
      'upper case': fn(function (string) {
          return string.toUpperCase();
      }, ['string']),
      'lower case': fn(function (string) {
          return string.toLowerCase();
      }, ['string']),
      'substring before': fn(function (string, match) {
          const index = string.indexOf(match);
          if (index === -1) {
              return '';
          }
          return string.substring(0, index);
      }, ['string', 'string']),
      'substring after': fn(function (string, match) {
          const index = string.indexOf(match);
          if (index === -1) {
              return '';
          }
          return string.substring(index + match.length);
      }, ['string', 'string']),
      'replace': fn(function (input, pattern, replacement, flags) {
          return input.replace(new RegExp(pattern, 'ug' + (flags || '').replace(/[x]/g, '')), replacement.replace(/\$0/g, '$$&'));
      }, ['string', 'string', 'string', 'string?']),
      'contains': fn(function (string, match) {
          return string.includes(match);
      }, ['string', 'string']),
      'starts with': fn(function (string, match) {
          return string.startsWith(match);
      }, ['string', 'string']),
      'ends with': fn(function (string, match) {
          return string.endsWith(match);
      }, ['string', 'string']),
      'split': fn(function (string, delimiter) {
          return string.split(new RegExp(delimiter, 'u'));
      }, ['string', 'string']),
      // 10.3.4.4 List functions
      'list contains': fn(function (list, element) {
          return list.some(el => matches(el, element));
      }, ['list', 'any?']),
      'count': fn(function (list) {
          return list.length;
      }, ['list']),
      'min': listFn(function (list) {
          return list.reduce((min, el) => min === null ? el : Math.min(min, el), null);
      }, 'number'),
      'max': listFn(function (list) {
          return list.reduce((max, el) => max === null ? el : Math.max(max, el), null);
      }, 'number'),
      'sum': listFn(function (list) {
          return sum(list);
      }, 'number'),
      'mean': listFn(function (list) {
          const s = sum(list);
          return s === null ? s : s / list.length;
      }, 'number'),
      'all': listFn(function (list) {
          let nonBool = false;
          for (const o of list) {
              if (o === false) {
                  return false;
              }
              if (typeof o !== 'boolean') {
                  nonBool = true;
              }
          }
          return nonBool ? null : true;
      }, 'any?'),
      'any': listFn(function (list) {
          let nonBool = false;
          for (const o of list) {
              if (o === true) {
                  return true;
              }
              if (typeof o !== 'boolean') {
                  nonBool = true;
              }
          }
          return nonBool ? null : false;
      }, 'any?'),
      'sublist': fn(function (list, start, length) {
          const _start = (start < 0 ? list.length + start : start - 1);
          return (typeof length !== 'undefined'
              ? list.slice(_start, _start + length)
              : list.slice(_start));
      }, ['list', 'number', 'number?']),
      'append': fn(function (list, ...items) {
          return list.concat(items);
      }, ['list', 'any?']),
      'concatenate': fn(function (...args) {
          return args.reduce((result, arg) => {
              return result.concat(arg);
          }, []);
      }, ['any']),
      'insert before': fn(function (list, position, newItem) {
          return list.slice(0, position - 1).concat([newItem], list.slice(position - 1));
      }, ['list', 'number', 'any?']),
      'remove': fn(function (list, position) {
          return list.slice(0, position - 1).concat(list.slice(position));
      }, ['list', 'number']),
      'reverse': fn(function (list) {
          return list.slice().reverse();
      }, ['list']),
      'index of': fn(function (list, match) {
          return list.reduce(function (result, element, index) {
              if (matches(element, match)) {
                  result.push(index + 1);
              }
              return result;
          }, []);
      }, ['list', 'any']),
      'union': fn(function (..._lists) {
          throw notImplemented('union');
      }, ['list']),
      'distinct values': fn(function (_list) {
          throw notImplemented('distinct values');
      }, ['list']),
      'flatten': fn(function (list) {
          return flatten(list);
      }, ['list']),
      'product': listFn(function (list) {
          if (list.length === 0) {
              return null;
          }
          return list.reduce((result, n) => {
              return result * n;
          }, 1);
      }, 'number'),
      'median': listFn(function (list) {
          if (list.length === 0) {
              return null;
          }
          return median(list);
      }, 'number'),
      'stddev': listFn(function (list) {
          if (list.length < 2) {
              return null;
          }
          return stddev(list);
      }, 'number'),
      'mode': listFn(function (list) {
          return mode(list);
      }, 'number'),
      // 10.3.4.5 Numeric functions
      'decimal': fn(function (n, scale) {
          if (!scale) {
              return round$1(n);
          }
          const offset = Math.pow(10, scale);
          return round$1(n * offset) / (offset);
      }, ['number', 'number']),
      'floor': fn(function (n) {
          return Math.floor(n);
      }, ['number']),
      'ceiling': fn(function (n) {
          return Math.ceil(n) + 0;
      }, ['number']),
      'abs': fn(function (n) {
          if (typeof n !== 'number') {
              return null;
          }
          return Math.abs(n);
      }, ['number']),
      'modulo': fn(function (dividend, divisor) {
          if (!divisor) {
              return null;
          }
          const adjust = 1000000000;
          // cf. https://dustinpfister.github.io/2017/09/02/js-whats-wrong-with-modulo/
          //
          // need to round here as using this custom modulo
          // variant is prone to rounding errors
          return Math.round((dividend % divisor + divisor) % divisor * adjust) / adjust;
      }, ['number', 'number']),
      'sqrt': fn(function (number) {
          if (number < 0) {
              return null;
          }
          return Math.sqrt(number);
      }, ['number']),
      'log': fn(function (number) {
          if (number <= 0) {
              return null;
          }
          return Math.log(number);
      }, ['number']),
      'exp': fn(function (number) {
          return Math.exp(number);
      }, ['number']),
      'odd': fn(function (number) {
          return Math.abs(number) % 2 === 1;
      }, ['number']),
      'even': fn(function (number) {
          return Math.abs(number) % 2 === 0;
      }, ['number']),
      // 10.3.4.6 Date and time functions
      'is': fn(function (value1, value2) {
          if (typeof value1 === 'undefined' || typeof value2 === 'undefined') {
              return false;
          }
          return equals(value1, value2);
      }, ['any?', 'any?']),
      // 10.3.4.7 Range Functions
      'before': fn(function (a, b) {
          return before(a, b);
      }, ['any', 'any']),
      'after': fn(function (a, b) {
          return before(b, a);
      }, ['any', 'any']),
      'meets': fn(function (a, b) {
          return meets(a, b);
      }, ['range', 'range']),
      'met by': fn(function (a, b) {
          return meets(b, a);
      }, ['range', 'range']),
      'overlaps': fn(function () {
          throw notImplemented('overlaps');
      }, ['any?']),
      'overlaps before': fn(function () {
          throw notImplemented('overlaps before');
      }, ['any?']),
      'overlaps after': fn(function () {
          throw notImplemented('overlaps after');
      }, ['any?']),
      'finishes': fn(function () {
          throw notImplemented('finishes');
      }, ['any?']),
      'finished by': fn(function () {
          throw notImplemented('finished by');
      }, ['any?']),
      'includes': fn(function () {
          throw notImplemented('includes');
      }, ['any?']),
      'during': fn(function () {
          throw notImplemented('during');
      }, ['any?']),
      'starts': fn(function () {
          throw notImplemented('starts');
      }, ['any?']),
      'started by': fn(function () {
          throw notImplemented('started by');
      }, ['any?']),
      'coincides': fn(function () {
          throw notImplemented('coincides');
      }, ['any?']),
      // 10.3.4.8 Temporal built-in functions
      'day of year': fn(function () {
          throw notImplemented('day of year');
      }, ['any?']),
      'day of week': fn(function () {
          throw notImplemented('day of week');
      }, ['any?']),
      'month of year': fn(function () {
          throw notImplemented('month of year');
      }, ['any?']),
      'week of year': fn(function () {
          throw notImplemented('week of year');
      }, ['any?']),
      // 10.3.4.9 Sort
      'sort': function () {
          throw notImplemented('sort');
      },
      // 10.3.4.10 Context function
      'get value': fn(function (m, key) {
          return getFromContext(key, m);
      }, ['context', 'string']),
      'get entries': fn(function (m) {
          if (arguments.length !== 1) {
              return null;
          }
          if (Array.isArray(m)) {
              return null;
          }
          return Object.entries(m).map(([key, value]) => ({ key, value }));
      }, ['context']),
      'context': listFn(function (_contexts) {
          throw notImplemented('context');
      }, 'context'),
      'context merge': listFn(function (_contexts) {
          throw notImplemented('context merge');
      }, 'context'),
      'context put': fn(function (_context, _keys, _value) {
          throw notImplemented('context put');
      }, ['context', 'list', 'any'])
  };
  function matches(a, b) {
      return a === b;
  }
  const FALSE = {};
  function createArgTester(arg) {
      const optional = arg.endsWith('?');
      const type = optional ? arg.substring(0, arg.length - 1) : arg;
      return function (obj) {
          const arr = Array.isArray(obj);
          if (type === 'list') {
              if (arr || optional && typeof obj === 'undefined') {
                  return obj;
              }
              else {
                  // implicit conversion obj => [ obj ]
                  return [obj];
              }
          }
          if (type !== 'any' && arr && obj.length === 1) {
              // implicit conversion [ obj ] => obj
              obj = obj[0];
          }
          if (type === 'range') {
              return obj instanceof Range ? obj : FALSE;
          }
          const objType = getType(obj);
          if (objType === 'nil') {
              return (optional ? obj : FALSE);
          }
          if (type === 'any' || type === objType) {
              return obj;
          }
          return typeCast(obj, type) || FALSE;
      };
  }
  function createArgsValidator(argDefinitions) {
      const tests = argDefinitions.map(createArgTester);
      return function (args) {
          while (args.length < argDefinitions.length) {
              args.push(undefined);
          }
          return args.reduce((result, arg, index) => {
              if (result === false) {
                  return result;
              }
              const test = tests[index];
              const conversion = test ? test(arg) : arg;
              if (conversion === FALSE) {
                  return false;
              }
              result.push(conversion);
              return result;
          }, []);
      };
  }
  /**
   * @param {Function} fnDefinition
   * @param {string} type
   * @param {string[]} [parameterNames]
   *
   * @return {Function}
   */
  function listFn(fnDefinition, type, parameterNames = null) {
      const tester = createArgTester(type);
      const wrappedFn = function (...args) {
          if (args.length === 0) {
              return null;
          }
          // unwrap first arg
          if (Array.isArray(args[0]) && args.length === 1) {
              args = args[0];
          }
          if (!args.every(arg => tester(arg) !== FALSE)) {
              return null;
          }
          return fnDefinition(args);
      };
      wrappedFn.$args = parameterNames || parseParameterNames(fnDefinition);
      return wrappedFn;
  }
  /**
   * @param {Function} fnDefinition
   * @param {string[]} argDefinitions
   * @param {string[]} [parameterNames]
   *
   * @return {Function}
   */
  function fn(fnDefinition, argDefinitions, parameterNames = null) {
      const checkArgs = createArgsValidator(argDefinitions);
      parameterNames = parameterNames || parseParameterNames(fnDefinition);
      const wrappedFn = function (...args) {
          const convertedArgs = checkArgs(args);
          if (!convertedArgs) {
              return null;
          }
          return fnDefinition(...convertedArgs);
      };
      wrappedFn.$args = parameterNames;
      return wrappedFn;
  }
  function meets(a, b) {
      return [
          (a.end === b.start),
          (a['end included'] === true),
          (b['start included'] === true)
      ].every(v => v);
  }
  function before(a, b) {
      if (a instanceof Range && b instanceof Range) {
          return (a.end < b.start || (!a['end included'] || !b['start included']) && a.end == b.start);
      }
      if (a instanceof Range) {
          return (a.end < b || (!a['end included'] && a.end === b));
      }
      if (b instanceof Range) {
          return (b.start > a || (!b['start included'] && b.start === a));
      }
      return a < b;
  }
  function sum(list) {
      return list.reduce((sum, el) => sum === null ? el : sum + el, null);
  }
  function flatten([x, ...xs]) {
      return (x !== undefined
          ? [...Array.isArray(x) ? flatten(x) : [x], ...flatten(xs)]
          : []);
  }
  function toKeyString(key) {
      if (typeof key === 'string' && /\W/.test(key)) {
          return toString(key, true);
      }
      return key;
  }
  function toDeepString(obj) {
      return toString(obj, true);
  }
  function escapeStr(str) {
      return str.replace(/("|\\)/g, '\\$1');
  }
  function toString(obj, wrap = false) {
      var _a, _b, _c, _d;
      const type = getType(obj);
      if (type === 'nil') {
          return 'null';
      }
      if (type === 'string') {
          return wrap ? `"${escapeStr(obj)}"` : obj;
      }
      if (type === 'boolean' || type === 'number') {
          return String(obj);
      }
      if (type === 'list') {
          return '[' + obj.map(toDeepString).join(', ') + ']';
      }
      if (type === 'context') {
          return '{' + Object.entries(obj).map(([key, value]) => {
              return toKeyString(key) + ': ' + toDeepString(value);
          }).join(', ') + '}';
      }
      if (type === 'duration') {
          return obj.shiftTo('years', 'months', 'days', 'hours', 'minutes', 'seconds').normalize().toISO();
      }
      if (type === 'date time') {
          if ((_a = obj.zone) === null || _a === void 0 ? void 0 : _a.zoneName) {
              return obj.toISO({ suppressMilliseconds: true, includeOffset: false }) + '@' + ((_b = obj.zone) === null || _b === void 0 ? void 0 : _b.zoneName);
          }
          return obj.toISO({ suppressMilliseconds: true });
      }
      if (type === 'date') {
          return obj.toISODate();
      }
      if (type === 'range') {
          return '<range>';
      }
      if (type === 'time') {
          if ((_c = obj.zone) === null || _c === void 0 ? void 0 : _c.zoneName) {
              return obj.toISOTime({ suppressMilliseconds: true, includeOffset: false }) + '@' + ((_d = obj.zone) === null || _d === void 0 ? void 0 : _d.zoneName);
          }
          return obj.toISOTime({ suppressMilliseconds: true });
      }
      if (type === 'function') {
          return '<function>';
      }
      throw notImplemented('string(' + type + ')');
  }
  function countSymbols(str) {
      // cf. https://mathiasbynens.be/notes/javascript-unicode
      return str.replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g, '_').length;
  }
  function round$1(n) {
      const integral = Math.trunc(n);
      if (n - integral > .5) {
          return integral + 1;
      }
      else {
          return integral;
      }
  }
  // adapted from https://stackoverflow.com/a/53577159
  function stddev(array) {
      const n = array.length;
      const mean = array.reduce((a, b) => a + b) / n;
      return Math.sqrt(array.map(x => Math.pow(x - mean, 2)).reduce((a, b) => a + b) / (n - 1));
  }
  function median(array) {
      const n = array.length;
      const sorted = array.slice().sort();
      const mid = n / 2 - 1;
      const index = Math.ceil(mid);
      // even
      if (mid === index) {
          return (sorted[index] + sorted[index + 1]) / 2;
      }
      // uneven
      return sorted[index];
  }
  function mode(array) {
      if (array.length < 2) {
          return array;
      }
      const buckets = {};
      for (const n of array) {
          buckets[n] = (buckets[n] || 0) + 1;
      }
      const sorted = Object.entries(buckets).sort((a, b) => b[1] - a[1]);
      return sorted.filter(s => s[1] === sorted[0][1]).map(e => +e[0]);
  }
  function ifValid(o) {
      return o.isValid ? o : null;
  }

  function parseExpressions(expression, context = {}) {
      return parser.configure({
          top: 'Expressions',
          contextTracker: trackVariables(context)
      }).parse(expression);
  }
  function parseUnaryTests(expression, context = {}) {
      return parser.configure({
          top: 'UnaryTests',
          contextTracker: trackVariables(context)
      }).parse(expression);
  }

  class Interpreter {
      _buildExecutionTree(tree, input) {
          const root = { args: [], nodeInput: input };
          const stack = [root];
          tree.iterate({
              enter(nodeRef) {
                  const { isError, isSkipped } = nodeRef.type;
                  const { from, to } = nodeRef;
                  if (isError) {
                      throw new Error(`Statement unparseable at [${from}, ${to}]`);
                  }
                  if (isSkipped) {
                      return false;
                  }
                  const nodeInput = input.slice(from, to);
                  stack.push({
                      nodeInput,
                      args: []
                  });
              },
              leave(nodeRef) {
                  if (nodeRef.type.isSkipped) {
                      return;
                  }
                  const { nodeInput, args } = stack.pop();
                  const parent = stack[stack.length - 1];
                  const expr = evalNode(nodeRef, nodeInput, args);
                  parent.args.push(expr);
              }
          });
          return root.args[root.args.length - 1];
      }
      evaluate(expression, context = {}) {
          const parseTree = parseExpressions(expression, context);
          const root = this._buildExecutionTree(parseTree, expression);
          return {
              parseTree,
              root
          };
      }
      unaryTest(expression, context = {}) {
          const parseTree = parseUnaryTests(expression, context);
          const root = this._buildExecutionTree(parseTree, expression);
          return {
              parseTree,
              root
          };
      }
  }
  const interpreter = new Interpreter();
  function unaryTest(expression, context = {}) {
      const value = context['?'] || null;
      const { root } = interpreter.unaryTest(expression, context);
      // root = fn(ctx) => test(val)
      const test = root(context);
      return test(value);
  }
  function evaluate(expression, context = {}) {
      const { root } = interpreter.evaluate(expression, context);
      // root = [ fn(ctx) ]
      const results = root(context);
      if (results.length === 1) {
          return results[0];
      }
      else {
          return results;
      }
  }
  function evalNode(node, input, args) {
      switch (node.name) {
          case 'ArithOp': return (context) => {
              const nullable = (op, types = ['number']) => (a, b) => {
                  const left = a(context);
                  const right = b(context);
                  if (isArray$1(left)) {
                      return null;
                  }
                  if (isArray$1(right)) {
                      return null;
                  }
                  const leftType = getType(left);
                  const rightType = getType(right);
                  if (leftType !== rightType ||
                      !types.includes(leftType)) {
                      return null;
                  }
                  return op(left, right);
              };
              switch (input) {
                  case '+': return nullable((a, b) => a + b, ['string', 'number']);
                  case '-': return nullable((a, b) => a - b);
                  case '*': return nullable((a, b) => a * b);
                  case '/': return nullable((a, b) => !b ? null : a / b);
                  case '**':
                  case '^': return nullable((a, b) => Math.pow(a, b));
              }
          };
          case 'CompareOp': return tag(() => {
              switch (input) {
                  case '>': return (b) => createRange(b, null, false, false);
                  case '>=': return (b) => createRange(b, null, true, false);
                  case '<': return (b) => createRange(null, b, false, false);
                  case '<=': return (b) => createRange(null, b, false, true);
                  case '=': return (b) => (a) => equals(a, b);
                  case '!=': return (b) => (a) => !equals(a, b);
              }
          }, Test('boolean'));
          case 'Wildcard': return (_context) => true;
          case 'null': return (_context) => {
              return null;
          };
          case 'Disjunction': return tag((context) => {
              const left = args[0](context);
              const right = args[2](context);
              const matrix = [
                  [true, true, true],
                  [true, false, true],
                  [true, null, true],
                  [false, true, true],
                  [false, false, false],
                  [false, null, null],
                  [null, true, true],
                  [null, false, null],
                  [null, null, null],
              ];
              const a = typeof left === 'boolean' ? left : null;
              const b = typeof right === 'boolean' ? right : null;
              return matrix.find(el => el[0] === a && el[1] === b)[2];
          }, Test('boolean'));
          case 'Conjunction': return tag((context) => {
              const left = args[0](context);
              const right = args[2](context);
              const matrix = [
                  [true, true, true],
                  [true, false, false],
                  [true, null, null],
                  [false, true, false],
                  [false, false, false],
                  [false, null, false],
                  [null, true, null],
                  [null, false, false],
                  [null, null, null],
              ];
              const a = typeof left === 'boolean' ? left : null;
              const b = typeof right === 'boolean' ? right : null;
              return matrix.find(el => el[0] === a && el[1] === b)[2];
          }, Test('boolean'));
          case 'Context': return (context) => {
              return args.slice(1, -1).reduce((obj, arg) => {
                  const [key, value] = arg(Object.assign(Object.assign({}, context), obj));
                  return Object.assign(Object.assign({}, obj), { [key]: value });
              }, {});
          };
          case 'FunctionBody': return args[0];
          case 'FormalParameters': return args;
          case 'FormalParameter': return args[0];
          case 'ParameterName': return args.join(' ');
          case 'FunctionDefinition': return (context) => {
              const parameterNames = args[2];
              const fnBody = args[4];
              return wrapFunction((...args) => {
                  const fnContext = parameterNames.reduce((context, name, idx) => {
                      // support positional parameters
                      context[name] = args[idx];
                      return context;
                  }, Object.assign({}, context));
                  return fnBody(fnContext);
              }, parameterNames);
          };
          case 'ContextEntry': return (context) => {
              const key = typeof args[0] === 'function' ? args[0](context) : args[0];
              const value = args[1](context);
              return [key, value];
          };
          case 'Key': return args[0];
          case 'Identifier': return input;
          case 'SpecialFunctionName': return (context) => getBuiltin(input);
          // preserve spaces in name, but compact multiple
          // spaces into one (token)
          case 'Name': return input.replace(/\s{2,}/g, ' ');
          case 'VariableName': return (context) => {
              const name = args.join(' ');
              return getBuiltin(name) || getFromContext(name, context);
          };
          case 'QualifiedName': return (context) => {
              return args.reduce((context, arg) => arg(context), context);
          };
          case '?': return (context) => getFromContext('?', context);
          // expression
          // expression ".." expression
          case 'IterationContext': return (context) => {
              const a = args[0](context);
              const b = args[1] && args[1](context);
              return b ? createRange(a, b) : a;
          };
          case 'Type': return args[0];
          case 'InExpressions': return (context) => {
              const iterationContexts = args.map(ctx => ctx(context));
              if (iterationContexts.some(ctx => getType(ctx) !== 'list')) {
                  return null;
              }
              return cartesianProduct(iterationContexts).map(ctx => {
                  if (!isArray$1(ctx)) {
                      ctx = [ctx];
                  }
                  return Object.assign({}, context, ...ctx);
              });
          };
          // Name kw<"in"> Expr
          case 'InExpression': return (context) => {
              return extractValue(context, args[0], args[2]);
          };
          case 'SpecialType': throw notImplemented('SpecialType');
          case 'InstanceOfExpression': return tag((context) => {
              const a = args[0](context);
              const b = args[3](context);
              return a instanceof b;
          }, Test('boolean'));
          case 'every': return tag((context) => {
              return (_contexts, _condition) => {
                  const contexts = _contexts(context);
                  if (getType(contexts) !== 'list') {
                      return contexts;
                  }
                  return contexts.every(ctx => isTruthy(_condition(ctx)));
              };
          }, Test('boolean'));
          case 'some': return tag((context) => {
              return (_contexts, _condition) => {
                  const contexts = _contexts(context);
                  if (getType(contexts) !== 'list') {
                      return contexts;
                  }
                  return contexts.some(ctx => isTruthy(_condition(ctx)));
              };
          }, Test('boolean'));
          case 'NumericLiteral': return tag((_context) => input.includes('.') ? parseFloat(input) : parseInt(input), 'number');
          case 'BooleanLiteral': return tag((_context) => input === 'true' ? true : false, 'boolean');
          case 'StringLiteral': return tag((_context) => parseString(input), 'string');
          case 'PositionalParameters': return (context) => args.map(arg => arg(context));
          case 'NamedParameter': return (context) => {
              const name = args[0];
              const value = args[1](context);
              return [name, value];
          };
          case 'NamedParameters': return (context) => args.reduce((args, arg) => {
              const [name, value] = arg(context);
              args[name] = value;
              return args;
          }, {});
          case 'DateTimeConstructor': return (context) => {
              return getBuiltin(input);
          };
          case 'DateTimeLiteral': return (context) => {
              // AtLiteral
              if (args.length === 1) {
                  return args[0](context);
              }
              // FunctionInvocation
              else {
                  const wrappedFn = wrapFunction(args[0](context));
                  if (!wrappedFn) {
                      throw new Error(`Failed to evaluate ${input}: Target is not a function`);
                  }
                  const contextOrArgs = args[2](context);
                  return wrappedFn.invoke(contextOrArgs);
              }
          };
          case 'AtLiteral': return (context) => {
              const wrappedFn = wrapFunction(getBuiltin('@'));
              if (!wrappedFn) {
                  throw new Error(`Failed to evaluate ${input}: Target is not a function`);
              }
              return wrappedFn.invoke([args[0](context)]);
          };
          case 'FunctionInvocation': return (context) => {
              const wrappedFn = wrapFunction(args[0](context));
              if (!wrappedFn) {
                  throw new Error(`Failed to evaluate ${input}: Target is not a function`);
              }
              const contextOrArgs = args[2](context);
              return wrappedFn.invoke(contextOrArgs);
          };
          case 'IfExpression': return (function () {
              const ifCondition = args[1];
              const thenValue = args[3];
              const elseValue = args[5];
              const type = coalecenseTypes(thenValue, elseValue);
              return tag((context) => {
                  if (isTruthy(ifCondition(context))) {
                      return thenValue(context);
                  }
                  else {
                      return elseValue ? elseValue(context) : null;
                  }
              }, type);
          })();
          case 'Parameters': return args.length === 3 ? args[1] : (_context) => [];
          case 'Comparison': return (context) => {
              const operator = args[1];
              // expression !compare kw<"in"> PositiveUnaryTest |
              // expression !compare kw<"in"> !unaryTest "(" PositiveUnaryTests ")"
              if (operator === 'in') {
                  return compareIn(args[0](context), (args[3] || args[2])(context));
              }
              // expression !compare kw<"between"> expression kw<"and"> expression
              if (operator === 'between') {
                  const start = args[2](context);
                  const end = args[4](context);
                  if (start === null || end === null) {
                      return null;
                  }
                  return createRange(start, end).includes(args[0](context));
              }
              // expression !compare CompareOp<"=" | "!="> expression |
              // expression !compare CompareOp<Gt | Gte | Lt | Lte> expression |
              const left = args[0](context);
              const right = args[2](context);
              const test = operator()(right);
              return compareValue(test, left);
          };
          case 'QuantifiedExpression': return (context) => {
              const testFn = args[0](context);
              const contexts = args[1];
              const condition = args[3];
              return testFn(contexts, condition);
          };
          // DMN 1.2 - 10.3.2.14
          // kw<"for"> commaSep1<InExpression<IterationContext>> kw<"return"> expression
          case 'ForExpression': return (context) => {
              const extractor = args[args.length - 1];
              const iterationContexts = args[1](context);
              if (getType(iterationContexts) !== 'list') {
                  return iterationContexts;
              }
              const partial = [];
              for (const ctx of iterationContexts) {
                  partial.push(extractor(Object.assign(Object.assign({}, ctx), { partial })));
              }
              return partial;
          };
          case 'ArithmeticExpression': return (function () {
              // binary expression (a + b)
              if (args.length === 3) {
                  const [a, op, b] = args;
                  return tag((context) => {
                      return op(context)(a, b);
                  }, coalecenseTypes(a, b));
              }
              // unary expression (-b)
              if (args.length === 2) {
                  const [op, value] = args;
                  return tag((context) => {
                      return op(context)(() => 0, value);
                  }, value.type);
              }
          })();
          case 'PositiveUnaryTest': return args[0];
          case 'ParenthesizedExpression': return args[1];
          case 'PathExpression': return (context) => {
              const pathTarget = args[0](context);
              const pathProp = args[1];
              if (isArray$1(pathTarget)) {
                  return coerceSingleton(pathTarget.map(pathProp));
              }
              else {
                  return pathProp(pathTarget);
              }
          };
          // expression !filter "[" expression "]"
          case 'FilterExpression': return (context) => {
              const target = args[0](context);
              const filterFn = args[2];
              const filterTarget = isArray$1(target) ? target : [target];
              // null[..]
              if (target === null) {
                  return null;
              }
              // a[1]
              if (filterFn.type === 'number') {
                  const idx = filterFn(context);
                  const value = filterTarget[idx < 0 ? filterTarget.length + idx : idx - 1];
                  if (typeof value === 'undefined') {
                      return null;
                  }
                  else {
                      return value;
                  }
              }
              // a[true]
              if (filterFn.type === 'boolean') {
                  if (filterFn(context)) {
                      return filterTarget;
                  }
                  else {
                      return [];
                  }
              }
              if (filterFn.type === 'string') {
                  const value = filterFn(context);
                  return filterTarget.filter(el => el === value);
              }
              // a[test]
              return filterTarget.map(el => {
                  const iterationContext = Object.assign(Object.assign(Object.assign({}, context), { item: el }), el);
                  let result = filterFn(iterationContext);
                  // test is fn(val) => boolean SimpleUnaryTest
                  if (typeof result === 'function') {
                      result = result(el);
                  }
                  if (result instanceof Range) {
                      result = result.includes(el);
                  }
                  if (result === true) {
                      return el;
                  }
                  return result;
              }).filter(isTruthy);
          };
          case 'SimplePositiveUnaryTest': return tag((context) => {
              // <Interval>
              if (args.length === 1) {
                  return args[0](context);
              }
              // <CompareOp> <Expr>
              return args[0](context)(args[1](context));
          }, 'test');
          case 'List': return (context) => {
              return args.slice(1, -1).map(arg => arg(context));
          };
          case 'Interval': return tag((context) => {
              const left = args[1](context);
              const right = args[2](context);
              const startIncluded = left !== null && args[0] === '[';
              const endIncluded = right !== null && args[3] === ']';
              return createRange(left, right, startIncluded, endIncluded);
          }, Test('boolean'));
          case 'PositiveUnaryTests':
          case 'Expressions': return (context) => {
              return args.map(a => a(context));
          };
          case 'UnaryTests': return (context) => {
              return (value = null) => {
                  const negate = args[0] === 'not';
                  const tests = negate ? args.slice(2, -1) : args;
                  const matches = tests.map(test => test(context)).flat(1).map(test => {
                      if (isArray$1(test)) {
                          return test.includes(value);
                      }
                      if (test === null) {
                          return null;
                      }
                      if (typeof test === 'boolean') {
                          return test;
                      }
                      return compareValue(test, value);
                  }).reduce(combineResult, undefined);
                  return matches === null ? null : (negate ? !matches : matches);
              };
          };
          default: return node.name;
      }
  }
  function getBuiltin(name, _context) {
      return getFromContext(name, builtins);
  }
  function extractValue(context, prop, _target) {
      const target = _target(context);
      if (['list', 'range'].includes(getType(target))) {
          return target.map(t => ({ [prop]: t }));
      }
      return null;
  }
  function compareIn(value, tests) {
      if (!isArray$1(tests)) {
          if (getType(tests) === 'nil') {
              return null;
          }
          tests = [tests];
      }
      return tests.some(test => compareValue(test, value));
  }
  function compareValue(test, value) {
      if (typeof test === 'function') {
          return test(value);
      }
      if (test instanceof Range) {
          return test.includes(value);
      }
      return equals(test, value);
  }
  const chars = Array.from('abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ');
  function isTyped(type, values) {
      return (values.some(e => getType(e) === type) &&
          values.every(e => e === null || getType(e) === type));
  }
  function createRange(start, end, startIncluded = true, endIncluded = true) {
      if (isTyped('string', [start, end])) {
          return createStringRange(start, end, startIncluded, endIncluded);
      }
      if (isTyped('number', [start, end])) {
          return createNumberRange(start, end, startIncluded, endIncluded);
      }
      if (isTyped('duration', [start, end])) {
          throw notImplemented('range<duration>');
      }
      if (isTyped('time', [start, end])) {
          throw notImplemented('range<time>');
      }
      if (isTyped('date time', [start, end])) {
          throw notImplemented('range<date and time>');
      }
      if (isTyped('date', [start, end])) {
          throw notImplemented('range<date>');
      }
      throw new Error(`unsupported range: ${start}..${end}`);
  }
  function noopMap() {
      return () => {
          throw new Error('unsupported range operation: map');
      };
  }
  function valuesMap(values) {
      return (fn) => values.map(fn);
  }
  function valuesIncludes(values) {
      return (value) => values.includes(value);
  }
  function numberMap(start, end, startIncluded, endIncluded) {
      const direction = start > end ? -1 : 1;
      return (fn) => {
          const result = [];
          for (let i = start;; i += direction) {
              if (i === 0 && !startIncluded) {
                  continue;
              }
              if (i === end && !endIncluded) {
                  break;
              }
              result.push(fn(i));
              if (i === end) {
                  break;
              }
          }
          return result;
      };
  }
  function includesStart(n, inclusive) {
      if (inclusive) {
          return (value) => n <= value;
      }
      else {
          return (value) => n < value;
      }
  }
  function includesEnd(n, inclusive) {
      if (inclusive) {
          return (value) => n >= value;
      }
      else {
          return (value) => n > value;
      }
  }
  function anyIncludes(start, end, startIncluded, endIncluded) {
      let tests = [];
      if (start !== null && end !== null) {
          if (start > end) {
              tests = [
                  includesStart(end, endIncluded),
                  includesEnd(start, startIncluded)
              ];
          }
          else {
              tests = [
                  includesStart(start, startIncluded),
                  includesEnd(end, endIncluded)
              ];
          }
      }
      else if (end !== null) {
          tests = [
              includesEnd(end, endIncluded)
          ];
      }
      else if (start !== null) {
          tests = [
              includesStart(start, startIncluded)
          ];
      }
      return (value) => tests.every(t => t(value));
  }
  function createStringRange(start, end, startIncluded = true, endIncluded = true) {
      if (start !== null && !chars.includes(start)) {
          throw new Error('illegal range start: ' + start);
      }
      if (end !== null && !chars.includes(end)) {
          throw new Error('illegal range end: ' + end);
      }
      let values;
      if (start !== null && end !== null) {
          let startIdx = chars.indexOf(start);
          let endIdx = chars.indexOf(end);
          const direction = startIdx > endIdx ? -1 : 1;
          if (startIncluded === false) {
              startIdx += direction;
          }
          if (endIncluded === false) {
              endIdx -= direction;
          }
          values = chars.slice(startIdx, endIdx + 1);
      }
      const map = values ? valuesMap(values) : noopMap();
      const includes = values ? valuesIncludes(values) : anyIncludes(start, end, startIncluded, endIncluded);
      return new Range({
          start,
          end,
          'start included': startIncluded,
          'end included': endIncluded,
          map,
          includes
      });
  }
  function createNumberRange(start, end, startIncluded, endIncluded) {
      const map = start !== null && end !== null ? numberMap(start, end, startIncluded, endIncluded) : noopMap();
      const includes = anyIncludes(start, end, startIncluded, endIncluded);
      return new Range({
          start,
          end,
          'start included': startIncluded,
          'end included': endIncluded,
          map,
          includes
      });
  }
  function cartesianProduct(arrays) {
      if (arrays.some(arr => getType(arr) === 'nil')) {
          return null;
      }
      const f = (a, b) => [].concat(...a.map(d => b.map(e => [].concat(d, e))));
      const cartesian = (a, b, ...c) => (b ? cartesian(f(a, b), ...c) : a || []);
      return cartesian(...arrays);
  }
  function coalecenseTypes(a, b) {
      if (!b) {
          return a.type;
      }
      if (a.type === b.type) {
          return a.type;
      }
      return 'any';
  }
  function tag(fn, type) {
      return Object.assign(fn, {
          type,
          toString() {
              return `TaggedFunction[${type}] ${Function.prototype.toString.call(fn)}`;
          }
      });
  }
  function combineResult(result, match) {
      if (!result) {
          return match;
      }
      return result;
  }
  function isTruthy(obj) {
      return obj !== false && obj !== null;
  }
  function Test(type) {
      return `Test<${type}>`;
  }
  /**
   * @param {Function} fn
   * @param {string[]} [parameterNames]
   *
   * @return {FunctionWrapper}
   */
  function wrapFunction(fn, parameterNames = null) {
      if (!fn) {
          return null;
      }
      if (fn instanceof FunctionWrapper) {
          return fn;
      }
      if (fn instanceof Range) {
          return new FunctionWrapper((value) => fn.includes(value), ['value']);
      }
      return new FunctionWrapper(fn, parameterNames || parseParameterNames(fn));
  }
  function coerceSingleton(values) {
      if (Array.isArray(values) && values.length === 1) {
          return values[0];
      }
      else {
          return values;
      }
  }
  function parseString(str) {
      if (str.startsWith('"')) {
          str = str.slice(1);
      }
      if (str.endsWith('"')) {
          str = str.slice(0, -1);
      }
      return str.replace(/(\\")|(\\\\)|(\\u[a-fA-F0-9]{5,6})|((?:\\u[a-fA-F0-9]{1,4})+)/ig, function (substring, ...groups) {
          const [quotes, escape, codePoint, charCodes] = groups;
          if (quotes) {
              return '"';
          }
          if (escape) {
              return '\\';
          }
          const escapePattern = /\\u([a-fA-F0-9]+)/ig;
          if (codePoint) {
              const codePointMatch = escapePattern.exec(codePoint);
              return String.fromCodePoint(parseInt(codePointMatch[1], 16));
          }
          if (charCodes) {
              const chars = [];
              let charCodeMatch;
              while ((charCodeMatch = escapePattern.exec(substring)) !== null) {
                  chars.push(parseInt(charCodeMatch[1], 16));
              }
              return String.fromCharCode(...chars);
          }
          throw new Error('illegal match');
      });
  }

  /*
   *  big.js v6.2.1
   *  A small, fast, easy-to-use library for arbitrary-precision decimal arithmetic.
   *  Copyright (c) 2022 Michael Mclaughlin
   *  https://github.com/MikeMcl/big.js/LICENCE.md
   */


  /************************************** EDITABLE DEFAULTS *****************************************/


    // The default values below must be integers within the stated ranges.

    /*
     * The maximum number of decimal places (DP) of the results of operations involving division:
     * div and sqrt, and pow with negative exponents.
     */
  var DP = 20,          // 0 to MAX_DP

    /*
     * The rounding mode (RM) used when rounding to the above decimal places.
     *
     *  0  Towards zero (i.e. truncate, no rounding).       (ROUND_DOWN)
     *  1  To nearest neighbour. If equidistant, round up.  (ROUND_HALF_UP)
     *  2  To nearest neighbour. If equidistant, to even.   (ROUND_HALF_EVEN)
     *  3  Away from zero.                                  (ROUND_UP)
     */
    RM = 1,             // 0, 1, 2 or 3

    // The maximum value of DP and Big.DP.
    MAX_DP = 1E6,       // 0 to 1000000

    // The maximum magnitude of the exponent argument to the pow method.
    MAX_POWER = 1E6,    // 1 to 1000000

    /*
     * The negative exponent (NE) at and beneath which toString returns exponential notation.
     * (JavaScript numbers: -7)
     * -1000000 is the minimum recommended exponent value of a Big.
     */
    NE = -7,            // 0 to -1000000

    /*
     * The positive exponent (PE) at and above which toString returns exponential notation.
     * (JavaScript numbers: 21)
     * 1000000 is the maximum recommended exponent value of a Big, but this limit is not enforced.
     */
    PE = 21,            // 0 to 1000000

    /*
     * When true, an error will be thrown if a primitive number is passed to the Big constructor,
     * or if valueOf is called, or if toNumber is called on a Big which cannot be converted to a
     * primitive number without a loss of precision.
     */
    STRICT = false,     // true or false


  /**************************************************************************************************/


    // Error messages.
    NAME = '[big.js] ',
    INVALID = NAME + 'Invalid ',
    INVALID_DP = INVALID + 'decimal places',
    INVALID_RM = INVALID + 'rounding mode',
    DIV_BY_ZERO = NAME + 'Division by zero',

    // The shared prototype object.
    P$2 = {},
    UNDEFINED = void 0,
    NUMERIC = /^-?(\d+(\.\d*)?|\.\d+)(e[+-]?\d+)?$/i;


  /*
   * Create and return a Big constructor.
   */
  function _Big_() {

    /*
     * The Big constructor and exported function.
     * Create and return a new instance of a Big number object.
     *
     * n {number|string|Big} A numeric value.
     */
    function Big(n) {
      var x = this;

      // Enable constructor usage without new.
      if (!(x instanceof Big)) return n === UNDEFINED ? _Big_() : new Big(n);

      // Duplicate.
      if (n instanceof Big) {
        x.s = n.s;
        x.e = n.e;
        x.c = n.c.slice();
      } else {
        if (typeof n !== 'string') {
          if (Big.strict === true && typeof n !== 'bigint') {
            throw TypeError(INVALID + 'value');
          }

          // Minus zero?
          n = n === 0 && 1 / n < 0 ? '-0' : String(n);
        }

        parse(x, n);
      }

      // Retain a reference to this Big constructor.
      // Shadow Big.prototype.constructor which points to Object.
      x.constructor = Big;
    }

    Big.prototype = P$2;
    Big.DP = DP;
    Big.RM = RM;
    Big.NE = NE;
    Big.PE = PE;
    Big.strict = STRICT;
    Big.roundDown = 0;
    Big.roundHalfUp = 1;
    Big.roundHalfEven = 2;
    Big.roundUp = 3;

    return Big;
  }


  /*
   * Parse the number or string value passed to a Big constructor.
   *
   * x {Big} A Big number instance.
   * n {number|string} A numeric value.
   */
  function parse(x, n) {
    var e, i, nl;

    if (!NUMERIC.test(n)) {
      throw Error(INVALID + 'number');
    }

    // Determine sign.
    x.s = n.charAt(0) == '-' ? (n = n.slice(1), -1) : 1;

    // Decimal point?
    if ((e = n.indexOf('.')) > -1) n = n.replace('.', '');

    // Exponential form?
    if ((i = n.search(/e/i)) > 0) {

      // Determine exponent.
      if (e < 0) e = i;
      e += +n.slice(i + 1);
      n = n.substring(0, i);
    } else if (e < 0) {

      // Integer.
      e = n.length;
    }

    nl = n.length;

    // Determine leading zeros.
    for (i = 0; i < nl && n.charAt(i) == '0';) ++i;

    if (i == nl) {

      // Zero.
      x.c = [x.e = 0];
    } else {

      // Determine trailing zeros.
      for (; nl > 0 && n.charAt(--nl) == '0';);
      x.e = e - i - 1;
      x.c = [];

      // Convert string to array of digits without leading/trailing zeros.
      for (e = 0; i <= nl;) x.c[e++] = +n.charAt(i++);
    }

    return x;
  }


  /*
   * Round Big x to a maximum of sd significant digits using rounding mode rm.
   *
   * x {Big} The Big to round.
   * sd {number} Significant digits: integer, 0 to MAX_DP inclusive.
   * rm {number} Rounding mode: 0 (down), 1 (half-up), 2 (half-even) or 3 (up).
   * [more] {boolean} Whether the result of division was truncated.
   */
  function round(x, sd, rm, more) {
    var xc = x.c;

    if (rm === UNDEFINED) rm = x.constructor.RM;
    if (rm !== 0 && rm !== 1 && rm !== 2 && rm !== 3) {
      throw Error(INVALID_RM);
    }

    if (sd < 1) {
      more =
        rm === 3 && (more || !!xc[0]) || sd === 0 && (
        rm === 1 && xc[0] >= 5 ||
        rm === 2 && (xc[0] > 5 || xc[0] === 5 && (more || xc[1] !== UNDEFINED))
      );

      xc.length = 1;

      if (more) {

        // 1, 0.1, 0.01, 0.001, 0.0001 etc.
        x.e = x.e - sd + 1;
        xc[0] = 1;
      } else {

        // Zero.
        xc[0] = x.e = 0;
      }
    } else if (sd < xc.length) {

      // xc[sd] is the digit after the digit that may be rounded up.
      more =
        rm === 1 && xc[sd] >= 5 ||
        rm === 2 && (xc[sd] > 5 || xc[sd] === 5 &&
          (more || xc[sd + 1] !== UNDEFINED || xc[sd - 1] & 1)) ||
        rm === 3 && (more || !!xc[0]);

      // Remove any digits after the required precision.
      xc.length = sd;

      // Round up?
      if (more) {

        // Rounding up may mean the previous digit has to be rounded up.
        for (; ++xc[--sd] > 9;) {
          xc[sd] = 0;
          if (sd === 0) {
            ++x.e;
            xc.unshift(1);
            break;
          }
        }
      }

      // Remove trailing zeros.
      for (sd = xc.length; !xc[--sd];) xc.pop();
    }

    return x;
  }


  /*
   * Return a string representing the value of Big x in normal or exponential notation.
   * Handles P.toExponential, P.toFixed, P.toJSON, P.toPrecision, P.toString and P.valueOf.
   */
  function stringify(x, doExponential, isNonzero) {
    var e = x.e,
      s = x.c.join(''),
      n = s.length;

    // Exponential notation?
    if (doExponential) {
      s = s.charAt(0) + (n > 1 ? '.' + s.slice(1) : '') + (e < 0 ? 'e' : 'e+') + e;

    // Normal notation.
    } else if (e < 0) {
      for (; ++e;) s = '0' + s;
      s = '0.' + s;
    } else if (e > 0) {
      if (++e > n) {
        for (e -= n; e--;) s += '0';
      } else if (e < n) {
        s = s.slice(0, e) + '.' + s.slice(e);
      }
    } else if (n > 1) {
      s = s.charAt(0) + '.' + s.slice(1);
    }

    return x.s < 0 && isNonzero ? '-' + s : s;
  }


  // Prototype/instance methods


  /*
   * Return a new Big whose value is the absolute value of this Big.
   */
  P$2.abs = function () {
    var x = new this.constructor(this);
    x.s = 1;
    return x;
  };


  /*
   * Return 1 if the value of this Big is greater than the value of Big y,
   *       -1 if the value of this Big is less than the value of Big y, or
   *        0 if they have the same value.
   */
  P$2.cmp = function (y) {
    var isneg,
      x = this,
      xc = x.c,
      yc = (y = new x.constructor(y)).c,
      i = x.s,
      j = y.s,
      k = x.e,
      l = y.e;

    // Either zero?
    if (!xc[0] || !yc[0]) return !xc[0] ? !yc[0] ? 0 : -j : i;

    // Signs differ?
    if (i != j) return i;

    isneg = i < 0;

    // Compare exponents.
    if (k != l) return k > l ^ isneg ? 1 : -1;

    j = (k = xc.length) < (l = yc.length) ? k : l;

    // Compare digit by digit.
    for (i = -1; ++i < j;) {
      if (xc[i] != yc[i]) return xc[i] > yc[i] ^ isneg ? 1 : -1;
    }

    // Compare lengths.
    return k == l ? 0 : k > l ^ isneg ? 1 : -1;
  };


  /*
   * Return a new Big whose value is the value of this Big divided by the value of Big y, rounded,
   * if necessary, to a maximum of Big.DP decimal places using rounding mode Big.RM.
   */
  P$2.div = function (y) {
    var x = this,
      Big = x.constructor,
      a = x.c,                  // dividend
      b = (y = new Big(y)).c,   // divisor
      k = x.s == y.s ? 1 : -1,
      dp = Big.DP;

    if (dp !== ~~dp || dp < 0 || dp > MAX_DP) {
      throw Error(INVALID_DP);
    }

    // Divisor is zero?
    if (!b[0]) {
      throw Error(DIV_BY_ZERO);
    }

    // Dividend is 0? Return +-0.
    if (!a[0]) {
      y.s = k;
      y.c = [y.e = 0];
      return y;
    }

    var bl, bt, n, cmp, ri,
      bz = b.slice(),
      ai = bl = b.length,
      al = a.length,
      r = a.slice(0, bl),   // remainder
      rl = r.length,
      q = y,                // quotient
      qc = q.c = [],
      qi = 0,
      p = dp + (q.e = x.e - y.e) + 1;    // precision of the result

    q.s = k;
    k = p < 0 ? 0 : p;

    // Create version of divisor with leading zero.
    bz.unshift(0);

    // Add zeros to make remainder as long as divisor.
    for (; rl++ < bl;) r.push(0);

    do {

      // n is how many times the divisor goes into current remainder.
      for (n = 0; n < 10; n++) {

        // Compare divisor and remainder.
        if (bl != (rl = r.length)) {
          cmp = bl > rl ? 1 : -1;
        } else {
          for (ri = -1, cmp = 0; ++ri < bl;) {
            if (b[ri] != r[ri]) {
              cmp = b[ri] > r[ri] ? 1 : -1;
              break;
            }
          }
        }

        // If divisor < remainder, subtract divisor from remainder.
        if (cmp < 0) {

          // Remainder can't be more than 1 digit longer than divisor.
          // Equalise lengths using divisor with extra leading zero?
          for (bt = rl == bl ? b : bz; rl;) {
            if (r[--rl] < bt[rl]) {
              ri = rl;
              for (; ri && !r[--ri];) r[ri] = 9;
              --r[ri];
              r[rl] += 10;
            }
            r[rl] -= bt[rl];
          }

          for (; !r[0];) r.shift();
        } else {
          break;
        }
      }

      // Add the digit n to the result array.
      qc[qi++] = cmp ? n : ++n;

      // Update the remainder.
      if (r[0] && cmp) r[rl] = a[ai] || 0;
      else r = [a[ai]];

    } while ((ai++ < al || r[0] !== UNDEFINED) && k--);

    // Leading zero? Do not remove if result is simply zero (qi == 1).
    if (!qc[0] && qi != 1) {

      // There can't be more than one zero.
      qc.shift();
      q.e--;
      p--;
    }

    // Round?
    if (qi > p) round(q, p, Big.RM, r[0] !== UNDEFINED);

    return q;
  };


  /*
   * Return true if the value of this Big is equal to the value of Big y, otherwise return false.
   */
  P$2.eq = function (y) {
    return this.cmp(y) === 0;
  };


  /*
   * Return true if the value of this Big is greater than the value of Big y, otherwise return
   * false.
   */
  P$2.gt = function (y) {
    return this.cmp(y) > 0;
  };


  /*
   * Return true if the value of this Big is greater than or equal to the value of Big y, otherwise
   * return false.
   */
  P$2.gte = function (y) {
    return this.cmp(y) > -1;
  };


  /*
   * Return true if the value of this Big is less than the value of Big y, otherwise return false.
   */
  P$2.lt = function (y) {
    return this.cmp(y) < 0;
  };


  /*
   * Return true if the value of this Big is less than or equal to the value of Big y, otherwise
   * return false.
   */
  P$2.lte = function (y) {
    return this.cmp(y) < 1;
  };


  /*
   * Return a new Big whose value is the value of this Big minus the value of Big y.
   */
  P$2.minus = P$2.sub = function (y) {
    var i, j, t, xlty,
      x = this,
      Big = x.constructor,
      a = x.s,
      b = (y = new Big(y)).s;

    // Signs differ?
    if (a != b) {
      y.s = -b;
      return x.plus(y);
    }

    var xc = x.c.slice(),
      xe = x.e,
      yc = y.c,
      ye = y.e;

    // Either zero?
    if (!xc[0] || !yc[0]) {
      if (yc[0]) {
        y.s = -b;
      } else if (xc[0]) {
        y = new Big(x);
      } else {
        y.s = 1;
      }
      return y;
    }

    // Determine which is the bigger number. Prepend zeros to equalise exponents.
    if (a = xe - ye) {

      if (xlty = a < 0) {
        a = -a;
        t = xc;
      } else {
        ye = xe;
        t = yc;
      }

      t.reverse();
      for (b = a; b--;) t.push(0);
      t.reverse();
    } else {

      // Exponents equal. Check digit by digit.
      j = ((xlty = xc.length < yc.length) ? xc : yc).length;

      for (a = b = 0; b < j; b++) {
        if (xc[b] != yc[b]) {
          xlty = xc[b] < yc[b];
          break;
        }
      }
    }

    // x < y? Point xc to the array of the bigger number.
    if (xlty) {
      t = xc;
      xc = yc;
      yc = t;
      y.s = -y.s;
    }

    /*
     * Append zeros to xc if shorter. No need to add zeros to yc if shorter as subtraction only
     * needs to start at yc.length.
     */
    if ((b = (j = yc.length) - (i = xc.length)) > 0) for (; b--;) xc[i++] = 0;

    // Subtract yc from xc.
    for (b = i; j > a;) {
      if (xc[--j] < yc[j]) {
        for (i = j; i && !xc[--i];) xc[i] = 9;
        --xc[i];
        xc[j] += 10;
      }

      xc[j] -= yc[j];
    }

    // Remove trailing zeros.
    for (; xc[--b] === 0;) xc.pop();

    // Remove leading zeros and adjust exponent accordingly.
    for (; xc[0] === 0;) {
      xc.shift();
      --ye;
    }

    if (!xc[0]) {

      // n - n = +0
      y.s = 1;

      // Result must be zero.
      xc = [ye = 0];
    }

    y.c = xc;
    y.e = ye;

    return y;
  };


  /*
   * Return a new Big whose value is the value of this Big modulo the value of Big y.
   */
  P$2.mod = function (y) {
    var ygtx,
      x = this,
      Big = x.constructor,
      a = x.s,
      b = (y = new Big(y)).s;

    if (!y.c[0]) {
      throw Error(DIV_BY_ZERO);
    }

    x.s = y.s = 1;
    ygtx = y.cmp(x) == 1;
    x.s = a;
    y.s = b;

    if (ygtx) return new Big(x);

    a = Big.DP;
    b = Big.RM;
    Big.DP = Big.RM = 0;
    x = x.div(y);
    Big.DP = a;
    Big.RM = b;

    return this.minus(x.times(y));
  };


  /*
   * Return a new Big whose value is the value of this Big negated.
   */
  P$2.neg = function () {
    var x = new this.constructor(this);
    x.s = -x.s;
    return x;
  };


  /*
   * Return a new Big whose value is the value of this Big plus the value of Big y.
   */
  P$2.plus = P$2.add = function (y) {
    var e, k, t,
      x = this,
      Big = x.constructor;

    y = new Big(y);

    // Signs differ?
    if (x.s != y.s) {
      y.s = -y.s;
      return x.minus(y);
    }

    var xe = x.e,
      xc = x.c,
      ye = y.e,
      yc = y.c;

    // Either zero?
    if (!xc[0] || !yc[0]) {
      if (!yc[0]) {
        if (xc[0]) {
          y = new Big(x);
        } else {
          y.s = x.s;
        }
      }
      return y;
    }

    xc = xc.slice();

    // Prepend zeros to equalise exponents.
    // Note: reverse faster than unshifts.
    if (e = xe - ye) {
      if (e > 0) {
        ye = xe;
        t = yc;
      } else {
        e = -e;
        t = xc;
      }

      t.reverse();
      for (; e--;) t.push(0);
      t.reverse();
    }

    // Point xc to the longer array.
    if (xc.length - yc.length < 0) {
      t = yc;
      yc = xc;
      xc = t;
    }

    e = yc.length;

    // Only start adding at yc.length - 1 as the further digits of xc can be left as they are.
    for (k = 0; e; xc[e] %= 10) k = (xc[--e] = xc[e] + yc[e] + k) / 10 | 0;

    // No need to check for zero, as +x + +y != 0 && -x + -y != 0

    if (k) {
      xc.unshift(k);
      ++ye;
    }

    // Remove trailing zeros.
    for (e = xc.length; xc[--e] === 0;) xc.pop();

    y.c = xc;
    y.e = ye;

    return y;
  };


  /*
   * Return a Big whose value is the value of this Big raised to the power n.
   * If n is negative, round to a maximum of Big.DP decimal places using rounding
   * mode Big.RM.
   *
   * n {number} Integer, -MAX_POWER to MAX_POWER inclusive.
   */
  P$2.pow = function (n) {
    var x = this,
      one = new x.constructor('1'),
      y = one,
      isneg = n < 0;

    if (n !== ~~n || n < -MAX_POWER || n > MAX_POWER) {
      throw Error(INVALID + 'exponent');
    }

    if (isneg) n = -n;

    for (;;) {
      if (n & 1) y = y.times(x);
      n >>= 1;
      if (!n) break;
      x = x.times(x);
    }

    return isneg ? one.div(y) : y;
  };


  /*
   * Return a new Big whose value is the value of this Big rounded to a maximum precision of sd
   * significant digits using rounding mode rm, or Big.RM if rm is not specified.
   *
   * sd {number} Significant digits: integer, 1 to MAX_DP inclusive.
   * rm? {number} Rounding mode: 0 (down), 1 (half-up), 2 (half-even) or 3 (up).
   */
  P$2.prec = function (sd, rm) {
    if (sd !== ~~sd || sd < 1 || sd > MAX_DP) {
      throw Error(INVALID + 'precision');
    }
    return round(new this.constructor(this), sd, rm);
  };


  /*
   * Return a new Big whose value is the value of this Big rounded to a maximum of dp decimal places
   * using rounding mode rm, or Big.RM if rm is not specified.
   * If dp is negative, round to an integer which is a multiple of 10**-dp.
   * If dp is not specified, round to 0 decimal places.
   *
   * dp? {number} Integer, -MAX_DP to MAX_DP inclusive.
   * rm? {number} Rounding mode: 0 (down), 1 (half-up), 2 (half-even) or 3 (up).
   */
  P$2.round = function (dp, rm) {
    if (dp === UNDEFINED) dp = 0;
    else if (dp !== ~~dp || dp < -MAX_DP || dp > MAX_DP) {
      throw Error(INVALID_DP);
    }
    return round(new this.constructor(this), dp + this.e + 1, rm);
  };


  /*
   * Return a new Big whose value is the square root of the value of this Big, rounded, if
   * necessary, to a maximum of Big.DP decimal places using rounding mode Big.RM.
   */
  P$2.sqrt = function () {
    var r, c, t,
      x = this,
      Big = x.constructor,
      s = x.s,
      e = x.e,
      half = new Big('0.5');

    // Zero?
    if (!x.c[0]) return new Big(x);

    // Negative?
    if (s < 0) {
      throw Error(NAME + 'No square root');
    }

    // Estimate.
    s = Math.sqrt(x + '');

    // Math.sqrt underflow/overflow?
    // Re-estimate: pass x coefficient to Math.sqrt as integer, then adjust the result exponent.
    if (s === 0 || s === 1 / 0) {
      c = x.c.join('');
      if (!(c.length + e & 1)) c += '0';
      s = Math.sqrt(c);
      e = ((e + 1) / 2 | 0) - (e < 0 || e & 1);
      r = new Big((s == 1 / 0 ? '5e' : (s = s.toExponential()).slice(0, s.indexOf('e') + 1)) + e);
    } else {
      r = new Big(s + '');
    }

    e = r.e + (Big.DP += 4);

    // Newton-Raphson iteration.
    do {
      t = r;
      r = half.times(t.plus(x.div(t)));
    } while (t.c.slice(0, e).join('') !== r.c.slice(0, e).join(''));

    return round(r, (Big.DP -= 4) + r.e + 1, Big.RM);
  };


  /*
   * Return a new Big whose value is the value of this Big times the value of Big y.
   */
  P$2.times = P$2.mul = function (y) {
    var c,
      x = this,
      Big = x.constructor,
      xc = x.c,
      yc = (y = new Big(y)).c,
      a = xc.length,
      b = yc.length,
      i = x.e,
      j = y.e;

    // Determine sign of result.
    y.s = x.s == y.s ? 1 : -1;

    // Return signed 0 if either 0.
    if (!xc[0] || !yc[0]) {
      y.c = [y.e = 0];
      return y;
    }

    // Initialise exponent of result as x.e + y.e.
    y.e = i + j;

    // If array xc has fewer digits than yc, swap xc and yc, and lengths.
    if (a < b) {
      c = xc;
      xc = yc;
      yc = c;
      j = a;
      a = b;
      b = j;
    }

    // Initialise coefficient array of result with zeros.
    for (c = new Array(j = a + b); j--;) c[j] = 0;

    // Multiply.

    // i is initially xc.length.
    for (i = b; i--;) {
      b = 0;

      // a is yc.length.
      for (j = a + i; j > i;) {

        // Current sum of products at this digit position, plus carry.
        b = c[j] + yc[i] * xc[j - i - 1] + b;
        c[j--] = b % 10;

        // carry
        b = b / 10 | 0;
      }

      c[j] = b;
    }

    // Increment result exponent if there is a final carry, otherwise remove leading zero.
    if (b) ++y.e;
    else c.shift();

    // Remove trailing zeros.
    for (i = c.length; !c[--i];) c.pop();
    y.c = c;

    return y;
  };


  /*
   * Return a string representing the value of this Big in exponential notation rounded to dp fixed
   * decimal places using rounding mode rm, or Big.RM if rm is not specified.
   *
   * dp? {number} Decimal places: integer, 0 to MAX_DP inclusive.
   * rm? {number} Rounding mode: 0 (down), 1 (half-up), 2 (half-even) or 3 (up).
   */
  P$2.toExponential = function (dp, rm) {
    var x = this,
      n = x.c[0];

    if (dp !== UNDEFINED) {
      if (dp !== ~~dp || dp < 0 || dp > MAX_DP) {
        throw Error(INVALID_DP);
      }
      x = round(new x.constructor(x), ++dp, rm);
      for (; x.c.length < dp;) x.c.push(0);
    }

    return stringify(x, true, !!n);
  };


  /*
   * Return a string representing the value of this Big in normal notation rounded to dp fixed
   * decimal places using rounding mode rm, or Big.RM if rm is not specified.
   *
   * dp? {number} Decimal places: integer, 0 to MAX_DP inclusive.
   * rm? {number} Rounding mode: 0 (down), 1 (half-up), 2 (half-even) or 3 (up).
   *
   * (-0).toFixed(0) is '0', but (-0.1).toFixed(0) is '-0'.
   * (-0).toFixed(1) is '0.0', but (-0.01).toFixed(1) is '-0.0'.
   */
  P$2.toFixed = function (dp, rm) {
    var x = this,
      n = x.c[0];

    if (dp !== UNDEFINED) {
      if (dp !== ~~dp || dp < 0 || dp > MAX_DP) {
        throw Error(INVALID_DP);
      }
      x = round(new x.constructor(x), dp + x.e + 1, rm);

      // x.e may have changed if the value is rounded up.
      for (dp = dp + x.e + 1; x.c.length < dp;) x.c.push(0);
    }

    return stringify(x, false, !!n);
  };


  /*
   * Return a string representing the value of this Big.
   * Return exponential notation if this Big has a positive exponent equal to or greater than
   * Big.PE, or a negative exponent equal to or less than Big.NE.
   * Omit the sign for negative zero.
   */
  P$2[Symbol.for('nodejs.util.inspect.custom')] = P$2.toJSON = P$2.toString = function () {
    var x = this,
      Big = x.constructor;
    return stringify(x, x.e <= Big.NE || x.e >= Big.PE, !!x.c[0]);
  };


  /*
   * Return the value of this Big as a primitve number.
   */
  P$2.toNumber = function () {
    var n = Number(stringify(this, true, true));
    if (this.constructor.strict === true && !this.eq(n.toString())) {
      throw Error(NAME + 'Imprecise conversion');
    }
    return n;
  };


  /*
   * Return a string representing the value of this Big rounded to sd significant digits using
   * rounding mode rm, or Big.RM if rm is not specified.
   * Use exponential notation if sd is less than the number of digits necessary to represent
   * the integer part of the value in normal notation.
   *
   * sd {number} Significant digits: integer, 1 to MAX_DP inclusive.
   * rm? {number} Rounding mode: 0 (down), 1 (half-up), 2 (half-even) or 3 (up).
   */
  P$2.toPrecision = function (sd, rm) {
    var x = this,
      Big = x.constructor,
      n = x.c[0];

    if (sd !== UNDEFINED) {
      if (sd !== ~~sd || sd < 1 || sd > MAX_DP) {
        throw Error(INVALID + 'precision');
      }
      x = round(new Big(x), sd, rm);
      for (; x.c.length < sd;) x.c.push(0);
    }

    return stringify(x, sd <= x.e || x.e <= Big.NE || x.e >= Big.PE, !!n);
  };


  /*
   * Return a string representing the value of this Big.
   * Return exponential notation if this Big has a positive exponent equal to or greater than
   * Big.PE, or a negative exponent equal to or less than Big.NE.
   * Include the sign for negative zero.
   */
  P$2.valueOf = function () {
    var x = this,
      Big = x.constructor;
    if (Big.strict === true) {
      throw Error(NAME + 'valueOf disallowed');
    }
    return stringify(x, x.e <= Big.NE || x.e >= Big.PE, true);
  };


  // Export


  var Big = _Big_();

  var e$4={"":["<em>","</em>"],_:["<strong>","</strong>"],"*":["<strong>","</strong>"],"~":["<s>","</s>"],"\n":["<br />"]," ":["<br />"],"-":["<hr />"]};function n$2(e){return e.replace(RegExp("^"+(e.match(/^(\t| )+/)||"")[0],"gm"),"")}function r$2(e){return (e+"").replace(/"/g,"&quot;").replace(/</g,"&lt;").replace(/>/g,"&gt;")}function t$2(a,o){var c,l,s,g,p,u=/((?:^|\n+)(?:\n---+|\* \*(?: \*)+)\n)|(?:^``` *(\w*)\n([\s\S]*?)\n```$)|((?:(?:^|\n+)(?:\t|  {2,}).+)+\n*)|((?:(?:^|\n)([>*+-]|\d+\.)\s+.*)+)|(?:!\[([^\]]*?)\]\(([^)]+?)\))|(\[)|(\](?:\(([^)]+?)\))?)|(?:(?:^|\n+)([^\s].*)\n(-{3,}|={3,})(?:\n+|$))|(?:(?:^|\n+)(#{1,6})\s*(.+)(?:\n+|$))|(?:`([^`].*?)`)|(  \n\n*|\n{2,}|__|\*\*|[_*]|~~)|<([^>]+)>/gm,h=[],m="",i=o||{},f=0;function d(n){var r=e$4[n[1]||""],t=h[h.length-1]==n;return r?r[1]?(t?h.pop():h.push(n),r[0|t]):r[0]:n}function $(){for(var e="";h.length;)e+=d(h[h.length-1]);return e}for(a=a.replace(/^\[(.+?)\]:\s*(.+)$/gm,function(e,n,r){return i[n.toLowerCase()]=r,""}).replace(/^\n+|\n+$/g,"");s=u.exec(a);)l=a.substring(f,s.index),f=u.lastIndex,c=s[0],l.match(/[^\\](\\\\)*\\$/)||((p=s[3]||s[4])?c='<pre class="code '+(s[4]?"poetry":s[2].toLowerCase())+'"><code'+(s[2]?' class="language-'+s[2].toLowerCase()+'"':"")+">"+n$2(r$2(p).replace(/^\n+|\n+$/g,""))+"</code></pre>":(p=s[6])?(p.match(/\./)&&(s[5]=s[5].replace(/^\d+/gm,"")),g=t$2(n$2(s[5].replace(/^\s*[>*+.-]/gm,""))),">"==p?p="blockquote":(p=p.match(/\./)?"ol":"ul",g=g.replace(/^(.*)(\n|$)/gm,"<li>$1</li>")),c="<"+p+">"+g+"</"+p+">"):s[8]?c='<img src="'+r$2(s[8])+'" alt="'+r$2(s[7])+'">':s[10]?(m=m.replace("<a>",'<a href="'+r$2(s[11]||i[l.toLowerCase()])+'">'),c=$()+"</a>"):s[18]&&/^(https?|mailto):/.test(s[18])?c='<a href="'+r$2(s[18])+'">'+r$2(s[18])+"</a>":s[9]?c="<a>":s[12]||s[14]?c="<"+(p="h"+(s[14]?s[14].length:s[13]>"="?1:2))+">"+t$2(s[12]||s[15],i)+"</"+p+">":s[16]?c="<code>"+r$2(s[16])+"</code>":(s[17]||s[1])&&(c=d(s[17]||"--"))),m+=l,m+=c;return (m+a.substring(f)+$()).replace(/^\n+|\n+$/g,"")}

  var classnames = {exports: {}};

  /*!
    Copyright (c) 2018 Jed Watson.
    Licensed under the MIT License (MIT), see
    http://jedwatson.github.io/classnames
  */

  (function (module) {
  /* global define */

  (function () {

  	var hasOwn = {}.hasOwnProperty;

  	function classNames() {
  		var classes = [];

  		for (var i = 0; i < arguments.length; i++) {
  			var arg = arguments[i];
  			if (!arg) continue;

  			var argType = typeof arg;

  			if (argType === 'string' || argType === 'number') {
  				classes.push(arg);
  			} else if (Array.isArray(arg)) {
  				if (arg.length) {
  					var inner = classNames.apply(null, arg);
  					if (inner) {
  						classes.push(inner);
  					}
  				}
  			} else if (argType === 'object') {
  				if (arg.toString === Object.prototype.toString) {
  					for (var key in arg) {
  						if (hasOwn.call(arg, key) && arg[key]) {
  							classes.push(key);
  						}
  					}
  				} else {
  					classes.push(arg.toString());
  				}
  			}
  		}

  		return classes.join(' ');
  	}

  	if (module.exports) {
  		classNames.default = classNames;
  		module.exports = classNames;
  	} else {
  		window.classNames = classNames;
  	}
  }());
  }(classnames));

  var classNames = classnames.exports;

  var n$1,l$2,u$1,t$1,o$3,r$1,f$1,e$3={},c$1=[],s$1=/acit|ex(?:s|g|n|p|$)|rph|grid|ows|mnc|ntw|ine[ch]|zoo|^ord|itera/i;function a$2(n,l){for(var u in l)n[u]=l[u];return n}function h$1(n){var l=n.parentNode;l&&l.removeChild(n);}function v$1(l,u,i){var t,o,r,f={};for(r in u)"key"==r?t=u[r]:"ref"==r?o=u[r]:f[r]=u[r];if(arguments.length>2&&(f.children=arguments.length>3?n$1.call(arguments,2):i),"function"==typeof l&&null!=l.defaultProps)for(r in l.defaultProps)void 0===f[r]&&(f[r]=l.defaultProps[r]);return y$1(l,f,t,o,null)}function y$1(n,i,t,o,r){var f={type:n,props:i,key:t,ref:o,__k:null,__:null,__b:0,__e:null,__d:void 0,__c:null,__h:null,constructor:void 0,__v:null==r?++u$1:r};return null!=l$2.vnode&&l$2.vnode(f),f}function p$2(){return {current:null}}function d$1(n){return n.children}function _$1(n,l){this.props=n,this.context=l;}function k$2(n,l){if(null==l)return n.__?k$2(n.__,n.__.__k.indexOf(n)+1):null;for(var u;l<n.__k.length;l++)if(null!=(u=n.__k[l])&&null!=u.__e)return u.__e;return "function"==typeof n.type?k$2(n):null}function b$1(n){var l,u;if(null!=(n=n.__)&&null!=n.__c){for(n.__e=n.__c.base=null,l=0;l<n.__k.length;l++)if(null!=(u=n.__k[l])&&null!=u.__e){n.__e=n.__c.base=u.__e;break}return b$1(n)}}function m$1(n){(!n.__d&&(n.__d=!0)&&t$1.push(n)&&!g$2.__r++||r$1!==l$2.debounceRendering)&&((r$1=l$2.debounceRendering)||o$3)(g$2);}function g$2(){for(var n;g$2.__r=t$1.length;)n=t$1.sort(function(n,l){return n.__v.__b-l.__v.__b}),t$1=[],n.some(function(n){var l,u,i,t,o,r;n.__d&&(o=(t=(l=n).__v).__e,(r=l.__P)&&(u=[],(i=a$2({},t)).__v=t.__v+1,j$2(r,t,i,l.__n,void 0!==r.ownerSVGElement,null!=t.__h?[o]:null,u,null==o?k$2(t):o,t.__h),z$1(u,t),t.__e!=o&&b$1(t)));});}function w$2(n,l,u,i,t,o,r,f,s,a){var h,v,p,_,b,m,g,w=i&&i.__k||c$1,A=w.length;for(u.__k=[],h=0;h<l.length;h++)if(null!=(_=u.__k[h]=null==(_=l[h])||"boolean"==typeof _?null:"string"==typeof _||"number"==typeof _||"bigint"==typeof _?y$1(null,_,null,null,_):Array.isArray(_)?y$1(d$1,{children:_},null,null,null):_.__b>0?y$1(_.type,_.props,_.key,null,_.__v):_)){if(_.__=u,_.__b=u.__b+1,null===(p=w[h])||p&&_.key==p.key&&_.type===p.type)w[h]=void 0;else for(v=0;v<A;v++){if((p=w[v])&&_.key==p.key&&_.type===p.type){w[v]=void 0;break}p=null;}j$2(n,_,p=p||e$3,t,o,r,f,s,a),b=_.__e,(v=_.ref)&&p.ref!=v&&(g||(g=[]),p.ref&&g.push(p.ref,null,_),g.push(v,_.__c||b,_)),null!=b?(null==m&&(m=b),"function"==typeof _.type&&null!=_.__k&&_.__k===p.__k?_.__d=s=x$2(_,s,n):s=P$1(n,_,p,w,b,s),a||"option"!==u.type?"function"==typeof u.type&&(u.__d=s):n.value=""):s&&p.__e==s&&s.parentNode!=n&&(s=k$2(p));}for(u.__e=m,h=A;h--;)null!=w[h]&&("function"==typeof u.type&&null!=w[h].__e&&w[h].__e==u.__d&&(u.__d=k$2(i,h+1)),N$1(w[h],w[h]));if(g)for(h=0;h<g.length;h++)M$1(g[h],g[++h],g[++h]);}function x$2(n,l,u){var i,t;for(i=0;i<n.__k.length;i++)(t=n.__k[i])&&(t.__=n,l="function"==typeof t.type?x$2(t,l,u):P$1(u,t,t,n.__k,t.__e,l));return l}function A$2(n,l){return l=l||[],null==n||"boolean"==typeof n||(Array.isArray(n)?n.some(function(n){A$2(n,l);}):l.push(n)),l}function P$1(n,l,u,i,t,o){var r,f,e;if(void 0!==l.__d)r=l.__d,l.__d=void 0;else if(null==u||t!=o||null==t.parentNode)n:if(null==o||o.parentNode!==n)n.appendChild(t),r=null;else {for(f=o,e=0;(f=f.nextSibling)&&e<i.length;e+=2)if(f==t)break n;n.insertBefore(t,o),r=o;}return void 0!==r?r:t.nextSibling}function C$1(n,l,u,i,t){var o;for(o in u)"children"===o||"key"===o||o in l||H$1(n,o,null,u[o],i);for(o in l)t&&"function"!=typeof l[o]||"children"===o||"key"===o||"value"===o||"checked"===o||u[o]===l[o]||H$1(n,o,l[o],u[o],i);}function $$1(n,l,u){"-"===l[0]?n.setProperty(l,u):n[l]=null==u?"":"number"!=typeof u||s$1.test(l)?u:u+"px";}function H$1(n,l,u,i,t){var o;n:if("style"===l)if("string"==typeof u)n.style.cssText=u;else {if("string"==typeof i&&(n.style.cssText=i=""),i)for(l in i)u&&l in u||$$1(n.style,l,"");if(u)for(l in u)i&&u[l]===i[l]||$$1(n.style,l,u[l]);}else if("o"===l[0]&&"n"===l[1])o=l!==(l=l.replace(/Capture$/,"")),l=l.toLowerCase()in n?l.toLowerCase().slice(2):l.slice(2),n.l||(n.l={}),n.l[l+o]=u,u?i||n.addEventListener(l,o?T$2:I$1,o):n.removeEventListener(l,o?T$2:I$1,o);else if("dangerouslySetInnerHTML"!==l){if(t)l=l.replace(/xlink[H:h]/,"h").replace(/sName$/,"s");else if("href"!==l&&"list"!==l&&"form"!==l&&"tabIndex"!==l&&"download"!==l&&l in n)try{n[l]=null==u?"":u;break n}catch(n){}"function"==typeof u||(null!=u&&(!1!==u||"a"===l[0]&&"r"===l[1])?n.setAttribute(l,u):n.removeAttribute(l));}}function I$1(n){this.l[n.type+!1](l$2.event?l$2.event(n):n);}function T$2(n){this.l[n.type+!0](l$2.event?l$2.event(n):n);}function j$2(n,u,i,t,o,r,f,e,c){var s,h,v,y,p,k,b,m,g,x,A,P=u.type;if(void 0!==u.constructor)return null;null!=i.__h&&(c=i.__h,e=u.__e=i.__e,u.__h=null,r=[e]),(s=l$2.__b)&&s(u);try{n:if("function"==typeof P){if(m=u.props,g=(s=P.contextType)&&t[s.__c],x=s?g?g.props.value:s.__:t,i.__c?b=(h=u.__c=i.__c).__=h.__E:("prototype"in P&&P.prototype.render?u.__c=h=new P(m,x):(u.__c=h=new _$1(m,x),h.constructor=P,h.render=O$1),g&&g.sub(h),h.props=m,h.state||(h.state={}),h.context=x,h.__n=t,v=h.__d=!0,h.__h=[]),null==h.__s&&(h.__s=h.state),null!=P.getDerivedStateFromProps&&(h.__s==h.state&&(h.__s=a$2({},h.__s)),a$2(h.__s,P.getDerivedStateFromProps(m,h.__s))),y=h.props,p=h.state,v)null==P.getDerivedStateFromProps&&null!=h.componentWillMount&&h.componentWillMount(),null!=h.componentDidMount&&h.__h.push(h.componentDidMount);else {if(null==P.getDerivedStateFromProps&&m!==y&&null!=h.componentWillReceiveProps&&h.componentWillReceiveProps(m,x),!h.__e&&null!=h.shouldComponentUpdate&&!1===h.shouldComponentUpdate(m,h.__s,x)||u.__v===i.__v){h.props=m,h.state=h.__s,u.__v!==i.__v&&(h.__d=!1),h.__v=u,u.__e=i.__e,u.__k=i.__k,u.__k.forEach(function(n){n&&(n.__=u);}),h.__h.length&&f.push(h);break n}null!=h.componentWillUpdate&&h.componentWillUpdate(m,h.__s,x),null!=h.componentDidUpdate&&h.__h.push(function(){h.componentDidUpdate(y,p,k);});}h.context=x,h.props=m,h.state=h.__s,(s=l$2.__r)&&s(u),h.__d=!1,h.__v=u,h.__P=n,s=h.render(h.props,h.state,h.context),h.state=h.__s,null!=h.getChildContext&&(t=a$2(a$2({},t),h.getChildContext())),v||null==h.getSnapshotBeforeUpdate||(k=h.getSnapshotBeforeUpdate(y,p)),A=null!=s&&s.type===d$1&&null==s.key?s.props.children:s,w$2(n,Array.isArray(A)?A:[A],u,i,t,o,r,f,e,c),h.base=u.__e,u.__h=null,h.__h.length&&f.push(h),b&&(h.__E=h.__=null),h.__e=!1;}else null==r&&u.__v===i.__v?(u.__k=i.__k,u.__e=i.__e):u.__e=L$1(i.__e,u,i,t,o,r,f,c);(s=l$2.diffed)&&s(u);}catch(n){u.__v=null,(c||null!=r)&&(u.__e=e,u.__h=!!c,r[r.indexOf(e)]=null),l$2.__e(n,u,i);}}function z$1(n,u){l$2.__c&&l$2.__c(u,n),n.some(function(u){try{n=u.__h,u.__h=[],n.some(function(n){n.call(u);});}catch(n){l$2.__e(n,u.__v);}});}function L$1(l,u,i,t,o,r,f,c){var s,a,v,y=i.props,p=u.props,d=u.type,_=0;if("svg"===d&&(o=!0),null!=r)for(;_<r.length;_++)if((s=r[_])&&(s===l||(d?s.localName==d:3==s.nodeType))){l=s,r[_]=null;break}if(null==l){if(null===d)return document.createTextNode(p);l=o?document.createElementNS("http://www.w3.org/2000/svg",d):document.createElement(d,p.is&&p),r=null,c=!1;}if(null===d)y===p||c&&l.data===p||(l.data=p);else {if(r=r&&n$1.call(l.childNodes),a=(y=i.props||e$3).dangerouslySetInnerHTML,v=p.dangerouslySetInnerHTML,!c){if(null!=r)for(y={},_=0;_<l.attributes.length;_++)y[l.attributes[_].name]=l.attributes[_].value;(v||a)&&(v&&(a&&v.__html==a.__html||v.__html===l.innerHTML)||(l.innerHTML=v&&v.__html||""));}if(C$1(l,p,y,o,c),v)u.__k=[];else if(_=u.props.children,w$2(l,Array.isArray(_)?_:[_],u,i,t,o&&"foreignObject"!==d,r,f,r?r[0]:i.__k&&k$2(i,0),c),null!=r)for(_=r.length;_--;)null!=r[_]&&h$1(r[_]);c||("value"in p&&void 0!==(_=p.value)&&(_!==l.value||"progress"===d&&!_)&&H$1(l,"value",_,y.value,!1),"checked"in p&&void 0!==(_=p.checked)&&_!==l.checked&&H$1(l,"checked",_,y.checked,!1));}return l}function M$1(n,u,i){try{"function"==typeof n?n(u):n.current=u;}catch(n){l$2.__e(n,i);}}function N$1(n,u,i){var t,o;if(l$2.unmount&&l$2.unmount(n),(t=n.ref)&&(t.current&&t.current!==n.__e||M$1(t,null,u)),null!=(t=n.__c)){if(t.componentWillUnmount)try{t.componentWillUnmount();}catch(n){l$2.__e(n,u);}t.base=t.__P=null;}if(t=n.__k)for(o=0;o<t.length;o++)t[o]&&N$1(t[o],u,"function"!=typeof n.type);i||null==n.__e||h$1(n.__e),n.__e=n.__d=void 0;}function O$1(n,l,u){return this.constructor(n,u)}function S$1(u,i,t){var o,r,f;l$2.__&&l$2.__(u,i),r=(o="function"==typeof t)?null:t&&t.__k||i.__k,f=[],j$2(i,u=(!o&&t||i).__k=v$1(d$1,null,[u]),r||e$3,e$3,void 0!==i.ownerSVGElement,!o&&t?[t]:r?null:i.firstChild?n$1.call(i.childNodes):null,f,!o&&t?t:r?r.__e:i.firstChild,o),z$1(f,u);}function q$1(n,l){S$1(n,l,q$1);}function B$1(l,u,i){var t,o,r,f=a$2({},l.props);for(r in u)"key"==r?t=u[r]:"ref"==r?o=u[r]:f[r]=u[r];return arguments.length>2&&(f.children=arguments.length>3?n$1.call(arguments,2):i),y$1(l.type,f,t||l.key,o||l.ref,null)}function D$1(n,l){var u={__c:l="__cC"+f$1++,__:n,Consumer:function(n,l){return n.children(l)},Provider:function(n){var u,i;return this.getChildContext||(u=[],(i={})[l]=this,this.getChildContext=function(){return i},this.shouldComponentUpdate=function(n){this.props.value!==n.value&&u.some(m$1);},this.sub=function(n){u.push(n);var l=n.componentWillUnmount;n.componentWillUnmount=function(){u.splice(u.indexOf(n),1),l&&l.call(n);};}),n.children}};return u.Provider.__=u.Consumer.contextType=u}n$1=c$1.slice,l$2={__e:function(n,l){for(var u,i,t;l=l.__;)if((u=l.__c)&&!u.__)try{if((i=u.constructor)&&null!=i.getDerivedStateFromError&&(u.setState(i.getDerivedStateFromError(n)),t=u.__d),null!=u.componentDidCatch&&(u.componentDidCatch(n),t=u.__d),t)return u.__E=u}catch(l){n=l;}throw n}},u$1=0,_$1.prototype.setState=function(n,l){var u;u=null!=this.__s&&this.__s!==this.state?this.__s:this.__s=a$2({},this.state),"function"==typeof n&&(n=n(a$2({},u),this.props)),n&&a$2(u,n),null!=n&&this.__v&&(l&&this.__h.push(l),m$1(this));},_$1.prototype.forceUpdate=function(n){this.__v&&(this.__e=!0,n&&this.__h.push(n),m$1(this));},_$1.prototype.render=d$1,t$1=[],o$3="function"==typeof Promise?Promise.prototype.then.bind(Promise.resolve()):setTimeout,g$2.__r=0,f$1=0;

  var o$2=0;function e$2(_,e,n,t,f){var l,s,u={};for(s in e)"ref"==s?l=e[s]:u[s]=e[s];var a={type:_,props:u,key:n,ref:l,__k:null,__:null,__b:0,__e:null,__d:void 0,__c:null,__h:null,constructor:void 0,__v:--o$2,__source:t,__self:f};if("function"==typeof _&&(l=_.defaultProps))for(s in l)void 0===u[s]&&(u[s]=l[s]);return l$2.vnode&&l$2.vnode(a),a}

  var t,u,r,o$1=0,i$1=[],c=l$2.__b,f=l$2.__r,e$1=l$2.diffed,a$1=l$2.__c,v=l$2.unmount;function m(t,r){l$2.__h&&l$2.__h(u,t,o$1||r),o$1=0;var i=u.__H||(u.__H={__:[],__h:[]});return t>=i.__.length&&i.__.push({}),i.__[t]}function l$1(n){return o$1=1,p$1(w$1,n)}function p$1(n,r,o){var i=m(t++,2);return i.t=n,i.__c||(i.__=[o?o(r):w$1(void 0,r),function(n){var t=i.t(i.__[0],n);i.__[0]!==t&&(i.__=[t,i.__[1]],i.__c.setState({}));}],i.__c=u),i.__}function y(r,o){var i=m(t++,3);!l$2.__s&&k$1(i.__H,o)&&(i.__=r,i.__H=o,u.__H.__h.push(i));}function h(r,o){var i=m(t++,4);!l$2.__s&&k$1(i.__H,o)&&(i.__=r,i.__H=o,u.__h.push(i));}function s(n){return o$1=5,d(function(){return {current:n}},[])}function _(n,t,u){o$1=6,h(function(){"function"==typeof n?n(t()):n&&(n.current=t());},null==u?u:u.concat(n));}function d(n,u){var r=m(t++,7);return k$1(r.__H,u)&&(r.__=n(),r.__H=u,r.__h=n),r.__}function A$1(n,t){return o$1=8,d(function(){return n},t)}function F$1(n){var r=u.context[n.__c],o=m(t++,9);return o.c=n,r?(null==o.__&&(o.__=!0,r.sub(u)),r.props.value):n.__}function T$1(t,u){l$2.useDebugValue&&l$2.useDebugValue(u?u(t):t);}function x$1(){i$1.forEach(function(t){if(t.__P)try{t.__H.__h.forEach(g$1),t.__H.__h.forEach(j$1),t.__H.__h=[];}catch(u){t.__H.__h=[],l$2.__e(u,t.__v);}}),i$1=[];}l$2.__b=function(n){u=null,c&&c(n);},l$2.__r=function(n){f&&f(n),t=0;var r=(u=n.__c).__H;r&&(r.__h.forEach(g$1),r.__h.forEach(j$1),r.__h=[]);},l$2.diffed=function(t){e$1&&e$1(t);var o=t.__c;o&&o.__H&&o.__H.__h.length&&(1!==i$1.push(o)&&r===l$2.requestAnimationFrame||((r=l$2.requestAnimationFrame)||function(n){var t,u=function(){clearTimeout(r),b&&cancelAnimationFrame(t),setTimeout(n);},r=setTimeout(u,100);b&&(t=requestAnimationFrame(u));})(x$1)),u=void 0;},l$2.__c=function(t,u){u.some(function(t){try{t.__h.forEach(g$1),t.__h=t.__h.filter(function(n){return !n.__||j$1(n)});}catch(r){u.some(function(n){n.__h&&(n.__h=[]);}),u=[],l$2.__e(r,t.__v);}}),a$1&&a$1(t,u);},l$2.unmount=function(t){v&&v(t);var u=t.__c;if(u&&u.__H)try{u.__H.__.forEach(g$1);}catch(t){l$2.__e(t,u.__v);}};var b="function"==typeof requestAnimationFrame;function g$1(n){var t=u;"function"==typeof n.__c&&n.__c(),u=t;}function j$1(n){var t=u;n.__c=n.__(),u=t;}function k$1(n,t){return !n||n.length!==t.length||t.some(function(t,u){return t!==n[u]})}function w$1(n,t){return "function"==typeof t?t(n):t}

  function S(n,t){for(var e in t)n[e]=t[e];return n}function C(n,t){for(var e in n)if("__source"!==e&&!(e in t))return !0;for(var r in t)if("__source"!==r&&n[r]!==t[r])return !0;return !1}function E(n){this.props=n;}function g(n,t){function e(n){var e=this.props.ref,r=e==n.ref;return !r&&e&&(e.call?e(null):e.current=null),t?!t(this.props,n)||!r:C(this.props,n)}function r(t){return this.shouldComponentUpdate=e,v$1(n,t)}return r.displayName="Memo("+(n.displayName||n.name)+")",r.prototype.isReactComponent=!0,r.__f=!0,r}(E.prototype=new _$1).isPureReactComponent=!0,E.prototype.shouldComponentUpdate=function(n,t){return C(this.props,n)||C(this.state,t)};var w=l$2.__b;l$2.__b=function(n){n.type&&n.type.__f&&n.ref&&(n.props.ref=n.ref,n.ref=null),w&&w(n);};var R="undefined"!=typeof Symbol&&Symbol.for&&Symbol.for("react.forward_ref")||3911;function x(n){function t(t,e){var r=S({},t);return delete r.ref,n(r,(e=t.ref||e)&&("object"!=typeof e||"current"in e)?e:null)}return t.$$typeof=R,t.render=t,t.prototype.isReactComponent=t.__f=!0,t.displayName="ForwardRef("+(n.displayName||n.name)+")",t}var N=function(n,t){return null==n?null:A$2(A$2(n).map(t))},k={map:N,forEach:N,count:function(n){return n?A$2(n).length:0},only:function(n){var t=A$2(n);if(1!==t.length)throw "Children.only";return t[0]},toArray:A$2},A=l$2.__e;l$2.__e=function(n,t,e){if(n.then)for(var r,u=t;u=u.__;)if((r=u.__c)&&r.__c)return null==t.__e&&(t.__e=e.__e,t.__k=e.__k),r.__c(n,t);A(n,t,e);};var O=l$2.unmount;function L(){this.__u=0,this.t=null,this.__b=null;}function U(n){var t=n.__.__c;return t&&t.__e&&t.__e(n)}function F(n){var t,e,r;function u(u){if(t||(t=n()).then(function(n){e=n.default||n;},function(n){r=n;}),r)throw r;if(!e)throw t;return v$1(e,u)}return u.displayName="Lazy",u.__f=!0,u}function M(){this.u=null,this.o=null;}l$2.unmount=function(n){var t=n.__c;t&&t.__R&&t.__R(),t&&!0===n.__h&&(n.type=null),O&&O(n);},(L.prototype=new _$1).__c=function(n,t){var e=t.__c,r=this;null==r.t&&(r.t=[]),r.t.push(e);var u=U(r.__v),o=!1,i=function(){o||(o=!0,e.__R=null,u?u(l):l());};e.__R=i;var l=function(){if(!--r.__u){if(r.state.__e){var n=r.state.__e;r.__v.__k[0]=function n(t,e,r){return t&&(t.__v=null,t.__k=t.__k&&t.__k.map(function(t){return n(t,e,r)}),t.__c&&t.__c.__P===e&&(t.__e&&r.insertBefore(t.__e,t.__d),t.__c.__e=!0,t.__c.__P=r)),t}(n,n.__c.__P,n.__c.__O);}var t;for(r.setState({__e:r.__b=null});t=r.t.pop();)t.forceUpdate();}},f=!0===t.__h;r.__u++||f||r.setState({__e:r.__b=r.__v.__k[0]}),n.then(i,i);},L.prototype.componentWillUnmount=function(){this.t=[];},L.prototype.render=function(n,t){if(this.__b){if(this.__v.__k){var e=document.createElement("div"),r=this.__v.__k[0].__c;this.__v.__k[0]=function n(t,e,r){return t&&(t.__c&&t.__c.__H&&(t.__c.__H.__.forEach(function(n){"function"==typeof n.__c&&n.__c();}),t.__c.__H=null),null!=(t=S({},t)).__c&&(t.__c.__P===r&&(t.__c.__P=e),t.__c=null),t.__k=t.__k&&t.__k.map(function(t){return n(t,e,r)})),t}(this.__b,e,r.__O=r.__P);}this.__b=null;}var u=t.__e&&v$1(d$1,null,n.fallback);return u&&(u.__h=null),[v$1(d$1,null,t.__e?null:n.children),u]};var T=function(n,t,e){if(++e[1]===e[0]&&n.o.delete(t),n.props.revealOrder&&("t"!==n.props.revealOrder[0]||!n.o.size))for(e=n.u;e;){for(;e.length>3;)e.pop()();if(e[1]<e[0])break;n.u=e=e[2];}};function D(n){return this.getChildContext=function(){return n.context},n.children}function I(n){var t=this,e=n.i;t.componentWillUnmount=function(){S$1(null,t.l),t.l=null,t.i=null;},t.i&&t.i!==e&&t.componentWillUnmount(),n.__v?(t.l||(t.i=e,t.l={nodeType:1,parentNode:e,childNodes:[],appendChild:function(n){this.childNodes.push(n),t.i.appendChild(n);},insertBefore:function(n,e){this.childNodes.push(n),t.i.appendChild(n);},removeChild:function(n){this.childNodes.splice(this.childNodes.indexOf(n)>>>1,1),t.i.removeChild(n);}}),S$1(v$1(D,{context:t.context},n.__v),t.l)):t.l&&t.componentWillUnmount();}function W(n,t){return v$1(I,{__v:n,i:t})}(M.prototype=new _$1).__e=function(n){var t=this,e=U(t.__v),r=t.o.get(n);return r[0]++,function(u){var o=function(){t.props.revealOrder?(r.push(u),T(t,n,r)):u();};e?e(o):o();}},M.prototype.render=function(n){this.u=null,this.o=new Map;var t=A$2(n.children);n.revealOrder&&"b"===n.revealOrder[0]&&t.reverse();for(var e=t.length;e--;)this.o.set(t[e],this.u=[1,0,this.u]);return n.children},M.prototype.componentDidUpdate=M.prototype.componentDidMount=function(){var n=this;this.o.forEach(function(t,e){T(n,e,t);});};var j="undefined"!=typeof Symbol&&Symbol.for&&Symbol.for("react.element")||60103,P=/^(?:accent|alignment|arabic|baseline|cap|clip(?!PathU)|color|fill|flood|font|glyph(?!R)|horiz|marker(?!H|W|U)|overline|paint|stop|strikethrough|stroke|text(?!L)|underline|unicode|units|v|vector|vert|word|writing|x(?!C))[A-Z]/,V=function(n){return ("undefined"!=typeof Symbol&&"symbol"==typeof Symbol()?/fil|che|rad/i:/fil|che|ra/i).test(n)};function z(n,t,e){return null==t.__k&&(t.textContent=""),S$1(n,t),"function"==typeof e&&e(),n?n.__c:null}function B(n,t,e){return q$1(n,t),"function"==typeof e&&e(),n?n.__c:null}_$1.prototype.isReactComponent={},["componentWillMount","componentWillReceiveProps","componentWillUpdate"].forEach(function(n){Object.defineProperty(_$1.prototype,n,{configurable:!0,get:function(){return this["UNSAFE_"+n]},set:function(t){Object.defineProperty(this,n,{configurable:!0,writable:!0,value:t});}});});var H=l$2.event;function Z(){}function Y(){return this.cancelBubble}function $(){return this.defaultPrevented}l$2.event=function(n){return H&&(n=H(n)),n.persist=Z,n.isPropagationStopped=Y,n.isDefaultPrevented=$,n.nativeEvent=n};var q,G={configurable:!0,get:function(){return this.class}},J=l$2.vnode;l$2.vnode=function(n){var t=n.type,e=n.props,r=e;if("string"==typeof t){for(var u in r={},e){var o=e[u];"value"===u&&"defaultValue"in e&&null==o||("defaultValue"===u&&"value"in e&&null==e.value?u="value":"download"===u&&!0===o?o="":/ondoubleclick/i.test(u)?u="ondblclick":/^onchange(textarea|input)/i.test(u+t)&&!V(e.type)?u="oninput":/^on(Ani|Tra|Tou|BeforeInp)/.test(u)?u=u.toLowerCase():P.test(u)?u=u.replace(/[A-Z0-9]/,"-$&").toLowerCase():null===o&&(o=void 0),r[u]=o);}"select"==t&&r.multiple&&Array.isArray(r.value)&&(r.value=A$2(e.children).forEach(function(n){n.props.selected=-1!=r.value.indexOf(n.props.value);})),"select"==t&&null!=r.defaultValue&&(r.value=A$2(e.children).forEach(function(n){n.props.selected=r.multiple?-1!=r.defaultValue.indexOf(n.props.value):r.defaultValue==n.props.value;})),n.props=r;}t&&e.class!=e.className&&(G.enumerable="className"in e,null!=e.className&&(r.class=e.className),Object.defineProperty(r,"className",G)),n.$$typeof=j,J&&J(n);};var K=l$2.__r;l$2.__r=function(n){K&&K(n),q=n.__c;};var Q={ReactCurrentDispatcher:{current:{readContext:function(n){return q.__n[n.__c].props.value}}}};function nn(n){return v$1.bind(null,n)}function tn(n){return !!n&&n.$$typeof===j}function en(n){return tn(n)?B$1.apply(null,arguments):n}function rn(n){return !!n.__k&&(S$1(null,n),!0)}function un(n){return n&&(n.base||1===n.nodeType&&n)||null}var on=function(n,t){return n(t)},ln=function(n,t){return n(t)};var React = {useState:l$1,useReducer:p$1,useEffect:y,useLayoutEffect:h,useRef:s,useImperativeHandle:_,useMemo:d,useCallback:A$1,useContext:F$1,useDebugValue:T$1,version:"17.0.2",Children:k,render:z,hydrate:B,unmountComponentAtNode:rn,createPortal:W,createElement:v$1,createContext:D$1,createFactory:nn,cloneElement:en,createRef:p$2,Fragment:d$1,isValidElement:tn,findDOMNode:un,Component:_$1,PureComponent:E,memo:g,forwardRef:x,flushSync:ln,unstable_batchedUpdates:on,StrictMode:d$1,Suspense:L,SuspenseList:M,lazy:F,__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED:Q};

  var HOOKS = [
      "onChange",
      "onClose",
      "onDayCreate",
      "onDestroy",
      "onKeyDown",
      "onMonthChange",
      "onOpen",
      "onParseConfig",
      "onReady",
      "onValueUpdate",
      "onYearChange",
      "onPreCalendarPosition",
  ];
  var defaults = {
      _disable: [],
      allowInput: false,
      allowInvalidPreload: false,
      altFormat: "F j, Y",
      altInput: false,
      altInputClass: "form-control input",
      animate: typeof window === "object" &&
          window.navigator.userAgent.indexOf("MSIE") === -1,
      ariaDateFormat: "F j, Y",
      autoFillDefaultTime: true,
      clickOpens: true,
      closeOnSelect: true,
      conjunction: ", ",
      dateFormat: "Y-m-d",
      defaultHour: 12,
      defaultMinute: 0,
      defaultSeconds: 0,
      disable: [],
      disableMobile: false,
      enableSeconds: false,
      enableTime: false,
      errorHandler: function (err) {
          return typeof console !== "undefined" && console.warn(err);
      },
      getWeek: function (givenDate) {
          var date = new Date(givenDate.getTime());
          date.setHours(0, 0, 0, 0);
          date.setDate(date.getDate() + 3 - ((date.getDay() + 6) % 7));
          var week1 = new Date(date.getFullYear(), 0, 4);
          return (1 +
              Math.round(((date.getTime() - week1.getTime()) / 86400000 -
                  3 +
                  ((week1.getDay() + 6) % 7)) /
                  7));
      },
      hourIncrement: 1,
      ignoredFocusElements: [],
      inline: false,
      locale: "default",
      minuteIncrement: 5,
      mode: "single",
      monthSelectorType: "dropdown",
      nextArrow: "<svg version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' viewBox='0 0 17 17'><g></g><path d='M13.207 8.472l-7.854 7.854-0.707-0.707 7.146-7.146-7.146-7.148 0.707-0.707 7.854 7.854z' /></svg>",
      noCalendar: false,
      now: new Date(),
      onChange: [],
      onClose: [],
      onDayCreate: [],
      onDestroy: [],
      onKeyDown: [],
      onMonthChange: [],
      onOpen: [],
      onParseConfig: [],
      onReady: [],
      onValueUpdate: [],
      onYearChange: [],
      onPreCalendarPosition: [],
      plugins: [],
      position: "auto",
      positionElement: undefined,
      prevArrow: "<svg version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' viewBox='0 0 17 17'><g></g><path d='M5.207 8.471l7.146 7.147-0.707 0.707-7.853-7.854 7.854-7.853 0.707 0.707-7.147 7.146z' /></svg>",
      shorthandCurrentMonth: false,
      showMonths: 1,
      static: false,
      time_24hr: false,
      weekNumbers: false,
      wrap: false,
  };

  var english = {
      weekdays: {
          shorthand: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
          longhand: [
              "Sunday",
              "Monday",
              "Tuesday",
              "Wednesday",
              "Thursday",
              "Friday",
              "Saturday",
          ],
      },
      months: {
          shorthand: [
              "Jan",
              "Feb",
              "Mar",
              "Apr",
              "May",
              "Jun",
              "Jul",
              "Aug",
              "Sep",
              "Oct",
              "Nov",
              "Dec",
          ],
          longhand: [
              "January",
              "February",
              "March",
              "April",
              "May",
              "June",
              "July",
              "August",
              "September",
              "October",
              "November",
              "December",
          ],
      },
      daysInMonth: [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31],
      firstDayOfWeek: 0,
      ordinal: function (nth) {
          var s = nth % 100;
          if (s > 3 && s < 21)
              return "th";
          switch (s % 10) {
              case 1:
                  return "st";
              case 2:
                  return "nd";
              case 3:
                  return "rd";
              default:
                  return "th";
          }
      },
      rangeSeparator: " to ",
      weekAbbreviation: "Wk",
      scrollTitle: "Scroll to increment",
      toggleTitle: "Click to toggle",
      amPM: ["AM", "PM"],
      yearAriaLabel: "Year",
      monthAriaLabel: "Month",
      hourAriaLabel: "Hour",
      minuteAriaLabel: "Minute",
      time_24hr: false,
  };

  var pad = function (number, length) {
      if (length === void 0) { length = 2; }
      return ("000" + number).slice(length * -1);
  };
  var int = function (bool) { return (bool === true ? 1 : 0); };
  function debounce(fn, wait) {
      var t;
      return function () {
          var _this = this;
          var args = arguments;
          clearTimeout(t);
          t = setTimeout(function () { return fn.apply(_this, args); }, wait);
      };
  }
  var arrayify = function (obj) {
      return obj instanceof Array ? obj : [obj];
  };

  function toggleClass(elem, className, bool) {
      if (bool === true)
          return elem.classList.add(className);
      elem.classList.remove(className);
  }
  function createElement(tag, className, content) {
      var e = window.document.createElement(tag);
      className = className || "";
      content = content || "";
      e.className = className;
      if (content !== undefined)
          e.textContent = content;
      return e;
  }
  function clearNode(node) {
      while (node.firstChild)
          node.removeChild(node.firstChild);
  }
  function findParent(node, condition) {
      if (condition(node))
          return node;
      else if (node.parentNode)
          return findParent(node.parentNode, condition);
      return undefined;
  }
  function createNumberInput(inputClassName, opts) {
      var wrapper = createElement("div", "numInputWrapper"), numInput = createElement("input", "numInput " + inputClassName), arrowUp = createElement("span", "arrowUp"), arrowDown = createElement("span", "arrowDown");
      if (navigator.userAgent.indexOf("MSIE 9.0") === -1) {
          numInput.type = "number";
      }
      else {
          numInput.type = "text";
          numInput.pattern = "\\d*";
      }
      if (opts !== undefined)
          for (var key in opts)
              numInput.setAttribute(key, opts[key]);
      wrapper.appendChild(numInput);
      wrapper.appendChild(arrowUp);
      wrapper.appendChild(arrowDown);
      return wrapper;
  }
  function getEventTarget(event) {
      try {
          if (typeof event.composedPath === "function") {
              var path = event.composedPath();
              return path[0];
          }
          return event.target;
      }
      catch (error) {
          return event.target;
      }
  }

  var doNothing = function () { return undefined; };
  var monthToStr = function (monthNumber, shorthand, locale) { return locale.months[shorthand ? "shorthand" : "longhand"][monthNumber]; };
  var revFormat = {
      D: doNothing,
      F: function (dateObj, monthName, locale) {
          dateObj.setMonth(locale.months.longhand.indexOf(monthName));
      },
      G: function (dateObj, hour) {
          dateObj.setHours((dateObj.getHours() >= 12 ? 12 : 0) + parseFloat(hour));
      },
      H: function (dateObj, hour) {
          dateObj.setHours(parseFloat(hour));
      },
      J: function (dateObj, day) {
          dateObj.setDate(parseFloat(day));
      },
      K: function (dateObj, amPM, locale) {
          dateObj.setHours((dateObj.getHours() % 12) +
              12 * int(new RegExp(locale.amPM[1], "i").test(amPM)));
      },
      M: function (dateObj, shortMonth, locale) {
          dateObj.setMonth(locale.months.shorthand.indexOf(shortMonth));
      },
      S: function (dateObj, seconds) {
          dateObj.setSeconds(parseFloat(seconds));
      },
      U: function (_, unixSeconds) { return new Date(parseFloat(unixSeconds) * 1000); },
      W: function (dateObj, weekNum, locale) {
          var weekNumber = parseInt(weekNum);
          var date = new Date(dateObj.getFullYear(), 0, 2 + (weekNumber - 1) * 7, 0, 0, 0, 0);
          date.setDate(date.getDate() - date.getDay() + locale.firstDayOfWeek);
          return date;
      },
      Y: function (dateObj, year) {
          dateObj.setFullYear(parseFloat(year));
      },
      Z: function (_, ISODate) { return new Date(ISODate); },
      d: function (dateObj, day) {
          dateObj.setDate(parseFloat(day));
      },
      h: function (dateObj, hour) {
          dateObj.setHours((dateObj.getHours() >= 12 ? 12 : 0) + parseFloat(hour));
      },
      i: function (dateObj, minutes) {
          dateObj.setMinutes(parseFloat(minutes));
      },
      j: function (dateObj, day) {
          dateObj.setDate(parseFloat(day));
      },
      l: doNothing,
      m: function (dateObj, month) {
          dateObj.setMonth(parseFloat(month) - 1);
      },
      n: function (dateObj, month) {
          dateObj.setMonth(parseFloat(month) - 1);
      },
      s: function (dateObj, seconds) {
          dateObj.setSeconds(parseFloat(seconds));
      },
      u: function (_, unixMillSeconds) {
          return new Date(parseFloat(unixMillSeconds));
      },
      w: doNothing,
      y: function (dateObj, year) {
          dateObj.setFullYear(2000 + parseFloat(year));
      },
  };
  var tokenRegex = {
      D: "",
      F: "",
      G: "(\\d\\d|\\d)",
      H: "(\\d\\d|\\d)",
      J: "(\\d\\d|\\d)\\w+",
      K: "",
      M: "",
      S: "(\\d\\d|\\d)",
      U: "(.+)",
      W: "(\\d\\d|\\d)",
      Y: "(\\d{4})",
      Z: "(.+)",
      d: "(\\d\\d|\\d)",
      h: "(\\d\\d|\\d)",
      i: "(\\d\\d|\\d)",
      j: "(\\d\\d|\\d)",
      l: "",
      m: "(\\d\\d|\\d)",
      n: "(\\d\\d|\\d)",
      s: "(\\d\\d|\\d)",
      u: "(.+)",
      w: "(\\d\\d|\\d)",
      y: "(\\d{2})",
  };
  var formats = {
      Z: function (date) { return date.toISOString(); },
      D: function (date, locale, options) {
          return locale.weekdays.shorthand[formats.w(date, locale, options)];
      },
      F: function (date, locale, options) {
          return monthToStr(formats.n(date, locale, options) - 1, false, locale);
      },
      G: function (date, locale, options) {
          return pad(formats.h(date, locale, options));
      },
      H: function (date) { return pad(date.getHours()); },
      J: function (date, locale) {
          return locale.ordinal !== undefined
              ? date.getDate() + locale.ordinal(date.getDate())
              : date.getDate();
      },
      K: function (date, locale) { return locale.amPM[int(date.getHours() > 11)]; },
      M: function (date, locale) {
          return monthToStr(date.getMonth(), true, locale);
      },
      S: function (date) { return pad(date.getSeconds()); },
      U: function (date) { return date.getTime() / 1000; },
      W: function (date, _, options) {
          return options.getWeek(date);
      },
      Y: function (date) { return pad(date.getFullYear(), 4); },
      d: function (date) { return pad(date.getDate()); },
      h: function (date) { return (date.getHours() % 12 ? date.getHours() % 12 : 12); },
      i: function (date) { return pad(date.getMinutes()); },
      j: function (date) { return date.getDate(); },
      l: function (date, locale) {
          return locale.weekdays.longhand[date.getDay()];
      },
      m: function (date) { return pad(date.getMonth() + 1); },
      n: function (date) { return date.getMonth() + 1; },
      s: function (date) { return date.getSeconds(); },
      u: function (date) { return date.getTime(); },
      w: function (date) { return date.getDay(); },
      y: function (date) { return String(date.getFullYear()).substring(2); },
  };

  var createDateFormatter = function (_a) {
      var _b = _a.config, config = _b === void 0 ? defaults : _b, _c = _a.l10n, l10n = _c === void 0 ? english : _c, _d = _a.isMobile, isMobile = _d === void 0 ? false : _d;
      return function (dateObj, frmt, overrideLocale) {
          var locale = overrideLocale || l10n;
          if (config.formatDate !== undefined && !isMobile) {
              return config.formatDate(dateObj, frmt, locale);
          }
          return frmt
              .split("")
              .map(function (c, i, arr) {
              return formats[c] && arr[i - 1] !== "\\"
                  ? formats[c](dateObj, locale, config)
                  : c !== "\\"
                      ? c
                      : "";
          })
              .join("");
      };
  };
  var createDateParser = function (_a) {
      var _b = _a.config, config = _b === void 0 ? defaults : _b, _c = _a.l10n, l10n = _c === void 0 ? english : _c;
      return function (date, givenFormat, timeless, customLocale) {
          if (date !== 0 && !date)
              return undefined;
          var locale = customLocale || l10n;
          var parsedDate;
          var dateOrig = date;
          if (date instanceof Date)
              parsedDate = new Date(date.getTime());
          else if (typeof date !== "string" &&
              date.toFixed !== undefined)
              parsedDate = new Date(date);
          else if (typeof date === "string") {
              var format = givenFormat || (config || defaults).dateFormat;
              var datestr = String(date).trim();
              if (datestr === "today") {
                  parsedDate = new Date();
                  timeless = true;
              }
              else if (config && config.parseDate) {
                  parsedDate = config.parseDate(date, format);
              }
              else if (/Z$/.test(datestr) ||
                  /GMT$/.test(datestr)) {
                  parsedDate = new Date(date);
              }
              else {
                  var matched = void 0, ops = [];
                  for (var i = 0, matchIndex = 0, regexStr = ""; i < format.length; i++) {
                      var token = format[i];
                      var isBackSlash = token === "\\";
                      var escaped = format[i - 1] === "\\" || isBackSlash;
                      if (tokenRegex[token] && !escaped) {
                          regexStr += tokenRegex[token];
                          var match = new RegExp(regexStr).exec(date);
                          if (match && (matched = true)) {
                              ops[token !== "Y" ? "push" : "unshift"]({
                                  fn: revFormat[token],
                                  val: match[++matchIndex],
                              });
                          }
                      }
                      else if (!isBackSlash)
                          regexStr += ".";
                  }
                  parsedDate =
                      !config || !config.noCalendar
                          ? new Date(new Date().getFullYear(), 0, 1, 0, 0, 0, 0)
                          : new Date(new Date().setHours(0, 0, 0, 0));
                  ops.forEach(function (_a) {
                      var fn = _a.fn, val = _a.val;
                      return (parsedDate = fn(parsedDate, val, locale) || parsedDate);
                  });
                  parsedDate = matched ? parsedDate : undefined;
              }
          }
          if (!(parsedDate instanceof Date && !isNaN(parsedDate.getTime()))) {
              config.errorHandler(new Error("Invalid date provided: " + dateOrig));
              return undefined;
          }
          if (timeless === true)
              parsedDate.setHours(0, 0, 0, 0);
          return parsedDate;
      };
  };
  function compareDates(date1, date2, timeless) {
      if (timeless === void 0) { timeless = true; }
      if (timeless !== false) {
          return (new Date(date1.getTime()).setHours(0, 0, 0, 0) -
              new Date(date2.getTime()).setHours(0, 0, 0, 0));
      }
      return date1.getTime() - date2.getTime();
  }
  var isBetween = function (ts, ts1, ts2) {
      return ts > Math.min(ts1, ts2) && ts < Math.max(ts1, ts2);
  };
  var calculateSecondsSinceMidnight = function (hours, minutes, seconds) {
      return hours * 3600 + minutes * 60 + seconds;
  };
  var parseSeconds = function (secondsSinceMidnight) {
      var hours = Math.floor(secondsSinceMidnight / 3600), minutes = (secondsSinceMidnight - hours * 3600) / 60;
      return [hours, minutes, secondsSinceMidnight - hours * 3600 - minutes * 60];
  };
  var duration = {
      DAY: 86400000,
  };
  function getDefaultHours(config) {
      var hours = config.defaultHour;
      var minutes = config.defaultMinute;
      var seconds = config.defaultSeconds;
      if (config.minDate !== undefined) {
          var minHour = config.minDate.getHours();
          var minMinutes = config.minDate.getMinutes();
          var minSeconds = config.minDate.getSeconds();
          if (hours < minHour) {
              hours = minHour;
          }
          if (hours === minHour && minutes < minMinutes) {
              minutes = minMinutes;
          }
          if (hours === minHour && minutes === minMinutes && seconds < minSeconds)
              seconds = config.minDate.getSeconds();
      }
      if (config.maxDate !== undefined) {
          var maxHr = config.maxDate.getHours();
          var maxMinutes = config.maxDate.getMinutes();
          hours = Math.min(hours, maxHr);
          if (hours === maxHr)
              minutes = Math.min(maxMinutes, minutes);
          if (hours === maxHr && minutes === maxMinutes)
              seconds = config.maxDate.getSeconds();
      }
      return { hours: hours, minutes: minutes, seconds: seconds };
  }

  if (typeof Object.assign !== "function") {
      Object.assign = function (target) {
          var args = [];
          for (var _i = 1; _i < arguments.length; _i++) {
              args[_i - 1] = arguments[_i];
          }
          if (!target) {
              throw TypeError("Cannot convert undefined or null to object");
          }
          var _loop_1 = function (source) {
              if (source) {
                  Object.keys(source).forEach(function (key) { return (target[key] = source[key]); });
              }
          };
          for (var _a = 0, args_1 = args; _a < args_1.length; _a++) {
              var source = args_1[_a];
              _loop_1(source);
          }
          return target;
      };
  }

  var __assign = (undefined && undefined.__assign) || function () {
      __assign = Object.assign || function(t) {
          for (var s, i = 1, n = arguments.length; i < n; i++) {
              s = arguments[i];
              for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                  t[p] = s[p];
          }
          return t;
      };
      return __assign.apply(this, arguments);
  };
  var __spreadArrays = (undefined && undefined.__spreadArrays) || function () {
      for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
      for (var r = Array(s), k = 0, i = 0; i < il; i++)
          for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
              r[k] = a[j];
      return r;
  };
  var DEBOUNCED_CHANGE_MS = 300;
  function FlatpickrInstance(element, instanceConfig) {
      var self = {
          config: __assign(__assign({}, defaults), flatpickr.defaultConfig),
          l10n: english,
      };
      self.parseDate = createDateParser({ config: self.config, l10n: self.l10n });
      self._handlers = [];
      self.pluginElements = [];
      self.loadedPlugins = [];
      self._bind = bind;
      self._setHoursFromDate = setHoursFromDate;
      self._positionCalendar = positionCalendar;
      self.changeMonth = changeMonth;
      self.changeYear = changeYear;
      self.clear = clear;
      self.close = close;
      self.onMouseOver = onMouseOver;
      self._createElement = createElement;
      self.createDay = createDay;
      self.destroy = destroy;
      self.isEnabled = isEnabled;
      self.jumpToDate = jumpToDate;
      self.updateValue = updateValue;
      self.open = open;
      self.redraw = redraw;
      self.set = set;
      self.setDate = setDate;
      self.toggle = toggle;
      function setupHelperFunctions() {
          self.utils = {
              getDaysInMonth: function (month, yr) {
                  if (month === void 0) { month = self.currentMonth; }
                  if (yr === void 0) { yr = self.currentYear; }
                  if (month === 1 && ((yr % 4 === 0 && yr % 100 !== 0) || yr % 400 === 0))
                      return 29;
                  return self.l10n.daysInMonth[month];
              },
          };
      }
      function init() {
          self.element = self.input = element;
          self.isOpen = false;
          parseConfig();
          setupLocale();
          setupInputs();
          setupDates();
          setupHelperFunctions();
          if (!self.isMobile)
              build();
          bindEvents();
          if (self.selectedDates.length || self.config.noCalendar) {
              if (self.config.enableTime) {
                  setHoursFromDate(self.config.noCalendar ? self.latestSelectedDateObj : undefined);
              }
              updateValue(false);
          }
          setCalendarWidth();
          var isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
          if (!self.isMobile && isSafari) {
              positionCalendar();
          }
          triggerEvent("onReady");
      }
      function getClosestActiveElement() {
          var _a;
          return (((_a = self.calendarContainer) === null || _a === void 0 ? void 0 : _a.getRootNode())
              .activeElement || document.activeElement);
      }
      function bindToInstance(fn) {
          return fn.bind(self);
      }
      function setCalendarWidth() {
          var config = self.config;
          if (config.weekNumbers === false && config.showMonths === 1) {
              return;
          }
          else if (config.noCalendar !== true) {
              window.requestAnimationFrame(function () {
                  if (self.calendarContainer !== undefined) {
                      self.calendarContainer.style.visibility = "hidden";
                      self.calendarContainer.style.display = "block";
                  }
                  if (self.daysContainer !== undefined) {
                      var daysWidth = (self.days.offsetWidth + 1) * config.showMonths;
                      self.daysContainer.style.width = daysWidth + "px";
                      self.calendarContainer.style.width =
                          daysWidth +
                              (self.weekWrapper !== undefined
                                  ? self.weekWrapper.offsetWidth
                                  : 0) +
                              "px";
                      self.calendarContainer.style.removeProperty("visibility");
                      self.calendarContainer.style.removeProperty("display");
                  }
              });
          }
      }
      function updateTime(e) {
          if (self.selectedDates.length === 0) {
              var defaultDate = self.config.minDate === undefined ||
                  compareDates(new Date(), self.config.minDate) >= 0
                  ? new Date()
                  : new Date(self.config.minDate.getTime());
              var defaults = getDefaultHours(self.config);
              defaultDate.setHours(defaults.hours, defaults.minutes, defaults.seconds, defaultDate.getMilliseconds());
              self.selectedDates = [defaultDate];
              self.latestSelectedDateObj = defaultDate;
          }
          if (e !== undefined && e.type !== "blur") {
              timeWrapper(e);
          }
          var prevValue = self._input.value;
          setHoursFromInputs();
          updateValue();
          if (self._input.value !== prevValue) {
              self._debouncedChange();
          }
      }
      function ampm2military(hour, amPM) {
          return (hour % 12) + 12 * int(amPM === self.l10n.amPM[1]);
      }
      function military2ampm(hour) {
          switch (hour % 24) {
              case 0:
              case 12:
                  return 12;
              default:
                  return hour % 12;
          }
      }
      function setHoursFromInputs() {
          if (self.hourElement === undefined || self.minuteElement === undefined)
              return;
          var hours = (parseInt(self.hourElement.value.slice(-2), 10) || 0) % 24, minutes = (parseInt(self.minuteElement.value, 10) || 0) % 60, seconds = self.secondElement !== undefined
              ? (parseInt(self.secondElement.value, 10) || 0) % 60
              : 0;
          if (self.amPM !== undefined) {
              hours = ampm2military(hours, self.amPM.textContent);
          }
          var limitMinHours = self.config.minTime !== undefined ||
              (self.config.minDate &&
                  self.minDateHasTime &&
                  self.latestSelectedDateObj &&
                  compareDates(self.latestSelectedDateObj, self.config.minDate, true) ===
                      0);
          var limitMaxHours = self.config.maxTime !== undefined ||
              (self.config.maxDate &&
                  self.maxDateHasTime &&
                  self.latestSelectedDateObj &&
                  compareDates(self.latestSelectedDateObj, self.config.maxDate, true) ===
                      0);
          if (self.config.maxTime !== undefined &&
              self.config.minTime !== undefined &&
              self.config.minTime > self.config.maxTime) {
              var minBound = calculateSecondsSinceMidnight(self.config.minTime.getHours(), self.config.minTime.getMinutes(), self.config.minTime.getSeconds());
              var maxBound = calculateSecondsSinceMidnight(self.config.maxTime.getHours(), self.config.maxTime.getMinutes(), self.config.maxTime.getSeconds());
              var currentTime = calculateSecondsSinceMidnight(hours, minutes, seconds);
              if (currentTime > maxBound && currentTime < minBound) {
                  var result = parseSeconds(minBound);
                  hours = result[0];
                  minutes = result[1];
                  seconds = result[2];
              }
          }
          else {
              if (limitMaxHours) {
                  var maxTime = self.config.maxTime !== undefined
                      ? self.config.maxTime
                      : self.config.maxDate;
                  hours = Math.min(hours, maxTime.getHours());
                  if (hours === maxTime.getHours())
                      minutes = Math.min(minutes, maxTime.getMinutes());
                  if (minutes === maxTime.getMinutes())
                      seconds = Math.min(seconds, maxTime.getSeconds());
              }
              if (limitMinHours) {
                  var minTime = self.config.minTime !== undefined
                      ? self.config.minTime
                      : self.config.minDate;
                  hours = Math.max(hours, minTime.getHours());
                  if (hours === minTime.getHours() && minutes < minTime.getMinutes())
                      minutes = minTime.getMinutes();
                  if (minutes === minTime.getMinutes())
                      seconds = Math.max(seconds, minTime.getSeconds());
              }
          }
          setHours(hours, minutes, seconds);
      }
      function setHoursFromDate(dateObj) {
          var date = dateObj || self.latestSelectedDateObj;
          if (date && date instanceof Date) {
              setHours(date.getHours(), date.getMinutes(), date.getSeconds());
          }
      }
      function setHours(hours, minutes, seconds) {
          if (self.latestSelectedDateObj !== undefined) {
              self.latestSelectedDateObj.setHours(hours % 24, minutes, seconds || 0, 0);
          }
          if (!self.hourElement || !self.minuteElement || self.isMobile)
              return;
          self.hourElement.value = pad(!self.config.time_24hr
              ? ((12 + hours) % 12) + 12 * int(hours % 12 === 0)
              : hours);
          self.minuteElement.value = pad(minutes);
          if (self.amPM !== undefined)
              self.amPM.textContent = self.l10n.amPM[int(hours >= 12)];
          if (self.secondElement !== undefined)
              self.secondElement.value = pad(seconds);
      }
      function onYearInput(event) {
          var eventTarget = getEventTarget(event);
          var year = parseInt(eventTarget.value) + (event.delta || 0);
          if (year / 1000 > 1 ||
              (event.key === "Enter" && !/[^\d]/.test(year.toString()))) {
              changeYear(year);
          }
      }
      function bind(element, event, handler, options) {
          if (event instanceof Array)
              return event.forEach(function (ev) { return bind(element, ev, handler, options); });
          if (element instanceof Array)
              return element.forEach(function (el) { return bind(el, event, handler, options); });
          element.addEventListener(event, handler, options);
          self._handlers.push({
              remove: function () { return element.removeEventListener(event, handler, options); },
          });
      }
      function triggerChange() {
          triggerEvent("onChange");
      }
      function bindEvents() {
          if (self.config.wrap) {
              ["open", "close", "toggle", "clear"].forEach(function (evt) {
                  Array.prototype.forEach.call(self.element.querySelectorAll("[data-" + evt + "]"), function (el) {
                      return bind(el, "click", self[evt]);
                  });
              });
          }
          if (self.isMobile) {
              setupMobile();
              return;
          }
          var debouncedResize = debounce(onResize, 50);
          self._debouncedChange = debounce(triggerChange, DEBOUNCED_CHANGE_MS);
          if (self.daysContainer && !/iPhone|iPad|iPod/i.test(navigator.userAgent))
              bind(self.daysContainer, "mouseover", function (e) {
                  if (self.config.mode === "range")
                      onMouseOver(getEventTarget(e));
              });
          bind(self._input, "keydown", onKeyDown);
          if (self.calendarContainer !== undefined) {
              bind(self.calendarContainer, "keydown", onKeyDown);
          }
          if (!self.config.inline && !self.config.static)
              bind(window, "resize", debouncedResize);
          if (window.ontouchstart !== undefined)
              bind(window.document, "touchstart", documentClick);
          else
              bind(window.document, "mousedown", documentClick);
          bind(window.document, "focus", documentClick, { capture: true });
          if (self.config.clickOpens === true) {
              bind(self._input, "focus", self.open);
              bind(self._input, "click", self.open);
          }
          if (self.daysContainer !== undefined) {
              bind(self.monthNav, "click", onMonthNavClick);
              bind(self.monthNav, ["keyup", "increment"], onYearInput);
              bind(self.daysContainer, "click", selectDate);
          }
          if (self.timeContainer !== undefined &&
              self.minuteElement !== undefined &&
              self.hourElement !== undefined) {
              var selText = function (e) {
                  return getEventTarget(e).select();
              };
              bind(self.timeContainer, ["increment"], updateTime);
              bind(self.timeContainer, "blur", updateTime, { capture: true });
              bind(self.timeContainer, "click", timeIncrement);
              bind([self.hourElement, self.minuteElement], ["focus", "click"], selText);
              if (self.secondElement !== undefined)
                  bind(self.secondElement, "focus", function () { return self.secondElement && self.secondElement.select(); });
              if (self.amPM !== undefined) {
                  bind(self.amPM, "click", function (e) {
                      updateTime(e);
                  });
              }
          }
          if (self.config.allowInput) {
              bind(self._input, "blur", onBlur);
          }
      }
      function jumpToDate(jumpDate, triggerChange) {
          var jumpTo = jumpDate !== undefined
              ? self.parseDate(jumpDate)
              : self.latestSelectedDateObj ||
                  (self.config.minDate && self.config.minDate > self.now
                      ? self.config.minDate
                      : self.config.maxDate && self.config.maxDate < self.now
                          ? self.config.maxDate
                          : self.now);
          var oldYear = self.currentYear;
          var oldMonth = self.currentMonth;
          try {
              if (jumpTo !== undefined) {
                  self.currentYear = jumpTo.getFullYear();
                  self.currentMonth = jumpTo.getMonth();
              }
          }
          catch (e) {
              e.message = "Invalid date supplied: " + jumpTo;
              self.config.errorHandler(e);
          }
          if (triggerChange && self.currentYear !== oldYear) {
              triggerEvent("onYearChange");
              buildMonthSwitch();
          }
          if (triggerChange &&
              (self.currentYear !== oldYear || self.currentMonth !== oldMonth)) {
              triggerEvent("onMonthChange");
          }
          self.redraw();
      }
      function timeIncrement(e) {
          var eventTarget = getEventTarget(e);
          if (~eventTarget.className.indexOf("arrow"))
              incrementNumInput(e, eventTarget.classList.contains("arrowUp") ? 1 : -1);
      }
      function incrementNumInput(e, delta, inputElem) {
          var target = e && getEventTarget(e);
          var input = inputElem ||
              (target && target.parentNode && target.parentNode.firstChild);
          var event = createEvent("increment");
          event.delta = delta;
          input && input.dispatchEvent(event);
      }
      function build() {
          var fragment = window.document.createDocumentFragment();
          self.calendarContainer = createElement("div", "flatpickr-calendar");
          self.calendarContainer.tabIndex = -1;
          if (!self.config.noCalendar) {
              fragment.appendChild(buildMonthNav());
              self.innerContainer = createElement("div", "flatpickr-innerContainer");
              if (self.config.weekNumbers) {
                  var _a = buildWeeks(), weekWrapper = _a.weekWrapper, weekNumbers = _a.weekNumbers;
                  self.innerContainer.appendChild(weekWrapper);
                  self.weekNumbers = weekNumbers;
                  self.weekWrapper = weekWrapper;
              }
              self.rContainer = createElement("div", "flatpickr-rContainer");
              self.rContainer.appendChild(buildWeekdays());
              if (!self.daysContainer) {
                  self.daysContainer = createElement("div", "flatpickr-days");
                  self.daysContainer.tabIndex = -1;
              }
              buildDays();
              self.rContainer.appendChild(self.daysContainer);
              self.innerContainer.appendChild(self.rContainer);
              fragment.appendChild(self.innerContainer);
          }
          if (self.config.enableTime) {
              fragment.appendChild(buildTime());
          }
          toggleClass(self.calendarContainer, "rangeMode", self.config.mode === "range");
          toggleClass(self.calendarContainer, "animate", self.config.animate === true);
          toggleClass(self.calendarContainer, "multiMonth", self.config.showMonths > 1);
          self.calendarContainer.appendChild(fragment);
          var customAppend = self.config.appendTo !== undefined &&
              self.config.appendTo.nodeType !== undefined;
          if (self.config.inline || self.config.static) {
              self.calendarContainer.classList.add(self.config.inline ? "inline" : "static");
              if (self.config.inline) {
                  if (!customAppend && self.element.parentNode)
                      self.element.parentNode.insertBefore(self.calendarContainer, self._input.nextSibling);
                  else if (self.config.appendTo !== undefined)
                      self.config.appendTo.appendChild(self.calendarContainer);
              }
              if (self.config.static) {
                  var wrapper = createElement("div", "flatpickr-wrapper");
                  if (self.element.parentNode)
                      self.element.parentNode.insertBefore(wrapper, self.element);
                  wrapper.appendChild(self.element);
                  if (self.altInput)
                      wrapper.appendChild(self.altInput);
                  wrapper.appendChild(self.calendarContainer);
              }
          }
          if (!self.config.static && !self.config.inline)
              (self.config.appendTo !== undefined
                  ? self.config.appendTo
                  : window.document.body).appendChild(self.calendarContainer);
      }
      function createDay(className, date, _dayNumber, i) {
          var dateIsEnabled = isEnabled(date, true), dayElement = createElement("span", className, date.getDate().toString());
          dayElement.dateObj = date;
          dayElement.$i = i;
          dayElement.setAttribute("aria-label", self.formatDate(date, self.config.ariaDateFormat));
          if (className.indexOf("hidden") === -1 &&
              compareDates(date, self.now) === 0) {
              self.todayDateElem = dayElement;
              dayElement.classList.add("today");
              dayElement.setAttribute("aria-current", "date");
          }
          if (dateIsEnabled) {
              dayElement.tabIndex = -1;
              if (isDateSelected(date)) {
                  dayElement.classList.add("selected");
                  self.selectedDateElem = dayElement;
                  if (self.config.mode === "range") {
                      toggleClass(dayElement, "startRange", self.selectedDates[0] &&
                          compareDates(date, self.selectedDates[0], true) === 0);
                      toggleClass(dayElement, "endRange", self.selectedDates[1] &&
                          compareDates(date, self.selectedDates[1], true) === 0);
                      if (className === "nextMonthDay")
                          dayElement.classList.add("inRange");
                  }
              }
          }
          else {
              dayElement.classList.add("flatpickr-disabled");
          }
          if (self.config.mode === "range") {
              if (isDateInRange(date) && !isDateSelected(date))
                  dayElement.classList.add("inRange");
          }
          if (self.weekNumbers &&
              self.config.showMonths === 1 &&
              className !== "prevMonthDay" &&
              i % 7 === 6) {
              self.weekNumbers.insertAdjacentHTML("beforeend", "<span class='flatpickr-day'>" + self.config.getWeek(date) + "</span>");
          }
          triggerEvent("onDayCreate", dayElement);
          return dayElement;
      }
      function focusOnDayElem(targetNode) {
          targetNode.focus();
          if (self.config.mode === "range")
              onMouseOver(targetNode);
      }
      function getFirstAvailableDay(delta) {
          var startMonth = delta > 0 ? 0 : self.config.showMonths - 1;
          var endMonth = delta > 0 ? self.config.showMonths : -1;
          for (var m = startMonth; m != endMonth; m += delta) {
              var month = self.daysContainer.children[m];
              var startIndex = delta > 0 ? 0 : month.children.length - 1;
              var endIndex = delta > 0 ? month.children.length : -1;
              for (var i = startIndex; i != endIndex; i += delta) {
                  var c = month.children[i];
                  if (c.className.indexOf("hidden") === -1 && isEnabled(c.dateObj))
                      return c;
              }
          }
          return undefined;
      }
      function getNextAvailableDay(current, delta) {
          var givenMonth = current.className.indexOf("Month") === -1
              ? current.dateObj.getMonth()
              : self.currentMonth;
          var endMonth = delta > 0 ? self.config.showMonths : -1;
          var loopDelta = delta > 0 ? 1 : -1;
          for (var m = givenMonth - self.currentMonth; m != endMonth; m += loopDelta) {
              var month = self.daysContainer.children[m];
              var startIndex = givenMonth - self.currentMonth === m
                  ? current.$i + delta
                  : delta < 0
                      ? month.children.length - 1
                      : 0;
              var numMonthDays = month.children.length;
              for (var i = startIndex; i >= 0 && i < numMonthDays && i != (delta > 0 ? numMonthDays : -1); i += loopDelta) {
                  var c = month.children[i];
                  if (c.className.indexOf("hidden") === -1 &&
                      isEnabled(c.dateObj) &&
                      Math.abs(current.$i - i) >= Math.abs(delta))
                      return focusOnDayElem(c);
              }
          }
          self.changeMonth(loopDelta);
          focusOnDay(getFirstAvailableDay(loopDelta), 0);
          return undefined;
      }
      function focusOnDay(current, offset) {
          var activeElement = getClosestActiveElement();
          var dayFocused = isInView(activeElement || document.body);
          var startElem = current !== undefined
              ? current
              : dayFocused
                  ? activeElement
                  : self.selectedDateElem !== undefined && isInView(self.selectedDateElem)
                      ? self.selectedDateElem
                      : self.todayDateElem !== undefined && isInView(self.todayDateElem)
                          ? self.todayDateElem
                          : getFirstAvailableDay(offset > 0 ? 1 : -1);
          if (startElem === undefined) {
              self._input.focus();
          }
          else if (!dayFocused) {
              focusOnDayElem(startElem);
          }
          else {
              getNextAvailableDay(startElem, offset);
          }
      }
      function buildMonthDays(year, month) {
          var firstOfMonth = (new Date(year, month, 1).getDay() - self.l10n.firstDayOfWeek + 7) % 7;
          var prevMonthDays = self.utils.getDaysInMonth((month - 1 + 12) % 12, year);
          var daysInMonth = self.utils.getDaysInMonth(month, year), days = window.document.createDocumentFragment(), isMultiMonth = self.config.showMonths > 1, prevMonthDayClass = isMultiMonth ? "prevMonthDay hidden" : "prevMonthDay", nextMonthDayClass = isMultiMonth ? "nextMonthDay hidden" : "nextMonthDay";
          var dayNumber = prevMonthDays + 1 - firstOfMonth, dayIndex = 0;
          for (; dayNumber <= prevMonthDays; dayNumber++, dayIndex++) {
              days.appendChild(createDay("flatpickr-day " + prevMonthDayClass, new Date(year, month - 1, dayNumber), dayNumber, dayIndex));
          }
          for (dayNumber = 1; dayNumber <= daysInMonth; dayNumber++, dayIndex++) {
              days.appendChild(createDay("flatpickr-day", new Date(year, month, dayNumber), dayNumber, dayIndex));
          }
          for (var dayNum = daysInMonth + 1; dayNum <= 42 - firstOfMonth &&
              (self.config.showMonths === 1 || dayIndex % 7 !== 0); dayNum++, dayIndex++) {
              days.appendChild(createDay("flatpickr-day " + nextMonthDayClass, new Date(year, month + 1, dayNum % daysInMonth), dayNum, dayIndex));
          }
          var dayContainer = createElement("div", "dayContainer");
          dayContainer.appendChild(days);
          return dayContainer;
      }
      function buildDays() {
          if (self.daysContainer === undefined) {
              return;
          }
          clearNode(self.daysContainer);
          if (self.weekNumbers)
              clearNode(self.weekNumbers);
          var frag = document.createDocumentFragment();
          for (var i = 0; i < self.config.showMonths; i++) {
              var d = new Date(self.currentYear, self.currentMonth, 1);
              d.setMonth(self.currentMonth + i);
              frag.appendChild(buildMonthDays(d.getFullYear(), d.getMonth()));
          }
          self.daysContainer.appendChild(frag);
          self.days = self.daysContainer.firstChild;
          if (self.config.mode === "range" && self.selectedDates.length === 1) {
              onMouseOver();
          }
      }
      function buildMonthSwitch() {
          if (self.config.showMonths > 1 ||
              self.config.monthSelectorType !== "dropdown")
              return;
          var shouldBuildMonth = function (month) {
              if (self.config.minDate !== undefined &&
                  self.currentYear === self.config.minDate.getFullYear() &&
                  month < self.config.minDate.getMonth()) {
                  return false;
              }
              return !(self.config.maxDate !== undefined &&
                  self.currentYear === self.config.maxDate.getFullYear() &&
                  month > self.config.maxDate.getMonth());
          };
          self.monthsDropdownContainer.tabIndex = -1;
          self.monthsDropdownContainer.innerHTML = "";
          for (var i = 0; i < 12; i++) {
              if (!shouldBuildMonth(i))
                  continue;
              var month = createElement("option", "flatpickr-monthDropdown-month");
              month.value = new Date(self.currentYear, i).getMonth().toString();
              month.textContent = monthToStr(i, self.config.shorthandCurrentMonth, self.l10n);
              month.tabIndex = -1;
              if (self.currentMonth === i) {
                  month.selected = true;
              }
              self.monthsDropdownContainer.appendChild(month);
          }
      }
      function buildMonth() {
          var container = createElement("div", "flatpickr-month");
          var monthNavFragment = window.document.createDocumentFragment();
          var monthElement;
          if (self.config.showMonths > 1 ||
              self.config.monthSelectorType === "static") {
              monthElement = createElement("span", "cur-month");
          }
          else {
              self.monthsDropdownContainer = createElement("select", "flatpickr-monthDropdown-months");
              self.monthsDropdownContainer.setAttribute("aria-label", self.l10n.monthAriaLabel);
              bind(self.monthsDropdownContainer, "change", function (e) {
                  var target = getEventTarget(e);
                  var selectedMonth = parseInt(target.value, 10);
                  self.changeMonth(selectedMonth - self.currentMonth);
                  triggerEvent("onMonthChange");
              });
              buildMonthSwitch();
              monthElement = self.monthsDropdownContainer;
          }
          var yearInput = createNumberInput("cur-year", { tabindex: "-1" });
          var yearElement = yearInput.getElementsByTagName("input")[0];
          yearElement.setAttribute("aria-label", self.l10n.yearAriaLabel);
          if (self.config.minDate) {
              yearElement.setAttribute("min", self.config.minDate.getFullYear().toString());
          }
          if (self.config.maxDate) {
              yearElement.setAttribute("max", self.config.maxDate.getFullYear().toString());
              yearElement.disabled =
                  !!self.config.minDate &&
                      self.config.minDate.getFullYear() === self.config.maxDate.getFullYear();
          }
          var currentMonth = createElement("div", "flatpickr-current-month");
          currentMonth.appendChild(monthElement);
          currentMonth.appendChild(yearInput);
          monthNavFragment.appendChild(currentMonth);
          container.appendChild(monthNavFragment);
          return {
              container: container,
              yearElement: yearElement,
              monthElement: monthElement,
          };
      }
      function buildMonths() {
          clearNode(self.monthNav);
          self.monthNav.appendChild(self.prevMonthNav);
          if (self.config.showMonths) {
              self.yearElements = [];
              self.monthElements = [];
          }
          for (var m = self.config.showMonths; m--;) {
              var month = buildMonth();
              self.yearElements.push(month.yearElement);
              self.monthElements.push(month.monthElement);
              self.monthNav.appendChild(month.container);
          }
          self.monthNav.appendChild(self.nextMonthNav);
      }
      function buildMonthNav() {
          self.monthNav = createElement("div", "flatpickr-months");
          self.yearElements = [];
          self.monthElements = [];
          self.prevMonthNav = createElement("span", "flatpickr-prev-month");
          self.prevMonthNav.innerHTML = self.config.prevArrow;
          self.nextMonthNav = createElement("span", "flatpickr-next-month");
          self.nextMonthNav.innerHTML = self.config.nextArrow;
          buildMonths();
          Object.defineProperty(self, "_hidePrevMonthArrow", {
              get: function () { return self.__hidePrevMonthArrow; },
              set: function (bool) {
                  if (self.__hidePrevMonthArrow !== bool) {
                      toggleClass(self.prevMonthNav, "flatpickr-disabled", bool);
                      self.__hidePrevMonthArrow = bool;
                  }
              },
          });
          Object.defineProperty(self, "_hideNextMonthArrow", {
              get: function () { return self.__hideNextMonthArrow; },
              set: function (bool) {
                  if (self.__hideNextMonthArrow !== bool) {
                      toggleClass(self.nextMonthNav, "flatpickr-disabled", bool);
                      self.__hideNextMonthArrow = bool;
                  }
              },
          });
          self.currentYearElement = self.yearElements[0];
          updateNavigationCurrentMonth();
          return self.monthNav;
      }
      function buildTime() {
          self.calendarContainer.classList.add("hasTime");
          if (self.config.noCalendar)
              self.calendarContainer.classList.add("noCalendar");
          var defaults = getDefaultHours(self.config);
          self.timeContainer = createElement("div", "flatpickr-time");
          self.timeContainer.tabIndex = -1;
          var separator = createElement("span", "flatpickr-time-separator", ":");
          var hourInput = createNumberInput("flatpickr-hour", {
              "aria-label": self.l10n.hourAriaLabel,
          });
          self.hourElement = hourInput.getElementsByTagName("input")[0];
          var minuteInput = createNumberInput("flatpickr-minute", {
              "aria-label": self.l10n.minuteAriaLabel,
          });
          self.minuteElement = minuteInput.getElementsByTagName("input")[0];
          self.hourElement.tabIndex = self.minuteElement.tabIndex = -1;
          self.hourElement.value = pad(self.latestSelectedDateObj
              ? self.latestSelectedDateObj.getHours()
              : self.config.time_24hr
                  ? defaults.hours
                  : military2ampm(defaults.hours));
          self.minuteElement.value = pad(self.latestSelectedDateObj
              ? self.latestSelectedDateObj.getMinutes()
              : defaults.minutes);
          self.hourElement.setAttribute("step", self.config.hourIncrement.toString());
          self.minuteElement.setAttribute("step", self.config.minuteIncrement.toString());
          self.hourElement.setAttribute("min", self.config.time_24hr ? "0" : "1");
          self.hourElement.setAttribute("max", self.config.time_24hr ? "23" : "12");
          self.hourElement.setAttribute("maxlength", "2");
          self.minuteElement.setAttribute("min", "0");
          self.minuteElement.setAttribute("max", "59");
          self.minuteElement.setAttribute("maxlength", "2");
          self.timeContainer.appendChild(hourInput);
          self.timeContainer.appendChild(separator);
          self.timeContainer.appendChild(minuteInput);
          if (self.config.time_24hr)
              self.timeContainer.classList.add("time24hr");
          if (self.config.enableSeconds) {
              self.timeContainer.classList.add("hasSeconds");
              var secondInput = createNumberInput("flatpickr-second");
              self.secondElement = secondInput.getElementsByTagName("input")[0];
              self.secondElement.value = pad(self.latestSelectedDateObj
                  ? self.latestSelectedDateObj.getSeconds()
                  : defaults.seconds);
              self.secondElement.setAttribute("step", self.minuteElement.getAttribute("step"));
              self.secondElement.setAttribute("min", "0");
              self.secondElement.setAttribute("max", "59");
              self.secondElement.setAttribute("maxlength", "2");
              self.timeContainer.appendChild(createElement("span", "flatpickr-time-separator", ":"));
              self.timeContainer.appendChild(secondInput);
          }
          if (!self.config.time_24hr) {
              self.amPM = createElement("span", "flatpickr-am-pm", self.l10n.amPM[int((self.latestSelectedDateObj
                  ? self.hourElement.value
                  : self.config.defaultHour) > 11)]);
              self.amPM.title = self.l10n.toggleTitle;
              self.amPM.tabIndex = -1;
              self.timeContainer.appendChild(self.amPM);
          }
          return self.timeContainer;
      }
      function buildWeekdays() {
          if (!self.weekdayContainer)
              self.weekdayContainer = createElement("div", "flatpickr-weekdays");
          else
              clearNode(self.weekdayContainer);
          for (var i = self.config.showMonths; i--;) {
              var container = createElement("div", "flatpickr-weekdaycontainer");
              self.weekdayContainer.appendChild(container);
          }
          updateWeekdays();
          return self.weekdayContainer;
      }
      function updateWeekdays() {
          if (!self.weekdayContainer) {
              return;
          }
          var firstDayOfWeek = self.l10n.firstDayOfWeek;
          var weekdays = __spreadArrays(self.l10n.weekdays.shorthand);
          if (firstDayOfWeek > 0 && firstDayOfWeek < weekdays.length) {
              weekdays = __spreadArrays(weekdays.splice(firstDayOfWeek, weekdays.length), weekdays.splice(0, firstDayOfWeek));
          }
          for (var i = self.config.showMonths; i--;) {
              self.weekdayContainer.children[i].innerHTML = "\n      <span class='flatpickr-weekday'>\n        " + weekdays.join("</span><span class='flatpickr-weekday'>") + "\n      </span>\n      ";
          }
      }
      function buildWeeks() {
          self.calendarContainer.classList.add("hasWeeks");
          var weekWrapper = createElement("div", "flatpickr-weekwrapper");
          weekWrapper.appendChild(createElement("span", "flatpickr-weekday", self.l10n.weekAbbreviation));
          var weekNumbers = createElement("div", "flatpickr-weeks");
          weekWrapper.appendChild(weekNumbers);
          return {
              weekWrapper: weekWrapper,
              weekNumbers: weekNumbers,
          };
      }
      function changeMonth(value, isOffset) {
          if (isOffset === void 0) { isOffset = true; }
          var delta = isOffset ? value : value - self.currentMonth;
          if ((delta < 0 && self._hidePrevMonthArrow === true) ||
              (delta > 0 && self._hideNextMonthArrow === true))
              return;
          self.currentMonth += delta;
          if (self.currentMonth < 0 || self.currentMonth > 11) {
              self.currentYear += self.currentMonth > 11 ? 1 : -1;
              self.currentMonth = (self.currentMonth + 12) % 12;
              triggerEvent("onYearChange");
              buildMonthSwitch();
          }
          buildDays();
          triggerEvent("onMonthChange");
          updateNavigationCurrentMonth();
      }
      function clear(triggerChangeEvent, toInitial) {
          if (triggerChangeEvent === void 0) { triggerChangeEvent = true; }
          if (toInitial === void 0) { toInitial = true; }
          self.input.value = "";
          if (self.altInput !== undefined)
              self.altInput.value = "";
          if (self.mobileInput !== undefined)
              self.mobileInput.value = "";
          self.selectedDates = [];
          self.latestSelectedDateObj = undefined;
          if (toInitial === true) {
              self.currentYear = self._initialDate.getFullYear();
              self.currentMonth = self._initialDate.getMonth();
          }
          if (self.config.enableTime === true) {
              var _a = getDefaultHours(self.config), hours = _a.hours, minutes = _a.minutes, seconds = _a.seconds;
              setHours(hours, minutes, seconds);
          }
          self.redraw();
          if (triggerChangeEvent)
              triggerEvent("onChange");
      }
      function close() {
          self.isOpen = false;
          if (!self.isMobile) {
              if (self.calendarContainer !== undefined) {
                  self.calendarContainer.classList.remove("open");
              }
              if (self._input !== undefined) {
                  self._input.classList.remove("active");
              }
          }
          triggerEvent("onClose");
      }
      function destroy() {
          if (self.config !== undefined)
              triggerEvent("onDestroy");
          for (var i = self._handlers.length; i--;) {
              self._handlers[i].remove();
          }
          self._handlers = [];
          if (self.mobileInput) {
              if (self.mobileInput.parentNode)
                  self.mobileInput.parentNode.removeChild(self.mobileInput);
              self.mobileInput = undefined;
          }
          else if (self.calendarContainer && self.calendarContainer.parentNode) {
              if (self.config.static && self.calendarContainer.parentNode) {
                  var wrapper = self.calendarContainer.parentNode;
                  wrapper.lastChild && wrapper.removeChild(wrapper.lastChild);
                  if (wrapper.parentNode) {
                      while (wrapper.firstChild)
                          wrapper.parentNode.insertBefore(wrapper.firstChild, wrapper);
                      wrapper.parentNode.removeChild(wrapper);
                  }
              }
              else
                  self.calendarContainer.parentNode.removeChild(self.calendarContainer);
          }
          if (self.altInput) {
              self.input.type = "text";
              if (self.altInput.parentNode)
                  self.altInput.parentNode.removeChild(self.altInput);
              delete self.altInput;
          }
          if (self.input) {
              self.input.type = self.input._type;
              self.input.classList.remove("flatpickr-input");
              self.input.removeAttribute("readonly");
          }
          [
              "_showTimeInput",
              "latestSelectedDateObj",
              "_hideNextMonthArrow",
              "_hidePrevMonthArrow",
              "__hideNextMonthArrow",
              "__hidePrevMonthArrow",
              "isMobile",
              "isOpen",
              "selectedDateElem",
              "minDateHasTime",
              "maxDateHasTime",
              "days",
              "daysContainer",
              "_input",
              "_positionElement",
              "innerContainer",
              "rContainer",
              "monthNav",
              "todayDateElem",
              "calendarContainer",
              "weekdayContainer",
              "prevMonthNav",
              "nextMonthNav",
              "monthsDropdownContainer",
              "currentMonthElement",
              "currentYearElement",
              "navigationCurrentMonth",
              "selectedDateElem",
              "config",
          ].forEach(function (k) {
              try {
                  delete self[k];
              }
              catch (_) { }
          });
      }
      function isCalendarElem(elem) {
          return self.calendarContainer.contains(elem);
      }
      function documentClick(e) {
          if (self.isOpen && !self.config.inline) {
              var eventTarget_1 = getEventTarget(e);
              var isCalendarElement = isCalendarElem(eventTarget_1);
              var isInput = eventTarget_1 === self.input ||
                  eventTarget_1 === self.altInput ||
                  self.element.contains(eventTarget_1) ||
                  (e.path &&
                      e.path.indexOf &&
                      (~e.path.indexOf(self.input) ||
                          ~e.path.indexOf(self.altInput)));
              var lostFocus = !isInput &&
                  !isCalendarElement &&
                  !isCalendarElem(e.relatedTarget);
              var isIgnored = !self.config.ignoredFocusElements.some(function (elem) {
                  return elem.contains(eventTarget_1);
              });
              if (lostFocus && isIgnored) {
                  if (self.config.allowInput) {
                      self.setDate(self._input.value, false, self.config.altInput
                          ? self.config.altFormat
                          : self.config.dateFormat);
                  }
                  if (self.timeContainer !== undefined &&
                      self.minuteElement !== undefined &&
                      self.hourElement !== undefined &&
                      self.input.value !== "" &&
                      self.input.value !== undefined) {
                      updateTime();
                  }
                  self.close();
                  if (self.config &&
                      self.config.mode === "range" &&
                      self.selectedDates.length === 1)
                      self.clear(false);
              }
          }
      }
      function changeYear(newYear) {
          if (!newYear ||
              (self.config.minDate && newYear < self.config.minDate.getFullYear()) ||
              (self.config.maxDate && newYear > self.config.maxDate.getFullYear()))
              return;
          var newYearNum = newYear, isNewYear = self.currentYear !== newYearNum;
          self.currentYear = newYearNum || self.currentYear;
          if (self.config.maxDate &&
              self.currentYear === self.config.maxDate.getFullYear()) {
              self.currentMonth = Math.min(self.config.maxDate.getMonth(), self.currentMonth);
          }
          else if (self.config.minDate &&
              self.currentYear === self.config.minDate.getFullYear()) {
              self.currentMonth = Math.max(self.config.minDate.getMonth(), self.currentMonth);
          }
          if (isNewYear) {
              self.redraw();
              triggerEvent("onYearChange");
              buildMonthSwitch();
          }
      }
      function isEnabled(date, timeless) {
          var _a;
          if (timeless === void 0) { timeless = true; }
          var dateToCheck = self.parseDate(date, undefined, timeless);
          if ((self.config.minDate &&
              dateToCheck &&
              compareDates(dateToCheck, self.config.minDate, timeless !== undefined ? timeless : !self.minDateHasTime) < 0) ||
              (self.config.maxDate &&
                  dateToCheck &&
                  compareDates(dateToCheck, self.config.maxDate, timeless !== undefined ? timeless : !self.maxDateHasTime) > 0))
              return false;
          if (!self.config.enable && self.config.disable.length === 0)
              return true;
          if (dateToCheck === undefined)
              return false;
          var bool = !!self.config.enable, array = (_a = self.config.enable) !== null && _a !== void 0 ? _a : self.config.disable;
          for (var i = 0, d = void 0; i < array.length; i++) {
              d = array[i];
              if (typeof d === "function" &&
                  d(dateToCheck))
                  return bool;
              else if (d instanceof Date &&
                  dateToCheck !== undefined &&
                  d.getTime() === dateToCheck.getTime())
                  return bool;
              else if (typeof d === "string") {
                  var parsed = self.parseDate(d, undefined, true);
                  return parsed && parsed.getTime() === dateToCheck.getTime()
                      ? bool
                      : !bool;
              }
              else if (typeof d === "object" &&
                  dateToCheck !== undefined &&
                  d.from &&
                  d.to &&
                  dateToCheck.getTime() >= d.from.getTime() &&
                  dateToCheck.getTime() <= d.to.getTime())
                  return bool;
          }
          return !bool;
      }
      function isInView(elem) {
          if (self.daysContainer !== undefined)
              return (elem.className.indexOf("hidden") === -1 &&
                  elem.className.indexOf("flatpickr-disabled") === -1 &&
                  self.daysContainer.contains(elem));
          return false;
      }
      function onBlur(e) {
          var isInput = e.target === self._input;
          var valueChanged = self._input.value.trimEnd() !== getDateStr();
          if (isInput &&
              valueChanged &&
              !(e.relatedTarget && isCalendarElem(e.relatedTarget))) {
              self.setDate(self._input.value, true, e.target === self.altInput
                  ? self.config.altFormat
                  : self.config.dateFormat);
          }
      }
      function onKeyDown(e) {
          var eventTarget = getEventTarget(e);
          var isInput = self.config.wrap
              ? element.contains(eventTarget)
              : eventTarget === self._input;
          var allowInput = self.config.allowInput;
          var allowKeydown = self.isOpen && (!allowInput || !isInput);
          var allowInlineKeydown = self.config.inline && isInput && !allowInput;
          if (e.keyCode === 13 && isInput) {
              if (allowInput) {
                  self.setDate(self._input.value, true, eventTarget === self.altInput
                      ? self.config.altFormat
                      : self.config.dateFormat);
                  self.close();
                  return eventTarget.blur();
              }
              else {
                  self.open();
              }
          }
          else if (isCalendarElem(eventTarget) ||
              allowKeydown ||
              allowInlineKeydown) {
              var isTimeObj = !!self.timeContainer &&
                  self.timeContainer.contains(eventTarget);
              switch (e.keyCode) {
                  case 13:
                      if (isTimeObj) {
                          e.preventDefault();
                          updateTime();
                          focusAndClose();
                      }
                      else
                          selectDate(e);
                      break;
                  case 27:
                      e.preventDefault();
                      focusAndClose();
                      break;
                  case 8:
                  case 46:
                      if (isInput && !self.config.allowInput) {
                          e.preventDefault();
                          self.clear();
                      }
                      break;
                  case 37:
                  case 39:
                      if (!isTimeObj && !isInput) {
                          e.preventDefault();
                          var activeElement = getClosestActiveElement();
                          if (self.daysContainer !== undefined &&
                              (allowInput === false ||
                                  (activeElement && isInView(activeElement)))) {
                              var delta_1 = e.keyCode === 39 ? 1 : -1;
                              if (!e.ctrlKey)
                                  focusOnDay(undefined, delta_1);
                              else {
                                  e.stopPropagation();
                                  changeMonth(delta_1);
                                  focusOnDay(getFirstAvailableDay(1), 0);
                              }
                          }
                      }
                      else if (self.hourElement)
                          self.hourElement.focus();
                      break;
                  case 38:
                  case 40:
                      e.preventDefault();
                      var delta = e.keyCode === 40 ? 1 : -1;
                      if ((self.daysContainer &&
                          eventTarget.$i !== undefined) ||
                          eventTarget === self.input ||
                          eventTarget === self.altInput) {
                          if (e.ctrlKey) {
                              e.stopPropagation();
                              changeYear(self.currentYear - delta);
                              focusOnDay(getFirstAvailableDay(1), 0);
                          }
                          else if (!isTimeObj)
                              focusOnDay(undefined, delta * 7);
                      }
                      else if (eventTarget === self.currentYearElement) {
                          changeYear(self.currentYear - delta);
                      }
                      else if (self.config.enableTime) {
                          if (!isTimeObj && self.hourElement)
                              self.hourElement.focus();
                          updateTime(e);
                          self._debouncedChange();
                      }
                      break;
                  case 9:
                      if (isTimeObj) {
                          var elems = [
                              self.hourElement,
                              self.minuteElement,
                              self.secondElement,
                              self.amPM,
                          ]
                              .concat(self.pluginElements)
                              .filter(function (x) { return x; });
                          var i = elems.indexOf(eventTarget);
                          if (i !== -1) {
                              var target = elems[i + (e.shiftKey ? -1 : 1)];
                              e.preventDefault();
                              (target || self._input).focus();
                          }
                      }
                      else if (!self.config.noCalendar &&
                          self.daysContainer &&
                          self.daysContainer.contains(eventTarget) &&
                          e.shiftKey) {
                          e.preventDefault();
                          self._input.focus();
                      }
                      break;
              }
          }
          if (self.amPM !== undefined && eventTarget === self.amPM) {
              switch (e.key) {
                  case self.l10n.amPM[0].charAt(0):
                  case self.l10n.amPM[0].charAt(0).toLowerCase():
                      self.amPM.textContent = self.l10n.amPM[0];
                      setHoursFromInputs();
                      updateValue();
                      break;
                  case self.l10n.amPM[1].charAt(0):
                  case self.l10n.amPM[1].charAt(0).toLowerCase():
                      self.amPM.textContent = self.l10n.amPM[1];
                      setHoursFromInputs();
                      updateValue();
                      break;
              }
          }
          if (isInput || isCalendarElem(eventTarget)) {
              triggerEvent("onKeyDown", e);
          }
      }
      function onMouseOver(elem, cellClass) {
          if (cellClass === void 0) { cellClass = "flatpickr-day"; }
          if (self.selectedDates.length !== 1 ||
              (elem &&
                  (!elem.classList.contains(cellClass) ||
                      elem.classList.contains("flatpickr-disabled"))))
              return;
          var hoverDate = elem
              ? elem.dateObj.getTime()
              : self.days.firstElementChild.dateObj.getTime(), initialDate = self.parseDate(self.selectedDates[0], undefined, true).getTime(), rangeStartDate = Math.min(hoverDate, self.selectedDates[0].getTime()), rangeEndDate = Math.max(hoverDate, self.selectedDates[0].getTime());
          var containsDisabled = false;
          var minRange = 0, maxRange = 0;
          for (var t = rangeStartDate; t < rangeEndDate; t += duration.DAY) {
              if (!isEnabled(new Date(t), true)) {
                  containsDisabled =
                      containsDisabled || (t > rangeStartDate && t < rangeEndDate);
                  if (t < initialDate && (!minRange || t > minRange))
                      minRange = t;
                  else if (t > initialDate && (!maxRange || t < maxRange))
                      maxRange = t;
              }
          }
          var hoverableCells = Array.from(self.rContainer.querySelectorAll("*:nth-child(-n+" + self.config.showMonths + ") > ." + cellClass));
          hoverableCells.forEach(function (dayElem) {
              var date = dayElem.dateObj;
              var timestamp = date.getTime();
              var outOfRange = (minRange > 0 && timestamp < minRange) ||
                  (maxRange > 0 && timestamp > maxRange);
              if (outOfRange) {
                  dayElem.classList.add("notAllowed");
                  ["inRange", "startRange", "endRange"].forEach(function (c) {
                      dayElem.classList.remove(c);
                  });
                  return;
              }
              else if (containsDisabled && !outOfRange)
                  return;
              ["startRange", "inRange", "endRange", "notAllowed"].forEach(function (c) {
                  dayElem.classList.remove(c);
              });
              if (elem !== undefined) {
                  elem.classList.add(hoverDate <= self.selectedDates[0].getTime()
                      ? "startRange"
                      : "endRange");
                  if (initialDate < hoverDate && timestamp === initialDate)
                      dayElem.classList.add("startRange");
                  else if (initialDate > hoverDate && timestamp === initialDate)
                      dayElem.classList.add("endRange");
                  if (timestamp >= minRange &&
                      (maxRange === 0 || timestamp <= maxRange) &&
                      isBetween(timestamp, initialDate, hoverDate))
                      dayElem.classList.add("inRange");
              }
          });
      }
      function onResize() {
          if (self.isOpen && !self.config.static && !self.config.inline)
              positionCalendar();
      }
      function open(e, positionElement) {
          if (positionElement === void 0) { positionElement = self._positionElement; }
          if (self.isMobile === true) {
              if (e) {
                  e.preventDefault();
                  var eventTarget = getEventTarget(e);
                  if (eventTarget) {
                      eventTarget.blur();
                  }
              }
              if (self.mobileInput !== undefined) {
                  self.mobileInput.focus();
                  self.mobileInput.click();
              }
              triggerEvent("onOpen");
              return;
          }
          else if (self._input.disabled || self.config.inline) {
              return;
          }
          var wasOpen = self.isOpen;
          self.isOpen = true;
          if (!wasOpen) {
              self.calendarContainer.classList.add("open");
              self._input.classList.add("active");
              triggerEvent("onOpen");
              positionCalendar(positionElement);
          }
          if (self.config.enableTime === true && self.config.noCalendar === true) {
              if (self.config.allowInput === false &&
                  (e === undefined ||
                      !self.timeContainer.contains(e.relatedTarget))) {
                  setTimeout(function () { return self.hourElement.select(); }, 50);
              }
          }
      }
      function minMaxDateSetter(type) {
          return function (date) {
              var dateObj = (self.config["_" + type + "Date"] = self.parseDate(date, self.config.dateFormat));
              var inverseDateObj = self.config["_" + (type === "min" ? "max" : "min") + "Date"];
              if (dateObj !== undefined) {
                  self[type === "min" ? "minDateHasTime" : "maxDateHasTime"] =
                      dateObj.getHours() > 0 ||
                          dateObj.getMinutes() > 0 ||
                          dateObj.getSeconds() > 0;
              }
              if (self.selectedDates) {
                  self.selectedDates = self.selectedDates.filter(function (d) { return isEnabled(d); });
                  if (!self.selectedDates.length && type === "min")
                      setHoursFromDate(dateObj);
                  updateValue();
              }
              if (self.daysContainer) {
                  redraw();
                  if (dateObj !== undefined)
                      self.currentYearElement[type] = dateObj.getFullYear().toString();
                  else
                      self.currentYearElement.removeAttribute(type);
                  self.currentYearElement.disabled =
                      !!inverseDateObj &&
                          dateObj !== undefined &&
                          inverseDateObj.getFullYear() === dateObj.getFullYear();
              }
          };
      }
      function parseConfig() {
          var boolOpts = [
              "wrap",
              "weekNumbers",
              "allowInput",
              "allowInvalidPreload",
              "clickOpens",
              "time_24hr",
              "enableTime",
              "noCalendar",
              "altInput",
              "shorthandCurrentMonth",
              "inline",
              "static",
              "enableSeconds",
              "disableMobile",
          ];
          var userConfig = __assign(__assign({}, JSON.parse(JSON.stringify(element.dataset || {}))), instanceConfig);
          var formats = {};
          self.config.parseDate = userConfig.parseDate;
          self.config.formatDate = userConfig.formatDate;
          Object.defineProperty(self.config, "enable", {
              get: function () { return self.config._enable; },
              set: function (dates) {
                  self.config._enable = parseDateRules(dates);
              },
          });
          Object.defineProperty(self.config, "disable", {
              get: function () { return self.config._disable; },
              set: function (dates) {
                  self.config._disable = parseDateRules(dates);
              },
          });
          var timeMode = userConfig.mode === "time";
          if (!userConfig.dateFormat && (userConfig.enableTime || timeMode)) {
              var defaultDateFormat = flatpickr.defaultConfig.dateFormat || defaults.dateFormat;
              formats.dateFormat =
                  userConfig.noCalendar || timeMode
                      ? "H:i" + (userConfig.enableSeconds ? ":S" : "")
                      : defaultDateFormat + " H:i" + (userConfig.enableSeconds ? ":S" : "");
          }
          if (userConfig.altInput &&
              (userConfig.enableTime || timeMode) &&
              !userConfig.altFormat) {
              var defaultAltFormat = flatpickr.defaultConfig.altFormat || defaults.altFormat;
              formats.altFormat =
                  userConfig.noCalendar || timeMode
                      ? "h:i" + (userConfig.enableSeconds ? ":S K" : " K")
                      : defaultAltFormat + (" h:i" + (userConfig.enableSeconds ? ":S" : "") + " K");
          }
          Object.defineProperty(self.config, "minDate", {
              get: function () { return self.config._minDate; },
              set: minMaxDateSetter("min"),
          });
          Object.defineProperty(self.config, "maxDate", {
              get: function () { return self.config._maxDate; },
              set: minMaxDateSetter("max"),
          });
          var minMaxTimeSetter = function (type) { return function (val) {
              self.config[type === "min" ? "_minTime" : "_maxTime"] = self.parseDate(val, "H:i:S");
          }; };
          Object.defineProperty(self.config, "minTime", {
              get: function () { return self.config._minTime; },
              set: minMaxTimeSetter("min"),
          });
          Object.defineProperty(self.config, "maxTime", {
              get: function () { return self.config._maxTime; },
              set: minMaxTimeSetter("max"),
          });
          if (userConfig.mode === "time") {
              self.config.noCalendar = true;
              self.config.enableTime = true;
          }
          Object.assign(self.config, formats, userConfig);
          for (var i = 0; i < boolOpts.length; i++)
              self.config[boolOpts[i]] =
                  self.config[boolOpts[i]] === true ||
                      self.config[boolOpts[i]] === "true";
          HOOKS.filter(function (hook) { return self.config[hook] !== undefined; }).forEach(function (hook) {
              self.config[hook] = arrayify(self.config[hook] || []).map(bindToInstance);
          });
          self.isMobile =
              !self.config.disableMobile &&
                  !self.config.inline &&
                  self.config.mode === "single" &&
                  !self.config.disable.length &&
                  !self.config.enable &&
                  !self.config.weekNumbers &&
                  /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
          for (var i = 0; i < self.config.plugins.length; i++) {
              var pluginConf = self.config.plugins[i](self) || {};
              for (var key in pluginConf) {
                  if (HOOKS.indexOf(key) > -1) {
                      self.config[key] = arrayify(pluginConf[key])
                          .map(bindToInstance)
                          .concat(self.config[key]);
                  }
                  else if (typeof userConfig[key] === "undefined")
                      self.config[key] = pluginConf[key];
              }
          }
          if (!userConfig.altInputClass) {
              self.config.altInputClass =
                  getInputElem().className + " " + self.config.altInputClass;
          }
          triggerEvent("onParseConfig");
      }
      function getInputElem() {
          return self.config.wrap
              ? element.querySelector("[data-input]")
              : element;
      }
      function setupLocale() {
          if (typeof self.config.locale !== "object" &&
              typeof flatpickr.l10ns[self.config.locale] === "undefined")
              self.config.errorHandler(new Error("flatpickr: invalid locale " + self.config.locale));
          self.l10n = __assign(__assign({}, flatpickr.l10ns.default), (typeof self.config.locale === "object"
              ? self.config.locale
              : self.config.locale !== "default"
                  ? flatpickr.l10ns[self.config.locale]
                  : undefined));
          tokenRegex.D = "(" + self.l10n.weekdays.shorthand.join("|") + ")";
          tokenRegex.l = "(" + self.l10n.weekdays.longhand.join("|") + ")";
          tokenRegex.M = "(" + self.l10n.months.shorthand.join("|") + ")";
          tokenRegex.F = "(" + self.l10n.months.longhand.join("|") + ")";
          tokenRegex.K = "(" + self.l10n.amPM[0] + "|" + self.l10n.amPM[1] + "|" + self.l10n.amPM[0].toLowerCase() + "|" + self.l10n.amPM[1].toLowerCase() + ")";
          var userConfig = __assign(__assign({}, instanceConfig), JSON.parse(JSON.stringify(element.dataset || {})));
          if (userConfig.time_24hr === undefined &&
              flatpickr.defaultConfig.time_24hr === undefined) {
              self.config.time_24hr = self.l10n.time_24hr;
          }
          self.formatDate = createDateFormatter(self);
          self.parseDate = createDateParser({ config: self.config, l10n: self.l10n });
      }
      function positionCalendar(customPositionElement) {
          if (typeof self.config.position === "function") {
              return void self.config.position(self, customPositionElement);
          }
          if (self.calendarContainer === undefined)
              return;
          triggerEvent("onPreCalendarPosition");
          var positionElement = customPositionElement || self._positionElement;
          var calendarHeight = Array.prototype.reduce.call(self.calendarContainer.children, (function (acc, child) { return acc + child.offsetHeight; }), 0), calendarWidth = self.calendarContainer.offsetWidth, configPos = self.config.position.split(" "), configPosVertical = configPos[0], configPosHorizontal = configPos.length > 1 ? configPos[1] : null, inputBounds = positionElement.getBoundingClientRect(), distanceFromBottom = window.innerHeight - inputBounds.bottom, showOnTop = configPosVertical === "above" ||
              (configPosVertical !== "below" &&
                  distanceFromBottom < calendarHeight &&
                  inputBounds.top > calendarHeight);
          var top = window.pageYOffset +
              inputBounds.top +
              (!showOnTop ? positionElement.offsetHeight + 2 : -calendarHeight - 2);
          toggleClass(self.calendarContainer, "arrowTop", !showOnTop);
          toggleClass(self.calendarContainer, "arrowBottom", showOnTop);
          if (self.config.inline)
              return;
          var left = window.pageXOffset + inputBounds.left;
          var isCenter = false;
          var isRight = false;
          if (configPosHorizontal === "center") {
              left -= (calendarWidth - inputBounds.width) / 2;
              isCenter = true;
          }
          else if (configPosHorizontal === "right") {
              left -= calendarWidth - inputBounds.width;
              isRight = true;
          }
          toggleClass(self.calendarContainer, "arrowLeft", !isCenter && !isRight);
          toggleClass(self.calendarContainer, "arrowCenter", isCenter);
          toggleClass(self.calendarContainer, "arrowRight", isRight);
          var right = window.document.body.offsetWidth -
              (window.pageXOffset + inputBounds.right);
          var rightMost = left + calendarWidth > window.document.body.offsetWidth;
          var centerMost = right + calendarWidth > window.document.body.offsetWidth;
          toggleClass(self.calendarContainer, "rightMost", rightMost);
          if (self.config.static)
              return;
          self.calendarContainer.style.top = top + "px";
          if (!rightMost) {
              self.calendarContainer.style.left = left + "px";
              self.calendarContainer.style.right = "auto";
          }
          else if (!centerMost) {
              self.calendarContainer.style.left = "auto";
              self.calendarContainer.style.right = right + "px";
          }
          else {
              var doc = getDocumentStyleSheet();
              if (doc === undefined)
                  return;
              var bodyWidth = window.document.body.offsetWidth;
              var centerLeft = Math.max(0, bodyWidth / 2 - calendarWidth / 2);
              var centerBefore = ".flatpickr-calendar.centerMost:before";
              var centerAfter = ".flatpickr-calendar.centerMost:after";
              var centerIndex = doc.cssRules.length;
              var centerStyle = "{left:" + inputBounds.left + "px;right:auto;}";
              toggleClass(self.calendarContainer, "rightMost", false);
              toggleClass(self.calendarContainer, "centerMost", true);
              doc.insertRule(centerBefore + "," + centerAfter + centerStyle, centerIndex);
              self.calendarContainer.style.left = centerLeft + "px";
              self.calendarContainer.style.right = "auto";
          }
      }
      function getDocumentStyleSheet() {
          var editableSheet = null;
          for (var i = 0; i < document.styleSheets.length; i++) {
              var sheet = document.styleSheets[i];
              if (!sheet.cssRules)
                  continue;
              try {
                  sheet.cssRules;
              }
              catch (err) {
                  continue;
              }
              editableSheet = sheet;
              break;
          }
          return editableSheet != null ? editableSheet : createStyleSheet();
      }
      function createStyleSheet() {
          var style = document.createElement("style");
          document.head.appendChild(style);
          return style.sheet;
      }
      function redraw() {
          if (self.config.noCalendar || self.isMobile)
              return;
          buildMonthSwitch();
          updateNavigationCurrentMonth();
          buildDays();
      }
      function focusAndClose() {
          self._input.focus();
          if (window.navigator.userAgent.indexOf("MSIE") !== -1 ||
              navigator.msMaxTouchPoints !== undefined) {
              setTimeout(self.close, 0);
          }
          else {
              self.close();
          }
      }
      function selectDate(e) {
          e.preventDefault();
          e.stopPropagation();
          var isSelectable = function (day) {
              return day.classList &&
                  day.classList.contains("flatpickr-day") &&
                  !day.classList.contains("flatpickr-disabled") &&
                  !day.classList.contains("notAllowed");
          };
          var t = findParent(getEventTarget(e), isSelectable);
          if (t === undefined)
              return;
          var target = t;
          var selectedDate = (self.latestSelectedDateObj = new Date(target.dateObj.getTime()));
          var shouldChangeMonth = (selectedDate.getMonth() < self.currentMonth ||
              selectedDate.getMonth() >
                  self.currentMonth + self.config.showMonths - 1) &&
              self.config.mode !== "range";
          self.selectedDateElem = target;
          if (self.config.mode === "single")
              self.selectedDates = [selectedDate];
          else if (self.config.mode === "multiple") {
              var selectedIndex = isDateSelected(selectedDate);
              if (selectedIndex)
                  self.selectedDates.splice(parseInt(selectedIndex), 1);
              else
                  self.selectedDates.push(selectedDate);
          }
          else if (self.config.mode === "range") {
              if (self.selectedDates.length === 2) {
                  self.clear(false, false);
              }
              self.latestSelectedDateObj = selectedDate;
              self.selectedDates.push(selectedDate);
              if (compareDates(selectedDate, self.selectedDates[0], true) !== 0)
                  self.selectedDates.sort(function (a, b) { return a.getTime() - b.getTime(); });
          }
          setHoursFromInputs();
          if (shouldChangeMonth) {
              var isNewYear = self.currentYear !== selectedDate.getFullYear();
              self.currentYear = selectedDate.getFullYear();
              self.currentMonth = selectedDate.getMonth();
              if (isNewYear) {
                  triggerEvent("onYearChange");
                  buildMonthSwitch();
              }
              triggerEvent("onMonthChange");
          }
          updateNavigationCurrentMonth();
          buildDays();
          updateValue();
          if (!shouldChangeMonth &&
              self.config.mode !== "range" &&
              self.config.showMonths === 1)
              focusOnDayElem(target);
          else if (self.selectedDateElem !== undefined &&
              self.hourElement === undefined) {
              self.selectedDateElem && self.selectedDateElem.focus();
          }
          if (self.hourElement !== undefined)
              self.hourElement !== undefined && self.hourElement.focus();
          if (self.config.closeOnSelect) {
              var single = self.config.mode === "single" && !self.config.enableTime;
              var range = self.config.mode === "range" &&
                  self.selectedDates.length === 2 &&
                  !self.config.enableTime;
              if (single || range) {
                  focusAndClose();
              }
          }
          triggerChange();
      }
      var CALLBACKS = {
          locale: [setupLocale, updateWeekdays],
          showMonths: [buildMonths, setCalendarWidth, buildWeekdays],
          minDate: [jumpToDate],
          maxDate: [jumpToDate],
          positionElement: [updatePositionElement],
          clickOpens: [
              function () {
                  if (self.config.clickOpens === true) {
                      bind(self._input, "focus", self.open);
                      bind(self._input, "click", self.open);
                  }
                  else {
                      self._input.removeEventListener("focus", self.open);
                      self._input.removeEventListener("click", self.open);
                  }
              },
          ],
      };
      function set(option, value) {
          if (option !== null && typeof option === "object") {
              Object.assign(self.config, option);
              for (var key in option) {
                  if (CALLBACKS[key] !== undefined)
                      CALLBACKS[key].forEach(function (x) { return x(); });
              }
          }
          else {
              self.config[option] = value;
              if (CALLBACKS[option] !== undefined)
                  CALLBACKS[option].forEach(function (x) { return x(); });
              else if (HOOKS.indexOf(option) > -1)
                  self.config[option] = arrayify(value);
          }
          self.redraw();
          updateValue(true);
      }
      function setSelectedDate(inputDate, format) {
          var dates = [];
          if (inputDate instanceof Array)
              dates = inputDate.map(function (d) { return self.parseDate(d, format); });
          else if (inputDate instanceof Date || typeof inputDate === "number")
              dates = [self.parseDate(inputDate, format)];
          else if (typeof inputDate === "string") {
              switch (self.config.mode) {
                  case "single":
                  case "time":
                      dates = [self.parseDate(inputDate, format)];
                      break;
                  case "multiple":
                      dates = inputDate
                          .split(self.config.conjunction)
                          .map(function (date) { return self.parseDate(date, format); });
                      break;
                  case "range":
                      dates = inputDate
                          .split(self.l10n.rangeSeparator)
                          .map(function (date) { return self.parseDate(date, format); });
                      break;
              }
          }
          else
              self.config.errorHandler(new Error("Invalid date supplied: " + JSON.stringify(inputDate)));
          self.selectedDates = (self.config.allowInvalidPreload
              ? dates
              : dates.filter(function (d) { return d instanceof Date && isEnabled(d, false); }));
          if (self.config.mode === "range")
              self.selectedDates.sort(function (a, b) { return a.getTime() - b.getTime(); });
      }
      function setDate(date, triggerChange, format) {
          if (triggerChange === void 0) { triggerChange = false; }
          if (format === void 0) { format = self.config.dateFormat; }
          if ((date !== 0 && !date) || (date instanceof Array && date.length === 0))
              return self.clear(triggerChange);
          setSelectedDate(date, format);
          self.latestSelectedDateObj =
              self.selectedDates[self.selectedDates.length - 1];
          self.redraw();
          jumpToDate(undefined, triggerChange);
          setHoursFromDate();
          if (self.selectedDates.length === 0) {
              self.clear(false);
          }
          updateValue(triggerChange);
          if (triggerChange)
              triggerEvent("onChange");
      }
      function parseDateRules(arr) {
          return arr
              .slice()
              .map(function (rule) {
              if (typeof rule === "string" ||
                  typeof rule === "number" ||
                  rule instanceof Date) {
                  return self.parseDate(rule, undefined, true);
              }
              else if (rule &&
                  typeof rule === "object" &&
                  rule.from &&
                  rule.to)
                  return {
                      from: self.parseDate(rule.from, undefined),
                      to: self.parseDate(rule.to, undefined),
                  };
              return rule;
          })
              .filter(function (x) { return x; });
      }
      function setupDates() {
          self.selectedDates = [];
          self.now = self.parseDate(self.config.now) || new Date();
          var preloadedDate = self.config.defaultDate ||
              ((self.input.nodeName === "INPUT" ||
                  self.input.nodeName === "TEXTAREA") &&
                  self.input.placeholder &&
                  self.input.value === self.input.placeholder
                  ? null
                  : self.input.value);
          if (preloadedDate)
              setSelectedDate(preloadedDate, self.config.dateFormat);
          self._initialDate =
              self.selectedDates.length > 0
                  ? self.selectedDates[0]
                  : self.config.minDate &&
                      self.config.minDate.getTime() > self.now.getTime()
                      ? self.config.minDate
                      : self.config.maxDate &&
                          self.config.maxDate.getTime() < self.now.getTime()
                          ? self.config.maxDate
                          : self.now;
          self.currentYear = self._initialDate.getFullYear();
          self.currentMonth = self._initialDate.getMonth();
          if (self.selectedDates.length > 0)
              self.latestSelectedDateObj = self.selectedDates[0];
          if (self.config.minTime !== undefined)
              self.config.minTime = self.parseDate(self.config.minTime, "H:i");
          if (self.config.maxTime !== undefined)
              self.config.maxTime = self.parseDate(self.config.maxTime, "H:i");
          self.minDateHasTime =
              !!self.config.minDate &&
                  (self.config.minDate.getHours() > 0 ||
                      self.config.minDate.getMinutes() > 0 ||
                      self.config.minDate.getSeconds() > 0);
          self.maxDateHasTime =
              !!self.config.maxDate &&
                  (self.config.maxDate.getHours() > 0 ||
                      self.config.maxDate.getMinutes() > 0 ||
                      self.config.maxDate.getSeconds() > 0);
      }
      function setupInputs() {
          self.input = getInputElem();
          if (!self.input) {
              self.config.errorHandler(new Error("Invalid input element specified"));
              return;
          }
          self.input._type = self.input.type;
          self.input.type = "text";
          self.input.classList.add("flatpickr-input");
          self._input = self.input;
          if (self.config.altInput) {
              self.altInput = createElement(self.input.nodeName, self.config.altInputClass);
              self._input = self.altInput;
              self.altInput.placeholder = self.input.placeholder;
              self.altInput.disabled = self.input.disabled;
              self.altInput.required = self.input.required;
              self.altInput.tabIndex = self.input.tabIndex;
              self.altInput.type = "text";
              self.input.setAttribute("type", "hidden");
              if (!self.config.static && self.input.parentNode)
                  self.input.parentNode.insertBefore(self.altInput, self.input.nextSibling);
          }
          if (!self.config.allowInput)
              self._input.setAttribute("readonly", "readonly");
          updatePositionElement();
      }
      function updatePositionElement() {
          self._positionElement = self.config.positionElement || self._input;
      }
      function setupMobile() {
          var inputType = self.config.enableTime
              ? self.config.noCalendar
                  ? "time"
                  : "datetime-local"
              : "date";
          self.mobileInput = createElement("input", self.input.className + " flatpickr-mobile");
          self.mobileInput.tabIndex = 1;
          self.mobileInput.type = inputType;
          self.mobileInput.disabled = self.input.disabled;
          self.mobileInput.required = self.input.required;
          self.mobileInput.placeholder = self.input.placeholder;
          self.mobileFormatStr =
              inputType === "datetime-local"
                  ? "Y-m-d\\TH:i:S"
                  : inputType === "date"
                      ? "Y-m-d"
                      : "H:i:S";
          if (self.selectedDates.length > 0) {
              self.mobileInput.defaultValue = self.mobileInput.value = self.formatDate(self.selectedDates[0], self.mobileFormatStr);
          }
          if (self.config.minDate)
              self.mobileInput.min = self.formatDate(self.config.minDate, "Y-m-d");
          if (self.config.maxDate)
              self.mobileInput.max = self.formatDate(self.config.maxDate, "Y-m-d");
          if (self.input.getAttribute("step"))
              self.mobileInput.step = String(self.input.getAttribute("step"));
          self.input.type = "hidden";
          if (self.altInput !== undefined)
              self.altInput.type = "hidden";
          try {
              if (self.input.parentNode)
                  self.input.parentNode.insertBefore(self.mobileInput, self.input.nextSibling);
          }
          catch (_a) { }
          bind(self.mobileInput, "change", function (e) {
              self.setDate(getEventTarget(e).value, false, self.mobileFormatStr);
              triggerEvent("onChange");
              triggerEvent("onClose");
          });
      }
      function toggle(e) {
          if (self.isOpen === true)
              return self.close();
          self.open(e);
      }
      function triggerEvent(event, data) {
          if (self.config === undefined)
              return;
          var hooks = self.config[event];
          if (hooks !== undefined && hooks.length > 0) {
              for (var i = 0; hooks[i] && i < hooks.length; i++)
                  hooks[i](self.selectedDates, self.input.value, self, data);
          }
          if (event === "onChange") {
              self.input.dispatchEvent(createEvent("change"));
              self.input.dispatchEvent(createEvent("input"));
          }
      }
      function createEvent(name) {
          var e = document.createEvent("Event");
          e.initEvent(name, true, true);
          return e;
      }
      function isDateSelected(date) {
          for (var i = 0; i < self.selectedDates.length; i++) {
              var selectedDate = self.selectedDates[i];
              if (selectedDate instanceof Date &&
                  compareDates(selectedDate, date) === 0)
                  return "" + i;
          }
          return false;
      }
      function isDateInRange(date) {
          if (self.config.mode !== "range" || self.selectedDates.length < 2)
              return false;
          return (compareDates(date, self.selectedDates[0]) >= 0 &&
              compareDates(date, self.selectedDates[1]) <= 0);
      }
      function updateNavigationCurrentMonth() {
          if (self.config.noCalendar || self.isMobile || !self.monthNav)
              return;
          self.yearElements.forEach(function (yearElement, i) {
              var d = new Date(self.currentYear, self.currentMonth, 1);
              d.setMonth(self.currentMonth + i);
              if (self.config.showMonths > 1 ||
                  self.config.monthSelectorType === "static") {
                  self.monthElements[i].textContent =
                      monthToStr(d.getMonth(), self.config.shorthandCurrentMonth, self.l10n) + " ";
              }
              else {
                  self.monthsDropdownContainer.value = d.getMonth().toString();
              }
              yearElement.value = d.getFullYear().toString();
          });
          self._hidePrevMonthArrow =
              self.config.minDate !== undefined &&
                  (self.currentYear === self.config.minDate.getFullYear()
                      ? self.currentMonth <= self.config.minDate.getMonth()
                      : self.currentYear < self.config.minDate.getFullYear());
          self._hideNextMonthArrow =
              self.config.maxDate !== undefined &&
                  (self.currentYear === self.config.maxDate.getFullYear()
                      ? self.currentMonth + 1 > self.config.maxDate.getMonth()
                      : self.currentYear > self.config.maxDate.getFullYear());
      }
      function getDateStr(specificFormat) {
          var format = specificFormat ||
              (self.config.altInput ? self.config.altFormat : self.config.dateFormat);
          return self.selectedDates
              .map(function (dObj) { return self.formatDate(dObj, format); })
              .filter(function (d, i, arr) {
              return self.config.mode !== "range" ||
                  self.config.enableTime ||
                  arr.indexOf(d) === i;
          })
              .join(self.config.mode !== "range"
              ? self.config.conjunction
              : self.l10n.rangeSeparator);
      }
      function updateValue(triggerChange) {
          if (triggerChange === void 0) { triggerChange = true; }
          if (self.mobileInput !== undefined && self.mobileFormatStr) {
              self.mobileInput.value =
                  self.latestSelectedDateObj !== undefined
                      ? self.formatDate(self.latestSelectedDateObj, self.mobileFormatStr)
                      : "";
          }
          self.input.value = getDateStr(self.config.dateFormat);
          if (self.altInput !== undefined) {
              self.altInput.value = getDateStr(self.config.altFormat);
          }
          if (triggerChange !== false)
              triggerEvent("onValueUpdate");
      }
      function onMonthNavClick(e) {
          var eventTarget = getEventTarget(e);
          var isPrevMonth = self.prevMonthNav.contains(eventTarget);
          var isNextMonth = self.nextMonthNav.contains(eventTarget);
          if (isPrevMonth || isNextMonth) {
              changeMonth(isPrevMonth ? -1 : 1);
          }
          else if (self.yearElements.indexOf(eventTarget) >= 0) {
              eventTarget.select();
          }
          else if (eventTarget.classList.contains("arrowUp")) {
              self.changeYear(self.currentYear + 1);
          }
          else if (eventTarget.classList.contains("arrowDown")) {
              self.changeYear(self.currentYear - 1);
          }
      }
      function timeWrapper(e) {
          e.preventDefault();
          var isKeyDown = e.type === "keydown", eventTarget = getEventTarget(e), input = eventTarget;
          if (self.amPM !== undefined && eventTarget === self.amPM) {
              self.amPM.textContent =
                  self.l10n.amPM[int(self.amPM.textContent === self.l10n.amPM[0])];
          }
          var min = parseFloat(input.getAttribute("min")), max = parseFloat(input.getAttribute("max")), step = parseFloat(input.getAttribute("step")), curValue = parseInt(input.value, 10), delta = e.delta ||
              (isKeyDown ? (e.which === 38 ? 1 : -1) : 0);
          var newValue = curValue + step * delta;
          if (typeof input.value !== "undefined" && input.value.length === 2) {
              var isHourElem = input === self.hourElement, isMinuteElem = input === self.minuteElement;
              if (newValue < min) {
                  newValue =
                      max +
                          newValue +
                          int(!isHourElem) +
                          (int(isHourElem) && int(!self.amPM));
                  if (isMinuteElem)
                      incrementNumInput(undefined, -1, self.hourElement);
              }
              else if (newValue > max) {
                  newValue =
                      input === self.hourElement ? newValue - max - int(!self.amPM) : min;
                  if (isMinuteElem)
                      incrementNumInput(undefined, 1, self.hourElement);
              }
              if (self.amPM &&
                  isHourElem &&
                  (step === 1
                      ? newValue + curValue === 23
                      : Math.abs(newValue - curValue) > step)) {
                  self.amPM.textContent =
                      self.l10n.amPM[int(self.amPM.textContent === self.l10n.amPM[0])];
              }
              input.value = pad(newValue);
          }
      }
      init();
      return self;
  }
  function _flatpickr(nodeList, config) {
      var nodes = Array.prototype.slice
          .call(nodeList)
          .filter(function (x) { return x instanceof HTMLElement; });
      var instances = [];
      for (var i = 0; i < nodes.length; i++) {
          var node = nodes[i];
          try {
              if (node.getAttribute("data-fp-omit") !== null)
                  continue;
              if (node._flatpickr !== undefined) {
                  node._flatpickr.destroy();
                  node._flatpickr = undefined;
              }
              node._flatpickr = FlatpickrInstance(node, config || {});
              instances.push(node._flatpickr);
          }
          catch (e) {
              console.error(e);
          }
      }
      return instances.length === 1 ? instances[0] : instances;
  }
  if (typeof HTMLElement !== "undefined" &&
      typeof HTMLCollection !== "undefined" &&
      typeof NodeList !== "undefined") {
      HTMLCollection.prototype.flatpickr = NodeList.prototype.flatpickr = function (config) {
          return _flatpickr(this, config);
      };
      HTMLElement.prototype.flatpickr = function (config) {
          return _flatpickr([this], config);
      };
  }
  var flatpickr = function (selector, config) {
      if (typeof selector === "string") {
          return _flatpickr(window.document.querySelectorAll(selector), config);
      }
      else if (selector instanceof Node) {
          return _flatpickr([selector], config);
      }
      else {
          return _flatpickr(selector, config);
      }
  };
  flatpickr.defaultConfig = {};
  flatpickr.l10ns = {
      en: __assign({}, english),
      default: __assign({}, english),
  };
  flatpickr.localize = function (l10n) {
      flatpickr.l10ns.default = __assign(__assign({}, flatpickr.l10ns.default), l10n);
  };
  flatpickr.setDefaults = function (config) {
      flatpickr.defaultConfig = __assign(__assign({}, flatpickr.defaultConfig), config);
  };
  flatpickr.parseDate = createDateParser({});
  flatpickr.formatDate = createDateFormatter({});
  flatpickr.compareDates = compareDates;
  if (typeof jQuery !== "undefined" && typeof jQuery.fn !== "undefined") {
      jQuery.fn.flatpickr = function (config) {
          return _flatpickr(this, config);
      };
  }
  Date.prototype.fp_incr = function (days) {
      return new Date(this.getFullYear(), this.getMonth(), this.getDate() + (typeof days === "string" ? parseInt(days, 10) : days));
  };
  if (typeof window !== "undefined") {
      window.flatpickr = flatpickr;
  }

  var e,o={};function n(r,t,e){if(3===r.nodeType){var o="textContent"in r?r.textContent:r.nodeValue||"";if(!1!==n.options.trim){var a=0===t||t===e.length-1;if((!(o=o.match(/^[\s\n]+$/g)&&"all"!==n.options.trim?" ":o.replace(/(^[\s\n]+|[\s\n]+$)/g,"all"===n.options.trim||a?"":" "))||" "===o)&&e.length>1&&a)return null}return o}if(1!==r.nodeType)return null;var p=String(r.nodeName).toLowerCase();if("script"===p&&!n.options.allowScripts)return null;var l,s,u=n.h(p,function(r){var t=r&&r.length;if(!t)return null;for(var e={},o=0;o<t;o++){var a=r[o],i=a.name,p=a.value;"on"===i.substring(0,2)&&n.options.allowEvents&&(p=new Function(p)),e[i]=p;}return e}(r.attributes),(s=(l=r.childNodes)&&Array.prototype.map.call(l,n).filter(i))&&s.length?s:null);return n.visitor&&n.visitor(u),u}var a,i=function(r){return r},p={};function l(r){var t=(r.type||"").toLowerCase(),e=l.map;e&&e.hasOwnProperty(t)?(r.type=e[t],r.props=Object.keys(r.props||{}).reduce(function(t,e){var o;return t[(o=e,o.replace(/-(.)/g,function(r,t){return t.toUpperCase()}))]=r.props[e],t},{})):r.type=t.replace(/[^a-z0-9-]/i,"");}var Markup = (function(t){function i(){t.apply(this,arguments);}return t&&(i.__proto__=t),(i.prototype=Object.create(t&&t.prototype)).constructor=i,i.setReviver=function(r){a=r;},i.prototype.shouldComponentUpdate=function(r){var t=this.props;return r.wrap!==t.wrap||r.type!==t.type||r.markup!==t.markup},i.prototype.setComponents=function(r){if(this.map={},r)for(var t in r)if(r.hasOwnProperty(t)){var e=t.replace(/([A-Z]+)([A-Z][a-z0-9])|([a-z0-9]+)([A-Z])/g,"$1$3-$2$4").toLowerCase();this.map[e]=r[t];}},i.prototype.render=function(t){var i=t.wrap;void 0===i&&(i=!0);var s,u=t.type,c=t.markup,m=t.components,v=t.reviver,f=t.onError,d=t["allow-scripts"],h=t["allow-events"],y=t.trim,w=function(r,t){var e={};for(var o in r)Object.prototype.hasOwnProperty.call(r,o)&&-1===t.indexOf(o)&&(e[o]=r[o]);return e}(t,["wrap","type","markup","components","reviver","onError","allow-scripts","allow-events","trim"]),C=v||this.reviver||this.constructor.prototype.reviver||a||v$1;this.setComponents(m);var g={allowScripts:d,allowEvents:h,trim:y};try{s=function(r,t,a,i,s){var u=function(r,t){var o,n,a,i,p="html"===t?"text/html":"application/xml";"html"===t?(i="body",a="<!DOCTYPE html>\n<html><body>"+r+"</body></html>"):(i="xml",a='<?xml version="1.0" encoding="UTF-8"?>\n<xml>'+r+"</xml>");try{o=(new DOMParser).parseFromString(a,p);}catch(r){n=r;}if(o||"html"!==t||((o=e||(e=function(){if(document.implementation&&document.implementation.createHTMLDocument)return document.implementation.createHTMLDocument("");var r=document.createElement("iframe");return r.style.cssText="position:absolute; left:0; top:-999em; width:1px; height:1px; overflow:hidden;",r.setAttribute("sandbox","allow-forms"),document.body.appendChild(r),r.contentWindow.document}())).open(),o.write(a),o.close()),o){var l=o.getElementsByTagName(i)[0],s=l.firstChild;return r&&!s&&(l.error="Document parse failed."),s&&"parsererror"===String(s.nodeName).toLowerCase()&&(s.removeChild(s.firstChild),s.removeChild(s.lastChild),l.error=s.textContent||s.nodeValue||n||"Unknown error",l.removeChild(s)),l}}(r,t);if(u&&u.error)throw new Error(u.error);var c=u&&u.body||u;l.map=i||p;var m=c&&function(r,t,e,a){return n.visitor=t,n.h=e,n.options=a||o,n(r)}(c,l,a,s);return l.map=null,m&&m.props&&m.props.children||null}(c,u,C,this.map,g);}catch(r){f?f({error:r}):"undefined"!=typeof console&&console.error&&console.error("preact-markup: "+r);}if(!1===i)return s||null;var x=w.hasOwnProperty("className")?"className":"class",b=w[x];return b?b.splice?b.splice(0,0,"markup"):"string"==typeof b?w[x]+=" markup":"object"==typeof b&&(b.markup=!0):w[x]="markup",C("div",w,s||null)},i}(_$1));

  const CLASS_PATTERN = /^class[ {]/;


  /**
   * @param {function} fn
   *
   * @return {boolean}
   */
  function isClass(fn) {
    return CLASS_PATTERN.test(fn.toString());
  }

  /**
   * @param {any} obj
   *
   * @return {boolean}
   */
  function isArray(obj) {
    return Array.isArray(obj);
  }

  /**
   * @param {any} obj
   * @param {string} prop
   *
   * @return {boolean}
   */
  function hasOwnProp(obj, prop) {
    return Object.prototype.hasOwnProperty.call(obj, prop);
  }

  /**
   * @typedef {import('./index').InjectAnnotated } InjectAnnotated
   */

  /**
   * @template T
   *
   * @params {[...string[], T] | ...string[], T} args
   *
   * @return {T & InjectAnnotated}
   */
  function annotate(...args) {

    if (args.length === 1 && isArray(args[0])) {
      args = args[0];
    }

    args = [ ...args ];

    const fn = args.pop();

    fn.$inject = args;

    return fn;
  }


  // Current limitations:
  // - can't put into "function arg" comments
  // function /* (no parenthesis like this) */ (){}
  // function abc( /* xx (no parenthesis like this) */ a, b) {}
  //
  // Just put the comment before function or inside:
  // /* (((this is fine))) */ function(a, b) {}
  // function abc(a) { /* (((this is fine))) */}
  //
  // - can't reliably auto-annotate constructor; we'll match the
  // first constructor(...) pattern found which may be the one
  // of a nested class, too.

  const CONSTRUCTOR_ARGS = /constructor\s*[^(]*\(\s*([^)]*)\)/m;
  const FN_ARGS = /^(?:async\s+)?(?:function\s*[^(]*)?(?:\(\s*([^)]*)\)|(\w+))/m;
  const FN_ARG = /\/\*([^*]*)\*\//m;

  /**
   * @param {unknown} fn
   *
   * @return {string[]}
   */
  function parseAnnotations(fn) {

    if (typeof fn !== 'function') {
      throw new Error(`Cannot annotate "${fn}". Expected a function!`);
    }

    const match = fn.toString().match(isClass(fn) ? CONSTRUCTOR_ARGS : FN_ARGS);

    // may parse class without constructor
    if (!match) {
      return [];
    }

    const args = match[1] || match[2];

    return args && args.split(',').map(arg => {
      const argMatch = arg.match(FN_ARG);
      return (argMatch && argMatch[1] || arg).trim();
    }) || [];
  }

  /**
   * @typedef { import('./index').ModuleDeclaration } ModuleDeclaration
   * @typedef { import('./index').ModuleDefinition } ModuleDefinition
   * @typedef { import('./index').InjectorContext } InjectorContext
   */

  /**
   * Create a new injector with the given modules.
   *
   * @param {ModuleDefinition[]} modules
   * @param {InjectorContext} [parent]
   */
  function Injector(modules, parent) {
    parent = parent || {
      get: function(name, strict) {
        currentlyResolving.push(name);

        if (strict === false) {
          return null;
        } else {
          throw error(`No provider for "${ name }"!`);
        }
      }
    };

    const currentlyResolving = [];
    const providers = this._providers = Object.create(parent._providers || null);
    const instances = this._instances = Object.create(null);

    const self = instances.injector = this;

    const error = function(msg) {
      const stack = currentlyResolving.join(' -> ');
      currentlyResolving.length = 0;
      return new Error(stack ? `${ msg } (Resolving: ${ stack })` : msg);
    };

    /**
     * Return a named service.
     *
     * @param {string} name
     * @param {boolean} [strict=true] if false, resolve missing services to null
     *
     * @return {any}
     */
    function get(name, strict) {
      if (!providers[name] && name.indexOf('.') !== -1) {
        const parts = name.split('.');
        let pivot = get(parts.shift());

        while (parts.length) {
          pivot = pivot[parts.shift()];
        }

        return pivot;
      }

      if (hasOwnProp(instances, name)) {
        return instances[name];
      }

      if (hasOwnProp(providers, name)) {
        if (currentlyResolving.indexOf(name) !== -1) {
          currentlyResolving.push(name);
          throw error('Cannot resolve circular dependency!');
        }

        currentlyResolving.push(name);
        instances[name] = providers[name][0](providers[name][1]);
        currentlyResolving.pop();

        return instances[name];
      }

      return parent.get(name, strict);
    }

    function fnDef(fn, locals) {

      if (typeof locals === 'undefined') {
        locals = {};
      }

      if (typeof fn !== 'function') {
        if (isArray(fn)) {
          fn = annotate(fn.slice());
        } else {
          throw error(`Cannot invoke "${ fn }". Expected a function!`);
        }
      }

      const inject = fn.$inject || parseAnnotations(fn);
      const dependencies = inject.map(dep => {
        if (hasOwnProp(locals, dep)) {
          return locals[dep];
        } else {
          return get(dep);
        }
      });

      return {
        fn: fn,
        dependencies: dependencies
      };
    }

    function instantiate(Type) {
      const {
        fn,
        dependencies
      } = fnDef(Type);

      // instantiate var args constructor
      const Constructor = Function.prototype.bind.apply(fn, [ null ].concat(dependencies));

      return new Constructor();
    }

    function invoke(func, context, locals) {
      const {
        fn,
        dependencies
      } = fnDef(func, locals);

      return fn.apply(context, dependencies);
    }

    /**
     * @param {Injector} childInjector
     *
     * @return {Function}
     */
    function createPrivateInjectorFactory(childInjector) {
      return annotate(key => childInjector.get(key));
    }

    /**
     * @param {ModuleDefinition[]} modules
     * @param {string[]} [forceNewInstances]
     *
     * @return {Injector}
     */
    function createChild(modules, forceNewInstances) {
      if (forceNewInstances && forceNewInstances.length) {
        const fromParentModule = Object.create(null);
        const matchedScopes = Object.create(null);

        const privateInjectorsCache = [];
        const privateChildInjectors = [];
        const privateChildFactories = [];

        let provider;
        let cacheIdx;
        let privateChildInjector;
        let privateChildInjectorFactory;

        for (let name in providers) {
          provider = providers[name];

          if (forceNewInstances.indexOf(name) !== -1) {
            if (provider[2] === 'private') {
              cacheIdx = privateInjectorsCache.indexOf(provider[3]);
              if (cacheIdx === -1) {
                privateChildInjector = provider[3].createChild([], forceNewInstances);
                privateChildInjectorFactory = createPrivateInjectorFactory(privateChildInjector);
                privateInjectorsCache.push(provider[3]);
                privateChildInjectors.push(privateChildInjector);
                privateChildFactories.push(privateChildInjectorFactory);
                fromParentModule[name] = [ privateChildInjectorFactory, name, 'private', privateChildInjector ];
              } else {
                fromParentModule[name] = [ privateChildFactories[cacheIdx], name, 'private', privateChildInjectors[cacheIdx] ];
              }
            } else {
              fromParentModule[name] = [ provider[2], provider[1] ];
            }
            matchedScopes[name] = true;
          }

          if ((provider[2] === 'factory' || provider[2] === 'type') && provider[1].$scope) {
            /* jshint -W083 */
            forceNewInstances.forEach(scope => {
              if (provider[1].$scope.indexOf(scope) !== -1) {
                fromParentModule[name] = [ provider[2], provider[1] ];
                matchedScopes[scope] = true;
              }
            });
          }
        }

        forceNewInstances.forEach(scope => {
          if (!matchedScopes[scope]) {
            throw new Error('No provider for "' + scope + '". Cannot use provider from the parent!');
          }
        });

        modules.unshift(fromParentModule);
      }

      return new Injector(modules, self);
    }

    const factoryMap = {
      factory: invoke,
      type: instantiate,
      value: function(value) {
        return value;
      }
    };

    /**
     * @param {ModuleDefinition} moduleDefinition
     * @param {Injector} injector
     */
    function createInitializer(moduleDefinition, injector) {

      const initializers = moduleDefinition.__init__ || [];

      return function() {
        initializers.forEach(initializer => {

          // eagerly resolve component (fn or string)
          if (typeof initializer === 'string') {
            injector.get(initializer);
          } else {
            injector.invoke(initializer);
          }
        });
      };
    }

    /**
     * @param {ModuleDefinition} moduleDefinition
     */
    function loadModule(moduleDefinition) {

      const moduleExports = moduleDefinition.__exports__;

      // private module
      if (moduleExports) {
        const nestedModules = moduleDefinition.__modules__;

        const clonedModule = Object.keys(moduleDefinition).reduce((clonedModule, key) => {

          if (key !== '__exports__' && key !== '__modules__' && key !== '__init__' && key !== '__depends__') {
            clonedModule[key] = moduleDefinition[key];
          }

          return clonedModule;
        }, Object.create(null));

        const childModules = (nestedModules || []).concat(clonedModule);

        const privateInjector = createChild(childModules);
        const getFromPrivateInjector = annotate(function(key) {
          return privateInjector.get(key);
        });

        moduleExports.forEach(function(key) {
          providers[key] = [ getFromPrivateInjector, key, 'private', privateInjector ];
        });

        // ensure child injector initializes
        const initializers = (moduleDefinition.__init__ || []).slice();

        initializers.unshift(function() {
          privateInjector.init();
        });

        moduleDefinition = Object.assign({}, moduleDefinition, {
          __init__: initializers
        });

        return createInitializer(moduleDefinition, privateInjector);
      }

      // normal module
      Object.keys(moduleDefinition).forEach(function(key) {

        if (key === '__init__' || key === '__depends__') {
          return;
        }

        if (moduleDefinition[key][2] === 'private') {
          providers[key] = moduleDefinition[key];
          return;
        }

        const type = moduleDefinition[key][0];
        const value = moduleDefinition[key][1];

        providers[key] = [ factoryMap[type], arrayUnwrap(type, value), type ];
      });

      return createInitializer(moduleDefinition, self);
    }

    /**
     * @param {ModuleDefinition[]} moduleDefinitions
     * @param {ModuleDefinition} moduleDefinition
     *
     * @return {ModuleDefinition[]}
     */
    function resolveDependencies(moduleDefinitions, moduleDefinition) {

      if (moduleDefinitions.indexOf(moduleDefinition) !== -1) {
        return moduleDefinitions;
      }

      moduleDefinitions = (moduleDefinition.__depends__ || []).reduce(resolveDependencies, moduleDefinitions);

      if (moduleDefinitions.indexOf(moduleDefinition) !== -1) {
        return moduleDefinitions;
      }

      return moduleDefinitions.concat(moduleDefinition);
    }

    /**
     * @param {ModuleDefinition[]} moduleDefinitions
     *
     * @return { () => void } initializerFn
     */
    function bootstrap(moduleDefinitions) {

      const initializers = moduleDefinitions
        .reduce(resolveDependencies, [])
        .map(loadModule);

      let initialized = false;

      return function() {

        if (initialized) {
          return;
        }

        initialized = true;

        initializers.forEach(initializer => initializer());
      };
    }

    // public API
    this.get = get;
    this.invoke = invoke;
    this.instantiate = instantiate;
    this.createChild = createChild;

    // setup
    this.init = bootstrap(modules);
  }


  // helpers ///////////////

  function arrayUnwrap(type, value) {
    if (type !== 'value' && isArray(value)) {
      value = annotate(value.slice());
    }

    return value;
  }

  /**
   * @typedef {object} Condition
   * @property {string} [hide]
   */

  class ConditionChecker {
    constructor(formFieldRegistry, eventBus) {
      this._formFieldRegistry = formFieldRegistry;
      this._eventBus = eventBus;
    }

    /**
     * For given data, remove properties based on condition.
     *
     * @param {Object<string, any>} properties
     * @param {Object<string, any>} data
     */
    applyConditions(properties, data = {}) {
      const conditions = this._getConditions();
      const newProperties = {
        ...properties
      };
      for (const {
        key,
        condition
      } of conditions) {
        const shouldRemove = this._checkHideCondition(condition, data);
        if (shouldRemove) {
          delete newProperties[key];
        }
      }
      return newProperties;
    }

    /**
     * Check if given condition is met. Returns null for invalid/missing conditions.
     *
     * @param {string} condition
     * @param {import('../types').Data} [data]
     *
     * @returns {boolean|null}
     */
    check(condition, data = {}) {
      if (!condition) {
        return null;
      }
      if (!isString$2(condition) || !condition.startsWith('=')) {
        return null;
      }
      try {
        // cut off initial '='
        const result = unaryTest(condition.slice(1), data);
        return result;
      } catch (error) {
        this._eventBus.fire('error', {
          error
        });
        return null;
      }
    }

    /**
     * Check if hide condition is met.
     *
     * @param {Condition} condition
     * @param {Object<string, any>} data
     * @returns {boolean}
     */
    _checkHideCondition(condition, data) {
      if (!condition.hide) {
        return false;
      }
      const result = this.check(condition.hide, data);
      return result === true;
    }

    /**
     * Evaluate an expression.
     *
     * @param {string} expression
     * @param {import('../types').Data} [data]
     *
     * @returns {any}
     */
    evaluate(expression, data = {}) {
      if (!expression) {
        return null;
      }
      if (!isString$2(expression) || !expression.startsWith('=')) {
        return null;
      }
      try {
        const result = evaluate(expression.slice(1), data);
        return result;
      } catch (error) {
        this._eventBus.fire('error', {
          error
        });
        return null;
      }
    }
    _getConditions() {
      const formFields = this._formFieldRegistry.getAll();
      return formFields.reduce((conditions, formField) => {
        const {
          key,
          conditional: condition
        } = formField;
        if (key && condition) {
          return [...conditions, {
            key,
            condition
          }];
        }
        return conditions;
      }, []);
    }
  }
  ConditionChecker.$inject = ['formFieldRegistry', 'eventBus'];

  var FN_REF = '__fn';
  var DEFAULT_PRIORITY = 1000;
  var slice = Array.prototype.slice;

  /**
   * A general purpose event bus.
   *
   * This component is used to communicate across a diagram instance.
   * Other parts of a diagram can use it to listen to and broadcast events.
   *
   *
   * ## Registering for Events
   *
   * The event bus provides the {@link EventBus#on} and {@link EventBus#once}
   * methods to register for events. {@link EventBus#off} can be used to
   * remove event registrations. Listeners receive an instance of {@link Event}
   * as the first argument. It allows them to hook into the event execution.
   *
   * ```javascript
   *
   * // listen for event
   * eventBus.on('foo', function(event) {
   *
   *   // access event type
   *   event.type; // 'foo'
   *
   *   // stop propagation to other listeners
   *   event.stopPropagation();
   *
   *   // prevent event default
   *   event.preventDefault();
   * });
   *
   * // listen for event with custom payload
   * eventBus.on('bar', function(event, payload) {
   *   console.log(payload);
   * });
   *
   * // listen for event returning value
   * eventBus.on('foobar', function(event) {
   *
   *   // stop event propagation + prevent default
   *   return false;
   *
   *   // stop event propagation + return custom result
   *   return {
   *     complex: 'listening result'
   *   };
   * });
   *
   *
   * // listen with custom priority (default=1000, higher is better)
   * eventBus.on('priorityfoo', 1500, function(event) {
   *   console.log('invoked first!');
   * });
   *
   *
   * // listen for event and pass the context (`this`)
   * eventBus.on('foobar', function(event) {
   *   this.foo();
   * }, this);
   * ```
   *
   *
   * ## Emitting Events
   *
   * Events can be emitted via the event bus using {@link EventBus#fire}.
   *
   * ```javascript
   *
   * // false indicates that the default action
   * // was prevented by listeners
   * if (eventBus.fire('foo') === false) {
   *   console.log('default has been prevented!');
   * };
   *
   *
   * // custom args + return value listener
   * eventBus.on('sum', function(event, a, b) {
   *   return a + b;
   * });
   *
   * // you can pass custom arguments + retrieve result values.
   * var sum = eventBus.fire('sum', 1, 2);
   * console.log(sum); // 3
   * ```
   */
  function EventBus() {
    this._listeners = {};

    // cleanup on destroy on lowest priority to allow
    // message passing until the bitter end
    this.on('diagram.destroy', 1, this._destroy, this);
  }

  /**
   * Register an event listener for events with the given name.
   *
   * The callback will be invoked with `event, ...additionalArguments`
   * that have been passed to {@link EventBus#fire}.
   *
   * Returning false from a listener will prevent the events default action
   * (if any is specified). To stop an event from being processed further in
   * other listeners execute {@link Event#stopPropagation}.
   *
   * Returning anything but `undefined` from a listener will stop the listener propagation.
   *
   * @param {string|Array<string>} events
   * @param {number} [priority=1000] the priority in which this listener is called, larger is higher
   * @param {Function} callback
   * @param {Object} [that] Pass context (`this`) to the callback
   */
  EventBus.prototype.on = function (events, priority, callback, that) {
    events = isArray$2(events) ? events : [events];
    if (isFunction(priority)) {
      that = callback;
      callback = priority;
      priority = DEFAULT_PRIORITY;
    }
    if (!isNumber$2(priority)) {
      throw new Error('priority must be a number');
    }
    var actualCallback = callback;
    if (that) {
      actualCallback = bind(callback, that);

      // make sure we remember and are able to remove
      // bound callbacks via {@link #off} using the original
      // callback
      actualCallback[FN_REF] = callback[FN_REF] || callback;
    }
    var self = this;
    events.forEach(function (e) {
      self._addListener(e, {
        priority: priority,
        callback: actualCallback,
        next: null
      });
    });
  };

  /**
   * Register an event listener that is executed only once.
   *
   * @param {string} event the event name to register for
   * @param {number} [priority=1000] the priority in which this listener is called, larger is higher
   * @param {Function} callback the callback to execute
   * @param {Object} [that] Pass context (`this`) to the callback
   */
  EventBus.prototype.once = function (event, priority, callback, that) {
    var self = this;
    if (isFunction(priority)) {
      that = callback;
      callback = priority;
      priority = DEFAULT_PRIORITY;
    }
    if (!isNumber$2(priority)) {
      throw new Error('priority must be a number');
    }
    function wrappedCallback() {
      wrappedCallback.__isTomb = true;
      var result = callback.apply(that, arguments);
      self.off(event, wrappedCallback);
      return result;
    }

    // make sure we remember and are able to remove
    // bound callbacks via {@link #off} using the original
    // callback
    wrappedCallback[FN_REF] = callback;
    this.on(event, priority, wrappedCallback);
  };

  /**
   * Removes event listeners by event and callback.
   *
   * If no callback is given, all listeners for a given event name are being removed.
   *
   * @param {string|Array<string>} events
   * @param {Function} [callback]
   */
  EventBus.prototype.off = function (events, callback) {
    events = isArray$2(events) ? events : [events];
    var self = this;
    events.forEach(function (event) {
      self._removeListener(event, callback);
    });
  };

  /**
   * Create an EventBus event.
   *
   * @param {Object} data
   *
   * @return {Object} event, recognized by the eventBus
   */
  EventBus.prototype.createEvent = function (data) {
    var event = new InternalEvent();
    event.init(data);
    return event;
  };

  /**
   * Fires a named event.
   *
   * @example
   *
   * // fire event by name
   * events.fire('foo');
   *
   * // fire event object with nested type
   * var event = { type: 'foo' };
   * events.fire(event);
   *
   * // fire event with explicit type
   * var event = { x: 10, y: 20 };
   * events.fire('element.moved', event);
   *
   * // pass additional arguments to the event
   * events.on('foo', function(event, bar) {
   *   alert(bar);
   * });
   *
   * events.fire({ type: 'foo' }, 'I am bar!');
   *
   * @param {string} [name] the optional event name
   * @param {Object} [event] the event object
   * @param {...Object} additional arguments to be passed to the callback functions
   *
   * @return {boolean} the events return value, if specified or false if the
   *                   default action was prevented by listeners
   */
  EventBus.prototype.fire = function (type, data) {
    var event, firstListener, returnValue, args;
    args = slice.call(arguments);
    if (typeof type === 'object') {
      data = type;
      type = data.type;
    }
    if (!type) {
      throw new Error('no event type specified');
    }
    firstListener = this._listeners[type];
    if (!firstListener) {
      return;
    }

    // we make sure we fire instances of our home made
    // events here. We wrap them only once, though
    if (data instanceof InternalEvent) {
      // we are fine, we alread have an event
      event = data;
    } else {
      event = this.createEvent(data);
    }

    // ensure we pass the event as the first parameter
    args[0] = event;

    // original event type (in case we delegate)
    var originalType = event.type;

    // update event type before delegation
    if (type !== originalType) {
      event.type = type;
    }
    try {
      returnValue = this._invokeListeners(event, args, firstListener);
    } finally {
      // reset event type after delegation
      if (type !== originalType) {
        event.type = originalType;
      }
    }

    // set the return value to false if the event default
    // got prevented and no other return value exists
    if (returnValue === undefined && event.defaultPrevented) {
      returnValue = false;
    }
    return returnValue;
  };
  EventBus.prototype.handleError = function (error) {
    return this.fire('error', {
      error: error
    }) === false;
  };
  EventBus.prototype._destroy = function () {
    this._listeners = {};
  };
  EventBus.prototype._invokeListeners = function (event, args, listener) {
    var returnValue;
    while (listener) {
      // handle stopped propagation
      if (event.cancelBubble) {
        break;
      }
      returnValue = this._invokeListener(event, args, listener);
      listener = listener.next;
    }
    return returnValue;
  };
  EventBus.prototype._invokeListener = function (event, args, listener) {
    var returnValue;
    if (listener.callback.__isTomb) {
      return returnValue;
    }
    try {
      // returning false prevents the default action
      returnValue = invokeFunction(listener.callback, args);

      // stop propagation on return value
      if (returnValue !== undefined) {
        event.returnValue = returnValue;
        event.stopPropagation();
      }

      // prevent default on return false
      if (returnValue === false) {
        event.preventDefault();
      }
    } catch (error) {
      if (!this.handleError(error)) {
        console.error('unhandled error in event listener', error);
        throw error;
      }
    }
    return returnValue;
  };

  /*
   * Add new listener with a certain priority to the list
   * of listeners (for the given event).
   *
   * The semantics of listener registration / listener execution are
   * first register, first serve: New listeners will always be inserted
   * after existing listeners with the same priority.
   *
   * Example: Inserting two listeners with priority 1000 and 1300
   *
   *    * before: [ 1500, 1500, 1000, 1000 ]
   *    * after: [ 1500, 1500, (new=1300), 1000, 1000, (new=1000) ]
   *
   * @param {string} event
   * @param {Object} listener { priority, callback }
   */
  EventBus.prototype._addListener = function (event, newListener) {
    var listener = this._getListeners(event),
      previousListener;

    // no prior listeners
    if (!listener) {
      this._setListeners(event, newListener);
      return;
    }

    // ensure we order listeners by priority from
    // 0 (high) to n > 0 (low)
    while (listener) {
      if (listener.priority < newListener.priority) {
        newListener.next = listener;
        if (previousListener) {
          previousListener.next = newListener;
        } else {
          this._setListeners(event, newListener);
        }
        return;
      }
      previousListener = listener;
      listener = listener.next;
    }

    // add new listener to back
    previousListener.next = newListener;
  };
  EventBus.prototype._getListeners = function (name) {
    return this._listeners[name];
  };
  EventBus.prototype._setListeners = function (name, listener) {
    this._listeners[name] = listener;
  };
  EventBus.prototype._removeListener = function (event, callback) {
    var listener = this._getListeners(event),
      nextListener,
      previousListener,
      listenerCallback;
    if (!callback) {
      // clear listeners
      this._setListeners(event, null);
      return;
    }
    while (listener) {
      nextListener = listener.next;
      listenerCallback = listener.callback;
      if (listenerCallback === callback || listenerCallback[FN_REF] === callback) {
        if (previousListener) {
          previousListener.next = nextListener;
        } else {
          // new first listener
          this._setListeners(event, nextListener);
        }
      }
      previousListener = listener;
      listener = nextListener;
    }
  };

  /**
   * A event that is emitted via the event bus.
   */
  function InternalEvent() {}
  InternalEvent.prototype.stopPropagation = function () {
    this.cancelBubble = true;
  };
  InternalEvent.prototype.preventDefault = function () {
    this.defaultPrevented = true;
  };
  InternalEvent.prototype.init = function (data) {
    assign(this, data || {});
  };

  /**
   * Invoke function. Be fast...
   *
   * @param {Function} fn
   * @param {Array<Object>} args
   *
   * @return {Any}
   */
  function invokeFunction(fn, args) {
    return fn.apply(null, args);
  }

  function countDecimals(number) {
    const num = Big(number);
    if (num.toString() === num.toFixed(0)) return 0;
    return num.toFixed().split('.')[1].length || 0;
  }
  function isValidNumber(value) {
    return (typeof value === 'number' || typeof value === 'string') && value !== '' && !isNaN(Number(value));
  }
  function willKeyProduceValidNumber(key, previousValue, caretIndex, selectionWidth, decimalDigits) {
    // Dot and comma are both treated as dot
    previousValue = previousValue.replace(',', '.');
    const isFirstDot = !previousValue.includes('.') && (key === '.' || key === ',');
    const isFirstMinus = !previousValue.includes('-') && key === '-' && caretIndex === 0;
    const keypressIsNumeric = /^[0-9]$/i.test(key);
    const dotIndex = previousValue === undefined ? -1 : previousValue.indexOf('.');

    // If the caret is positioned after a dot, and the current decimal digits count is equal or greater to the maximum, disallow the key press
    const overflowsDecimalSpace = typeof decimalDigits === 'number' && selectionWidth === 0 && dotIndex !== -1 && previousValue.includes('.') && previousValue.split('.')[1].length >= decimalDigits && caretIndex > dotIndex;
    const keypressIsAllowedChar = keypressIsNumeric || decimalDigits !== 0 && isFirstDot || isFirstMinus;
    return keypressIsAllowedChar && !overflowsDecimalSpace;
  }
  function isNullEquivalentValue(value) {
    return value === undefined || value === null || value === '';
  }

  const EMAIL_PATTERN = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  const PHONE_PATTERN = /(\+|00)(297|93|244|1264|358|355|376|971|54|374|1684|1268|61|43|994|257|32|229|226|880|359|973|1242|387|590|375|501|1441|591|55|1246|673|975|267|236|1|61|41|56|86|225|237|243|242|682|57|269|238|506|53|5999|61|1345|357|420|49|253|1767|45|1809|1829|1849|213|593|20|291|212|34|372|251|358|679|500|33|298|691|241|44|995|44|233|350|224|590|220|245|240|30|1473|299|502|594|1671|592|852|504|385|509|36|62|44|91|246|353|98|964|354|972|39|1876|44|962|81|76|77|254|996|855|686|1869|82|383|965|856|961|231|218|1758|423|94|266|370|352|371|853|590|212|377|373|261|960|52|692|389|223|356|95|382|976|1670|258|222|1664|596|230|265|60|262|264|687|227|672|234|505|683|31|47|977|674|64|968|92|507|64|51|63|680|675|48|1787|1939|850|351|595|970|689|974|262|40|7|250|966|249|221|65|500|4779|677|232|503|378|252|508|381|211|239|597|421|386|46|268|1721|248|963|1649|235|228|66|992|690|993|670|676|1868|216|90|688|886|255|256|380|598|1|998|3906698|379|1784|58|1284|1340|84|678|681|685|967|27|260|263)(9[976]\d|8[987530]\d|6[987]\d|5[90]\d|42\d|3[875]\d|2[98654321]\d|9[8543210]|8[6421]|6[6543210]|5[87654321]|4[987654310]|3[9643210]|2[70]|7|1)\d{4,20}$/;
  class Validator {
    validateField(field, value) {
      const {
        type,
        validate
      } = field;
      let errors = [];
      if (type === 'number') {
        const {
          decimalDigits,
          step
        } = field;
        if (value === 'NaN') {
          errors = [...errors, 'Value is not a number.'];
        } else if (value) {
          if (decimalDigits >= 0 && countDecimals(value) > decimalDigits) {
            errors = [...errors, 'Value is expected to ' + (decimalDigits === 0 ? 'be an integer' : `have at most ${decimalDigits} decimal digit${decimalDigits > 1 ? 's' : ''}`) + '.'];
          }
          if (step) {
            const bigValue = Big(value);
            const bigStep = Big(step);
            const offset = bigValue.mod(bigStep);
            if (offset.cmp(0) !== 0) {
              const previousValue = bigValue.minus(offset);
              const nextValue = previousValue.plus(bigStep);
              errors = [...errors, `Please select a valid value, the two nearest valid values are ${previousValue} and ${nextValue}.`];
            }
          }
        }
      }
      if (!validate) {
        return errors;
      }
      if (validate.pattern && value && !new RegExp(validate.pattern).test(value)) {
        errors = [...errors, `Field must match pattern ${validate.pattern}.`];
      }
      if (validate.required && (isNil(value) || value === '')) {
        errors = [...errors, 'Field is required.'];
      }
      if ('min' in validate && value && value < validate.min) {
        errors = [...errors, `Field must have minimum value of ${validate.min}.`];
      }
      if ('max' in validate && value && value > validate.max) {
        errors = [...errors, `Field must have maximum value of ${validate.max}.`];
      }
      if ('minLength' in validate && value && value.trim().length < validate.minLength) {
        errors = [...errors, `Field must have minimum length of ${validate.minLength}.`];
      }
      if ('maxLength' in validate && value && value.trim().length > validate.maxLength) {
        errors = [...errors, `Field must have maximum length of ${validate.maxLength}.`];
      }
      if ('validationType' in validate && value && validate.validationType === 'phone' && !PHONE_PATTERN.test(value)) {
        errors = [...errors, 'Field must be a valid  international phone number. (e.g. +4930664040900)'];
      }
      if ('validationType' in validate && value && validate.validationType === 'email' && !EMAIL_PATTERN.test(value)) {
        errors = [...errors, 'Field must be a valid email.'];
      }
      return errors;
    }
  }
  Validator.$inject = [];

  class FormFieldRegistry {
    constructor(eventBus) {
      this._eventBus = eventBus;
      this._formFields = {};
      eventBus.on('form.clear', () => this.clear());
      this._ids = new Ids([32, 36, 1]);
      this._keys = new Ids([32, 36, 1]);
    }
    add(formField) {
      const {
        id
      } = formField;
      if (this._formFields[id]) {
        throw new Error(`form field with ID ${id} already exists`);
      }
      this._eventBus.fire('formField.add', {
        formField
      });
      this._formFields[id] = formField;
    }
    remove(formField) {
      const {
        id
      } = formField;
      if (!this._formFields[id]) {
        return;
      }
      this._eventBus.fire('formField.remove', {
        formField
      });
      delete this._formFields[id];
    }
    get(id) {
      return this._formFields[id];
    }
    getAll() {
      return Object.values(this._formFields);
    }
    forEach(callback) {
      this.getAll().forEach(formField => callback(formField));
    }
    clear() {
      this._formFields = {};
      this._ids.clear();
      this._keys.clear();
    }
  }
  FormFieldRegistry.$inject = ['eventBus'];

  /**
   * Retrieve variable names from given FEEL unary test.
   *
   * @param {string} unaryTest
   * @returns {string[]}
   */
  function getVariableNames(unaryTest) {
    const tree = parseUnaryTests(unaryTest);
    const cursor = tree.cursor();
    const variables = new Set();
    do {
      const node = cursor.node;
      if (node.type.name === 'VariableName') {
        variables.add(unaryTest.slice(node.from, node.to));
      }
    } while (cursor.next());
    return Array.from(variables);
  }

  /**
   * Retrieve variable names from given FEEL expression.
   *
   * @param {string} expression
   * @returns {string[]}
   */
  function getExpressionVariableNames(expression) {
    const tree = parseExpressions(expression);
    const cursor = tree.cursor();
    const variables = new Set();
    do {
      const node = cursor.node;
      if (node.type.name === 'VariableName') {
        variables.add(expression.slice(node.from, node.to));
      }
    } while (cursor.next());
    return Array.from(variables);
  }
  function isExpression$2(value) {
    return isString$2(value) && value.startsWith('=');
  }

  // config  ///////////////////

  const MINUTES_IN_DAY = 60 * 24;
  const DATETIME_SUBTYPES = {
    DATE: 'date',
    TIME: 'time',
    DATETIME: 'datetime'
  };
  const TIME_SERIALISING_FORMATS = {
    UTC_OFFSET: 'utc_offset',
    UTC_NORMALIZED: 'utc_normalized',
    NO_TIMEZONE: 'no_timezone'
  };
  const DATETIME_SUBTYPE_PATH = ['subtype'];
  const DATE_LABEL_PATH = ['dateLabel'];

  function createInjector(bootstrapModules) {
    const injector = new Injector(bootstrapModules);
    injector.init();
    return injector;
  }

  /**
   * @param {string?} prefix
   *
   * @returns Element
   */
  function createFormContainer(prefix = 'fjs') {
    const container = document.createElement('div');
    container.classList.add(`${prefix}-container`);
    return container;
  }

  const EXPRESSION_PROPERTIES = ['alt', 'source', 'text'];
  function findErrors(errors, path) {
    return errors[pathStringify(path)];
  }
  function pathStringify(path) {
    if (!path) {
      return '';
    }
    return path.join('.');
  }
  const indices = {};
  function generateIndexForType(type) {
    if (type in indices) {
      indices[type]++;
    } else {
      indices[type] = 1;
    }
    return indices[type];
  }
  function generateIdForType(type) {
    return `${type}${generateIndexForType(type)}`;
  }

  /**
   * @template T
   * @param {T} data
   * @param {(this: any, key: string, value: any) => any} [replacer]
   * @return {T}
   */
  function clone(data, replacer) {
    return JSON.parse(JSON.stringify(data, replacer));
  }

  /**
   * Parse the schema for input variables a form might make use of
   *
   * @param {any} schema
   *
   * @return {string[]}
   */
  function getSchemaVariables(schema) {
    if (!schema.components) {
      return [];
    }
    const variables = schema.components.reduce((variables, component) => {
      const {
        key,
        valuesKey,
        type,
        conditional
      } = component;
      if (['button'].includes(type)) {
        return variables;
      }
      if (key) {
        variables = [...variables, key];
      }
      if (valuesKey) {
        variables = [...variables, valuesKey];
      }
      if (conditional && conditional.hide) {
        // cut off initial '='
        const conditionVariables = getVariableNames(conditional.hide.slice(1));
        variables = [...variables, ...conditionVariables];
      }
      EXPRESSION_PROPERTIES.forEach(prop => {
        const property = component[prop];
        if (property && isExpression$1(property)) {
          // cut off initial '='
          const expressionVariables = getExpressionVariableNames(property.slice(1));
          variables = [...variables, ...expressionVariables];
        }
      });
      return variables;
    }, []);

    // remove duplicates
    return Array.from(new Set(variables));
  }

  // helper ///////////////

  function isExpression$1(value) {
    return isString$2(value) && value.startsWith('=');
  }

  class Importer {
    /**
     * @constructor
     * @param { import('../core').FormFieldRegistry } formFieldRegistry
     * @param { import('../render/FormFields').default } formFields
     */
    constructor(formFieldRegistry, formFields) {
      this._formFieldRegistry = formFieldRegistry;
      this._formFields = formFields;
    }

    /**
     * Import schema adding `id`, `_parent` and `_path`
     * information to each field and adding it to the
     * form field registry.
     *
     * @param {any} schema
     * @param {any} [data]
     *
     * @return { { warnings: Array<any>, schema: any, data: any } }
     */
    importSchema(schema, data = {}) {
      // TODO: Add warnings - https://github.com/bpmn-io/form-js/issues/289
      const warnings = [];
      try {
        const importedSchema = this.importFormField(clone(schema)),
          initializedData = this.initializeFieldValues(clone(data));
        return {
          warnings,
          schema: importedSchema,
          data: initializedData
        };
      } catch (err) {
        err.warnings = warnings;
        throw err;
      }
    }

    /**
     * @param {any} formField
     * @param {string} [parentId]
     *
     * @return {any} importedField
     */
    importFormField(formField, parentId) {
      const {
        components,
        key,
        type,
        id = generateIdForType(type)
      } = formField;
      if (parentId) {
        // set form field parent
        formField._parent = parentId;
      }
      if (!this._formFields.get(type)) {
        throw new Error(`form field of type <${type}> not supported`);
      }
      if (key) {
        // validate <key> uniqueness
        if (this._formFieldRegistry._keys.assigned(key)) {
          throw new Error(`form field with key <${key}> already exists`);
        }
        this._formFieldRegistry._keys.claim(key, formField);

        // TODO: buttons should not have key
        if (type !== 'button') {
          // set form field path
          formField._path = [key];
        }
      }
      if (id) {
        // validate <id> uniqueness
        if (this._formFieldRegistry._ids.assigned(id)) {
          throw new Error(`form field with id <${id}> already exists`);
        }
        this._formFieldRegistry._ids.claim(id, formField);
      }

      // set form field ID
      formField.id = id;
      this._formFieldRegistry.add(formField);
      if (components) {
        this.importFormFields(components, id);
      }
      return formField;
    }
    importFormFields(components, parentId) {
      components.forEach(component => {
        this.importFormField(component, parentId);
      });
    }

    /**
     * @param {Object} data
     *
     * @return {Object} initializedData
     */
    initializeFieldValues(data) {
      return this._formFieldRegistry.getAll().reduce((initializedData, formField) => {
        const {
          defaultValue,
          _path,
          type
        } = formField;

        // try to get value from data
        // if unavailable - try to get default value from form field
        // if unavailable - get empty value from form field

        if (_path) {
          const fieldImplementation = this._formFields.get(type);
          let valueData = get(data, _path);
          if (!isUndefined$1(valueData) && fieldImplementation.sanitizeValue) {
            valueData = fieldImplementation.sanitizeValue({
              formField,
              data,
              value: valueData
            });
          }
          const initializedFieldValue = !isUndefined$1(valueData) ? valueData : !isUndefined$1(defaultValue) ? defaultValue : fieldImplementation.emptyValue;
          initializedData = {
            ...initializedData,
            [_path[0]]: initializedFieldValue
          };
        }
        return initializedData;
      }, data);
    }
  }
  Importer.$inject = ['formFieldRegistry', 'formFields'];

  var importModule = {
    importer: ['type', Importer]
  };

  const NODE_TYPE_TEXT = 3,
    NODE_TYPE_ELEMENT = 1;
  const ALLOWED_NODES = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'span', 'em', 'a', 'p', 'div', 'ul', 'ol', 'li', 'hr', 'blockquote', 'img', 'pre', 'code', 'br', 'strong'];
  const ALLOWED_ATTRIBUTES = ['align', 'alt', 'class', 'href', 'id', 'name', 'rel', 'target', 'src'];
  const ALLOWED_URI_PATTERN = /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|cid|xmpp):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i; // eslint-disable-line no-useless-escape
  const ALLOWED_IMAGE_SRC_PATTERN = /^(https?|data):.*/i; // eslint-disable-line no-useless-escape
  const ATTR_WHITESPACE_PATTERN = /[\u0000-\u0020\u00A0\u1680\u180E\u2000-\u2029\u205F\u3000]/g; // eslint-disable-line no-control-regex

  const FORM_ELEMENT = document.createElement('form');

  /**
   * Sanitize a HTML string and return the cleaned, safe version.
   *
   * @param {string} html
   * @return {string}
   */
  function sanitizeHTML(html) {
    const doc = new DOMParser().parseFromString(`<!DOCTYPE html>\n<html><body><div>${html}`, 'text/html');
    doc.normalize();
    const element = doc.body.firstChild;
    if (element) {
      sanitizeNode( /** @type Element */element);
      return new XMLSerializer().serializeToString(element);
    } else {
      // handle the case that document parsing
      // does not work at all, due to HTML gibberish
      return '';
    }
  }
  function sanitizeImageSource(src) {
    const valid = ALLOWED_IMAGE_SRC_PATTERN.test(src);
    return valid ? src : '';
  }

  /**
   * Recursively sanitize a HTML node, potentially
   * removing it, its children or attributes.
   *
   * Inspired by https://github.com/developit/snarkdown/issues/70
   * and https://github.com/cure53/DOMPurify. Simplified
   * for our use-case.
   *
   * @param {Element} node
   */
  function sanitizeNode(node) {
    // allow text nodes
    if (node.nodeType === NODE_TYPE_TEXT) {
      return;
    }

    // disallow all other nodes but Element
    if (node.nodeType !== NODE_TYPE_ELEMENT) {
      return node.remove();
    }
    const lcTag = node.tagName.toLowerCase();

    // disallow non-whitelisted tags
    if (!ALLOWED_NODES.includes(lcTag)) {
      return node.remove();
    }
    const attributes = node.attributes;

    // clean attributes
    for (let i = attributes.length; i--;) {
      const attribute = attributes[i];
      const name = attribute.name;
      const lcName = name.toLowerCase();

      // normalize node value
      const value = attribute.value.trim();
      node.removeAttribute(name);
      const valid = isValidAttribute(lcTag, lcName, value);
      if (valid) {
        node.setAttribute(name, value);
      }
    }

    // force noopener on target="_blank" links
    if (lcTag === 'a' && node.getAttribute('target') === '_blank' && node.getAttribute('rel') !== 'noopener') {
      node.setAttribute('rel', 'noopener');
    }
    for (let i = node.childNodes.length; i--;) {
      sanitizeNode( /** @type Element */node.childNodes[i]);
    }
  }

  /**
   * Validates attributes for validity.
   *
   * @param {string} lcTag
   * @param {string} lcName
   * @param {string} value
   * @return {boolean}
   */
  function isValidAttribute(lcTag, lcName, value) {
    // disallow most attributes based on whitelist
    if (!ALLOWED_ATTRIBUTES.includes(lcName)) {
      return false;
    }

    // disallow "DOM clobbering" / polution of document and wrapping form elements
    if ((lcName === 'id' || lcName === 'name') && (value in document || value in FORM_ELEMENT)) {
      return false;
    }
    if (lcName === 'target' && value !== '_blank') {
      return false;
    }

    // allow valid url links only
    if (lcName === 'href' && !ALLOWED_URI_PATTERN.test(value.replace(ATTR_WHITESPACE_PATTERN, ''))) {
      return false;
    }
    return true;
  }

  function formFieldClasses(type, {
    errors = [],
    disabled = false
  } = {}) {
    if (!type) {
      throw new Error('type required');
    }
    return classNames('fjs-form-field', `fjs-form-field-${type}`, {
      'fjs-has-errors': errors.length > 0,
      'fjs-disabled': disabled
    });
  }
  function prefixId(id, formId) {
    if (formId) {
      return `fjs-form-${formId}-${id}`;
    }
    return `fjs-form-${id}`;
  }
  function markdownToHTML(markdown) {
    const htmls = markdown.toString().split(/(?:\r?\n){2,}/).map(line => /^((\d+.)|[><\s#-*])/.test(line) ? t$2(line) : `<p>${t$2(line)}</p>`);
    return htmls.join('\n\n');
  }

  // see https://github.com/developit/snarkdown/issues/70
  function safeMarkdown(markdown) {
    const html = markdownToHTML(markdown);
    return sanitizeHTML(html);
  }

  /**
   * Sanitizes an image source to ensure we only allow for data URI and links
   * that start with http(s).
   *
   * Note: Most browsers anyway do not support script execution in <img> elements.
   *
   * @param {string} src
   * @returns {string}
   */
  function safeImageSource(src) {
    return sanitizeImageSource(src);
  }

  const type$b = 'button';
  function Button(props) {
    const {
      disabled,
      field
    } = props;
    const {
      action = 'submit'
    } = field;
    return e$2("div", {
      class: formFieldClasses(type$b),
      children: e$2("button", {
        class: "fjs-button",
        type: action,
        disabled: disabled,
        children: field.label
      })
    });
  }
  Button.create = function (options = {}) {
    return {
      action: 'submit',
      ...options
    };
  };
  Button.type = type$b;
  Button.label = 'Button';
  Button.keyed = true;

  const FormRenderContext = D$1({
    Empty: props => {
      return null;
    },
    Children: props => {
      return props.children;
    },
    Element: props => {
      return props.children;
    }
  });

  /**
   * @param {string} type
   * @param {boolean} [strict]
   *
   * @returns {any}
   */
  function getService(type, strict) {}
  const FormContext = D$1({
    getService,
    formId: null
  });

  function Description(props) {
    const {
      description
    } = props;
    if (!description) {
      return null;
    }
    return e$2("div", {
      class: "fjs-form-field-description",
      children: description
    });
  }

  function Errors(props) {
    const {
      errors
    } = props;
    if (!errors.length) {
      return null;
    }
    return e$2("div", {
      class: "fjs-form-field-error",
      children: e$2("ul", {
        children: errors.map(error => {
          return e$2("li", {
            children: error
          });
        })
      })
    });
  }

  function Label(props) {
    const {
      id,
      label,
      collapseOnEmpty = true,
      required = false
    } = props;
    return e$2("label", {
      for: id,
      class: classNames('fjs-form-field-label', {
        'fjs-incollapsible-label': !collapseOnEmpty
      }, props['class']),
      children: [props.children, label || '', required && e$2("span", {
        class: "fjs-asterix",
        children: "*"
      })]
    });
  }

  const type$a = 'checkbox';
  function Checkbox(props) {
    const {
      disabled,
      errors = [],
      field,
      value = false
    } = props;
    const {
      description,
      id,
      label
    } = field;
    const onChange = ({
      target
    }) => {
      props.onChange({
        field,
        value: target.checked
      });
    };
    const {
      formId
    } = F$1(FormContext);
    return e$2("div", {
      class: classNames(formFieldClasses(type$a, {
        errors,
        disabled
      }), {
        'fjs-checked': value
      }),
      children: [e$2(Label, {
        id: prefixId(id, formId),
        label: label,
        required: false,
        children: e$2("input", {
          checked: value,
          class: "fjs-input",
          disabled: disabled,
          id: prefixId(id, formId),
          type: "checkbox",
          onChange: onChange
        })
      }), e$2(Description, {
        description: description
      }), e$2(Errors, {
        errors: errors
      })]
    });
  }
  Checkbox.create = function (options = {}) {
    return {
      ...options
    };
  };
  Checkbox.type = type$a;
  Checkbox.label = 'Checkbox';
  Checkbox.keyed = true;
  Checkbox.emptyValue = false;
  Checkbox.sanitizeValue = ({
    value
  }) => value === true;

  function useService (type, strict) {
    const {
      getService
    } = F$1(FormContext);
    return getService(type, strict);
  }

  /**
   * @enum { String }
   */
  const LOAD_STATES = {
    LOADING: 'loading',
    LOADED: 'loaded',
    ERROR: 'error'
  };

  /**
   * @typedef {Object} ValuesGetter
   * @property {Object[]} values - The values data
   * @property {(LOAD_STATES)} state - The values data's loading state, to use for conditional rendering
   */

  /**
   * A hook to load values for single and multiselect components.
   *
   * @param {Object} field - The form field to handle values for
   * @return {ValuesGetter} valuesGetter - A values getter object providing loading state and values
   */
  function useValuesAsync (field) {
    const {
      valuesKey,
      values: staticValues
    } = field;
    const [valuesGetter, setValuesGetter] = l$1({
      values: [],
      error: undefined,
      state: LOAD_STATES.LOADING
    });
    const initialData = useService('form')._getState().initialData;
    y(() => {
      let values = [];
      if (valuesKey !== undefined) {
        const keyedValues = (initialData || {})[valuesKey];
        if (keyedValues && Array.isArray(keyedValues)) {
          values = keyedValues;
        }
      } else if (staticValues !== undefined) {
        values = Array.isArray(staticValues) ? staticValues : [];
      } else {
        setValuesGetter(getErrorState('No values source defined in the form definition'));
        return;
      }
      setValuesGetter(buildLoadedState(values));
    }, [valuesKey, staticValues, initialData]);
    return valuesGetter;
  }
  const getErrorState = error => ({
    values: [],
    error,
    state: LOAD_STATES.ERROR
  });
  const buildLoadedState = values => ({
    values,
    error: undefined,
    state: LOAD_STATES.LOADED
  });

  const ENTER_KEYDOWN_EVENT = new KeyboardEvent('keydown', {
    code: 'Enter',
    key: 'Enter',
    charCode: 13,
    keyCode: 13,
    view: window,
    bubbles: true
  });
  function focusRelevantFlatpickerDay(flatpickrInstance) {
    if (!flatpickrInstance) return;
    !flatpickrInstance.isOpen && flatpickrInstance.open();
    const container = flatpickrInstance.calendarContainer;
    const dayToFocus = container.querySelector('.flatpickr-day.selected') || container.querySelector('.flatpickr-day.today') || container.querySelector('.flatpickr-day');
    dayToFocus && dayToFocus.focus();
  }
  function formatTime(use24h, minutes) {
    if (minutes === null) return null;
    const wrappedMinutes = minutes % (24 * 60);
    const minute = minutes % 60;
    let hour = Math.floor(wrappedMinutes / 60);
    if (use24h) {
      return _getZeroPaddedString(hour) + ':' + _getZeroPaddedString(minute);
    }
    hour = hour % 12 || 12;
    const isPM = wrappedMinutes >= 12 * 60;
    return _getZeroPaddedString(hour) + ':' + _getZeroPaddedString(minute) + ' ' + (isPM ? 'PM' : 'AM');
  }
  function parseInputTime(stringTime) {
    let workingString = stringTime.toLowerCase();
    const is12h = workingString.includes('am') || workingString.includes('pm');
    if (is12h) {
      const isPM = workingString.includes('pm');
      const digits = workingString.match(/\d+/g);
      const displayHour = parseInt(digits?.[0]);
      const minute = parseInt(digits?.[1]) || 0;
      const isValidDisplayHour = isNumber$2(displayHour) && displayHour >= 1 && displayHour <= 12;
      const isValidMinute = minute >= 0 && minute <= 59;
      if (!isValidDisplayHour || !isValidMinute) return null;
      const hour = displayHour % 12 + (isPM ? 12 : 0);
      return hour * 60 + minute;
    } else {
      const digits = workingString.match(/\d+/g);
      const hour = parseInt(digits?.[0]);
      const minute = parseInt(digits?.[1]);
      const isValidHour = isNumber$2(hour) && hour >= 0 && hour <= 23;
      const isValidMinute = isNumber$2(minute) && minute >= 0 && minute <= 59;
      if (!isValidHour || !isValidMinute) return null;
      return hour * 60 + minute;
    }
  }
  function serializeTime(minutes, offset, timeSerializingFormat) {
    if (timeSerializingFormat === TIME_SERIALISING_FORMATS.UTC_NORMALIZED) {
      const normalizedMinutes = (minutes + offset + MINUTES_IN_DAY) % MINUTES_IN_DAY;
      return _getZeroPaddedString(Math.floor(normalizedMinutes / 60)) + ':' + _getZeroPaddedString(normalizedMinutes % 60) + 'Z';
    }
    const baseTime = _getZeroPaddedString(Math.floor(minutes / 60)) + ':' + _getZeroPaddedString(minutes % 60);
    const addUTCOffset = timeSerializingFormat === TIME_SERIALISING_FORMATS.UTC_OFFSET;
    return baseTime + (addUTCOffset ? formatTimezoneOffset(offset) : '');
  }
  function parseIsoTime(isoTimeString) {
    if (!isoTimeString) return null;
    const parseBasicMinutes = timeString => {
      const timeSegments = timeString.split(':');
      const hour = parseInt(timeSegments[0]);
      const minute = timeSegments.length > 1 ? parseInt(timeSegments[1]) : 0;
      if (isNaN(hour) || hour < 0 || hour > 24 || isNaN(minute) || minute < 0 || minute > 60) return null;
      return hour * 60 + minute;
    };
    const localOffset = new Date().getTimezoneOffset();

    // Parse normalized time
    if (isoTimeString.includes('Z')) {
      isoTimeString = isoTimeString.replace('Z', '');
      const minutes = parseBasicMinutes(isoTimeString);
      if (minutes === null) return null;
      return (minutes - localOffset + MINUTES_IN_DAY) % MINUTES_IN_DAY;
    }

    // Parse offset positive time
    else if (isoTimeString.includes('+')) {
      const [timeString, offsetString] = isoTimeString.split('+');
      const minutes = parseBasicMinutes(timeString);
      let inboundOffset = parseBasicMinutes(offsetString);
      if (minutes === null || inboundOffset === null) return null;

      // The offset is flipped for consistency with javascript
      inboundOffset = -inboundOffset;
      return (minutes + inboundOffset - localOffset + MINUTES_IN_DAY) % MINUTES_IN_DAY;
    }

    // Parse offset negative time
    else if (isoTimeString.includes('-')) {
      const [timeString, offsetString] = isoTimeString.split('-');
      const minutes = parseBasicMinutes(timeString);
      let inboundOffset = parseBasicMinutes(offsetString);
      if (minutes === null || inboundOffset === null) return null;
      return (minutes + inboundOffset - localOffset + MINUTES_IN_DAY) % MINUTES_IN_DAY;
    }

    // Default to local parsing
    else {
      return parseBasicMinutes(isoTimeString);
    }
  }
  function serializeDate(date) {
    var d = new Date(date),
      month = '' + (d.getMonth() + 1),
      day = '' + d.getDate(),
      year = d.getFullYear();
    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;
    return [year, month, day].join('-');
  }

  // this method is used to make the `new Date(value)` parsing behavior stricter
  function isDateTimeInputInformationSufficient(value) {
    if (!value || typeof value !== 'string') return false;
    const segments = value.split('T');
    if (segments.length != 2) return false;
    const dateNumbers = segments[0].split('-');
    if (dateNumbers.length != 3) return false;
    return true;
  }

  // this method checks if the date isn't a datetime, or a partial date
  function isDateInputInformationMatching(value) {
    if (!value || typeof value !== 'string') return false;
    if (value.includes('T')) return false;
    const dateNumbers = value.split('-');
    if (dateNumbers.length != 3) return false;
    return true;
  }
  function serializeDateTime(date, time, timeSerializingFormat) {
    const workingDate = new Date();
    workingDate.setFullYear(date.getFullYear(), date.getMonth(), date.getDate());
    workingDate.setHours(Math.floor(time / 60), time % 60, 0, 0);
    if (timeSerializingFormat === TIME_SERIALISING_FORMATS.UTC_NORMALIZED) {
      const timezoneOffsetMinutes = workingDate.getTimezoneOffset();
      const dayOffset = time + timezoneOffsetMinutes < 0 ? -1 : time + timezoneOffsetMinutes > MINUTES_IN_DAY ? 1 : 0;

      // Apply the date rollover pre-emptively
      workingDate.setHours(workingDate.getHours() + dayOffset * 24);
    }
    return serializeDate(workingDate) + 'T' + serializeTime(time, workingDate.getTimezoneOffset(), timeSerializingFormat);
  }
  function formatTimezoneOffset(minutes) {
    return _getSignedPaddedHours(minutes) + ':' + _getZeroPaddedString(Math.abs(minutes % 60));
  }
  function isInvalidDateString(value) {
    return isNaN(new Date(Date.parse(value)).getTime());
  }
  function _getSignedPaddedHours(minutes) {
    if (minutes > 0) {
      return '-' + _getZeroPaddedString(Math.floor(minutes / 60));
    } else {
      return '+' + _getZeroPaddedString(Math.floor((0 - minutes) / 60));
    }
  }
  function _getZeroPaddedString(time) {
    return time.toString().padStart(2, '0');
  }

  function sanitizeDateTimePickerValue(options) {
    const {
      formField,
      value
    } = options;
    const {
      subtype
    } = formField;
    if (typeof value !== 'string') return null;
    if (subtype === DATETIME_SUBTYPES.DATE && (isInvalidDateString(value) || !isDateInputInformationMatching(value))) return null;
    if (subtype === DATETIME_SUBTYPES.TIME && parseIsoTime(value) === null) return null;
    if (subtype === DATETIME_SUBTYPES.DATETIME && (isInvalidDateString(value) || !isDateTimeInputInformationSufficient(value))) return null;
    return value;
  }
  function sanitizeSingleSelectValue(options) {
    const {
      formField,
      data,
      value
    } = options;
    const {
      valuesKey,
      values
    } = formField;
    try {
      const validValues = (valuesKey ? get(data, [valuesKey]) : values).map(v => v.value) || [];
      return validValues.includes(value) ? value : null;
    } catch (error) {
      // use default value in case of formatting error
      // TODO(@Skaiir): log a warning when this happens - https://github.com/bpmn-io/form-js/issues/289
      return null;
    }
  }
  function sanitizeMultiSelectValue(options) {
    const {
      formField,
      data,
      value
    } = options;
    const {
      valuesKey,
      values
    } = formField;
    try {
      const validValues = (valuesKey ? get(data, [valuesKey]) : values).map(v => v.value) || [];
      return value.filter(v => validValues.includes(v));
    } catch (error) {
      // use default value in case of formatting error
      // TODO(@Skaiir): log a warning when this happens - https://github.com/bpmn-io/form-js/issues/289
      return [];
    }
  }

  const type$9 = 'checklist';
  function Checklist(props) {
    const {
      disabled,
      errors = [],
      field,
      value = []
    } = props;
    const {
      description,
      id,
      label
    } = field;
    const toggleCheckbox = v => {
      let newValue = [...value];
      if (!newValue.includes(v)) {
        newValue.push(v);
      } else {
        newValue = newValue.filter(x => x != v);
      }
      props.onChange({
        field,
        value: newValue
      });
    };
    const {
      state: loadState,
      values: options
    } = useValuesAsync(field);
    const {
      formId
    } = F$1(FormContext);
    return e$2("div", {
      class: classNames(formFieldClasses(type$9, {
        errors,
        disabled
      })),
      children: [e$2(Label, {
        label: label
      }), loadState == LOAD_STATES.LOADED && options.map((v, index) => {
        return e$2(Label, {
          id: prefixId(`${id}-${index}`, formId),
          label: v.label,
          class: classNames({
            'fjs-checked': value.includes(v.value)
          }),
          required: false,
          children: e$2("input", {
            checked: value.includes(v.value),
            class: "fjs-input",
            disabled: disabled,
            id: prefixId(`${id}-${index}`, formId),
            type: "checkbox",
            onClick: () => toggleCheckbox(v.value)
          })
        }, `${id}-${index}`);
      }), e$2(Description, {
        description: description
      }), e$2(Errors, {
        errors: errors
      })]
    });
  }
  Checklist.create = function (options = {}) {
    if (options.valuesKey) return options;
    return {
      values: [{
        label: 'Value',
        value: 'value'
      }],
      ...options
    };
  };
  Checklist.type = type$9;
  Checklist.label = 'Checklist';
  Checklist.keyed = true;
  Checklist.emptyValue = [];
  Checklist.sanitizeValue = sanitizeMultiSelectValue;

  /**
   * Check if condition is met with given variables.
   *
   * @param {string | undefined} condition
   * @param {import('../../types').Data} data
   *
   * @returns {boolean} true if condition is met or no condition or condition checker exists
   */
  function useCondition(condition, data) {
    const initialData = useService('form')._getState().initialData;
    const conditionChecker = useService('conditionChecker', false);
    if (!conditionChecker) {
      return null;
    }

    // make sure we do not use data from hidden fields
    const filteredData = {
      ...initialData,
      ...conditionChecker.applyConditions(data, data)
    };
    return conditionChecker.check(condition, filteredData);
  }

  const noop$1 = () => false;
  function FormField(props) {
    const {
      field,
      onChange
    } = props;
    const {
      _path
    } = field;
    const formFields = useService('formFields'),
      form = useService('form');
    const {
      data,
      errors,
      properties
    } = form._getState();
    const {
      Element,
      Empty
    } = F$1(FormRenderContext);
    const FormFieldComponent = formFields.get(field.type);
    if (!FormFieldComponent) {
      throw new Error(`cannot render field <${field.type}>`);
    }
    const value = get(data, _path);
    const fieldErrors = findErrors(errors, _path);
    const disabled = properties.readOnly || field.disabled || false;
    const hidden = useHideCondition(field, data);
    if (hidden) {
      return e$2(Empty, {});
    }
    return e$2(Element, {
      field: field,
      children: e$2(FormFieldComponent, {
        ...props,
        disabled: disabled,
        errors: fieldErrors,
        onChange: disabled ? noop$1 : onChange,
        value: value
      })
    });
  }
  function useHideCondition(field, data) {
    const hideCondition = field.conditional && field.conditional.hide;
    return useCondition(hideCondition, data) === true;
  }

  function Default(props) {
    const {
      Children,
      Empty
    } = F$1(FormRenderContext);
    const {
      field
    } = props;
    const {
      components = []
    } = field;
    return e$2(Children, {
      class: "fjs-vertical-layout",
      field: field,
      children: [components.map(childField => {
        return v$1(FormField, {
          ...props,
          key: childField.id,
          field: childField
        });
      }), components.length ? null : e$2(Empty, {})]
    });
  }
  Default.create = function (options = {}) {
    return {
      components: [],
      ...options
    };
  };
  Default.type = 'default';
  Default.keyed = false;

  function _extends$h() { _extends$h = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends$h.apply(this, arguments); }
  var CalendarIcon = (({
    styles = {},
    ...props
  }) => /*#__PURE__*/React.createElement("svg", _extends$h({
    width: "14",
    height: "15",
    viewBox: "0 0 28 30",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, props), /*#__PURE__*/React.createElement("path", {
    fillRule: "evenodd",
    clipRule: "evenodd",
    d: "M19 2H9V0H7v2H2a2 2 0 00-2 2v24a2 2 0 002 2h24a2 2 0 002-2V4a2 2 0 00-2-2h-5V0h-2v2zM7 7V4H2v5h24V4h-5v3h-2V4H9v3H7zm-5 4v17h24V11H2z",
    fill: "#000"
  })));

  function InputAdorner(props) {
    const {
      pre = null,
      post = null,
      rootRef,
      inputRef,
      children,
      disabled,
      hasErrors
    } = props;
    const onAdornmentClick = () => inputRef?.current?.focus();
    return e$2("div", {
      class: classNames('fjs-input-group', {
        'disabled': disabled
      }, {
        'hasErrors': hasErrors
      }),
      ref: rootRef,
      children: [pre !== null && e$2("span", {
        class: "fjs-input-adornment border-right border-radius-left",
        onClick: onAdornmentClick,
        children: [" ", pre, " "]
      }), children, post !== null && e$2("span", {
        class: "fjs-input-adornment border-left border-radius-right",
        onClick: onAdornmentClick,
        children: [" ", post, " "]
      })]
    });
  }

  function Datepicker(props) {
    const {
      id,
      label,
      collapseLabelOnEmpty,
      formId,
      required,
      disabled,
      disallowPassedDates,
      date,
      setDate
    } = props;
    const dateInputRef = s();
    const focusScopeRef = s();
    const [flatpickrInstance, setFlatpickrInstance] = l$1(null);
    const [isInputDirty, setIsInputDirty] = l$1(false);
    const [forceFocusCalendar, setForceFocusCalendar] = l$1(false);

    // shorts the date value back to the source
    y(() => {
      if (!flatpickrInstance || !flatpickrInstance.config) return;
      flatpickrInstance.setDate(date, true);
      setIsInputDirty(false);
    }, [flatpickrInstance, date.toString()]);
    y(() => {
      if (!forceFocusCalendar) return;
      focusRelevantFlatpickerDay(flatpickrInstance);
      setForceFocusCalendar(false);
    }, [flatpickrInstance, forceFocusCalendar]);

    // setup flatpickr instance
    y(() => {
      if (disabled) {
        setFlatpickrInstance(null);
        return;
      }
      let config = {
        allowInput: true,
        dateFormat: 'm/d/Y',
        static: true,
        clickOpens: false,
        errorHandler: () => {/* do nothing, we expect the values to sometimes be erronous and we don't want warnings polluting the console */}
      };
      if (disallowPassedDates) {
        config = {
          ...config,
          minDate: 'today'
        };
      }
      const instance = flatpickr(dateInputRef.current, config);
      setFlatpickrInstance(instance);
      const onCalendarFocusOut = e => {
        if (!instance.calendarContainer.contains(e.relatedTarget) && e.relatedTarget != dateInputRef.current) {
          instance.close();
        }
      };

      // remove dirty tag to have mouse day selection prioritize input blur
      const onCalendarMouseDown = e => {
        if (e.target.classList.contains('flatpickr-day')) {
          setIsInputDirty(false);
        }
      };

      // when the dropdown of the datepickr opens, we register a few event handlers to re-implement some of the
      // flatpicker logic that was lost when setting allowInput to true
      instance.config.onOpen = [() => instance.calendarContainer.addEventListener('focusout', onCalendarFocusOut), () => instance.calendarContainer.addEventListener('mousedown', onCalendarMouseDown)];
      instance.config.onClose = [() => instance.calendarContainer.removeEventListener('focusout', onCalendarFocusOut), () => instance.calendarContainer.removeEventListener('mousedown', onCalendarMouseDown)];
    }, [disabled, disallowPassedDates]);

    // onChange is updated dynamically, so not to re-render the flatpicker every time it changes
    y(() => {
      if (!flatpickrInstance || !flatpickrInstance.config) return;
      flatpickrInstance.config.onChange = [date => setDate(new Date(date)), () => setIsInputDirty(false)];
    }, [flatpickrInstance, setDate]);
    const onInputKeyDown = A$1(e => {
      if (!flatpickrInstance) return;
      if (e.code === 'Escape') {
        flatpickrInstance.close();
      }
      if (e.code === 'ArrowDown') {
        if (isInputDirty) {
          // trigger an enter keypress to submit the new input, then focus calendar day on the next render cycle
          dateInputRef.current.dispatchEvent(ENTER_KEYDOWN_EVENT);
          setIsInputDirty(false);
          setForceFocusCalendar(true);
        } else {
          // focus calendar day immediately
          focusRelevantFlatpickerDay(flatpickrInstance);
        }
        e.preventDefault();
      }
      if (e.code === 'Enter') {
        setIsInputDirty(false);
      }
    }, [flatpickrInstance, isInputDirty]);
    const onInputFocus = A$1(e => {
      if (!flatpickrInstance || focusScopeRef.current.contains(e.relatedTarget)) return;
      flatpickrInstance.open();
    }, [flatpickrInstance]);

    // simulate an enter press on blur to make sure the date value is submitted in all scenarios
    const onInputBlur = A$1(e => {
      if (!isInputDirty || e.relatedTarget && e.relatedTarget.classList.contains('flatpickr-day')) return;
      dateInputRef.current.dispatchEvent(ENTER_KEYDOWN_EVENT);
      setIsInputDirty(false);
    }, [isInputDirty]);
    const fullId = `${prefixId(id, formId)}--date`;
    return e$2("div", {
      class: "fjs-datetime-subsection",
      children: [e$2(Label, {
        id: fullId,
        label: label,
        collapseOnEmpty: collapseLabelOnEmpty,
        required: required
      }), e$2(InputAdorner, {
        pre: e$2(CalendarIcon, {}),
        disabled: disabled,
        rootRef: focusScopeRef,
        inputRef: dateInputRef,
        children: e$2("div", {
          class: "fjs-datepicker",
          style: {
            width: '100%'
          },
          children: e$2("input", {
            ref: dateInputRef,
            type: "text",
            id: fullId,
            class: 'fjs-input',
            disabled: disabled,
            placeholder: "mm/dd/yyyy",
            autoComplete: "false",
            onFocus: onInputFocus,
            onKeyDown: onInputKeyDown,
            onMouseDown: e => !flatpickrInstance.isOpen && flatpickrInstance.open(),
            onBlur: onInputBlur,
            onInput: e => setIsInputDirty(true),
            "data-input": true
          })
        })
      })]
    });
  }

  function _extends$g() { _extends$g = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends$g.apply(this, arguments); }
  var ClockIcon = (({
    styles = {},
    ...props
  }) => /*#__PURE__*/React.createElement("svg", _extends$g({
    width: "16",
    height: "16",
    viewBox: "0 0 28 29",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M13 14.41L18.59 20 20 18.59l-5-5.01V5h-2v9.41z",
    fill: "#000"
  }), /*#__PURE__*/React.createElement("path", {
    fillRule: "evenodd",
    clipRule: "evenodd",
    d: "M6.222 25.64A14 14 0 1021.778 2.36 14 14 0 006.222 25.64zM7.333 4.023a12 12 0 1113.334 19.955A12 12 0 017.333 4.022z",
    fill: "#000"
  })));

  function useKeyDownAction(targetKey, action, listenerElement = window) {
    function downHandler({
      key
    }) {
      if (key === targetKey) {
        action();
      }
    }
    y(() => {
      listenerElement.addEventListener('keydown', downHandler);
      return () => {
        listenerElement.removeEventListener('keydown', downHandler);
      };
    });
  }

  const DEFAULT_LABEL_GETTER = value => value;
  const NOOP = () => {};
  function DropdownList(props) {
    const {
      keyEventsListener = window,
      values = [],
      getLabel = DEFAULT_LABEL_GETTER,
      onValueSelected = NOOP,
      height = 235,
      emptyListMessage = 'No results',
      initialFocusIndex = 0
    } = props;
    const [mouseControl, setMouseControl] = l$1(false);
    const [focusedValueIndex, setFocusedValueIndex] = l$1(initialFocusIndex);
    const [smoothScrolling, setSmoothScrolling] = l$1(false);
    const dropdownContainer = s();
    const mouseScreenPos = s();
    const focusedItem = d(() => values.length ? values[focusedValueIndex] : null, [focusedValueIndex, values]);
    const changeFocusedValueIndex = A$1(delta => {
      setFocusedValueIndex(x => Math.min(Math.max(0, x + delta), values.length - 1));
    }, [values.length]);
    y(() => {
      if (focusedValueIndex === 0) return;
      if (!focusedValueIndex || !values.length) {
        setFocusedValueIndex(0);
      } else if (focusedValueIndex >= values.length) {
        setFocusedValueIndex(values.length - 1);
      }
    }, [focusedValueIndex, values.length]);
    useKeyDownAction('ArrowUp', () => {
      if (values.length) {
        changeFocusedValueIndex(-1);
        setMouseControl(false);
      }
    }, keyEventsListener);
    useKeyDownAction('ArrowDown', () => {
      if (values.length) {
        changeFocusedValueIndex(1);
        setMouseControl(false);
      }
    }, keyEventsListener);
    useKeyDownAction('Enter', () => {
      if (focusedItem) {
        onValueSelected(focusedItem);
      }
    }, keyEventsListener);
    y(() => {
      const individualEntries = dropdownContainer.current.children;
      if (individualEntries.length && !mouseControl) {
        individualEntries[focusedValueIndex].scrollIntoView({
          block: 'nearest',
          inline: 'nearest'
        });
      }
    }, [focusedValueIndex, mouseControl]);
    y(() => {
      setSmoothScrolling(true);
    }, []);
    const onMouseMovedInKeyboardMode = (event, valueIndex) => {
      const userMovedCursor = !mouseScreenPos.current || mouseScreenPos.current.x !== event.screenX && mouseScreenPos.current.y !== event.screenY;
      if (userMovedCursor) {
        mouseScreenPos.current = {
          x: event.screenX,
          y: event.screenY
        };
        setMouseControl(true);
        setFocusedValueIndex(valueIndex);
      }
    };
    return e$2("div", {
      ref: dropdownContainer,
      tabIndex: -1,
      class: "fjs-dropdownlist",
      style: {
        maxHeight: height,
        scrollBehavior: smoothScrolling ? 'smooth' : 'auto'
      },
      children: [values.length > 0 && values.map((v, i) => {
        return e$2("div", {
          class: classNames('fjs-dropdownlist-item', {
            'focused': focusedValueIndex === i
          }),
          onMouseMove: mouseControl ? undefined : e => onMouseMovedInKeyboardMode(e, i),
          onMouseEnter: mouseControl ? () => setFocusedValueIndex(i) : undefined,
          onMouseDown: e => {
            e.preventDefault();
            onValueSelected(v);
          },
          children: getLabel(v)
        });
      }), !values.length && e$2("div", {
        class: "fjs-dropdownlist-empty",
        children: emptyListMessage
      })]
    });
  }

  function Timepicker(props) {
    const {
      id,
      label,
      collapseLabelOnEmpty,
      formId,
      required,
      disabled,
      use24h = false,
      timeInterval,
      time,
      setTime
    } = props;
    const timeInputRef = s();
    const [dropdownIsOpen, setDropdownIsOpen] = l$1(false);
    const useDropdown = d(() => timeInterval !== 1, [timeInterval]);
    const [rawValue, setRawValue] = l$1('');

    // populates values from source
    y(() => {
      if (time === null) {
        setRawValue('');
        return;
      }
      const intervalAdjustedTime = time - time % timeInterval;
      setRawValue(formatTime(use24h, intervalAdjustedTime));
      if (intervalAdjustedTime != time) {
        setTime(intervalAdjustedTime);
      }
    }, [time, setTime, use24h, timeInterval]);
    const propagateRawToMinute = A$1(newRawValue => {
      const localRawValue = newRawValue || rawValue;

      // If no raw value exists, set the minute to null
      if (!localRawValue) {
        setTime(null);
        return;
      }
      const minutes = parseInputTime(localRawValue);

      // If raw string couldn't be parsed, clean everything up
      if (!isNumber$2(minutes)) {
        setRawValue('');
        setTime(null);
        return;
      }

      // Enforce the minutes to match the timeInterval
      const correctedMinutes = minutes - minutes % timeInterval;

      // Enforce the raw text to be formatted properly
      setRawValue(formatTime(use24h, correctedMinutes));
      setTime(correctedMinutes);
    }, [rawValue, timeInterval, use24h, setTime]);
    const timeOptions = d(() => {
      const minutesInDay = 24 * 60;
      const intervalCount = Math.floor(minutesInDay / timeInterval);
      return [...Array(intervalCount).keys()].map(intervalIndex => formatTime(use24h, intervalIndex * timeInterval));
    }, [timeInterval, use24h]);
    const initialFocusIndex = d(() => {
      // if there are no options, there will not be any focusing
      if (!timeOptions || !timeInterval) return null;

      // if there is a set minute value, we focus it in the dropdown
      if (time) return time / timeInterval;
      const cacheTime = parseInputTime(rawValue);

      // if there is a valid value in the input cache, we try and focus close to it
      if (cacheTime) {
        const flooredCacheTime = cacheTime - cacheTime % timeInterval;
        return flooredCacheTime / timeInterval;
      }

      // If there is no set value, simply focus the middle of the dropdown (12:00)
      return Math.floor(timeOptions.length / 2);
    }, [rawValue, time, timeInterval, timeOptions]);
    const onInputKeyDown = e => {
      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault();
          break;
        case 'ArrowDown':
          useDropdown && setDropdownIsOpen(true);
          e.preventDefault();
          break;
        case 'Escape':
          useDropdown && setDropdownIsOpen(false);
          break;
        case 'Enter':
          !dropdownIsOpen && propagateRawToMinute();
          break;
      }
    };
    const onInputBlur = e => {
      setDropdownIsOpen(false);
      propagateRawToMinute();
    };
    const onDropdownValueSelected = value => {
      setDropdownIsOpen(false);
      propagateRawToMinute(value);
    };
    const fullId = `${prefixId(id, formId)}--time`;
    return e$2("div", {
      class: "fjs-datetime-subsection",
      children: [e$2(Label, {
        id: fullId,
        label: label,
        collapseOnEmpty: collapseLabelOnEmpty,
        required: required
      }), e$2(InputAdorner, {
        pre: e$2(ClockIcon, {}),
        inputRef: timeInputRef,
        disabled: disabled,
        children: e$2("div", {
          class: "fjs-timepicker fjs-timepicker-anchor",
          children: [e$2("input", {
            ref: timeInputRef,
            type: "text",
            id: fullId,
            class: "fjs-input",
            value: rawValue,
            disabled: disabled,
            placeholder: use24h ? 'hh:mm' : 'hh:mm ?m',
            autoComplete: "false",
            onFocus: () => useDropdown && setDropdownIsOpen(true),
            onClick: () => useDropdown && setDropdownIsOpen(true)

            // @ts-ignore
            ,
            onInput: e => {
              setRawValue(e.target.value);
              useDropdown && setDropdownIsOpen(false);
            },
            onBlur: onInputBlur,
            onKeyDown: onInputKeyDown,
            "data-input": true
          }), dropdownIsOpen && e$2(DropdownList, {
            values: timeOptions,
            height: 150,
            onValueSelected: onDropdownValueSelected,
            listenerElement: timeInputRef.current,
            initialFocusIndex: initialFocusIndex
          })]
        })
      })]
    });
  }

  const type$8 = 'datetime';
  function Datetime(props) {
    const {
      disabled,
      errors = [],
      field,
      onChange,
      value = ''
    } = props;
    const {
      description,
      id,
      dateLabel,
      timeLabel,
      validate = {},
      subtype,
      use24h,
      disallowPassedDates,
      timeInterval,
      timeSerializingFormat
    } = field;
    const {
      required
    } = validate;
    const {
      formId
    } = F$1(FormContext);
    const getNullDateTime = () => ({
      date: new Date(Date.parse(null)),
      time: null
    });
    const [dateTime, setDateTime] = l$1(getNullDateTime());
    const [dateTimeUpdateRequest, setDateTimeUpdateRequest] = l$1(null);
    const isValidDate = date => date && !isNaN(date.getTime());
    const isValidTime = time => !isNaN(parseInt(time));
    const useDatePicker = d(() => subtype === DATETIME_SUBTYPES.DATE || subtype === DATETIME_SUBTYPES.DATETIME, [subtype]);
    const useTimePicker = d(() => subtype === DATETIME_SUBTYPES.TIME || subtype === DATETIME_SUBTYPES.DATETIME, [subtype]);
    y(() => {
      let {
        date,
        time
      } = getNullDateTime();
      if (!disabled) {
        switch (subtype) {
          case DATETIME_SUBTYPES.DATE:
            {
              date = new Date(Date.parse(value));
              break;
            }
          case DATETIME_SUBTYPES.TIME:
            {
              time = parseIsoTime(value);
              break;
            }
          case DATETIME_SUBTYPES.DATETIME:
            {
              date = new Date(Date.parse(value));
              time = isValidDate(date) ? 60 * date.getHours() + date.getMinutes() : null;
              break;
            }
        }
      }
      setDateTime({
        date,
        time
      });
    }, [subtype, value, disabled]);
    const computeAndSetState = A$1(({
      date,
      time
    }) => {
      let newDateTimeValue = null;
      if (subtype === DATETIME_SUBTYPES.DATE && isValidDate(date)) {
        newDateTimeValue = serializeDate(date);
      } else if (subtype === DATETIME_SUBTYPES.TIME && isValidTime(time)) {
        newDateTimeValue = serializeTime(time, new Date().getTimezoneOffset(), timeSerializingFormat);
      } else if (subtype === DATETIME_SUBTYPES.DATETIME && isValidDate(date) && isValidTime(time)) {
        newDateTimeValue = serializeDateTime(date, time, timeSerializingFormat);
      }
      onChange({
        value: newDateTimeValue,
        field
      });
    }, [field, onChange, subtype, timeSerializingFormat]);
    y(() => {
      if (dateTimeUpdateRequest) {
        if (dateTimeUpdateRequest.refreshOnly) {
          computeAndSetState(dateTime);
        } else {
          const newDateTime = {
            ...dateTime,
            ...dateTimeUpdateRequest
          };
          setDateTime(newDateTime);
          computeAndSetState(newDateTime);
        }
        setDateTimeUpdateRequest(null);
      }
    }, [computeAndSetState, dateTime, dateTimeUpdateRequest]);
    y(() => {
      setDateTimeUpdateRequest({
        refreshOnly: true
      });
    }, [timeSerializingFormat]);
    const allErrors = d(() => {
      if (required || subtype !== DATETIME_SUBTYPES.DATETIME) return errors;
      const isOnlyOneFieldSet = isValidDate(dateTime.date) && !isValidTime(dateTime.time) || !isValidDate(dateTime.date) && isValidTime(dateTime.time);
      return isOnlyOneFieldSet ? ['Date and time must both be entered.', ...errors] : errors;
    }, [required, subtype, dateTime, errors]);
    const setDate = A$1(date => {
      setDateTimeUpdateRequest(prev => prev ? {
        ...prev,
        date
      } : {
        date
      });
    }, []);
    const setTime = A$1(time => {
      setDateTimeUpdateRequest(prev => prev ? {
        ...prev,
        time
      } : {
        time
      });
    }, []);
    const datePickerProps = {
      id,
      label: dateLabel,
      collapseLabelOnEmpty: !timeLabel,
      formId,
      required,
      disabled,
      disallowPassedDates,
      date: dateTime.date,
      setDate
    };
    const timePickerProps = {
      id,
      label: timeLabel,
      collapseLabelOnEmpty: !dateLabel,
      formId,
      required,
      disabled,
      use24h,
      timeInterval,
      time: dateTime.time,
      setTime
    };
    return e$2("div", {
      class: formFieldClasses(type$8, {
        errors: allErrors,
        disabled
      }),
      children: [e$2("div", {
        class: classNames('fjs-vertical-group'),
        children: [useDatePicker && e$2(Datepicker, {
          ...datePickerProps
        }), useTimePicker && useDatePicker && e$2("div", {
          class: "fjs-datetime-separator"
        }), useTimePicker && e$2(Timepicker, {
          ...timePickerProps
        })]
      }), e$2(Description, {
        description: description
      }), e$2(Errors, {
        errors: allErrors
      })]
    });
  }
  Datetime.create = function (options = {}) {
    const newOptions = {};
    set(newOptions, DATETIME_SUBTYPE_PATH, DATETIME_SUBTYPES.DATE);
    set(newOptions, DATE_LABEL_PATH, 'Date');
    return {
      ...newOptions,
      ...options
    };
  };
  Datetime.type = type$8;
  Datetime.keyed = true;
  Datetime.emptyValue = null;
  Datetime.sanitizeValue = sanitizeDateTimePickerValue;

  /**
   * This file must not be changed or exchanged.
   *
   * @see http://bpmn.io/license for more information.
   */
  function Logo() {
    return e$2("svg", {
      xmlns: "http://www.w3.org/2000/svg",
      viewBox: "0 0 14.02 5.57",
      width: "53",
      height: "21",
      style: "vertical-align:middle",
      children: [e$2("path", {
        fill: "currentColor",
        d: "M1.88.92v.14c0 .41-.13.68-.4.8.33.14.46.44.46.86v.33c0 .61-.33.95-.95.95H0V0h.95c.65 0 .93.3.93.92zM.63.57v1.06h.24c.24 0 .38-.1.38-.43V.98c0-.28-.1-.4-.32-.4zm0 1.63v1.22h.36c.2 0 .32-.1.32-.39v-.35c0-.37-.12-.48-.4-.48H.63zM4.18.99v.52c0 .64-.31.98-.94.98h-.3V4h-.62V0h.92c.63 0 .94.35.94.99zM2.94.57v1.35h.3c.2 0 .3-.09.3-.37v-.6c0-.29-.1-.38-.3-.38h-.3zm2.89 2.27L6.25 0h.88v4h-.6V1.12L6.1 3.99h-.6l-.46-2.82v2.82h-.55V0h.87zM8.14 1.1V4h-.56V0h.79L9 2.4V0h.56v4h-.64zm2.49 2.29v.6h-.6v-.6zM12.12 1c0-.63.33-1 .95-1 .61 0 .95.37.95 1v2.04c0 .64-.34 1-.95 1-.62 0-.95-.37-.95-1zm.62 2.08c0 .28.13.39.33.39s.32-.1.32-.4V.98c0-.29-.12-.4-.32-.4s-.33.11-.33.4z"
      }), e$2("path", {
        fill: "currentColor",
        d: "M0 4.53h14.02v1.04H0zM11.08 0h.63v.62h-.63zm.63 4V1h-.63v2.98z"
      })]
    });
  }
  function Lightbox(props) {
    const {
      open
    } = props;
    if (!open) {
      return null;
    }
    return e$2("div", {
      class: "fjs-powered-by-lightbox",
      style: "z-index: 100; position: fixed; top: 0; left: 0;right: 0; bottom: 0",
      children: [e$2("div", {
        class: "backdrop",
        style: "width: 100%; height: 100%; background: rgba(40 40 40 / 20%)",
        onClick: props.onBackdropClick
      }), e$2("div", {
        class: "notice",
        style: "position: absolute; left: 50%; top: 40%; transform: translate(-50%); width: 260px; padding: 10px; background: white; box-shadow: 0  1px 4px rgba(0 0 0 / 30%); font-family: Helvetica, Arial, sans-serif; font-size: 14px; display: flex; line-height: 1.3",
        children: [e$2("a", {
          href: "https://bpmn.io",
          target: "_blank",
          rel: "noopener",
          style: "margin: 15px 20px 15px 10px; align-self: center; color: #404040",
          children: e$2(Logo, {})
        }), e$2("span", {
          children: ["Web-based tooling for BPMN, DMN, and forms powered by ", e$2("a", {
            href: "https://bpmn.io",
            target: "_blank",
            rel: "noopener",
            children: "bpmn.io"
          }), "."]
        })]
      })]
    });
  }
  function Link(props) {
    return e$2("div", {
      class: "fjs-powered-by fjs-form-field",
      style: "text-align: right",
      children: e$2("a", {
        href: "https://bpmn.io",
        target: "_blank",
        rel: "noopener",
        class: "fjs-powered-by-link",
        title: "Powered by bpmn.io",
        style: "color: #404040",
        onClick: props.onClick,
        children: e$2(Logo, {})
      })
    });
  }
  function PoweredBy(props) {
    const [open, setOpen] = l$1(false);
    function toggleOpen(open) {
      return event => {
        event.preventDefault();
        setOpen(open);
      };
    }
    return e$2(d$1, {
      children: [W(e$2(Lightbox, {
        open: open,
        onBackdropClick: toggleOpen(false)
      }), document.body), e$2(Link, {
        onClick: toggleOpen(true)
      })]
    });
  }

  const noop = () => {};
  function FormComponent(props) {
    const form = useService('form');
    const {
      schema
    } = form._getState();
    const {
      onSubmit = noop,
      onReset = noop,
      onChange = noop
    } = props;
    const handleSubmit = event => {
      event.preventDefault();
      onSubmit();
    };
    const handleReset = event => {
      event.preventDefault();
      onReset();
    };
    return e$2("form", {
      class: "fjs-form",
      onSubmit: handleSubmit,
      onReset: handleReset,
      noValidate: true,
      children: [e$2(FormField, {
        field: schema,
        onChange: onChange
      }), e$2(PoweredBy, {})]
    });
  }

  /**
   *
   * @param {string | undefined} expression
   * @param {import('../../types').Data} data
   */
  function useEvaluation(expression, data) {
    const initialData = useService('form')._getState().initialData;
    const conditionChecker = useService('conditionChecker', false);
    if (!conditionChecker) {
      return null;
    }

    // make sure we do not use data from hidden fields
    const filteredData = {
      ...initialData,
      ...conditionChecker.applyConditions(data, data)
    };
    return conditionChecker.evaluate(expression, filteredData);
  }

  /**
   *
   * @param {string} value
   */
  function useExpressionValue(value) {
    const formData = useService('form')._getState().data;
    if (!isExpression(value)) {
      return value;
    }

    // We can ignore this hook rule as we do not use
    // state or effects in our custom hooks
    /* eslint-disable-next-line react-hooks/rules-of-hooks */
    return useEvaluation(value, formData);
  }

  // helper ///////////////

  function isExpression(value) {
    return isString$2(value) && value.startsWith('=');
  }

  function _extends$f() { _extends$f = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends$f.apply(this, arguments); }
  var ImagePlaceholder = (({
    styles = {},
    ...props
  }) => /*#__PURE__*/React.createElement("svg", _extends$f({
    width: "64",
    height: "64",
    viewBox: "0 0 1280 1280",
    xmlns: "http://www.w3.org/2000/svg",
    fillRule: "evenodd",
    clipRule: "evenodd",
    strokeLinejoin: "round",
    strokeMiterlimit: "2"
  }, props), /*#__PURE__*/React.createElement("path", {
    fill: "#e5e9ed",
    d: "M0 0h1280v1280H0z"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M910 410H370v470h540V410zm-57.333 57.333v355.334H427.333V467.333h425.334z",
    fill: "#cad3db"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M810 770H480v-60l100-170 130 170 100-65v125z",
    fill: "#cad3db"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "750",
    cy: "550",
    r: "50",
    fill: "#cad3db",
    transform: "translate(10 10)"
  })));

  const type$7 = 'image';
  function Image(props) {
    const {
      field
    } = props;
    const {
      alt,
      id,
      source
    } = field;
    const safeSource = safeImageSource(useExpressionValue(source));
    const altText = useExpressionValue(alt);
    const {
      formId
    } = F$1(FormContext);
    return e$2("div", {
      class: formFieldClasses(type$7),
      children: e$2("div", {
        class: "fjs-image-container",
        children: [safeSource && e$2("img", {
          alt: altText,
          src: safeSource,
          class: "fjs-image",
          id: prefixId(id, formId)
        }), !safeSource && e$2("div", {
          class: "fjs-image-placeholder",
          children: e$2(ImagePlaceholder, {
            alt: "This is an image placeholder"
          })
        })]
      })
    });
  }
  Image.create = function (options = {}) {
    return {
      ...options
    };
  };
  Image.type = type$7;
  Image.keyed = false;

  const type$6 = 'number';
  function Numberfield(props) {
    const {
      disabled,
      errors = [],
      field,
      value,
      onChange
    } = props;
    const {
      description,
      id,
      label,
      appearance = {},
      validate = {},
      decimalDigits,
      serializeToString = false,
      increment: incrementValue
    } = field;
    const {
      prefixAdorner,
      suffixAdorner
    } = appearance;
    const {
      required
    } = validate;
    const inputRef = s();
    const [stringValueCache, setStringValueCache] = l$1('');

    // checks whether the value currently in the form data is practically different from the one in the input field cache
    // this allows us to guarantee the field always displays valid form data, but without auto-simplifying values like 1.000 to 1
    const cacheValueMatchesState = d(() => Numberfield.sanitizeValue({
      value,
      formField: field
    }) === Numberfield.sanitizeValue({
      value: stringValueCache,
      formField: field
    }), [stringValueCache, value, field]);
    const displayValue = d(() => {
      if (value === 'NaN') return 'NaN';
      return cacheValueMatchesState ? stringValueCache : value || value === 0 ? Big(value).toFixed() : '';
    }, [stringValueCache, value, cacheValueMatchesState]);
    const arrowIncrementValue = d(() => {
      if (incrementValue) return Big(incrementValue);
      if (decimalDigits) return Big(`1e-${decimalDigits}`);
      return Big('1');
    }, [decimalDigits, incrementValue]);
    const setValue = A$1(stringValue => {
      if (isNullEquivalentValue(stringValue)) {
        setStringValueCache('');
        onChange({
          field,
          value: null
        });
        return;
      }

      // treat commas as dots
      stringValue = stringValue.replaceAll(',', '.');
      if (isNaN(Number(stringValue))) {
        setStringValueCache('NaN');
        onChange({
          field,
          value: 'NaN'
        });
        return;
      }
      setStringValueCache(stringValue);
      onChange({
        field,
        value: serializeToString ? stringValue : Number(stringValue)
      });
    }, [field, onChange, serializeToString]);
    const increment = () => {
      const base = isValidNumber(value) ? Big(value) : Big(0);
      const stepFlooredValue = base.minus(base.mod(arrowIncrementValue));

      // note: toFixed() behaves differently in big.js
      setValue(stepFlooredValue.plus(arrowIncrementValue).toFixed());
    };
    const decrement = () => {
      const base = isValidNumber(value) ? Big(value) : Big(0);
      const offset = base.mod(arrowIncrementValue);
      if (offset.cmp(0) === 0) {
        // if we're already on a valid step, decrement
        setValue(base.minus(arrowIncrementValue).toFixed());
      } else {
        // otherwise floor to the step
        const stepFlooredValue = base.minus(base.mod(arrowIncrementValue));
        setValue(stepFlooredValue.toFixed());
      }
    };
    const onKeyDown = e => {
      // delete the NaN state all at once on backspace or delete
      if (value === 'NaN' && (e.code === 'Backspace' || e.code === 'Delete')) {
        setValue(null);
        e.preventDefault();
        return;
      }
      if (e.code === 'ArrowUp') {
        increment();
        e.preventDefault();
        return;
      }
      if (e.code === 'ArrowDown') {
        decrement();
        e.preventDefault();
        return;
      }
    };

    // intercept key presses which would lead to an invalid number
    const onKeyPress = e => {
      const caretIndex = inputRef.current.selectionStart;
      const selectionWidth = inputRef.current.selectionStart - inputRef.current.selectionEnd;
      const previousValue = inputRef.current.value;
      if (!willKeyProduceValidNumber(e.key, previousValue, caretIndex, selectionWidth, decimalDigits)) {
        e.preventDefault();
      }
    };
    const {
      formId
    } = F$1(FormContext);
    return e$2("div", {
      class: formFieldClasses(type$6, {
        errors,
        disabled
      }),
      children: [e$2(Label, {
        id: prefixId(id, formId),
        label: label,
        required: required
      }), e$2(InputAdorner, {
        disabled: disabled,
        pre: prefixAdorner,
        post: suffixAdorner,
        children: e$2("div", {
          class: classNames('fjs-vertical-group', {
            'disabled': disabled
          }, {
            'hasErrors': errors.length
          }),
          children: [e$2("input", {
            ref: inputRef,
            class: "fjs-input",
            disabled: disabled,
            id: prefixId(id, formId),
            onKeyDown: onKeyDown,
            onKeyPress: onKeyPress

            // @ts-ignore
            ,
            onInput: e => setValue(e.target.value),
            type: "text",
            autoComplete: "off",
            step: arrowIncrementValue,
            value: displayValue
          }), e$2("div", {
            class: classNames('fjs-number-arrow-container', {
              'disabled': disabled
            }),
            children: [e$2("button", {
              class: "fjs-number-arrow-up",
              onClick: () => increment(),
              tabIndex: -1,
              children: "\u02C4"
            }), e$2("div", {
              class: "fjs-number-arrow-separator"
            }), e$2("button", {
              class: "fjs-number-arrow-down",
              onClick: () => decrement(),
              tabIndex: -1,
              children: "\u02C5"
            })]
          })]
        })
      }), e$2(Description, {
        description: description
      }), e$2(Errors, {
        errors: errors
      })]
    });
  }
  Numberfield.create = (options = {}) => options;
  Numberfield.sanitizeValue = ({
    value,
    formField
  }) => {
    // null state is allowed
    if (isNullEquivalentValue(value)) return null;

    // if data cannot be parsed as a valid number, go into invalid NaN state
    if (!isValidNumber(value)) return 'NaN';

    // otherwise parse to formatting type
    return formField.serializeToString ? value.toString() : Number(value);
  };
  Numberfield.type = type$6;
  Numberfield.keyed = true;
  Numberfield.label = 'Number';
  Numberfield.emptyValue = null;

  const type$5 = 'radio';
  function Radio(props) {
    const {
      disabled,
      errors = [],
      field,
      value
    } = props;
    const {
      description,
      id,
      label,
      validate = {}
    } = field;
    const {
      required
    } = validate;
    const onChange = v => {
      props.onChange({
        field,
        value: v
      });
    };
    const {
      state: loadState,
      values: options
    } = useValuesAsync(field);
    const {
      formId
    } = F$1(FormContext);
    return e$2("div", {
      class: formFieldClasses(type$5, {
        errors,
        disabled
      }),
      children: [e$2(Label, {
        label: label,
        required: required
      }), loadState == LOAD_STATES.LOADED && options.map((option, index) => {
        return e$2(Label, {
          id: prefixId(`${id}-${index}`, formId),
          label: option.label,
          class: classNames({
            'fjs-checked': option.value === value
          }),
          required: false,
          children: e$2("input", {
            checked: option.value === value,
            class: "fjs-input",
            disabled: disabled,
            id: prefixId(`${id}-${index}`, formId),
            type: "radio",
            onClick: () => onChange(option.value)
          })
        }, `${id}-${index}`);
      }), e$2(Description, {
        description: description
      }), e$2(Errors, {
        errors: errors
      })]
    });
  }
  Radio.create = function (options = {}) {
    if (options.valuesKey) return options;
    return {
      values: [{
        label: 'Value',
        value: 'value'
      }],
      ...options
    };
  };
  Radio.type = type$5;
  Radio.label = 'Radio';
  Radio.keyed = true;
  Radio.emptyValue = null;
  Radio.sanitizeValue = sanitizeSingleSelectValue;

  const type$4 = 'select';
  function Select(props) {
    const {
      disabled,
      errors = [],
      field,
      value
    } = props;
    const {
      description,
      id,
      label,
      validate = {}
    } = field;
    const {
      required
    } = validate;
    const onChange = ({
      target
    }) => {
      props.onChange({
        field,
        value: target.value === '' ? null : target.value
      });
    };
    const {
      state: loadState,
      values: options
    } = useValuesAsync(field);
    const {
      formId
    } = F$1(FormContext);
    return e$2("div", {
      class: formFieldClasses(type$4, {
        errors,
        disabled
      }),
      children: [e$2(Label, {
        id: prefixId(id, formId),
        label: label,
        required: required
      }), e$2("select", {
        class: "fjs-select",
        disabled: disabled,
        id: prefixId(id, formId),
        onChange: onChange,
        value: value || '',
        children: [e$2("option", {
          value: ""
        }), loadState == LOAD_STATES.LOADED && options.map((option, index) => {
          return e$2("option", {
            value: option.value,
            children: option.label
          }, `${id}-${index}`);
        })]
      }), e$2(Description, {
        description: description
      }), e$2(Errors, {
        errors: errors
      })]
    });
  }
  Select.create = function (options = {}) {
    if (options.valuesKey) return options;
    return {
      values: [{
        label: 'Value',
        value: 'value'
      }],
      ...options
    };
  };
  Select.type = type$4;
  Select.label = 'Select';
  Select.keyed = true;
  Select.emptyValue = null;
  Select.sanitizeValue = sanitizeSingleSelectValue;

  function _extends$e() { _extends$e = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends$e.apply(this, arguments); }
  var CloseIcon = (({
    styles = {},
    ...props
  }) => /*#__PURE__*/React.createElement("svg", _extends$e({
    width: "16",
    height: "16",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, props), /*#__PURE__*/React.createElement("path", {
    fillRule: "evenodd",
    clipRule: "evenodd",
    d: "M12 4.7l-.7-.7L8 7.3 4.7 4l-.7.7L7.3 8 4 11.3l.7.7L8 8.7l3.3 3.3.7-.7L8.7 8 12 4.7z",
    fill: "currentColor"
  })));

  const type$3 = 'taglist';
  function Taglist(props) {
    const {
      disabled,
      errors = [],
      field,
      value: values = []
    } = props;
    const {
      description,
      id,
      label
    } = field;
    const {
      formId
    } = F$1(FormContext);
    const [filter, setFilter] = l$1('');
    const [filteredOptions, setFilteredOptions] = l$1([]);
    const [isDropdownExpanded, setIsDropdownExpanded] = l$1(false);
    const [hasOptionsLeft, setHasOptionsLeft] = l$1(true);
    const [isEscapeClosed, setIsEscapeClose] = l$1(false);
    const searchbarRef = s();
    const {
      state: loadState,
      values: options
    } = useValuesAsync(field);

    // We cache a map of option values to their index so that we don't need to search the whole options array every time to correlate the label
    const valueToOptionMap = d(() => Object.assign({}, ...options.map((o, x) => ({
      [o.value]: options[x]
    }))), [options]);

    // Usage of stringify is necessary here because we want this effect to only trigger when there is a value change to the array
    y(() => {
      if (loadState === LOAD_STATES.LOADED) {
        setFilteredOptions(options.filter(o => o.label && o.value && o.label.toLowerCase().includes(filter.toLowerCase()) && !values.includes(o.value)));
      } else {
        setFilteredOptions([]);
      }
    }, [filter, JSON.stringify(values), options, loadState]);
    y(() => {
      setHasOptionsLeft(options.length > values.length);
    }, [options.length, values.length]);
    const onFilterChange = ({
      target
    }) => {
      setIsEscapeClose(false);
      setFilter(target.value);
    };
    const selectValue = value => {
      if (filter) {
        setFilter('');
      }

      // Ensure values cannot be double selected due to latency
      if (values.at(-1) === value) {
        return;
      }
      props.onChange({
        value: [...values, value],
        field
      });
    };
    const deselectValue = value => {
      props.onChange({
        value: values.filter(v => v != value),
        field
      });
    };
    const onInputKeyDown = e => {
      switch (e.key) {
        case 'ArrowUp':
        case 'ArrowDown':
          // We do not want the cursor to seek in the search field when we press up and down
          e.preventDefault();
          break;
        case 'Backspace':
          if (!filter && values.length) {
            deselectValue(values[values.length - 1]);
          }
          break;
        case 'Escape':
          setIsEscapeClose(true);
          break;
        case 'Enter':
          if (isEscapeClosed) {
            setIsEscapeClose(false);
          }
          break;
      }
    };
    const onTagRemoveClick = (event, value) => {
      const {
        target
      } = event;
      deselectValue(value);

      // restore focus if there is no next sibling to focus
      const nextTag = target.closest('.fjs-taglist-tag').nextSibling;
      if (!nextTag) {
        searchbarRef.current.focus();
      }
    };
    return e$2("div", {
      class: formFieldClasses(type$3, {
        errors,
        disabled
      }),
      children: [e$2(Label, {
        label: label,
        id: prefixId(`${id}-search`, formId)
      }), e$2("div", {
        class: classNames('fjs-taglist', {
          'disabled': disabled
        }),
        children: [!disabled && loadState === LOAD_STATES.LOADED && e$2("div", {
          class: "fjs-taglist-tags",
          children: values.map(v => {
            return e$2("div", {
              class: "fjs-taglist-tag",
              onMouseDown: e => e.preventDefault(),
              children: [e$2("span", {
                class: "fjs-taglist-tag-label",
                children: valueToOptionMap[v] ? valueToOptionMap[v].label : `unexpected value{${v}}`
              }), e$2("button", {
                type: "button",
                title: "Remove tag",
                class: "fjs-taglist-tag-remove",
                onClick: event => onTagRemoveClick(event, v),
                children: e$2(CloseIcon, {})
              })]
            });
          })
        }), e$2("input", {
          disabled: disabled,
          class: "fjs-taglist-input",
          ref: searchbarRef,
          id: prefixId(`${id}-search`, formId),
          onChange: onFilterChange,
          type: "text",
          value: filter,
          placeholder: 'Search',
          autoComplete: "off",
          onKeyDown: e => onInputKeyDown(e),
          onMouseDown: () => setIsEscapeClose(false),
          onFocus: () => setIsDropdownExpanded(true),
          onBlur: () => {
            setIsDropdownExpanded(false);
            setFilter('');
          }
        })]
      }), e$2("div", {
        class: "fjs-taglist-anchor",
        children: !disabled && loadState === LOAD_STATES.LOADED && isDropdownExpanded && !isEscapeClosed && e$2(DropdownList, {
          values: filteredOptions,
          getLabel: o => o.label,
          onValueSelected: o => selectValue(o.value),
          emptyListMessage: hasOptionsLeft ? 'No results' : 'All values selected',
          listenerElement: searchbarRef.current
        })
      }), e$2(Description, {
        description: description
      }), e$2(Errors, {
        errors: errors
      })]
    });
  }
  Taglist.create = function (options = {}) {
    if (options.valuesKey) return options;
    return {
      values: [{
        label: 'Value',
        value: 'value'
      }],
      ...options
    };
  };
  Taglist.type = type$3;
  Taglist.label = 'Taglist';
  Taglist.keyed = true;
  Taglist.emptyValue = [];
  Taglist.sanitizeValue = sanitizeMultiSelectValue;

  function _extends$d() { _extends$d = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends$d.apply(this, arguments); }
  var ButtonIcon = (({
    styles = {},
    ...props
  }) => /*#__PURE__*/React.createElement("svg", _extends$d({
    xmlns: "http://www.w3.org/2000/svg",
    width: "54",
    height: "54"
  }, props), /*#__PURE__*/React.createElement("path", {
    fillRule: "evenodd",
    d: "M45 17a3 3 0 013 3v14a3 3 0 01-3 3H9a3 3 0 01-3-3V20a3 3 0 013-3h36zm-9 8.889H18v2.222h18V25.89z"
  })));

  function _extends$c() { _extends$c = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends$c.apply(this, arguments); }
  var CheckboxIcon = (({
    styles = {},
    ...props
  }) => /*#__PURE__*/React.createElement("svg", _extends$c({
    xmlns: "http://www.w3.org/2000/svg",
    width: "54",
    height: "54"
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M34 18H20a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V20a2 2 0 00-2-2zm-9 14l-5-5 1.41-1.41L25 29.17l7.59-7.59L34 23l-9 9z"
  })));

  function _extends$b() { _extends$b = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends$b.apply(this, arguments); }
  var ChecklistIcon = (({
    styles = {},
    ...props
  }) => /*#__PURE__*/React.createElement("svg", _extends$b({
    width: "54",
    height: "54",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, props), /*#__PURE__*/React.createElement("path", {
    fillRule: "evenodd",
    clipRule: "evenodd",
    d: "M19 24h-6v6h6v-6zm-6-2a2 2 0 00-2 2v6a2 2 0 002 2h6a2 2 0 002-2v-6a2 2 0 00-2-2h-6zm6 18h-6v6h6v-6zm-6-2a2 2 0 00-2 2v6a2 2 0 002 2h6a2 2 0 002-2v-6a2 2 0 00-2-2h-6zm6-30h-6v6h6V8zm-6-2a2 2 0 00-2 2v6a2 2 0 002 2h6a2 2 0 002-2V8a2 2 0 00-2-2h-6z",
    fill: "#22242A"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M26 26a1 1 0 011-1h15a1 1 0 011 1v2a1 1 0 01-1 1H27a1 1 0 01-1-1v-2zm0 16a1 1 0 011-1h15a1 1 0 011 1v2a1 1 0 01-1 1H27a1 1 0 01-1-1v-2zm0-32a1 1 0 011-1h15a1 1 0 011 1v2a1 1 0 01-1 1H27a1 1 0 01-1-1v-2z",
    fill: "#22242A"
  })));

  function _extends$a() { _extends$a = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends$a.apply(this, arguments); }
  var DatetimeIcon = (({
    styles = {},
    ...props
  }) => /*#__PURE__*/React.createElement("svg", _extends$a({
    xmlns: "http://www.w3.org/2000/svg",
    width: "54",
    height: "54",
    fill: "none"
  }, props), /*#__PURE__*/React.createElement("path", {
    fill: "#000",
    fillRule: "evenodd",
    d: "M37.908 13.418h-5.004v-2.354h-1.766v2.354H21.13v-2.354h-1.766v2.354H14.36c-1.132 0-2.06.928-2.06 2.06v23.549c0 1.132.928 2.06 2.06 2.06h6.77v-1.766h-6.358a.707.707 0 01-.706-.706V15.89c0-.39.316-.707.706-.707h4.592v2.355h1.766v-2.355h10.008v2.355h1.766v-2.355h4.592c.39 0 .707.317.707.707v6.358h1.765v-6.77c0-1.133-.927-2.06-2.06-2.06z",
    clipRule: "evenodd"
  }), /*#__PURE__*/React.createElement("path", {
    fill: "#000",
    d: "M35.13 37.603l1.237-1.237-3.468-3.475v-5.926h-1.754v6.654l3.984 3.984z"
  }), /*#__PURE__*/React.createElement("path", {
    fill: "#000",
    fillRule: "evenodd",
    d: "M23.08 36.962a9.678 9.678 0 1017.883-7.408 9.678 9.678 0 00-17.882 7.408zm4.54-10.292a7.924 7.924 0 118.805 13.177A7.924 7.924 0 0127.62 26.67z",
    clipRule: "evenodd"
  })));

  function _extends$9() { _extends$9 = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends$9.apply(this, arguments); }
  var TaglistIcon = (({
    styles = {},
    ...props
  }) => /*#__PURE__*/React.createElement("svg", _extends$9({
    width: "54",
    height: "54",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, props), /*#__PURE__*/React.createElement("path", {
    fillRule: "evenodd",
    clipRule: "evenodd",
    d: "M45 16a3 3 0 013 3v16a3 3 0 01-3 3H9a3 3 0 01-3-3V19a3 3 0 013-3h36zm0 2H9a1 1 0 00-1 1v16a1 1 0 001 1h36a1 1 0 001-1V19a1 1 0 00-1-1z",
    fill: "#000"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M11 22a1 1 0 011-1h19a1 1 0 011 1v10a1 1 0 01-1 1H12a1 1 0 01-1-1V22z",
    fill: "#505562"
  })));

  function _extends$8() { _extends$8 = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends$8.apply(this, arguments); }
  var FormIcon = (({
    styles = {},
    ...props
  }) => /*#__PURE__*/React.createElement("svg", _extends$8({
    xmlns: "http://www.w3.org/2000/svg",
    width: "54",
    height: "54"
  }, props), /*#__PURE__*/React.createElement("rect", {
    x: "15",
    y: "17",
    width: "24",
    height: "4",
    rx: "1"
  }), /*#__PURE__*/React.createElement("rect", {
    x: "15",
    y: "25",
    width: "24",
    height: "4",
    rx: "1"
  }), /*#__PURE__*/React.createElement("rect", {
    x: "15",
    y: "33",
    width: "13",
    height: "4",
    rx: "1"
  })));

  function _extends$7() { _extends$7 = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends$7.apply(this, arguments); }
  var ColumnsIcon = (({
    styles = {},
    ...props
  }) => /*#__PURE__*/React.createElement("svg", _extends$7({
    xmlns: "http://www.w3.org/2000/svg",
    width: "54",
    height: "54"
  }, props), /*#__PURE__*/React.createElement("path", {
    fillRule: "evenodd",
    d: "M8 33v5a1 1 0 001 1h4v2H9a3 3 0 01-3-3v-5h2zm18 6v2H15v-2h11zm13 0v2H28v-2h11zm9-6v5a3 3 0 01-3 3h-4v-2h4a1 1 0 00.993-.883L46 38v-5h2zM8 22v9H6v-9h2zm40 0v9h-2v-9h2zm-35-9v2H9a1 1 0 00-.993.883L8 16v4H6v-4a3 3 0 013-3h4zm32 0a3 3 0 013 3v4h-2v-4a1 1 0 00-.883-.993L45 15h-4v-2h4zm-6 0v2H28v-2h11zm-13 0v2H15v-2h11z"
  })));

  function _extends$6() { _extends$6 = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends$6.apply(this, arguments); }
  var NumberIcon = (({
    styles = {},
    ...props
  }) => /*#__PURE__*/React.createElement("svg", _extends$6({
    xmlns: "http://www.w3.org/2000/svg",
    width: "54",
    height: "54"
  }, props), /*#__PURE__*/React.createElement("path", {
    fillRule: "evenodd",
    d: "M45 16a3 3 0 013 3v16a3 3 0 01-3 3H9a3 3 0 01-3-3V19a3 3 0 013-3h36zm0 2H9a1 1 0 00-1 1v16a1 1 0 001 1h36a1 1 0 001-1V19a1 1 0 00-1-1zM35 28.444h7l-3.5 4-3.5-4zM35 26h7l-3.5-4-3.5 4z"
  })));

  function _extends$5() { _extends$5 = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends$5.apply(this, arguments); }
  var RadioIcon = (({
    styles = {},
    ...props
  }) => /*#__PURE__*/React.createElement("svg", _extends$5({
    xmlns: "http://www.w3.org/2000/svg",
    width: "54",
    height: "54"
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M27 22c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zm0-5c-5.52 0-10 4.48-10 10s4.48 10 10 10 10-4.48 10-10-4.48-10-10-10zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z"
  })));

  function _extends$4() { _extends$4 = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends$4.apply(this, arguments); }
  var SelectIcon = (({
    styles = {},
    ...props
  }) => /*#__PURE__*/React.createElement("svg", _extends$4({
    xmlns: "http://www.w3.org/2000/svg",
    width: "54",
    height: "54"
  }, props), /*#__PURE__*/React.createElement("path", {
    fillRule: "evenodd",
    d: "M45 16a3 3 0 013 3v16a3 3 0 01-3 3H9a3 3 0 01-3-3V19a3 3 0 013-3h36zm0 2H9a1 1 0 00-1 1v16a1 1 0 001 1h36a1 1 0 001-1V19a1 1 0 00-1-1zm-12 7h9l-4.5 6-4.5-6z"
  })));

  function _extends$3() { _extends$3 = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends$3.apply(this, arguments); }
  var TextIcon = (({
    styles = {},
    ...props
  }) => /*#__PURE__*/React.createElement("svg", _extends$3({
    xmlns: "http://www.w3.org/2000/svg",
    width: "54",
    height: "54"
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M20.58 33.77h-3l-1.18-3.08H11l-1.1 3.08H7l5.27-13.54h2.89zm-5-5.36l-1.86-5-1.83 5zM22 20.23h5.41a15.47 15.47 0 012.4.14 3.42 3.42 0 011.41.55 3.47 3.47 0 011 1.14 3 3 0 01.42 1.58 3.26 3.26 0 01-1.91 2.94 3.63 3.63 0 011.91 1.22 3.28 3.28 0 01.66 2 4 4 0 01-.43 1.8 3.63 3.63 0 01-1.09 1.4 3.89 3.89 0 01-1.83.65q-.69.07-3.3.09H22zm2.73 2.25v3.13h3.8a1.79 1.79 0 001.1-.49 1.41 1.41 0 00.41-1 1.49 1.49 0 00-.35-1 1.54 1.54 0 00-1-.48c-.27 0-1.05-.05-2.34-.05zm0 5.39v3.62h2.57a11.52 11.52 0 001.88-.09 1.65 1.65 0 001-.54 1.6 1.6 0 00.38-1.14 1.75 1.75 0 00-.29-1 1.69 1.69 0 00-.86-.62 9.28 9.28 0 00-2.41-.23zM44.35 28.79l2.65.84a5.94 5.94 0 01-2 3.29A5.74 5.74 0 0141.38 34a5.87 5.87 0 01-4.44-1.84 7.09 7.09 0 01-1.73-5A7.43 7.43 0 0137 21.87 6 6 0 0141.54 20a5.64 5.64 0 014 1.47A5.33 5.33 0 0147 24l-2.7.65a2.8 2.8 0 00-2.86-2.27A3.09 3.09 0 0039 23.42a5.31 5.31 0 00-.93 3.5 5.62 5.62 0 00.93 3.65 3 3 0 002.4 1.09 2.72 2.72 0 001.82-.66 4 4 0 001.13-2.21z"
  })));

  function _extends$2() { _extends$2 = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends$2.apply(this, arguments); }
  var TextfieldIcon = (({
    styles = {},
    ...props
  }) => /*#__PURE__*/React.createElement("svg", _extends$2({
    xmlns: "http://www.w3.org/2000/svg",
    width: "54",
    height: "54"
  }, props), /*#__PURE__*/React.createElement("path", {
    fillRule: "evenodd",
    d: "M45 16a3 3 0 013 3v16a3 3 0 01-3 3H9a3 3 0 01-3-3V19a3 3 0 013-3h36zm0 2H9a1 1 0 00-1 1v16a1 1 0 001 1h36a1 1 0 001-1V19a1 1 0 00-1-1zm-32 4v10h-2V22h2z"
  })));

  function _extends$1() { _extends$1 = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends$1.apply(this, arguments); }
  var TextareaIcon = (({
    styles = {},
    ...props
  }) => /*#__PURE__*/React.createElement("svg", _extends$1({
    xmlns: "http://www.w3.org/2000/svg",
    width: "54",
    height: "54"
  }, props), /*#__PURE__*/React.createElement("path", {
    fillRule: "evenodd",
    d: "M45 13a3 3 0 013 3v22a3 3 0 01-3 3H9a3 3 0 01-3-3V16a3 3 0 013-3h36zm0 2H9a1 1 0 00-1 1v22a1 1 0 001 1h36a1 1 0 001-1V16a1 1 0 00-1-1zm-1.136 15.5l.848.849-6.363 6.363-.849-.848 6.364-6.364zm.264 3.5l.849.849-2.828 2.828-.849-.849L44.128 34zM13 19v10h-2V19h2z"
  })));

  function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }
  var ImageIcon = (({
    styles = {},
    ...props
  }) => /*#__PURE__*/React.createElement("svg", _extends({
    width: "54",
    height: "54",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, props), /*#__PURE__*/React.createElement("path", {
    fillRule: "evenodd",
    clipRule: "evenodd",
    d: "M34.636 21.91A3.818 3.818 0 1127 21.908a3.818 3.818 0 017.636 0zm-2 0A1.818 1.818 0 1129 21.908a1.818 1.818 0 013.636 0z",
    fill: "#000"
  }), /*#__PURE__*/React.createElement("path", {
    fillRule: "evenodd",
    clipRule: "evenodd",
    d: "M15 13a2 2 0 00-2 2v24a2 2 0 002 2h24a2 2 0 002-2V15a2 2 0 00-2-2H15zm24 2H15v12.45l4.71-4.709a1.91 1.91 0 012.702 0l6.695 6.695 2.656-1.77a1.91 1.91 0 012.411.239L39 32.73V15zM15 39v-8.754c.06-.038.116-.083.168-.135l5.893-5.893 6.684 6.685a1.911 1.911 0 002.41.238l2.657-1.77 6.02 6.02c.052.051.108.097.168.135V39H15z",
    fill: "#000"
  })));

  const iconsByType = {
    button: ButtonIcon,
    checkbox: CheckboxIcon,
    checklist: ChecklistIcon,
    columns: ColumnsIcon,
    datetime: DatetimeIcon,
    image: ImageIcon,
    number: NumberIcon,
    radio: RadioIcon,
    select: SelectIcon,
    taglist: TaglistIcon,
    text: TextIcon,
    textfield: TextfieldIcon,
    textarea: TextareaIcon,
    default: FormIcon
  };

  const type$2 = 'text';
  function Text(props) {
    const {
      field,
      disabled
    } = props;
    const {
      text = ''
    } = field;
    const textValue = useExpressionValue(text) || '';
    return e$2("div", {
      class: formFieldClasses(type$2),
      children: renderText(field, textValue, disabled)
    });
  }
  Text.create = function (options = {}) {
    return {
      text: '# Text',
      ...options
    };
  };
  Text.type = type$2;
  Text.keyed = false;

  // helper //////////////

  function renderText(field, content, disabled) {
    const {
      text
    } = field;
    const Icon = iconsByType['text'];
    if (disabled) {
      if (!text) {
        return e$2("div", {
          class: "fjs-form-field-placeholder",
          children: [e$2(Icon, {
            viewBox: "0 0 54 54"
          }), "Text view is empty"]
        });
      }
      if (isExpression$2(text)) {
        return e$2("div", {
          class: "fjs-form-field-placeholder",
          children: [e$2(Icon, {
            viewBox: "0 0 54 54"
          }), "Text view is populated by an expression"]
        });
      }
    }
    return e$2(Markup, {
      markup: safeMarkdown(content),
      trim: false
    });
  }

  const type$1 = 'textfield';
  function Textfield(props) {
    const {
      disabled,
      errors = [],
      field,
      value = ''
    } = props;
    const {
      description,
      id,
      label,
      appearance = {},
      validate = {}
    } = field;
    const {
      prefixAdorner,
      suffixAdorner
    } = appearance;
    const {
      required
    } = validate;
    const onChange = ({
      target
    }) => {
      props.onChange({
        field,
        value: target.value
      });
    };
    const {
      formId
    } = F$1(FormContext);
    return e$2("div", {
      class: formFieldClasses(type$1, {
        errors,
        disabled
      }),
      children: [e$2(Label, {
        id: prefixId(id, formId),
        label: label,
        required: required
      }), e$2(InputAdorner, {
        disabled: disabled,
        pre: prefixAdorner,
        post: suffixAdorner,
        children: e$2("input", {
          class: "fjs-input",
          disabled: disabled,
          id: prefixId(id, formId),
          onInput: onChange,
          type: "text",
          value: value
        })
      }), e$2(Description, {
        description: description
      }), e$2(Errors, {
        errors: errors
      })]
    });
  }
  Textfield.create = function (options = {}) {
    return {
      ...options
    };
  };
  Textfield.type = type$1;
  Textfield.label = 'Text field';
  Textfield.keyed = true;
  Textfield.emptyValue = '';
  Textfield.sanitizeValue = ({
    value
  }) => isArray$2(value) || isObject(value) ? '' : String(value);

  const type = 'textarea';
  function Textarea(props) {
    const {
      disabled,
      errors = [],
      field,
      value = ''
    } = props;
    const {
      description,
      id,
      label,
      validate = {}
    } = field;
    const {
      required
    } = validate;
    const textareaRef = s();
    const onInput = ({
      target
    }) => {
      props.onChange({
        field,
        value: target.value
      });
    };
    const autoSizeTextarea = A$1(textarea => {
      // Ensures the textarea shrinks back, and improves resizing behavior consistency
      textarea.style.height = '0px';
      const computed = window.getComputedStyle(textarea);
      const calculatedHeight = parseInt(computed.getPropertyValue('border-top-width')) + parseInt(computed.getPropertyValue('padding-top')) + textarea.scrollHeight + parseInt(computed.getPropertyValue('padding-bottom')) + parseInt(computed.getPropertyValue('border-bottom-width'));
      const minHeight = 75;
      const maxHeight = 350;
      const displayHeight = Math.max(Math.min(calculatedHeight, maxHeight), minHeight);
      textarea.style.height = `${displayHeight}px`;

      // Overflow is hidden by default to hide scrollbar flickering
      textarea.style.overflow = calculatedHeight > maxHeight ? 'visible' : 'hidden';
    }, []);
    y(() => {
      autoSizeTextarea(textareaRef.current);
    }, [autoSizeTextarea, value]);
    const {
      formId
    } = F$1(FormContext);
    return e$2("div", {
      class: formFieldClasses(type, {
        errors,
        disabled
      }),
      children: [e$2(Label, {
        id: prefixId(id, formId),
        label: label,
        required: required
      }), e$2("textarea", {
        class: "fjs-textarea",
        disabled: disabled,
        id: prefixId(id, formId),
        onInput: onInput,
        value: value,
        ref: textareaRef
      }), e$2(Description, {
        description: description
      }), e$2(Errors, {
        errors: errors
      })]
    });
  }
  Textarea.create = function (options = {}) {
    return {
      ...options
    };
  };
  Textarea.type = type;
  Textarea.label = 'Text area';
  Textarea.keyed = true;
  Textarea.emptyValue = '';
  Textarea.sanitizeValue = ({
    value
  }) => isArray$2(value) || isObject(value) ? '' : String(value);

  const formFields = [Button, Checkbox, Checklist, Default, Image, Numberfield, Datetime, Radio, Select, Taglist, Text, Textfield, Textarea];

  class FormFields {
    constructor() {
      this._formFields = {};
      formFields.forEach(formField => {
        const {
          type
        } = formField;
        this.register(type, formField);
      });
    }
    register(type, formField) {
      this._formFields[type] = formField;
    }
    get(type) {
      return this._formFields[type];
    }
  }

  function Renderer(config, eventBus, form, injector) {
    const App = () => {
      const [state, setState] = l$1(form._getState());
      const formContext = {
        getService(type, strict = true) {
          return injector.get(type, strict);
        },
        formId: form._id
      };
      eventBus.on('changed', newState => {
        setState(newState);
      });
      const onChange = A$1(update => form._update(update), [form]);
      const {
        properties
      } = state;
      const {
        readOnly
      } = properties;
      const onSubmit = A$1(() => {
        if (!readOnly) {
          form.submit();
        }
      }, [form, readOnly]);
      const onReset = A$1(() => form.reset(), [form]);
      const {
        schema
      } = state;
      if (!schema) {
        return null;
      }
      return e$2(FormContext.Provider, {
        value: formContext,
        children: e$2(FormComponent, {
          onChange: onChange,
          onSubmit: onSubmit,
          onReset: onReset
        })
      });
    };
    const {
      container
    } = config;
    eventBus.on('form.init', () => {
      S$1(e$2(App, {}), container);
    });
    eventBus.on('form.destroy', () => {
      S$1(null, container);
    });
  }
  Renderer.$inject = ['config.renderer', 'eventBus', 'form', 'injector'];

  var renderModule = {
    __init__: ['formFields', 'renderer'],
    formFields: ['type', FormFields],
    renderer: ['type', Renderer]
  };

  var core = {
    __depends__: [importModule, renderModule],
    conditionChecker: ['type', ConditionChecker],
    eventBus: ['type', EventBus],
    formFieldRegistry: ['type', FormFieldRegistry],
    validator: ['type', Validator]
  };

  /**
   * @typedef { import('./types').Injector } Injector
   * @typedef { import('./types').Data } Data
   * @typedef { import('./types').Errors } Errors
   * @typedef { import('./types').Schema } Schema
   * @typedef { import('./types').FormProperties } FormProperties
   * @typedef { import('./types').FormProperty } FormProperty
   * @typedef { import('./types').FormEvent } FormEvent
   * @typedef { import('./types').FormOptions } FormOptions
   *
   * @typedef { {
   *   data: Data,
   *   initialData: Data,
   *   errors: Errors,
   *   properties: FormProperties,
   *   schema: Schema
   * } } State
   *
   * @typedef { (type:FormEvent, priority:number, handler:Function) => void } OnEventWithPriority
   * @typedef { (type:FormEvent, handler:Function) => void } OnEventWithOutPriority
   * @typedef { OnEventWithPriority & OnEventWithOutPriority } OnEventType
   */

  const ids = new Ids([32, 36, 1]);

  /**
   * The form.
   */
  class Form {
    /**
     * @constructor
     * @param {FormOptions} options
     */
    constructor(options = {}) {
      /**
       * @public
       * @type {OnEventType}
       */
      this.on = this._onEvent;

      /**
       * @public
       * @type {String}
       */
      this._id = ids.next();

      /**
       * @private
       * @type {Element}
       */
      this._container = createFormContainer();
      const {
        container,
        injector = this._createInjector(options, this._container),
        properties = {}
      } = options;

      /**
       * @private
       * @type {State}
       */
      this._state = {
        initialData: null,
        data: null,
        properties,
        errors: {},
        schema: null
      };
      this.get = injector.get;
      this.invoke = injector.invoke;
      this.get('eventBus').fire('form.init');
      if (container) {
        this.attachTo(container);
      }
    }
    clear() {
      // clear form services
      this._emit('diagram.clear');

      // clear diagram services (e.g. EventBus)
      this._emit('form.clear');
    }

    /**
     * Destroy the form, removing it from DOM,
     * if attached.
     */
    destroy() {
      // destroy form services
      this.get('eventBus').fire('form.destroy');

      // destroy diagram services (e.g. EventBus)
      this.get('eventBus').fire('diagram.destroy');
      this._detach(false);
    }

    /**
     * Open a form schema with the given initial data.
     *
     * @param {Schema} schema
     * @param {Data} [data]
     *
     * @return Promise<{ warnings: Array<any> }>
     */
    importSchema(schema, data = {}) {
      return new Promise((resolve, reject) => {
        try {
          this.clear();
          const {
            schema: importedSchema,
            data: initializedData,
            warnings
          } = this.get('importer').importSchema(schema, data);
          this._setState({
            data: initializedData,
            errors: {},
            schema: importedSchema,
            initialData: clone(initializedData)
          });
          this._emit('import.done', {
            warnings
          });
          return resolve({
            warnings
          });
        } catch (error) {
          this._emit('import.done', {
            error,
            warnings: error.warnings || []
          });
          return reject(error);
        }
      });
    }

    /**
     * Submit the form, triggering all field validations.
     *
     * @returns { { data: Data, errors: Errors } }
     */
    submit() {
      const {
        properties
      } = this._getState();
      if (properties.readOnly) {
        throw new Error('form is read-only');
      }
      const data = this._getSubmitData();
      const errors = this.validate();
      const filteredErrors = this._applyConditions(errors, data);
      const result = {
        data,
        errors: filteredErrors
      };
      this._emit('submit', result);
      return result;
    }
    reset() {
      this._emit('reset');
      this._setState({
        data: clone(this._state.initialData),
        errors: {}
      });
    }

    /**
     * @returns {Errors}
     */
    validate() {
      const formFieldRegistry = this.get('formFieldRegistry'),
        validator = this.get('validator');
      const {
        data
      } = this._getState();
      const errors = formFieldRegistry.getAll().reduce((errors, field) => {
        const {
          disabled,
          _path
        } = field;
        if (disabled) {
          return errors;
        }
        const value = get(data, _path);
        const fieldErrors = validator.validateField(field, value);
        return set(errors, [pathStringify(_path)], fieldErrors.length ? fieldErrors : undefined);
      }, /** @type {Errors} */{});
      this._setState({
        errors
      });
      return errors;
    }

    /**
     * @param {Element|string} parentNode
     */
    attachTo(parentNode) {
      if (!parentNode) {
        throw new Error('parentNode required');
      }
      this.detach();
      if (isString$2(parentNode)) {
        parentNode = document.querySelector(parentNode);
      }
      const container = this._container;
      parentNode.appendChild(container);
      this._emit('attach');
    }
    detach() {
      this._detach();
    }

    /**
     * @private
     *
     * @param {boolean} [emit]
     */
    _detach(emit = true) {
      const container = this._container,
        parentNode = container.parentNode;
      if (!parentNode) {
        return;
      }
      if (emit) {
        this._emit('detach');
      }
      parentNode.removeChild(container);
    }

    /**
     * @param {FormProperty} property
     * @param {any} value
     */
    setProperty(property, value) {
      const properties = set(this._getState().properties, [property], value);
      this._setState({
        properties
      });
    }

    /**
     * @param {FormEvent} type
     * @param {Function} handler
     */
    off(type, handler) {
      this.get('eventBus').off(type, handler);
    }

    /**
     * @private
     *
     * @param {FormOptions} options
     * @param {Element} container
     *
     * @returns {Injector}
     */
    _createInjector(options, container) {
      const {
        additionalModules = [],
        modules = []
      } = options;
      const config = {
        renderer: {
          container
        }
      };
      return createInjector([{
        config: ['value', config]
      }, {
        form: ['value', this]
      }, core, ...modules, ...additionalModules]);
    }

    /**
     * @private
     */
    _emit(type, data) {
      this.get('eventBus').fire(type, data);
    }

    /**
     * @internal
     *
     * @param { { add?: boolean, field: any, remove?: number, value?: any } } update
     */
    _update(update) {
      const {
        field,
        value
      } = update;
      const {
        _path
      } = field;
      let {
        data,
        errors
      } = this._getState();
      const validator = this.get('validator');
      const fieldErrors = validator.validateField(field, value);
      set(data, _path, value);
      set(errors, [pathStringify(_path)], fieldErrors.length ? fieldErrors : undefined);
      this._setState({
        data: clone(data),
        errors: clone(errors)
      });
    }

    /**
     * @internal
     */
    _getState() {
      return this._state;
    }

    /**
     * @internal
     */
    _setState(state) {
      this._state = {
        ...this._state,
        ...state
      };
      this._emit('changed', this._getState());
    }

    /**
     * @internal
     */
    _onEvent(type, priority, handler) {
      this.get('eventBus').on(type, priority, handler);
    }

    /**
     * @internal
     */
    _getSubmitData() {
      const formFieldRegistry = this.get('formFieldRegistry');
      const formData = this._getState().data;
      const submitData = formFieldRegistry.getAll().reduce((previous, field) => {
        const {
          disabled,
          _path
        } = field;

        // do not submit disabled form fields
        if (disabled || !_path) {
          return previous;
        }
        const value = get(formData, _path);
        return {
          ...previous,
          [_path[0]]: value
        };
      }, {});
      const filteredSubmitData = this._applyConditions(submitData, formData);
      return filteredSubmitData;
    }

    /**
     * @internal
     */
    _applyConditions(toFilter, data) {
      const conditionChecker = this.get('conditionChecker');
      return conditionChecker.applyConditions(toFilter, data);
    }
  }

  const schemaVersion = 6;

  /**
   * @typedef { import('./types').CreateFormOptions } CreateFormOptions
   */

  /**
   * Create a form.
   *
   * @param {CreateFormOptions} options
   *
   * @return {Promise<Form>}
   */
  function createForm(options) {
    const {
      data,
      schema,
      ...rest
    } = options;
    const form = new Form(rest);
    return form.importSchema(schema, data).then(function () {
      return form;
    });
  }

  exports.Form = Form;
  exports.createForm = createForm;
  exports.getSchemaVariables = getSchemaVariables;
  exports.schemaVersion = schemaVersion;

  Object.defineProperty(exports, '__esModule', { value: true });

})));