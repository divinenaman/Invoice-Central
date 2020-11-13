const uid = window.location.href.split("?")[1].split("=")[1];
console.log(uid);

document.querySelectorAll("div[name=dropdown] span").forEach((x) => {
  x.addEventListener("click", (e) => {
    const prev = document.querySelector(".active-option");
    if (prev) prev.classList.remove("active-option");
    e.target.classList.add("active-option");
  });
});

document.querySelector("#search").addEventListener("click", (e) => {
  const search = document.getElementById("query").value;
  const field = document.querySelector(".active-option").dataset.field;
  if (search) {
    const url = `${window.location.origin}/products/search/${uid}?${field}=${search}`;
    console.log(url);
    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        handleSearchData(data);
        console.log(data);
      });
  }
});

function handleSearchData(data) {
  const wrapper = document.querySelector(".search-list");
  wrapper.innerHTML = "";
  data.forEach((obj) => {
    const ele = document.createElement("div");
    const checkStock = obj.quantity ? true : false;
    ele.name = obj.name;
    ele.dataset.pid = obj.productId;
    ele.innerHTML = `<span>Name: ${obj.name}</span><br><span>Description: ${
      obj.desc
    }</span><br><span>Type: ${obj.type}</span><br><span>Product ID: ${
      obj.productId
    }</span><br><span>MRP: ${
      obj.mrp
    }</span><br><span name='quantity' data-value='${obj.quantity}'>Quantity: ${
      obj.quantity
    }</span><br><button ${
      checkStock ? "" : "disabled"
    } name="add" type="button" class="btn btn-primary" onclick="addToCart(event)">Add</button><hr>`;
    wrapper.appendChild(ele);
  });
}

function handleClient(e) {
  if (e.target.value == "local") {
    const client = document.querySelector("div[name=client]");
    client.dataset.type = "local";
    client.innerHTML = `<input type="text" name="name" placeholder="Client Name"/>`;
    client.innerHTML += `<input type="text" name="mobile" placeholder="Client Mobile"/>`;
  } else {
    const client = document.querySelector("div[name=client]");
    client.dataset.type = "invoiceCentral";
    client.innerHTML = `<input type="text" name="username" placeholder="Client Username"/>`;
  }
}

function addToCart(e) {
  var pid = e.target.parentNode.dataset.pid;
  const cart = document.querySelector(".cart");
  const pcard = e.target.parentNode.cloneNode(true);
  pcard.classList.add("cart-item");
  pcard.classList.add("col-md-4");
  pcard.removeChild(pcard.lastChild);
  pcard.removeChild(pcard.querySelector("button[name=add]"));
  pcard.innerHTML += `<button class="btn btn-dark" name="remove" onclick="removeItem(event)">remove</button>`;
  pcard.innerHTML += `<button class="btn btn-secondary" name="plus" onclick="handleQuantity(event)">+</button>`;
  pcard.innerHTML += `<input type="text" name="currQuantity" value="1"/>`;
  pcard.innerHTML += `<button class="btn btn-secondary" name="minus" onclick="handleQuantity(event)">-</button><hr>`;
  cart.appendChild(pcard);
}

function removeItem(e) {
  e.target.parentNode.parentNode.removeChild(e.target.parentNode);
}

function handleQuantity(e) {
  const currQuantity = e.target.parentNode.querySelector(
    "input[name=currQuantity]"
  );
  const totalQuatity = e.target.parentNode.querySelector("span[name=quantity]")
    .dataset.value;
  var error = "";
  if (e.target.name == "plus") {
    if (parseInt(totalQuatity) > parseInt(currQuantity.value))
      currQuantity.value = parseInt(currQuantity.value) + 1;
    else error = "Maximum Item Added";
  } else {
    if (parseInt(currQuantity.value) > 1)
      currQuantity.value = parseInt(currQuantity.value) - 1;
    else error = "Minimum quantity reached";
  }
  if (error) {
    const flashError = document.createElement("p");
    flashError.innerHTML = error;
    e.target.parentNode.appendChild(flashError);
    setTimeout(() => {
      e.target.parentNode.removeChild(flashError);
    }, 3000);
  }
}
document.querySelector("button[name=submit]").addEventListener("click", (e) => {
  var items = document.querySelectorAll(".cart-item");
  if (items.length) {
    let data = {};
    data.shop = uid;
    data.items = Array.from(document.querySelectorAll(".cart-item"), (x) => {
      return x.dataset.pid;
    });

    data.quantity = {};

    document.querySelectorAll(".cart-item").forEach((x) => {
      data.quantity[x.dataset.pid] = x.querySelector(
        "input[name=currQuantity]"
      ).value;
    });

    data.client = [{}];
    data.client[0].type = document.querySelector(
      "div[name=client]"
    ).dataset.type;
    document.querySelectorAll("div[name=client] input").forEach((input) => {
      data.client[0][input.name] = input.value;
    });
    data.date_added = new Date().toLocaleDateString();
    console.log(data);
    fetch(`${window.location.origin}/invoice`, {
      headers: { "Content-Type": "application/json" },
      method: "POST",
      body: JSON.stringify(data),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
        window.open(
          `${window.location.origin}/invoice/${data.invoiceId}`,
          "_blank"
        );
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
  }
});
