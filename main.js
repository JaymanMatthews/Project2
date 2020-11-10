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
                tab: TAB_NAMES[0]
            },
            upgrades: [
                {
                    cost: 25,
                    multi: 1,
                    isBought: false,
                    type: 2,
                    num: 1
                },
                {
                    cost: 40,
                    multi: 2,
                    isBought: false,
                    type: 2,
                    num: 2
                }
            ]
        };
    }

    static baseValues(){
        return {
            cps: new Decimal(1),
            multi: new Decimal(1)
        };
    }

    save(){
        localStorage.setItem('savedGame', JSON.stringify(this.state));
    }

    load(){
        const gameState = JSON.parse(localStorage.getItem('savedGame'));
        this.state = {...this.state, ...gameState};
        toDecimal(STATE_NAMES.main, this.state.main);
        this.base = Game.baseValues();
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
        this.base.cps = baseCps;
    }

    get baseCoinsPerSec(){
        return this.base.cps;
    }

    set baseMultiplier(baseMulti){
        this.base.multi = baseMulti;
    }

    get baseMultiplier(){
        return this.base.multi;
    }

    set firstUpgrade(upgrade){
        this.upgrades[0] = upgrade;
    }

    get firstUpgrade(){
        return this.upgrades[0];
    }

    set secondUpgrade(upgrade){
        this.upgrades[1] = upgrade;
    }

    get secondUpgrade(){
        return this.upgrades[1];
    }

    addToValue(value, gain, useCase){
        switch (useCase) {
            case 1: // Both value and gain converted to decimals.
                return value.add(gain.mul(MAX_TIME / SECOND));
            case 2: // Value in decimal form, but gain is not in decimal form.
                return value.add((gain) * (MAX_TIME / SECOND));
            case 3: // Both value and gain are not decimals.
                return value + (gain);
            case 4: // Value is a decimal and needs to be log 10'd
                return value.add(gain).log10();
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
        for (let i = 0; i < TAB_NAMES.length; i++) {
            tabs[i] = document.getElementById('tab' + TAB_NAMES[i]);
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
        toDecimal(STATE_NAMES.upgrades[state.num - 1], state);
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

    giveEffect(statement, statement2){
        if (this.isBought) {
            return statement;
        }
        return statement2;
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

const TAB_NAMES = ['upgrade-container', 'settings-container'];
const STATE_NAMES = {
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
            'cost',
            'multi'
        ]
    ]
};
let game = new Game();
const INTERVAL = {
    update: game.time,
    save: 15000
};
const VERSION = {
    type: 'P.O.C',
    no: '1.16'
};
const MAX_TIME = 50;
const SECOND = 1000;
const ELEMENTS = [];

const init = function(){
    game.load();
    document.title = "Jayman's Idle Project - " + VERSION.type + ' ' + VERSION.no;
    ELEMENTS[0] = document.getElementsByClassName('currency-info');
    const CURRENCY_TEXT = [' coins', ' coins/sec'];
    const X = [1, 3];
    for (let i = 0; i < 2; i++) {
        ELEMENTS[0][X[i]].textContent = CURRENCY_TEXT[i];
    }
    ELEMENTS[1] = document.getElementsByClassName('upgrade-buttons');
    ELEMENTS[2] = document.getElementsByClassName('upgrade-titles');
    const UPGRADE_TITLES = ['Increase coin gain per second based on current coins.', 'Multiply coin gain per second by 2.'];
    ELEMENTS[3] = document.getElementsByClassName('upgrade-cost-text');
    for (let i = 0; i < ELEMENTS[1].length; i++) {
        ELEMENTS[1][i].onclick = function(){ game.upgrades[i].buy(game, game.upgrades[i].type) };
        ELEMENTS[2][i].textContent = UPGRADE_TITLES[i];
        ELEMENTS[3][i].textContent = 'Cost: ';
    }
    ELEMENTS[4] = document.getElementsByClassName('upgrade-costs');
    ELEMENTS[5] = document.getElementsByClassName('tab-buttons');
    ELEMENTS[6] = document.getElementsByClassName('tab-titles');
    const TAB_TITLES = ['Upgrades', 'Settings'];
    for (let i = 0; i < ELEMENTS[5].length; i++) {
        ELEMENTS[5][i].onclick = function(){ game.showTab(TAB_NAMES[i]) };
        ELEMENTS[6][i].textContent = TAB_TITLES[i];
    }
    ELEMENTS[7] = document.getElementsByClassName('settings-buttons');
    ELEMENTS[8] = document.getElementsByClassName('settings-titles');
    /*ELEMENTS[7][0].onclick = function(){ game.save() };
    ELEMENTS[7][1].onclick = function(){ game.reset() };*/
    const SETTINGS = ['game.save()', 'game.reset()'];
    const SETTINGS_NAMES = ['Save Game', 'Reset Game'];
    for (let i = 0; i < ELEMENTS[7].length; i++) {
        ELEMENTS[7][i].onclick = function(){ eval(SETTINGS[i]) };
        ELEMENTS[8][i].textContent = SETTINGS_NAMES[i];
    }
    let currentTime = Date.now();
    setInterval(function(){
        const DELTA_TIME = Date.now() - currentTime;
        currentTime = Date.now();
        UPDATE.game(DELTA_TIME);
        UPDATE.display();
    }, INTERVAL.update);
    setInterval(function(){
        game.save();
    }, INTERVAL.save);
}

const UPDATE = {
    game: function(ms){
        game.time = game.addToValue(game.time, ms, 3);
        while (game.time > MAX_TIME) {
            game.time = game.subFromValue(game.time, MAX_TIME, 2);
            game.coins = game.addToValue(game.coins, game.coinsPerSec, 1);
            game.coinsPerSec = game.multiplyValue(game.baseCoinsPerSec, applyUpgradeEffects(), 1);
        }
    },
    display: function(){
        ELEMENTS[0][0].textContent = NOTATION.scientific(game.coins);
        ELEMENTS[0][2].textContent = NOTATION.scientific(game.coinsPerSec);
        for (let i in game.upgrades) {
            ELEMENTS[4][i].textContent = NOTATION.scientific(game.upgrades[i].currentCost);
        }
    }
}

const applyUpgradeEffects = function(){
    let firstMulti = game.firstUpgrade.multiplier = game.firstUpgrade.giveEffect(game.addToValue(game.coins, 10, 4), game.baseMultiplier);
    let secondEffect = game.secondUpgrade.giveEffect(game.secondUpgrade.multiplier, game.baseMultiplier); 
    let totalEffect = game.multiplyValue(firstMulti, secondEffect, 2);
    return totalEffect;
}

const toDecimal = function(keys, obj, useType){ // Thanks to etnpce for helping to refactor this function.
    if (useType) {
        keys = keys[obj.num - 1];
    }
    for (let k of keys) {
        obj[k] = new Decimal(obj[k]);
    }
}

const NOTATION = {
    scientific: function(value){
        let exponent = value.log10().floor();
        let mantissa = value.div(new Decimal(10).pow(exponent));
        if (value == 0) return '0.00';
        if (exponent < 3) return value.toFixed(2);
        if (mantissa.toFixed(2) >= 10) { mantissa /= 10; exponent++ };
        return mantissa.toFixed(2) + 'e' + exponent;
    }
}

const start = window.onload = function(){
    init();
}














