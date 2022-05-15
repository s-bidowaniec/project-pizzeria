import {select} from '../settings.js';
import Carousel from './Carousel.js';

class HomePage {
  constructor(domWrapper) {
    const thisHomePage = this;

    thisHomePage.render(domWrapper);
    thisHomePage.slider = new Carousel();
  }

  render(domWrapper) {
    const thisHomePage = this;

    thisHomePage.dom = {};
    thisHomePage.dom.wrapper = domWrapper;
    const templateDom = document.querySelector(select.templateOf.homePage);
    const template = Handlebars.compile(templateDom.innerHTML);
    const renderedPage = template();
    thisHomePage.dom.wrapper.innerHTML = renderedPage;
  }
}

export default HomePage;
