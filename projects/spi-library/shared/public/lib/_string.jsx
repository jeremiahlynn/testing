if (!String.prototype.startsWith) {
    String.prototype.startsWith = function (searchString, position) {
        position = position || 0;
        return (
            this.slice(position, position + searchString.length) ===
            searchString
        );
    };
}

if (!String.prototype.endsWith) {
    String.prototype.endsWith = function (searchString, thisLength) {
        if (thisLength === undefined || thisLength > this.length) {
            thisLength = this.length;
        }
        return (
            this.slice(thisLength - searchString.length, thisLength) ===
            searchString
        );
    };
}

if (!String.prototype.includes) {
    String.prototype.includes = function (searchString, position) {
        if (typeof position !== 'number') {
            position = 0;
        }
        if (position + searchString.length > this.length) {
            return false;
        }
        return this.indexOf(searchString, position) !== -1;
    };
}

if (!String.prototype.repeat) {
    String.prototype.repeat = function (count) {
        if (count < 0 || count === Infinity) {
            throw new RangeError('Invalid repeat count');
        }
        return new Array(count + 1).join(this);
    };
}

if (!String.prototype.padStart) {
    String.prototype.padStart = function (targetLength, padString) {
        targetLength = targetLength >> 0; // Truncate if number or convert non-number to 0
        padString = String(padString || ' ');
        if (this.length > targetLength) {
            return String(this);
        }
        targetLength = targetLength - this.length;
        if (targetLength > padString.length) {
            padString += padString.repeat(targetLength / padString.length);
        }
        return padString.slice(0, targetLength) + String(this);
    };
}

if (!String.prototype.padEnd) {
    String.prototype.padEnd = function (targetLength, padString) {
        targetLength = targetLength >> 0; // Truncate if number or convert non-number to 0
        padString = String(padString || ' ');
        if (this.length > targetLength) {
            return String(this);
        }
        targetLength = targetLength - this.length;
        if (targetLength > padString.length) {
            padString += padString.repeat(targetLength / padString.length);
        }
        return String(this) + padString.slice(0, targetLength);
    };
}
