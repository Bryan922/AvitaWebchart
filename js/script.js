// Variables globales pour suivre l'état du marché
let currentPrice = 0.00056;
let initialPrice = 0.00056;
let marketCap = 56; // en millions
let volume24h = 1.8; // en millions
let performance7d = 8.7; // en pourcentage
let holders = 15250; // nombre de détenteurs
let transactions = 145720; // nombre de transactions
let lastUpdateTime = Date.now();
let priceChart = null;
let priceHistory = []; // Historique des prix pour calculer les tendances
let marketTrend = 1; // 1 = haussier, -1 = baissier
let trendDuration = 0; // Durée de la tendance actuelle
let volatility = 0.02; // Volatilité du marché (0.01 = 1%)

// Fonction pour générer des données de prix aléatoires avec tendance réaliste
function generateChartData() {
    const data = [];
    const labels = [];
    
    // Utiliser l'historique des prix réels si disponible, sinon générer des données fictives
    if (priceHistory.length >= 60) {
        // Utiliser les 60 derniers points de données
        const recentHistory = priceHistory.slice(-60);
        for (let i = 0; i < recentHistory.length; i++) {
            data.push(recentHistory[i].toFixed(6));
            
            // Calculer l'heure (format HH:MM)
            const now = new Date();
            const timeOffset = (recentHistory.length - i) * 5; // minutes
            const historicalTime = new Date(now.getTime() - timeOffset * 60000);
            const hours = historicalTime.getHours().toString().padStart(2, '0');
            const minutes = historicalTime.getMinutes().toString().padStart(2, '0');
            labels.push(`${hours}:${minutes}`);
        }
    } else {
        // Générer des données fictives pour le démarrage
        let basePrice = currentPrice * 0.75; // Prix de départ ajusté pour atteindre le prix actuel
        const intervals = 60; // 60 points de données pour 5 heures (intervalle de 5 minutes)
        
        for (let i = 0; i < intervals; i++) {
            // Tendance générale à la hausse
            const trend = (currentPrice - basePrice) * (i / intervals) * 1.2;
            
            // Fluctuation aléatoire (plus importante vers la fin pour simuler la volatilité récente)
            const volatilityFactor = 1 + (i / intervals);
            const randomFactor = (Math.random() * 0.00002 - 0.00001) * volatilityFactor;
            
            // Prix calculé
            const price = basePrice + trend + randomFactor;
            data.push(price.toFixed(6));
            
            // Ajouter à l'historique des prix
            if (priceHistory.length < 60) {
                priceHistory.push(price);
            }
            
            // Calculer l'heure (format HH:MM)
            const now = new Date();
            const timeOffset = (intervals - i) * 5; // minutes
            const historicalTime = new Date(now.getTime() - timeOffset * 60000);
            const hours = historicalTime.getHours().toString().padStart(2, '0');
            const minutes = historicalTime.getMinutes().toString().padStart(2, '0');
            labels.push(`${hours}:${minutes}`);
        }
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

// Fonction pour simuler les cycles du marché
function simulateMarketCycles() {
    // Incrémenter la durée de la tendance actuelle
    trendDuration++;
    
    // Probabilité de changement de tendance (augmente avec la durée de la tendance actuelle)
    const changeProb = Math.min(0.1, 0.01 * trendDuration);
    
    // Décider si on change de tendance
    if (Math.random() < changeProb) {
        marketTrend *= -1; // Inverser la tendance
        trendDuration = 0; // Réinitialiser la durée
        
        // Ajuster la volatilité (plus élevée lors des changements de tendance)
        volatility = 0.03 + (Math.random() * 0.02);
    } else {
        // Réduire progressivement la volatilité pendant les tendances stables
        volatility = Math.max(0.01, volatility * 0.95);
    }
}

// Fonction pour mettre à jour le prix et les statistiques
function updateMarketData() {
    // Simuler les cycles du marché
    simulateMarketCycles();
    
    // Calculer le temps écoulé depuis la dernière mise à jour
    const now = Date.now();
    const elapsedMinutes = (now - lastUpdateTime) / 60000;
    lastUpdateTime = now;
    
    // Générer une variation de prix basée sur la tendance et la volatilité actuelles
    const trendFactor = marketTrend * (0.005 + (Math.random() * 0.01)); // Tendance de base
    const randomFactor = (Math.random() * 2 - 1) * volatility; // Facteur aléatoire
    const priceChangePct = trendFactor + randomFactor; // Changement en pourcentage
    
    // Appliquer le changement de prix
    const oldPrice = currentPrice;
    currentPrice = currentPrice * (1 + priceChangePct);
    
    // Limiter le prix à un minimum raisonnable
    if (currentPrice < 0.0001) {
        currentPrice = 0.0001;
    }
    
    // Ajouter le nouveau prix à l'historique
    priceHistory.push(currentPrice);
    if (priceHistory.length > 300) { // Garder un historique limité
        priceHistory.shift();
    }
    
    // Calculer le changement de prix en pourcentage
    const pricePctChange = ((currentPrice - oldPrice) / oldPrice) * 100;
    
    // Mettre à jour la capitalisation boursière (prix * supply)
    marketCap = (currentPrice * 100).toFixed(2); // 100M tokens
    
    // Mettre à jour le volume (corrélé à la volatilité et au changement de prix)
    const volumeChange = Math.abs(pricePctChange) * (0.5 + Math.random());
    volume24h = (parseFloat(volume24h) + volumeChange * 0.1).toFixed(2);
    if (volume24h < 0.5) volume24h = 0.5; // Minimum volume
    
    // Mettre à jour la performance sur 7 jours (moyenne mobile)
    performance7d = (performance7d * 0.95 + pricePctChange * 0.05).toFixed(1);
    
    // Mettre à jour le nombre de détenteurs (augmente plus rapidement en tendance haussière)
    const holderChange = Math.floor(Math.random() * 50) * (marketTrend > 0 ? 2 : 0.5);
    holders += holderChange;
    
    // Mettre à jour le nombre de transactions (corrélé au volume)
    const txChange = Math.floor(Math.random() * 100 * (parseFloat(volume24h) / 1.8));
    transactions += txChange;
    
    // Mettre à jour les éléments HTML avec animation
    updateUIElements(pricePctChange);
    
    // Mettre à jour le graphique
    updateChart();
}

// Fonction pour mettre à jour les éléments de l'interface utilisateur avec animation
function updateUIElements(pricePctChange) {
    // Mettre à jour les affichages de prix avec animation
    const priceElements = document.querySelectorAll('.highlight, .value:first-of-type');
    priceElements.forEach(el => {
        // Ajouter une classe pour l'animation en fonction de la direction du prix
        el.classList.remove('price-up', 'price-down');
        if (pricePctChange > 0) {
            el.classList.add('price-up');
        } else if (pricePctChange < 0) {
            el.classList.add('price-down');
        }
        
        // Mettre à jour le texte
        el.textContent = '$' + currentPrice.toFixed(6);
    });
    
    // Mettre à jour la capitalisation boursière
    animateValue(document.querySelector('.data-card:nth-of-type(2) .value'), '$' + marketCap + 'M');
    
    // Mettre à jour le volume 24h
    animateValue(document.querySelector('.data-card:nth-of-type(4) .value'), '$' + volume24h + 'M');
    
    // Mettre à jour la performance
    const performanceEl = document.querySelector('.stat-card:first-of-type p');
    animateValue(performanceEl, (performance7d >= 0 ? '+' : '') + performance7d + '% (7j)');
    
    // Changer la couleur de la performance selon qu'elle est positive ou négative
    if (performance7d >= 0) {
        performanceEl.style.color = 'var(--success-color)';
    } else {
        performanceEl.style.color = 'var(--danger-color)';
    }
    
    // Mettre à jour le nombre de détenteurs
    animateValue(document.querySelector('.stat-card:nth-of-type(2) p'), holders.toLocaleString());
    
    // Mettre à jour le nombre de transactions
    animateValue(document.querySelector('.stat-card:nth-of-type(3) p'), transactions.toLocaleString());
}

// Fonction pour animer la transition entre deux valeurs
function animateValue(element, newValue) {
    // Ajouter une classe pour l'animation
    element.classList.add('updating');
    
    // Retirer la classe après l'animation
    setTimeout(() => {
        element.textContent = newValue;
        element.classList.remove('updating');
    }, 300);
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
            targetValue = parseFloat(value.replace('M', '').replace(/,/g, ''));
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
                
                if (suffix === 'M') {
                    valueElement.textContent = prefix + currentValue.toFixed(2) + suffix;
                } else if (Number.isInteger(targetValue)) {
                    valueElement.textContent = prefix + Math.floor(currentValue).toLocaleString();
                } else {
                    valueElement.textContent = prefix + currentValue.toFixed(6);
                }
                
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
    // Ajouter les styles CSS pour les animations de prix
    const style = document.createElement('style');
    style.textContent = `
        .price-up {
            color: var(--success-color) !important;
            transition: color 0.5s ease;
        }
        .price-down {
            color: var(--danger-color) !important;
            transition: color 0.5s ease;
        }
        .updating {
            opacity: 0.5;
            transition: opacity 0.3s ease;
        }
    `;
    document.head.appendChild(style);
    
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
    
    // Mettre à jour les données du marché toutes les 5 secondes
    setInterval(updateMarketData, 5000);
});

// Ajouter une animation de parallaxe pour l'arrière-plan de hero
window.addEventListener('scroll', function() {
    const heroSection = document.querySelector('.hero');
    const scrollPosition = window.scrollY;
    
    if (scrollPosition < window.innerHeight) {
        heroSection.style.backgroundPositionY = `${scrollPosition * 0.5}px`;
    }
}); 