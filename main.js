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
                tab: tabNames[0]
            },
            upgrades: [
                {
                    inc: 1,
                    cost: 10,
                    multi: 1.1,
                    type: 1
                },
                {
                    inc: 3,
                    cost: 40,
                    isBought: false,
                    type: 2
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
        this.state.main = toDecimal(stateNames.main, this.state.main, 1);
        this.state.upgrades = toDecimal(stateNames.upgrades, this.state.upgrades, 3);
        this.upgrades = [];
        for (const i in this.state.upgrades) {
            let newUpgrade = new Upgrade(this.state.upgrades[i]);
            this.upgrades.push(newUpgrade);
        }
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

    addCoins(ms){
        this.time += ms;
        while (this.time > 50) {
            this.time -= 50;
            this.coins = this.coins.add(this.coinsPerSec.div(20));
        }
    }

    subCoins(cost){
        this.coins = this.coins.sub(cost);
    }

    addCps(value){
        this.coinsPerSec = this.coinsPerSec.add(value);
    }

    showTab(tabName) {
        for (let i = 0; i < tabNames.length; i++) {
            document.getElementById('tab' + tabNames[i]).style.display = 'none';
        }
        document.getElementById('tab' + tabName).style.display = 'block';
        if (this.currentTab != tabName) { 
            this.currentTab = tabName;
            this.save();
        } 
    }
}

class Upgrade{
    constructor(state){
        this.state = state;
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
                    obj.subCoins(this.currentCost);
                    obj.addCps(this.increase);
                    this.changeCost(this.nextCost);
                }
                break;
            case 2: // One-time buy upgrades; no scaling costs, give different effects.
                if (this.isBuyable(obj.coins) && !this.isBought) {
                    obj.subCoins(this.currentCost);
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
            'inc',
            'cost',
            'multi'
        ],
        [
            'inc',
            'cost'
        ]
    ]
};

let game = new Game();
const interval = {
    update: game.time,
    save: 15000
};
const elements = [];

let init = function(){
    game.load();
    elements[0] = document.getElementsByClassName('currency-info');
    const currencyText = [' coins', ' coins/sec'];
    const x = [1, 3];
    for (let i = 0; i < 2; i++) {
        elements[0][x[i]].textContent = currencyText[i];
    }
    elements[1] = document.getElementsByClassName('upgrade-buttons');
    elements[2] = document.getElementsByClassName('upgrade-titles');
    const upgradeTitles = ['Upgrade 1', 'Upgrade 2'];
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
    game: function(x){
        game.addCoins(x);
    },
    display: function(){
        elements[0][0].textContent = notation.scientific(game.coins);
        elements[0][2].textContent = notation.scientific(game.coinsPerSec);
        for (let i in game.upgrades) {
            elements[4][i].textContent = notation.scientific(game.upgrades[i].currentCost);
        }
    }
}

let toDecimal = function(arrContents, obj, type){
    let array = arrContents;
    switch (type) {
        case 1: // For normal objects.
            for (let i = 0; i < array.length; i++) {
                obj[array[i]] = new Decimal(obj[array[i]]);
            }
            break;
        case 2: // For arrays of objects.
            for (let i = 0; i < array.length; i++) {
                for (let j in obj) {
                    obj[j][array[i]] = new Decimal(obj[j][array[i]]);
                }
            }
            break;
        case 3: // For arrays of arrays.
            for (let i = 0; i < array.length; i++) {
                for (let j in obj) {
                    for (let k = 0; k < array[i].length; k++) {
                        console.log(array[i][k]);
                        if (obj[j][array[i][k]].toString() == array[i][k]) {
                            obj[j][array[i][k]] = new Decimal(obj[j][array[i][k]]);
                        }
                    }
                }
            }
            break;
    }
    return obj;
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














