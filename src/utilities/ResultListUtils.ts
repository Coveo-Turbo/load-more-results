
import { find } from 'underscore';
import {
  Component,
  ResultList,
  $$
} from 'coveo-search-ui';

export class ResultListUtils {
  
  public static getActiveResultList(root: HTMLElement) {
    const resultLists = ResultListUtils.getResultLists(root);
    return find(resultLists, resultList => !resultList.disabled);
  }

  private static getResultLists(root: HTMLElement) {
    return $$(root)
      .findAll(`.${ResultListUtils.cssClass()}`)
      .map(el => <ResultList>Component.get(el, ResultList));
  }

  private static cssClass() {
    return Component.computeCssClassNameForType('ResultList');
  }

  
}