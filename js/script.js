// Variables globales pour suivre l'état du marché
let currentPrice = 0.00134; // Prix initial calculé pour avoir MC = 134M avec supply = 100M
let initialPrice = 0.00134;
let marketCap = 134; // en millions (objectif de capitalisation)
let volume24h = 4.2; // en millions (environ 3% de la MC)
let performance7d = 3.5; // en pourcentage, tendance modérée
let holders = 32500; // nombre de détenteurs
let transactions = 185000; // nombre de transactions
let lastUpdateTime = Date.now();
let priceChart = null;
let priceHistory = []; // Historique des prix pour calculer les tendances
let marketTrend = 0.2; // Tendance légèrement positive (0.2 sur une échelle de -1 à 1)
let trendDuration = 0; // Durée de la tendance actuelle
let volatility = 0.008; // Volatilité du marché réduite (0.8%)
let totalSupply = 100000; // Supply total FIXE à 100M (en milliers)
let marketPhase = 'accumulation'; // Phase de marché initiale
let phaseDuration = 0; // Durée de la phase actuelle
let lastEventTime = 0; // Temps écoulé depuis le dernier événement majeur
let eventProbability = 0.02; // Probabilité réduite d'un événement majeur
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
    const data = [];
    const labels = [];
    const now = new Date();
    
    // Utiliser les 60 derniers points de l'historique des prix si disponible
    if (priceHistory.length >= 60) {
        // Prendre les 60 derniers points
        const recentHistory = priceHistory.slice(-60);
        
        for (let i = 0; i < recentHistory.length; i++) {
            // Ajouter des variations pour créer un effet plus naturel
            let price = recentHistory[i];
            
            // Créer des variations pour un effet plus naturel et moins linéaire
            if (i % 2 === 0) {
                // Petite variation aléatoire tous les 2 points
                const variation = (Math.random() - 0.5) * 0.02; // ±1% de variation
                price = price * (1 + variation);
            }
            
            // Formater le prix avec un nombre approprié de décimales
            if (price < 0.001) {
                price = parseFloat(price.toFixed(5));
            } else if (price < 0.01) {
                price = parseFloat(price.toFixed(4));
            } else if (price < 1) {
                price = parseFloat(price.toFixed(3));
            } else {
                price = parseFloat(price.toFixed(2));
            }
            
            data.push(price);
            
            // Calculer l'heure historique
            const pointTime = new Date(now.getTime() - ((60 - i) * 60000));
            const hours = pointTime.getHours().toString().padStart(2, '0');
            const minutes = pointTime.getMinutes().toString().padStart(2, '0');
            labels.push(`${hours}:${minutes}`);
        }
    } else {
        // Générer des données fictives si l'historique est insuffisant
        let basePrice = currentPrice * 0.85; // Commencer légèrement plus bas
        const trend = 1.0015; // Tendance générale à la hausse
        
        for (let i = 0; i < 60; i++) {
            // Simuler une volatilité réaliste
            let randomFactor;
            
            if (i % 5 === 0) {
                // Créer des points de retournement occasionnels
                randomFactor = ((Math.random() - 0.5) * 0.04); // ±2% de variation
            } else if (i % 3 === 0) {
                // Créer des mouvements plus importants à intervalles réguliers
                randomFactor = ((Math.random() - 0.3) * 0.03); // Tendance légèrement baissière
            } else {
                // Variations normales
                randomFactor = ((Math.random() - 0.5) * 0.01); // ±0.5% de variation
            }
            
            // Appliquer la tendance générale et le facteur aléatoire
            basePrice = basePrice * trend * (1 + randomFactor);
            
            // Créer des plateaux occasionnels (prix stable)
            if (i % 7 === 0 && i > 0) {
                basePrice = data[data.length - 1]; // Même prix que le point précédent
            }
            
            // Formater le prix avec un nombre approprié de décimales
            let price;
            if (basePrice < 0.001) {
                price = parseFloat(basePrice.toFixed(5));
            } else if (basePrice < 0.01) {
                price = parseFloat(basePrice.toFixed(4));
            } else if (basePrice < 1) {
                price = parseFloat(basePrice.toFixed(3));
            } else {
                price = parseFloat(basePrice.toFixed(2));
            }
            
            data.push(price);
            
            // Calculer l'heure historique
            const pointTime = new Date(now.getTime() - ((60 - i) * 60000));
            const hours = pointTime.getHours().toString().padStart(2, '0');
            const minutes = pointTime.getMinutes().toString().padStart(2, '0');
            labels.push(`${hours}:${minutes}`);
        }
    }
    
    return { prices: data, labels: labels };
}

// Fonction pour initialiser le graphique de prix
function initPriceChart() {
    const ctx = document.getElementById('priceChart').getContext('2d');
    const chartData = generateChartData();
    
    // Calculer les gradients pour le fond du graphique
    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, 'rgba(76, 111, 255, 0.4)');
    gradient.addColorStop(0.5, 'rgba(76, 111, 255, 0.1)');
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
                borderWidth: 2,
                backgroundColor: gradient,
                fill: true,
                tension: 0.2, // Légère tension pour courber les lignes
                pointRadius: 1.5, // Points plus petits mais visibles
                pointHoverRadius: 6,
                pointBackgroundColor: '#00d2ff',
                pointHoverBorderWidth: 3,
                pointHoverBorderColor: '#ffffff',
                stepped: false, // Désactiver l'effet d'escalier pour des courbes plus naturelles
                borderJoinStyle: 'round', // Jonctions arrondies pour un aspect plus naturel
                segment: {
                    borderColor: ctx => {
                        // Changer la couleur de la ligne en fonction de la direction
                        const index = ctx.p0DataIndex;
                        const prev = ctx.p0.parsed.y;
                        const next = ctx.p1.parsed.y;
                        return prev < next ? 'rgba(72, 187, 120, 0.8)' : 'rgba(245, 101, 101, 0.8)';
                    },
                    borderWidth: ctx => {
                        // Ligne plus épaisse pour les mouvements importants
                        const index = ctx.p0DataIndex;
                        const prev = ctx.p0.parsed.y;
                        const next = ctx.p1.parsed.y;
                        const change = Math.abs((next - prev) / prev);
                        return change > 0.005 ? 3 : 2;
                    }
                }
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: {
                duration: 1000,
                easing: 'easeOutQuart'
            },
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
                            // Formater le prix avec un nombre approprié de décimales
                            const price = context.raw;
                            let formattedPrice;
                            
                            if (price < 0.001) {
                                formattedPrice = price.toFixed(5);
                            } else if (price < 0.01) {
                                formattedPrice = price.toFixed(4);
                            } else {
                                formattedPrice = price.toFixed(3);
                            }
                            
                            // Supprimer les zéros inutiles à la fin
                            formattedPrice = formattedPrice.replace(/\.?0+$/, '');
                            
                            return `$${formattedPrice}`;
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
                            // Formater le prix avec un nombre approprié de décimales
                            let formattedValue;
                            
                            if (value < 0.001) {
                                formattedValue = value.toFixed(5);
                            } else if (value < 0.01) {
                                formattedValue = value.toFixed(4);
                            } else {
                                formattedValue = value.toFixed(3);
                            }
                            
                            // Supprimer les zéros inutiles à la fin
                            formattedValue = formattedValue.replace(/\.?0+$/, '');
                            
                            return '$' + formattedValue;
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
                    cubicInterpolationMode: 'monotone',
                    tension: 0.4 // Tension globale pour des courbes plus naturelles
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
    
    // Prix cible pour maintenir une MC autour de 134M
    const targetPrice = 0.00134; // 134M / 100M = 0.00134
    
    // Générer une variation de prix naturelle mais limitée
    
    // 1. Tendance de base selon la phase du marché (réduite)
    let baseTrend;
    switch (marketPhase) {
        case 'accumulation':
            baseTrend = 0.0001 + (Math.random() * 0.0002);
            break;
        case 'markup':
            baseTrend = 0.0002 + (Math.random() * 0.0004);
            break;
        case 'distribution':
            baseTrend = -0.0001 + (Math.random() * 0.0002);
            break;
        case 'markdown':
            baseTrend = -0.0003 - (Math.random() * 0.0002);
            break;
        default:
            baseTrend = 0;
    }
    
    // 2. Facteur de tendance (direction du marché)
    const trendFactor = marketTrend * baseTrend;
    
    // 3. Facteur aléatoire (bruit du marché) - volatilité réduite
    const noiseRange = volatility * currentPrice * (0.3 + Math.random() * 0.3);
    const randomFactor = (Math.random() * 2 - 1) * noiseRange;
    
    // 4. Impact des événements (réduit)
    const eventFactor = eventType ? (eventImpact / eventDuration) * 0.1 : 0;
    
    // 5. Facteur de retour à la moyenne (force de rappel vers le prix cible)
    const meanReversionFactor = (targetPrice - currentPrice) * 0.03;
    
    // 6. Facteur de momentum (tendance à poursuivre la direction récente, mais limité)
    let momentumFactor = 0;
    if (priceHistory.length >= 5) {
        const recentPrices = priceHistory.slice(-5);
        const recentTrend = (recentPrices[recentPrices.length - 1] - recentPrices[0]) / recentPrices[0];
        momentumFactor = recentTrend * 0.005; // Réduit à 0.5%
    }
    
    // Combiner tous les facteurs pour le changement de prix
    const priceChangePct = trendFactor + randomFactor + eventFactor + meanReversionFactor + momentumFactor;
    
    // Appliquer le changement de prix avec un limiteur pour éviter les mouvements extrêmes
    // Limiter à 1% de variation par mise à jour
    const maxChange = 0.01;
    const limitedChangePct = Math.max(Math.min(priceChangePct, maxChange), -maxChange);
    
    // Appliquer le changement de prix
    const oldPrice = currentPrice;
    currentPrice = currentPrice * (1 + limitedChangePct);
    
    // Limiter le prix à une plage raisonnable autour du prix cible
    const minPrice = targetPrice * 0.85; // -15% du prix cible
    const maxPrice = targetPrice * 1.15; // +15% du prix cible
    currentPrice = Math.max(minPrice, Math.min(maxPrice, currentPrice));
    
    // Force de rappel supplémentaire si le prix s'éloigne trop du prix cible
    if (Math.abs(currentPrice - targetPrice) > targetPrice * 0.1) {
        currentPrice = currentPrice + (targetPrice - currentPrice) * 0.1;
    }
    
    // Ajouter le nouveau prix à l'historique
    priceHistory.push(currentPrice);
    if (priceHistory.length > 300) { // Garder un historique limité
        priceHistory.shift();
    }
    
    // Calculer le changement de prix en pourcentage
    const pricePctChange = ((currentPrice - oldPrice) / oldPrice) * 100;
    
    // Mettre à jour la capitalisation boursière (prix * supply)
    marketCap = (currentPrice * totalSupply / 1000).toFixed(2);
    
    // Mettre à jour le volume (corrélé à la capitalisation et à la volatilité)
    // Volume de base entre 3% et 6% de la MC
    const volumeBasePercent = 0.03 + (Math.random() * 0.03);
    const volumeBase = parseFloat(marketCap) * volumeBasePercent;
    
    // Bonus de volume basé sur la volatilité et les événements
    const volatilityBonus = Math.abs(pricePctChange) * 0.5; // Plus de volume quand le prix bouge
    const eventBonus = eventType ? parseFloat(marketCap) * 0.02 : 0; // Plus de volume pendant les événements
    
    // Variation quotidienne naturelle (certains jours ont plus de volume que d'autres)
    const dailyVariation = (Math.random() * 0.04 - 0.02) * parseFloat(marketCap); // ±2% de variation aléatoire
    
    // Calculer le volume final avec un minimum de 3M
    const calculatedVolume = volumeBase + volatilityBonus + eventBonus + dailyVariation;
    volume24h = Math.max(3.0, calculatedVolume).toFixed(2);
    
    // Mettre à jour la performance sur 7 jours (moyenne mobile)
    performance7d = (performance7d * 0.95 + pricePctChange * 0.05).toFixed(1);
    
    // Mettre à jour les éléments HTML avec animation
    updateUIElements(pricePctChange);
    
    // Mettre à jour le graphique
    updateChart();
    
    // Sauvegarder l'état du marché
    saveMarketState();
}

// Fonction pour mettre à jour les éléments de l'interface utilisateur avec animation
function updateUIElements(pricePctChange) {
    // Obtenir le dernier prix du graphique s'il existe
    let displayPrice = currentPrice;
    if (priceChart && priceChart.data.datasets[0].data.length > 0) {
        // Utiliser le dernier prix du graphique pour l'affichage
        displayPrice = priceChart.data.datasets[0].data[priceChart.data.datasets[0].data.length - 1];
    }
    
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
        
        // Mettre à jour le texte avec le prix du graphique
        // Formater le prix avec 5 décimales maximum, sans zéros inutiles
        let formattedPrice;
        if (displayPrice < 0.001) {
            formattedPrice = displayPrice.toFixed(6);
        } else if (displayPrice < 0.01) {
            formattedPrice = displayPrice.toFixed(5);
        } else {
            formattedPrice = displayPrice.toFixed(4);
        }
        // Supprimer les zéros inutiles à la fin
        formattedPrice = formattedPrice.replace(/\.?0+$/, '');
        el.textContent = '$' + formattedPrice;
    });
    
    // Calculer la capitalisation boursière basée sur le prix affiché
    marketCap = (displayPrice * totalSupply / 1000).toFixed(2);
    
    // S'assurer que la capitalisation est proche de 134M
    if (Math.abs(parseFloat(marketCap) - 134) > 20) {
        // Ajuster la capitalisation avec une légère variation aléatoire
        marketCap = (134 + (Math.random() * 12 - 6)).toFixed(2); // 128M à 140M
    }
    
    // Mettre à jour la capitalisation boursière
    animateValue(document.querySelector('.data-card:nth-of-type(2) .value'), '$' + marketCap + 'M');
    
    // Mettre à jour la supply totale - toujours fixée à 100M
    animateValue(document.querySelector('.data-card:nth-of-type(3) .value'), '100M');
    
    // Mettre à jour le volume 24h - s'assurer qu'il est d'au moins 3M
    // Ajouter une variation aléatoire basée sur le mouvement du prix pour plus de cohérence
    const priceMovement = Math.abs(pricePctChange);
    const volumeVariation = (Math.random() * 0.4 - 0.2) + (priceMovement * 5); // Variation basée sur le mouvement du prix
    volume24h = (Math.max(3.0, parseFloat(volume24h) + volumeVariation)).toFixed(2);
    
    // Formater le volume avec 1 décimale si >= 10M, sinon avec 2 décimales
    let formattedVolume;
    if (parseFloat(volume24h) >= 10) {
        formattedVolume = parseFloat(volume24h).toFixed(1) + 'M';
    } else {
        formattedVolume = volume24h + 'M';
    }
    
    // Mettre à jour l'affichage du volume
    animateValue(document.querySelector('.data-card:nth-of-type(4) .value'), '$' + formattedVolume);
    
    // Mettre à jour les statistiques détaillées
    const performanceElement = document.querySelector('.stat-card:first-of-type p');
    const performanceValue = (pricePctChange * 100).toFixed(1);
    const performanceSign = performanceValue > 0 ? '+' : '';
    performanceElement.textContent = performanceSign + performanceValue + '% (7j)';
    performanceElement.style.color = performanceValue > 0 ? 'var(--success-color)' : 'var(--danger-color)';
    
    // Mettre à jour le nombre de détenteurs en fonction du mouvement du prix
    const holdersElement = document.querySelector('.stat-card:nth-of-type(2) p');
    
    // Générer un nombre aléatoire de détenteurs entre 15,000 et 25,000
    // Cette approche garantit que le nombre change à chaque mise à jour
    const baseHolders = 15000 + Math.floor(Math.random() * 10000);
    
    // Ajouter une variation supplémentaire basée sur le prix
    const priceEffect = Math.floor(Math.abs(pricePctChange * 100) * 200);
    const holderBonus = pricePctChange > 0 ? priceEffect : -Math.floor(priceEffect * 0.5);
    
    // Nombre final de détenteurs
    const newHolders = Math.max(15000, baseHolders + holderBonus);
    holdersElement.textContent = newHolders.toLocaleString();
    
    // Mettre à jour le nombre de transactions
    const txElement = document.querySelector('.stat-card:nth-of-type(3) p');
    
    // Générer un nombre aléatoire de transactions entre 100,000 et 200,000
    // Cette approche garantit que le nombre change à chaque mise à jour
    const baseTx = 100000 + Math.floor(Math.random() * 100000);
    
    // Ajouter une variation basée sur le volume et la volatilité
    const volumeFactor = parseFloat(volume24h) / 3; // Normaliser par rapport à un volume de référence de 3M
    const volatilityFactor = Math.abs(pricePctChange * 100) * 1000; // Convertir en pourcentage et amplifier
    
    // Nombre final de transactions
    const newTx = Math.max(100000, baseTx + Math.floor(volatilityFactor * volumeFactor));
    txElement.textContent = newTx.toLocaleString();
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
    
    // Ajouter des variations supplémentaires aux données existantes pour plus de mouvement
    const existingData = priceChart.data.datasets[0].data;
    const modifiedData = [];
    
    // Créer des variations plus prononcées dans les données existantes
    let lastValue = existingData[0];
    let trend = 0; // Tendance actuelle (positive ou négative)
    
    for (let i = 0; i < existingData.length; i++) {
        const currentValue = parseFloat(existingData[i]);
        
        // Ajouter des variations plus importantes à certains points
        let adjustedValue;
        
        // Déterminer si on change la tendance
        if (i % 7 === 0) {
            // Changer la tendance tous les 7 points environ
            trend = Math.random() > 0.5 ? 1 : -1;
        }
        
        // Créer des mouvements plus naturels et irréguliers
        if (i % 3 === 0) { // Points significatifs
            // Variation plus importante pour créer des pics ou des creux
            const variationPercent = 0.02 + (Math.random() * 0.04); // 2-6% de variation
            const direction = Math.random() > 0.6 ? trend : -trend; // Suivre la tendance avec probabilité
            adjustedValue = lastValue * (1 + (direction * variationPercent));
        } else if (i % 5 === 0) { // Points de retournement potentiels
            // Créer un retournement possible
            const reverseFactor = -trend * (0.01 + Math.random() * 0.02);
            adjustedValue = lastValue * (1 + reverseFactor);
        } else {
            // Variation normale avec bruit aléatoire
            const noise = (Math.random() - 0.5) * 0.015; // ±0.75% de bruit aléatoire
            const trendFactor = trend * (0.005 + Math.random() * 0.01); // Facteur de tendance
            
            // Combiner tendance et bruit
            adjustedValue = lastValue * (1 + trendFactor + noise);
            
            // Ajouter occasionnellement des micro-mouvements
            if (Math.random() > 0.7) {
                const microMove = (Math.random() - 0.5) * 0.005;
                adjustedValue *= (1 + microMove);
            }
        }
        
        // Éviter les valeurs négatives ou nulles
        adjustedValue = Math.max(adjustedValue, 0.00001);
        
        // Limiter les variations extrêmes
        const maxChange = 0.08; // 8% max de variation entre deux points
        const changeRatio = Math.abs((adjustedValue - lastValue) / lastValue);
        
        if (changeRatio > maxChange) {
            // Réduire la variation si elle est trop importante
            const direction = adjustedValue > lastValue ? 1 : -1;
            adjustedValue = lastValue * (1 + (direction * maxChange));
        }
        
        lastValue = adjustedValue;
        
        // Formater avec le bon nombre de décimales
        if (adjustedValue < 0.001) {
            adjustedValue = parseFloat(adjustedValue.toFixed(5));
        } else if (adjustedValue < 0.01) {
            adjustedValue = parseFloat(adjustedValue.toFixed(4));
        } else if (adjustedValue < 1) {
            adjustedValue = parseFloat(adjustedValue.toFixed(3));
        } else {
            adjustedValue = parseFloat(adjustedValue.toFixed(2));
        }
        
        modifiedData.push(adjustedValue);
    }
    
    // Mettre à jour les données du graphique
    priceChart.data.datasets[0].data = modifiedData;
    
    // Modifier aléatoirement les options de ligne pour plus de dynamisme
    const randomTension = 0.3 + (Math.random() * 0.3); // Tension entre 0.3 et 0.6
    priceChart.options.elements.line.tension = randomTension;
    
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