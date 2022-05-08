import {templates, select, classNames} from '../settings.js';
import utils from '../utils.js';
import AmountWidget from './AmountWidget.js';

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

    // app.cart.add(thisProduct.prepareCartProduct());
    const event = new CustomEvent('add-to-cart', {
      bubbles: true,
      detail: {
        product: thisProduct.prepareCartProduct(),
      }
    });

    thisProduct.element.dispatchEvent(event);
  }
}

export default Product;
