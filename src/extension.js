const vscode = require("vscode");
const Project = require("./project");

function activate(context) {
  const projectProvider = new Project.ProjectProvider(
    vscode.workspace.rootPath
  );
  vscode.window.registerTreeDataProvider("gh-projects-view", projectProvider);
  vscode.commands.registerCommand("gh-projects.refreshList", () => {
    projectProvider.refresh();
  });
  vscode.commands.registerCommand("extension.test", () => {
    console.log("Ran Test Command.");
  });
  // vscode.commands.registerCommand('extension.openPackageOnNpm', moduleName => vscode.commands.executeCommand('vscode.open', vscode.Uri.parse(`https://www.npmjs.com/package/${moduleName}`)));
  // vscode.commands.registerCommand('nodeDependencies.addEntry', () => vscode.window.showInformationMessage(`Successfully called add entry.`));
  // vscode.commands.registerCommand('nodeDependencies.editEntry', (node) => vscode.window.showInformationMessage(`Successfully called edit entry on ${node.label}.`));
  // vscode.commands.registerCommand('nodeDependencies.deleteEntry', (node) => vscode.window.showInformationMessage(`Successfully called delete entry on ${node.label}.`));
}
exports.activate = activate;
//# sourceMappingURL=extension.js.map
