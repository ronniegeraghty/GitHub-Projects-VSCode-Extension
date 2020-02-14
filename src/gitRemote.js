const vscode = require("vscode");
const git = require("simple-git")(vscode.workspace.rootPath);

exports.getRemote = () => {
  git.listRemote(["--get-url"], (err, data) => {
    if (err) {
      vscode.window.showErrorMessage(err);
      throw new Error(err);
    } else {
      console.log(`Remote URL: ${data}`);
      return data;
    }
  });
};
