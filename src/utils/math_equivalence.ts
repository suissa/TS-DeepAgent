function fixFracs(str: string): string {
  const substrs = str.split('\\frac');
  let newStr = substrs[0];
  if (substrs.length > 1) {
    const remainingSubstrs = substrs.slice(1);
    for (const substr of remainingSubstrs) {
      newStr += '\\frac';
      if (substr[0] === '{') {
        newStr += substr;
      } else {
        if (substr.length < 2) {
          return str;
        }
        const a = substr[0];
        const b = substr[1];
        if (b !== '{') {
          if (substr.length > 2) {
            const postSubstr = substr.slice(2);
            newStr += '{' + a + '}{' + b + '}' + postSubstr;
          } else {
            newStr += '{' + a + '}{' + b + '}';
          }
        } else {
          if (substr.length > 2) {
            const postSubstr = substr.slice(2);
            newStr += '{' + a + '}' + b + postSubstr;
          } else {
            newStr += '{' + a + '}' + b;
          }
        }
      }
    }
  }
  return newStr;
}

function fixASlashB(str: string): string {
  if (str.split('/').length !== 2) {
    return str;
  }
  const a = str.split('/')[0];
  const b = str.split('/')[1];
  try {
    const aNum = parseInt(a, 10);
    const bNum = parseInt(b, 10);
    if (str === `${a}/${b}`) {
      return '\\frac{' + a + '}{' + b + '}';
    }
    return str;
  } catch {
    return str;
  }
}

function removeRightUnits(str: string): string {
  if (str.indexOf('\\text{ ') !== -1) {
    const splits = str.split('\\text{ ');
    if (splits.length === 2) {
      return splits[0];
    }
  }
  return str;
}

function fixSqrt(str: string): string {
  if (str.indexOf('\\sqrt') === -1) {
    return str;
  }
  const splits = str.split('\\sqrt');
  let newString = splits[0];
  for (let i = 1; i < splits.length; i++) {
    const split = splits[i];
    let newSubstr: string;
    if (split[0] !== '{') {
      const a = split[0];
      newSubstr = '\\sqrt{' + a + '}' + split.slice(1);
    } else {
      newSubstr = '\\sqrt' + split;
    }
    newString += newSubstr;
  }
  return newString;
}

export function stripString(str: string): string {
  let string = str;
  string = string.replace(/\n/g, '');
  string = string.replace(/\\!/g, '');
  string = string.replace(/\\\\/g, '\\');
  string = string.replace(/tfrac/g, 'frac');
  string = string.replace(/dfrac/g, 'frac');
  string = string.replace(/\\left/g, '');
  string = string.replace(/\\right/g, '');
  string = string.replace(/^{\\circ}/g, '');
  string = string.replace(/^\\circ/g, '');
  string = string.replace(/\\$/g, '');
  string = removeRightUnits(string);
  string = string.replace(/\\%/g, '');
  string = string.replace(/\%/g, '');
  string = string.replace(/ \./g, ' 0.');
  string = string.replace(/\{\./g, '{0.');
  if (string.length === 0) {
    return string;
  }
  if (string[0] === '.') {
    string = '0' + string;
  }
  if (string.split('=').length === 2) {
    if (string.split('=')[0].length <= 2) {
      string = string.split('=')[1];
    }
  }
  string = fixSqrt(string);
  string = string.replace(/ /g, '');
  string = fixFracs(string);
  if (string === '0.5') {
    string = '\\frac{1}{2}';
  }
  string = fixASlashB(string);
  return string;
}

export function isEquiv(str1: string | null, str2: string | null, verbose: boolean = false): boolean {
  if (str1 === null && str2 === null) {
    console.warn('WARNING: Both None');
    return true;
  }
  if (str1 === null || str2 === null) {
    return false;
  }
  try {
    const ss1 = stripString(str1);
    const ss2 = stripString(str2);
    if (verbose) {
      console.log(ss1, ss2);
    }
    return ss1 === ss2;
  } catch {
    return str1 === str2;
  }
}
