let artworks = [];
let filteredArtworks = [];

const gallery = document.getElementById("gallery");
const count = document.getElementById("count");

const searchInput = document.getElementById("search");
const poetFilter = document.getElementById("poetFilter");
const artistFilter = document.getElementById("artistFilter");
const formatFilter = document.getElementById("formatFilter");


// ------------------------------------
// Load data
// ------------------------------------

fetch("artworks_final.json")
    .then(response => {
        if (!response.ok) {
            throw new Error("Could not load artworks_final.json");
        }

        return response.json();
    })
    .then(data => {

        artworks = data;
        filteredArtworks = [...artworks];

        populateFilters();
        renderGallery();

    })
    .catch(error => {

        console.error(error);

        gallery.innerHTML = `
            <div style="
                grid-column: 1 / -1;
                text-align: center;
                padding: 50px;
                color: #900;
            ">
                خطا در بارگذاری آثار
            </div>
        `;
    });


// ------------------------------------
// Filters
// ------------------------------------

function populateFilters() {

    const poets = new Set();
    const artists = new Set();
    const formats = new Set();

    artworks.forEach(artwork => {

        (artwork.poets || []).forEach(item => poets.add(item));
        (artwork.calligraphers || []).forEach(item => artists.add(item));
        (artwork.formats || []).forEach(item => formats.add(item));

    });

    fillSelect(poetFilter, poets);
    fillSelect(artistFilter, artists);
    fillSelect(formatFilter, formats);
}


function fillSelect(select, values) {

    const sortedValues = [...values].sort((a, b) =>
        a.localeCompare(b, "fa")
    );

    sortedValues.forEach(value => {

        const option = document.createElement("option");

        option.value = value;
        option.textContent = value;

        select.appendChild(option);
    });
}


// ------------------------------------
// Search
// ------------------------------------

function applyFilters() {

    const query = normalize(searchInput.value);
    const poet = poetFilter.value;
    const artist = artistFilter.value;
    const format = formatFilter.value;

    filteredArtworks = artworks.filter(artwork => {

        const searchableText = normalize([
            artwork.text || "",
            ...(artwork.poets || []),
            ...(artwork.calligraphers || []),
            ...(artwork.scripts || []),
            ...(artwork.formats || []),
            ...(artwork.techniques || []),
            ...(artwork.periods || []),
            ...(artwork.places || []),
            ...(artwork.other_tags || [])
        ].join(" "));

        const matchesSearch =
            !query || searchableText.includes(query);

        const matchesPoet =
            !poet ||
            (artwork.poets || []).includes(poet);

        const matchesArtist =
            !artist ||
            (artwork.calligraphers || []).includes(artist);

        const matchesFormat =
            !format ||
            (artwork.formats || []).includes(format);

        return (
            matchesSearch &&
            matchesPoet &&
            matchesArtist &&
            matchesFormat
        );
    });

    renderGallery();
}


function normalize(text) {

    return String(text)
        .toLowerCase()
        .replace(/ي/g, "ی")
        .replace(/ى/g, "ی")
        .replace(/ك/g, "ک")
        .replace(/\u200c/g, " ")
        .trim();
}


// ------------------------------------
// Render gallery
// ------------------------------------

function renderGallery() {

    gallery.innerHTML = "";

    count.textContent =
        `تعداد آثار: ${filteredArtworks.length.toLocaleString("fa-IR")}`;

    if (filteredArtworks.length === 0) {

        gallery.innerHTML = `
            <div style="
                grid-column: 1 / -1;
                text-align: center;
                padding: 60px 20px;
                color: #777;
            ">
                اثری با این مشخصات پیدا نشد.
            </div>
        `;

        return;
    }

    filteredArtworks.forEach(artwork => {

        const card = createArtworkCard(artwork);

        gallery.appendChild(card);
    });
}


// ------------------------------------
// Artwork card
// ------------------------------------

function createArtworkCard(artwork) {

    const card = document.createElement("article");

    card.className = "artwork-card";


    // Thumbnail
    const image = document.createElement("img");

    image.src = artwork.thumbnail || artwork.high_res || "";

    image.alt =
        artwork.calligraphers?.length
            ? `اثر ${artwork.calligraphers.join("، ")}`
            : "اثر خوشنویسی";

    image.loading = "lazy";

    image.onerror = function () {

        this.style.display = "none";
    };


    // Information container
    const info = document.createElement("div");

    info.className = "artwork-info";


    // Text
    const title = document.createElement("h3");

    title.textContent = makePreviewText(
        artwork.poem_text || artwork.text || ""
    );

    info.appendChild(title);


    // Poet
    if (artwork.poets && artwork.poets.length) {

        const poet = document.createElement("p");

        poet.innerHTML =
            `<strong>شاعر:</strong> ${escapeHTML(
                artwork.poets.join("، ")
            )}`;

        info.appendChild(poet);
    }


    // Calligrapher
    if (
        artwork.calligraphers &&
        artwork.calligraphers.length
    ) {

        const artist = document.createElement("p");

        artist.innerHTML =
            `<strong>خوشنویس:</strong> ${escapeHTML(
                artwork.calligraphers.join("، ")
            )}`;

        info.appendChild(artist);
    }


    // Format
    if (
        artwork.formats &&
        artwork.formats.length
    ) {

        const format = document.createElement("p");

        format.innerHTML =
            `<strong>قالب:</strong> ${escapeHTML(
                artwork.formats.join("، ")
            )}`;

        info.appendChild(format);
    }


    // View button
    const buttonContainer =
        document.createElement("div");

    buttonContainer.className =
        "view-artwork";


    const button =
        document.createElement("button");

    button.textContent = "مشاهده اثر";

    button.addEventListener("click", () => {

        openArtwork(artwork);

    });


    buttonContainer.appendChild(button);

    info.appendChild(buttonContainer);

    card.appendChild(image);
    card.appendChild(info);

    return card;
}


// ------------------------------------
// Text preview
// ------------------------------------

function makePreviewText(text) {

    if (!text) {
        return "بدون توضیح";
    }

    const clean = String(text).trim();

    if (clean.length <= 100) {
        return clean;
    }

    return clean.substring(0, 100) + "…";
}


// ------------------------------------
// Artwork modal
// ------------------------------------

function openArtwork(artwork) {

    const modal =
        document.createElement("div");

    modal.className =
        "artwork-modal";


    const inner =
        document.createElement("div");

    inner.className =
        "modal-inner";


    // Close button
    const close =
        document.createElement("button");

    close.className =
        "modal-close";

    close.innerHTML = "×";

    close.onclick = () => {
        modal.remove();
    };


    // High resolution image
    const image =
        document.createElement("img");

    image.className =
        "high-res-image";

    image.src =
        artwork.high_res ||
        artwork.thumbnail ||
        "";

    image.alt =
        artwork.calligraphers?.join("، ") ||
        "اثر خوشنویسی";


    // Details
    const details =
        document.createElement("div");

    details.className =
        "modal-details";


    // Poem / text
    if (artwork.poem_text || artwork.text) {

        const poem =
            document.createElement("div");

        poem.className = "poem";

        poem.textContent =
            artwork.poem_text ||
            artwork.text;

        details.appendChild(poem);
    }


    // Poet
    if (artwork.poets?.length) {

        addDetail(
            details,
            "شاعر",
            artwork.poets.join("، ")
        );
    }


    // Calligrapher
    if (artwork.calligraphers?.length) {

        addDetail(
            details,
            "خوشنویس",
            artwork.calligraphers.join("، ")
        );
    }


    // Script
    if (artwork.scripts?.length) {

        addDetail(
            details,
            "خط",
            artwork.scripts.join("، ")
        );
    }


    // Format
    if (artwork.formats?.length) {

        addDetail(
            details,
            "قالب",
            artwork.formats.join("، ")
        );
    }


    // Period
    if (artwork.periods?.length) {

        addDetail(
            details,
            "دوره",
            artwork.periods.join("، ")
        );
    }


    // Source
    if (artwork.source) {

        addDetail(
            details,
            "منبع",
            artwork.source
        );
    }


    // Date
    if (artwork.date) {

        addDetail(
            details,
            "تاریخ ثبت",
            artwork.date
        );
    }


    inner.appendChild(close);
    inner.appendChild(image);
    inner.appendChild(details);

    modal.appendChild(inner);

    document.body.appendChild(modal);


    // Click outside modal to close
    modal.addEventListener("click", event => {

        if (event.target === modal) {
            modal.remove();
        }

    });


    // ESC to close
    document.addEventListener(
        "keydown",
        function escHandler(event) {

            if (event.key === "Escape") {

                modal.remove();

                document.removeEventListener(
                    "keydown",
                    escHandler
                );
            }

        }
    );
}


// ------------------------------------
// Detail helper
// ------------------------------------

function addDetail(container, label, value) {

    const p =
        document.createElement("p");

    p.innerHTML =
        `<strong>${escapeHTML(label)}:</strong> ${escapeHTML(value)}`;

    container.appendChild(p);
}


// ------------------------------------
// HTML escaping
// ------------------------------------

function escapeHTML(value) {

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


// ------------------------------------
// Event listeners
// ------------------------------------

searchInput.addEventListener(
    "input",
    applyFilters
);

poetFilter.addEventListener(
    "change",
    applyFilters
);

artistFilter.addEventListener(
    "change",
    applyFilters
);

formatFilter.addEventListener(
    "change",
    applyFilters
);