// Variables globales pour suivre l'état du marché
let currentPrice = 0.00056;
let initialPrice = 0.00056;
let marketCap = 56; // en millions
let volume24h = 1.8; // en millions
let performance7d = 8.7; // en pourcentage
let lastUpdateTime = Date.now();
let priceChart = null;

// Fonction pour générer des données de prix aléatoires avec tendance positive
function generateChartData() {
    const data = [];
    const labels = [];
    let basePrice = currentPrice * 0.75; // Prix de départ ajusté pour atteindre le prix actuel
    const intervals = 60; // 60 points de données pour 5 heures (intervalle de 5 minutes)
    
    // Générer des données de prix en hausse avec quelques fluctuations
    for (let i = 0; i < intervals; i++) {
        // Tendance générale à la hausse
        const trend = (currentPrice - basePrice) * (i / intervals) * 1.2;
        
        // Fluctuation aléatoire (plus importante vers la fin pour simuler la volatilité récente)
        const volatilityFactor = 1 + (i / intervals);
        const randomFactor = (Math.random() * 0.00002 - 0.00001) * volatilityFactor;
        
        // Prix calculé
        const price = basePrice + trend + randomFactor;
        
        data.push(price.toFixed(6));
        
        // Calculer l'heure (format HH:MM)
        const now = new Date();
        const timeOffset = (intervals - i) * 5; // minutes
        const historicalTime = new Date(now.getTime() - timeOffset * 60000);
        const hours = historicalTime.getHours().toString().padStart(2, '0');
        const minutes = historicalTime.getMinutes().toString().padStart(2, '0');
        labels.push(`${hours}:${minutes}`);
    }
    
    return { prices: data, labels: labels.reverse() };
}

// Fonction pour initialiser le graphique de prix
function initPriceChart() {
    const ctx = document.getElementById('priceChart').getContext('2d');
    const chartData = generateChartData();
    
    // Calculer les gradients pour le fond du graphique
    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, 'rgba(76, 111, 255, 0.4)');
    gradient.addColorStop(1, 'rgba(76, 111, 255, 0)');
    
    // Configuration du graphique
    priceChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: chartData.labels,
            datasets: [{
                label: 'Prix AVITA (USD)',
                data: chartData.prices,
                borderColor: '#4c6fff',
                borderWidth: 3,
                backgroundColor: gradient,
                fill: true,
                tension: 0.4,
                pointRadius: 0,
                pointHoverRadius: 6,
                pointBackgroundColor: '#00d2ff',
                pointHoverBorderWidth: 3
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    backgroundColor: 'rgba(20, 27, 45, 0.9)',
                    titleColor: '#ffffff',
                    bodyColor: '#a0aec0',
                    borderColor: 'rgba(76, 111, 255, 0.3)',
                    borderWidth: 1,
                    padding: 12,
                    displayColors: false,
                    callbacks: {
                        label: function(context) {
                            return `$${context.raw}`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    grid: {
                        display: false,
                        drawBorder: false
                    },
                    ticks: {
                        color: '#a0aec0',
                        maxRotation: 0,
                        // Afficher seulement quelques étiquettes pour l'axe X
                        callback: function(value, index, values) {
                            return index % 12 === 0 ? this.getLabelForValue(value) : '';
                        }
                    }
                },
                y: {
                    position: 'right',
                    grid: {
                        color: 'rgba(160, 174, 192, 0.1)',
                        drawBorder: false
                    },
                    ticks: {
                        color: '#a0aec0',
                        callback: function(value) {
                            return '$' + value;
                        }
                    }
                }
            },
            interaction: {
                mode: 'nearest',
                axis: 'x',
                intersect: false
            },
            elements: {
                line: {
                    cubicInterpolationMode: 'monotone'
                }
            }
        }
    });
}

// Fonction pour mettre à jour le prix et les statistiques
function updateMarketData() {
    // Calculer le temps écoulé depuis la dernière mise à jour
    const now = Date.now();
    const elapsedMinutes = (now - lastUpdateTime) / 60000;
    lastUpdateTime = now;
    
    // Générer une variation de prix aléatoire (tendance haussière avec fluctuations)
    const priceChange = currentPrice * (Math.random() * 0.02 - 0.005); // -0.5% à +1.5%
    currentPrice += priceChange;
    
    // Mettre à jour la capitalisation boursière (prix * supply)
    marketCap = (currentPrice * 100).toFixed(2); // 100M tokens
    
    // Mettre à jour le volume (fluctue en fonction de la volatilité du prix)
    const volatility = Math.abs(priceChange / currentPrice);
    volume24h = (volume24h + (volatility * 5 * Math.random() - 0.1)).toFixed(2);
    if (volume24h < 0.5) volume24h = 0.5; // Minimum volume
    
    // Mettre à jour la performance sur 7 jours
    const performanceChange = (Math.random() * 0.5 - 0.2) * Math.sign(priceChange); // Corrélé au changement de prix
    performance7d = (performance7d + performanceChange).toFixed(1);
    
    // Mettre à jour les éléments HTML
    updateUIElements();
    
    // Mettre à jour le graphique
    updateChart();
}

// Fonction pour mettre à jour les éléments de l'interface utilisateur
function updateUIElements() {
    // Mettre à jour les affichages de prix
    document.querySelectorAll('.highlight, .value:first-of-type').forEach(el => {
        el.textContent = '$' + currentPrice.toFixed(6);
    });
    
    // Mettre à jour la capitalisation boursière
    document.querySelector('.data-card:nth-of-type(2) .value').textContent = '$' + marketCap + 'M';
    
    // Mettre à jour le volume 24h
    document.querySelector('.data-card:nth-of-type(4) .value').textContent = '$' + volume24h + 'M';
    
    // Mettre à jour la performance
    const performanceEl = document.querySelector('.stat-card:first-of-type p');
    performanceEl.textContent = (performance7d >= 0 ? '+' : '') + performance7d + '% (7j)';
    
    // Changer la couleur de la performance selon qu'elle est positive ou négative
    if (performance7d >= 0) {
        performanceEl.style.color = 'var(--success-color)';
    } else {
        performanceEl.style.color = 'var(--danger-color)';
    }
}

// Fonction pour mettre à jour le graphique
function updateChart() {
    if (!priceChart) return;
    
    const chartData = generateChartData();
    
    // Mettre à jour les données du graphique
    priceChart.data.labels = chartData.labels;
    priceChart.data.datasets[0].data = chartData.prices;
    
    // Rafraîchir le graphique
    priceChart.update();
}

// Fonction pour animer les nombres dans les statistiques
function animateNumbers() {
    const dataValues = document.querySelectorAll('.value');
    
    dataValues.forEach(valueElement => {
        const value = valueElement.textContent;
        valueElement.textContent = '0';
        
        // Extraire le format
        let prefix = '';
        let suffix = '';
        let targetValue = 0;
        
        if (value.includes('$')) {
            prefix = '$';
            targetValue = parseFloat(value.replace('$', '').replace('M', ''));
            if (value.includes('M')) suffix = 'M';
        } else {
            targetValue = parseFloat(value.replace('M', ''));
            if (value.includes('M')) suffix = 'M';
        }
        
        // Animation
        let startValue = 0;
        const duration = 2000; // 2 secondes
        const startTime = Date.now();
        
        function updateNumber() {
            const currentTime = Date.now();
            const elapsedTime = currentTime - startTime;
            
            if (elapsedTime < duration) {
                const progress = elapsedTime / duration;
                const currentValue = startValue + progress * (targetValue - startValue);
                valueElement.textContent = prefix + currentValue.toFixed(3) + suffix;
                requestAnimationFrame(updateNumber);
            } else {
                valueElement.textContent = value; // Valeur finale
            }
        }
        
        updateNumber();
    });
}

// Fonction pour animer l'apparition des éléments au scroll
function initScrollAnimation() {
    const sections = document.querySelectorAll('section');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            }
        });
    }, { threshold: 0.1 });
    
    sections.forEach(section => {
        observer.observe(section);
    });
}

// Smooth scroll pour les liens d'ancrage
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });
}

// Initialiser les fonctionnalités quand le DOM est chargé
document.addEventListener('DOMContentLoaded', function() {
    // Initialiser le graphique de prix
    initPriceChart();
    
    // Animer les valeurs des statistiques
    animateNumbers();
    
    // Initialiser le smooth scroll
    initSmoothScroll();
    
    // Initialiser les animations au scroll
    initScrollAnimation();
    
    // Ajouter une classe active à la section actuellement visible
    document.body.classList.add('loaded');
    
    // Mettre à jour les données du marché toutes les 30 secondes
    setInterval(updateMarketData, 30000);
});

// Ajouter une animation de parallaxe pour l'arrière-plan de hero
window.addEventListener('scroll', function() {
    const heroSection = document.querySelector('.hero');
    const scrollPosition = window.scrollY;
    
    if (scrollPosition < window.innerHeight) {
        heroSection.style.backgroundPositionY = `${scrollPosition * 0.5}px`;
    }
}); 