// Menu toggle pour mobile
let menu = document.querySelector('#menu-btn');
let navbar = document.querySelector('.header .navbar');

menu.onclick = () => {
    menu.classList.toggle('fa-times');
    navbar.classList.toggle('active');
}

window.onscroll = () => {
    menu.classList.remove('fa-times');
    navbar.classList.remove('active');
}

// Smooth scrolling pour la navigation
document.querySelectorAll('.navbar a, .btn[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const headerHeight = document.querySelector('.header').offsetHeight;
            const targetPosition = target.offsetTop - headerHeight;
            
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    });
});

// Animation au scroll
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observer pour les éléments animés
document.querySelectorAll('.box, .slide').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'all 0.6s ease';
    observer.observe(el);
});

// Swiper pour le carousel d'équipe
document.addEventListener('DOMContentLoaded', function() {
    if (typeof Swiper !== 'undefined') {
        var swiper = new Swiper(".team-slider", {
            loop: true,
            grabCursor: true,
            spaceBetween: 30,
            centeredSlides: true,
            autoplay: {
                delay: 3000,
                disableOnInteraction: false,
            },
            pagination: {
                el: '.swiper-pagination',
                clickable: true,
            },
            navigation: {
                nextEl: '.swiper-button-next',
                prevEl: '.swiper-button-prev',
            },
            breakpoints: {
                0: {
                    slidesPerView: 1,
                },
                768: {
                    slidesPerView: 2,
                },
                1024: {
                    slidesPerView: 3,
                },
            }
        });
        console.log('Swiper initialisé avec succès');
    } else {
        console.error('Swiper n\'est pas disponible');
    }
});

// Formulaire de contact
const contactForm = document.querySelector('.contact form');
if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Animation de soumission
        const submitBtn = this.querySelector('input[type="submit"]');
        const originalText = submitBtn.value;
        
        submitBtn.value = 'Envoi en cours...';
        submitBtn.style.background = 'var(--secondary)';
        
        // Simulation d'envoi (remplacez par votre logique d'envoi)
        setTimeout(() => {
            submitBtn.value = 'Message envoyé !';
            submitBtn.style.background = '#10b981';
            
            setTimeout(() => {
                submitBtn.value = originalText;
                submitBtn.style.background = '';
                this.reset();
            }, 2000);
        }, 1500);
    });
}

// Animation des compteurs (si vous voulez ajouter des statistiques)
function animateCounter(element, start, end, duration) {
    let startTime = null;
    
    function animate(currentTime) {
        if (startTime === null) startTime = currentTime;
        const timeElapsed = currentTime - startTime;
        const progress = Math.min(timeElapsed / duration, 1);
        
        const value = Math.floor(progress * (end - start) + start);
        element.textContent = value;
        
        if (progress < 1) {
            requestAnimationFrame(animate);
        }
    }
    
    requestAnimationFrame(animate);
}

// Effet parallax pour le header
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const parallax = document.querySelector('.home');
    
    if (parallax) {
        const speed = scrolled * 0.5;
        parallax.style.transform = `translateY(${speed}px)`;
    }
});

// Animation des éléments au survol
document.querySelectorAll('.box, .slide').forEach(element => {
    element.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-10px) scale(1.02)';
    });
    
    element.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0) scale(1)';
    });
});

// Validation du formulaire en temps réel
const formInputs = document.querySelectorAll('.contact form input, .contact form select, .contact form textarea');
formInputs.forEach(input => {
    input.addEventListener('blur', function() {
        if (this.hasAttribute('required') && !this.value.trim()) {
            this.style.borderColor = '#ef4444';
        } else {
            this.style.borderColor = 'var(--primary)';
        }
    });
    
    input.addEventListener('focus', function() {
        this.style.borderColor = 'var(--primary)';
    });
});

// Lazy loading pour les images
const images = document.querySelectorAll('img');
const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const img = entry.target;
            img.style.opacity = '1';
            observer.unobserve(img);
        }
    });
});

images.forEach(img => {
    img.style.opacity = '0';
    img.style.transition = 'opacity 0.6s ease';
    imageObserver.observe(img);
});

// Fonction pour ajouter une classe active aux liens de navigation
function updateActiveNavLink() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.navbar a');
    
    let current = '';
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        if (window.pageYOffset >= sectionTop - 200) {
            current = section.getAttribute('id');
        }
    });
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) {
            link.classList.add('active');
        }
    });
}

window.addEventListener('scroll', updateActiveNavLink);

// Fonction pour le thème sombre/clair (optionnel)
function toggleTheme() {
    document.body.classList.toggle('light-theme');
    const isDark = !document.body.classList.contains('light-theme');
    localStorage.setItem('darkTheme', isDark);
}

// Charger le thème sauvegardé
document.addEventListener('DOMContentLoaded', () => {
    const isDark = localStorage.getItem('darkTheme') !== 'false';
    if (!isDark) {
        document.body.classList.add('light-theme');
    }
});

console.log('Binet - Site web chargé avec succès ! 🚀');

// Debug - Vérification des éléments
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM chargé');
    console.log('Menu button:', document.querySelector('#menu-btn'));
    console.log('Navbar:', document.querySelector('.header .navbar'));
    console.log('Team slider:', document.querySelector('.team-slider'));
    console.log('Swiper disponible:', typeof Swiper !== 'undefined');
});

// Gestion du formulaire de contact pour Namecheap
function handleFormSubmit(form) {
    const submitBtn = form.querySelector('input[type="submit"]');
    const originalText = submitBtn.value;
    
    // Animation pendant soumission
    submitBtn.value = 'Envoi en cours...';
    submitBtn.disabled = true;
    submitBtn.style.background = 'var(--secondary)';
    
    // Le formulaire se soumettra normalement
    return true;
}

// Version alternative avec AJAX pour test
document.addEventListener('DOMContentLoaded', function() {
    const contactForm = document.getElementById('contactForm');
    
    if (contactForm) {
        // Essayer d'abord l'AJAX, sinon soumission normale
        contactForm.addEventListener('submit', async function(e) {
            // Si on est en local ou sur un serveur de test, utiliser AJAX
            if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
                e.preventDefault();
                await submitWithAjax(this);
            }
            // Sinon, laisser la soumission normale se faire
        });
    }
});

async function submitWithAjax(form) {
    const submitBtn = form.querySelector('input[type="submit"]');
    const originalBtnText = submitBtn.value;
    
    submitBtn.disabled = true;
    submitBtn.value = 'Envoi en cours...';
    
    try {
        const formData = new FormData(form);
        const response = await fetch('contact.php', {
            method: 'POST',
            body: formData
        });
        
        if (response.ok) {
            const result = await response.json();
            if (result.success) {
                showMessage(result.message, 'success');
                form.reset();
            } else {
                showMessage(result.error || 'Erreur lors de l\'envoi', 'error');
            }
        } else {
            throw new Error('Erreur serveur');
        }
    } catch (error) {
        console.error('Erreur AJAX:', error);
        // Fallback: soumission normale du formulaire
        submitBtn.disabled = false;
        submitBtn.value = originalBtnText;
        form.submit();
        return;
    }
    
    submitBtn.disabled = false;
    submitBtn.value = originalBtnText;
}

// Fonction pour afficher les messages
function showMessage(message, type) {
    // Supprimer les anciens messages
    const existingMessages = document.querySelectorAll('.form-message');
    existingMessages.forEach(msg => msg.remove());
    
    // Créer le nouveau message
    const messageDiv = document.createElement('div');
    messageDiv.className = `form-message ${type}`;
    messageDiv.textContent = message;
    
    // Styles pour le message
    messageDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 25px;
        border-radius: 8px;
        color: white;
        font-weight: 600;
        z-index: 9999;
        max-width: 400px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        transform: translateX(100%);
        transition: transform 0.3s ease;
        ${type === 'success' ? 'background: #22c55e;' : 'background: #ef4444;'}
    `;
    
    document.body.appendChild(messageDiv);
    
    // Animation d'entrée
    setTimeout(() => {
        messageDiv.style.transform = 'translateX(0)';
    }, 100);
    
    // Suppression automatique après 5 secondes
    setTimeout(() => {
        messageDiv.style.transform = 'translateX(100%)';
        setTimeout(() => {
            messageDiv.remove();
        }, 300);
    }, 5000);
}
