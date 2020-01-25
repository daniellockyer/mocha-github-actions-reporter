const assert = require("assert");

describe("when having a failing test", function() {
  it("generates a report", function() {
    assert(2 === 1, "Expected 2 to equal 1, :shrug:");
  });
});
