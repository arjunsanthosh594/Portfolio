document.addEventListener("DOMContentLoaded", () => {
  // 1. Scroll Reveal Animation using IntersectionObserver
  const revealElements = document.querySelectorAll(".reveal");

  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("active");
          // Keep active once revealed
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.15,
      rootMargin: "0px 0px -40px 0px"
    }
  );

  revealElements.forEach((el) => revealObserver.observe(el));

  // 2. Mobile navigation toggle
  const menuToggle = document.getElementById("menuToggle");
  const navLinks = document.querySelector(".nav-links");

  if (menuToggle && navLinks) {
    menuToggle.addEventListener("click", () => {
      navLinks.classList.toggle("active");
    });

    navLinks.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        navLinks.classList.remove("active");
      });
    });
  }

  // 3. Asynchronous contact form handler
  const contactForm = document.getElementById("contactForm");
  const submitBtn = document.getElementById("submitBtn");
  const feedback = document.getElementById("formFeedback");

  if (contactForm) {
    contactForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      submitBtn.disabled = true;
      submitBtn.textContent = "Sending...";
      feedback.className = "form-feedback";
      feedback.textContent = "";

      const payload = {
        name: document.getElementById("name").value.trim(),
        email: document.getElementById("email").value.trim(),
        message: document.getElementById("message").value.trim()
      };

      try {
        const response = await fetch("/api/contact", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (response.ok && data.success) {
          feedback.classList.add("success");
          feedback.textContent = data.message;
          contactForm.reset();
        } else {
          feedback.classList.add("error");
          feedback.textContent = data.message || "Failed to send message. Please try again.";
        }
      } catch (err) {
        feedback.classList.add("error");
        feedback.textContent = "Network error. Please check your connection and try again.";
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = "Send Message";
      }
    });
  }
});
