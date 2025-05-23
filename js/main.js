import { APP_NAME, APP_VERSION } from "../app-properties.js";
import { getSvgIcon } from "./services/icons.service.js";
import { showToast } from "./services/toast.service.js";
import { 
  convertMillisecondsToTimeObject,
  convertTimeValuesToMilliseconds,
  getCompactColonTimeStringByTimeValues, 
  getCompactVerboseTimeStringByTimeValues, 
  getFullColonTimeStringByMilliseconds, 
  getFullColonTimeStringByTimeValues, 
  getFullVerboseTimeStringByTimeValues 
} from "./utils/dateAndTime.utils.js";
import { getRandomIntegerBetween } from "./utils/math.utils.js";
import { setHTMLTitle, logAppInfos, getRandomHexColor } from "./utils/UTILS.js";
// VARIABLES //////////////////////////////////////////////////////////////////////////////////////
const HEADER = document.getElementById('header');
const MAIN = document.getElementById('main');

let index = 0;
let unopenedCards = [];
let openedCards = [];

// FUNCTIONS //////////////////////////////////////////////////////////////////////////////////////

const getRandomCard = (rarity) => {
  const color1 = getRandomHexColor();
  const color2 = getRandomHexColor();
  const color3 = getRandomHexColor();
  const color4 = getRandomHexColor();
  const percentage = rarity == 'common' 
    ? 95 
    : rarity == 'uncommon' 
      ? 90 
      : rarity == 'rare' 
        ? 85 
        : rarity == 'mythic'
          ? 80 
          : 0;
  const isShiny = getRandomIntegerBetween(0, 100) > percentage;

  return {rarity: rarity, color1: color1, color2: color2, color3: color3, color4: color4, isShiny: isShiny}
}
// USER INTERACTIONS ##########################################################
const onButtonClick = (toastClass) => {
  showToast(toastClass, `clicked on ${toastClass}`);
};
window.onButtonClick = onButtonClick;

const onOpenRandomBoosterClick = () => {
  fillUnopenedBoosterIhm(getRandomBooster());
  document.getElementById('openedBoosterCardsDisplay').innerHTML = '';
  document.getElementById('openBoosterButton').setAttribute('disabled', true);
};
window.onOpenRandomBoosterClick = onOpenRandomBoosterClick;

const onHiddenCardClick = (event) => {
  //console.log(event);
  let element = event.currentTarget;
  let card = unopenedCards[index];
  //console.log(card)
  let isHidden = element.classList.contains('hidden');
  //console.log(isHidden);
  if (isHidden) {
    //console.log('currently hidden');
    element.classList.remove('hidden');
   } else {
    element.classList.add('slide');
    setTimeout(() => {
      openedCards.push(card);
      fillOpenedCards(card);
      unopenedCards.splice(index, 1);
      element.style.display = 'none';
      //console.log(unopenedCards);

      if (unopenedCards.length == 0) {
        //console.log('VIDE');
        document.getElementById('openBoosterButton').removeAttribute('disabled');
      }
    }, 500);
  }
};
window.onHiddenCardClick = onHiddenCardClick;

// DATA #######################################################################

const getRandomBooster = () => {
  let cards = [];
  
  for (let index = 0; index < 5; index++) {
    cards.push(getRandomCard('common'));
  }
  for (let index = 0; index < 3; index++) {
    cards.push(getRandomCard('uncommon'));
  }
  for (let index = 0; index < getRandomIntegerBetween(1, 2); index++) {
    cards.push(getRandomCard('rare'));
  }
  if (getRandomIntegerBetween(0, 100) < 50) {
    for (let index = 0; index < 1; index++) {
      cards.push(getRandomCard('mythic'));
    }
  }

  return cards;
}

// IHM RENDER #################################################################
const getCardIhm = (rarity, color1 = 'cyan', color2 = 'magenta', color3 = 'yellow', color4 = 'black', isShiny = false, hidden = false, onclick = '') => {
  let style = '';
  switch (rarity) {
    case 'common':
      style = `background-color: ${color1}`;
      break;
    case 'uncommon':
        style = `background: linear-gradient(135deg,${color1}, ${color2});`;
        break;
    case 'rare':
        style = `
        background: linear-gradient(135deg,${color1}, ${color2}, ${color3});
        /* background-size: 400% 400%; */
        /* animation: gradient 3s ease infinite; */
        `;
        break;
    case 'mythic':
        style = `
        background: linear-gradient(135deg, ${color1}, ${color2}, ${color3}, ${color4});
        /* background-size: 400% 400%; */
        /* animation: gradient 5s ease infinite; */
        `;
        break;
    default:
      break;
  }
  return `
    <div class="card-container full ${isShiny ? 'shiny' : ''} ${hidden ? 'hidden' : ''}" ${onclick == 'reveal' ? `onclick="onHiddenCardClick(event)"` : onclick == 'show' ?  `onclick="onShowCardClick('${rarity}', '${color1}', '${color2}', '${color3}', '${color4}', ${isShiny})"` : ''}>
      <div class="card">
        <div class="card-front">
          <div class="card-display" style="${style}"></div>
          <div class="card-rarity ${rarity}">
            <span>${rarity}</span>
            <span class="dot"></span>
          </div>
          <div class="card-textbox">
            <div class="color-container">
              <span class="color-dot" style="background-color: ${color1};"></span>
              <span class="color-name">${color1}</span>
            </div>
            ${rarity != 'common' ? `<div class="color-container">
              <span class="color-dot" style="background-color: ${color2};"></span>
              <span class="color-name">${color2}</span>
            </div>` : ''}
            ${rarity == 'rare' || rarity == 'mythic' ? `<div class="color-container">
              <span class="color-dot" style="background-color: ${color3};"></span>
              <span class="color-name">${color3}</span>
            </div>` : ''}
            ${rarity == 'mythic' ? `<div class="color-container">
              <span class="color-dot" style="background-color: ${color4};"></span>
              <span class="color-name">${color4}</span>
            </div>` : ''}
          </div>  
        </div>
        <div class="card-back">
        </div>
      </div>
    </div>
  `;
}

const fillUnopenedBoosterIhm = (cardList) => {
  cardList.reverse();
  unopenedCards = [...cardList];
  unopenedCards.reverse();
  //console.log(unopenedCards);
  let display = document.getElementById('unopenedBoosterDisplay');
  let finalStr = ``;
  for (let card of cardList) {
    finalStr += getCardIhm(card.rarity, card.color1, card.color2, card.color3, card.color4, card.isShiny, true, 'reveal')
  }
  display.innerHTML = '';
  display.innerHTML = finalStr;
}

const fillOpenedCards = (card) => {
  let element = document.getElementById('openedBoosterCardsDisplay');
  let previous = element.innerHTML;

  element.innerHTML = `
  ${getCardIhm(card.rarity, card.color1, card.color2, card.color3, card.color4, card.isShiny, false, 'show')}
  ${previous}`;
}

const onShowCardClick = (rarity, color1, color2, color3, color4, isShiny) => {
  let display = document.getElementById('cardDetailsDisplay');
  if (display.classList.contains('hidden')) {
    display.innerHTML = '';
    display.innerHTML = getCardIhm(rarity, color1, color2, color3, color4, isShiny);
    display.classList.remove('hidden');
  }
}
window.onShowCardClick = onShowCardClick;

const onDetailsDisplayClick = (event) => {
  const element = event.target;
  const clickedOnBackground = element.classList.contains('card-details-display');
  if (clickedOnBackground) {
    let display = document.getElementById('cardDetailsDisplay');
    if (display.classList.contains('hidden')) {
    } else {
      display.classList.add('hidden');
      display.innerHTML = '';
    }
  }
}
window.onDetailsDisplayClick = onDetailsDisplayClick;
// LOGGING ####################################################################

// INITIALIZATION /////////////////////////////////////////////////////////////////////////////////

logAppInfos(APP_NAME, APP_VERSION);
setHTMLTitle(APP_NAME);
//setStorage();

// EXECUTION //////////////////////////////////////////////////////////////////////////////////////
HEADER.innerHTML = `${APP_NAME}`;
MAIN.innerHTML += `
  <button id="openBoosterButton" onclick="onOpenRandomBoosterClick()" class="solid" style="margin: 16px auto;">Open booster</button>
  <div id="unopenedBoosterDisplay" class="unopened-booster-display"></div>
  <div id="openedBoosterCardsDisplay" class="opened-booster-cards-display"></div>
  <section id="cardDetailsDisplay" onclick="onDetailsDisplayClick(event)" class="card-details-display hidden"></section>
`;