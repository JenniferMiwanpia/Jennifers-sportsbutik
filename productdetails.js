// Id'et kommer fra det produkt, man klikker på i listen.
const params = new URLSearchParams(window.location.search);
const id = params.get("id");
const cat = params.get("category");
const endpoint = "https://kea-alt-del.dk/t7/api/products/" + encodeURIComponent(id);
const produktKort = document.querySelector("#product");
const statusMessage = document.querySelector("#status");
const retryButton = document.querySelector("#retry");

// Tilbage-linket husker den valgte kategori.
document.querySelector(".back-link").href = cat
  ? "productlist.html?category=" + encodeURIComponent(cat)
  : "productlist.html";

const farver = {
  "Silver-Black": "sølvfarvet og sort",
  "Blue-Black": "blå og sort",
  "Navy Blue": "mørkeblå",
  "Marine Blue": "mørkeblå",
  Black: "sort", White: "hvid", Blue: "blå", Red: "rød", Orange: "orange",
  Green: "grøn", Pink: "pink", Grey: "grå", Purple: "lilla",
  Beige: "beige", Brown: "brun",
};
const typer = {
  Backpacks: "rygsæk", Caps: "kasket",
  "Water Bottle": "drikkedunk", Handbags: "taske",
};
const koen = { Men: "Herre", Women: "Dame", Unisex: "Unisex" };

retryButton.addEventListener("click", hentProdukt);
hentProdukt();

// Henter ét produkt, så her bruges ingen forEach.
function hentProdukt() {
  if (!id) {
    statusMessage.textContent = "Vælg et produkt fra produktlisten.";
    return;
  }

  produktKort.hidden = true;
  retryButton.hidden = true;
  statusMessage.textContent = "Henter produkt …";

  return fetch(endpoint)
    .then((res) => {
      if (!res.ok) throw new Error("Produktet kunne ikke hentes");
      return res.json();
    })
    .then(visProdukt)
    .catch((error) => {
      statusMessage.textContent = "Produktet kunne ikke hentes. Prøv igen.";
      retryButton.hidden = false;
      console.error(error);
    });
}

function visProdukt(produkt) {
  const tilbudspris = Math.round(produkt.price - produkt.price * produkt.discount / 100);
  let farve = farver[produkt.basecolour] || produkt.basecolour || "";
  let type = typer[produkt.articletype] || produkt.articletype || "produkt";
  const navn = produkt.productdisplayname.toLowerCase();

  // De særlige farvenavne og badehætten oversættes også.
  if (navn.includes("navy blue") || navn.includes("marine blue")) farve = "mørkeblå";
  if (navn.includes("silver-black")) farve = "sølvfarvet og sort";
  if (navn.includes("blue-black")) farve = "blå og sort";
  if (navn.includes("swimming cap")) type = "badehætte";

  // Bruger kun et materiale, som faktisk står i API'et.
  const materialetekst = ((produkt.materialcaredesc || "") + " " + (produkt.description || "")).toLowerCase();
  let materiale = "";
  if (materialetekst.includes("polyester")) materiale = "polyester";
  else if (materialetekst.includes("nylon")) materiale = "nylon";
  else if (materialetekst.includes("polyamide")) materiale = "polyamid";
  else if (materialetekst.includes("silicone")) materiale = "silikone";
  else if (materialetekst.includes("cotton")) materiale = "bomuld";

  let beskrivelse = farve ? "Farve: " + farve : type;
  if (materiale) beskrivelse += " · " + materiale;

  produktKort.className = "detail-grid " + (produkt.soldout ? "udsolgt" : "");
  produktKort.innerHTML = `
    <div class="product-image">
      <img id="product-image" src="https://kea-alt-del.dk/t7/images/webp/640/${Number(produkt.id)}.webp"
        alt="" width="640" height="854" />
      <span id="image-fallback" hidden>Billede mangler</span>
      <div class="product-labels">
        ${produkt.discount ? `<span id="discount-label" class="discount-label">Tilbud · -${Number(produkt.discount)}%</span>` : ""}
        ${produkt.soldout ? '<span id="soldout-label" class="soldout-label">Udsolgt</span>' : ""}
      </div>
    </div>
    <div class="detail-info">
      <p id="brand" class="eyebrow"></p>
      <h1 id="product-name"></h1>
      <div class="price">
        <p id="price" class="${produkt.discount ? "sale-price" : ""}">
          ${produkt.discount ? "Nu: " + tilbudspris : "Pris: " + Math.round(produkt.price)}
        </p>
        ${produkt.discount ? `<p id="old-price" class="product-old-price">Før: <del>${Math.round(produkt.price)}</del></p>` : ""}
      </div>
      <dl>
        <div><dt>Type</dt><dd id="type"></dd></div>
        <div><dt>Farve</dt><dd id="colour"></dd></div>
        <div><dt>Køn</dt><dd id="gender"></dd></div>
        <div><dt>Produktnummer</dt><dd id="product-id"></dd></div>
      </dl>
      <section id="description-section">
        <h2>Om produktet</h2>
        <p id="description"></p>
      </section>
    </div>`;

  // API'ets tekst fyldes ind i de tomme felter.
  document.title = produkt.productdisplayname + " | Jennifers sportsbutik";
  produktKort.querySelector("#brand").textContent = produkt.brandname;
  produktKort.querySelector("#product-name").textContent = produkt.productdisplayname;
  produktKort.querySelector("#type").textContent = type;
  produktKort.querySelector("#colour").textContent = farve || "–";
  produktKort.querySelector("#gender").textContent = koen[produkt.gender] || produkt.gender || "–";
  produktKort.querySelector("#product-id").textContent = produkt.id;
  produktKort.querySelector("#description").textContent = beskrivelse;

  const image = produktKort.querySelector("#product-image");
  image.alt = produkt.productdisplayname;
  image.addEventListener("error", () => {
    image.hidden = true;
    produktKort.querySelector("#image-fallback").hidden = false;
  });

  statusMessage.textContent = "";
  produktKort.hidden = false;
}
