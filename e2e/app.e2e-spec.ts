import { DuetifyPage } from './app.po';

describe('duetify App', () => {
  let page: DuetifyPage;

  beforeEach(() => {
    page = new DuetifyPage();
  });

  it('should display welcome message', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('Welcome to duetify!');
  });
});
