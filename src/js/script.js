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
      //console.log('new Product:', thisProduct);
    }
    renderInMenu(){
      const thisProduct = this;
      /* generate HTML based on template */
      const generatedHTML = templates.menuProduct(thisProduct.data);
      //console.log('product HTML', generatedHTML);
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
        ////console.log(activeProducts);
        /* if there is active product and it's not thisProduct.element, remove class active from it */
        activeProducts = Array.from(activeProducts).filter(product => product !== thisProduct.element);
        activeProducts.forEach(product => product.classList.remove('active'));
        /* toggle active class on thisProduct.element */
        thisProduct.element.classList.add('active');
      });
    }
    initOrderForm(){
      const thisProduct = this;
      //console.log('init Order Form');
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
      //console.log('process Order');
      // covert form to object structure
      const formData = utils.serializeFormToObject(thisProduct.dom.form);
      ////console.log('formData', formData);
      // set price to default
      let price = thisProduct.data.price;
      //console.log('product', price);
      // for every category (param)...
      for(let paramId in thisProduct.data.params){
        const param = thisProduct.data.params[paramId];
        ////console.log(paramId, param);

        // for every option in this category
        for (let optionId in param.options) {
          const option = param.options[optionId];
          ////console.log(optionId, option);
          const optionSelected = formData[paramId] && formData[paramId].includes(optionId);
          // reduce price if default paramter is unchecked
          if (option.default && !optionSelected){
            price -= option.price;
            //console.log('price reduce', option.price);
          }
          // increase price if extra paramter is checked
          else if (!option.default && optionSelected){
            price += option.price;
            //console.log('price increase', option.price);
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
      //console.log('product', price);
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
      console.log(settings);
      console.log('AmountWidget:', thisWidget);
      console.log('constructor arguments:', element);
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

      const event = new Event('updated');
      thisWidget.element.dispatchEvent(event);
    }
  }

  class Cart{
    constructor(element) {
      const thisCart = this;
      thisCart.getElements(element);
      thisCart.initActions();
    }
    getElements(element){
      const thisCart = this;
      thisCart.dom = {};
      thisCart.dom.wrapper = element;
      thisCart.dom.toggleTrigger = thisCart.dom.wrapper.querySelector(select.cart.toggleTrigger);
      thisCart.dom.productList = thisCart.dom.wrapper.querySelector(select.cart.productList);
    }
    initActions(){
      const thisCart = this;
      thisCart.dom.toggleTrigger.addEventListener('click', ()=>{
        thisCart.dom.wrapper.classList.contains(classNames.cart.wrapperActive) ? thisCart.dom.wrapper.classList.remove(classNames.cart.wrapperActive) : thisCart.dom.wrapper.classList.add(classNames.cart.wrapperActive);
      });
    }
    add(menuProduct){
      const thisCart = this;
      console.log(menuProduct);
      const generatedHTML = templates.cartProduct(menuProduct);
      const generatedDOM = utils.createDOMFromHTML(generatedHTML);
      thisCart.dom.productList.appendChild(generatedDOM);
    }
  }

  const app = {
    initMenu: function(){
      const thisApp = this;
      //console.log('thisApp.data:', thisApp.data);
      for (let productData in thisApp.data.products){
        new Product(productData, thisApp.data.products[productData]);
      }
    },
    initData: function(){
      const thisApp = this;
      thisApp.data = dataSource;
    },
    initCart: function(){
      const thisApp = this;
      thisApp.cart = new Cart(document.querySelector(select.containerOf.cart));
    },
    init: function(){
      const thisApp = this;
      //console.log('*** App starting ***');
      //console.log('thisApp:', thisApp);
      //console.log('classNames:', classNames);
      //console.log('settings:', settings);
      //console.log('templates:', templates);
      thisApp.initData();
      thisApp.initMenu();
      thisApp.initCart();
    },
  };

  app.init();
}