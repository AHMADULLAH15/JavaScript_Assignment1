document.querySelector("form").addEventListener("submit", (event) => {
    event.preventDefault();
    const searchInput = document.querySelector(".form-control").value.trim();
    if (searchInput) {
        allFood(searchInput);
    }
});

const allFood = (value) => {
    fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=${value}`)
        .then(res => res.json())
        .then(data => {
            DisplayFood(data);
        });
};

window.addEventListener("load", () => {
    allFood("chicken");
});

const DisplayFood = (data) => {
    const main = document.getElementById("main-container");
    main.innerHTML = "";

    if (data.meals) {
        data.meals.forEach(meal => {
            const div = document.createElement("div");
            div.classList.add("divclass");
            div.innerHTML = `
                <h2>${meal.strMeal}</h2>
                <img class="div-img" src="${meal.strMealThumb}" alt="${meal.strMeal}">
                <h6>Instruction:</h6>
                <p>${meal.strInstructions.slice(0, 100)}...</p>
                <button class="btn btn-primary" onclick="Details('${meal.idMeal}')">Details</button>
                <button class="btn btn-danger" onclick="AddToCart('${meal.idMeal}', '${meal.strMeal}')">Add to cart</button>
            `;
            main.appendChild(div);
        });
    } else {
        const errorDiv = document.createElement("div");
        errorDiv.classList.add("errordiv");
        errorDiv.innerHTML = `<h2>No results found</h2>`;
        main.appendChild(errorDiv);
    }
};

const cart = {};

const Details = (mealId) => {
    fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${mealId}`)
        .then(res => res.json())
        .then(data => {
            if (data.meals) {
                const meal = data.meals[0];
                document.getElementById("mealModalLabel").textContent = meal.strMeal;
                document.getElementById("mealModalBody").innerHTML = `
                    <img src="${meal.strMealThumb}" alt="${meal.strMeal}" class="detail-img mb-3" style="width: 100%;">
                    <h3>Ingredients:</h3>
                    <ul>
                        ${Object.keys(meal)
                            .filter(key => key.startsWith("strIngredient") && meal[key])
                            .map(key => `<li>${meal[key]} - ${meal[`strMeasure${key.slice(13)}`]}</li>`)
                            .join("")}
                    </ul>
                    <h3>Instructions:</h3>
                    <p>${meal.strInstructions}</p>
                `;

                const mealModal = new bootstrap.Modal(document.getElementById("mealModal"));
                mealModal.show();
            }
        });
};

const AddToCart = (mealId, mealName) => {
    const totalCount = Object.values(cart).reduce((acc, item) => acc + item.count, 0);

    if (totalCount >= 11) {
        alert("Sorry, the cart is full. You cannot add more than 11 items.");
        return;
    }

    if (cart[mealId]) {
        cart[mealId].count += 1;
    } else {
        cart[mealId] = { name: mealName, count: 1 };
    }

    updateCartDisplay();
};

const updateCartDisplay = () => {
    const cartItemsContainer = document.getElementById("cart-items");
    const cartCount = document.getElementById("cart-count");

    cartItemsContainer.innerHTML = "";

    let totalCount = 0;

    for (let mealId in cart) {
        const item = cart[mealId];
        totalCount += item.count;

        const itemDiv = document.createElement("div");
        itemDiv.classList.add("cart-item");
        itemDiv.innerHTML = `
            <p>${item.name} - Quantity: ${item.count}</p>
        `;
        cartItemsContainer.appendChild(itemDiv);
    }

    cartCount.textContent = totalCount;
};

const clearCart = () => {
    document.getElementById("cart-items").innerHTML = "";
    document.getElementById("cart-count").textContent = "0";
};

document.querySelector(".btn-danger").addEventListener("click", clearCart);
