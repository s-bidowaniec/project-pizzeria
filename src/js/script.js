/* global Handlebars, utils, dataSource */ // eslint-disable-line no-unused-vars

{
  'use strict';

  const select = {
    templateOf: {
      menuProduct: '#template-menu-product',
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
        input: 'input[name="amount"]',
        linkDecrease: 'a[href="#less"]',
        linkIncrease: 'a[href="#more"]',
      },
    },
  };

  const classNames = {
    menuProduct: {
      wrapperActive: 'active',
      imageVisible: 'active',
    },
  };

  const settings = {
    amountWidget: {
      defaultValue: 1,
      defaultMin: 1,
      defaultMax: 9,
    }
  };

  const templates = {
    menuProduct: Handlebars.compile(document.querySelector(select.templateOf.menuProduct).innerHTML),
  };

  class Product{
    constructor(id, data){
      const thisProduct = this;
      thisProduct.id = id;
      thisProduct.data = data;
      thisProduct.renderInMenu();
      thisProduct.getElements();
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
    getElements(){
      const thisProduct = this;
      thisProduct.accordionTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);
      thisProduct.form = thisProduct.element.querySelector(select.menuProduct.form);
      thisProduct.formInputs = thisProduct.form.querySelectorAll(select.all.formInputs);
      thisProduct.cartButton = thisProduct.element.querySelector(select.menuProduct.cartButton);
      thisProduct.priceElem = thisProduct.element.querySelector(select.menuProduct.priceElem);
      thisProduct.amountWidgetElem = thisProduct.element.querySelector(select.menuProduct.amountWidget);
    }
    initAccordion(){
      const thisProduct = this;
      /* find the clickable trigger (the element that should react to clicking) */
      thisProduct.accordionTrigger.addEventListener('click', function(event) {
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
      thisProduct.form.addEventListener('submit', function (event){
        event.preventDefault();
        thisProduct.processOrder();
      });
      for (let input of thisProduct.formInputs){
        input.addEventListener('change', function (){
          thisProduct.processOrder();
        });
      }
      thisProduct.cartButton.addEventListener('click', function (event){
        event.preventDefault();
        thisProduct.processOrder();
      });
    }
    initAmountWidget(){
      const thisProduct = this;
      thisProduct.amountWidget = new AmountWidget(thisProduct.amountWidgetElem);
    }
    processOrder(){
      const thisProduct = this;
      //console.log('process Order');
      // covert form to object structure
      const formData = utils.serializeFormToObject(thisProduct.form);
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
      //console.log('product', price);
      // update price in html
      thisProduct.priceElem.innerHTML = price;
    }
  }

  class AmountWidget{
    constructor(element) {
      const thisWidget = this;
      console.log(settings);
      console.log('AmountWidget:', thisWidget);
      console.log('constructor arguments:', element);
      thisWidget.getElements(element);
    }
    getElements(element){
      const thisWidget = this;
      thisWidget.element = element;
      thisWidget.input = thisWidget.element.querySelector(select.widgets.amount.input);
      thisWidget.linkDecrease = thisWidget.element.querySelector(select.widgets.amount.linkDecrease);
      thisWidget.linkIncreasse = thisWidget.element.querySelector(select.widgets.amount.linkIncrease);
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
    init: function(){
      const thisApp = this;
      //console.log('*** App starting ***');
      //console.log('thisApp:', thisApp);
      //console.log('classNames:', classNames);
      //console.log('settings:', settings);
      //console.log('templates:', templates);
      thisApp.initData();
      thisApp.initMenu();
    },
  };

  app.init();
}