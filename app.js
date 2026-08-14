const DATA_URL = "./artworks_final.json";

let artworks = [];
let filteredArtworks = [];

async function loadArtworks() {
    try {
        const response = await fetch(DATA_URL);

        if (!response.ok) {
            throw new Error("Could not load artworks_final.json");
        }

        artworks = await response.json();
        filteredArtworks = [...artworks];

        console.log("Artworks loaded:", artworks.length);

        buildFilters();
        renderArtworks();

    } catch (error) {
        console.error(error);

        const container = document.getElementById("artworks");
        if (container) {
            container.innerHTML =
                "<p>خطا در بارگذاری آرشیو.</p>";
        }
    }
}


// --------------------------------------------------
// کمک برای نمایش آرایه‌ها
// --------------------------------------------------

function listText(values) {
    if (!Array.isArray(values) || values.length === 0) {
        return "";
    }

    return values.join("، ");
}


// --------------------------------------------------
// ساخت فیلترها
// --------------------------------------------------

function buildFilters() {

    buildSelect("poetFilter", artworks.flatMap(x => x.poets || []));
    buildSelect("calligrapherFilter", artworks.flatMap(x => x.calligraphers || []));
    buildSelect("scriptFilter", artworks.flatMap(x => x.scripts || []));
    buildSelect("formatFilter", artworks.flatMap(x => x.formats || []));
    buildSelect("periodFilter", artworks.flatMap(x => x.periods || []));
}


function buildSelect(id, values) {

    const select = document.getElementById(id);

    if (!select) return;

    const unique = [...new Set(values)]
        .filter(Boolean)
        .sort((a, b) => a.localeCompare(b, "fa"));

    unique.forEach(value => {

        const option = document.createElement("option");

        option.value = value;
        option.textContent = value;

        select.appendChild(option);
    });
}


// --------------------------------------------------
// جست‌وجو
// --------------------------------------------------

function searchArtworks() {

    const searchInput =
        document.getElementById("search");

    const query =
        searchInput ?
        searchInput.value.trim().toLowerCase() :
        "";

    const poet =
        document.getElementById("poetFilter")?.value || "";

    const calligrapher =
        document.getElementById("calligrapherFilter")?.value || "";

    const script =
        document.getElementById("scriptFilter")?.value || "";

    const format =
        document.getElementById("formatFilter")?.value || "";

    const period =
        document.getElementById("periodFilter")?.value || "";


    filteredArtworks = artworks.filter(item => {

        const searchableText = [

            item.poem_text,
            item.description,
            item.source,

            ...(item.poets || []),
            ...(item.calligraphers || []),
            ...(item.scripts || []),
            ...(item.formats || []),
            ...(item.techniques || []),
            ...(item.periods || []),
            ...(item.places || []),
            ...(item.other_tags || [])

        ]
        .join(" ")
        .toLowerCase();


        const matchesSearch =
            !query ||
            searchableText.includes(query);


        const matchesPoet =
            !poet ||
            (item.poets || []).includes(poet);


        const matchesCalligrapher =
            !calligrapher ||
            (item.calligraphers || []).includes(calligrapher);


        const matchesScript =
            !script ||
            (item.scripts || []).includes(script);


        const matchesFormat =
            !format ||
            (item.formats || []).includes(format);


        const matchesPeriod =
            !period ||
            (item.periods || []).includes(period);


        return (
            matchesSearch &&
            matchesPoet &&
            matchesCalligrapher &&
            matchesScript &&
            matchesFormat &&
            matchesPeriod
        );
    });


    renderArtworks();
}


// --------------------------------------------------
// نمایش آثار
// --------------------------------------------------

function renderArtworks() {

    const container =
        document.getElementById("artworks");

    if (!container) return;

    container.innerHTML = "";

    if (filteredArtworks.length === 0) {

        container.innerHTML =
            "<p>اثری پیدا نشد.</p>";

        return;
    }


    filteredArtworks.forEach(item => {

        const card =
            document.createElement("article");

        card.className = "artwork-card";


        const image =
            document.createElement("img");

        image.src = item.thumbnail;

        image.alt =
            item.poem_text || "اثر خوشنویسی";

        image.loading = "lazy";


        const content =
            document.createElement("div");

        content.className =
            "artwork-content";


        const title =
            item.poem_text
            ? item.poem_text.substring(0, 90)
            : "بدون عنوان";


        content.innerHTML = `

            <h3>${escapeHtml(title)}</h3>

            <div class="metadata">

                ${meta("شاعر", listText(item.poets))}
                ${meta("خوشنویس", listText(item.calligraphers))}
                ${meta("خط", listText(item.scripts))}
                ${meta("قالب", listText(item.formats))}
                ${meta("دوره", listText(item.periods))}

            </div>

        `;


        card.appendChild(image);
        card.appendChild(content);


        card.addEventListener(
            "click",
            () => openArtwork(item)
        );


        container.appendChild(card);
    });
}


// --------------------------------------------------
// اطلاعات متادیتا
// --------------------------------------------------

function meta(label, value) {

    if (!value) return "";

    return `
        <div class="meta-row">
            <strong>${label}:</strong>
            <span>${escapeHtml(value)}</span>
        </div>
    `;
}


// --------------------------------------------------
// نمایش اثر در پنجره بزرگ
// --------------------------------------------------

function openArtwork(item) {

    let modal =
        document.getElementById("artworkModal");


    if (!modal) {

        modal =
            document.createElement("div");

        modal.id = "artworkModal";
        modal.className = "artwork-modal";

        document.body.appendChild(modal);
    }


    modal.innerHTML = `

        <div class="modal-content">

            <button
                class="modal-close"
                onclick="closeArtwork()">
                ×
            </button>

            <img
                class="high-res-image"
                src="${item.high_res || item.thumbnail}"
                alt="اثر خوشنویسی"
            >

            <div class="modal-info">

                <h2>
                    ${escapeHtml(
                        item.poem_text || "بدون عنوان"
                    )}
                </h2>

                ${meta("شاعر", listText(item.poets))}
                ${meta("خوشنویس", listText(item.calligraphers))}
                ${meta("خط", listText(item.scripts))}
                ${meta("قالب", listText(item.formats))}
                ${meta("دوره", listText(item.periods))}
                ${meta("منبع", item.source)}

                ${
                    item.description
                    ?
                    `<p>${escapeHtml(item.description)}</p>`
                    :
                    ""
                }

            </div>

        </div>

    `;


    modal.style.display = "flex";
}


function closeArtwork() {

    const modal =
        document.getElementById("artworkModal");

    if (modal) {
        modal.style.display = "none";
    }
}


// --------------------------------------------------
// امنیت / نمایش صحیح متن
// --------------------------------------------------

function escapeHtml(text) {

    if (!text) return "";

    return String(text)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}


// --------------------------------------------------
// شروع سایت
// --------------------------------------------------

document.addEventListener(
    "DOMContentLoaded",
    () => {

        loadArtworks();

        const search =
            document.getElementById("search");

        if (search) {

            search.addEventListener(
                "input",
                searchArtworks
            );
        }


        [
            "poetFilter",
            "calligrapherFilter",
            "scriptFilter",
            "formatFilter",
            "periodFilter"

        ].forEach(id => {

            const element =
                document.getElementById(id);

            if (element) {

                element.addEventListener(
                    "change",
                    searchArtworks
                );
            }
        });
    }
);