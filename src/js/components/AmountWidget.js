import {select, settings} from '../settings.js';
import BaseWidget from './BaseWidget.js';

class AmountWidget extends BaseWidget {
  constructor(element) {
    super(element, settings.amountWidget.defaultValue);
    const thisWidget = this;
    thisWidget.getElements();
    thisWidget.initActions();
    // console.log('AmountWidget: ', thisWidget);
  }

  getElements() {
    const thisWidget = this;

    thisWidget.dom.input = thisWidget.dom.wrapper.querySelector(
      select.widgets.amount.input
    );
    thisWidget.dom.linkDecrease = thisWidget.dom.wrapper.querySelector(
      select.widgets.amount.linkDecrease
    );
    thisWidget.dom.linkIncreasse = thisWidget.dom.wrapper.querySelector(
      select.widgets.amount.linkIncrease
    );
  }

  isValid(value) {
    return (
      !isNaN(value) &&
      settings.amountWidget.defaultMin <= value &&
      value <= settings.amountWidget.defaultMax
    );
  }

  renderValue() {
    const thisWidget = this;
    thisWidget.dom.input.value = thisWidget.value;
  }

  initActions() {
    const thisWidget = this;

    thisWidget.dom.input.addEventListener('change', () =>
      thisWidget.setValue(thisWidget.dom.input.value)
    );
    thisWidget.dom.linkDecrease.addEventListener('click', () =>
      thisWidget.setValue(parseInt(thisWidget.dom.input.value) - 1)
    );
    thisWidget.dom.linkIncreasse.addEventListener('click', () =>
      thisWidget.setValue(parseInt(thisWidget.dom.input.value) + 1)
    );
  }
}


export default AmountWidget;
