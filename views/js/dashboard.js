const shop = document.getElementById("shop").querySelector("section");
const uid = document.getElementById("uid").dataset.uid;

if (shop.dataset.shop === "registered") {
  const addProduct = document.createElement("a");
  addProduct.href = `/products/add?uid=${uid}`;
  addProduct.innerHTML = "<h3>Add Product</h3>";
  addProduct.target = "_blank";

  const generatePdf = document.createElement("a");
  generatePdf.href = `/invoice?uid=${uid}`;
  generatePdf.innerHTML = "<h3>Generate Pdf</h3>";
  generatePdf.target = "_blank";

  shop.appendChild(addProduct);
  shop.appendChild(generatePdf);
} else {
  const registerShop = document.createElement("a");
  registerShop.href = `/shop/register?uid=${uid}`;
  registerShop.innerHTML = "<h3>Register Shop</h3>";
  registerShop.target = "_blank";
  shop.appendChild(registerShop);
}
