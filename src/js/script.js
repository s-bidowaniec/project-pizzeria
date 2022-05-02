/* global Handlebars, utils, dataSource */ // eslint-disable-line no-unused-vars

{
  'use strict';

  const select = {
    templateOf: {
      menuProduct: '#template-menu-product',
      cartProduct: '#template-cart-product',
    },
    containerOf: {
      menu: '#product-list',
      cart: '#cart',
    },
    all: {
      menuProducts: '#product-list > .product',
      menuProductsActive: '#product-list > .product.active',
      formInputs: 'input, select',
    },
    menuProduct: {
      clickable: '.product__header',
      form: '.product__order',
      priceElem: '.product__total-price .price',
      imageWrapper: '.product__images',
      amountWidget: '.widget-amount',
      cartButton: '[href="#add-to-cart"]',
    },
    widgets: {
      amount: {
        input: 'input.amount',
        linkDecrease: 'a[href="#less"]',
        linkIncrease: 'a[href="#more"]',
      },
    },
    cart: {
      productList: '.cart__order-summary',
      toggleTrigger: '.cart__summary',
      totalNumber: `.cart__total-number`,
      totalPrice: '.cart__total-price strong, .cart__order-total .cart__order-price-sum strong',
      subtotalPrice: '.cart__order-subtotal .cart__order-price-sum strong',
      deliveryFee: '.cart__order-delivery .cart__order-price-sum strong',
      form: '.cart__order',
      formSubmit: '.cart__order [type="submit"]',
      phone: '[name="phone"]',
      address: '[name="address"]',
    },
    cartProduct: {
      amountWidget: '.widget-amount',
      price: '.cart__product-price',
      edit: '[href="#edit"]',
      remove: '[href="#remove"]',
    },
  };

  const classNames = {
    menuProduct: {
      wrapperActive: 'active',
      imageVisible: 'active',
    },
    cart: {
      wrapperActive: 'active',
    },
  };

  const settings = {
    amountWidget: {
      defaultValue: 1,
      defaultMin: 1,
      defaultMax: 10,
    },
    cart: {
      defaultDeliveryFee: 20,
    },
    db: {
      url: '//localhost:3131',
      products: 'products',
      orders: 'orders',
    },
  };

  const templates = {
    menuProduct: Handlebars.compile(document.querySelector(select.templateOf.menuProduct).innerHTML),
    cartProduct: Handlebars.compile(document.querySelector(select.templateOf.cartProduct).innerHTML),
  };

  class Product{
    constructor(id, data){
      const thisProduct = this;

      thisProduct.id = id;
      thisProduct.data = data;
      thisProduct.dom ={};
      thisProduct.renderInMenu();
      thisProduct.getDomElements();
      thisProduct.initAccordion();
      thisProduct.initOrderForm();
      thisProduct.initAmountWidget();
      thisProduct.processOrder();
    }
    renderInMenu(){
      const thisProduct = this;

      /* generate HTML based on template */
      const generatedHTML = templates.menuProduct(thisProduct.data);
      /* create element using utils.createElementFromHTML */
      thisProduct.element = utils.createDOMFromHTML(generatedHTML);
      /* find menu container */
      const menuContainer = document.querySelector(select.containerOf.menu);
      /* add element to menu */
      menuContainer.appendChild(thisProduct.element);
    }
    getDomElements(){
      const thisProduct = this;

      thisProduct.dom.accordionTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);
      thisProduct.dom.form = thisProduct.element.querySelector(select.menuProduct.form);
      thisProduct.dom.formInputs = thisProduct.dom.form.querySelectorAll(select.all.formInputs);
      thisProduct.dom.cartButton = thisProduct.element.querySelector(select.menuProduct.cartButton);
      thisProduct.dom.priceElem = thisProduct.element.querySelector(select.menuProduct.priceElem);
      thisProduct.dom.amountWidgetElem = thisProduct.element.querySelector(select.menuProduct.amountWidget);
    }
    initAccordion(){
      const thisProduct = this;

      /* find the clickable trigger (the element that should react to clicking) */
      thisProduct.dom.accordionTrigger.addEventListener('click', function(event) {
        /* prevent default action for event */
        event.preventDefault();
        /* find active product (product that has active class) */
        let  activeProducts = document.querySelectorAll(select.all.menuProductsActive);
        /* if there is active product and it's not thisProduct.element, remove class active from it */
        activeProducts = Array.from(activeProducts).filter(product => product !== thisProduct.element);
        activeProducts.forEach(product => product.classList.remove('active'));
        /* toggle active class on thisProduct.element */
        thisProduct.element.classList.add('active');
      });
    }
    initOrderForm(){
      const thisProduct = this;

      thisProduct.dom.form.addEventListener('submit', function (event){
        event.preventDefault();
        thisProduct.processOrder();
      });
      for (let input of thisProduct.dom.formInputs){
        input.addEventListener('change', function (){
          thisProduct.processOrder();
        });
      }
      thisProduct.dom.cartButton.addEventListener('click', function (event){
        event.preventDefault();
        thisProduct.processOrder();
        thisProduct.addToCart();
      });
    }
    initAmountWidget(){
      const thisProduct = this;

      thisProduct.amountWidget = new AmountWidget(thisProduct.dom.amountWidgetElem);
      thisProduct.dom.amountWidgetElem.addEventListener('updated', ()=>thisProduct.processOrder());
    }
    processOrder(){
      const thisProduct = this;

      // covert form to object structure
      const formData = utils.serializeFormToObject(thisProduct.dom.form);
      // set price to default
      let price = thisProduct.data.price;
      // for every category (param)...
      for(let paramId in thisProduct.data.params){
        const param = thisProduct.data.params[paramId];
        // for every option in this category
        for (let optionId in param.options) {
          const option = param.options[optionId];
          const optionSelected = formData[paramId] && formData[paramId].includes(optionId);
          // reduce price if default paramter is unchecked
          if (option.default && !optionSelected){
            price -= option.price;
          }
          // increase price if extra paramter is checked
          else if (!option.default && optionSelected){
            price += option.price;
          }
          // otherwise leave the price unchanged

          // manage product image
          const optionImage = thisProduct.element.querySelector(`.${paramId}-${optionId}`);
          if (optionImage){
            if (optionSelected){
              optionImage.classList.add(classNames.menuProduct.imageVisible);
            } else {
              optionImage.classList.remove(classNames.menuProduct.imageVisible);
            }
          }
        }
      }
      /* Save single price */
      thisProduct.priceSingle = price;
      /* multiply price by ammount */
      price *= thisProduct.amountWidget.value;
      // update price in html
      thisProduct.dom.priceElem.innerHTML = price;
    }
    prepareCartProductParams() {
      const thisProduct = this;

      const cartProductParams = {};
      const formData = utils.serializeFormToObject(thisProduct.dom.form);
      // for every category (param)...
      for (let paramId in thisProduct.data.params) {
        const param = thisProduct.data.params[paramId];
        cartProductParams[paramId] = {'label': param.label, 'options': {}};
        // for every option in this category
        for (let optionId in param.options) {
          const option = param.options[optionId];
          if (formData[paramId] && formData[paramId].includes(optionId)){
            cartProductParams[paramId]['options'][optionId] = option.label;
          }
        }
      }
      return cartProductParams;
    }
    prepareCartProduct(){
      const thisProduct = this;

      const productSummary = {};
      productSummary.id = thisProduct.id;
      productSummary.name = thisProduct.data.name;
      productSummary.amount = thisProduct.amountWidget.value;
      productSummary.priceSingle = thisProduct.priceSingle;
      productSummary.price = productSummary.amount * productSummary.priceSingle;
      productSummary.params = thisProduct.prepareCartProductParams();
      return productSummary;
    }
    addToCart(){
      const thisProduct = this;

      app.cart.add(thisProduct.prepareCartProduct());
    }
  }

  class AmountWidget{
    constructor(element) {
      const thisWidget = this;
      thisWidget.getElements(element);
      thisWidget.setValue(settings.amountWidget.defaultValue);
      thisWidget.initActions();
    }
    getElements(element){
      const thisWidget = this;

      thisWidget.element = element;
      thisWidget.input = thisWidget.element.querySelector(select.widgets.amount.input);
      thisWidget.linkDecrease = thisWidget.element.querySelector(select.widgets.amount.linkDecrease);
      thisWidget.linkIncreasse = thisWidget.element.querySelector(select.widgets.amount.linkIncrease);
    }
    setValue(value){
      const thisWidget = this;

      const newValue = parseInt(value);
      if (value !== thisWidget.value && !isNaN(newValue) && settings.amountWidget.defaultMin <= newValue && newValue <= settings.amountWidget.defaultMax){
        thisWidget.value = newValue; //> 0 ? (newValue < 10 ? newValue : 10) : 0;
        thisWidget.announce();
      }
      thisWidget.input.value = thisWidget.value;
    }
    initActions(){
      const thisWidget = this;

      thisWidget.input.addEventListener('change', ()=>thisWidget.setValue(thisWidget.input.value));
      thisWidget.linkDecrease.addEventListener('click', ()=>thisWidget.setValue(parseInt(thisWidget.input.value)-1));
      thisWidget.linkIncreasse.addEventListener('click', ()=>thisWidget.setValue(parseInt(thisWidget.input.value)+1));
    }
    announce(){
      const thisWidget = this;

      const event = new CustomEvent('updated', {bubbles: true});
      thisWidget.element.dispatchEvent(event);
    }
  }

  class Cart{
    constructor(element) {
      const thisCart = this;

      thisCart.products = [];
      thisCart.totalPrice = 0;
      thisCart.getElements(element);
      thisCart.initActions();
    }
    getElements(element){
      const thisCart = this;

      thisCart.dom = {};
      thisCart.dom.wrapper = element;
      thisCart.dom.toggleTrigger = thisCart.dom.wrapper.querySelector(select.cart.toggleTrigger);
      thisCart.dom.productList = thisCart.dom.wrapper.querySelector(select.cart.productList);
      thisCart.dom.deliveryFee = thisCart.dom.wrapper.querySelector(select.cart.deliveryFee);
      thisCart.dom.subtotalPrice = thisCart.dom.wrapper.querySelector(select.cart.subtotalPrice);
      thisCart.dom.totalPrice = thisCart.dom.wrapper.querySelectorAll(select.cart.totalPrice);
      thisCart.dom.totalNumber = thisCart.dom.wrapper.querySelector(select.cart.totalNumber);
      thisCart.dom.form = thisCart.dom.wrapper.querySelector(select.cart.form);
    }
    initActions(){
      const thisCart = this;

      thisCart.dom.toggleTrigger.addEventListener('click', ()=>{
        thisCart.dom.wrapper.classList.contains(classNames.cart.wrapperActive) ? thisCart.dom.wrapper.classList.remove(classNames.cart.wrapperActive) : thisCart.dom.wrapper.classList.add(classNames.cart.wrapperActive);
      });
      thisCart.dom.productList.addEventListener('updated', ()=>{
        thisCart.update();
      });
      thisCart.dom.productList.addEventListener('remove', (event)=>{
        thisCart.remove(event.detail.cartProduct);
      });
      thisCart.dom.form.addEventListener('submit', (event)=>{
        event.preventDefault();
        thisCart.sendOrder();
      });
    }
    add(menuProduct){
      const thisCart = this;

      /* create HTML */
      const generatedHTML = templates.cartProduct(menuProduct);
      const generatedDOM = utils.createDOMFromHTML(generatedHTML);
      thisCart.dom.productList.appendChild(generatedDOM);
      /* save data */
      thisCart.products.push(new CartProduct(menuProduct, generatedDOM));
      /* update cart total price */
      thisCart.update();
    }
    remove(menuProduct){
      const thisCart = this;

      const removedProduct = thisCart.products.splice(thisCart.products.indexOf(menuProduct), 1);
      removedProduct[0].dom.wrapper.remove();
      thisCart.update();
    }
    update(){
      const thisCart = this;

      const deliveryFee = settings.cart.defaultDeliveryFee;
      let totalNumber = 0;
      let subtotalPrice = 0;
      for (const product of thisCart.products){
        totalNumber += product.amount;
        subtotalPrice += product.price;
      }
      thisCart.totalPrice = subtotalPrice > 0 ? subtotalPrice + deliveryFee : 0;
      thisCart.dom.subtotalPrice.innerHTML = subtotalPrice;
      thisCart.dom.deliveryFee.innerHTML = deliveryFee;
      thisCart.dom.totalPrice.forEach(x=>x.innerHTML=thisCart.totalPrice);
      thisCart.dom.totalNumber.innerHTML = totalNumber;
    }
    sendOrder(){
      const thisCart = this;

      const url = settings.db.url + '/' + settings.db.orders;
      const formData = utils.serializeFormToObject(thisCart.dom.form);

      const payload = {
        'address': formData.address[0],
        'phone': formData.phone[0],
        'totalPrice': thisCart.totalPrice,
        'subtotalPrice': thisCart.totalPrice-settings.cart.defaultDeliveryFee,
        'totalNumber': thisCart.products.length,
        'deliveryFee': settings.cart.defaultDeliveryFee,
        'products': thisCart.products.map(product => product.getData()),
      };
      const options = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      };

      fetch(url, options);
    }
  }

  class CartProduct{
    constructor(menuProduct, element){
      const thisCartProduct = this;

      /* rewrite: id, name, amount, priceSingle, price, params(crust, sauce, toppings) */
      for (const paramId in menuProduct){
        thisCartProduct[paramId] = menuProduct[paramId];
      }
      thisCartProduct.getElement(element);
      thisCartProduct.initAmountWidget();
      thisCartProduct.initActions();
    }
    getElement(element){
      const thisCartProduct = this;

      thisCartProduct.dom = {};
      thisCartProduct.dom.wrapper = element;
      thisCartProduct.dom.amountWidget = element.querySelector(select.cartProduct.amountWidget);
      thisCartProduct.dom.price = element.querySelector(select.cartProduct.price);
      thisCartProduct.dom.edit = element.querySelector(select.cartProduct.edit);
      thisCartProduct.dom.remove = element.querySelector(select.cartProduct.remove);
    }
    initAmountWidget(){
      const thisCartProduct = this;

      thisCartProduct.amountWidget = new AmountWidget(thisCartProduct.dom.amountWidget);
      thisCartProduct.dom.amountWidget.addEventListener('updated', ()=>thisCartProduct.updateAmount());
    }
    initActions(){
      const thisCartProduct = this;

      thisCartProduct.dom.edit.addEventListener('click', (event)=>{
        event.preventDefault();
      });
      thisCartProduct.dom.remove.addEventListener('click', (event)=>{
        event.preventDefault();
        thisCartProduct.remove();
      });
    }
    updateAmount(){
      const thisCartProduct = this;

      thisCartProduct.amount = thisCartProduct.amountWidget.value;
      thisCartProduct.price = thisCartProduct.priceSingle * thisCartProduct.amount;
      thisCartProduct.dom.price.innerHTML = thisCartProduct.price;
    }
    remove(){
      const thisCartProduct = this;

      const event = new CustomEvent('remove', {
        bubbles: true,
        detail: {
          cartProduct: thisCartProduct,
        }
      });

      thisCartProduct.dom.wrapper.dispatchEvent(event);
    }
    getData(){
      const thisCartProduct = this;

      const reducedCartProduct = {
        'id': thisCartProduct.id,
        'amount': thisCartProduct.amount,
        'price': thisCartProduct.price,
        'priceSingle': thisCartProduct.priceSingle,
        'name': thisCartProduct.name,
        'params': thisCartProduct.params,
      };
      return reducedCartProduct;
    }
  }

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
    },
    init: function(){
      const thisApp = this;

      thisApp.initData();
      thisApp.initCart();
    },
  };

  app.init();
}