import { APP_LOCAL_STORAGE_ID } from "../../app-properties.js";
import { ENVIRONMENTS } from "../data/environments.data.js";

const STORAGE = localStorage;
const appLocalStorageId = APP_LOCAL_STORAGE_ID;

export const setStorage = () => {
  if (STORAGE.getItem(`${appLocalStorageId}FirstTime`) === null) {
    STORAGE.setItem(`${appLocalStorageId}FirstTime`, '0');
    
    let userTMP = {
      parameters:  [
        { id: 'theme', value: 'green' },
        { id: 'expanded', value: true },
      ],
      sliders: [],
    };
    STORAGE.setItem(`${appLocalStorageId}User`, JSON.stringify(userTMP));
    setBaseSliders();
  } else {
    setNewSliders();
  }
}

export const getUser = () => {
  return JSON.parse(STORAGE.getItem(`${appLocalStorageId}User`));
}
export const setUser = (user) => {
  STORAGE.setItem(`${appLocalStorageId}User`, JSON.stringify(user));
}

export const isExpanded = () => {
  const user = getUser();
  for (const parameter of user.parameters) {
    if (parameter.id == 'expanded') {
      return parameter.value;
    }
  }
  return true;
}

export const setExpanded = (value) => {
  let user = getUser();
  for (const parameter of user.parameters) {
    if (parameter.id == 'expanded') {
      parameter.value = value;
    }
  }
  setUser(user);
}

export const getTheme = () => {
  const user = getUser();
  for (const parameter of user.parameters) {
    if (parameter.id == 'theme') {
      return parameter.value;
    }
  }
  return 'green';
}

export const setTheme = (value) => {
  let user = getUser();
  for (const parameter of user.parameters) {
    if (parameter.id == 'theme') {
      parameter.value = value;
    }
  }
  setUser(user);
}

export const getSoundBase = () => {
  const soundBase = [];
  for (let environment of ENVIRONMENTS) {
    for (let category of environment.categories) {
      for (let sound of category.sounds) {
        soundBase.push(sound);
      }
    }
  }
  return soundBase;
}

export const getEnvironmentSoundBase = (envName) => {
  const soundBase = [];
  for (let environment of ENVIRONMENTS) {
    if (environment.name === envName) {
      for (let category of environment.categories) {
        for (let sound of category.sounds) {
          soundBase.push(sound);
        }
      }
    }
  }
  return soundBase;
}

const setBaseSliders = () => {
  const soundBase =  getSoundBase();

  let user = getUser();
  for (let sound of soundBase) {
    user.sliders.push({
      name: sound.name,
      muted: false,
      absolute_volume: 100,
      relative_max_volume: sound.type == 'Background' ? null : 100,
      relative_min_volume: sound.type == 'Background' ? null : 100,
      repetition_frequency: sound.type == 'Background' ? null : 100,
      skip_frequency: sound.type == 'Background' ? null : 0,
    })
  }

  setUser(user);
}

const setNewSliders = () => {
  const soundBase = getSoundBase();

  let user = getUser();

  for (let slider of user.sliders) {
    for (let sound of soundBase) {
      if (slider.name == sound.name) {
        const index = soundBase.indexOf(sound);
        soundBase.splice(index, 1);
      }
    }
  }

  if (soundBase.length != 0) {
    console.log(`${soundBase.length} new sound(s) found`)
  
    for (let sound of soundBase) {
      user.sliders.push({
        name: sound.name,
        muted: false,
        absolute_volume: 100,
        relative_max_volume: sound.type == 'Background' ? null : 100,
        relative_min_volume: sound.type == 'Background' ? null : 100,
        repetition_frequency: sound.type == 'Background' ? null : 100,
        skip_frequency: sound.type == 'Background' ? null : 0,
      })
    }
  
    setUser(user);
  }
}