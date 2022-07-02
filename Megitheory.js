import { ExponentialCost, FirstFreeCost, LinearCost } from "../api/Costs";
import { Localization } from "../api/Localization";
import { parseBigNumber, BigNumber } from "../api/BigNumber";
import { theory } from "../api/Theory";
import { Utils } from "../api/Utils";

var id = "megitheory";
var name = "Megitheory";
var description = "i show so game know :)";
var authors = "Throngjwk";
var version = "1.0.0";

var currency;

var init = () => {
    currency = theory.createCurrency();

    ///////////////////
    // Regular Upgrades

    // adjust
    {
        adjust = theory.createUpgrade(0, currency, new FreeCost());
        adjust.getDescription = (_) => "Adjust Now";
        adjust.getInfo = (amount) => "Adjust Now";
        adjust.boughtOrRefunded = (_) => {
            currency.value += getA1(a1.level) *
                              getA2(a2.level) *
                              getA3(a3.level);
            adjust.level = 0;
        }
    }

    // a1
    {
        let getDesc = (level) => "a_1=" + getA1(level).toString(0);
        a1 = theory.createUpgrade(1, currency, new FirstFreeCost(new ExponentialCost(10, Math.log2(2))));
        a1.getDescription = (_) => Utils.getMath(getDesc(a1.level));
        a1.getInfo = (amount) => Utils.getMathTo(getDesc(a1.level), getDesc(a1.level + amount));
    }

    // a2
    {
        let getDesc = (level) => "a_2=\\sqrt{2^{" + level + "}}";
        a2 = theory.createUpgrade(2, currency, new FirstFreeCost(new ExponentialCost(100, Math.log2(2))));
        a2.getDescription = (_) => Utils.getMath(getDesc(a2.level));
        a2.getInfo = (amount) => Utils.getMathTo(getDesc(a2.level), getDesc(a2.level + amount));
    }

    // a3
    {
        let getDesc = (level) => "a_3=" + getA3(level).toString(0);
        a3 = theory.createUpgrade(3, currency, new FirstFreeCost(new ExponentialCost(10000, Math.log2(2))));
        a3.getDescription = (_) => Utils.getMath(getDesc(a3.level));
        a3.getInfo = (amount) => Utils.getMathTo(getDesc(a3.level), getDesc(a3.level + amount));
    }

    // b
    {
        let getDesc = (level) => "\\beta =" + getB(level).toString(0);
        b = theory.createUpgrade(4, currency, new FirstFreeCost(new ExponentialCost(1e12, Math.log2(2))));
        b.getDescription = (_) => Utils.getMath(getDesc(b.level));
        b.getInfo = (amount) => Utils.getMathTo(getDesc(b.level), getDesc(b.level + amount));
    }

    /////////////////////
    // Permanent Upgrades
    theory.createPublicationUpgrade(0, currency, 1e10);
    theory.createBuyAllUpgrade(1, currency, 1e13);
    theory.createAutoBuyerUpgrade(2, currency, 1e30);

    ///////////////////////
    //// Milestone Upgrades
    theory.setMilestoneCost(new LinearCost(2, 3));

    {
        auto = theory.createMilestoneUpgrade(0, 1);
        auto.description = "Auto Buyed disable a upgrade 1.";
        auto.info = "Auto Buyed disable a upgrade 1.";
        auto.boughtOrRefunded = (_) => theory.invalidatePrimaryEquation();
    }

    {
        bExp = theory.createMilestoneUpgrade(1, 4);
        bExp.description = Localization.getUpgradeIncCustomExpDesc("\\beta", "0.1");
        bExp.info = Localization.getUpgradeIncCustomExpInfo("\\beta", "0.1");
        bExp.boughtOrRefunded = (_) => theory.invalidatePrimaryEquation();
    }

    updateAvailability();

    var popup = ui.createPopup({
        title: "PID Config",
        content: ui.createStackLayout({
            children: [
                ui.createLabel({text: "Enter ID:"}),
                ui.createEntry(),
                ui.createLabel({text: "Result:"}),
                ui.createLatexLabel({text: "\\(K_i=2\\)"}),
                ui.createLabel({text: "UB after Milestone:"}),
                ui.createLatexLabel({text: "\\(\\beta^{1.1}\\)"}),
                ui.createButton({text: "Close", onClicked: () => popup.hide()})
            ]
        })
    });

}

var updateAvailability = () => {
    adjust.isAvailable = auto.level == 0;
    b.isAvailable = auto.level > 0;
    bExp.isAvailable = auto.level > 0;
}

var tick = (elapsedTime, multiplier) => {
    let dt = BigNumber.from(elapsedTime * multiplier);
    let bonus = theory.publicationMultiplier;
    if (auto.level > 0) {
        currency.value += dt * bonus * getA1(a1.level) *
                                       getA2(a2.level) *
                                       getA3(a3.level) *
                                       getB(b.level).pow(getBExponent(bExp.level))
    }
}

var getPrimaryEquation = () => {
    let result = "\\dot{\\rho} = a_1";

    result += "a_2";

    result += "a_3";

    result += " \\beta ";

    return result;
}

var goToNextStage = () => {
    popup.show();
};

var getSecondaryEquation = () => theory.latexSymbol + "=\\max\\rho^{0.2}";
var getPublicationMultiplier = (tau) => tau.pow(1.107) / BigNumber.from(13);
var getPublicationMultiplierFormula = (symbol) => "\\frac{{" + symbol + "}^{1.107}}{13}";
var getTau = () => currency.value.pow(0.2);
var get2DGraphValue = () => currency.value.sign * (BigNumber.ONE + currency.value.abs()).log10().toNumber();

var getA1 = (level) => Utils.getStepwisePowerSum(level, 2, 10, 0);
var getA2 = (level) => BigNumber.TWO.pow(level).sqrt();
var getA3 = (level) => Utils.getStepwisePowerSum(level, 2, 15, 0);
var getB = (level) => Utils.getStepwisePowerSum(level, 8, 25, 0);
var getBExponent = (level) => BigNumber.from(1 + 0.1 * level);

init();