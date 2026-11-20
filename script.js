
const contactForm = document.querySelector("#contact-form");

contactForm.addEventListener("submit", function(event) {
    event.preventDefault();

    alert("Thanks for contacting NOVA!");

    contactForm.reset();
});