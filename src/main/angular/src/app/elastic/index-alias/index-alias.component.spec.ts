import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IndexAliasComponent } from './index-alias.component';

describe('IndexAliasComponent', () => {
  let component: IndexAliasComponent;
  let fixture: ComponentFixture<IndexAliasComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IndexAliasComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IndexAliasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
