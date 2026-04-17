// MENU

let menu = document.querySelector('.menu-icon');
let navbar = document.querySelector('.navbar');

menu.onclick = () => {
    menu.classList.toggle("move");
    navbar.classList.toggle("menu-open");
}

window.onscroll = () => {
    menu.classList.remove("move")
    navbar.classList.remove("menu-open")
}

// HEADER SHADOW

let header = document.querySelector('header')

window.addEventListener('scroll', () => {
    header.classList.toggle('shadow', window.scrollY > 0)
})

// SWIPER

var swiper = new Swiper(".testimonial-slider", {
    spaceBetween: 30,
    centeredSlides: true,
    loop: true,

    autoplay: {
        delay: 3000,
        disableOnInteraction: false,
    },

    pagination: {
        el: ".swiper-pagination",
        clickable: true,
    },

    breakpoints: {
        320: { slidesPerView: 1 },
        1024: { slidesPerView: 1.5 }
    }
});


// =================
// ADD TO CART
// =================

let buttons = document.querySelectorAll(".product-box .shop-now");

buttons.forEach(btn => {

    btn.addEventListener("click", function () {

        let productBox = this.closest(".product-box");

        let title = productBox.querySelector(".product-title").innerText;

        let price = productBox.querySelector(".product-price").innerText;

        let image = productBox.querySelector("img").src;


        // GET OLD CART

        let cart = JSON.parse(localStorage.getItem("cart")) || [];


        // CHECK PRODUCT EXISTS

        let found = cart.find(item => item.title === title);

        if (found) {

            found.quantity += 1;

        } else {

            cart.push({
                title: title,
                price: price,
                image: image,
                quantity: 1
            });

        }

        localStorage.setItem("cart", JSON.stringify(cart));

        updateBagCount();

        alert("Added To Cart 🛒");

    });

});





function updateBagCount() {

    let cart = JSON.parse(localStorage.getItem("cart")) || [];

    let totalItems = 0;

    cart.forEach(item => {
        totalItems += item.quantity;
    });

    let badge = document.querySelector(".bag-count-badge");

    if (badge) {
        badge.innerText = totalItems;
    }

}

updateBagCount();




const cartIcon = document.querySelector(".bag-link");
const shopButtons = document.querySelectorAll(".shop-now");

shopButtons.forEach(button => {
    button.addEventListener("click", () => {

        cartIcon.classList.add("shake");

        setTimeout(() => {
            cartIcon.classList.remove("shake");
        }, 400);

    });
});