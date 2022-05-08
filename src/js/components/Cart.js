import {settings, select, classNames, templates} from '../settings.js';
import utils from '../utils.js';
import CartProduct from './CartProduct.js';

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

export default Cart;
