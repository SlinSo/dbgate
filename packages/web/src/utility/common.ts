import { openedTabs } from '../stores';
import _ from 'lodash';
import getElectron from './getElectron';

export class LoadingToken {
  isCanceled = false;

  cancel() {
    this.isCanceled = true;
  }
}

export function sleep(milliseconds) {
  return new Promise(resolve => window.setTimeout(() => resolve(null), milliseconds));
}

export function changeTab(tabid, changeFunc) {
  openedTabs.update(files => files.map(tab => (tab.tabid == tabid ? changeFunc(tab) : tab)));
}

export function setSelectedTabFunc(files, tabid) {
  return [
    ...(files || []).filter(x => x.tabid != tabid).map(x => ({ ...x, selected: false })),
    ...(files || []).filter(x => x.tabid == tabid).map(x => ({ ...x, selected: true })),
  ];
}

export function setSelectedTab(tabid) {
  openedTabs.update(tabs => setSelectedTabFunc(tabs, tabid));
}

export function getObjectTypeFieldLabel(objectTypeField) {
  if (objectTypeField == 'matviews') return 'Materialized Views';
  return _.startCase(objectTypeField);
}

export async function asyncFilter(arr, predicate) {
  const results = await Promise.all(arr.map(predicate));

  return arr.filter((_v, index) => results[index]);
}

async function computeTitleBarVisibility() {
  const electron = getElectron();
  if (!electron) {
    return false;
  }
  if (await electron.useNativeMenu()) {
    return false;
  }
  return true;
}

let titleBarVisibility = false;
export async function initTitleBarVisibility() {
  titleBarVisibility = await computeTitleBarVisibility();
  document.documentElement.style.setProperty('--dim-visible-titlebar', titleBarVisibility ? '1' : '0');
}

export function getTitleBarVisibility() {
  return titleBarVisibility;
}
