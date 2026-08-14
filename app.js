let artworks = [];

const gallery = document.getElementById("gallery");
const search = document.getElementById("search");
const poetFilter = document.getElementById("poetFilter");
const artistFilter = document.getElementById("artistFilter");
const formatFilter = document.getElementById("formatFilter");
const count = document.getElementById("count");

fetch("artworks_mvp.json")
    .then(response => response.json())
    .then(data => {
        artworks = data;
        populateFilters();
        render();
    })
    .catch(error => {
        gallery.innerHTML =
            "<p>خطا در بارگذاری اطلاعات آثار.</p>";
        console.error(error);
    });


function uniqueValues(field) {
    const values = [];

    artworks.forEach(item => {
        if (Array.isArray(item[field])) {
            item[field].forEach(value => {
                if (value && !values.includes(value)) {
                    values.push(value);
                }
            });
        }
    });

    return values.sort();
}


function populateFilters() {

    uniqueValues("poets").forEach(value => {
        poetFilter.innerHTML +=
            `<option value="${value}">${value}</option>`;
    });

    uniqueValues("artists").forEach(value => {
        artistFilter.innerHTML +=
            `<option value="${value}">${value}</option>`;
    });

    uniqueValues("format").forEach(value => {
        formatFilter.innerHTML +=
            `<option value="${value}">${value}</option>`;
    });
}


function render() {

    const query = search.value.trim().toLowerCase();
    const poet = poetFilter.value;
    const artist = artistFilter.value;
    const format = formatFilter.value;

    const filtered = artworks.filter(item => {

        const searchable = [
            item.text || "",
            ...(item.hashtags || []),
            ...(item.poets || []),
            ...(item.artists || []),
            ...(item.script || []),
            ...(item.format || [])
        ].join(" ").toLowerCase();

        return (
            (!query || searchable.includes(query)) &&
            (!poet || (item.poets || []).includes(poet)) &&
            (!artist || (item.artists || []).includes(artist)) &&
            (!format || (item.format || []).includes(format))
        );
    });

    count.textContent = `${filtered.length} اثر`;

    gallery.innerHTML = filtered.map(item => {

        const image =
            item.files && item.files.length
                ? item.files.find(f =>
                    /\.(jpg|jpeg|png|webp)$/i.test(f)
                  )
                : null;

        const imageUrl = image
            ? image
            : "";

        return `
            <article class="card">

                ${
                    imageUrl
                    ? `<img src="${imageUrl}" loading="lazy">`
                    : ""
                }

                <div class="card-content">

                    <div class="poem">
                        ${item.text || ""}
                    </div>

                    <div class="tags">
                        ${(item.poets || []).join(" · ")}
                        ${(item.artists || []).join(" · ")}
                        ${(item.format || []).join(" · ")}
                    </div>

                </div>

            </article>
        `;

    }).join("");
}


search.addEventListener("input", render);
poetFilter.addEventListener("change", render);
artistFilter.addEventListener("change", render);
formatFilter.addEventListener("change", render);