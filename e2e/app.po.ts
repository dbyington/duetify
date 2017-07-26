import { browser, by, element } from 'protractor';

export class DuetifyPage {
  navigateTo() {
    return browser.get('/');
  }

  getParagraphText() {
    return element(by.css('duetify-root h1')).getText();
  }
}
