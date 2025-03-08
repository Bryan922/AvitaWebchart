// Variables globales pour suivre l'état du marché
let currentPrice = 0.00056;
let initialPrice = 0.00056;
let marketCap = 50; // en millions
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
let totalSupply = 89285; // Supply total en millions (calculé pour avoir MC = 50M avec prix = 0.00056)
let marketPhase = 'accumulation'; // accumulation, markup, distribution, markdown
let phaseDuration = 0; // Durée de la phase actuelle
let lastEventTime = 0; // Temps écoulé depuis le dernier événement majeur
let eventProbability = 0.05; // Probabilité d'un événement majeur
let eventImpact = 0; // Impact de l'événement actuel sur le prix
let eventDuration = 0; // Durée de l'événement actuel
let eventType = null; // Type d'événement actuel
let lastSaveTime = 0; // Temps écoulé depuis la dernière sauvegarde
let supplyFluctuation = 0; // Fluctuation de la supply (en %)
let supplyTrend = 0; // Tendance de la supply
let enablePersistence = false; // Désactiver la persistance pour avoir des données aléatoires à chaque rafraîchissement

// Fonction pour sauvegarder l'état du marché dans localStorage
function saveMarketState() {
    // Si la persistance est désactivée, ne pas sauvegarder
    if (!enablePersistence) return;
    
    // Ne sauvegarder que toutes les 5 mises à jour pour éviter trop d'écritures
    lastSaveTime++;
    if (lastSaveTime < 5) return;
    lastSaveTime = 0;
    
    const marketState = {
        currentPrice,
        marketCap,
        volume24h,
        performance7d,
        holders,
        transactions,
        priceHistory,
        marketTrend,
        trendDuration,
        volatility,
        marketPhase,
        phaseDuration,
        lastEventTime,
        eventType,
        eventImpact,
        eventDuration,
        totalSupply,
        supplyFluctuation,
        supplyTrend,
        timestamp: Date.now()
    };
    
    try {
        localStorage.setItem('avitaMarketState', JSON.stringify(marketState));
        console.log('État du marché sauvegardé');
    } catch (e) {
        console.error('Erreur lors de la sauvegarde de l\'état du marché:', e);
    }
}

// Fonction pour charger l'état du marché depuis localStorage
function loadMarketState() {
    // Si la persistance est désactivée, toujours retourner false pour générer des données aléatoires
    if (!enablePersistence) return false;
    
    try {
        const savedState = localStorage.getItem('avitaMarketState');
        if (!savedState) {
            console.log('Aucun état de marché sauvegardé trouvé, utilisation des valeurs par défaut');
            return false;
        }
        
        const marketState = JSON.parse(savedState);
        
        // Vérifier si les données sont trop anciennes (plus de 24h)
        const now = Date.now();
        const savedTime = marketState.timestamp || 0;
        const hoursSinceSave = (now - savedTime) / (1000 * 60 * 60);
        
        if (hoursSinceSave > 24) {
            console.log('Données sauvegardées trop anciennes (> 24h), utilisation des valeurs par défaut');
            return false;
        }
        
        // Restaurer l'état du marché
        currentPrice = marketState.currentPrice || currentPrice;
        marketCap = marketState.marketCap || marketCap;
        volume24h = marketState.volume24h || volume24h;
        performance7d = marketState.performance7d || performance7d;
        holders = marketState.holders || holders;
        transactions = marketState.transactions || transactions;
        priceHistory = marketState.priceHistory || [];
        marketTrend = marketState.marketTrend || marketTrend;
        trendDuration = marketState.trendDuration || trendDuration;
        volatility = marketState.volatility || volatility;
        marketPhase = marketState.marketPhase || marketPhase;
        phaseDuration = marketState.phaseDuration || phaseDuration;
        lastEventTime = marketState.lastEventTime || lastEventTime;
        eventType = marketState.eventType || null;
        eventImpact = marketState.eventImpact || 0;
        eventDuration = marketState.eventDuration || 0;
        totalSupply = marketState.totalSupply || totalSupply;
        supplyFluctuation = marketState.supplyFluctuation || 0;
        supplyTrend = marketState.supplyTrend || 0;
        
        console.log('État du marché restauré depuis la sauvegarde');
        return true;
    } catch (e) {
        console.error('Erreur lors du chargement de l\'état du marché:', e);
        return false;
    }
}

// Fonction pour générer un état de marché aléatoire (pour les nouveaux visiteurs)
function generateRandomMarketState() {
    console.log('Génération d\'un état de marché aléatoire');
    
    // Générer un prix aléatoire avec une variabilité limitée autour de 0.00056
    const priceRange = Math.random();
    const basePrice = 0.00056; // Prix de référence
    const variationFactor = 0.30; // Facteur de variation (30%)
    
    if (priceRange < 0.3) {
        // 30% de chance d'avoir un prix légèrement inférieur (0.0004 à 0.00056)
        currentPrice = basePrice - (Math.random() * basePrice * variationFactor);
    } else if (priceRange < 0.7) {
        // 40% de chance d'avoir un prix très proche du prix de référence (0.0005 à 0.0006)
        currentPrice = basePrice * (0.9 + (Math.random() * 0.2));
    } else if (priceRange < 0.9) {
        // 20% de chance d'avoir un prix légèrement supérieur (0.00056 à 0.0007)
        currentPrice = basePrice + (Math.random() * basePrice * variationFactor);
    } else {
        // 10% de chance d'avoir un prix plus élevé mais limité (0.0007 à 0.0008)
        currentPrice = basePrice * (1.25 + (Math.random() * 0.25));
    }
    
    // Générer une supply totale aléatoire avec grande variabilité (10M à 500M)
    const supplyRange = Math.random();
    if (supplyRange < 0.2) {
        // 20% de chance d'avoir une petite supply (10M à 50M)
        totalSupply = 10000 + Math.floor(Math.random() * 40000);
    } else if (supplyRange < 0.6) {
        // 40% de chance d'avoir une supply moyenne (50M à 150M)
        totalSupply = 50000 + Math.floor(Math.random() * 100000);
    } else if (supplyRange < 0.9) {
        // 30% de chance d'avoir une grande supply (150M à 300M)
        totalSupply = 150000 + Math.floor(Math.random() * 150000);
    } else {
        // 10% de chance d'avoir une très grande supply (300M à 500M)
        totalSupply = 300000 + Math.floor(Math.random() * 200000);
    }
    
    // Générer une phase de marché aléatoire
    const phases = ['accumulation', 'markup', 'distribution', 'markdown'];
    marketPhase = phases[Math.floor(Math.random() * phases.length)];
    
    // Ajuster la tendance en fonction de la phase
    switch (marketPhase) {
        case 'accumulation':
            marketTrend = -0.2 + (Math.random() * 0.4); // -0.2 à 0.2
            break;
        case 'markup':
            marketTrend = 0.5 + (Math.random() * 0.5); // 0.5 à 1
            break;
        case 'distribution':
            marketTrend = -0.2 + (Math.random() * 0.4); // -0.2 à 0.2
            break;
        case 'markdown':
            marketTrend = -1 + (Math.random() * 0.5); // -1 à -0.5
            break;
    }
    
    // Générer des valeurs aléatoires pour les autres métriques
    marketCap = (currentPrice * totalSupply).toFixed(2);
    
    // Volume en fonction de la capitalisation (0.5% à 10% de la MC)
    const volumePercent = 0.005 + (Math.random() * 0.095);
    volume24h = (marketCap * volumePercent).toFixed(2);
    
    // Performance avec grande variabilité (-30% à +50%)
    performance7d = ((Math.random() * 80) - 30).toFixed(1);
    
    // Nombre de détenteurs en fonction de la capitalisation
    const holdersFactor = 100 + (Math.random() * 400); // 100 à 500 détenteurs par million de MC
    holders = Math.floor(marketCap * holdersFactor);
    
    // Nombre de transactions en fonction du volume
    const txFactor = 1000 + (Math.random() * 4000); // 1000 à 5000 tx par million de volume
    transactions = Math.floor(volume24h * txFactor);
    
    // Initialiser les tendances de supply
    supplyFluctuation = Math.random() * 0.02; // 0% à 2%
    supplyTrend = Math.random() > 0.5 ? 1 : -1;
    
    // Générer un historique de prix aléatoire
    priceHistory = [];
    let tempPrice = currentPrice * 0.9; // Commencer un peu plus bas
    for (let i = 0; i < 60; i++) {
        // Tendance générale vers le prix actuel
        const trend = (currentPrice - tempPrice) / (60 - i) * 1.2;
        const randomNoise = (Math.random() * 0.004) - 0.002;
        tempPrice = tempPrice + trend + randomNoise;
        priceHistory.push(tempPrice);
    }
    
    // Sauvegarder cet état initial si la persistance est activée
    if (enablePersistence) {
        saveMarketState();
    }
}

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

// Fonction pour simuler les cycles du marché plus complexes
function simulateMarketCycles() {
    // Incrémenter la durée de la tendance actuelle
    trendDuration++;
    phaseDuration++;
    
    // Gérer les phases du marché (cycle de Wyckoff)
    const phaseChangeProb = Math.min(0.05, 0.005 * phaseDuration);
    
    if (Math.random() < phaseChangeProb) {
        // Changer de phase de marché
        switch (marketPhase) {
            case 'accumulation':
                marketPhase = 'markup';
                marketTrend = 1;
                volatility = 0.02 + (Math.random() * 0.01);
                // Augmenter la tendance de supply en phase de hausse
                supplyTrend = 1;
                supplyFluctuation = 0.01 + (Math.random() * 0.01);
                break;
            case 'markup':
                marketPhase = 'distribution';
                marketTrend = 0.2; // Ralentissement de la hausse
                volatility = 0.03 + (Math.random() * 0.02);
                // Stabiliser la supply en phase de distribution
                supplyTrend = Math.random() > 0.5 ? 0.5 : -0.5;
                supplyFluctuation = 0.005 + (Math.random() * 0.005);
                break;
            case 'distribution':
                marketPhase = 'markdown';
                marketTrend = -1;
                volatility = 0.04 + (Math.random() * 0.02);
                // Diminuer la supply en phase de baisse
                supplyTrend = -1;
                supplyFluctuation = 0.01 + (Math.random() * 0.01);
                break;
            case 'markdown':
                marketPhase = 'accumulation';
                marketTrend = -0.2; // Ralentissement de la baisse
                volatility = 0.02 + (Math.random() * 0.01);
                // Stabiliser la supply en phase d'accumulation
                supplyTrend = 0;
                supplyFluctuation = 0.002 + (Math.random() * 0.003);
                break;
        }
        
        phaseDuration = 0;
        console.log(`Nouvelle phase de marché: ${marketPhase}, tendance: ${marketTrend}`);
    }
    
    // Micro-tendances à l'intérieur des phases principales
    if (trendDuration > 10 && Math.random() < 0.15) {
        // Créer des contre-tendances temporaires
        marketTrend *= -0.5; // Inverser partiellement la tendance
        trendDuration = 0;
    }
    
    // Simuler des événements de marché occasionnels
    lastEventTime++;
    
    // Gérer les événements existants
    if (eventType) {
        eventDuration--;
        if (eventDuration <= 0) {
            // Fin de l'événement
            eventType = null;
            eventImpact = 0;
        }
    }
    
    // Possibilité d'un nouvel événement si aucun n'est en cours
    if (!eventType && lastEventTime > 20 && Math.random() < eventProbability) {
        // Générer un événement aléatoire
        const events = [
            { type: 'news', impact: 0.05, duration: 5, name: 'Annonce partenariat', supplyImpact: 0.02 },
            { type: 'news', impact: -0.03, duration: 4, name: 'Rumeur négative', supplyImpact: -0.01 },
            { type: 'listing', impact: 0.08, duration: 8, name: 'Nouveau listing', supplyImpact: 0.05 },
            { type: 'whale', impact: -0.04, duration: 3, name: 'Vente massive', supplyImpact: -0.03 },
            { type: 'whale', impact: 0.06, duration: 6, name: 'Achat important', supplyImpact: 0.02 },
            { type: 'market', impact: 0.03, duration: 7, name: 'Hausse du marché global', supplyImpact: 0.01 },
            { type: 'market', impact: -0.02, duration: 5, name: 'Baisse du marché global', supplyImpact: -0.01 },
            { type: 'token', impact: 0.1, duration: 10, name: 'Burn de tokens', supplyImpact: -0.1 },
            { type: 'token', impact: -0.05, duration: 6, name: 'Libération de tokens', supplyImpact: 0.15 }
        ];
        
        const event = events[Math.floor(Math.random() * events.length)];
        eventType = event.type;
        eventImpact = event.impact * (0.8 + Math.random() * 0.4); // Variation de l'impact
        eventDuration = event.duration;
        lastEventTime = 0;
        
        // Appliquer l'impact sur la supply
        if (event.supplyImpact) {
            const actualSupplyImpact = event.supplyImpact * (0.8 + Math.random() * 0.4);
            totalSupply = Math.max(50000, totalSupply * (1 + actualSupplyImpact));
        }
        
        console.log(`Événement de marché: ${event.name}, impact: ${eventImpact.toFixed(4)}`);
    }
    
    // Ajuster la volatilité en fonction de la phase et des événements
    if (eventType) {
        // Augmenter la volatilité pendant les événements
        volatility = Math.min(0.08, volatility * 1.5);
    } else {
        // Volatilité normale basée sur la phase
        switch (marketPhase) {
            case 'accumulation':
                volatility = 0.01 + (Math.random() * 0.01);
                break;
            case 'markup':
                volatility = 0.02 + (Math.random() * 0.02);
                break;
            case 'distribution':
                volatility = 0.03 + (Math.random() * 0.02);
                break;
            case 'markdown':
                volatility = 0.02 + (Math.random() * 0.03);
                break;
        }
    }
    
    // Fluctuation naturelle de la supply
    if (Math.random() < 0.2) { // 20% de chance de fluctuation
        const supplyChange = supplyTrend * supplyFluctuation * (0.5 + Math.random());
        totalSupply = Math.max(50000, totalSupply * (1 + supplyChange));
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
    
    // Prix de référence autour duquel on veut rester
    const referencePrice = 0.00056;
    
    // Générer une variation de prix basée sur plusieurs facteurs
    
    // 1. Tendance de base selon la phase du marché (réduite pour limiter les variations)
    let baseTrend;
    switch (marketPhase) {
        case 'accumulation':
            baseTrend = 0.0005 + (Math.random() * 0.001);
            break;
        case 'markup':
            baseTrend = 0.001 + (Math.random() * 0.002);
            break;
        case 'distribution':
            baseTrend = 0.0005 - (Math.random() * 0.001);
            break;
        case 'markdown':
            baseTrend = -0.001 - (Math.random() * 0.002);
            break;
        default:
            baseTrend = 0;
    }
    
    // 2. Facteur de tendance (direction du marché)
    const trendFactor = marketTrend * baseTrend * 0.5; // Réduit de moitié
    
    // 3. Facteur aléatoire (bruit du marché)
    const noiseRange = volatility * (0.3 + Math.random() * 0.3); // Réduit
    const randomFactor = (Math.random() * 2 - 1) * noiseRange;
    
    // 4. Impact des événements (réduit)
    const eventFactor = eventType ? (eventImpact / eventDuration) * 0.5 : 0;
    
    // 5. Facteur de retour à la moyenne (vers le prix de référence)
    const meanReversionFactor = (referencePrice - currentPrice) * 0.05;
    
    // 6. Facteur de stabilisation (plus le prix s'éloigne de la référence, plus il est ramené)
    const stabilizationFactor = Math.abs(currentPrice - referencePrice) > (referencePrice * 0.3) 
        ? (referencePrice - currentPrice) * 0.1 
        : 0;
    
    // Combiner tous les facteurs pour le changement de prix
    const priceChangePct = trendFactor + randomFactor + eventFactor + meanReversionFactor + stabilizationFactor;
    
    // Appliquer le changement de prix avec un limiteur pour éviter les mouvements extrêmes
    const maxChange = 0.01; // Maximum 1% de changement par mise à jour (réduit)
    const limitedChangePct = Math.max(Math.min(priceChangePct, maxChange), -maxChange);
    
    // Appliquer le changement de prix
    const oldPrice = currentPrice;
    currentPrice = currentPrice * (1 + limitedChangePct);
    
    // Limiter le prix à une plage autour du prix de référence
    const minPrice = referencePrice * 0.7; // -30% du prix de référence
    const maxPrice = referencePrice * 1.4; // +40% du prix de référence
    currentPrice = Math.max(Math.min(currentPrice, maxPrice), minPrice);
    
    // Ajouter le nouveau prix à l'historique
    priceHistory.push(currentPrice);
    if (priceHistory.length > 300) { // Garder un historique limité
        priceHistory.shift();
    }
    
    // Calculer le changement de prix en pourcentage
    const pricePctChange = ((currentPrice - oldPrice) / oldPrice) * 100;
    
    // Mettre à jour la capitalisation boursière (prix * supply)
    marketCap = (currentPrice * totalSupply).toFixed(2); // Prix * supply en millions
    
    // Mettre à jour le volume (corrélé à la volatilité et au changement de prix)
    const volumeMultiplier = eventType ? 2 : 1; // Volume plus élevé pendant les événements
    const volumeChange = Math.abs(pricePctChange) * (0.5 + Math.random()) * volumeMultiplier;
    volume24h = (parseFloat(volume24h) + volumeChange * 0.1).toFixed(2);
    if (volume24h < 0.5) volume24h = 0.5; // Minimum volume
    
    // Mettre à jour la performance sur 7 jours (moyenne mobile)
    performance7d = (performance7d * 0.95 + pricePctChange * 0.05).toFixed(1);
    
    // Mettre à jour le nombre de détenteurs (augmente plus rapidement en tendance haussière)
    const holderMultiplier = marketPhase === 'markup' ? 3 : (marketPhase === 'markdown' ? 0.5 : 1);
    const holderChange = Math.floor(Math.random() * 50) * (marketTrend > 0 ? 2 : 0.5) * holderMultiplier;
    holders += holderChange;
    
    // Mettre à jour le nombre de transactions (corrélé au volume)
    const txMultiplier = eventType ? 3 : 1; // Plus de transactions pendant les événements
    const txChange = Math.floor(Math.random() * 100 * (parseFloat(volume24h) / 1.8)) * txMultiplier;
    transactions += txChange;
    
    // Mettre à jour les éléments HTML avec animation
    updateUIElements(pricePctChange);
    
    // Mettre à jour le graphique
    updateChart();
    
    // Sauvegarder l'état du marché
    saveMarketState();
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
    
    // Mettre à jour la supply totale
    animateValue(document.querySelector('.data-card:nth-of-type(3) .value'), (totalSupply / 1000).toFixed(2) + 'M');
    
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
    
    // Toujours générer un état aléatoire à chaque chargement de page
    generateRandomMarketState();
    
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