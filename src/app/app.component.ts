import {
  Component,
  ViewChild,
  ElementRef,
  ViewChildren,
  QueryList
} from '@angular/core';
import { SocketIoService } from './socket-io.service';
import { Message } from './message';
import { Subscription } from 'rxjs';
import { MatList, MatListItem } from '@angular/material/list';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  showEmojiPicker = false;
  nickname: string;
  message = '';
  messageHtml = '';
  messageArray: string[] = [];
  messageHtmlArray: string[] = [];
  messages: Message[] = [];
  private subscriptionMessages: Subscription;
  private subscriptionList: Subscription;

  @ViewChild(MatList, { read: ElementRef, static: true }) list: ElementRef;
  @ViewChildren(MatListItem) listItems: QueryList<MatListItem>;

  constructor(private socketService: SocketIoService) {}

  // tslint:disable-next-line:use-lifecycle-interface
  ngOnInit() {
    this.subscriptionMessages = this.socketService
      .messages()
      .subscribe((m: Message) => {
        console.log(m);
        this.messages.push(m);
      });
  }

  // tslint:disable-next-line:use-lifecycle-interface
  ngAfterViewInit() {
    this.subscriptionList = this.listItems.changes.subscribe(e => {
      this.list.nativeElement.scrollTop = this.list.nativeElement.scrollHeight;
    });
  }

  toggleEmojiPicker() {
    this.showEmojiPicker = !this.showEmojiPicker;
  }

  addEmoji(event) {
    let emoticonElement = event.$event.target as HTMLElement;

    if (
      !emoticonElement.style.backgroundImage ||
      emoticonElement.style.backgroundImage === ''
    ) {
      emoticonElement = emoticonElement.firstChild as HTMLElement;
    }
    const { message, messageHtml } = this;
    const text = `${message}${event.emoji.native}`;

    console.log(event.emoji);

    this.messageArray.push(`${event.emoji.native}`);
    this.messageHtmlArray.push(emoticonElement.outerHTML);
    // const textHtml = `${messageHtml}${emoticonElement.outerHTML}`;

    this.message = text;
    // this.messageHtml = textHtml;
    this.showEmojiPicker = false;
  }

  send() {
    this.messageHtml = this.message;
    let i = 0;
    for (i = 0; i < this.messageArray.length; i++) {
      const aux = `${this.messageArray[i]}`;
      console.log(aux);
      console.log(this.messageHtmlArray[i]);
      this.messageHtml = this.messageHtml.replace(
        aux,
        this.messageHtmlArray[i]
      );
    }

    console.log(this.messageHtml);

    this.socketService.send({
      from: this.nickname,
      message: this.messageHtml
    });
    this.message = '';
    this.messageHtml = '';
  }

  // tslint:disable-next-line:use-lifecycle-interface
  ngOnDestroy() {
    this.subscriptionMessages.unsubscribe();
    this.subscriptionList.unsubscribe();
  }
}
