// From https://github.com/findmypast-oss/mocha-json-streamier-reporter/blob/master/lib/parse-stack-trace.js

function extractModuleLineAndColumn(stackTrace) {
    let matches = /^\s*at Context.* \(([^\(\)]+):([0-9]+):([0-9]+)\)/gm.exec(stackTrace);

    if (matches === null) {
        return {};
    }

    return {
        file: matches[1],
        line: parseIntOrUndefined(matches[2]),
        column: parseIntOrUndefined(matches[3])
    };
}

function parseIntOrUndefined(numberString) {
    const lineNumber = parseInt(numberString);

    if (isNaN(lineNumber)) {
        return undefined;
    }

    return lineNumber;
}

module.exports = { extractModuleLineAndColumn };
