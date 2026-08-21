// =========================
// GeoVision Dashboard
// =========================

document.addEventListener("DOMContentLoaded", () => {

    console.log("GeoVision Dashboard Loaded");

    // Sidebar Active Menu
    const items = document.querySelectorAll(".dashboard-sidebar li");

    items.forEach(item => {

        item.addEventListener("click", () => {

            items.forEach(i => i.classList.remove("active"));

            item.classList.add("active");

        });

    });

    // Search
    const search = document.querySelector(".search-box input");

    if (search) {

        search.addEventListener("keyup", function () {

            console.log("Searching:", this.value);

        });

    }

});