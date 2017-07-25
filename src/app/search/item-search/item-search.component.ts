import { Component, OnInit, OnDestroy, AfterViewInit, ComponentRef, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { Validators, FormGroup, FormArray, FormBuilder } from '@angular/forms';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/delay';

import { Subscription } from 'rxjs/Subscription';

import { MessagesService } from '../../base/services/messages.service';
import { AuthenticationService } from '../../base/services/authentication.service';
import { PubmanRestService } from '../../base/services/pubman-rest.service';
import { ElasticSearchService } from '../services/elastic-search.service';
import { SearchService } from '../services/search.service';
import { SearchTermComponent } from '../search-term/search-term.component';
import { SearchRequest, SearchTerm } from '../search-term/search.term';
import { item_aggs } from '../search-term/search.aggregations';

import { props } from '../../base/common/admintool.properties';


@Component({
  selector: 'app-item-search',
  templateUrl: './item-search.component.html',
  styleUrls: ['./item-search.component.scss'],
})
export class ItemSearchComponent implements OnInit, OnDestroy, AfterViewInit {

  @ViewChildren(SearchTermComponent) components: QueryList<SearchTermComponent>;

  item_rest_url = props.pubman_rest_url + "/items";

  searchForm: FormGroup;
  searchRequest: SearchRequest;

  searchTerm: string;
  selectedField: string;
  fields2Select: string[] = [];
  aggregationsList: any[] = [];
  selectedAggregation: any;
  years: any[] = [];
  genres: Array<any>;
  publishers: Array<any>;
  selected;
  items: any[];
  total: number = 0;
  loading: boolean = false;
  pageSize: number = 25;
  currentPage: number = 1;
  subscription: Subscription;
  token;
  index: string = "default";

  constructor(private elastic: ElasticSearchService,
    private search: SearchService,
    private pubman: PubmanRestService,
    private message: MessagesService,
    private login: AuthenticationService,
    private builder: FormBuilder) { }

  get diagnostic() { return JSON.stringify(this.years); }

  ngAfterViewInit() {
  }

  ngOnInit() {
    for (let agg in item_aggs) {
      this.aggregationsList.push(agg);
    }
    this.fields2Select = this.elastic.getMappingFields(props.item_index_name, props.item_index_type);
    this.subscription = this.login.token$.subscribe(token => {
      this.token = token;
    });
    this.searchForm = this.builder.group({
      searchTerms: this.builder.array([this.initSearchTerm()])
    });
  }

  get searchTerms(): FormArray {
    return this.searchForm.get('searchTerms') as FormArray;
  }

  initSearchTerm() {
    return this.builder.group({
      type: "",
      field: "",
      searchTerm: "",
      fields: []
    });
  }

  addSearchTerm() {
    this.searchTerms.push(this.initSearchTerm());
  }

  removeSearchTerm(i: number) {
    this.searchTerms.removeAt(i);
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  onAggregationSelect(agg) {
    this.selectedAggregation = item_aggs[agg];
    switch (agg) {
      case "creationDate":
        this.years = this.elastic.buckets(props.item_index_name, this.selectedAggregation, false);
        this.selected = agg;
        break;
      case "genre":
        this.genres = this.elastic.buckets(props.item_index_name, this.selectedAggregation, false);
        this.selected = agg;
        break;
      case "publisher":
        this.publishers = this.elastic.buckets(props.item_index_name, this.selectedAggregation, true);
        this.selected = agg;
        break;
      default:
        this.selected = null;
    }
  }

  getPage(page: number) {
    this.searchRequest = this.prepareRequest();
    // let body = this.search.prepareBody(this.searchRequest);
    let body = this.search.buildQuery(this.searchRequest, 25, ((page -1) * 25), "metadata.title.sorted", "asc");
    this.loading = true;
    // this.search.listHitsByQuery(this.token, body, this.item_rest_url)
    this.pubman.query(this.item_rest_url, this.token, body)
      .subscribe(res => {
        this.total = res.records;
        this.currentPage = page;
        this.items = res.list
        this.loading = false;
      }, (err) => {
        this.message.error(err);
      });
  }

  searchItems(body) {
    this.currentPage = 1;
    // this.search.listHitsByQuery(this.token, body, this.item_rest_url)
    this.pubman.query(this.item_rest_url, this.token, body)
      .subscribe(items => {
        this.items = items.list;
        this.total = items.records;
      }, err => {
        this.message.error(err);
      });
  }

  onSelectYear(year) {
    this.searchForm.reset();
    this.searchForm.controls.searchTerms.patchValue([{ type: "filter", field: "creationDate", searchTerm: year.key_as_string + '||/y' }]);
    this.currentPage = 1;
    // this.search.listFilteredHits(this.token, "?q=creationDate:" + year.key + "||/y", 1, props.pubman_rest_url + "/items")
    this.pubman.filter(this.item_rest_url, this.token, "?q=creationDate:" + year.key + "||/y", 1)
      .subscribe(items => {
        this.items = items.list;
        this.total = items.records;
      }, err => {
        this.message.error(err);
      });
  }

  onSelectGenre(genre) {
    this.searchForm.reset();
    this.searchForm.controls.searchTerms.patchValue([{ type: "filter", field: "metadata.genre", searchTerm: genre.key }]);
    this.currentPage = 1;
    // this.search.listFilteredHits(this.token, "?q=metadata.genre:" + genre.key, 1, props.pubman_rest_url +"/items")
    this.pubman.filter(this.item_rest_url, this.token, "?q=metadata.genre:" + genre.key, 1)
      .subscribe(items => {
        this.items = items.list;
        this.total = items.records;
      }, err => {
        this.message.error(err);
      });
  }

  onSelectPublisher(publisher) {
    this.searchForm.reset();
    let body = { size: 25, from: 0, query: {nested: { path: "metadata.sources", query: { bool: { filter: { term: { ["metadata.sources.publishingInfo.publisher.sorted"]: publisher.key } } } } } } };
    this.searchForm.controls.searchTerms.patchValue([{ type: "filter", field: "metadata.sources.publishingInfo.publisher.sorted", searchTerm: publisher.key }]);
    this.currentPage = 1;
    // this.search.listHitsByQuery(this.token, body, this.item_rest_url)
    this.pubman.query(this.item_rest_url, this.token, body)
      .subscribe(items => {
        this.items = items.list;
        this.total = items.records;
      }, err => {
        this.message.error(err);
      });
  }

  onSelect(item) {
    if (confirm("wanna delete it?")) {
      let index = this.items.indexOf(item);
      this.items.splice(index, 1);
    }
  }

  handleNotification(event: string, index) {
    if (event === "add") {
      this.addSearchTerm();
    } else if (event === "remove") {
      this.removeSearchTerm(index);
    }
  }

  submit() {
    this.searchRequest = this.prepareRequest();
    let preparedBody = this.search.buildQuery(this.searchRequest, 25, 0, "metadata.title.sorted", "asc");
    this.searchItems(preparedBody);
  }

  prepareRequest(): SearchRequest {
    const model = this.searchForm.value;
    const searchTerms2Save: SearchTerm[] = model.searchTerms.map(
      (term: SearchTerm) => Object.assign({}, term)
    );
    const request: SearchRequest = {
      searchTerms: searchTerms2Save
    };
    return request;
  }

}
