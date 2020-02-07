const vscode = require("vscode");
const fs = require("fs");

const projectJSON = JSON.parse(
  fs.readFileSync(__dirname + "/projectTest.json", "utf8")
);

class ProjectProvider {
  constructor(workspaceRoot) {
    this.workspaceRoot = workspaceRoot;
    this._onDidChangeTreeData = new vscode.EventEmitter();
    this.onDidChangeTreeData = this._onDidChangeTreeData.event;
  }
  refresh() {
    this._onDidChangeTreeData.fire();
    console.log("Refresh Command Called");
  }
  getTreeItem(element) {
    console.log(`In GETTREEITEM`);
    return element;
  }
  getChildren(element) {
    console.log("GetChildren Called!");
    console.log(`ELEMENT: ${element}`);
    console.log(`Element Type: ${element instanceof Project}`);

    if (!element) {
      // Base of tree, return list of projects
      return Promise.resolve(this.getProjectsJSON());
    }

    // if (!this.workspaceRoot) {
    //     vscode.window.showInformationMessage('No dependency in empty workspace');
    //     return Promise.resolve([]);
    // }
    // if (element) {
    //     return Promise.resolve(this.getDepsInPackageJson(path.join(this.workspaceRoot, 'node_modules', element.label, 'package.json')));
    // }
    // else {
    //     const packageJsonPath = path.join(this.workspaceRoot, 'package.json');
    //     if (this.pathExists(packageJsonPath)) {
    //         return Promise.resolve(this.getDepsInPackageJson(packageJsonPath));
    //     }
    //     else {
    //         vscode.window.showInformationMessage('Workspace has no package.json');
    //         return Promise.resolve([]);
    //     }
    // }
  }
  /**
   * Given the path to package.json, read all its dependencies and devDependencies.
   */
  getProjectsJSON() {
    let projectsArr = [];
    projectJSON.projects.forEach(project => {
      projectsArr.push(
        new Project(
          project.name,
          project.description,
          vscode.TreeItemCollapsibleState.Collapsed
        )
      );
    });
    return projectsArr;
  }
}
exports.ProjectProvider = ProjectProvider;
class Project extends vscode.TreeItem {
  constructor(label, version, collapsibleState, command) {
    super(label, collapsibleState);
    this.label = label;
    this.version = version;
    this.collapsibleState = collapsibleState;
    this.command = command;
    // this.iconPath = {
    //     light: path.join(__filename, '..', '..', 'resources', 'light', 'dependency.svg'),
    //     dark: path.join(__filename, '..', '..', 'resources', 'dark', 'dependency.svg')
    // };
    this.contextValue = "project";
  }
  get tooltip() {
    return `${this.label}-${this.version}`;
  }
  get description() {
    return this.version;
  }
}
exports.Project = Project;
