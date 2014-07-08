/* jscs: {"maximumLineLength": 120, "validateQuoteMarks": "\"", "requireSpaceAfterKeywords": ["if"], "requireTrailingComma": { "ignoreSingleValue": true }} */

var greeting = "I'm a super-long comment and you should not expect me to pass without the top configuration";
// I am not a con-figuration comment
var x = 1;
if (x == 1) {
  console.log("foo");
// Note; no space after else
} else{
  console.log("bar");
}
