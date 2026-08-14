let artworks = [];

const gallery = document.getElementById("gallery");
const search = document.getElementById("search");
const poetFilter = document.getElementById("poetFilter");
const artistFilter = document.getElementById("artistFilter");
const formatFilter = document.getElementById("formatFilter");
const count = document.getElementById("count");

// اضافه کردن فیلتر خط
const filtersContainer = document.querySelector(".filters");

const scriptFilter = document.createElement("select");
scriptFilter.id = "scriptFilter";
scriptFilter.innerHTML = `<option value="">همه خطوط</option>`;
filtersContainer.appendChild(scriptFilter);


// --------------------------------------------------
// Load JSON
// --------------------------------------------------

fetch("artworks_final.json")
    .then(response => {
        if (!response.ok) {
            throw new Error(
                `Could not load artworks_final.json (${response.status})`
            );
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
            <div style="padding:30px;text-align:center">
                <h3>خطا در بارگذاری اطلاعات</h3>
                <p>فایل artworks_final.json پیدا نشد.</p>
            </div>
        `;
    });


// --------------------------------------------------
// Get unique values
// --------------------------------------------------

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


// --------------------------------------------------
// Populate filters
// --------------------------------------------------

function populateFilters() {

    addOptions(poetFilter, uniqueValues("poets"));
    addOptions(artistFilter, uniqueValues("calligraphers"));
    addOptions(formatFilter, uniqueValues("formats"));
    addOptions(scriptFilter, uniqueValues("scripts"));
}


function addOptions(select, values) {

    values.forEach(value => {

        const option = document.createElement("option");

        option.value = value;
        option.textContent = value;

        select.appendChild(option);
    });
}


// --------------------------------------------------
// Search
// --------------------------------------------------

function render() {

    const query = search.value.trim().toLowerCase();

    const selectedPoet = poetFilter.value;
    const selectedArtist = artistFilter.value;
    const selectedFormat = formatFilter.value;
    const selectedScript = scriptFilter.value;


    const filtered = artworks.filter(item => {

        // تمام اطلاعات قابل جستجو
        const searchable = [

            item.text || "",

            ...(item.poets || []),
            ...(item.calligraphers || []),
            ...(item.scripts || []),
            ...(item.formats || []),
            ...(item.techniques || []),
            ...(item.periods || []),
            ...(item.places || []),
            ...(item.other_tags || []),
            ...(item.files || [])

        ].join(" ").toLowerCase();


        const matchesSearch =
            !query ||
            searchable.includes(query);


        const matchesPoet =
            !selectedPoet ||
            (item.poets || []).includes(selectedPoet);


        const matchesArtist =
            !selectedArtist ||
            (item.calligraphers || []).includes(selectedArtist);


        const matchesFormat =
            !selectedFormat ||
            (item.formats || []).includes(selectedFormat);


        const matchesScript =
            !selectedScript ||
            (item.scripts || []).includes(selectedScript);


        return (
            matchesSearch &&
            matchesPoet &&
            matchesArtist &&
            matchesFormat &&
            matchesScript
        );
    });


    count.textContent =
        `${filtered.length.toLocaleString("fa-IR")} اثر`;


    gallery.innerHTML = "";


    filtered.forEach(item => {

        const card = document.createElement("article");
        card.className = "card";


        // پیدا کردن اولین تصویر
        const image = (item.files || []).find(file =>
            /\.(jpg|jpeg|png|gif|webp|tif|tiff)$/i.test(file)
        );


        if (image) {

            const img = document.createElement("img");

            img.src = image;
            img.loading = "lazy";
            img.alt =
                (item.poets || []).join("، ") ||
                "اثر خوشنویسی";

            card.appendChild(img);
        }


        const content = document.createElement("div");
        content.className = "card-content";


        // متن اثر
        if (item.text) {

            const poem = document.createElement("div");

            poem.className = "poem";

            poem.textContent = item.text;

            content.appendChild(poem);
        }


        // اطلاعات اثر
        const metadata = document.createElement("div");
        metadata.className = "tags";


        const metaParts = [];


        if (item.poets?.length) {
            metaParts.push(
                "شاعر: " + item.poets.join("، ")
            );
        }


        if (item.calligraphers?.length) {
            metaParts.push(
                "خوشنویس: " +
                item.calligraphers.join("، ")
            );
        }


        if (item.scripts?.length) {
            metaParts.push(
                "خط: " +
                item.scripts.join("، ")
            );
        }


        if (item.formats?.length) {
            metaParts.push(
                "قالب: " +
                item.formats.join("، ")
            );
        }


        metadata.textContent =
            metaParts.join(" | ");


        content.appendChild(metadata);

        card.appendChild(content);

        gallery.appendChild(card);
    });
}


// --------------------------------------------------
// Events
// --------------------------------------------------

search.addEventListener("input", render);

poetFilter.addEventListener("change", render);

artistFilter.addEventListener("change", render);

formatFilter.addEventListener("change", render);

scriptFilter.addEventListener("change", render);