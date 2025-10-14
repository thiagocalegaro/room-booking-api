!(function (e, t) {
  "object" == typeof exports && "undefined" != typeof module
    ? (module.exports = t())
    : "function" == typeof define && define.amd
    ? define(t)
    : ((e = "undefined" != typeof globalThis ? globalThis : e || self).jwt_decode = t());
})(this, function () {
  "use strict";

  function e(e) {
    this.message = e;
  }
  e.prototype = new Error();
  e.prototype.name = "InvalidTokenError";

  function t(t, r) {
    if ("string" != typeof t) throw new e("Invalid token specified");
    var n = !0 === (r = r || {}).header ? 0 : 1;
    try {
      return JSON.parse(
        (function (t) {
          var r = t.replace(/-/g, "+").replace(/_/g, "/");
          switch (r.length % 4) {
            case 0:
              break;
            case 2:
              r += "==";
              break;
            case 3:
              r += "=";
              break;
            default:
              throw "Illegal base64url string!";
          }
          try {
            return (function (e) {
              return decodeURIComponent(
                atob(e)
                  .split("")
                  .map(function (e) {
                    return "%" + ("00" + e.charCodeAt(0).toString(16)).slice(-2);
                  })
                  .join(""),
              );
            })(r);
          } catch (e) {
            return atob(r);
          }
        })(t.split(".")[n]),
      );
    } catch (t) {
      throw new e("Invalid token specified: " + t.message);
    }
  }

  const r = "4.0.0";
  var n = Object.freeze({
    __proto__: null,
    InvalidTokenError: e,
    default: t,
    jwtDecode: t,
    version: r,
  });

  function o(e) {
    return e && "object" == typeof e && "default" in e
      ? e
      : { default: e };
  }

  var i = o(n);
  return (
    (t.InvalidTokenError = e), (t.jwtDecode = t), (t.version = r), i
  );
});