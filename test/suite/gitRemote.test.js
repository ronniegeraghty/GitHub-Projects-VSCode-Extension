const assert = require("assert");

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
const vscode = require("vscode");
const gitRemote = require("../../src/gitRemote");

suite("gitRemote Test Suite", () => {
  vscode.window.showInformationMessage("Starting gitRemote Tests.");

  test("gitRemote Tests", async () => {
    assert.equal(
      await gitRemote.getRemote(
        __dirname + "/../projects/Git-OneGitHubRemote/"
      ),
      "https://github.com/dingus/GitHub1"
    );
  });
});
