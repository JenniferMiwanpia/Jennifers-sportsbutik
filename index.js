const categoryList = document.querySelector("#categories");
const statusMessage = document.querySelector("#status");
const retryButton = document.querySelector("#retry");
const categoryImages = {
  Accessories: 1526,
  Apparel: 1644,
  Footwear: 1543,
  "Free Items": 10595,
  "Personal Care": 18441,
  "Sporting Goods": 1628,
};

retryButton.addEventListener("click", getCategories);
getCategories();

// Henter kategorierne fra API'et.
async function getCategories() {
  categoryList.replaceChildren();
  statusMessage.textContent = "Henter kategorier …";
  retryButton.hidden = true;

  try {
    const response = await fetch("https://kea-alt-del.dk/t7/api/categories", {
      signal: AbortSignal.timeout(20000),
    });
    if (!response.ok) throw new Error("Kategorierne kunne ikke hentes");

    const categories = await response.json();
    if (!Array.isArray(categories)) throw new Error("Ugyldige kategorier");

    categories.forEach(showCategory);
    statusMessage.textContent = categories.length ? "" : "Der er ingen kategorier endnu.";
  } catch (error) {
    statusMessage.textContent = "Kategorierne kunne ikke hentes. Prøv igen.";
    retryButton.hidden = false;
    console.error(error);
  }
}

// Kategoriens navn sendes med i linket til produktlisten.
function showCategory(item) {
  const link = document.createElement("a");
  link.className = "category-card";
  link.href = "productlist.html?" + new URLSearchParams({ category: item.category });

  const image = document.createElement("img");
  image.alt = "";
  image.loading = "lazy";
  image.addEventListener("error", () => { image.hidden = true; });
  if (categoryImages[item.category]) {
    image.src = "https://kea-alt-del.dk/t7/images/webp/640/" + categoryImages[item.category] + ".webp";
  }

  const heading = document.createElement("h3");
  heading.textContent = item.category;

  const arrow = document.createElement("span");
  arrow.textContent = "Se produkter →";

  link.append(image, heading, arrow);
  categoryList.append(link);
}
