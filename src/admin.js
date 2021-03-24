let adminPanelBody = document.getElementById("adminPanelBody");
let refreshButton = document.getElementById("refreshButton");
let socket = io({ reconnection: true });

socket.emit("gimme all the data");
setInterval(() => {
  socket.emit("gimme all the data");
}, 1000);

refreshButton.onclick = function () {
  socket.emit("gimme all the data");
};

socket.on("Here is the data", function (data) {
  console.log("data is here");
  adminPanelBody.innerHTML = "";
  for (let i = 0; i < data.length; i++) {
    let arr = data[i];
    if (arr.IP !== null) {
      addToLeaderboard(
        arr.Username,
        arr.Email,
        arr.IP,
        `${arr.Geolocation?.city}, ${arr.Geolocation?.region}, ${arr.Geolocation?.country}, ${arr.Geolocation?.continent}`,
        arr.Health,
        arr.Wins,
        arr.Losses
      );
    }
  }
});

let addToLeaderboard = function (username, email, ip, geolocation, health, wins, losses) {
  let row = document.createElement("tr");
  let usernameData = document.createElement("td");
  let usernameText = document.createTextNode(username);
  let emailData = document.createElement("td");
  let emailText = document.createTextNode(email);
  let ipData = document.createElement("td");
  let ipText = document.createTextNode(ip);
  let geolocationData = document.createElement("td");
  let geolocationText = document.createTextNode(geolocation);
  let healthData = document.createElement("td");
  let healthText = document.createTextNode(health);
  let winsData = document.createElement("td");
  let winsText = document.createTextNode(wins);
  let lossesData = document.createElement("td");
  let lossesText = document.createTextNode(losses);
  usernameData.appendChild(usernameText);
  emailData.appendChild(emailText);
  ipData.appendChild(ipText);
  geolocationData.appendChild(geolocationText);
  healthData.appendChild(healthText);
  winsData.appendChild(winsText);
  lossesData.appendChild(lossesText);
  row.appendChild(usernameData);
  row.appendChild(emailData);
  row.appendChild(ipData);
  row.appendChild(geolocationData);
  row.appendChild(healthData);
  row.appendChild(winsData);
  row.appendChild(lossesData);
  adminPanelBody.appendChild(row);
};
