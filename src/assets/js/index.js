// Global variables
const tagline = document.getElementById('tagline');
const navbarToggler = document.querySelector(".navbar-toggler");
const icon = document.getElementById("navbar-toggler-label");
const screenWidth = window.innerWidth;

// Event listener for when the page is fully loaded
document.addEventListener("DOMContentLoaded", function () {
    // Check screen size and adjust tagline margin
    tagline.style.setProperty("margin-top", screenWidth < 480 ? "6vh" : "13vh", "important");

    // Event listener for dropdown selection change
    const categoriesDropDown = document.getElementById('categoriesDropDown');
    if (categoriesDropDown) {
        categoriesDropDown.addEventListener('change', function () {
            // Call the function to perform category-based search
            performCategorySearch();
        });
    }

    // Event listener for navbar toggler click
    navbarToggler.addEventListener("click", function () {
        // Toggle between navbar icons
        icon.classList.toggle("fa-bars");
        icon.classList.toggle("fa-xmark");
    });

    // Event listener for form submission
    const searchForm = document.querySelector('form');
    if (searchForm) {
        searchForm.addEventListener('submit', function (event) {
            // Prevent the default form submission
            event.preventDefault();
            // Call the function to perform search based on input
            performSearch();
        });
    }

    // Show maintenance modal and notice modal on page load
    var newModal = new bootstrap.Modal(document.getElementById('newModal'));
    newModal.show();

    // var noticeModal = new bootstrap.Modal(document.getElementById('noticeModal'));
    // document.addEventListener("contextmenu", function (event) {
    //     // Prevent right-click context menu
    //     event.preventDefault();
    //     noticeModal.show();
    // });

    // // Disable specific key combinations
    // document.onkeydown = function (e) {
    //     if ((e.keyCode == 123) || (e.ctrlKey && e.shiftKey && [73, 74].includes(e.keyCode)) || (e.ctrlKey && e.keyCode == 85)) {
    //         return false;
    //     }
    // };
});

// Function to perform search based on input
function performSearch() {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        const searchTerm = searchInput.value;
        // Fetch data from Open Food Facts API based on search term
        fetch(`https://world.openfoodfacts.org/cgi/search.pl?search_terms=${searchTerm}&json=1`)
            .then(response => response.json())
            .then(data => updateProductCard(data.products))
            .catch(error => {
                // Log and display an error message
                console.error(`Error: ${error}`);
                var maintenanceModal = new bootstrap.Modal(document.getElementById('maintenanceModal'));
                maintenanceModal.show();
                console.error('Failed to fetch data from Open Food Facts API. Please try again later.', error);
            });
    }
}

// Function to perform category-based search
function performCategorySearch() {
    // Display tagline with adjusted margin
    tagline.style.display = 'block';
    tagline.style.setProperty("margin-top", screenWidth < 480 ? "6vh" : "13vh", "important");

    // Fetch data from Open Food Facts API based on selected category
    const selectedCategory = document.getElementById('categoriesDropDown');
    if (selectedCategory) {
        // Hide tagline and display product cards
        tagline.style.display = 'none';
        tagline.style.removeProperty('margin-top');
        const searchTerm = selectedCategory.value;
        fetch(`https://world.openfoodfacts.org/cgi/search.pl?search_terms=${searchTerm}&json=1`)
            .then(response => response.json())
            .then(data => updateProductCard(data.products))
            .catch(error => {
                // Log and display an error message
                console.error(`Error: ${error}`);
                var maintenanceModal = new bootstrap.Modal(document.getElementById('maintenanceModal'));
                maintenanceModal.show();
                console.error('Failed to fetch data from Open Food Facts API. Please try again later.', error);
            });
    }
}

// Function to update product cards on the page
function updateProductCard(products) {
    // Get the products container element
    const productsContainer = document.getElementById('products-container');

    if (productsContainer) {
        // Clear existing content
        productsContainer.innerHTML = '';

        if (products.length === 0) {
            // Show result modal and adjust tagline margin
            var resultModal = new bootstrap.Modal(document.getElementById('resultModal'));
            resultModal.show();
            tagline.style.display = 'block';
            tagline.style.setProperty("margin-top", screenWidth < 480 ? "6vh" : "13vh", "important");
        } else {
            // Hide tagline and display product cards
            tagline.style.display = 'none';
            tagline.style.removeProperty('margin-top');

            // Iterate through each product and create a card
            products.forEach(product => {
                const card = document.createElement('div');
                card.className = 'col-sm g-5';
                card.innerHTML = `
                    <div class="card mx-auto shadow" style="width: 18rem;">
                        <div class="card-header text-center text-dark fw-bold">${capitalize(removeEnPrefix(product.name_en) || removeEnPrefix(product.product_name) || 'No product name to show.')}</div>
                        <a href="${product.image_url || 'https://icon-library.com/images/no-picture-available-icon/no-picture-available-icon-1.jpg'}" target="_blank">
                            <img class="card-img-top img-fluid" src="${product.image_url || 'https://icon-library.com/images/no-picture-available-icon/no-picture-available-icon-1.jpg'}" alt="${capitalize(removeEnPrefix(product.product_name) || 'No alt value')}">
                        </a>
                        <div class="card-body">
                            <div class="card-text">
                                <p><strong><b>Brand:</b></strong> ${capitalize(removeEnPrefix(product.brands)) || 'No data found.'}</p>
                                
                                <p><strong><b>Categories:</b></strong> ${capitalize(removeEnPrefix(product.categories)) || 'No data found.'}</p>
 
                                <p><strong><b>Origin:</b></strong> ${capitalize(removeEnPrefix(product.origin)) || 'No data found.'}</p>

                                <p><strong><b>Available in:</b></strong> ${capitalize(removeEnPrefix(product.countries)) || 'No data found.'}</p>
                                <hr>
                                <p><small><strong><b>Ingredients:</b></strong> ${capitalize(removeEnPrefix(product.ingredients_text)) || 'No data found.'}</small></p>
                            </div>
                        </div>
                    </div>
                `;
                productsContainer.appendChild(card);
            });
        }
    }
}

// Function to capitalize the first letter of a string
function capitalize(str) {
    if (typeof str === 'string') {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }
}

// Function to remove "En:" prefix
function removeEnPrefix(str) {
    if (typeof str === 'string') {
        return str.replace(/^En:/i, '').trim();
    }
    return str;
}
