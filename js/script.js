const hamburger = document.querySelector(".hamburger");
const navMenu = document.querySelector(".nav-menu");

if (hamburger && navMenu) {
  hamburger.addEventListener("click", () => {
    const isOpen = hamburger.classList.toggle("active");
    navMenu.classList.toggle("active");
    hamburger.setAttribute("aria-expanded", isOpen);
  });

  document.querySelectorAll(".nav-link").forEach((link) => {
    link.addEventListener("click", () => {
      hamburger.classList.remove("active");
      navMenu.classList.remove("active");
      hamburger.setAttribute("aria-expanded", "false");
    });
  });
}

const currentPage = window.location.pathname.split("/").pop() || "index.html";
document.querySelectorAll(".nav-link").forEach((link) => {
  const href = link.getAttribute("href");
  if (href === currentPage || (currentPage === "" && href === "index.html")) {
    link.classList.add("active");
  }
});

const bookingForm = document.getElementById("booking-form");
if (bookingForm) {
  const checkIn = document.getElementById("check-in");
  const checkOut = document.getElementById("check-out");
  const dateError = document.getElementById("date-error");
  const summaryContent = document.getElementById("summary-content");
  const estimatedTotalInput = document.getElementById("estimated-total");
  const nightsCountInput = document.getElementById("nights-count");
  const today = new Date().toISOString().split("T")[0];

  const RATES = { peak: 289, shoulder: 219, off: 169 };
  const MIN_STAYS = { peak: 3, shoulder: 2, off: 2 };

  function getSeason(date) {
    const month = date.getMonth() + 1;
    if (month >= 6 && month <= 8) return "peak";
    if ((month >= 4 && month <= 5) || (month >= 9 && month <= 10)) return "shoulder";
    return "off";
  }

  function formatDate(dateStr) {
    return new Date(dateStr + "T00:00:00").toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  function calculateStay(startStr, endStr) {
    const start = new Date(startStr + "T00:00:00");
    const end = new Date(endStr + "T00:00:00");
    let nights = 0;
    let total = 0;
    const current = new Date(start);

    while (current < end) {
      total += RATES[getSeason(current)];
      nights++;
      current.setDate(current.getDate() + 1);
    }

    return { nights, total };
  }

  function getRequiredMinStay(startStr) {
    return MIN_STAYS[getSeason(new Date(startStr + "T00:00:00"))];
  }

  function updateSummary() {
    if (!checkIn.value || !checkOut.value) {
      summaryContent.innerHTML =
        '<p class="summary-placeholder">Select your check-in and check-out dates to see an estimate.</p>';
      estimatedTotalInput.value = "";
      nightsCountInput.value = "";
      return;
    }

    const { nights, total } = calculateStay(checkIn.value, checkOut.value);
    const minStay = getRequiredMinStay(checkIn.value);

    if (nights <= 0) {
      summaryContent.innerHTML =
        '<p class="summary-placeholder">Check-out must be after check-in.</p>';
      return;
    }

    summaryContent.innerHTML = `
      <div class="summary-line"><span>Check-in</span><span>${formatDate(checkIn.value)}</span></div>
      <div class="summary-line"><span>Check-out</span><span>${formatDate(checkOut.value)}</span></div>
      <div class="summary-line"><span>Nights</span><span>${nights}</span></div>
      <div class="summary-line"><span>Min. stay</span><span>${minStay} nights</span></div>
      <div class="summary-line summary-line--total"><span>Estimated total</span><span>$${total.toLocaleString()}</span></div>
    `;

    estimatedTotalInput.value = `$${total}`;
    nightsCountInput.value = nights;
  }

  function validateDates() {
    if (!checkIn.value || !checkOut.value) return true;

    const { nights } = calculateStay(checkIn.value, checkOut.value);
    const minStay = getRequiredMinStay(checkIn.value);

    if (nights <= 0) {
      dateError.textContent = "Check-out must be after check-in.";
      dateError.classList.add("visible");
      checkOut.classList.add("invalid");
      return false;
    }

    if (nights < minStay) {
      dateError.textContent = `This season requires a ${minStay}-night minimum stay.`;
      dateError.classList.add("visible");
      checkOut.classList.add("invalid");
      return false;
    }

    dateError.textContent = "";
    dateError.classList.remove("visible");
    checkOut.classList.remove("invalid");
    return true;
  }

  checkIn.min = today;
  checkOut.min = today;

  checkIn.addEventListener("change", () => {
    checkOut.min = checkIn.value || today;
    if (checkOut.value && checkOut.value <= checkIn.value) {
      checkOut.value = "";
    }
    updateSummary();
    validateDates();
  });

  checkOut.addEventListener("change", () => {
    updateSummary();
    validateDates();
  });

  bookingForm.addEventListener("submit", (e) => {
    if (!validateDates()) {
      e.preventDefault();
    }
  });
}
