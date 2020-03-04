const vscode = require("vscode");
const fs = require("fs");
const path = vscode.workspace.rootPath;
const { exec } = require("child_process");

/**
 * Returns the URL of a remote git repo
 * @summary - Returns the URL of the remote git repo the user wants to use in the GitHub Project VSCode Extension. It will ask them to init git and add a remote if they haven't already. It will also ask them to choose a remote if there are multiple github remotes listed.
 * @module
 */
exports.getRemote = async () => {
  if (!(await isGitInit())) {
    //Git not Initialized
    console.log("Git has NOT been initialized!");
    vscode.window
      .showInformationMessage("Git not initialized", "Initialize Git")
      .then(action => {
        if (action === "Initialize Git") {
          initGit().then(this.getRemote);
        }
      });
  } else {
    //Git has been initialized
    console.log("Git has be initialized!");
  }
};

/**
 * Returns true if git has be initialized
 * @summary - If git has be initialized, meaning there is a .git directory in the working directory then it will return true, else it will return false.
 * @returns {Promise} Resolves to a boolean that denotes if git has been initialized. Rejects if an error occurs.
 */
const isGitInit = async () => {
  return new Promise((resolve, reject) => {
    fs.readdir(path, async (err, files) => {
      if (err) {
        reject(err);
      } else {
        let found = false;
        files.forEach(file => {
          if (file === ".git") {
            found = true;
            resolve(found);
          }
        });
        resolve(found);
      }
    });
  });
};

/**
 * Initialize git in the working directory.
 * @returns {Promise} Resolves when the git repo has finished initialized with the value of the stdout. Rejects if there is an error.
 */
const initGit = async () => {
  return new Promise(async (resolve, reject) => {
    exec(`cd ${path} && git init`, (error, stdout, stderr) => {
      if (error) {
        reject(error);
      }
      if (stderr) {
        reject(stderr);
      }
      resolve(stdout);
    });
  });
};
