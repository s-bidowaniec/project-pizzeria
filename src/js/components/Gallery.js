import {select, settings} from '../settings.js';
import utils from '../utils.js';

class Gallery {
  constructor() {
    const thisGallery = this;

    thisGallery.dom = {};
    thisGallery.dom.wrapper = document.querySelector(select.containerOf.gallery);
    thisGallery.fetchPhotos();
  }

  fetchPhotos() {
    const thisGallery = this;

    const url = settings.db.url + '/' + settings.db.gallery;
    fetch(url)
      .then(rawResponse => rawResponse.json())
      .then(parsedResponse => {
        thisGallery.photos = parsedResponse;
        thisGallery.loadPhotosToDOM();
      });
  }

  loadPhotosToDOM() {
    const thisGallery = this;

    console.log(thisGallery.photos);
    const photoTemplateDOM = document.querySelector(select.templateOf.photo);
    const photoTemplate = Handlebars.compile(photoTemplateDOM.innerHTML);
    for (let photoData of thisGallery.photos) {
      const photoHTML = photoTemplate(photoData);
      const photoDomElement = utils.createDOMFromHTML(photoHTML);
      thisGallery.dom.wrapper.appendChild(photoDomElement);
      console.log(thisGallery.dom.wrapper);
    }
  }
}


export default Gallery;