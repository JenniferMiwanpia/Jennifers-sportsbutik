const endpoint = "https://kea-alt-del.dk/t7/api/categories";
const kategoriliste = document.querySelector("#categories");
const statusMessage = document.querySelector("#status");
const retryButton = document.querySelector("#retry");

// Et produktbillede til hver kategori.
const billeder = {
  Accessories: 1526,
  Apparel: 1644,
  Footwear: 1543,
  "Free Items": 10595,
  "Personal Care": 18441,
  "Sporting Goods": 1628,
};

retryButton.addEventListener("click", hentKategorier);
hentKategorier();

// Henter kategorierne og sender dem til visData.
function hentKategorier() {
  kategoriliste.innerHTML = "";
  statusMessage.textContent = "Henter kategorier …";
  retryButton.hidden = true;

  return fetch(endpoint)
    .then((res) => {
      if (!res.ok) throw new Error("Kategorierne kunne ikke hentes");
      return res.json();
    })
    .then(visData)
    .catch((error) => {
      statusMessage.textContent = "Kategorierne kunne ikke hentes. Prøv igen.";
      retryButton.hidden = false;
      console.error(error);
    });
}

function visData(json) {
  json.forEach((kategori) => {
    const billede = billeder[kategori.category];
    kategoriliste.innerHTML += `
      <a class="category-card">
        ${billede ? `<img src="https://kea-alt-del.dk/t7/images/webp/640/${billede}.webp" alt="" loading="lazy" />` : ""}
        <h3></h3>
        <span>Se produkter →</span>
      </a>`;

    // Navn og link sættes på det nye kort.
    const kort = kategoriliste.lastElementChild;
    kort.querySelector("h3").textContent = kategori.category;
    kort.href = "productlist.html?category=" + encodeURIComponent(kategori.category);
  });

  statusMessage.textContent = json.length ? "" : "Der er ingen kategorier endnu.";
  kategoriliste.querySelectorAll("img").forEach((image) => {
    image.addEventListener("error", () => { image.hidden = true; });
  });
}
