// Variables globales pour suivre l'état du marché
let currentPrice = 0.000078; // Prix fixé à 0.000078
let initialPrice = 0.000078;
let marketCap = 65; // Capitalisation fixée à 65M
let volume24h = 0.612; // Volume fixé à environ 612K
let performance7d = 8.7; // Performance sur 7 jours
let holders = 19342; // Nombre de détenteurs
let transactions = 145720; // Nombre de transactions
let lastUpdateTime = Date.now();
let priceChart = null;
let priceHistory = []; // Historique des prix pour calculer les tendances
let marketTrend = 1; // Tendance du marché (1 = haussier, -1 = baissier)
let trendDuration = 0; // Durée de la tendance actuelle
let volatility = 0.005; // Volatilité réduite pour limiter les variations
let totalSupply = 100000; // Supply totale fixée à 100M
let marketPhase = 'accumulation'; // Phase du marché (accumulation, markup, distribution, markdown)
let phaseDuration = 60; // Durée de chaque phase en secondes
let phaseProgress = 0; // Progression dans la phase actuelle
let lastEventTime = 0; // Temps écoulé depuis le dernier événement majeur
let eventProbability = 0.01; // Probabilité réduite d'un événement majeur
let eventImpact = 0; // Impact de l'événement actuel sur le prix
let eventDuration = 0; // Durée de l'événement actuel
let eventType = null; // Type d'événement actuel
let lastSaveTime = 0; // Temps écoulé depuis la dernière sauvegarde
let supplyFluctuation = 0; // Fluctuation de la supply (en %)
let supplyTrend = 0; // Tendance de la supply
let enablePersistence = true; // Activer la persistance pour maintenir les valeurs
let lastPhaseChange = Date.now();

// Fonction pour sauvegarder l'état du marché dans localStorage
function saveMarketState() {
    // Sauvegarder l'état actuel
    const marketState = {
        currentPrice: 0.000078, // Forcer le prix à 0.000078
        marketCap: 65, // Forcer la capitalisation à 65M
        volume24h: 0.612, // Forcer le volume à environ 612K
        performance7d,
        holders,
        transactions,
        priceHistory,
        marketTrend,
        trendDuration,
        volatility,
        marketPhase,
        phaseDuration,
        phaseProgress,
        totalSupply: 100000, // Forcer la supply à 100M
        lastUpdateTime
    };
    
    localStorage.setItem('avitaMarketState', JSON.stringify(marketState));
}

// Fonction pour charger l'état du marché depuis localStorage
function loadMarketState() {
    try {
        const savedState = localStorage.getItem('avitaMarketState');
        if (savedState) {
            const state = JSON.parse(savedState);
            
            // Forcer les valeurs fixes
            currentPrice = 0.000078;
            marketCap = 65;
            volume24h = 0.612;
            totalSupply = 100000;
            
            // Charger les autres valeurs qui peuvent varier légèrement
            performance7d = state.performance7d || 8.7;
            holders = state.holders || 19342;
            transactions = state.transactions || 145720;
            priceHistory = state.priceHistory || [currentPrice];
            marketTrend = state.marketTrend || 1;
            trendDuration = state.trendDuration || 0;
            volatility = 0.005; // Maintenir une volatilité très faible
            marketPhase = state.marketPhase || 'accumulation';
            phaseDuration = state.phaseDuration || 60;
            phaseProgress = state.phaseProgress || 0;
            lastUpdateTime = state.lastUpdateTime || Date.now();
            
            console.log('État du marché chargé avec succès');
            return true;
        } else {
            console.log('Aucun état du marché sauvegardé, utilisation des valeurs par défaut');
            // Initialiser avec les valeurs par défaut
            initializeMarketData();
            return false;
        }
    } catch (e) {
        console.error('Erreur lors du chargement de l\'état du marché:', e);
        // Initialiser avec les valeurs par défaut
        initializeMarketData();
        return false;
    }
}

// Fonction pour initialiser les données du marché
function initializeMarketData() {
    // Vérifier si des données existent déjà dans le localStorage
    if (loadMarketState()) {
        console.log("Données du marché chargées depuis le localStorage");
        return;
    }

    // Initialiser avec des valeurs par défaut
    currentPrice = 0.000078;
    marketCap = 65.0; // Fixer la capitalisation à 65M
    totalSupply = 100000; // 100M tokens
    volume24h = 0.612; // 612K
    holders = 19342;
    transactions = 145720;
    
    // Initialiser l'historique des prix avec de légères variations autour de 0.000078
    priceHistory = [];
    for (let i = 0; i < 60; i++) {
        // Générer un prix avec une légère variation (±0.5%)
        const variation = (Math.random() * 0.01 - 0.005);
        const price = currentPrice * (1 + variation);
        priceHistory.push(price);
    }
    
    // Initialiser la performance sur 7 jours
    performance7d = "8.7";
    
    // Initialiser la volatilité (pour les variations de prix)
    volatility = 0.01; // Augmenter pour plus de mouvement
    
    // Initialiser la tendance du marché (direction)
    marketTrend = Math.random() > 0.5 ? 1 : -1;
    
    // Initialiser la durée de la tendance (en secondes)
    trendDuration = 5 + Math.floor(Math.random() * 10); // Entre 5 et 15 secondes
    
    // Initialiser le temps de la dernière mise à jour
    lastUpdateTime = Date.now();
    
    // Initialiser la phase du marché
    marketPhase = 'accumulation';
    
    // Initialiser le temps de la dernière phase
    lastPhaseChange = Date.now();
    
    // Initialiser la durée de la phase (en secondes)
    phaseDuration = 30 + Math.floor(Math.random() * 30); // Entre 30 et 60 secondes
    
    // Sauvegarder l'état initial
    saveMarketState();
}

// Fonction pour générer un état de marché aléatoire (pour les nouveaux visiteurs)
function generateRandomMarketState() {
    console.log('Génération d\'un état de marché aléatoire');
    
    // Maintenir la supply fixe à 100M
    totalSupply = 100000; // 100M en milliers
    
    // Calculer le prix cible pour avoir une MC autour de 134M
    const targetPrice = 0.00134; // 134M / 100M = 0.00134
    
    // Générer un prix avec une distribution normale autour du prix cible
    // Utiliser une distribution normale avec une faible variance
    let u = 0, v = 0;
    while (u === 0) u = Math.random();
    while (v === 0) v = Math.random();
    const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
    
    // Appliquer une variation de ±10% maximum autour du prix cible
    const variation = 0.1; // 10% de variation max
    currentPrice = targetPrice * (1 + variation * z / 3); // Division par 3 pour réduire l'amplitude
    
    // Limiter les valeurs extrêmes pour rester proche du prix cible
    const minPrice = targetPrice * 0.9;  // -10% du prix cible
    const maxPrice = targetPrice * 1.1;  // +10% du prix cible
    currentPrice = Math.max(minPrice, Math.min(maxPrice, currentPrice));
    
    // Calculer la capitalisation boursière (prix * supply)
    marketCap = (currentPrice * totalSupply / 1000).toFixed(2);
    
    // Générer une phase de marché avec des probabilités réalistes
    const phases = ['accumulation', 'markup', 'distribution', 'markdown'];
    const phaseWeights = [0.4, 0.3, 0.2, 0.1]; // Favoriser les phases stables
    
    const randomValue = Math.random();
    let cumulativeWeight = 0;
    
    for (let i = 0; i < phases.length; i++) {
        cumulativeWeight += phaseWeights[i];
        if (randomValue <= cumulativeWeight) {
            marketPhase = phases[i];
            break;
        }
    }
    
    // Ajuster la tendance en fonction de la phase, de manière plus naturelle
    switch (marketPhase) {
        case 'accumulation':
            marketTrend = -0.05 + (Math.random() * 0.2); // -0.05 à 0.15
            break;
        case 'markup':
            marketTrend = 0.1 + (Math.random() * 0.2); // 0.1 à 0.3
            break;
        case 'distribution':
            marketTrend = -0.05 + (Math.random() * 0.15); // -0.05 à 0.1
            break;
        case 'markdown':
            marketTrend = -0.2 + (Math.random() * 0.1); // -0.2 à -0.1
            break;
    }
    
    // Volume en fonction de la capitalisation (2.5% à 4.5% de la MC)
    const volumePercent = 0.025 + (Math.random() * 0.02);
    volume24h = Math.max(1.0, (parseFloat(marketCap) * volumePercent).toFixed(2));
    
    // Performance avec une distribution plus naturelle (-5% à +8%)
    performance7d = ((Math.random() * 13) - 5).toFixed(1);
    
    // Nombre de détenteurs en fonction de la capitalisation
    const holdersFactor = 200 + (Math.random() * 100); // 200 à 300 détenteurs par million de MC
    holders = Math.max(20000, Math.floor(parseFloat(marketCap) * holdersFactor));
    
    // Nombre de transactions en fonction du volume
    const txFactor = 35000 + (Math.random() * 15000); // 35k à 50k tx par million de volume
    transactions = Math.max(100000, Math.floor(parseFloat(volume24h) * txFactor));
    
    // Générer un historique de prix réaliste
    priceHistory = [];
    let tempPrice = currentPrice * 0.97; // Commencer légèrement plus bas
    
    // Simuler 60 points de données avec une tendance vers le prix actuel
    for (let i = 0; i < 60; i++) {
        // Tendance générale vers le prix actuel
        const trend = (currentPrice - tempPrice) / (60 - i) * 1.05;
        
        // Ajouter un bruit réaliste (volatilité réduite)
        const noise = tempPrice * (Math.random() * 0.006 - 0.003);
        
        tempPrice = tempPrice + trend + noise;
        priceHistory.push(tempPrice);
    }
    
    // Sauvegarder cet état initial si la persistance est activée
    if (enablePersistence) {
        saveMarketState();
    }
}

// Fonction pour générer les données du graphique
function generateChartData() {
    // Créer un tableau de 60 points avec des variations naturelles
    let data = [];
    let labels = [];
    
    // Prix de base
    const basePrice = 0.000078;
    
    // Générer 60 points de données avec des variations naturelles
    let currentPrice = basePrice;
    let trend = Math.random() > 0.5 ? 1 : -1; // Tendance initiale (hausse ou baisse)
    let trendStrength = Math.random() * 0.4 + 0.3; // Force de la tendance (0.3 à 0.7)
    let trendDuration = Math.floor(Math.random() * 8) + 5; // Durée de la tendance (5-12 points)
    let currentTrendPoint = 0;
    
    for (let i = 0; i < 60; i++) {
        // Changer de tendance périodiquement pour créer des mouvements naturels
        if (currentTrendPoint >= trendDuration) {
            // Changer de tendance
            trend = -trend;
            trendStrength = Math.random() * 0.4 + 0.3; // Nouvelle force de tendance
            trendDuration = Math.floor(Math.random() * 8) + 5; // Nouvelle durée
            currentTrendPoint = 0;
        }
        
        // Calculer une variation naturelle
        // Plus forte au début d'une tendance, plus faible vers la fin
        const trendProgress = currentTrendPoint / trendDuration;
        const trendEffect = trendStrength * (1 - trendProgress);
        
        // Variation de base (±1.5%)
        const maxVariation = basePrice * 0.015;
        
        // Facteur de tendance
        const trendFactor = trend * trendEffect * maxVariation;
        
        // Bruit aléatoire (±0.5%)
        const noise = (Math.random() * 2 - 1) * basePrice * 0.005;
        
        // Force de rappel vers le prix de base (plus le prix s'éloigne, plus la force est grande)
        const deviation = currentPrice - basePrice;
        const reversion = -deviation * 0.15;
        
        // Calculer la nouvelle variation
        const variation = trendFactor + noise + reversion;
        
        // Appliquer la variation
        currentPrice = currentPrice + variation;
        
        // Limiter les variations extrêmes (±5% du prix de base)
        const minPrice = basePrice * 0.95;
        const maxPrice = basePrice * 1.05;
        currentPrice = Math.max(minPrice, Math.min(maxPrice, currentPrice));
        
        // Ajouter le prix au tableau
        data.push(currentPrice);
        
        // Incrémenter le compteur de tendance
        currentTrendPoint++;
    }
    
    // Générer les étiquettes de temps historiques (HH:MM)
    const now = new Date();
    for (let i = 0; i < 60; i++) {
        const timePoint = new Date(now.getTime() - (59 - i) * 60000);
        const hours = timePoint.getHours().toString().padStart(2, '0');
        const minutes = timePoint.getMinutes().toString().padStart(2, '0');
        labels.push(`${hours}:${minutes}`);
    }
    
    return {
        labels: labels,
        data: data
    };
}

// Fonction pour initialiser le graphique des prix
function initPriceChart() {
    const ctx = document.getElementById('priceChart').getContext('2d');
    
    // Générer les données initiales du graphique
    const chartData = generateChartData();
    
    // Créer un dégradé pour l'arrière-plan
    const gradient = ctx.createLinearGradient(0, 0, 0, 300);
    gradient.addColorStop(0, 'rgba(76, 111, 255, 0.2)');
    gradient.addColorStop(1, 'rgba(76, 111, 255, 0)');
    
    // Configuration du graphique
    priceChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: chartData.labels,
            datasets: [{
                label: 'Prix AVITA (USD)',
                data: chartData.data,
                borderColor: '#4c6fff',
                borderWidth: 2,
                pointRadius: 0, // Pas de points visibles
                pointHoverRadius: 3, // Points visibles au survol
                pointBackgroundColor: '#4c6fff',
                pointHoverBackgroundColor: '#ffffff',
                pointHoverBorderColor: '#4c6fff',
                pointHoverBorderWidth: 2,
                fill: true,
                backgroundColor: gradient,
                tension: 0.3, // Légère tension pour une courbe naturelle
                stepped: false, // Pas d'effet d'escalier
                cubicInterpolationMode: 'monotone'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: {
                duration: 800,
                easing: 'easeOutQuad'
            },
            hover: {
                mode: 'index',
                intersect: false
            },
            elements: {
                line: {
                    tension: 0.3 // Légère tension pour une courbe naturelle
                },
                point: {
                    radius: 0 // Pas de points
                }
            },
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    enabled: true,
                    backgroundColor: 'rgba(0, 0, 0, 0.7)',
                    titleColor: '#fff',
                    bodyColor: '#fff',
                    titleFont: {
                        size: 14,
                        weight: 'bold'
                    },
                    bodyFont: {
                        size: 13
                    },
                    padding: 10,
                    displayColors: false,
                    callbacks: {
                        label: function(context) {
                            return `Prix: $${context.parsed.y.toFixed(6)}`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        color: 'rgba(255, 255, 255, 0.7)',
                        maxRotation: 0,
                        autoSkip: true,
                        maxTicksLimit: 6
                    }
                },
                y: {
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    },
                    ticks: {
                        color: 'rgba(255, 255, 255, 0.7)',
                        callback: function(value) {
                            return '$' + value.toFixed(6);
                        }
                    },
                    // Définir une plage fixe mais légèrement plus large pour les variations
                    min: 0.0000772,
                    max: 0.0000788
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
    
    // Maintenir la supply fixe à 100M
    totalSupply = 100000;
    
    // Prix cible fixé à 0.000078
    const targetPrice = 0.000078;
    
    // Sauvegarder l'ancien prix pour calculer le pourcentage de changement
    const oldPrice = currentPrice;
    
    // Générer une variation de prix naturelle autour de 0.000078
    // 1. Tendance de base selon la phase du marché
    let baseTrend;
    switch (marketPhase) {
        case 'accumulation':
            baseTrend = 0.0000002 + (Math.random() * 0.0000003);
            break;
        case 'markup':
            baseTrend = 0.0000004 + (Math.random() * 0.0000005);
            break;
        case 'distribution':
            baseTrend = -0.0000002 + (Math.random() * 0.0000003);
            break;
        case 'markdown':
            baseTrend = -0.0000004 - (Math.random() * 0.0000003);
            break;
        default:
            baseTrend = 0.0000002;
    }
    
    // 2. Facteur de tendance (direction du marché)
    const trendFactor = marketTrend * baseTrend;
    
    // 3. Facteur aléatoire (bruit du marché)
    const noiseRange = volatility * currentPrice * 0.5;
    const randomFactor = (Math.random() * 2 - 1) * noiseRange;
    
    // 4. Facteur de retour à la moyenne (force de rappel vers le prix cible)
    const deviation = currentPrice - targetPrice;
    const meanReversionFactor = -deviation * 0.15;
    
    // Calculer la variation totale du prix
    const priceChange = trendFactor + randomFactor + meanReversionFactor;
    
    // Calculer le nouveau prix avec une variation
    const newPrice = currentPrice * (1 + priceChange);
    
    // Limiter le prix pour qu'il reste dans une plage raisonnable (±5%)
    const minPrice = targetPrice * 0.95;
    const maxPrice = targetPrice * 1.05;
    currentPrice = Math.max(minPrice, Math.min(maxPrice, newPrice));
    
    // Ajouter le prix à l'historique
    priceHistory.push(currentPrice);
    
    // Limiter l'historique à 100 points
    if (priceHistory.length > 100) {
        priceHistory.shift();
    }
    
    // Calculer le pourcentage de changement de prix
    const pricePctChange = (currentPrice - oldPrice) / oldPrice;
    
    // Calculer la capitalisation boursière avec des variations naturelles autour de 65M
    // Avec une légère variation pour plus de naturel
    const baseMarketCap = 65.0; // Valeur de base de la capitalisation
    const marketCapPctChange = pricePctChange * 0.8; // La capitalisation suit le prix mais avec moins d'amplitude
    const marketCapVariation = (Math.random() * 0.4 - 0.2); // ±0.2M de variation aléatoire
    const newMarketCap = baseMarketCap * (1 + marketCapPctChange) + marketCapVariation;

    // Limiter la capitalisation entre 64M et 66M
    marketCap = Math.max(64, Math.min(66, newMarketCap)).toFixed(2);
    
    // Calculer le volume sur 24h - variations naturelles
    // Le volume augmente quand le prix change beaucoup (volatilité)
    const volumeBase = 0.612; // Volume de base à 612K
    const volumeMultiplier = 1 + (Math.abs(pricePctChange) * 20); // Plus de volume quand le prix bouge
    const randomVolumeFactor = 1 + (Math.random() * 0.1 - 0.05); // ±5% de variation aléatoire
    volume24h = volumeBase * volumeMultiplier * randomVolumeFactor;
    
    // Limiter le volume entre 550K et 800K
    volume24h = Math.max(0.55, Math.min(0.8, volume24h));
    
    // Mettre à jour la performance sur 7 jours
    // Amplifier le mouvement du prix pour la performance
    const performanceChange = pricePctChange * 100 * 5;
    performance7d = (parseFloat(performance7d) * 0.9 + performanceChange * 0.1).toFixed(1);
    
    // Mettre à jour l'interface utilisateur
    updateUIElements(pricePctChange);
    
    // Mettre à jour le graphique
    updateChart();
    
    // Sauvegarder l'état du marché
    saveMarketState();
}

// Fonction pour mettre à jour les éléments de l'interface utilisateur
function updateUIElements(pricePctChange) {
    // Obtenir le dernier prix du graphique s'il existe
    let displayPrice = currentPrice;
    if (priceChart && priceChart.data.datasets[0].data.length > 0) {
        // Utiliser le dernier prix du graphique pour l'affichage
        displayPrice = priceChart.data.datasets[0].data[priceChart.data.datasets[0].data.length - 1];
    }
    
    // Mettre à jour tous les affichages de prix avec animation
    const priceElements = document.querySelectorAll('.highlight, #current-price');
    priceElements.forEach(el => {
        // Formater le prix avec le bon nombre de décimales
        const formattedPrice = formatPrice(displayPrice);
        
        // Ajouter la classe pour l'animation de changement de prix
        if (pricePctChange > 0) {
            el.classList.remove('price-down');
            el.classList.add('price-up');
        } else if (pricePctChange < 0) {
            el.classList.remove('price-up');
            el.classList.add('price-down');
        }
        
        // Mettre à jour le texte
        el.textContent = formattedPrice;
        
        // Retirer la classe après l'animation
        setTimeout(() => {
            el.classList.remove('price-up');
            el.classList.remove('price-down');
        }, 1000);
    });
    
    // Mettre à jour la capitalisation boursière
    const marketCapElement = document.getElementById('market-cap');
    if (marketCapElement) {
        // Animer le changement
        const oldValue = marketCapElement.textContent;
        const newValue = `$${marketCap}M`;
        
        if (oldValue !== newValue) {
            // Ajouter une classe pour l'animation
            if (parseFloat(marketCap) > parseFloat(oldValue.replace(/[^0-9.]/g, ''))) {
                marketCapElement.classList.remove('price-down');
                marketCapElement.classList.add('price-up');
            } else {
                marketCapElement.classList.remove('price-up');
                marketCapElement.classList.add('price-down');
            }
            
            // Mettre à jour le texte
            marketCapElement.textContent = newValue;
            
            // Retirer la classe après l'animation
            setTimeout(() => {
                marketCapElement.classList.remove('price-up');
                marketCapElement.classList.remove('price-down');
            }, 1000);
        }
    }
    
    // Mettre à jour le volume sur 24h
    const volumeElement = document.getElementById('volume-24h');
    if (volumeElement) {
        // Formater le volume avec K pour les milliers
        const formattedVolume = volume24h < 1 ? `${Math.round(volume24h * 1000)}K` : `${volume24h.toFixed(2)}M`;
        const newValue = `$${formattedVolume}`;
        
        // Animer le changement
        const oldValue = volumeElement.textContent;
        if (oldValue !== newValue) {
            // Ajouter une classe pour l'animation
            volumeElement.classList.add('update-animation');
            
            // Mettre à jour le texte
            volumeElement.textContent = newValue;
            
            // Retirer la classe après l'animation
            setTimeout(() => {
                volumeElement.classList.remove('update-animation');
            }, 1000);
        }
    }
    
    // Mettre à jour la supply totale - toujours fixe à 100M
    const supplyElement = document.getElementById('total-supply');
    if (supplyElement) {
        supplyElement.textContent = `100M`;
    }
    
    // Mettre à jour la performance sur 7 jours
    const performanceElement = document.querySelector('.stat-card:first-of-type p');
    if (performanceElement) {
        const performanceValue = parseFloat(performance7d);
        const performanceSign = performanceValue > 0 ? '+' : '';
        const newValue = `${performanceSign}${performanceValue}% (7j)`;
        
        // Animer le changement
        const oldValue = performanceElement.textContent;
        if (oldValue !== newValue) {
            // Ajouter une classe pour l'animation
            performanceElement.classList.add('update-animation');
            
            // Mettre à jour le texte et la couleur
            performanceElement.textContent = newValue;
            performanceElement.style.color = performanceValue > 0 ? 'var(--success-color)' : 'var(--danger-color)';
            
            // Retirer la classe après l'animation
            setTimeout(() => {
                performanceElement.classList.remove('update-animation');
            }, 1000);
        }
    }
    
    // Ne pas modifier les autres statistiques détaillées
    // Maintenir les valeurs fixes pour les détenteurs
    const holdersElement = document.querySelector('.stat-card:nth-of-type(2) p');
    if (holdersElement) {
        holdersElement.textContent = '19,342';
    }
    
    // Maintenir les valeurs fixes pour les transactions
    const txElement = document.querySelector('.stat-card:nth-of-type(3) p');
    if (txElement) {
        txElement.textContent = '145,720';
    }
}

// Fonction pour formater le prix avec le bon nombre de décimales
function formatPrice(price) {
    if (price < 0.00001) {
        return price.toFixed(8);
    } else if (price < 0.0001) {
        return price.toFixed(7);
    } else if (price < 0.001) {
        return price.toFixed(6);
    } else if (price < 0.01) {
        return price.toFixed(5);
    } else if (price < 0.1) {
        return price.toFixed(4);
    } else if (price < 1) {
        return price.toFixed(3);
    } else {
        return price.toFixed(2);
    }
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
    
    // Générer des données avec des variations naturelles pour le graphique
    const chartData = generateChartData();
    
    // Mettre à jour les données du graphique
    priceChart.data.labels = chartData.labels;
    priceChart.data.datasets[0].data = chartData.data;
    
    // Configurer une légère tension pour rendre la ligne plus naturelle
    priceChart.options.elements.line.tension = 0.3;
    
    // Activer des animations naturelles
    priceChart.options.animation = {
        duration: 800,
        easing: 'easeOutQuad'
    };
    
    // Mettre à jour le graphique
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