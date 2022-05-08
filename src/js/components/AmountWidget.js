import {select, settings} from '../settings.js';

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

export default AmountWidget;
