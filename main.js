class Game{
    constructor(state){
        this.state = state || Game.defaultState();
    }

    static defaultState(){
        return {
            main: {
                coins: 0,
                cps: 1,
                time: 0,
                tab: tabNames[0],
                base: {
                    cps: 1
                }
            },
            upgrades: [
                {
                    cost: 25,
                    multi: 2,
                    isBought: false,
                    type: 2,
                    num: 1
                },
                {
                    inc: 3,
                    cost: 40,
                    isBought: false,
                    type: 2,
                    num: 2
                }
            ]
        };
    }

    save(){
        localStorage.setItem('savedGame', JSON.stringify(this.state));
    }

    load(){
        const gameState = JSON.parse(localStorage.getItem('savedGame'));
        this.state = {...this.state, ...gameState};
        toDecimal(stateNames.main, this.state.main);
        toDecimal(baseNames, this.state.main.base);
        this.upgrades = this.state.upgrades.map(upgradeState => new Upgrade(upgradeState)); // The upgrades are mapped into upgrade objects using their state, filling an upgrades array.
        this.showTab(this.currentTab);
    }

    reset(){
        if (confirm('Would you like to reset your game?')) {
            this.state = Game.defaultState();
            this.save();
            location.reload();
        }
    }

    set coins(coins){
        this.state.main.coins = coins;
    }

    get coins(){
        return this.state.main.coins;
    }

    set coinsPerSec(cps){
        this.state.main.cps = cps;
    }

    get coinsPerSec(){
        return this.state.main.cps;
    }

    set time(time){
        this.state.main.time = time;
    }

    get time(){
        return this.state.main.time;
    }

    set currentTab(tab){
        this.state.main.tab = tab;
    }

    get currentTab(){
        return this.state.main.tab;
    }

    set baseCoinsPerSec(baseCps){
        this.state.main.base.cps = baseCps;
    }

    get baseCoinsPerSec(){
        return this.state.main.base.cps;
    }

    addToValue(value, gain, x, useCase){
        switch (useCase) {
            case 1: // Both value and gain converted to decimals.
                return value.add(gain.div(x));
            case 2: // Value in decimal form, but gain is not in decimal form.
                return value.add((gain) / x);
            case 3: // Both value and gain are not decimals.
                return value + ((gain) / x);
        }
    }

    subFromValue(value, cost, useCase){
        switch (useCase) {
            case 1: // Value is converted to a decimal.
                return value.sub(cost);
            case 2: // Value is not in decimal form.
                return (value) - cost;
        }
    }

    multiplyValue(value, multiplier, useCase){
        switch (useCase) {
            case 1: // Value is converted to a decimal.
                return value.mul(multiplier);
            case 2: // Value is not in decimal form.
                return (value) * multiplier;
        }
    }

    showTab(tabName){
        let tabs = [];
        for (let i = 0; i < tabNames.length; i++) {
            tabs[i] = document.getElementById('tab' + tabNames[i]);
            tabs[i].style.display = 'none';
        }
        let selectedTab = document.getElementById('tab' + tabName);
        selectedTab.style.display = 'block';
        if (this.currentTab != tabName) { 
            this.currentTab = tabName;
            this.save();
        } 
    }
}

class Upgrade{
    constructor(state){
        this.state = state;
        toDecimal(stateNames.upgrades[state.num - 1], state);
    }

    set increase(inc){
        this.state.inc = inc;
    }

    get increase(){
        return this.state.inc;
    }

    set currentCost(cost){
        this.state.cost = cost;
    }

    get currentCost(){
        return this.state.cost;
    }

    set nextCost(cost){
        this.currentCost.mul(this.multiplier) = cost; 
    }

    get nextCost(){
        return this.currentCost.mul(this.multiplier);
    }

    set multiplier(multi){
        this.state.multi = multi; 
    }

    get multiplier(){
        return this.state.multi;
    }

    set isBought(isBought){
        this.state.isBought = isBought; 
    }

    get isBought(){
        return this.state.isBought;
    }

    set type(type){
        this.state.type = type; 
    }

    get type(){
        return this.state.type;
    }

    changeCost(funct){
        return this.currentCost = funct;
    }

    isBuyable(value){
        return value.greaterThanOrEqualTo(this.currentCost);
    }

    buy(obj, type){
        switch (type) {
            case 1: // Rebuyable upgrades; scaling costs, adding cps each time.
                if (this.isBuyable(obj.coins)) {
                    obj.coins = obj.subFromValue(obj.coins, this.currentCost, 1);
                    obj.addCps(this.increase);
                    this.changeCost(this.nextCost);
                }
                break;
            case 2: // One-time buy upgrades; no scaling costs, give different effects.
                if (this.isBuyable(obj.coins) && !this.isBought) {
                    obj.coins = obj.subFromValue(obj.coins, this.currentCost, 1);
                    this.isBought = true;
                }
                break;
        }
    }
}

const tabNames = ['upgrade-container', 'settings-container'];
const stateNames = {
    main: [
        'coins',
        'cps'
    ],
    upgrades: [
        [
            'cost',
            'multi'
        ],
        [
            'inc',
            'cost'
        ]
    ]
};
const baseNames = [
    'cps'
]
let game = new Game();
const interval = {
    update: game.time,
    save: 15000
};
const version = {
    type: 'P.O.C',
    no: '1.16'
};
const elements = [];

let init = function(){
    game.load();
    document.title = "Jayman's Idle Project - " + version.type + ' ' + version.no;
    elements[0] = document.getElementsByClassName('currency-info');
    const currencyText = [' coins', ' coins/sec'];
    const x = [1, 3];
    for (let i = 0; i < 2; i++) {
        elements[0][x[i]].textContent = currencyText[i];
    }
    elements[1] = document.getElementsByClassName('upgrade-buttons');
    elements[2] = document.getElementsByClassName('upgrade-titles');
    const upgradeTitles = ['Increase coin gain per second based on current coins.', 'Upgrade 2'];
    elements[3] = document.getElementsByClassName('upgrade-cost-text');
    for (let i = 0; i < elements[1].length; i++) {
        elements[1][i].onclick = function(){ game.upgrades[i].buy(game, game.upgrades[i].type) };
        elements[2][i].textContent = upgradeTitles[i];
        elements[3][i].textContent = 'Cost: ';
    }
    elements[4] = document.getElementsByClassName('upgrade-costs');
    elements[5] = document.getElementsByClassName('tab-buttons');
    elements[6] = document.getElementsByClassName('tab-titles');
    const tabTitles = ['Upgrades', 'Settings'];
    for (let i = 0; i < elements[5].length; i++) {
        elements[5][i].onclick = function(){ game.showTab(tabNames[i]) };
        elements[6][i].textContent = tabTitles[i];
    }
    elements[7] = document.getElementsByClassName('settings-buttons');
    elements[8] = document.getElementsByClassName('settings-titles');
    elements[7][0].onclick = function(){ game.save() };
    elements[7][1].onclick = function(){ game.reset() };
    const settingsNames = ['Save Game', 'Reset Game'];
    for (let i = 0; i < elements[7].length; i++) {
        elements[8][i].textContent = settingsNames[i];
    }
    let currentTime = Date.now();
    setInterval(function(){
        const deltaTime = Date.now() - currentTime;
        currentTime = Date.now();
        update.game(deltaTime);
        update.display();
    }, interval.update);
    setInterval(function(){
        game.save();
    }, interval.save);
}

let update = {
    game: function(ms){
        game.time = game.addToValue(game.time, ms, 1, 3);
        while (game.time > 50) {
            game.time = game.subFromValue(game.time, 50, 2);
            game.coins = game.addToValue(game.coins, game.coinsPerSec, 20, 1);
            if (game.upgrades[0].isBought) game.coinsPerSec = game.multiplyValue(game.baseCoinsPerSec, game.upgrades[0].multiplier, 1);
        }
    },
    display: function(){
        elements[0][0].textContent = notation.scientific(game.coins);
        elements[0][2].textContent = notation.scientific(game.coinsPerSec);
        for (let i in game.upgrades) {
            elements[4][i].textContent = notation.scientific(game.upgrades[i].currentCost);
        }
    }
}

let toDecimal = function(keys, obj, useType){ // Thanks to etnpce for helping to refactor this function.
    if (useType) {
        keys = keys[obj.num - 1];
    }
    for (let k of keys) {
        obj[k] = new Decimal(obj[k]);
    }
}

let notation = {
    scientific: function(value){
        let exponent = value.log10().floor();
        let mantissa = value.div(new Decimal(10).pow(exponent));
        if (value == 0) return '0.00';
        if (exponent < 3) return value.toFixed(2);
        if (mantissa.toFixed(2) >= 10) { mantissa /= 10; exponent++ };
        return mantissa.toFixed(2) + 'e' + exponent;
    }
}

let start = window.onload = function(){
    init();
}














