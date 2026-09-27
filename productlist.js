const productList = document.querySelector("#product-list");
const template = document.querySelector("#product-template");
const statusMessage = document.querySelector("#status");
const retryButton = document.querySelector("#retry");

// Kategorien kommer fra linket på forsiden. Uden link vises Accessories.
const category = new URLSearchParams(window.location.search).get("category") || "Accessories";
const endpoint = "https://kea-alt-del.dk/t7/api/products?" +
  new URLSearchParams({ category, limit: "30" });

document.title = category + " | Jennifers sportsbutik";
document.querySelector("#category-name").textContent = category;
document.querySelector("#collection-title").textContent = category;
document.querySelector("#intro-text").textContent = "Produkter i kategorien " + category + ".";

retryButton.addEventListener("click", getProducts);
getProducts();

// henter produkterne og viser dem på siden
async function getProducts() {
  productList.replaceChildren();
  productList.setAttribute("aria-busy", "true");
  statusMessage.textContent = "Henter produkter …";
  retryButton.hidden = true;

  try {
    const response = await fetch(endpoint, {
      signal: AbortSignal.timeout(20000),
    });

    if (!response.ok) {
      throw new Error("Produkterne kunne ikke hentes: " + response.status);
    }

    const products = await response.json();
    if (!Array.isArray(products)) {
      throw new Error("Ugyldig produktliste");
    }

    products.forEach(showProduct);
    statusMessage.textContent = products.length ? "" : "Der er ingen produkter at vise.";
  } catch (error) {
    statusMessage.textContent = "Produkterne kunne ikke hentes. Prøv igen.";
    retryButton.hidden = false;
    console.error(error);
  } finally {
    productList.setAttribute("aria-busy", "false");
  }
}

// en kopi af templaten til hvert produkt
function showProduct(product) {
  const clone = template.content.cloneNode(true);
  const displayName = product.productdisplayname;

  clone.querySelector(".product-name").textContent = displayName;
  clone.querySelector(".product-brand").textContent = product.brandname + " · " + product.articletype;
  clone.querySelector(".product-price").textContent =
    "Pris: " +
    Number(product.price).toLocaleString("da-DK", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  // Sender produktets id og den valgte kategori med til detaljesiden.
  clone.querySelector(".product-link").href = "productdetails.html?" +
    new URLSearchParams({ id: product.id, category });

  const image = clone.querySelector("img");
  const fallback = clone.querySelector(".image-fallback");

  image.alt = displayName;
  image.addEventListener("error", () => {
    image.hidden = true;
    fallback.hidden = false;
  });

  image.src = "https://kea-alt-del.dk/t7/images/webp/640/" + product.id + ".webp";
  productList.append(clone);
}
