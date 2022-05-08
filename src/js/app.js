import {settings, select} from './settings.js';
import Product from './components/Product.js';
import Cart from './components/Cart.js';

const app = {
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

    thisApp.initData();
    thisApp.initCart();
  },
};

app.init();
