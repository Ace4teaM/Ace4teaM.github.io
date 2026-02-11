const items = document.querySelectorAll('[data-filter~="general"], [data-filter~="web"], [data-filter~="desktop"], [data-filter~="autom"]');
const { jsPDF } = window.jspdf;
let curCategory = "general";
console.log(items)
function download(blob, filename)
{
    // Créer une URL temporaire
    const url = URL.createObjectURL(blob);

    // Créer un lien invisible
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;

    // Déclencher le téléchargement
    a.click();

    // Nettoyage
    URL.revokeObjectURL(url);
}

function showHiddenData()
{
    document.body.click();
}

function getData()
{
    showHiddenData();

    return {
        name: document.querySelector("#name").innerText,
        title: document.querySelector("#title").innerText,
        email: document.querySelector("#email").innerText,
        phone: document.querySelector("#phone").innerText,
        location: document.querySelector("#location").innerText,

        hardkills: Array.from(document.querySelectorAll("#hardkills li span:not(.hidden)")).map(span => span.innerText.trim()),
        softkills: Array.from(document.querySelectorAll("#softkills li:not(.hidden)")).map(span => span.innerText.trim()),

        experience: Array.from(document.querySelectorAll(".experience:not(.hidden)")).map(elm =>
            ({
            role: elm.querySelector("h2").innerText,
            company: elm.querySelector("p").innerText,
            date: elm.querySelector(".date").innerText,
            bullets: Array.from(elm.querySelectorAll("li")).map(span => span.innerText.trim())
            })
        ),

        education:  Array.from(document.querySelectorAll(".etude:not(.hidden)")).map(elm =>
            ({
            diploma: elm.querySelector("h2").innerText,
            school: elm.querySelector("p").innerText,
            year: elm.querySelector(".date").innerText,
            bullets: Array.from(elm.querySelectorAll("li")).map(span => span.innerText.trim())
            })
        ),
    }
}

function filter(category)
{
    document.querySelector(`#btn-filter-${curCategory}`).classList.remove("button--selected");
    document.querySelector(`#btn-filter-${category}`).classList.add("button--selected");

    curCategory = category

    if(category === "general")
    {
        items.forEach(el =>el.classList.remove("hidden"));
        return;
    }
    items.forEach(el => {
        if (el.dataset.filter === undefined || el.dataset.filter.split(" ").map(s => s.trim()).find((e)=>e === category) !== undefined ) {
            el.classList.remove("hidden");
        } else {
            el.classList.add("hidden");
        }
    });
}

document.addEventListener("click", (e)=>{
    document.querySelector("#email").innerText  ="thomas.auguey@hotmail.com";
    document.querySelector("#phone").innerText  ="06.61.74.57.79";
    document.querySelectorAll(".masked") .forEach((e)=>e.classList.remove("masked"));
})

window.addEventListener("beforeprint", () => {
  showHiddenData();
  document.querySelector("body").classList.add("print");
})

window.addEventListener("afterprint", () => {
  document.querySelector("body").classList.remove("print");
})

document.querySelector("#btn-filter-general").addEventListener("click", (e)=>{
    filter("general")
})

document.querySelector("#btn-filter-web").addEventListener("click", (e)=>{
    filter("web")
})

document.querySelector("#btn-filter-desktop").addEventListener("click", (e)=>{
    filter("desktop")
})

document.querySelector("#btn-filter-autom").addEventListener("click", (e)=>{
    filter("autom")
})

document.querySelector("#btn-to-json").addEventListener("click", (e)=>{
    const data = getData();

    // Convertir en JSON texte
    const json = JSON.stringify(data, null, 2);

    // Créer un Blob
    const blob = new Blob([json], { type: "application/json" });

    download(blob, `CV_Thomas_AUGUEY_${curCategory}.json`);
})

document.querySelector("#btn-to-pdf").addEventListener("click", (e)=>{
    try{
        document.querySelector("body").classList.add("print");

        const data = getData();
        
        const element = document.getElementById("page");

        const options = {
            margin:       0,
            filename:     `CV_Thomas_AUGUEY_${curCategory}.pdf`,
            image:        { type: 'jpeg', quality: 0.98 },
            html2canvas:  { scale: 2 },
            jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };

        html2pdf().set(options).from(element).save();
    }
    finally
    {
        document.querySelector("body").classList.remove("print");
    }
})

document.querySelector("#btn-to-pdf-ats").addEventListener("click", (e)=>{
    const data = getData();

    const doc = new jsPDF({ unit: "mm", format: "a4", compress: true });

    doc.setProperties({
        title: 'CV Thomas Auguey',
        subject: 'curriculum vitae',
        author: 'Thomas Auguey',
        keywords: `cv, ${curCategory}`,
        creator: 'https://ace4team.github.io/'
    });

    let y = 10;
    const lineHeight = 7;
    const sectionSpacing = 10;
    const bulletIndent = 10;
    const pageHeight = 297; // A4 en mm

    function addLine(text, indent = 0, fontStyle = "normal") {
        if (y + lineHeight > pageHeight - 10) {
        doc.addPage();
        y = 10;
        }
        doc.setFont(undefined, fontStyle);
        doc.text(text, 10 + indent, y);
        y += lineHeight;
    }

    // Nom et titre
    doc.setFontSize(18);
    addLine(data.name, 0, "bold");
    doc.setFontSize(14);
    addLine(data.title);
    y += sectionSpacing;

    // Contact
    doc.setFontSize(12);
    addLine(`Email: ${data.email}`);
    addLine(`Téléphone: ${data.phone}`);
    addLine(`Adresse: ${data.location}`);
    y += sectionSpacing;

    // Hard Skills
    addLine("Compétences techniques :", 0, "bold");
    data.hardkills.forEach(skill => addLine(`- ${skill}`, bulletIndent));
    y += sectionSpacing;

    // Soft Skills
    addLine("Compétences comportementales :", 0, "bold");
    data.softkills.forEach(skill => addLine(`- ${skill}`, bulletIndent));
    y += sectionSpacing;

    // Expérience
    addLine("Expériences professionnelles :", 0, "bold");
    data.experience.forEach(exp => {
        addLine(`${exp.role}`, 0, "bold");
        addLine(`${exp.company}`, 0, "bold");
        exp.date.split("\n").forEach(line => addLine(line));
        exp.bullets.forEach(b => addLine(`- ${b}`, bulletIndent));
        y += sectionSpacing;
    });

    // Education
    addLine("Formation :", 0, "bold");
    data.education.forEach(ed => {
        addLine(`${ed.diploma}`, 0, "bold");
        addLine(`${ed.school}`, 0, "bold");
        addLine(ed.year);
        ed.bullets.forEach(b => addLine(`- ${b}`, bulletIndent));
        y += sectionSpacing;
    });

    const blob = doc.output("blob");

    download(blob, `CV_Thomas_AUGUEY_ATS_${curCategory}.pdf`);
})
