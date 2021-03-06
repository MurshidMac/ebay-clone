import { Component, OnInit } from '@angular/core';
import { first } from 'rxjs/operators';
import { AuctionService } from '../_services';
import { Auction } from '../_models';

@Component({
  selector: 'app-manage-auctions',
  templateUrl: './manage-auctions.component.html',
  styleUrls: ['./manage-auctions.component.css']
})
export class ManageAuctionsComponent implements OnInit {
  openform: boolean;
  openRecs: boolean = false;
  myAuctions: Auction[];
  recentAuctions: Auction[];
  selectedAuction: Auction;
  loading = false;

  constructor(
    private auctionService: AuctionService
  ) { }

  ngOnInit() {
    this.openform = false;

    this.loadAllAuctions();
  }

  // Toggles the new auction form on click
  onClickToggleForm() {
    this.openform = !this.openform;
    return this.openform;
  }

  private loadAllAuctions() {
    this.loading = true;
    this.auctionService.getAll().pipe(first()).subscribe(res => {
      this.loading = false;
      let newObj: any = res;
      this.myAuctions = newObj.auctions;
    });
  }

  onSelect(auction: Auction): void {
    this.selectedAuction = auction;
  }

  calculateClasses(auction: Auction) {
    // Calculating the color of the list item based on the date
    let corrEnds = new Date(auction.ends);
    let currDate = new Date();
    let state: boolean;
    if (auction.started != null) {
      let corrStarted = new Date(auction.started);
      if ((currDate > corrStarted) && (currDate < corrEnds)) {
        state = true;
      }
    }

    if (currDate > corrEnds) {
      state = false;
    }

    return {
      'list-group-item-success': state === true,
      'list-group-item-danger': state === false
    }
  }

  getRecs() {
    this.openRecs = true;
    return this.openRecs;
  }
}
