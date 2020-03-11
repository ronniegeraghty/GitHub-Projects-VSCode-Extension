const vscode = require("vscode");
const fs = require("fs");
const { execSync } = require("child_process");
let path = vscode.workspace.rootPath;

exports.getRemote = (testPath = path) => {
  path = testPath; // let path be overwritten for testing.
  console.log(`PATH: ${path}`);
  console.log("IN getRemote()");
  return new Promise(async (resolve, reject) => {
    //Check if git is installed
    if (!isGitInstalled()) {
      //Git is not installed
      console.log("Git is not installed");
      vscode.window.showErrorMessage(
        "Git is not installed. Please install Git to use the GitHub Projects Extension!"
      );
      reject("NOGIT");
    } else {
      //Git is installed
      console.log("Git is installed");
      //Check if git is initialized
      if (!isGitInit()) {
        //Git has not been initialized
        console.log("Git is not Initialized");
        initGit();
        resolve(await this.getRemote());
      } else {
        //Git has been initialized
        console.log("Git has been Initialized");
        const urls = getAllRemoteURLs();
        resolve(handleURLs(urls)); //get the URL the user wants to use
      }
    }
    reject("ERROR: Get Git Remote URL Failed");
  });
};

/**
 * Has Git been installed locally on the user's machine
 * @returns {boolean} - True if git has been installed, else false.
 */
function isGitInstalled() {
  console.log("IN isGitInstalled()");
  const stdout = String(execSync("git --version"));
  return stdout.substring(0, 11) === "git version";
}

/**
 * Has Git been initialized in the workspace root path.
 * @returns{boolean} - True if git has been init, else false.
 */
function isGitInit() {
  console.log("IN isGitInit()");
  let found = false;
  const files = fs.readdirSync(path);
  files.forEach(file => {
    if (file === ".git") {
      found = true;
      return found;
    }
  });
  return found;
}

/**
 * Initialized Git in the workspace directory of the VSCode session.
 */
function initGit() {
  console.log("IN initGit()");
  execSync(`cd ${path} && git init`);
}

/**
 * Returns all the URLs for the configured remotes for the git repo.
 * @returns {string[]} - an array of URL strings
 */
function getAllRemoteURLs() {
  console.log("IN getAllRemoteURLs()");
  let urls = []; //array of remote urls
  let gitConfig = String(fs.readFileSync(`${path}/.git/config`));
  let indexes = getAllIndexesOfSubString(gitConfig, "url");
  indexes.forEach(index => {
    urls.push(gitConfig.substring(index + 6, gitConfig.indexOf("\n", index))); //Get the substring that holds the url and push it to the array.
  });
  return urls;
}

/**
 * Given a string and a substring, find the indexes of all occurrences of substring in the searched string.
 * @param {string} str - The string to search in for substrings
 * @param {string} substr - The substring to search for.
 * @returns {number[]} - An array of numbers that contains the indexes of each instance the substring shows in the searched string.
 */
function getAllIndexesOfSubString(str, substr) {
  console.log("In getAllIndexesOfSubString()");
  let indexes = []; // hold all found indexes
  let currentIndex = 0;
  while (indexes[indexes.length - 1] != -1) {
    //While I am still finding the substring
    indexes.push(str.indexOf(substr, currentIndex)); //add the index of the substring to the array
    currentIndex = indexes[indexes.length - 1] + 1; //update the index to start searching from
  }
  indexes.pop(); //Remove the last element of array cause it will be -1 from not finding anymore instances of the substring
  return indexes;
}

function handleURLs(urls) {
  console.log("IN handleURLs()");
  urls = removeNonGitHubURLs(urls);
  if (urls.length === 0) {
    //No URLS
    vscode.window
      .showInformationMessage("No GitHub URLs Configured!", "Add GitHub Remote")
      .then(action => {
        if (action === "Add GitHub Remote") {
          return addRemote();
        }
      });
  } else if (urls.length > 1) {
    //More than one GitHub URL
  } else {
    //Only one GitHub URL
    return urls[0];
  }
}

/**
 * Takes an array of URL strings and returns an array only containing the GitHub URLs
 * @param {string[]} urls - Array of URL strings
 * @returns {string[]} - Array of only GitHub URL strings
 */
function removeNonGitHubURLs(urls) {
  console.log("IN removeNonGitHubURLs()");
  let ghURLs = []; //array to hold and return only github urls
  urls.forEach(url => {
    if (url.substring(0, 19) === "https://github.com/") {
      ghURLs.push(url);
    }
  });
  return ghURLs;
}

function addRemote() {}
