class EventManager {
    static events = [
        {
            id: "raid",
            name: "Channel Raid",
            description: "Another streamer is raiding your channel!",
            probability: 0.2,
            applicableStreams: ["all"],
            effect: function() {
                const viewerBoost = Math.floor(Math.random() * 20) + 10;
                GAME.currentStream.currentViewers += viewerBoost;
                UI.updateViewerCount(GAME.currentStream.currentViewers);
                UI.logEvent(`A raid brought in ${viewerBoost} new viewers!`);
                GAME.player.changeReputation(1);
                return {viewers: viewerBoost, reputation: 1};
            }
        },
        {
            id: "technical_difficulties",
            name: "Technical Difficulties",
            description: "Your stream is experiencing technical issues!",
            probability: 0.15,
            applicableStreams: ["all"],
            effect: function() {
                const viewerLoss = Math.floor(GAME.currentStream.currentViewers * 0.2);
                GAME.currentStream.currentViewers -= viewerLoss;
                UI.updateViewerCount(GAME.currentStream.currentViewers);
                UI.logEvent(`Technical difficulties caused ${viewerLoss} viewers to leave.`);
                GAME.player.changeReputation(-1);
                return {viewers: -viewerLoss, reputation: -1};
            }
        },
        {
            id: "big_donation",
            name: "Big Donation",
            description: "Someone made a large donation!",
            probability: 0.1,
            applicableStreams: ["all"],
            effect: function() {
                const amount = Math.floor(Math.random() * 50) + 50;
                GAME.player.addMoney(amount);
                UI.logEvent(`Wow! Someone donated $${amount}!`);
                GAME.player.stats.totalDonations += amount;
                return {money: amount};
            }
        },
        {
            id: "trolls",
            name: "Troll Attack",
            description: "Trolls are spamming your chat!",
            probability: 0.15,
            applicableStreams: ["all"],
            effect: function() {
                // Effect depends on streamer's reputation
                if (GAME.player.reputation > 70) {
                    UI.logEvent("Trolls tried to spam your chat, but your community defended you!");
                    GAME.player.changeReputation(1);
                    return {reputation: 1};
                } else {
                    const viewerLoss = Math.floor(GAME.currentStream.currentViewers * 0.1);
                    GAME.currentStream.currentViewers -= viewerLoss;
                    UI.updateViewerCount(GAME.currentStream.currentViewers);
                    UI.logEvent(`Trolls in chat caused ${viewerLoss} viewers to leave.`);
                    GAME.player.changeReputation(-1);
                    return {viewers: -viewerLoss, reputation: -1};
                }
            }
        },
        {
            id: "viral_moment",
            name: "Viral Moment",
            description: "Something amazing happened that might go viral!",
            probability: 0.05,
            applicableStreams: ["all"],
            effect: function() {
                const viewerBoost = Math.floor(Math.random() * 50) + 30;
                GAME.currentStream.currentViewers += viewerBoost;
                const subscriberBoost = Math.floor(Math.random() * 10) + 5;
                GAME.player.addSubscribers(subscriberBoost);
                UI.updateViewerCount(GAME.currentStream.currentViewers);
                UI.logEvent(`You had a viral moment! Gained ${viewerBoost} viewers and ${subscriberBoost} subscribers!`);
                GAME.player.changeReputation(2);
                return {viewers: viewerBoost, subscribers: subscriberBoost, reputation: 2};
            }
        },
        {
            id: "gaming_win",
            name: "Epic Game Victory",
            description: "You just won in an spectacular way!",
            probability: 0.2,
            applicableStreams: ["gaming"],
            effect: function() {
                const skillBoost = 0.1;
                GAME.player.improveSkill("gaming", skillBoost);
                const viewerBoost = Math.floor(Math.random() * 15) + 5;
                GAME.currentStream.currentViewers += viewerBoost;
                UI.updateViewerCount(GAME.currentStream.currentViewers);
                UI.logEvent(`Epic victory! Gaming skill increased and gained ${viewerBoost} viewers!`);
                return {viewers: viewerBoost, skill: "gaming"};
            }
        },
        {
            id: "coding_breakthrough",
            name: "Coding Breakthrough",
            description: "You solved a difficult problem!",
            probability: 0.2,
            applicableStreams: ["coding"],
            effect: function() {
                const skillBoost = 0.1;
                GAME.player.improveSkill("technical", skillBoost);
                const viewerBoost = Math.floor(Math.random() * 10) + 3;
                GAME.currentStream.currentViewers += viewerBoost;
                UI.updateViewerCount(GAME.currentStream.currentViewers);
                UI.logEvent(`Coding breakthrough! Technical skill increased and gained ${viewerBoost} viewers!`);
                return {viewers: viewerBoost, skill: "technical"};
            }
        }
    ];
    
    static getRandomEvent(streamType) {
        // Filter events applicable to current stream type
        const applicableEvents = this.events.filter(event => {
            return event.applicableStreams.includes("all") || event.applicableStreams.includes(streamType);
        });
        
        // Weight by probability
        const totalProbability = applicableEvents.reduce((sum, event) => sum + event.probability, 0);
        let randomValue = Math.random() * totalProbability;
        
        for (const event of applicableEvents) {
            randomValue -= event.probability;
            if (randomValue <= 0) {
                return event;
            }
        }
        
        // Fallback
        return applicableEvents[0];
    }
    
    static triggerEvent(event) {
        if (!GAME.currentStream.active) return;
        
        GAME.player.stats.totalEvents++;
        const result = event.effect();
        UI.showNotification(`EVENT: ${event.name}`);
        
        return result;
    }
}
