export default function populateMembers(membersJson) {
  loadBestMembers(membersJson);
  loadMembers(membersJson);
}

//NOTE: Best members are currently identified from the existance of an ImageUrl in JSON
async function loadBestMembers(membersJson) {
  const bestMembers = membersJson.filter((mObj) => mObj["ImageUrl"]);
  const htmlArr = await Promise.all(
    bestMembers.map((obj) => getBestMemberHtml(obj))
  );
  document.querySelector(".users .boxes").innerHTML = htmlArr.join("");
}

function loadMembers(membersJson) {
  const members = membersJson.filter((mObj) => mObj["ImageUrl"] == undefined);
  let innerStr = "";

  members.forEach((obj) => {
    innerStr += getMemberHtml(obj);
  });

  document.querySelector(".members .cards").innerHTML = innerStr;
}

function getMemberHtml(obj) {
  const nameArr = obj.Name.split(" ");

  const memberTemplate = `<div class="card">
                        <img src="images/face.png">
                        <p>${nameArr[0]} ${nameArr[1]}</p>
                    </div>`;
  return memberTemplate;
}

//Please Use the following naming convention for image assests firstname-lastname (as in the spreadsheet / json)
async function getBestMemberHtml(obj) {
  const nameArr = obj.Name.split(" ");
  let imgPath = await imageExists(`./images/${nameArr[0]}-${nameArr[1]}`);
  if (!imgPath) imgPath = "./images/face.png";

  const memberTemplate = ` <div class="box">
            <i class="fa-solid fa-medal medal"></i>
            <div class="img">
              <img class="" src="${imgPath}">
            </div>
            <div class="dis">
              <h2 class="">${nameArr[0]} ${nameArr[1]}</h2>
              <p>Lorem ipsum, dolor sit amet consectetur adipisicing elit. Rerum necessitatibus iusto amet.</p>
            </div>
            <div class="links">
              <a target="_blank" href="${
                obj.GitHub ?? ""
              }">  <i class="fa-brands fa-github"></i></a>
              <a target="_blank" href="${
                obj.LinkedIn ?? ""
              }"><i class="fa-brands fa-linkedin"></i></a>
              <a target="_blank" href="${
                "mailto:" + obj.Gmail ?? ""
              }"">  <i class="fa-solid fa-envelope"></i></a>
            </div>
          </div>`;
  return memberTemplate;
}

async function imageExists(pathWithoutExt) {
  const extentions = [".png", ".jpg", ".jpeg", ".webp"];
  for (const ext of extentions) {
    const path = pathWithoutExt + ext;
    if (await _$imgExists(path)) {
      console.log(path);
      return path;
    }
  }
  return undefined;
}

function _$imgExists(path) {
  if (!path) {
    return false;
  }

  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(true); // Image loaded successfully, so it exists
    img.onerror = () => resolve(false); // Image failed to load, so it doesn't exist or is inaccessible
    img.src = path;
  });
}
