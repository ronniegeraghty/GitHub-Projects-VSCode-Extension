const request = require("request-promise");
const endpoint = "https://api.github.com/";
const ua =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_8_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/29.0.1521.3 Safari/537.36";
const mediaType = "application/vnd.github.inertia-preview+json";

(async function main() {
  try {
    console.log("here");
    const res = await request({
      url: `${endpoint}repos/ronniegeraghty/GitHub-Projects-VSCode-Extension/projects`,
      method: "GET",
      headers: {
        "User-Agent": ua,
        "Accept": mediaType
      }
    });
    console.log(res);
  } catch (e) {
    console.log(e.message);
  }
})();
