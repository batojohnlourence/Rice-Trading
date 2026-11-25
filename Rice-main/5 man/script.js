
const products = {
    jasmine: {
        name: "Jasmine Rice",
        image: "images/jasmine.jpg",
        description: "Fragrant, soft, and slightly sticky when cooked. Ideal for daily meals and Asian cuisine. Known for its delicate floral aroma.",
        pricePerKilo: 55,
        benefits: [
            { icon: "🌸", text: "Subtle Floral Aroma" },
            { icon: "☁️", text: "Soft, Fluffy Texture" },
            { icon: "🏅", text: "Premium Quality" },
            { icon: "🍚", text: "Versatile Cooking" }
        ]
    },
    black: {
        name: "Black Rice",
        image: "images/black.jpg",
        description: "A nutritious whole-grain rice with a rich nutty flavor, chewy texture, and a distinctive dark color.",
        pricePerKilo: 80,
        benefits: [
            { icon: "🌰", text: "Rich Nutty Flavor" },
            { icon: "💚", text: "Nutrient Rich" },
            { icon: "🏅", text: "Premium Quality" },
            { icon: "🥗", text: "Healthy Meal Option" }
        ]
    },
    grain: {
        name: "Grain Rice",
        image: "images/grain.jpg",
        description: "Wholesome grain rice with a natural taste and satisfying texture. Perfect for everyday family meals at an affordable price.",
        pricePerKilo: 42,
        benefits: [
            { icon: "🌾", text: "Natural Grain" },
            { icon: "🍃", text: "Natural Flavor" },
            { icon: "💰", text: "Budget Friendly" },
            { icon: "🍚", text: "Everyday Cooking" }
        ]
    },
    glutinous: {
        name: "Glutinous Rice",
        image: "images/glutinous.jpg",
        description: "Sticky rice with a soft and chewy texture. Perfect for traditional Filipino delicacies, kakanin, and desserts.",
        pricePerKilo: 75,
        benefits: [
            { icon: "🍡", text: "Perfect for Kakanin" },
            { icon: "☁️", text: "Soft, Sticky Texture" },
            { icon: "🏅", text: "Premium Quality" },
            { icon: "🍰", text: "Dessert Favorite" }
        ]
    },
    kuhako: {
        name: "Kuhako Rice",
        image: "images/kuhako.jpg",
        description: "A versatile rice variety suitable for everyday meals and different cooking styles. Reliable quality for homes and businesses.",
        pricePerKilo: 75,
        benefits: [
            { icon: "🌱", text: "Quality Grains" },
            { icon: "☁️", text: "Soft Texture" },
            { icon: "🏅", text: "Premium Quality" },
            { icon: "🍚", text: "Everyday Cooking" }
        ]
    }
};


// -----------------------------------------------------
// PART 2: PRODUCTS PAGE - clicking a card updates details
// -----------------------------------------------------

// Turn a number into a peso price, for example 1375 -> "₱1,375"
function formatPrice(amount) {
    return "₱" + amount.toLocaleString("en-PH");
}

// Fill the details panel with the chosen product
function showProduct(productKey) {
    const product = products[productKey];
    if (!product) {
        return; // unknown key, do nothing
    }

    // Name, image and description
    document.getElementById("detail-name").textContent = product.name;
    document.getElementById("detail-image").src = product.image;
    document.getElementById("detail-image").alt = product.name;
    document.getElementById("detail-description").textContent = product.description;

    // Prices: 25kg and 50kg sacks are calculated from the price per kilo
    document.getElementById("detail-price-kilo").textContent = formatPrice(product.pricePerKilo);
    document.getElementById("detail-price-25").textContent = formatPrice(product.pricePerKilo * 25);
    document.getElementById("detail-price-50").textContent = formatPrice(product.pricePerKilo * 50);

    // The Inquire Now button in the panel opens the contact page for this rice
    document.getElementById("detail-inquire").href = "inquire.html?product=" + encodeURIComponent(productKey);

    // "Why Choose This Rice?" heading
    document.getElementById("detail-why").textContent = "Why Choose " + product.name + "?";

    // Four benefits (icon + text)
    for (let i = 0; i < 4; i++) {
        document.getElementById("benefit-icon-" + (i + 1)).textContent = product.benefits[i].icon;
        document.getElementById("benefit-text-" + (i + 1)).textContent = product.benefits[i].text;
    }

    // Active state: remove it from every card, then add it to the chosen one
    const cards = document.querySelectorAll(".product-card");
    cards.forEach(function (card) {
        card.classList.remove("active");
        if (card.dataset.product === productKey) {
            card.classList.add("active");
        }
    });
}

// Fade the panel out, change the content, then fade back in
function changeProduct(productKey) {
    const panel = document.getElementById("product-details");
    panel.classList.add("fade");

    setTimeout(function () {
        showProduct(productKey);
        panel.classList.remove("fade");
    }, 250);
}

// Only run this part if we are on the products page
const productCards = document.querySelectorAll(".product-card");

if (productCards.length > 0) {
    // Make every card clickable
    productCards.forEach(function (card) {
        card.addEventListener("click", function () {
            changeProduct(card.dataset.product);
        });
    });

    // Inquire Now buttons: go to the contact page with the product name
    const inquireButtons = document.querySelectorAll(".inquire-btn");
    inquireButtons.forEach(function (button) {
        button.addEventListener("click", function (event) {
            event.stopPropagation(); // do not also trigger the card click
            const card = button.closest(".product-card");
            const key = card ? card.dataset.product : button.dataset.product;
            window.location.href = "inquire.html?product=" + encodeURIComponent(key);
        });
    });

    // If the link was product.html?product=black, open that product.
    // Otherwise show Jasmine Rice first.
    const params = new URLSearchParams(window.location.search);
    const requested = params.get("product");
    showProduct(products[requested] ? requested : "jasmine");
}


// -----------------------------------------------------
// PART 3: GENERAL CONTACT FORM
// -----------------------------------------------------
const contactForm = document.getElementById("contact-form");
if (contactForm) {
    contactForm.addEventListener("submit", function (event) {
        event.preventDefault();
        const note = document.getElementById("contact-note");
        note.textContent = "Thank you! Your message was received. We will contact you soon.";
        note.classList.remove("error");
        contactForm.reset();
    });
}

// -----------------------------------------------------
// PART 4: BACKEND AUTHENTICATION AND ACCOUNT NAVIGATION
// -----------------------------------------------------
const API_BASE_URL = "http://localhost:5000/api";
const AUTH_TOKEN_KEY = "rice_auth_token";

// Remove credentials from the previous browser-only demo account system.
localStorage.removeItem("rice_users");
localStorage.removeItem("rice_session");

function getAuthToken() {
    return localStorage.getItem(AUTH_TOKEN_KEY);
}

function clearAuthToken() {
    localStorage.removeItem(AUTH_TOKEN_KEY);
}

async function apiRequest(endpoint, options = {}) {
    const headers = new Headers(options.headers || {});
    if (options.body && !headers.has("Content-Type")) {
        headers.set("Content-Type", "application/json");
    }
    const token = getAuthToken();
    if (token) headers.set("Authorization", `Bearer ${token}`);

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
        const error = new Error(data.message || "The request could not be completed.");
        error.status = response.status;
        throw error;
    }
    return data;
}

function setAccountNavigation(isAuthenticated) {
    document.querySelectorAll("[data-account-dropdown]").forEach((dropdown) => {
        dropdown.classList.toggle("hidden", !isAuthenticated);
        const loginLink = dropdown.parentElement.querySelector(".account-login");
        if (loginLink) loginLink.classList.toggle("hidden", isAuthenticated);
    });
}

function closeAccountDropdown(dropdown) {
    const panel = dropdown.querySelector(".account-menu-panel");
    const trigger = dropdown.querySelector(".account-trigger");
    panel.classList.add("hidden");
    trigger.setAttribute("aria-expanded", "false");
}

async function logOut() {
    if (!getAuthToken()) {
        clearAuthToken();
        setAccountNavigation(false);
        window.location.replace("login.html");
        return;
    }

    try {
        await apiRequest("/users/logout", { method: "POST" });
        clearAuthToken();
        setAccountNavigation(false);
        window.location.replace("login.html");
    } catch (error) {
        console.error("Logout request failed:", error.message);
        if (error.status === 401) {
            clearAuthToken();
            setAccountNavigation(false);
            window.location.replace("login.html");
            return;
        }

        document.querySelectorAll(".account-menu").forEach((menu) => {
            let message = menu.querySelector(".account-error");
            if (!message) {
                message = document.createElement("p");
                message.className = "account-error";
                message.setAttribute("role", "alert");
                menu.appendChild(message);
            }
            message.textContent = "Unable to log out. Please try again.";
        });
    }
}

document.querySelectorAll("[data-account-dropdown]").forEach((dropdown) => {
    const trigger = dropdown.querySelector(".account-trigger");
    const panel = dropdown.querySelector(".account-menu-panel");
    trigger.addEventListener("click", () => {
        const opening = panel.classList.contains("hidden");
        document.querySelectorAll("[data-account-dropdown]").forEach(closeAccountDropdown);
        if (opening) {
            panel.classList.remove("hidden");
            trigger.setAttribute("aria-expanded", "true");
        }
    });
    dropdown.querySelector(".account-logout").addEventListener("click", () => {
        closeAccountDropdown(dropdown);
        logOut();
    });
});

document.addEventListener("click", (event) => {
    document.querySelectorAll("[data-account-dropdown]").forEach((dropdown) => {
        if (!dropdown.contains(event.target)) closeAccountDropdown(dropdown);
    });
});
document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
        document.querySelectorAll("[data-account-dropdown]").forEach(closeAccountDropdown);
    }
});

async function initializeAccountNavigation() {
    if (!getAuthToken()) {
        setAccountNavigation(false);
        return null;
    }
    try {
        const data = await apiRequest("/users/me");
        setAccountNavigation(true);
        return data.user;
    } catch (error) {
        if (error.status === 401) clearAuthToken();
        setAccountNavigation(false);
        return null;
    }
}
const accountReady = initializeAccountNavigation();

// -----------------------------------------------------
// PART 5: LOGIN AND REGISTRATION
// -----------------------------------------------------
const loginForm = document.getElementById("login-form");
const signupForm = document.getElementById("signup-form");

document.querySelectorAll("[data-password-toggle]").forEach((toggle) => {
    const passwordInput = document.getElementById(toggle.dataset.passwordToggle);
    toggle.addEventListener("click", () => {
        const reveal = passwordInput.type === "password";
        passwordInput.type = reveal ? "text" : "password";
        toggle.textContent = reveal ? "Hide" : "Show";
        toggle.setAttribute("aria-pressed", String(reveal));
        toggle.setAttribute("aria-label", `${reveal ? "Hide" : "Show"} ${passwordInput.labels[0].textContent.toLowerCase()}`);
    });
});

function postLoginDestination() {
    const target = new URLSearchParams(window.location.search).get("return") || "";
    if (target === "my-inquiries.html") {
        return target;
    }

    const inquiryReturn = target.match(/^inquire\.html\?product=(jasmine|black|grain|glutinous|kuhako)$/i);
    if (inquiryReturn) {
        return `inquire.html?product=${inquiryReturn[1].toLowerCase()}`;
    }

    return "index.html";
}

if (loginForm && signupForm) {
    accountReady.then((user) => {
        if (user) window.location.replace(postLoginDestination());
    });

    document.getElementById("show-signup").addEventListener("click", (event) => {
        event.preventDefault();
        loginForm.classList.add("hidden");
        signupForm.classList.remove("hidden");
    });
    document.getElementById("show-login").addEventListener("click", (event) => {
        event.preventDefault();
        signupForm.classList.add("hidden");
        loginForm.classList.remove("hidden");
    });

    const signupNote = document.getElementById("signup-note");
    const signupSubmit = document.getElementById("signup-submit");
    const displayNameInput = document.getElementById("signup-display-name");
    const usernameInput = document.getElementById("signup-username");
    const signupPasswordInput = document.getElementById("signup-password");
    const repeatPasswordInput = document.getElementById("signup-repeat");
    let registering = false;

    function updateSignupValidation(showIncomplete = false) {
        const checks = [
            {
                input: displayNameInput,
                note: document.getElementById("signup-display-note"),
                valid: displayNameInput.value.trim().length > 0 && displayNameInput.value.trim().length <= 100,
                error: !displayNameInput.value.trim() ? "Display name is required." : "Display name must be 100 characters or fewer.",
                hint: "This is the name displayed on your profile."
            },
            {
                input: usernameInput,
                note: document.getElementById("signup-username-note"),
                valid: usernameInput.value.trim().length >= 3,
                error: usernameInput.value.trim() ? "Use at least 3 characters." : "Username is required.",
                hint: "At least 3 characters. You will use this to log in."
            },
            {
                input: signupPasswordInput,
                note: document.getElementById("signup-password-note"),
                valid: signupPasswordInput.value.length >= 8,
                error: signupPasswordInput.value ? "Use at least 8 characters." : "Password is required.",
                hint: "Use at least 8 characters."
            },
            {
                input: repeatPasswordInput,
                note: document.getElementById("signup-confirm-note"),
                valid: repeatPasswordInput.value.length > 0 && repeatPasswordInput.value === signupPasswordInput.value,
                error: repeatPasswordInput.value ? "Passwords do not match." : "Please confirm your password.",
                hint: ""
            }
        ];

        let allValid = true;
        for (const check of checks) {
            const showError = !check.valid && (showIncomplete || check.input.value.length > 0 || check === checks[3] && signupPasswordInput.value.length > 0);
            check.input.setAttribute("aria-invalid", String(showError));
            check.note.textContent = showError ? check.error : check.hint;
            check.note.classList.toggle("field-error", showError);
            if (!check.valid) allValid = false;
        }
        return allValid;
    }

    [displayNameInput, usernameInput, signupPasswordInput, repeatPasswordInput].forEach((input) => {
        input.addEventListener("input", () => {
            updateSignupValidation(false);
            signupNote.textContent = "";
            signupNote.classList.remove("error", "success");
        });
    });

    loginForm.addEventListener("submit", async (event) => {
        event.preventDefault();
        const note = document.getElementById("login-note");
        const submitButton = loginForm.querySelector('button[type="submit"]');
        submitButton.disabled = true;
        note.classList.remove("error");
        note.textContent = "Logging in...";
        try {
            const data = await apiRequest("/users/login", {
                method: "POST",
                body: JSON.stringify({
                    username: document.getElementById("login-username").value.trim(),
                    password: document.getElementById("login-password").value
                })
            });
            localStorage.setItem(AUTH_TOKEN_KEY, data.token);
            note.textContent = "Login successful. Returning...";
            window.location.href = postLoginDestination();
        } catch (error) {
            note.textContent = error.message;
            note.classList.add("error");
        } finally {
            submitButton.disabled = false;
        }
    });

    signupForm.addEventListener("submit", async (event) => {
        event.preventDefault();
        if (registering) return;
        const note = signupNote;
        const password = document.getElementById("signup-password").value;
        if (!updateSignupValidation(true)) {
            note.textContent = "Please correct the highlighted fields.";
            note.classList.add("error");
            return;
        }

        registering = true;
        signupSubmit.disabled = true;
        signupSubmit.textContent = "Creating account...";
        note.classList.remove("error", "success");
        note.textContent = "Creating your account...";
        try {
            const data = await apiRequest("/users/register", {
                method: "POST",
                body: JSON.stringify({
                    displayName: document.getElementById("signup-display-name").value.trim(),
                    username: document.getElementById("signup-username").value.trim(),
                    password
                })
            });
            note.textContent = data.message || "Registration successful. You can now log in.";
            note.classList.add("success");
            signupForm.reset();
            updateSignupValidation(false);
        } catch (error) {
            note.textContent = error.message;
            note.classList.add("error");
        } finally {
            registering = false;
            signupSubmit.disabled = false;
            signupSubmit.textContent = "Create Account";
        }
    });
}

// -----------------------------------------------------
// PART 6: PROTECTED PROFILE PAGE
// -----------------------------------------------------
const profileForm = document.getElementById("profile-form");
function formatDate(isoString) {
    if (!isoString) return "Not available";
    return new Date(isoString).toLocaleString("en-PH", {
        year: "numeric", month: "short", day: "numeric",
        hour: "numeric", minute: "2-digit"
    });
}

if (profileForm) {
    const note = document.getElementById("profile-note");
    const populateProfile = (user) => {
        const displayName = user.displayName || user.username;
        document.getElementById("profile-avatar").textContent = displayName.charAt(0).toUpperCase();
        document.getElementById("profile-title").textContent = displayName;
        document.getElementById("profile-username").textContent = `@${user.username}`;
        document.getElementById("stat-member").textContent = formatDate(user.createdAt);
        document.getElementById("stat-last").textContent = formatDate(user.lastLogin);
        document.getElementById("stat-count").textContent = user.loginCount || 0;
        document.getElementById("profile-name").value = user.displayName || "";
        document.getElementById("profile-email").value = user.email || "";
        document.getElementById("profile-phone").value = user.phone || "";
        document.getElementById("profile-address").value = user.address || "";
    };

    (async () => {
        try {
            if (!getAuthToken()) throw Object.assign(new Error("Please log in to view your profile."), { status: 401 });
            const data = await apiRequest("/users/me");
            populateProfile(data.user);
        } catch (error) {
            if (error.status === 401) {
                clearAuthToken();
                window.location.replace("login.html");
                return;
            }
            note.textContent = error.message;
            note.classList.add("error");
        }
    })();

    profileForm.addEventListener("submit", async (event) => {
        event.preventDefault();
        const submitButton = profileForm.querySelector('button[type="submit"]');
        submitButton.disabled = true;
        note.classList.remove("error");
        note.textContent = "Saving...";
        try {
            const data = await apiRequest("/users/me", {
                method: "PATCH",
                body: JSON.stringify({
                    displayName: document.getElementById("profile-name").value.trim(),
                    email: document.getElementById("profile-email").value.trim(),
                    phone: document.getElementById("profile-phone").value.trim(),
                    address: document.getElementById("profile-address").value.trim()
                })
            });
            populateProfile(data.user);
            note.textContent = data.message;
        } catch (error) {
            note.textContent = error.message;
            note.classList.add("error");
            if (error.status === 401) {
                clearAuthToken();
                window.location.replace("login.html");
            }
        } finally {
            submitButton.disabled = false;
        }
    });

    document.getElementById("logout-btn").addEventListener("click", logOut);
}

// -----------------------------------------------------
// PART 7: PRODUCT-SPECIFIC INQUIRY PAGE
// -----------------------------------------------------
const inquiryForm = document.getElementById("inquiry-form");
if (inquiryForm) {
    const productPanel = document.getElementById("inquiry-product");
    const note = document.getElementById("inquiry-note");
    const submitButton = document.getElementById("inquiry-submit");
    const selectedSlug = new URLSearchParams(window.location.search).get("product");
    let selectedProduct = null;
    let submittingInquiry = false;
    let checkingInquirySession = false;
    submitButton.disabled = true;

    const inquiryLoginUrl = () => {
        const returnTarget = `inquire.html?product=${encodeURIComponent(selectedSlug || "")}`;
        return `login.html?return=${encodeURIComponent(returnTarget)}`;
    };
    document.querySelectorAll(".account-login").forEach((link) => {
        link.href = inquiryLoginUrl();
    });

    const saveInquiryDraft = () => {
        const draft = {
            product: selectedSlug,
            name: document.getElementById("inquiry-name").value,
            email: document.getElementById("inquiry-email").value,
            phone: document.getElementById("inquiry-phone").value,
            quantity: document.getElementById("inquiry-quantity").value,
            message: document.getElementById("inquiry-message").value
        };
        try {
            sessionStorage.setItem("rice_inquiry_draft", JSON.stringify(draft));
        } catch (error) {
            console.error("Unable to preserve inquiry details:", error);
        }
    };

    const requireLogin = () => {
        saveInquiryDraft();
        note.textContent = "You must log in first!";
        note.classList.add("error");
    };

    inquiryForm.addEventListener("input", () => {
        if (!getAuthToken()) saveInquiryDraft();
    });

    try {
        const savedDraft = JSON.parse(sessionStorage.getItem("rice_inquiry_draft") || "null");
        if (savedDraft && savedDraft.product === selectedSlug) {
            document.getElementById("inquiry-name").value = savedDraft.name || "";
            document.getElementById("inquiry-email").value = savedDraft.email || "";
            document.getElementById("inquiry-phone").value = savedDraft.phone || "";
            document.getElementById("inquiry-quantity").value = savedDraft.quantity || "";
            document.getElementById("inquiry-message").value = savedDraft.message || "";
            sessionStorage.removeItem("rice_inquiry_draft");
        }
    } catch (error) {
        console.error("Unable to restore inquiry details:", error);
    }

    const showProductError = (message) => {
        productPanel.textContent = message;
        note.textContent = message;
        note.classList.add("error");
        submitButton.disabled = true;
    };

    if (!selectedSlug) {
        showProductError("Choose a product from the Products page to send an inquiry.");
    } else {
        apiRequest(`/products/${encodeURIComponent(selectedSlug)}`)
            .then((product) => {
                selectedProduct = product;
                productPanel.replaceChildren();
                const image = document.createElement("img");
                image.src = product.image;
                image.alt = product.name;
                const title = document.createElement("h2");
                title.textContent = product.name;
                const price = document.createElement("p");
                price.className = "inquiry-price";
                price.textContent = `${formatPrice(product.pricePerKilo)} per kilogram`;
                const description = document.createElement("p");
                description.textContent = product.description;
                productPanel.append(image, title, price, description);
                submitButton.disabled = false;
            })
            .catch((error) => showProductError(error.message));
    }

    submitButton.addEventListener("click", (event) => {
        event.preventDefault();
        if (checkingInquirySession) return;
        checkingInquirySession = true;
        accountReady.then((user) => {
            checkingInquirySession = false;
            if (!user) {
                requireLogin();
                return;
            }
            inquiryForm.requestSubmit(submitButton);
        });
    });

    inquiryForm.addEventListener("submit", async (event) => {
        event.preventDefault();
        if (!selectedProduct || submittingInquiry) return;
        if (!getAuthToken()) {
            requireLogin();
            return;
        }
        submittingInquiry = true;
        submitButton.disabled = true;
        submitButton.textContent = "Sending...";
        note.classList.remove("error");
        note.textContent = "";

        const phone = document.getElementById("inquiry-phone").value.trim();
        const quantity = document.getElementById("inquiry-quantity").value.trim();
        const questions = document.getElementById("inquiry-message").value.trim();
        const message = `Contact number: ${phone}\nQuantity interested in: ${quantity}\n\n${questions}`;

        try {
            const result = await apiRequest("/inquiries", {
                method: "POST",
                body: JSON.stringify({
                    name: document.getElementById("inquiry-name").value.trim(),
                    email: document.getElementById("inquiry-email").value.trim(),
                    message,
                    product: selectedProduct.slug
                })
            });
            note.textContent = result.message || "Your inquiry was submitted successfully.";
            inquiryForm.reset();
        } catch (error) {
            if (error.status === 401) {
                clearAuthToken();
                requireLogin();
                return;
            }
            note.textContent = error.message || "Unable to send your inquiry. Please try again.";
            note.classList.add("error");
        } finally {
            submittingInquiry = false;
            submitButton.disabled = !selectedProduct;
            submitButton.textContent = "Send Inquiry";
        }
    });
}

// -----------------------------------------------------
// PART 8: AUTHENTICATED INQUIRY HISTORY
// -----------------------------------------------------
const inquiriesList = document.getElementById("inquiries-list");
if (inquiriesList) {
    const note = document.getElementById("inquiries-note");
    const loginTarget = `login.html?return=${encodeURIComponent("my-inquiries.html")}`;

    const renderInquiries = (inquiries) => {
        inquiriesList.replaceChildren();
        if (inquiries.length === 0) {
            note.textContent = "You have not submitted any product inquiries yet.";
            return;
        }

        note.textContent = `You have ${inquiries.length} ${inquiries.length === 1 ? "inquiry" : "inquiries"}.`;
        for (const inquiry of inquiries) {
            const card = document.createElement("article");
            card.className = "inquiry-history-card";
            const heading = document.createElement("h2");
            heading.textContent = inquiry.product ? `Product: ${inquiry.product}` : "Product inquiry";
            const meta = document.createElement("p");
            meta.className = "inquiry-history-meta";
            const date = document.createElement("span");
            date.textContent = inquiry.createdAt ? new Date(inquiry.createdAt).toLocaleString("en-PH") : "Date unavailable";
            const status = document.createElement("span");
            status.textContent = `Status: ${inquiry.status}`;
            meta.append(date, status);
            const message = document.createElement("p");
            message.className = "inquiry-history-message";
            message.textContent = inquiry.message;
            card.append(heading, meta, message);
            inquiriesList.appendChild(card);
        }
    };

    if (!getAuthToken()) {
        window.location.replace(loginTarget);
    } else {
        apiRequest("/inquiries/mine")
            .then(renderInquiries)
            .catch((error) => {
                if (error.status === 401) {
                    clearAuthToken();
                    window.location.replace(loginTarget);
                    return;
                }
                note.textContent = error.message || "Unable to load your inquiries.";
                note.classList.add("error");
            });
    }
}
