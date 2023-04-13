const assert = require("assert");

describe("when having a failing test", function() {
  it("can succeed", () => {
    assert(1 === 1, "Something is seriously wrong");
  });
  it.skip("can skip", () => {
    throw new Error("Didn't expect this to run");
  });
  it("generates a report", function() {
    assert(2 === 1, "Expected 2 to equal 1, :shrug:");
  });
});
