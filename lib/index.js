const { issueCommand, issue } = require("@actions/core");
const mocha = require("mocha");
const { extractModuleLineAndColumn } = require("./parse-stack-trace");

const { Base } = mocha.reporters;
const { EVENT_TEST_FAIL, EVENT_RUN_END } = mocha.Runner.constants;

function GithubActionsReporter(runner) {
  Base.call(this, runner);

  const failures = [];

  runner.on(EVENT_TEST_FAIL, function(test) {
    failures.push(test);
  });

  runner.once(EVENT_RUN_END, function() {
    issue("group", "Mocha Annotations");

    if (failures.length > 0) {
      for (const test of failures) {
        const errMessage = test.err.message;
        const moduleLineColumn = extractModuleLineAndColumn(err.stack);

        issueCommand(
          "error",
          {
            file: moduleLineColumn.file,
            line: moduleLineColumn.line,
            col: moduleLineColumn.column
          },
          errMessage
        );
      }
    }

    issue("endgroup");
  });
}

module.exports = GithubActionsReporter;
