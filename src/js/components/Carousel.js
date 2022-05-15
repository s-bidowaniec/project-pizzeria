import {select, settings} from '../settings.js';
import utils from '../utils.js';

class Carousel {
  constructor() {
    const thisCarousel = this;

    thisCarousel.dom = {};
    thisCarousel.dom.wrapper = document.querySelector(select.containerOf.slider);
    thisCarousel.fetchOpinions();
  }

  fetchOpinions() {
    const thisCarousel = this;

    const url = settings.db.url + '/' + settings.db.opinions;
    fetch(url)
      .then(rawResponse => rawResponse.json())
      .then(parsedResponse => {
        thisCarousel.opinions = parsedResponse;
        thisCarousel.loadOpinionsToDOM();
      });
  }

  loadOpinionsToDOM() {
    const thisCarousel = this;

    console.log(thisCarousel.opinions);
    const opinionTemplateDOM = document.querySelector(select.templateOf.opinion);
    const opinionTemplate = Handlebars.compile(opinionTemplateDOM.innerHTML);
    for (let opinionData of thisCarousel.opinions) {
      const opinionHTML = opinionTemplate(opinionData);
      const opinionDomElement = utils.createDOMFromHTML(opinionHTML);
      thisCarousel.dom.wrapper.appendChild(opinionDomElement);
      console.log(thisCarousel.dom.wrapper);
    }
    thisCarousel.flkty = new Flickity(thisCarousel.dom.wrapper, settings.carousel);
  }
}

export default Carousel;
