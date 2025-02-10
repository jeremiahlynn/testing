if (!Array.prototype.map) {
    Array.prototype.map = function (callback, thisArg) {
        if (this == null) {
            throw new TypeError('this is null or not defined');
        }
        if (typeof callback !== 'function') {
            throw new TypeError(callback + ' is not a function');
        }

        var result = [];
        var O = Object(this);
        var len = O.length >>> 0; // Convert to unsigned 32-bit integer

        for (var i = 0; i < len; i++) {
            if (i in O) {
                var value = O[i];
                result[i] = callback.call(thisArg, value, i, O);
            }
        }
        return result;
    };
}

if (!Array.prototype.filter) {
    Array.prototype.filter = function (callback, thisArg) {
        if (this == null) {
            throw new TypeError('this is null or not defined');
        }
        if (typeof callback !== 'function') {
            throw new TypeError(callback + ' is not a function');
        }

        var result = [];
        var O = Object(this);
        var len = O.length >>> 0; // Convert to unsigned 32-bit integer

        for (var i = 0; i < len; i++) {
            if (i in O) {
                var value = O[i];
                if (callback.call(thisArg, value, i, O)) {
                    result.push(value);
                }
            }
        }
        return result;
    };
}

if (!Array.prototype.find) {
    Array.prototype.find = function (callback, thisArg) {
        if (this == null) {
            throw new TypeError('this is null or not defined');
        }
        if (typeof callback !== 'function') {
            throw new TypeError(callback + ' is not a function');
        }

        var O = Object(this);
        var len = O.length >>> 0; // Convert to unsigned 32-bit integer

        for (var i = 0; i < len; i++) {
            if (i in O) {
                var value = O[i];
                if (callback.call(thisArg, value, i, O)) {
                    return value;
                }
            }
        }
        return null;
    };
}

if (!Array.prototype.reduce) {
    Array.prototype.reduce = function (callback, initialValue) {
        if (this == null) {
            throw new TypeError('this is null or not defined');
        }
        if (typeof callback !== 'function') {
            throw new TypeError(callback + ' is not a function');
        }

        var O = Object(this);
        var len = O.length >>> 0; // Convert to unsigned 32-bit integer
        var value;

        var i = 0;
        if (arguments.length >= 2) {
            value = initialValue;
        } else {
            while (i < len && !(i in O)) {
                i++;
            }
            if (i >= len) {
                throw new TypeError(
                    'Reduce of empty array with no initial value'
                );
            }
            value = O[i++];
        }

        for (; i < len; i++) {
            if (i in O) {
                value = callback(value, O[i], i, O);
            }
        }
        return value;
    };
}

if (!Array.prototype.includes) {
    Array.prototype.includes = function (searchElement, fromIndex) {
        // Handle cases where 'fromIndex' is undefined
        if (fromIndex === undefined) {
            fromIndex = 0;
        } else if (fromIndex < 0) {
            // Convert negative indexes to positive
            fromIndex = Math.max(0, this.length + fromIndex);
        }

        // Iterate through the array
        for (var i = fromIndex; i < this.length; i++) {
            // Check for strict equality
            if (this[i] === searchElement) {
                return true;
            }
        }

        return false;
    };
}
