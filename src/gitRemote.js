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
  console.log(`PATH: ${path}`);
  console.log("IN getRemote");
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
    let remote;
    console.log("Get Remote URLs:");
    getRemoteURL().then(url => {
      remote = url;
      console.log(`REMOTE: ${remote}`);
    });
  }
};

/**
 * Returns true if git has be initialized
 * @summary - If git has be initialized, meaning there is a .git directory in the working directory then it will return true, else it will return false.
 * @returns {Promise} Resolves to a boolean that denotes if git has been initialized. Rejects if an error occurs.
 */
const isGitInit = async () => {
  console.log("IN isGitInit");
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
  console.log("IN initGit");
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

/**
 * Gets the GitHub remote repo URL to be used for the GitHub Projects VSCode Extension
 * @returns {Promise} - Should resolve to a string that is the GitHub URL to be used.
 */
const getRemoteURL = async () => {
  console.log("IN getRemoteURL");
  return new Promise(async resolve => {
    getAllRemoteUrls().then(async urls => {
      //Get the URLs for all the configured remotes
      handleRemoteURL(urls).then(url => {
        resolve(url);
      }); //resolve to the URL that is a GitHub URL and the one the user wishes to use.
    });
  });
};

/**
 * Will return the URLs for all the remote git repos configured
 * @returns {Promise} - Should resolve to an array of strings that are the URLs for the remote git repos.
 */
const getAllRemoteUrls = async () => {
  console.log("IN getAllRemoteUrls");
  return new Promise((resolve, reject) => {
    let remoteURLs = []; //array to be returned
    fs.readFile(`${path}/.git/config`, (err, data) => {
      //read the .git/config file that has the URLs in it.
      if (err) {
        //If there was an error reading the file
        console.log(`FS readFile git config file Error: ${err}`);
        reject(err);
      }
      let dataStr = String(data); //Data is a buffer so cast it as a string to simplify working with strign functions in following lines.
      let indexes = getAllIndexesOfSubString(dataStr, "url"); //get the indexes of the lines that have urls
      indexes.forEach(index => {
        remoteURLs.push(
          dataStr.substring(index + 6, dataStr.indexOf("\n", index))
        ); //Get the substring that holds the url and push it to the array.
      });
      resolve(remoteURLs);
    });
  });
};

/**
 * Given a string and a substring, find the indexes of all occurrences of substring in the searched string.
 * @param {string} str - The string to search in for substrings
 * @param {string} substr - The substring to search for.
 * @returns {number[]} - An array of numbers that contains the indexes of each instance the substring shows in the searched string.
 */
const getAllIndexesOfSubString = (str, substr) => {
  console.log("IN getAllIndexesOfSubString");
  let indexes = []; //hold all found indexes
  let currentIndex = 0; // the current index to start searching at
  while (indexes[indexes.length - 1] != -1) {
    //while I am still finding the substrin
    indexes.push(str.indexOf(substr, currentIndex)); //add the index of the substring to the array
    currentIndex = indexes[indexes.length - 1] + 1; //update the index to start searching from
  }
  indexes.pop(); // remove the last element of array cause it will be -1 from not finding anymore instances of the substring
  return indexes;
};

const handleRemoteURL = async urls => {
  console.log("IN handleRemoteURL");
  return new Promise((resolve, reject) => {
    urls = removeNonGitHubURLs(urls);
    if (urls.length == 0) {
      //No GitHub remotes configured
      vscode.window
        .showInformationMessage(
          "No GitHub Remotes Configured!",
          "Add GitHub Remote"
        )
        .then(action => {
          if (action === "Add GitHub Remote") {
            resolve(addGitHubRemote());
          }
        });
    } else if (urls.length > 1) {
      //More than one GitHub remote configured
    } else {
      //Only one GitHub remote configured
      resolve(urls[0]);
    }
  });
};

/**
 * Given an array of urls, it will return an array of the GitHub Urls in the provided array.
 * @param {String[]} urls - An array of URL strings
 * @returns {String[]} - An array of URL strings containing only the GitHub Urls provided.
 */
const removeNonGitHubURLs = urls => {
  console.log("IN removeNonGitHubURLs");
  let result = []; //array to be returned
  urls.forEach(url => {
    if (isGitHubRepo(url)) {
      //if the url is a GitHub URL add it to the result array.
      result.push(url);
    }
  });
  return result;
};

/**
 * Checks if the provided remote URL is a github repo.
 * @param {String} url - A git remote URL
 * @returns {boolean} - True if url is a github repo, false if not.
 */
const isGitHubRepo = url => {
  console.log("IN isGitHubRepo");
  //might need to be changed to check against private github servers.
  return url.substring(0, 19) === "https://github.com/";
};

/**
 * Asks User for a GitHub URL and a name for the remote then creates the remote git repo.
 * @summary This function will use the vscode api to get user input on the GitHub Repo URL they would like to use and the name they want to give the remote. If the URL the user gives is not a GitHub URL the function will warn them of this and the give them the option to try again. If they take this option the function will recusively call itself to have them go through entering a GitHub URL again.
 * @returns {Promise} Should resolve to a string containing the URL of the added remote git repo.
 */
const addGitHubRemote = async () => {
  console.log("IN addGitHubRemote");
  return new Promise((resolve, reject) => {
    vscode.window
      .showInputBox({
        placeHolder: "GitHub URL",
        prompt: "Enter the URL of the GitHub Repo"
      })
      .then(inputURL => {
        console.log(`USER-INPUT: ${inputURL}`);
        if (!isGitHubRepo(inputURL)) {
          vscode.window
            .showErrorMessage(
              "That is not a GitHup URL!",
              "Try adding a GitHub Remote Again"
            )
            .then(action => {
              if (action === "Try adding a GitHub Remote Again") {
                resolve(addGitHubRemote());
              }
            });
        } else {
          vscode.window
            .showInputBox({
              placeHolder: "Remote Name",
              prompt: "Enter a name for the remote repo."
            })
            .then(inputName => {
              exec(
                `cd ${path} && git remote add ${inputName} ${inputURL}`,
                (error, stdout, stderr) => {
                  if (error) {
                    console.log(error);
                  }
                  if (stderr) {
                    console.log(stderr);
                  }
                }
              );
              resolve(inputURL);
            });
        }
      });
  });
};
