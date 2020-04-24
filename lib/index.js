const core = require('@actions/core');
const { issueCommand } = require('@actions/core/lib/command');
const mocha = require('mocha');
const { extractModuleLineAndColumn } = require('./parse-stack-trace');

const { Spec } = mocha.reporters;
const { EVENT_TEST_FAIL, EVENT_RUN_END } = mocha.Runner.constants;

function GithubActionsReporter(runner, options) {
    Spec.call(this, runner, options);

    const failures = [];

    runner.on(EVENT_TEST_FAIL, function(test) {
        failures.push(test);
    });

    runner.once(EVENT_RUN_END, function() {
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
mocha.utils.inherits(GithubActionsReporter, Spec);

module.exports = GithubActionsReporter;
