// Kategorien kommer fra linket på forsiden.
const cat = new URLSearchParams(window.location.search).get("category") || "Accessories";
const endpoint = `https://kea-alt-del.dk/t7/api/products?category=${encodeURIComponent(cat)}&limit=30`;
const produktliste = document.querySelector("#product-list");
const statusMessage = document.querySelector("#status");
const retryButton = document.querySelector("#retry");
const visantal = document.querySelector("#antal");
const filtre = document.querySelector("#filtre");
let alleData = [];

document.title = cat + " | Jennifers sportsbutik";
document.querySelector("#category-name").textContent = cat;
document.querySelector("#collection-title").textContent = cat;
document.querySelector("#intro-text").textContent = "Produkter i kategorien " + cat + ".";

retryButton.addEventListener("click", hentProdukter);
document.querySelectorAll("#filtre button").forEach((button) => {
  button.addEventListener("click", filtrer);
});
hentProdukter();

// Henter produkterne og sender dem til visData.
function hentProdukter() {
  alleData = [];
  filtre.hidden = true;
  produktliste.innerHTML = "";
  visantal.textContent = "0 fundet";
  produktliste.setAttribute("aria-busy", "true");
  statusMessage.textContent = "Henter produkter …";
  retryButton.hidden = true;

  return fetch(endpoint)
    .then((res) => {
      if (!res.ok) throw new Error("Produkterne kunne ikke hentes");
      return res.json();
    })
    .then((data) => {
      alleData = data;
      visData(data);
      filtre.hidden = false;
    })
    .catch((error) => {
      statusMessage.textContent = "Produkterne kunne ikke hentes. Prøv igen.";
      retryButton.hidden = false;
      produktliste.setAttribute("aria-busy", "false");
      console.error(error);
    });
}

function visData(json) {
  produktliste.innerHTML = "";
  visantal.textContent = json.length + " fundet";
  json.forEach((produkt) => {
    // Rabatten trækkes fra, og prisen afrundes som i undervisningen.
    const tilbudspris = Math.round(produkt.price - produkt.price * produkt.discount / 100);

    produktliste.innerHTML += `
      <article class="product-card ${produkt.soldout ? "udsolgt" : ""}">
        <a class="product-link">
          <div class="product-image">
            <img src="https://kea-alt-del.dk/t7/images/webp/640/${Number(produkt.id)}.webp"
              alt="" width="640" height="854" loading="lazy" />
            <span class="image-fallback" hidden>Billede mangler</span>
            <div class="product-labels">
              ${produkt.discount ? `<span class="discount-label">Tilbud · -${Number(produkt.discount)}%</span>` : ""}
              ${produkt.soldout ? '<span class="soldout-label">Udsolgt</span>' : ""}
            </div>
          </div>
          <p class="product-brand"></p>
          <h3 class="product-name"></h3>
          <div class="product-bottom">
            <div class="product-prices">
              <p class="product-price ${produkt.discount ? "sale-price" : ""}">
                ${produkt.discount ? "Nu: " + tilbudspris : "Pris: " + Math.round(produkt.price)}
              </p>
              ${produkt.discount ? `<p class="product-old-price">Før: <del>${Math.round(produkt.price)}</del></p>` : ""}
            </div>
            <span class="product-cta">Se produkt <span aria-hidden="true">↗</span></span>
          </div>
        </a>
      </article>`;

    // Teksten og linket sættes ind i det nye produktkort.
    const kort = produktliste.lastElementChild;
    kort.querySelector(".product-name").textContent = produkt.productdisplayname;
    kort.querySelector(".product-brand").textContent = produkt.brandname + " · " + produkt.articletype;
    kort.querySelector("img").alt = produkt.productdisplayname;
    kort.querySelector(".product-link").href = "productdetails.html?id=" + encodeURIComponent(produkt.id) +
      "&category=" + encodeURIComponent(cat);
  });

  statusMessage.textContent = json.length ? "" : "Der er ingen produkter at vise.";
  produktliste.setAttribute("aria-busy", "false");

  // Viser en besked, hvis et billede ikke kan hentes.
  produktliste.querySelectorAll("img").forEach((image) => {
    image.addEventListener("error", () => {
      image.hidden = true;
      image.nextElementSibling.hidden = false;
    });
  });
}

// Knapperne vælger produkter efter køn.
function filtrer(event) {
  const valgt = event.target.textContent;
  document.querySelectorAll("#filtre button").forEach((button) => {
    button.setAttribute("aria-pressed", button === event.target ? "true" : "false");
  });

  if (valgt === "Alle") {
    visData(alleData);
  } else {
    visData(alleData.filter((produkt) => produkt.gender === valgt));
  }
}
