import {select} from '../settings.js';
import AmountWidget from './AmountWidget.js';

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

export default CartProduct;
