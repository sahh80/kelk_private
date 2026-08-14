let artworks = [];

const gallery = document.getElementById("gallery");
const search = document.getElementById("search");
const poetFilter = document.getElementById("poetFilter");
const artistFilter = document.getElementById("artistFilter");
const formatFilter = document.getElementById("formatFilter");
const count = document.getElementById("count");

const filtersContainer = document.querySelector(".filters");

const scriptFilter = document.createElement("select");
scriptFilter.id = "scriptFilter";
scriptFilter.innerHTML = `<option value="">همه خطوط</option>`;
filtersContainer.appendChild(scriptFilter);


// ================================
// Load data
// ================================

fetch("artworks_final_v4.json")
    .then(response => {
        if (!response.ok) {
            throw new Error(`JSON error: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        artworks = data;
        populateFilters();
        render();
    })
    .catch(error => {
        console.error(error);

        gallery.innerHTML = `
            <div class="error">
                <h3>خطا در بارگذاری آثار</h3>
                <p>فایل artworks_final_v4.json پیدا نشد.</p>
            </div>
        `;
    });


// ================================
// Filters
// ================================

function uniqueValues(field) {

    const values = new Set();

    artworks.forEach(item => {

        if (Array.isArray(item[field])) {

            item[field].forEach(value => {

                if (value) {
                    values.add(value);
                }

            });
        }
    });

    return [...values].sort((a, b) =>
        a.localeCompare(b, "fa")
    );
}


function addOptions(select, values) {

    values.forEach(value => {

        const option = document.createElement("option");

        option.value = value;
        option.textContent = value;

        select.appendChild(option);
    });
}


function populateFilters() {

    addOptions(poetFilter, uniqueValues("poets"));
    addOptions(artistFilter, uniqueValues("calligraphers"));
    addOptions(formatFilter, uniqueValues("formats"));
    addOptions(scriptFilter, uniqueValues("scripts"));
}


// ================================
// Render gallery
// ================================

function render() {

    const query = search.value.trim().toLowerCase();

    const selectedPoet = poetFilter.value;
    const selectedArtist = artistFilter.value;
    const selectedFormat = formatFilter.value;
    const selectedScript = scriptFilter.value;


    const filtered = artworks.filter(item => {

        const searchable = [

            item.text || "",

            ...(item.poets || []),
            ...(item.calligraphers || []),
            ...(item.scripts || []),
            ...(item.formats || []),
            ...(item.techniques || []),
            ...(item.periods || []),
            ...(item.places || []),
            ...(item.other_tags || [])

        ].join(" ").toLowerCase();


        return (

            (!query || searchable.includes(query)) &&

            (!selectedPoet ||
                (item.poets || []).includes(selectedPoet)) &&

            (!selectedArtist ||
                (item.calligraphers || []).includes(selectedArtist)) &&

            (!selectedFormat ||
                (item.formats || []).includes(selectedFormat)) &&

            (!selectedScript ||
                (item.scripts || []).includes(selectedScript))
        );
    });


    count.textContent =
        `${filtered.length.toLocaleString("fa-IR")} اثر`;

    gallery.innerHTML = "";


    filtered.forEach(item => {

        const card = document.createElement("article");

        card.className = "card artwork-card";


        // ----------------------------
        // Thumbnail
        // ----------------------------

        if (item.thumbnail) {

            const img = document.createElement("img");

            img.src = item.thumbnail;

            img.loading = "lazy";

            img.alt =
                item.poets?.length
                    ? `اثر خوشنویسی ${item.poets.join("، ")}`
                    : "اثر خوشنویسی";

            card.appendChild(img);
        }


        // ----------------------------
        // Card content
        // ----------------------------

        const content = document.createElement("div");

        content.className = "card-content";


        // شعر
        if (item.text) {

            const poem = document.createElement("div");

            poem.className = "poem";

            poem.textContent = item.text;

            content.appendChild(poem);
        }


        // اطلاعات
        const metadata = document.createElement("div");

        metadata.className = "metadata";


        if (item.poets?.length) {

            metadata.innerHTML +=
                `<div><strong>شاعر:</strong> ${item.poets.join("، ")}</div>`;
        }


        if (item.calligraphers?.length) {

            metadata.innerHTML +=
                `<div><strong>خوشنویس:</strong> ${item.calligraphers.join("، ")}</div>`;
        }


        if (item.scripts?.length) {

            metadata.innerHTML +=
                `<div><strong>خط:</strong> ${item.scripts.join("، ")}</div>`;
        }


        if (item.formats?.length) {

            metadata.innerHTML +=
                `<div><strong>قالب:</strong> ${item.formats.join("، ")}</div>`;
        }


        if (item.techniques?.length) {

            metadata.innerHTML +=
                `<div><strong>تکنیک:</strong> ${item.techniques.join("، ")}</div>`;
        }


        content.appendChild(metadata);


        // ----------------------------
        // High-res button
        // ----------------------------

        const button = document.createElement("button");

        button.className = "view-button";

        button.textContent = "مشاهده اثر";


        button.addEventListener("click", () => {

            openArtwork(item);

        });


        content.appendChild(button);

        card.appendChild(content);

        gallery.appendChild(card);

    });
}


// ================================
// Artwork viewer
// ================================

function openArtwork(item) {

    const overlay = document.createElement("div");

    overlay.className = "artwork-overlay";


    const viewer = document.createElement("div");

    viewer.className = "artwork-viewer";


    // Close
    const close = document.createElement("button");

    close.className = "close-viewer";

    close.textContent = "×";

    close.onclick = () => {
        overlay.remove();
    };


    viewer.appendChild(close);


    // High resolution image
    if (item.high_res) {

        const img = document.createElement("img");

        img.src = item.high_res;

        img.className = "high-res-image";

        img.alt = "تصویر با کیفیت اثر";

        viewer.appendChild(img);
    }


    // Information
    const info = document.createElement("div");

    info.className = "viewer-info";


    if (item.poets?.length) {
        info.innerHTML +=
            `<p><strong>شاعر:</strong> ${item.poets.join("، ")}</p>`;
    }


    if (item.calligraphers?.length) {
        info.innerHTML +=
            `<p><strong>خوشنویس:</strong> ${item.calligraphers.join("، ")}</p>`;
    }


    if (item.scripts?.length) {
        info.innerHTML +=
            `<p><strong>خط:</strong> ${item.scripts.join("، ")}</p>`;
    }


    if (item.formats?.length) {
        info.innerHTML +=
            `<p><strong>قالب:</strong> ${item.formats.join("، ")}</p>`;
    }


    if (item.text) {

        info.innerHTML += `
            <div class="viewer-poem">
                ${escapeHtml(item.text)}
            </div>
        `;
    }


    viewer.appendChild(info);

    overlay.appendChild(viewer);

    document.body.appendChild(overlay);


    // Close by clicking outside
    overlay.addEventListener("click", event => {

        if (event.target === overlay) {
            overlay.remove();
        }

    });


    // ESC
    document.addEventListener(
        "keydown",
        function escHandler(event) {

            if (event.key === "Escape") {

                overlay.remove();

                document.removeEventListener(
                    "keydown",
                    escHandler
                );
            }

        }
    );
}


// ================================
// Security helper
// ================================

function escapeHtml(text) {

    const div = document.createElement("div");

    div.textContent = text;

    return div.innerHTML;
}


// ================================
// Events
// ================================

search.addEventListener("input", render);

poetFilter.addEventListener("change", render);

artistFilter.addEventListener("change", render);

formatFilter.addEventListener("change", render);

scriptFilter.addEventListener("change", render);