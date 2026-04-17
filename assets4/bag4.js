const productContainer = document.querySelector(".product-list");
const isProductDetailPage = document.querySelector(".product-detail");
const isCartPage = document.querySelector(".cart");

updateCartCount();

if (productContainer) {
    displayProducts();
} 
else if (isProductDetailPage) {
    displayProductDetail();
} 
else if (isCartPage) {
    displayCart();
}

/* ---------------- PRODUCTS ---------------- */

function displayProducts() {

    products.forEach(product => {

        const productCard = document.createElement("div");
        productCard.classList.add("product-card");

        productCard.innerHTML = `
        <div class="img-box">
            <img src="${product.colors[0].mainImage}">
        </div>

        <h2 class="title">${product.title}</h2>

        <span class="price">₹${product.price}</span>
        `;

        productContainer.appendChild(productCard);

        const imgBox = productCard.querySelector(".img-box");

        imgBox.addEventListener("click", () => {

            sessionStorage.setItem("selectedProduct", JSON.stringify(product));

            window.location.href = "product-detail4.html";

        });

    });

}

/* ---------------- PRODUCT DETAIL ---------------- */

function displayProductDetail(){

    const productData = JSON.parse(sessionStorage.getItem("selectedProduct"));

    const titleEl = document.querySelector(".title");
    const priceEl = document.querySelector(".price");
    const description = document.querySelector(".description");

    const mainImageContainer = document.querySelector(".main-img");
    const thumbnailContainer = document.querySelector(".thumbnail-list");
    const colorContainer = document.querySelector(".color-options");

    const addToCartBtn = document.querySelector("#add-cart-btn");

    let selectedColor = productData.colors[0];

    function updateProductDisplay(colorData){

        mainImageContainer.innerHTML = `<img src="${colorData.mainImage}">`;

        thumbnailContainer.innerHTML = "";

        const allThumbnails = [colorData.mainImage].concat(colorData.thumbnails.slice(0,3));

        allThumbnails.forEach(thumb =>{

            const img = document.createElement("img");
            img.src = thumb;

            thumbnailContainer.appendChild(img);

            img.addEventListener("click", ()=>{
                mainImageContainer.innerHTML = `<img src="${thumb}">`;
            });

        });

        colorContainer.innerHTML = "";

        productData.colors.forEach(color =>{

            const img = document.createElement("img");
            img.src = color.mainImage;

            if(color.name == colorData.name){
                img.classList.add("selected");
            }

            colorContainer.appendChild(img);

            img.addEventListener("click", ()=>{

                selectedColor = color;
                updateProductDisplay(color);

            });

        });

    }

    titleEl.textContent = productData.title;
    priceEl.textContent = "₹" + productData.price;
    description.textContent = productData.description;

    updateProductDisplay(selectedColor);

    addToCartBtn.addEventListener("click", ()=>{

        addToCart(productData, selectedColor);

    });

}

/* ---------------- ADD TO CART ---------------- */

function addToCart(product,color){

    let cart = JSON.parse(sessionStorage.getItem("cart")) || [];

    const existingItem = cart.find(item => item.id == product.id && item.color == color.name);

    if(existingItem){

        existingItem.quantity += 1;

    }
    else{

        cart.push({

            id: product.id,
            title: product.title,
            price: Number(product.price),
            image: color.mainImage,
            color: color.name,
            quantity: 1

        });

    }

    sessionStorage.setItem("cart", JSON.stringify(cart));
    updateCartCount();

    window.location.href = "./cart4.html";

}

/* ---------------- CART PAGE ---------------- */

function displayCart(){

    const cart = JSON.parse(sessionStorage.getItem("cart")) || [];

    const cartItemsContainer = document.querySelector(".cart-items");
    const subtotalEl = document.querySelector(".SubTotal");
    const grandTotalEl = document.querySelector(".grand-total");

    cartItemsContainer.innerHTML = "";

    if(cart.length === 0){

        cartItemsContainer.innerHTML = "<p>Your cart is empty</p>";

        subtotalEl.textContent = "₹0";
        grandTotalEl.textContent = "₹0";

        return;

    }

    let subtotal = 0;

    cart.forEach((item,index)=>{

        const price = Number(item.price);

        const itemTotal = price * item.quantity;

        subtotal += itemTotal;

        const cartItem = document.createElement("div");

        cartItem.classList.add("cart-item");

        cartItem.innerHTML = `

        <div class="product">
            <img src="${item.image}">
            <div class="item-detail">
                <p>${item.title}</p>
            </div>
        </div>

        <span class="price">₹${price}</span>

        <div class="quantity">
            <input type="number" value="${item.quantity}" min="1" data-index="${index}">
        </div>

        <span class="total-price">₹${itemTotal}</span>

        <button class="remove" data-index="${index}">
            <i class="ri-close-line"></i>
        </button>

        `;

        cartItemsContainer.appendChild(cartItem);

    });

    subtotalEl.textContent = `₹${subtotal}`;
    grandTotalEl.textContent = `₹${subtotal}`;

    updateQuantity();
    removeItem();

}

/* ---------------- UPDATE QUANTITY ---------------- */

function updateQuantity(){

    const inputs = document.querySelectorAll(".quantity input");

    let cart = JSON.parse(sessionStorage.getItem("cart")) || [];

    inputs.forEach(input =>{

        input.addEventListener("change", ()=>{

            const index = input.dataset.index;

            const newQty = parseInt(input.value);

            cart[index].quantity = newQty;

            sessionStorage.setItem("cart", JSON.stringify(cart));

            displayCart();
            updateCartCount();

        });

    });

}

/* ---------------- REMOVE ITEM ---------------- */

function removeItem(){

    const removeBtns = document.querySelectorAll(".remove");

    let cart = JSON.parse(sessionStorage.getItem("cart")) || [];

    removeBtns.forEach(btn =>{

        btn.addEventListener("click", ()=>{

            const index = btn.dataset.index;

            cart.splice(index,1);

            sessionStorage.setItem("cart", JSON.stringify(cart));

            displayCart();
            updateCartCount();

        });

    });

}

/* ---------------- CART COUNT ---------------- */

function updateCartCount(){

    const cart = JSON.parse(sessionStorage.getItem("cart")) || [];

    let total = 0;

    cart.forEach(item=>{
        total += item.quantity;
    });

    const cartCount = document.querySelector(".cart-item-count");

    if(cartCount){
        cartCount.innerText = total;
    }

}

/* ---------------- RAZORPAY ---------------- */

// const checkoutBtn = document.querySelector("#checkout-btn");

// if(checkoutBtn){

// checkoutBtn.addEventListener("click", async function(){

// const cart = JSON.parse(sessionStorage.getItem("cart")) || [];

// if(cart.length === 0){
// alert("Cart empty");
// return;
// }

// let total = 0;

// cart.forEach(item=>{
// total += item.price * item.quantity;
// });

// const response = await fetch("http://localhost:5000/create-order",{

// method:"POST",

// headers:{
// "Content-Type":"application/json"
// },

// body:JSON.stringify({
// amount: total
// })

// });

// const order = await response.json();

// var options = {

// key: "rzp_test_YOURKEY",

// amount: order.amount,

// currency: "INR",

// name: "Yash Store",

// description: "Order Payment",

// order_id: order.id,

// handler: function (response){

// alert("Payment Successful ✅");

// sessionStorage.removeItem("cart");

// window.location.href = "success.html";

// }

// };

// var rzp1 = new Razorpay(options);

// rzp1.open();

// });

// }


const checkoutBtn = document.querySelector("#checkout-btn");

if (checkoutBtn) {

    checkoutBtn.addEventListener("click", async function () {

        const cart = JSON.parse(sessionStorage.getItem("cart")) || [];

        if (cart.length === 0) {
            alert("Cart empty");
            return;
        }

        let total = 0;

        cart.forEach(item => {
            total += item.price * item.quantity;
        });

        let options = {

            key: "rzp_test_SRqZDHKDtt2mLl",

            amount: total * 100,

            currency: "INR",

            name: "Web Bags Store",

            description: "Bag Purchase",

            image: "https://yourlogo.com/logo.png",

            handler: function (response) {

                alert("Payment Successful 🎉");

                sessionStorage.removeItem("cart"); 

                window.location.href = "index.html";

            },

            prefill: {
                name: "Customer",
                email: "customer@email.com",
                contact: "9999999999"
            },

            theme: {
                color: "#000"
            }

        };

        let rzp = new Razorpay(options);
        rzp.open();

    });

}






