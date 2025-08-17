export class EventManager {
    constructor(game, ui) {
        this.game = game;
        this.ui = ui;
    // Ensure instance access to events even though it's declared as a static field
    // This prevents `this.events` from being undefined in instance methods.
    this.events = this.constructor.events;
    }
    
    static events = [
        {
            id: "raid",
            name: "Channel Raid",
            description: "Another streamer is raiding your channel!",
            probability: 0.1,
            applicableStreams: ["all"],
            effect: (game, ui) => {
                const viewerBoost = Math.floor(Math.random() * 20) + 10;
                game.currentStream.currentViewers += viewerBoost;
                ui.updateViewerCount(game.currentStream.currentViewers);
                ui.logEvent(`A raid brought in ${viewerBoost} new viewers!`);
                game.player.changeReputation(1);
                return {viewers: viewerBoost, reputation: 1};
            }
        },
        {
            id: "technical_difficulties",
            name: "Technical Difficulties",
            description: "Your stream is experiencing technical issues!",
            probability: 0.07,
            applicableStreams: ["all"],
            effect: (game, ui) => {
                const viewerLoss = Math.floor(game.currentStream.currentViewers * 0.2);
                game.currentStream.currentViewers -= viewerLoss;
                ui.updateViewerCount(game.currentStream.currentViewers);
                ui.logEvent(`Technical difficulties caused ${viewerLoss} viewers to leave.`);
                game.player.changeReputation(-1);
                return {viewers: -viewerLoss, reputation: -1};
            }
        },
        {
            id: "big_donation",
            name: "Big Donation",
            description: "Someone made a large donation!",
            probability: 0.05,
            applicableStreams: ["all"],
            effect: (game, ui) => {
                const amount = Math.floor(Math.random() * 50) + 50;
                game.player.addMoney(amount);
                ui.logEvent(`Wow! Someone donated $${amount}!`);
                game.player.stats.totalDonations += amount;
                return {money: amount};
            }
        },
        {
            id: "trolls",
            name: "Troll Attack",
            description: "Trolls are spamming your chat!",
            probability: 0.07,
            applicableStreams: ["all"],
            effect: (game, ui) => {
                // Effect depends on streamer's reputation
                if (game.player.reputation > 70) {
                    ui.logEvent("Trolls tried to spam your chat, but your community defended you!");
                    game.player.changeReputation(1);
                    return {reputation: 1};
                } else {
                    const viewerLoss = Math.floor(game.currentStream.currentViewers * 0.1);
                    game.currentStream.currentViewers -= viewerLoss;
                    ui.updateViewerCount(game.currentStream.currentViewers);
                    ui.logEvent(`Trolls in chat caused ${viewerLoss} viewers to leave.`);
                    game.player.changeReputation(-1);
                    return {viewers: -viewerLoss, reputation: -1};
                }
            }
        },
        {
            id: "viral_moment",
            name: "Viral Moment",
            description: "Something amazing happened that might go viral!",
            probability: 0.025,
            applicableStreams: ["all"],
            effect: (game, ui) => {
                const viewerBoost = Math.floor(Math.random() * 50) + 30;
                game.currentStream.currentViewers += viewerBoost;
                const subscriberBoost = Math.floor(Math.random() * 10) + 5;
                game.player.addSubscribers(subscriberBoost);
                ui.updateViewerCount(game.currentStream.currentViewers);
                ui.logEvent(`You had a viral moment! Gained ${viewerBoost} viewers and ${subscriberBoost} subscribers!`);
                game.player.changeReputation(2);
                return {viewers: viewerBoost, subscribers: subscriberBoost, reputation: 2};
            }
        },
        {
            id: "gaming_win",
            name: "Epic Game Victory",
            description: "You just won in an spectacular way!",
            probability: 0.1,
            applicableStreams: ["gaming"],
            effect: (game, ui) => {
                const skillBoost = 0.1;
                game.player.improveSkill("gaming", skillBoost);
                const viewerBoost = Math.floor(Math.random() * 15) + 5;
                game.currentStream.currentViewers += viewerBoost;
                ui.updateViewerCount(game.currentStream.currentViewers);
                ui.logEvent(`Epic victory! Gaming skill increased and gained ${viewerBoost} viewers!`);
                return {viewers: viewerBoost, skill: "gaming"};
            }
        },
        {
            id: "coding_breakthrough",
            name: "Coding Breakthrough",
            description: "You solved a difficult problem!",
            probability: 0.1,
            applicableStreams: ["coding"],
            effect: (game, ui) => {
                const skillBoost = 0.1;
                game.player.improveSkill("technical", skillBoost);
                const viewerBoost = Math.floor(Math.random() * 10) + 3;
                game.currentStream.currentViewers += viewerBoost;
                ui.updateViewerCount(game.currentStream.currentViewers);
                ui.logEvent(`Coding breakthrough! Technical skill increased and gained ${viewerBoost} viewers!`);
                return {viewers: viewerBoost, skill: "technical"};
            }
        }
    ];
    
    getRandomEvent(streamType) {
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
    
    triggerEvent(event) {
        if (!this.game.currentStream.active) return;
        
        this.game.player.stats.totalEvents++;
        const result = event.effect(this.game, this.ui);
        this.ui.showNotification(`EVENT: ${event.name}`);
        // Chat manager reactions removed for simplicity
        
        return result;
    }
}
