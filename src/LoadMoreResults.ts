import { lazyDependentComponent } from '@coveops/turbo-core';
import {
  Component,
  ComponentOptions,
  IComponentBindings,
  QueryEvents,
  $$,
  ResultListEvents,
} from 'coveo-search-ui'
import { ResultListUtils } from './utilities/ResultListUtils';

export interface ILoadMoreResultsOptions {}

interface ISummaryStrings {
  first: string;
  last: string;
  totalCount: string;
  query: string;
}
export interface ILoadMoreResultsOptions {
  enableQuerySummaryInfo?: boolean;
  numberOfResultsPerLoad: number;
}

/**
* The `LoadMoreResults` component provides a button to load more results
*/
@lazyDependentComponent('ResultList')
export class LoadMoreResults extends Component {
    static ID = 'LoadMoreResults';
    static options: ILoadMoreResultsOptions = {
        /**
        * Specifies whether to display query summary info.
        *
        * Default value is `true`.
        */
        enableQuerySummaryInfo: ComponentOptions.buildBooleanOption({defaultValue: true}),
        /**
        * Specifies the number of results to fetch per load.
        *
        * Default value is 12.
        */
        numberOfResultsPerLoad: ComponentOptions.buildNumberOption({defaultValue: 12}),
    };

    private loadMoreResultsCount = 0;

    constructor(public element: HTMLElement, public options: ILoadMoreResultsOptions, public bindings?: IComponentBindings) {
      super(element, LoadMoreResults.ID, bindings);

      this.options = ComponentOptions.initComponentOptions(element, LoadMoreResults, options);

      this.bind.onRootElement(ResultListEvents.newResultsDisplayed, this.handleNewResultsDisplayed);
      this.bind.onRootElement(QueryEvents.queryError, this.handleQueryError);
    }

    private handleQueryError() {
      this.reset();
    }
    private handleNewResultsDisplayed() {
      this.reset();
      const resultListCmp = ResultListUtils.getActiveResultList(this.root);
      if (resultListCmp && resultListCmp.hasPotentiallyMoreResultsToDisplay()) {
        if (this.options.enableQuerySummaryInfo) {
            const first = (this.queryStateModel.get(Coveo.QueryStateModel.attributesEnum.first) + 1);
            const last = this.searchInterface.resultsPerPage + (this.options.numberOfResultsPerLoad * this.loadMoreResultsCount);
          this.renderQuerySummaryInfo({
            first: first.toString(),
            last: last.toString(),
            totalCount: this.searchInterface.queryController.getLastResults().totalCountFiltered.toString(),
            query: this.queryController.getLastQuery().q
          });
        }
        this.renderLoadMoreButton(resultListCmp);
      }
    }

    private renderQuerySummaryInfo(summary: ISummaryStrings) {
      const querySummaryInfoText = $$('div', {
        className: 'coveo-load-more-results-query-summary-info'
      }, Coveo.l('LoadMoreResults_ShowingResultsOf', summary.first, summary.last, summary.totalCount, summary.query));
      this.element.appendChild(querySummaryInfoText.el);
    }

    private renderLoadMoreButton(resultList: Coveo.ResultList) {
      const loadMoreButton = $$('button', {
        className: 'coveo-load-more-results-button'
      }, Coveo.l('LoadMoreResults_Label'));
      loadMoreButton.on('click', (e:Event) => {
          this.loadMoreResultsCount++;
          resultList.displayMoreResults(this.options.numberOfResultsPerLoad); })


      this.element.appendChild(loadMoreButton.el);
    }

    private reset(){
      $$(this.element).empty();
    }
}
