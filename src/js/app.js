import {settings, select, classNames} from './settings.js';
import Product from './components/Product.js';
import Cart from './components/Cart.js';

const app = {
  initPages: function(){
    const thisApp = this;

    thisApp.pages = document.querySelector(select.containerOf.pages).children;
    thisApp.navLinks = document.querySelectorAll(select.nav.links);
    thisApp.activatePage(thisApp.pages[0].id);
  },

  activatePage: function(pageId){
    const thisApp = this;

    /* Add class "active" to matching page, remove from non-matching */
    for (let page of thisApp.pages){
      page.classList.toggle(classNames.pages.active, page.id === pageId);
    }
    /* Add class "active" to matching link, remove from non-matching */
    for (let link of thisApp.navLinks){
      link.classList.toggle(
        classNames.nav.active,
        link.getAttribute('href') === `#${pageId}`
      );
    }
  },

  initMenu: function(){
    const thisApp = this;

    for (let productData in thisApp.data.products){
      new Product(thisApp.data.products[productData].id, thisApp.data.products[productData]);
    }
  },

  initData: function(){
    const thisApp = this;

    thisApp.data = {};
    const url = settings.db.url + '/' + settings.db.products;
    console.log(url);
    fetch(url)
      .then(rawResponse => rawResponse.json())
      .then(parsedResponse => {
        console.log(parsedResponse);
        thisApp.data.products = parsedResponse;
        thisApp.initMenu();
      });
  },

  initCart: function(){
    const thisApp = this;

    thisApp.cart = new Cart(document.querySelector(select.containerOf.cart));
    thisApp.productList = document.querySelector(select.containerOf.menu);
    thisApp.productList.addEventListener('add-to-cart', (event)=>{
      app.cart.add(event.detail.product);
    });
  },

  init: function(){
    const thisApp = this;

    thisApp.initPages();
    thisApp.initData();
    thisApp.initCart();
  },
};

app.init();
