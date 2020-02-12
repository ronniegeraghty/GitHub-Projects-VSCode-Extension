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
    console.log(`ELEMENT: ${JSON.stringify(element)}`);
    console.log(`Element Type: ${element instanceof Project}`);

    if (!element) {
      // Base of tree, return list of projects
      return Promise.resolve(this.getProjectsJSON());
    } else if (element instanceof Project) {
      //Parent Element is Project so get columns of project
      return Promise.resolve(this.getColumnsJSON(element));
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
          vscode.TreeItemCollapsibleState.Collapsed,
          project.columns
        )
      );
    });
    return projectsArr;
  }
  getColumnsJSON(project) {
    let columnsArr = [];
    // projectJSON.projects.forEach(project => {
    //   columnsArr.push(
    //     new Column(
    //       project.name,
    //       project.description,
    //       vscode.TreeItemCollapsibleState.Collapsed
    //     )
    //   );
    // });
    project.columns.forEach(column => {
      columnsArr.push(
        new Column(
          column.title,
          "",
          vscode.TreeItemCollapsibleState.Collapsed,
          column.cards
        )
      );
    });
    return columnsArr;
  }
}
exports.ProjectProvider = ProjectProvider;
class Project extends vscode.TreeItem {
  constructor(label, version, collapsibleState, columns, command) {
    super(label, collapsibleState);
    this.contextValue = "project";
    this.label = label;
    this.version = version;
    this.collapsibleState = collapsibleState;
    this.command = command;
    this.columns = columns;
    // this.iconPath = {
    //     light: path.join(__filename, '..', '..', 'resources', 'light', 'dependency.svg'),
    //     dark: path.join(__filename, '..', '..', 'resources', 'dark', 'dependency.svg')
    // };
  }
  get tooltip() {
    return `${this.label}-${this.version}`;
  }
  get description() {
    return this.version;
  }
}
exports.Project = Project;

class Column extends vscode.TreeItem {
  constructor(label, version, collapsibleState, cards, command) {
    super(label, collapsibleState);
    this.label = label;
    this.version = version;
    this.collapsibleState = collapsibleState;
    this.cards = cards;
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
exports.Column = Column;
