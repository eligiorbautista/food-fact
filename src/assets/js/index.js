// Global variables
const tagline = document.getElementById('tagline');
const navbarToggler = document.querySelector(".navbar-toggler");
const icon = document.getElementById("navbar-toggler-label");
const screenWidth = window.innerWidth;
let groupResult = 1;
let moreResultsAvailable = true;

document.addEventListener("DOMContentLoaded", function () {
    // Adjust tagline margin based on screen size
    tagline.style.setProperty("margin-top", screenWidth < 480 ? "4vh" : "13vh", "important");

    const categoriesDropDown = document.getElementById('categoriesDropDown');
    if (categoriesDropDown) {
        // Event listener for dropdown selection change
        categoriesDropDown.addEventListener('change', performCategorySearch);
    }

    navbarToggler.addEventListener("click", function () {
        // Toggle between navbar icons
        icon.classList.toggle("fa-bars");
        icon.classList.toggle("fa-xmark");
    });

    const searchForm = document.querySelector('form');
    if (searchForm) {
        // Event listener for form submission
        searchForm.addEventListener('submit', function (event) {
            // Prevent the default form submission
            event.preventDefault();
            // Call the function to perform search based on input
            performSearch();
        });
    }

    // Show notice modal and notice modal on page load
    var newModal = new bootstrap.Modal(document.getElementById('newModal'));
    newModal.show();

    var noticeModal = new bootstrap.Modal(document.getElementById('noticeModal'));
    document.addEventListener("contextmenu", function (event) {
        // Prevent right-click context menu
        event.preventDefault();
        noticeModal.show();
    });

    // Disable specific key combinations
    document.onkeydown = function (e) {
        if ((e.keyCode == 123) || (e.ctrlKey && e.shiftKey && [73, 74].includes(e.keyCode)) || (e.ctrlKey && e.keyCode == 85)) {
            return false;
        }
    };
});

function loadMoreResults() {
    // Function to load more results
    groupResult++; // Increment the page number
    performSearch();
}

function performSearch() {
    // Function to perform search based on input and page
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        const searchTerm = searchInput.value;

        // Fetch data from Open Food Facts API based on search term and page
        fetch(`https://world.openfoodfacts.org/cgi/search.pl?search_terms=${searchTerm}&json=1&page=${groupResult}`)
            .then(response => response.json())
            .then(data => {
                // Check if there are more results
                moreResultsAvailable = data.products.length > 0;

                // Update the product cards
                updateProductCard(data.products);

                // Show or hide the "Show More" button based on results
                toggleShowMoreButton();
            })
            .catch(handleError);
    }
}

function performCategorySearch() {
    // Function to perform category-based search
    // Display tagline with adjusted margin
    tagline.style.display = 'block';
    tagline.style.setProperty("margin-top", screenWidth < 480 ? "4vh" : "13vh", "important");

    // Fetch data from Open Food Facts API based on selected category
    const category = document.getElementById('categoriesDropDown');
    if (category) {
        // Hide tagline and display product cards
        tagline.style.display = 'none';
        tagline.style.removeProperty('margin-top');
        const selectedCategory = category.value;

        // Fetch data from Open Food Facts API based on category and page
        fetch(`https://world.openfoodfacts.org/cgi/search.pl?search_terms=${selectedCategory}&json=1&page=${groupResult}`)
            .then(response => response.json())
            .then(data => {
                // Check if there are more results
                moreResultsAvailable = data.products.length > 0;

                // Update the product cards
                updateProductCard(data.products);

                // Show or hide the "Show More" button based on results
                toggleShowMoreButton();
            })
            .catch(handleError);
    }
}

function updateProductCard(products) {
    // Function to update product cards on the page
    // Get the products container element
    const productsContainer = document.getElementById('products-container');

    if (productsContainer) {
        // Clear existing content
        productsContainer.innerHTML = '';

        if (products.length === 0) {
            // Show result modal and adjust tagline margin
            showResultModal();
        } else {
            // Hide tagline and display product cards
            hideTagline();

            // Iterate through each product and create a card
            products.forEach(product => {
                const card = createProductCard(product);
                productsContainer.appendChild(card);
            });
        }
    }
}

function createProductCard(product) {
    // Function to create a product card element
    const card = document.createElement('div');
    card.className = 'col-sm g-5';
    card.innerHTML = `
        <div class="card mx-auto shadow" style="width: 18rem;">
            <div class="card-header text-center text-dark fw-bold">${capitalize(removeEnPrefix(product.product_name) || 'No product name to show.')}</div>
            <a href="#" data-bs-toggle="modal" data-bs-target="#imageModal" data-src="${product.image_url || 'https://icon-library.com/images/no-picture-available-icon/no-picture-available-icon-1.jpg'}" alt="${capitalize(removeEnPrefix(product.product_name) || 'No alt value')}">
                <img class="card-img-top img-fluid" src="${product.image_url || 'https://icon-library.com/images/no-picture-available-icon/no-picture-available-icon-1.jpg'}" alt="${capitalize(removeEnPrefix(product.product_name) || 'No alt value')}">
            </a>
            <div class="card-body">
                <div class="card-text">
                    <p><strong><b>Brand:</b></strong> ${capitalize(removeEnPrefix(product.brands)) || 'No data found.'}</p>
                    
                    <p><strong><b>Categories:</b></strong> ${capitalize(removeEnPrefix(product.categories)) || 'No data found.'}</p>

                    <p><strong><b>Available in:</b></strong> ${capitalize(removeEnPrefix(product.countries)) || 'No data found.'}</p>
                    <hr>
                    <p><small><strong><b>Ingredients:</b></strong> ${capitalize(removeEnPrefix(product.ingredients_text)) || 'No data found.'}</small></p>
                </div>
            </div>
        </div>
    `;
    return card;
}

function toggleShowMoreButton() {
    // Function to show or hide the "Show More" button based on results
    const showMoreButton = document.getElementById('showMoreButton');
    if (showMoreButton) {
        showMoreButton.style.display = moreResultsAvailable ? 'block' : 'none';
    }
}

function showResultModal() {
    // Function to show the result modal and adjust tagline margin
    var resultModal = new bootstrap.Modal(document.getElementById('resultModal'));
    resultModal.show();
    tagline.style.display = 'block';
    tagline.style.setProperty("margin-top", screenWidth < 480 ? "4vh" : "13vh", "important");
}

function hideTagline() {
    // Function to hide the tagline
    tagline.style.display = 'none';
    tagline.style.removeProperty('margin-top');
}

function capitalize(str) {
    // Function to capitalize the first letter of a string
    return typeof str === 'string' ? str.charAt(0).toUpperCase() + str.slice(1) : str;
}

function removeEnPrefix(str) {
    // Function to remove "En:" prefix
    return typeof str === 'string' ? str.replace(/^En:/i, '').trim() : str;
}

function handleError(error) {
    // Function to handle errors
    console.error(`Error: ${error}`);
    var maintenanceModal = new bootstrap.Modal(document.getElementById('maintenanceModal'));
    maintenanceModal.show();
    console.error('Failed to fetch data from Open Food Facts API. Please try again later.', error);
}

function backToTop() {
    // Function to scroll to the top of the page
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

window.onscroll = function () {
    // Show/hide the scroll to top button based on scroll position
    var backToTopButton = document.getElementById('backToTopButton');
    if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
        backToTopButton.style.display = 'block';
    } else {
        backToTopButton.style.display = 'none';
    }
};

document.getElementById('imageModal').addEventListener('show.bs.modal', function (event) {
    // Event listener for modal show event
    const imageSrc = event.relatedTarget.getAttribute('data-src');
    // Set the src attribute of the modal image
    const modalImage = document.getElementById('modalImage');
    modalImage.src = imageSrc;
    modalImage.alt = event.relatedTarget.getAttribute('alt');
});

document.getElementById('imageModal').addEventListener('hide.bs.modal', function () {
    // Event listener for modal hide event
    // Clear the src attribute when the modal is hidden
    document.getElementById('modalImage').src = '';
});
