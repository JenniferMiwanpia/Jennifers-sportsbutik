// Kategorien kommer fra linket på forsiden.
const cat = new URLSearchParams(window.location.search).get("category") || "Accessories";
const endpoint = "https://kea-alt-del.dk/t7/api/products?" +
  new URLSearchParams({ category: cat, limit: "30" });
const produktliste = document.querySelector("#product-list");
const statusMessage = document.querySelector("#status");
const retryButton = document.querySelector("#retry");

document.title = cat + " | Jennifers sportsbutik";
document.querySelector("#category-name").textContent = cat;
document.querySelector("#collection-title").textContent = cat;
document.querySelector("#intro-text").textContent = "Produkter i kategorien " + cat + ".";

retryButton.addEventListener("click", hentProdukter);
hentProdukter();

// Henter data og sender dem videre til visData.
function hentProdukter() {
  produktliste.innerHTML = "";
  produktliste.setAttribute("aria-busy", "true");
  statusMessage.textContent = "Henter produkter …";
  retryButton.hidden = true;

  fetch(endpoint, { signal: AbortSignal.timeout(20000) })
    .then((res) => {
      if (!res.ok) {
        throw new Error("Produkterne kunne ikke hentes: " + res.status);
      }
      return res.json();
    })
    .then(visData)
    .catch((error) => {
      statusMessage.textContent = "Produkterne kunne ikke hentes. Prøv igen.";
      retryButton.hidden = false;
      console.error(error);
    })
    .finally(() => {
      produktliste.setAttribute("aria-busy", "false");
    });
}

// Laver HTML til hvert produkt, ligesom i undervisningen.
function visData(json) {
  if (!Array.isArray(json)) {
    throw new Error("Ugyldig produktliste");
  }

  json.forEach((produkt) => {
    const tilbudspris = produkt.price - produkt.price * produkt.discount / 100;
    const navn = escapeHTML(produkt.productdisplayname);
    const link = "productdetails.html?" + new URLSearchParams({ id: produkt.id, category: cat });

    produktliste.innerHTML += `
      <article class="product-card ${produkt.soldout ? "soldout" : ""}">
        <a class="product-link" href="${escapeHTML(link)}">
          <div class="product-image">
            <img src="https://kea-alt-del.dk/t7/images/webp/640/${Number(produkt.id)}.webp"
              alt="${navn}" width="640" height="854" loading="lazy" />
            <span class="image-fallback" hidden>Billede mangler</span>
            <div class="product-labels">
              ${produkt.discount ? `<span class="discount-label">Tilbud · -${Number(produkt.discount)}%</span>` : ""}
              ${produkt.soldout ? '<span class="soldout-label">Udsolgt</span>' : ""}
            </div>
          </div>
          <p class="product-brand">${escapeHTML(produkt.brandname)} · ${escapeHTML(produkt.articletype)}</p>
          <h3 class="product-name">${navn}</h3>
          <div class="product-bottom">
            <div class="product-prices">
              <p class="product-price ${produkt.discount ? "sale-price" : ""}">
                ${produkt.discount ? "Nu: " + formatPrice(tilbudspris) : "Pris: " + formatPrice(produkt.price)}
              </p>
              ${produkt.discount ? `<p class="product-old-price">Før: <del>${formatPrice(produkt.price)}</del></p>` : ""}
            </div>
            <span class="product-cta">Se produkt <span aria-hidden="true">↗</span></span>
          </div>
        </a>
      </article>`;
  });

  statusMessage.textContent = json.length ? "" : "Der er ingen produkter at vise.";

  // Viser en besked, hvis et billede ikke kan hentes.
  produktliste.querySelectorAll("img").forEach((image) => {
    image.addEventListener("error", () => {
      image.hidden = true;
      image.nextElementSibling.hidden = false;
    });
  });
}

function formatPrice(price) {
  return Number(price).toLocaleString("da-DK", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

// API'ets tekst skal vises som tekst, selv hvis den indeholder HTML-tegn.
function escapeHTML(text) {
  return String(text ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
