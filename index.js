const core = require('@actions/core');
const { issueCommand } = require('@actions/core/lib/command');
const mocha = require('mocha');
const milliseconds = require('ms');

// From https://github.com/findmypast-oss/mocha-json-streamier-reporter/blob/master/lib/parse-stack-trace.js
function extractModuleLineAndColumn(stackTrace) {
    const matches = /^\s*at Context.* \(([^\(\)]+):([0-9]+):([0-9]+)\)/gm.exec(stackTrace);

    if (matches === null) {
        return {};
    }

    return {
        file: matches[1],
        line: matches[2],
        col: matches[3],
    };
}

function GithubActionsReporter(runner, options) {
    mocha.reporters.Spec.call(this, runner, options);

    const failures = [];

    runner.on(mocha.Runner.constants.EVENT_TEST_FAIL, (test) => {
        failures.push(test);
    });
    runner.once(mocha.Runner.constants.EVENT_RUN_END, () => {
        if (failures.length > 0) {
            core.startGroup('Mocha Annotations');

            for (const test of failures) {
                issueCommand('error', extractModuleLineAndColumn(test.err.stack), test.err.message);
            }

            core.endGroup();
        }
        core.summary.addRaw(`:white_check_mark: ${this.stats.passes || 0} passing (${milliseconds(this.stats.duration)})`, true);
        if (this.stats.pending) {
            core.summary.addRaw(`:pause_button: ${this.stats.pending} pending`, true);
        }
        if (this.stats.failures) {
            core.summary.addRaw(`:x: ${this.stats.failures} failing`, true);
        }
        core.summary.write();
    });
}

/**
 * Inherit from `Spec.prototype`.
 */
mocha.utils.inherits(GithubActionsReporter, mocha.reporters.Spec);

module.exports = GithubActionsReporter;
