/* 
 * version: 2
 *
 * Monkey patch library to JS standard runtime.
 * Because loads of stuff is broken or missing.
 *
 * By Tom, for Tom.
 *
 * Hey, if you're including this: Be wary of collisions
 * when you're including other monkey patches or hacky
 * libraries. This behaviour can legitimately be
 * considered "bad practice", but trust me. I know what
 * I'm doing.
 */

Date.prototype.toUnixTimestamp = function() { return this.getTime()/1000 };

Array.prototype.max = function() { return Math.max.apply(null, this) }

Array.prototype.min = function() { return Math.min.apply(null, this) }

if (!Array.prototype.indexOf) {
    Array.prototype.indexOf = function(obj, start) {
        for (var i = (start || 0), j = this.length; i < j; i++) {
            if (this[i] === obj) { return i; }
        }
        return -1;
    }
}

Array.prototype.contains = function(x) { return this.indexOf(x)>=0; }

/* Inbuilt assertion statement */

function AssertException(message) { this.message = message; }
AssertException.prototype.toString = function () {
  return 'AssertException: ' + this.message;
}

function assert(exp, message) {
  if (!exp) {
    throw new AssertException(message);
  }
}
