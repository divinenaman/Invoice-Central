const uid = window.location.href.split("?")[1].split("=")[1];
document.querySelector("form").addEventListener("submit", (e) => {
  e.preventDefault();
  const formData = new FormData(e.target);
  let data = {};
  for ([key, value] of formData.entries()) {
    data[key] = value;
  }
  data["username"] = uid;
  data = JSON.stringify(data);
  fetch(`${window.location.origin}/products/add`, {
    headers: { "Content-Type": "application/json" },
    method: "POST",
    body: data,
  })
    .then((res) => {
      const success = document.createElement("p");
      success.innerHTML = "Successfully Added";
      document.querySelector("body").appendChild(success);
      setTimeout(() => {
        document.querySelector("body").removeChild(success);
      }, 3000);
    })
    .catch((err) => {
      const fail = document.createElement("h4");
      fail.innerHTML = "Something went wrong";
      document.querySelector("body").appendChild(fail);
      setTimeout(() => {
        document.querySelector("body").removeChild(fail);
      }, 3000);
    });
});
