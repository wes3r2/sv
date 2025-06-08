document.addEventListener("DOMContentLoaded", () => {
  // Initialize UI elements
  initUI()

  // Initialize form functionality
  initForm()

  // Initialize search functionality
  initSearch()

  // Initialize ID card functionality
  initIDCard()

  // Check for URL parameters to show results
  checkForSearchResults()
})

function initIDCard() {
  const accessEidButton = document.getElementById("access-eid-button");

  accessEidButton?.addEventListener("click", () => {
    const empId = document.querySelector("input[name='emp_id']")?.value.trim();

    // Create fullscreen overlay if not exists
    let overlay = document.querySelector(".idcard-overlay");
    if (!overlay) {
      overlay = document.createElement("div");
      overlay.className = "idcard-overlay";
      overlay.style = `
        position: fixed; top:0; left:0; width:100vw; height:100vh;
        background: rgba(0,0,0,0.8);
        display: flex; justify-content: center; align-items: center;
        z-index: 9999;
        flex-direction: column;
      `;

      // Add image element inside overlay
      const img = document.createElement("img");
      img.className = "idcard-image";
      img.style = "max-width: 90vw; max-height: 80vh; box-shadow: 0 0 10px #000; border-radius: 8px; margin-bottom: 1rem;";
      overlay.appendChild(img);

      // Create cancel button
      const cancelButton = document.createElement("button");
      cancelButton.textContent = "Cancel";
      cancelButton.style = `
        padding: 0.5rem 1rem;
        font-size: 1rem;
        border: none;
        border-radius: 4px;
        background-color: #ff4444;
        color: white;
        cursor: pointer;
      `;
      cancelButton.addEventListener("click", () => {
        overlay.remove();
      });
      overlay.appendChild(cancelButton);

      document.body.appendChild(overlay);
    }

    const img = overlay.querySelector(".idcard-image");
    img.src = `/view_id?emp_id=${encodeURIComponent(empId)}`;
  });
}



// Initialize UI elements
function initUI() {
  // Initialize hamburger menu
  const hamburgerMenu = document.getElementById("hamburgerMenu")
  const profileDropdown = document.getElementById("profileDropdown")

  if (hamburgerMenu && profileDropdown) {
    hamburgerMenu.addEventListener("click", () => {
      profileDropdown.classList.toggle("active")
    })

    document.addEventListener("click", (event) => {
      if (!hamburgerMenu.contains(event.target) && !profileDropdown.contains(event.target)) {
        profileDropdown.classList.remove("active")
      }
    })
  }

  // Initialize language tabs
  const languageTabs = document.querySelectorAll(".language-tab")

  languageTabs.forEach((tab) => {
    tab.addEventListener("click", function () {
      // Remove active class from all tabs
      languageTabs.forEach((t) => t.classList.remove("active"))

      // Add active class to clicked tab
      this.classList.add("active")

      // Set the language attribute on body for translations
      document.body.setAttribute("data-lang", this.getAttribute("data-lang"))
    })
  })

  // Initialize modal
  const closeModalBtn = document.querySelector(".close-modal-btn")
  const modalCancel = document.getElementById("modal-cancel")

  if (closeModalBtn) {
    closeModalBtn.addEventListener("click", hideModal)
  }

  if (modalCancel) {
    modalCancel.addEventListener("click", hideModal)
  }

  // Close modal when clicking outside
  window.addEventListener("click", (e) => {
    const modal = document.getElementById("confirmModal")
    if (e.target === modal) {
      hideModal()
    }
  })

  // Initialize car search box expansion
  const carSearchBox = document.getElementById("car-search-box")
  if (carSearchBox) {
    carSearchBox.addEventListener("click", function (e) {
      // Don't expand if clicking on form elements
      if (
        e.target.tagName === "INPUT" ||
        e.target.tagName === "BUTTON" ||
        e.target.closest("button") ||
        e.target.closest("form")
      ) {
        return
      }

      this.classList.toggle("expanded")

      // Add close button if expanded
      if (this.classList.contains("expanded")) {
        if (!document.querySelector(".car-search-close-btn")) {
          const closeBtn = document.createElement("button")
          closeBtn.className = "close-btn car-search-close-btn"
          closeBtn.innerHTML = `
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                          <line x1="18" y1="6" x2="6" y2="18"></line>
                          <line x1="6" y1="6" x2="18" y2="18"></line>
                      </svg>
                  `
          closeBtn.addEventListener("click", (e) => {
            e.stopPropagation()
            this.classList.remove("expanded")
            closeBtn.remove()
          })

          const header = this.querySelector(".bento-header")
          header.appendChild(closeBtn)
        }
      }
    })
  }
}

function initForm() {
  // Flash message display
  function showFlashMessage(msg, type = "error") {
    const flashContainer = document.getElementById("flash-message") || createFlashContainer();
    flashContainer.innerText = msg;
    flashContainer.className = "flash-error";
    flashContainer.style.display = "block";

    setTimeout(() => {
      flashContainer.style.display = "none";
    }, 5000);
  }

  function createFlashContainer() {
    const div = document.createElement("div");
    div.id = "flash-message";
    div.style.padding = "10px";
    div.style.marginBottom = "10px";
    div.style.border = "1px solid red";
    div.style.color = "white";
    div.style.backgroundColor = "#c0392b";
    div.style.fontWeight = "bold";
    div.style.borderRadius = "4px";
    document.body.prepend(div);
    return div;
  }

  // Helper to get user-friendly field label
  function getFieldLabel(input) {
    const label = document.querySelector(`label[for="${input.id}"]`);
    if (label) return label.innerText.trim();
    if (input.name) return input.name.replace(/_/g, " ").toUpperCase();
    return "This field";
  }

  // Validate all required and visible fields on the page
  function validatePage(pageId) {
    const page = document.getElementById(pageId);
    const fields = page.querySelectorAll("input[required], select[required]");
    let firstInvalid = null;

    fields.forEach(el => {
      if (!el.offsetParent || el.disabled || el.readOnly) return;

      if (!el.checkValidity()) {
        el.classList.add("error");
        if (!firstInvalid) firstInvalid = el;
      } else {
        el.classList.remove("error");
      }
    });

    if (firstInvalid) {
      const label = getFieldLabel(firstInvalid);
      const message = `${label}: ${firstInvalid.validationMessage}`;
      showFlashMessage(message, "error");
      firstInvalid.focus();
      return false;
    }

    return true;
  }

  // Handle multi-page transitions
  window.goToPage = (currentPage, nextPage) => {
    const forward = +nextPage.replace("page", "") > +currentPage.replace("page", "");
    if (forward && !validatePage(currentPage)) return;

    document.getElementById(currentPage).style.display = "none";
    document.getElementById(nextPage).style.display = "block";

    document.querySelectorAll(`#${currentPage} input, #${currentPage} select`).forEach(el => el.disabled = true);
    document.querySelectorAll(`#${nextPage} input, #${nextPage} select`).forEach(el => el.disabled = false);
  };

  // Final form submit validation
  window.validateForm = () => {
  const form = document.querySelector("#form-box form");
  const fields = form.querySelectorAll("input, select");
  let firstInvalid = null;

  fields.forEach(el => {
    el.disabled = false; // Ensure nothing is blocked

    if (!el.offsetParent || el.readOnly) return; // Skip hidden/readonly
    if (!el.checkValidity()) {
      el.classList.add("error");
      if (!firstInvalid) firstInvalid = el;
    } else {
      el.classList.remove("error");
    }
  });

  if (firstInvalid) {
    const label = getFieldLabel(firstInvalid);
    const msg = `${label}: ${firstInvalid.validationMessage}`;
    showFlashMessage(msg, "error");
    firstInvalid.focus();
    return false;
  }

  return true;
};


  // Real-time feedback
  document.querySelectorAll("input[required], select[required]").forEach(el => {
    el.addEventListener("input", () => {
      if (el.checkValidity()) el.classList.remove("error");
      else el.classList.add("error");
    });
  });

  // Enable first visible page's inputs
  const firstVisible = document.querySelector(".form-container > div:not([style*='display: none'])");
  if (firstVisible) {
    firstVisible.querySelectorAll("input, select").forEach(el => el.disabled = false);
  }
}

// Initialize search functionality
function initSearch() {
  // Initialize edit button for registration number
  const editRegNoBtn = document.getElementById("editRegNoBtn")
  const regNoInput = document.querySelector("input[name='reg_no']")

  if (editRegNoBtn && regNoInput) {
    editRegNoBtn.addEventListener("click", (e) => {
      e.preventDefault()
      // Toggle readonly attribute
      if (regNoInput.hasAttribute("readonly")) {
        regNoInput.removeAttribute("readonly")
        editRegNoBtn.innerHTML = `
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                      <polyline points="17 21 17 13 7 13 7 21"></polyline>
                      <polyline points="7 3 7 8 15 8"></polyline>
                  </svg>
              `
      } else {
        regNoInput.setAttribute("readonly", true)
        editRegNoBtn.innerHTML = `
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                  </svg>
              `
      }
    })
  }

  // Car search form
  const carSearchForm = document.getElementById("carSearchForm")
  if (carSearchForm) {
    carSearchForm.addEventListener("submit", (e) => {
      // Redirect to search page
      window.location.href = "/search"
    })
  }

  // Search button on search_cars.html
  const searchButton = document.querySelector(".search-button")
  if (searchButton) {
    const form = searchButton.closest("form")
    if (form) {
      form.addEventListener("submit", function (e) {
        const regNo = this.querySelector("input[name='reg_no']").value.trim()
        if (!regNo) {
          e.preventDefault()
          showFlashMessage("Please enter the last 4 digits of the registration number", "error")
        }
      })
    }
  }
}



// Check for search results in URL
function checkForSearchResults() {
  const urlParams = new URLSearchParams(window.location.search)
  const searchTerm = urlParams.get("q")

  if (searchTerm) {
    const regNoInput = document.querySelector("input[name='reg_no']")
    if (regNoInput) {
      regNoInput.value = searchTerm

      // Trigger search
      const searchButton = document.getElementById("searchCarBtn")
      if (searchButton) {
        searchButton.click()
      }
    }
  }
}

// Show flash message
function showFlashMessage(message, type = "info") {
  const flashMessages = document.getElementById("flashMessages")
  if (!flashMessages) return

  const alert = document.createElement("div")
  alert.className = `alert alert-${type}`
  alert.innerHTML = message

  if (type === "success") {
    alert.innerHTML += `
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="alert-icon">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
          </svg>
      `
  }

  flashMessages.appendChild(alert)

  // Auto-hide after 5 seconds
  setTimeout(() => {
    alert.style.animation = "slideOut 0.5s ease-out"
    alert.addEventListener("animationend", () => {
      if (flashMessages.contains(alert)) {
        flashMessages.removeChild(alert)
      }
    })
  }, 5000)
}

// Show modal
function showModal(title, message, confirmCallback) {
  const modal = document.getElementById("confirmModal")
  const modalTitle = document.getElementById("modal-title")
  const modalMessage = document.getElementById("modal-message")
  const confirmBtn = document.getElementById("modal-confirm")

  modalTitle.textContent = title
  modalMessage.textContent = message

  confirmBtn.onclick = confirmCallback

  modal.classList.add("active")
}

// Hide modal
function hideModal() {
  const modal = document.getElementById("confirmModal")
  modal.classList.remove("active")
}

// Logout handler
function handleLogout() {
  showModal("Confirm Logout", "Are you sure you want to log out from your account?", () => {
    showFlashMessage("Logging out...", "success")
    setTimeout(() => {
      window.location.href = "/logout"
    }, 1000)
  })
}
