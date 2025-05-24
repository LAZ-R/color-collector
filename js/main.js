import { APP_NAME, APP_VERSION } from "../app-properties.js";
import { getSvgIcon } from "./services/icons.service.js";
import { getUser, setStorage, setUser } from "./services/storage.service..js";
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
let currentScreen = 'homepage';

// FUNCTIONS //////////////////////////////////////////////////////////////////////////////////////

let card = {
  rarity: 'rarity', 
  color1: 'color1', 
  color2: 'color2', 
  color3: 'color3', 
  color4: 'color4', 
  isShiny: 'boolean',
  units: 'number'
}

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

  return {rarity: rarity, color1: color1, color2: color2, color3: color3, color4: color4, isShiny: isShiny, units: 1}
}
// USER INTERACTIONS ##########################################################
const onButtonClick = (toastClass) => {
  showToast(toastClass, `clicked on ${toastClass}`);
};
window.onButtonClick = onButtonClick;

const onOpenRandomBoosterClick = () => {
  let boosterCards = getRandomBooster();
  
  let user = getUser();
  for (let newCard of boosterCards) {
    let isAlreadyOpened = false;
    for (let alreadyOpenedCard of user.opened_cards) {
      if (newCard.rarity == 'common') {
        if (alreadyOpenedCard.isShiny == newCard.isShiny && alreadyOpenedCard.color1 == newCard.color1) {
          isAlreadyOpened = true;
          alreadyOpenedCard.units += 1;
        }
      } else if (newCard.rarity == 'uncommon') {
        if (alreadyOpenedCard.isShiny == newCard.isShiny && alreadyOpenedCard.color1 == newCard.color1 && alreadyOpenedCard.color2 == newCard.color2) {
          isAlreadyOpened = true;
          alreadyOpenedCard.units += 1;
        }
      } else if (newCard.rarity == 'rare') {
        if (alreadyOpenedCard.isShiny == newCard.isShiny && alreadyOpenedCard.color1 == newCard.color1 && alreadyOpenedCard.color2 == newCard.color2 && alreadyOpenedCard.color3 == newCard.color3) {
          isAlreadyOpened = true;
          alreadyOpenedCard.units += 1;
        }
      } else if (newCard.rarity == 'mythic') {
        if (alreadyOpenedCard.isShiny == newCard.isShiny && alreadyOpenedCard.color1 == newCard.color1 && alreadyOpenedCard.color2 == newCard.color2 && alreadyOpenedCard.color3 == newCard.color3 && alreadyOpenedCard.color4 == newCard.color4) {
          isAlreadyOpened = true;
          alreadyOpenedCard.units += 1;
        }
      } 
    }
    if (!isAlreadyOpened) {
      user.opened_cards.push(newCard);
    }
  }
  setUser(user);
  fillUnopenedBoosterIhm(boosterCards);
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
  const doubleRarePercentage = getRandomIntegerBetween(0, 100);
  for (let index = 0; index < (doubleRarePercentage > 50 ? 2 : 1); index++) {
    cards.push(getRandomCard('rare'));
  }
  const mythicPercentage = getRandomIntegerBetween(0, 100);
  if (mythicPercentage > 50) {
    for (let index = 0; index < 1; index++) {
      cards.push(getRandomCard('mythic'));
    }
  }

  return cards;
}

// IHM RENDER #################################################################
const getCardIhm = (
  rarity, 
  color1 = 'cyan', 
  color2 = 'magenta', 
  color3 = 'yellow', 
  color4 = 'black', 
  isShiny = false, 
  hidden = false, 
  onclick = '',
  isSquare = false
) => {
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
    <div class="card-container ${isSquare ? 'square' : 'full'} ${isShiny ? 'shiny' : ''} ${hidden ? 'hidden' : ''}" ${onclick == 'reveal' ? `onclick="onHiddenCardClick(event)"` : onclick == 'show' ?  `onclick="onShowCardClick('${rarity}', '${color1}', '${color2}', '${color3}', '${color4}', ${isShiny})"` : ''}>
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
  ${getCardIhm(card.rarity, card.color1, card.color2, card.color3, card.color4, card.isShiny, false, 'show', true)}
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

const setCollectionScreen = () => {
   HEADER.innerHTML = `${APP_NAME}<button onclick="onHomepageClick()" class="solid" style="margin: 0;">${getSvgIcon('house', 's')}</button>`;
  MAIN.innerHTML = ``;

  let user = getUser();

  let commonCards = user.opened_cards.filter((card) => card.rarity == 'common');
  commonCards.reverse();
  commonCards.sort((a, b) => (b.isShiny === true) - (a.isShiny === true));

  let uncommonCards = user.opened_cards.filter((card) => card.rarity == 'uncommon');
  uncommonCards.reverse();
  uncommonCards.sort((a, b) => (b.isShiny === true) - (a.isShiny === true));

  let rareCards = user.opened_cards.filter((card) => card.rarity == 'rare');
  rareCards.reverse();
  rareCards.sort((a, b) => (b.isShiny === true) - (a.isShiny === true));

  let mythicCards = user.opened_cards.filter((card) => card.rarity == 'mythic');
  mythicCards.reverse();
  mythicCards.sort((a, b) => (b.isShiny === true) - (a.isShiny === true));

  let commonCardsString = '';
  for (let commonCard of commonCards) {
    commonCardsString += getCardIhm(commonCard.rarity, commonCard.color1, commonCard.color2, commonCard.color3, commonCard.color4, commonCard.isShiny, false, 'show', true);
  }
  let uncommonCardsString = '';
  for (let uncommonCard of uncommonCards) {
    uncommonCardsString += getCardIhm(uncommonCard.rarity, uncommonCard.color1, uncommonCard.color2, uncommonCard.color3, uncommonCard.color4, uncommonCard.isShiny, false, 'show', true);
  }
  let rareCardsString = '';
  for (let rareCard of rareCards) {
    rareCardsString += getCardIhm(rareCard.rarity, rareCard.color1, rareCard.color2, rareCard.color3, rareCard.color4, rareCard.isShiny, false, 'show', true);
  }
  let mythicCardsString = '';
  for (let mythicCard of mythicCards) {
    mythicCardsString += getCardIhm(mythicCard.rarity, mythicCard.color1, mythicCard.color2, mythicCard.color3, mythicCard.color4, mythicCard.isShiny, false, 'show', true);
  }

  MAIN.innerHTML += `
  <h1 style="color: var(--color--fg-100); margin-left: var(--horizontal-padding); margin-top: 12px;">Collection</h1>

  <div class="drawer flat margin-bottom">
    <div class="tile-header">
      <div>
        <span class="header-title">Mythic (${mythicCards.length})</span>
      </div>
      <div class="tile-caret">
      ${getSvgIcon('chevron-right', 'm', null)}
      </div>
      <input type="checkbox">
    </div>
    <div class="expandable-wrapper">
      <div class="expandable-inner">
        <div class="inner-body cards-display">
        <div class="row-wrap">
          ${mythicCardsString}
        </div>
        </div>
      </div>
    </div>
  </div>

  <div class="drawer flat margin-bottom">
    <div class="tile-header">
      <div>
        <span class="header-title">Rare (${rareCards.length})</span>
      </div>
      <div class="tile-caret">
      ${getSvgIcon('chevron-right', 'm', null)}
      </div>
      <input type="checkbox">
    </div>
    <div class="expandable-wrapper">
      <div class="expandable-inner">
        <div class="inner-body cards-display">
        <div class="row-wrap">
          ${rareCardsString}
        </div>
        </div>
      </div>
    </div>
  </div>

  <div class="drawer flat margin-bottom">
    <div class="tile-header">
      <div>
        <span class="header-title">Uncommon (${uncommonCards.length})</span>
      </div>
      <div class="tile-caret">
      ${getSvgIcon('chevron-right', 'm', null)}
      </div>
      <input type="checkbox">
    </div>
    <div class="expandable-wrapper">
      <div class="expandable-inner">
        <div class="inner-body cards-display">
        <div class="row-wrap">
          ${uncommonCardsString}
        </div>
        </div>
      </div>
    </div>
  </div>

  <div class="drawer flat margin-bottom">
    <div class="tile-header">
      <div>
        <span class="header-title">Common (${commonCards.length})</span>
      </div>
      <div class="tile-caret">
      ${getSvgIcon('chevron-right', 'm', null)}
      </div>
      <input type="checkbox">
    </div>
    <div class="expandable-wrapper">
      <div class="expandable-inner">
        <div class="inner-body cards-display">
        <div class="row-wrap">
          ${commonCardsString}
        </div>
        </div>
      </div>
    </div>
  </div>
  
  <section id="cardDetailsDisplay" onclick="onDetailsDisplayClick(event)" class="card-details-display hidden"></section>
  `;
}
const onCollectionClick = () => {
  if (currentScreen != 'collection') {
    setCollectionScreen();
    currentScreen = 'collection';
  }
}
window.onCollectionClick = onCollectionClick;

const setHomepageScreen = () => {
  HEADER.innerHTML = `${APP_NAME}<button onclick="onCollectionClick()" class="solid" style="margin: 0;">${getSvgIcon('list', 's')}</button>`;
  MAIN.innerHTML = '';
  MAIN.innerHTML += `
    <div id="unopenedBoosterDisplay" class="unopened-booster-display">
    </div>
    <div class="open-booster-button-area">
      <button id="openBoosterButton" onclick="onOpenRandomBoosterClick()" class="solid" style="margin: 16px auto;">Open booster</button>
    </div>
    <div id="openedBoosterCardsDisplay" class="opened-booster-cards-display"></div>
    <section id="cardDetailsDisplay" onclick="onDetailsDisplayClick(event)" class="card-details-display hidden"></section>
  `;
}
const onHomepageClick = () => {
  if (currentScreen != 'homepage') {
    setHomepageScreen();
    currentScreen = 'homepage';
  }
}
window.onHomepageClick = onHomepageClick;
// LOGGING ####################################################################

// INITIALIZATION /////////////////////////////////////////////////////////////////////////////////

logAppInfos(APP_NAME, APP_VERSION);
setHTMLTitle(APP_NAME);
setStorage();

// EXECUTION //////////////////////////////////////////////////////////////////////////////////////
setHomepageScreen();