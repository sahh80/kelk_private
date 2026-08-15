const DATA_URL = "./artworks_final.json";

let artworks = [];
let filteredArtworks = [];

// ------------------------------------
// Load data
// ------------------------------------

async function loadArtworks() {
    try {
        const response = await fetch(DATA_URL);

        if (!response.ok) {
            throw new Error(
                `HTTP ${response.status}: ${response.statusText}`
            );
        }

        artworks = await response.json();
        filteredArtworks = [...artworks];

        console.log("Loaded artworks:", artworks.length);

        buildFilters();
        renderGallery();

    } catch (error) {

        console.error("ERROR loading artworks:", error);

        const gallery = document.getElementById("gallery");

        gallery.innerHTML = `
            <div style="padding:30px;text-align:center;">
                خطا در بارگذاری آرشیو
                <br><br>
                ${error.message}
            </div>
        `;
    }
}


// ------------------------------------
// Build filters
// ------------------------------------

function buildFilters() {

    buildSelect(
        "poetFilter",
        artworks.flatMap(a => a.poets || [])
    );

    buildSelect(
        "artistFilter",
        artworks.flatMap(a => a.calligraphers || [])
    );

    buildSelect(
        "formatFilter",
        artworks.flatMap(a => a.formats || [])
    );
}


function buildSelect(id, values) {

    const select = document.getElementById(id);

    if (!select) return;

    const uniqueValues = [
        ...new Set(
            values.filter(Boolean)
        )
    ].sort((a, b) =>
        a.localeCompare(b, "fa")
    );

    uniqueValues.forEach(value => {

        const option =
            document.createElement("option");

        option.value = value;
        option.textContent = value;

        select.appendChild(option);
    });
}


// ------------------------------------
// Search & filters
// ------------------------------------

function applyFilters() {

    const search =
        document
            .getElementById("search")
            .value
            .trim()
            .toLowerCase();

    const poet =
        document.getElementById("poetFilter").value;

    const artist =
        document.getElementById("artistFilter").value;

    const format =
        document.getElementById("formatFilter").value;


    filteredArtworks = artworks.filter(artwork => {

        const searchableText = [

            artwork.poem_text,
            artwork.description,
            artwork.source,

            ...(artwork.poets || []),
            ...(artwork.calligraphers || []),
            ...(artwork.scripts || []),
            ...(artwork.formats || []),
            ...(artwork.techniques || []),
            ...(artwork.periods || []),
            ...(artwork.places || []),
            ...(artwork.other_tags || [])

        ]
        .join(" ")
        .toLowerCase();


        const matchesSearch =
            !search ||
            searchableText.includes(search);


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


// ------------------------------------
// Render gallery
// ------------------------------------

function renderGallery() {

    const gallery =
        document.getElementById("gallery");

    const count =
        document.getElementById("count");


    gallery.innerHTML = "";

    count.textContent =
        `${filteredArtworks.length} اثر`;


    if (filteredArtworks.length === 0) {

        gallery.innerHTML = `
            <div style="padding:40px;text-align:center;">
                اثری پیدا نشد.
            </div>
        `;

        return;
    }


    filteredArtworks.forEach(artwork => {

        const card =
            document.createElement("article");

        card.className =
            "artwork-card";


        const image =
            document.createElement("img");

        image.src =
            artwork.thumbnail;

        image.alt =
            artwork.poem_text ||
            "اثر خوشنویسی";

        image.loading = "lazy";


        const info =
            document.createElement("div");

        info.className =
            "artwork-info";


        const title =
            artwork.poem_text
                ? artwork.poem_text.substring(0, 100)
                : "بدون عنوان";


        info.innerHTML = `

            <h3>
                ${escapeHTML(title)}
            </h3>

            ${
                artwork.poets?.length
                ?
                `<p><strong>شاعر:</strong>
                ${escapeHTML(
                    artwork.poets.join("، ")
                )}</p>`
                :
                ""
            }

            ${
                artwork.calligraphers?.length
                ?
                `<p><strong>خوشنویس:</strong>
                ${escapeHTML(
                    artwork.calligraphers.join("، ")
                )}</p>`
                :
                ""
            }

            ${
                artwork.formats?.length
                ?
                `<p><strong>قالب:</strong>
                ${escapeHTML(
                    artwork.formats.join("، ")
                )}</p>`
                :
                ""
            }

        `;


        card.appendChild(image);
        card.appendChild(info);


        card.addEventListener(
            "click",
            () => openArtwork(artwork)
        );


        gallery.appendChild(card);
    });
}


// ------------------------------------
// Artwork modal
// ------------------------------------

function openArtwork(artwork) {

    const modal =
        document.createElement("div");

    modal.className =
        "artwork-modal";


    modal.innerHTML = `

        <div class="modal-inner">

            <button
                class="modal-close"
                aria-label="بستن">
                ×
            </button>

            <img
                src="${artwork.high_res || artwork.thumbnail}"
                class="high-res-image"
                alt="اثر خوشنویسی">

            <div class="modal-details">

                ${
                    artwork.poem_text
                    ?
                    `<p class="poem">
                        ${escapeHTML(
                            artwork.poem_text
                        )}
                    </p>`
                    :
                    ""
                }

                ${
                    artwork.poets?.length
                    ?
                    `<p>
                        <strong>شاعر:</strong>
                        ${escapeHTML(
                            artwork.poets.join("، ")
                        )}
                    </p>`
                    :
                    ""
                }

                ${
                    artwork.calligraphers?.length
                    ?
                    `<p>
                        <strong>خوشنویس:</strong>
                        ${escapeHTML(
                            artwork.calligraphers.join("، ")
                        )}
                    </p>`
                    :
                    ""
                }

                ${
                    artwork.formats?.length
                    ?
                    `<p>
                        <strong>قالب:</strong>
                        ${escapeHTML(
                            artwork.formats.join("، ")
                        )}
                    </p>`
                    :
                    ""
                }

                ${
                    artwork.scripts?.length
                    ?
                    `<p>
                        <strong>خط:</strong>
                        ${escapeHTML(
                            artwork.scripts.join("، ")
                        )}
                    </p>`
                    :
                    ""
                }

                ${
                    artwork.periods?.length
                    ?
                    `<p>
                        <strong>دوره:</strong>
                        ${escapeHTML(
                            artwork.periods.join("، ")
                        )}
                    </p>`
                    :
                    ""
                }

                ${
                    artwork.source
                    ?
                    `<p>
                        <strong>منبع:</strong>
                        ${escapeHTML(
                            artwork.source
                        )}
                    </p>`
                    :
                    ""
                }

                ${
                    artwork.description
                    ?
                    `<p>
                        ${escapeHTML(
                            artwork.description
                        )}
                    </p>`
                    :
                    ""
                }

            </div>

        </div>
    `;


    document.body.appendChild(modal);


    modal
        .querySelector(".modal-close")
        .addEventListener(
            "click",
            () => modal.remove()
        );


    modal.addEventListener(
        "click",
        event => {

            if (event.target === modal) {
                modal.remove();
            }

        }
    );
}


// ------------------------------------
// HTML safety
// ------------------------------------

function escapeHTML(value) {

    if (value === null ||
        value === undefined) {
        return "";
    }

    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}


// ------------------------------------
// Start
// ------------------------------------

document.addEventListener(
    "DOMContentLoaded",
    () => {

        loadArtworks();

        document
            .getElementById("search")
            .addEventListener(
                "input",
                applyFilters
            );

        document
            .getElementById("poetFilter")
            .addEventListener(
                "change",
                applyFilters
            );

        document
            .getElementById("artistFilter")
            .addEventListener(
                "change",
                applyFilters
            );

        document
            .getElementById("formatFilter")
            .addEventListener(
                "change",
                applyFilters
            );
    }
);