const C = require('../const').C;
const logger = require('./index').logger;

/*
** todo: manage infinite arguments of the same type foreach functions
*/

const FORGOT_TOKEN_LENGTH = process.env.FORGOT_TOKEN_LENGTH || 20;

// TO continue
function manageArguments() {
  let l = arguments.length;
  if (l === 1) { return null; }
  if (l === 1) { return arguments[0]; }
  else {
    let t = [];
    for (var i = 0; i < arguments.length; i++) {
      t.push(arguments[i]);
    }
    return t;
  }
}

function isString(s) {
  return ((typeof s === 'string' && s.trim()) ? true : false);
}

function isInt(n) {
  return 0 === n % (!isNaN(parseFloat(n)) && 0 <= ~~n);
}

function isFloat(f) {
  return Number(f) === f && f % 1 !== 0;
}

function isForgotTokenValid(token) {
  return token.length === FORGOT_TOKEN_LENGTH;
}

async function isNameValid(str) {
  if (isString(str)) {
    if (str.length <= C.NAME_MIN_LENGTH) return false;
    else if (str.length > C.NAME_MAX_LENGTH) return false;
    else if (str.match(C.NICKNAME_REGEX)[0] != str) return false;
    else { return true; }
  } else {
    return false;
  }
}

function isPasswordValid(p, pc){
  if (isString(p) && isString(pc)) {
    if(!p ||!pc) return false;
    else if(p.length < C.PWD_MIN_LENGTH) return false;
    else if (p.length > C.PWD_MAX_LENGTH) return false;
    else if(p != pc) return false;
    else return true;
  } else if (isString(p)) {
    if(p.length < C.PWD_MIN_LENGTH) return false;
    else if (p.length > C.PWD_MAX_LENGTH) return false;
    else return true;
  } else {
    return false;
  }
}

async function isEmailValid(e) {
  if (isString(e)) {
    let emailTester = C.EMAIL_REGEX;
    if (!e) return false;
    if(e.length>254) return false;
    let valid = emailTester.test(e);
    if(!valid) return false;
    // Further checking of some things regex can't handle
    let parts = e.split("@");
    if(parts[0].length > 64) return false;
    let domainParts = parts[1].split(".");
    if(domainParts.some(function(part) { return part.length>63; })){
      return false;
    }
    return true;
  } else {
    return false;
  }
}

// Exports
module.exports = {
  isString: isString,
  isInt: isInt,
  isFloat: isFloat,
  isForgotTokenValid: isForgotTokenValid,
  isNameValid: isNameValid,
  isPasswordValid: isPasswordValid,
  isEmailValid: isEmailValid
}
