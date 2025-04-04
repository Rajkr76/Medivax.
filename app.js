document.addEventListener("DOMContentLoaded", function () {
    const navLinks = document.querySelectorAll("nav a");

    navLinks.forEach(link => {
        link.addEventListener("click", function (event) {
            const href = this.getAttribute("href");
            if (href.startsWith("#")) { 
                event.preventDefault();
                const targetId = href.substring(1);
                const targetSection = document.getElementById(targetId);

                if (targetSection) {
                    targetSection.scrollIntoView({ behavior: "smooth" });
                }
            }
        });
    });
});
const logo = document.querySelector(".ai-img");

if (logo) {
    logo.addEventListener("mouseenter", function () {
        const tooltip = document.createElement("div");
        tooltip.innerHTML = `<a href="https://medivax.vercel.app/" target="_blank" rel="noopener noreferrer" style="text-decoration: none; color: white;">Talk to Medivax AI Bot</a>`;
        tooltip.style.position = "fixed";
        tooltip.style.width = "200px";
        tooltip.style.height = "50px";
        tooltip.style.backgroundColor = "#333";
        tooltip.style.color = "#fff";
        tooltip.style.display = "flex";
        tooltip.style.justifyContent = "center";
        tooltip.style.alignItems = "center";
        tooltip.style.borderRadius = "10px";
        tooltip.style.boxShadow = "0 0 10px rgba(0, 0, 0, 0.3)";
        tooltip.style.transition = "all 0.3s";
        tooltip.style.fontFamily = "Arial, sans-serif";
        tooltip.style.top = `${logo.offsetTop + logo.offsetHeight + 440}px`; 
        tooltip.style.left = `${logo.offsetLeft + (logo.offsetWidth / 2) + 80}vw`; 
        tooltip.style.zIndex = "1000";
        tooltip.classList.add("tooltip");
        document.body.appendChild(tooltip);

        logo.addEventListener("mouseleave", function () {
            document.querySelector(".tooltip").remove();
        }, { once: true });
    });
}

let submit = document.querySelector("#submit");
submit.addEventListener("click", function () {
    
    console.log(alert("Form submitted successfully!"));
});
