class Game{
    constructor(state){
        this.state = state;
    }

    save(){
        localStorage.setItem('savedGame', JSON.stringify(this.state));
    }

    load(){
        const gameState = JSON.parse(localStorage.getItem('savedGame'));
        this.state = {...this.state, ...gameState};
        this.state.main = this.toDecimal(stateNames.main, this.state.main, 1);
        this.state.upgrades = this.toDecimal(stateNames.upgrades, this.state.upgrades, 2);
        this.upgrades = [];
        for (const i in this.state.upgrades) {
            let newUpgrade = new Upgrade(this.state.upgrades[i]);
            this.upgrades.push(newUpgrade);
        }
    }

    reset(){
        if (confirm('Would you like to reset your game?')) {
            this.state = this.setPlayer();
            this.save();
            location.reload();
        }
    }

    addCoins(ms){
        this.state.main.time += ms;
        while (this.state.main.time > 50) {
            this.state.main.time -= 50;
            this.state.main.coins = this.state.main.coins.add(this.state.main.cps.div(20));
        }
    }

    subCoins(cost){
        this.state.main.coins = this.state.main.coins.sub(cost);
    }

    addCps(value){
        this.state.main.cps = this.state.main.cps.add(value);
    }

    setPlayer(){
        return {};
    }

    toDecimal(arrContents, object, opt){
        let array = arrContents;
        switch (opt) {
            case 1:
                for (let i = 0; i < array.length; i++) {
                    object[array[i]] = new Decimal(object[array[i]]);
                }
                break;
            case 2:
                for (let i = 0; i < array.length; i++) {
                    for (let j in object) {
                        object[j][array[i]] = new Decimal(object[j][array[i]]);
                    }
                }
                break;
        }
        return object;
    }
}

class Upgrade{
    constructor(state){
        this.state = state;
    }

    nextCost(){
        return this.state.cost.mul(this.state.multi);
    }

    changeCost(funct){
        return this.state.cost = funct;
    }

    isBuyable(value){
        return value.greaterThanOrEqualTo(this.state.cost);
    }

    buy(object){
        if (this.isBuyable(object.state.main.coins)) {
            object.subCoins(this.state.cost);
            object.addCps(this.state.inc);
            this.changeCost(this.nextCost());
        }
    }
}

const player = {
    main: {
        coins: 0,
        cps: 1,
        time: 0
    },
    upgrades: [
        {
            inc: 1,
            cost: 10,
            multi: 1.1
        },
        {
            inc: 3,
            cost: 40,
            multi: 1.17
        }
    ]
};

const stateNames = {
    main: [
        'coins',
        'cps'
    ],
    upgrades: [
        'inc',
        'cost',
        'multi'
    ]
};

let game = new Game(player);
const interval = {
    update: game.state.main.time,
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
        elements[1][i].onclick = function(){ game.upgrades[i].buy(game) };
        elements[2][i].textContent = upgradeTitles[i];
        elements[3][i].textContent = 'Cost: ';
    }
    elements[4] = document.getElementsByClassName('upgrade-costs');
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
        elements[0][0].textContent = notation.scientific(game.state.main.coins);
        elements[0][2].textContent = notation.scientific(game.state.main.cps);
        for (let i = 0; i < elements[1].length; i++) {
            elements[4][i].textContent = notation.scientific(game.state.upgrades[i].cost);
        }
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

window.onload = function(){
    init();
}













/*save() {
        localStorage.setItem('savedGame', JSON.stringify(this.state));
        console.log(JSON.stringify(this.state));
    }

    load() {
        const gameState = JSON.parse(localStorage.getItem('savedGame'));
        if (gameState != null) {
            game = new Game(gameState);
        } else {
            game = new Game();
        }
        console.log(JSON.parse(localStorage.getItem('savedGame')));
    }

    reset() {
        if (confirm('Would you like to reset your game?')) {
            game = new Game();
            game.save();
            location.reload();
        }
    }*/
