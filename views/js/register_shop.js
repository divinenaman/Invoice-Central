const uid = window.location.href.split("?")[1].split("=")[1];
document.querySelector("form").addEventListener("submit", (e) => {
  e.preventDefault();
  const formData = new FormData(e.target);
  let data = {};
  for ([key, value] of formData.entries()) {
    data[key] = value;
  }
  data.username = uid;
  console.log(data);
  fetch(`${window.location.origin}/shop/register`, {
    headers: { "Content-Type": "application/json" },
    method: "POST",
    body: JSON.stringify(data),
  })
    .then((res) => res.json())
    .then((data) => {
      console.log(data);
      const success = document.createElement("p");
      success.innerHTML = "Successfully Added";
      document.querySelector("body").appendChild(success);
      setTimeout(() => {
        document.querySelector("body").removeChild(success);
      }, 3000);
    })
    .catch((err) => {
      const fail = document.createElement("p");
      fail.innerHTML = "Something went wrong";
      document.querySelector("body").appendChild(fail);
      setTimeout(() => {
        document.querySelector("body").removeChild(fail);
      }, 3000);
    });
});
