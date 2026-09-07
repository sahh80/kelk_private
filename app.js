let artworks = [];
let filteredArtworks = [];

let currentLanguage = "fa";

const gallery = document.getElementById("gallery");
const count = document.getElementById("count");

const searchInput = document.getElementById("search");
const poetFilter = document.getElementById("poetFilter");
const artistFilter = document.getElementById("artistFilter");
const formatFilter = document.getElementById("formatFilter");
const languageToggle = document.getElementById("languageToggle");


/* =========================================
   Format labels
========================================= */

const formatLabels = {
    "Satr": "سطر",
    "Chalipa": "چلیپا",
    "Siyah Mashq": "سیاه‌مشق",
    "Daftari": "دفتری",
    "Qet'e": "قطعه",
    "Shekasteh": "شکسته",
    "Nasta'liq": "نستعلیق",
    "Shekasteh-Nasta'liq": "شکسته‌نستعلیق",
    "Mofradat": "مفردات",
    "Tarkib": "ترکیب",
    "Jali": "جلی"
};

const formatLabelsEnglish = {
    "Satr": "Satr",
    "Chalipa": "Chalipa",
    "Siyah Mashq": "Siyah Mashq",
    "Daftari": "Daftari",
    "Qet'e": "Qet'e",
    "Shekasteh": "Shekasteh",
    "Nasta'liq": "Nasta'liq",
    "Shekasteh-Nasta'liq": "Shekasteh-Nasta'liq",
    "Mofradat": "Mofradat",
    "Tarkib": "Tarkib",
    "Jali": "Jali"
};


/* =========================================
   Script labels
========================================= */

const scriptLabels = {
    "Nasta'liq": "نستعلیق",
    "Shekasteh": "شکسته",
    "Shikasteh": "شکسته",
    "Shekasteh-Nasta'liq": "شکسته‌نستعلیق"
};


/* =========================================
   Load data
========================================= */

fetch("artworks_final.json?t=" + Date.now())
    .then(response => {

        if (!response.ok) {
            throw new Error("Could not load artworks_final.json");
        }

        return response.json();
    })
    .then(data => {

        artworks = Array.isArray(data) ? data : [];

        filteredArtworks = [...artworks];

        populateFilters();
        renderGallery();
    })
    .catch(error => {

        console.error(error);

        gallery.innerHTML = `
            <div class="load-error">
                خطا در بارگذاری آثار
            </div>
        `;
    });


/* =========================================
   Counts
========================================= */

function getCounts(field) {

    const counts = new Map();

    artworks.forEach(artwork => {

        const values = artwork[field] || [];

        values.forEach(value => {

            if (!value) return;

            counts.set(
                value,
                (counts.get(value) || 0) + 1
            );
        });
    });

    return counts;
}


/* =========================================
   Filters
   Sorted by number of artworks
========================================= */

function populateFilters() {

    fillSelect(
        poetFilter,
        getCounts("poets"),
        currentLanguage === "fa"
            ? "همه شاعران"
            : "All poets"
    );

    fillSelect(
        artistFilter,
        getCounts("calligraphers"),
        currentLanguage === "fa"
            ? "همه خوشنویسان"
            : "All calligraphers"
    );

    fillSelect(
        formatFilter,
        getCounts("formats"),
        currentLanguage === "fa"
            ? "همه قالب‌ها"
            : "All formats",
        true
    );
}


function fillSelect(
    select,
    counts,
    defaultLabel,
    translateFormats = false
) {

    select.innerHTML = "";

    const defaultOption =
        document.createElement("option");

    defaultOption.value = "";
    defaultOption.textContent = defaultLabel;

    select.appendChild(defaultOption);

    const values =
        [...counts.entries()]
            .sort((a, b) => {

                if (b[1] !== a[1]) {
                    return b[1] - a[1];
                }

                return a[0].localeCompare(
                    b[0],
                    "fa"
                );
            });

    values.forEach(([value, count]) => {

        const option =
            document.createElement("option");

        option.value = value;

        let label = value;

        if (translateFormats) {

            label =
                currentLanguage === "fa"
                    ? (formatLabels[value] || value)
                    : (formatLabelsEnglish[value] || value);
        }

        option.textContent =
            `${label} (${count})`;

        select.appendChild(option);
    });
}


/* =========================================
   Search
========================================= */

function applyFilters() {

    const query =
        normalize(searchInput.value);

    const poet =
        poetFilter.value;

    const artist =
        artistFilter.value;

    const format =
        formatFilter.value;


    filteredArtworks =
        artworks.filter(artwork => {

            const searchableText =
                normalize([

                    artwork.poem_text || "",
                    artwork.text || "",
                    artwork.description || "",

                    ...(artwork.poets || []),
                    ...(artwork.calligraphers || []),
                    ...(artwork.scripts || []),
                    ...(artwork.formats || []),
                    ...(artwork.techniques || []),
                    ...(artwork.periods || []),
                    ...(artwork.places || []),
                    ...(artwork.other_tags || []),

                    artwork.year || "",
                    artwork.poem_source || "",
                    artwork.image_source || "",
                    artwork.additional_source || ""

                ].join(" "));


            const matchesSearch =
                !query ||
                searchableText.includes(query);


            const matchesPoet =
                !poet ||
                (artwork.poets || [])
                    .includes(poet);


            const matchesArtist =
                !artist ||
                (artwork.calligraphers || [])
                    .includes(artist);


            const matchesFormat =
                !format ||
                (artwork.formats || [])
                    .includes(format);


            return (
                matchesSearch &&
                matchesPoet &&
                matchesArtist &&
                matchesFormat
            );
        });


    renderGallery();
}


/* =========================================
   Persian normalization
========================================= */

function normalize(text) {

    return String(text)

        .toLowerCase()

        .replace(/ي/g, "ی")
        .replace(/ى/g, "ی")
        .replace(/ك/g, "ک")

        .replace(/\u200c/g, " ")

        .replace(/\s+/g, " ")

        .trim();
}


/* =========================================
   Gallery
========================================= */

function renderGallery() {

    gallery.innerHTML = "";

    count.textContent =
        currentLanguage === "fa"

            ? `تعداد آثار: ${filteredArtworks.length.toLocaleString("fa-IR")}`

            : `Artworks: ${filteredArtworks.length.toLocaleString("en-US")}`;


    if (filteredArtworks.length === 0) {

        gallery.innerHTML = `
            <div class="no-results">
                ${
                    currentLanguage === "fa"
                        ? "اثری با این مشخصات پیدا نشد."
                        : "No artworks found."
                }
            </div>
        `;

        return;
    }


    filteredArtworks.forEach(artwork => {

        gallery.appendChild(
            createArtworkCard(artwork)
        );
    });
}


/* =========================================
   Artwork card
========================================= */

function createArtworkCard(artwork) {

    const card =
        document.createElement("article");

    card.className =
        "artwork-card";


    const image =
        document.createElement("img");

    image.src =
        artwork.thumbnail ||
        artwork.high_res ||
        "";

    image.alt =
        artwork.calligraphers?.length
            ? artwork.calligraphers.join("، ")
            : "Persian calligraphy";

    image.loading = "lazy";

    image.onerror = function () {
        this.style.display = "none";
    };


    const info =
        document.createElement("div");

    info.className =
        "artwork-info";


    const title =
        document.createElement("h3");

    title.textContent =
        makePreviewText(
            artwork.poem_text ||
            artwork.text ||
            ""
        );

    info.appendChild(title);


    if (artwork.poets?.length) {

        addCardDetail(
            info,
            currentLanguage === "fa"
                ? "شاعر"
                : "Poet",
            artwork.poets.join("، ")
        );
    }


    if (artwork.calligraphers?.length) {

        addCardDetail(
            info,
            currentLanguage === "fa"
                ? "خوشنویس"
                : "Calligrapher",
            artwork.calligraphers.join("، ")
        );
    }


    if (artwork.formats?.length) {

        const formats =
            artwork.formats
                .map(format =>

                    currentLanguage === "fa"
                        ? (formatLabels[format] || format)
                        : (formatLabelsEnglish[format] || format)

                )
                .join("، ");


        addCardDetail(
            info,
            currentLanguage === "fa"
                ? "قالب"
                : "Format",
            formats
        );
    }


    if (artwork.year) {

        addCardDetail(
            info,
            currentLanguage === "fa"
                ? "سال"
                : "Year",
            artwork.year
        );
    }


    const buttonContainer =
        document.createElement("div");

    buttonContainer.className =
        "view-artwork";


    const button =
        document.createElement("button");

    button.textContent =
        currentLanguage === "fa"
            ? "مشاهده اثر"
            : "View artwork";

    button.onclick =
        () => openArtwork(artwork);

    buttonContainer.appendChild(button);

    info.appendChild(buttonContainer);

    card.appendChild(image);
    card.appendChild(info);

    return card;
}


/* =========================================
   Card detail
========================================= */

function addCardDetail(
    container,
    label,
    value
) {

    const p =
        document.createElement("p");

    p.innerHTML =
        `<strong>${escapeHTML(label)}:</strong>
         ${escapeHTML(value)}`;

    container.appendChild(p);
}


/* =========================================
   Preview
========================================= */

function makePreviewText(text) {

    if (!text) {

        return currentLanguage === "fa"
            ? "بدون توضیح"
            : "No description";
    }

    const clean =
        String(text).trim();

    if (clean.length <= 100) {
        return clean;
    }

    return clean.substring(0, 100) + "…";
}


/* =========================================
   Artwork modal
========================================= */

function openArtwork(artwork) {

    const modal =
        document.createElement("div");

    modal.className =
        "artwork-modal";


    const inner =
        document.createElement("div");

    inner.className =
        "modal-inner";


    const close =
        document.createElement("button");

    close.className =
        "modal-close";

    close.innerHTML = "×";

    close.onclick =
        () => modal.remove();


    const image =
        document.createElement("img");

    image.className =
        "high-res-image";

    image.src =
        artwork.high_res ||
        artwork.thumbnail ||
        "";

    image.alt =
        artwork.calligraphers?.join("، ")
        || "Persian calligraphy";


    const details =
        document.createElement("div");

    details.className =
        "modal-details";


    /* Poem */

    if (
        artwork.poem_text ||
        artwork.text
    ) {

        const poem =
            document.createElement("div");

        poem.className =
            "poem";

        poem.textContent =
            artwork.poem_text ||
            artwork.text;

        details.appendChild(poem);
    }


    /* Poet */

    if (artwork.poets?.length) {

        addDetail(
            details,
            currentLanguage === "fa"
                ? "شاعر"
                : "Poet",
            artwork.poets.join("، ")
        );
    }


    /* Calligrapher */

    if (artwork.calligraphers?.length) {

        addDetail(
            details,
            currentLanguage === "fa"
                ? "خوشنویس"
                : "Calligrapher",
            artwork.calligraphers.join("، ")
        );
    }


    /* Script */

    if (artwork.scripts?.length) {

        const scripts =
            artwork.scripts
                .map(script =>

                    currentLanguage === "fa"
                        ? (scriptLabels[script] || script)
                        : script

                )
                .join("، ");

        addDetail(
            details,
            currentLanguage === "fa"
                ? "خط"
                : "Script",
            scripts
        );
    }


    /* Format */

    if (artwork.formats?.length) {

        const formats =
            artwork.formats
                .map(format =>

                    currentLanguage === "fa"
                        ? (formatLabels[format] || format)
                        : (formatLabelsEnglish[format] || format)

                )
                .join("، ");

        addDetail(
            details,
            currentLanguage === "fa"
                ? "قالب"
                : "Format",
            formats
        );
    }


    /* Year */

    if (artwork.year) {

        addDetail(
            details,
            currentLanguage === "fa"
                ? "سال"
                : "Year",
            artwork.year
        );
    }


    /* Period */

    if (artwork.periods?.length) {

        addDetail(
            details,
            currentLanguage === "fa"
                ? "دوره"
                : "Period",
            artwork.periods.join("، ")
        );
    }


    /* Poem source */

    if (artwork.poem_source) {

        addSourceDetail(
            details,
            currentLanguage === "fa"
                ? "منبع شعر"
                : "Poem source",
            artwork.poem_source
        );
    }


    /* Image source */

    if (artwork.image_source) {

        addSourceDetail(
            details,
            currentLanguage === "fa"
                ? "منبع عکس"
                : "Image source",
            artwork.image_source
        );
    }


    /* Additional source */

    if (artwork.additional_source) {

        addSourceDetail(
            details,
            currentLanguage === "fa"
                ? "منبع اضافه"
                : "Additional source",
            artwork.additional_source
        );
    }


    /* Description */

    if (artwork.description) {

        addDetail(
            details,
            currentLanguage === "fa"
                ? "توضیحات"
                : "Description",
            artwork.description
        );
    }


    /* Date */

    if (artwork.date) {

        addDetail(
            details,
            currentLanguage === "fa"
                ? "تاریخ ثبت"
                : "Date",
            artwork.date
        );
    }


    inner.appendChild(close);
    inner.appendChild(image);
    inner.appendChild(details);

    modal.appendChild(inner);

    document.body.appendChild(modal);


    modal.addEventListener(
        "click",
        event => {

            if (event.target === modal) {
                modal.remove();
            }
        }
    );


    function escHandler(event) {

        if (event.key === "Escape") {

            modal.remove();

            document.removeEventListener(
                "keydown",
                escHandler
            );
        }
    }

    document.addEventListener(
        "keydown",
        escHandler
    );
}


/* =========================================
   Detail
========================================= */

function addDetail(
    container,
    label,
    value
) {

    const p =
        document.createElement("p");

    p.innerHTML =
        `<strong>${escapeHTML(label)}:</strong>
         ${escapeHTML(value)}`;

    container.appendChild(p);
}


/* =========================================
   Source detail
========================================= */

function addSourceDetail(
    container,
    label,
    value
) {

    const p =
        document.createElement("p");

    const strong =
        document.createElement("strong");

    strong.textContent =
        `${label}:`;

    p.appendChild(strong);
    p.appendChild(
        document.createTextNode(" ")
    );


    const valueString =
        String(value).trim();


    if (
        /^https?:\/\//i.test(valueString)
    ) {

        const link =
            document.createElement("a");

        link.className =
            "source-link";

        link.href =
            valueString;

        link.target =
            "_blank";

        link.rel =
            "noopener noreferrer";

        link.textContent =
            currentLanguage === "fa"
                ? "مشاهده منبع"
                : "Open source";

        p.appendChild(link);

    } else {

        p.appendChild(
            document.createTextNode(
                valueString
            )
        );
    }


    container.appendChild(p);
}


/* =========================================
   HTML escape
========================================= */

function escapeHTML(value) {

    return String(value)

        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


/* =========================================
   Language
========================================= */

function updateLanguage() {

    const elements =
        document.querySelectorAll(
            "[data-fa]"
        );


    elements.forEach(element => {

        element.textContent =
            currentLanguage === "fa"
                ? element.dataset.fa
                : element.dataset.en;
    });


    document.documentElement.lang =
        currentLanguage;

    document.documentElement.dir =
        currentLanguage === "fa"
            ? "rtl"
            : "ltr";


    searchInput.placeholder =
        currentLanguage === "fa"

            ? "جستجو در شعر، شاعر، خوشنویس، خط و قالب..."

            : "Search poems, poets, calligraphers, scripts and formats...";


    languageToggle.textContent =
        currentLanguage === "fa"
            ? "English"
            : "فارسی";


    populateFilters();
    renderGallery();
}


/* =========================================
   Events
========================================= */

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

languageToggle.addEventListener(
    "click",
    () => {

        currentLanguage =
            currentLanguage === "fa"
                ? "en"
                : "fa";

        updateLanguage();
    }
);