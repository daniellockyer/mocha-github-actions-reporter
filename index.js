const core = require('@actions/core');
const { issueCommand } = require('@actions/core/lib/command');
const mocha = require('mocha');

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

function GithubActionsReporter(runner, options) {
    mocha.reporters.Spec.call(this, runner, options);

    const failures = [];

    runner.on(mocha.Runner.constants.EVENT_TEST_FAIL, function(test) {
        failures.push(test);
    });

    runner.once(mocha.Runner.constants.EVENT_RUN_END, function() {
        if (failures.length > 0) {
            core.startGroup('Mocha Annotations');

            for (const test of failures) {
                const errMessage = test.err.message;
                const moduleLineColumn = extractModuleLineAndColumn(test.err.stack);

                issueCommand('error', {
                    file: moduleLineColumn.file,
                    line: moduleLineColumn.line + '',
                    col: moduleLineColumn.column + ''
                }, errMessage);
            }

            core.endGroup();
        }
    });
}

/**
 * Inherit from `Spec.prototype`.
 */
mocha.utils.inherits(GithubActionsReporter, mocha.reporters.Spec);

module.exports = GithubActionsReporter;
