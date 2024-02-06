const core = require('@actions/core');
const { SUMMARY_ENV_VAR } = require('@actions/core/lib/summary');
const { issueCommand } = require('@actions/core/lib/command');
const mocha = require('mocha');
const milliseconds = require('ms');

// From https://github.com/findmypast-oss/mocha-json-streamier-reporter/blob/master/lib/parse-stack-trace.js
function extractModuleLineAndColumn(stackTrace, options) {
    const matches = /^\s*at Context.* \(([^\(\)]+):([0-9]+):([0-9]+)\)/gm.exec(stackTrace);

    if (matches === null) {
        return {};
    }
    let file = matches[1];
    if (options && options.reporterOptions && options.reporterOptions.convertPath) {
        if (!Array.isArray(options.reporterOptions.convertPath) || options.reporterOptions.convertPath.length != 2) {
            throw new Error('reporterOptions.convertPath should be an array of length 2');
        }
        file = file.replace(options.reporterOptions.convertPath[0], options.reporterOptions.convertPath[1]);
    }

    return {
        file: file,
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
                issueCommand('error', extractModuleLineAndColumn(test.err.stack, options), test.err.message);
            }

            core.endGroup();
        }
        // Check if Job Summary is supported on this platform
        if (process.env[SUMMARY_ENV_VAR]) {
            core.summary.addRaw(`:white_check_mark: ${this.stats.passes || 0} passing (${milliseconds(this.stats.duration)})`, true);
            if (this.stats.pending) {
                core.summary.addRaw(`:pause_button: ${this.stats.pending} pending`, true);
            }
            if (this.stats.failures) {
                core.summary.addRaw(`:x: ${this.stats.failures} failing`, true);
            }
            core.summary.write();
        }
    });
}

/**
 * Inherit from `Spec.prototype`.
 */
mocha.utils.inherits(GithubActionsReporter, mocha.reporters.Spec);

module.exports = GithubActionsReporter;
