/**
 * Reward Points 4.0 Js library
 * @package Magestore_Customerreward
 */
/********** Update JS Prototype - Magento 1.4 *********/
if (typeof Element.clone == 'undefined') {
    Element.clone = function (element, deep) {
        if (!(element = $(element))) return;
        var clone = element.cloneNode(deep);
        clone._prototypeUID = void 0;
        if (deep) {
            var descendants = Element.select(clone, '*'),
            i = descendants.length;
            while (i--) {
                descendants[i]._prototypeUID = void 0;
            }
        }
        return Element.extend(clone);
    };
}

/********** Point Slider ********/
var PointSlider = Class.create();
PointSlider.prototype = {
    initialize: function(pointEl, trackEl, handleEl, zoomOutEl, zoomInEl, pointLbl) {
        this.pointEl = $(pointEl);
        this.trackEl = $(trackEl);
        this.handleEl = $(handleEl);
        this.pointLbl = $(pointLbl);
        
        this.minPoints = 0;
        this.maxPoints = 1;
        this.pointStep = 1;
        
        this.slider = new Control.Slider(this.handleEl, this.trackEl, {
            axis:'horizontal',
            range: $R(this.minPoints, this.maxPoints),
            values: this.availableValue(),
            onSlide: this.changePoint.bind(this),
            onChange: this.changePoint.bind(this)
        });
        this.changePointCallback = function(v){};
        
        Event.observe($(zoomOutEl), 'click', this.zoomOut.bind(this));
        Event.observe($(zoomInEl), 'click', this.zoomIn.bind(this));
    },
    availableValue: function() {
        var values = [];
        for (var i = this.minPoints; i <= this.maxPoints; i += this.pointStep) {
            values.push(i);
        }
        return values;
    },
    applyOptions: function(options) {
        this.minPoints = options.minPoints || this.minPoints;
        this.maxPoints = options.maxPoints || this.maxPoints;
        this.pointStep = options.pointStep || this.pointStep;
        
        this.slider.range = $R(this.minPoints, this.maxPoints);
        this.slider.allowedValues = this.availableValue();
        
        this.manualChange(this.slider.value);
    },
    changePoint: function(points) {
        this.pointEl.value = points;
        if (this.pointLbl) {
            this.pointLbl.innerHTML = points;
        }
        if (typeof this.changePointCallback == 'function') {
            this.changePointCallback(points);
        }
    },
    zoomOut: function() {
        var curVal = this.slider.value - this.pointStep;
        if (curVal >= this.minPoints) {
            this.slider.value = curVal;
            this.slider.setValue(curVal);
            this.changePoint(curVal);
        }
    },
    zoomIn: function() {
        var curVal = this.slider.value + this.pointStep;
        if (curVal <= this.maxPoints) {
            this.slider.value = curVal;
            this.slider.setValue(curVal);
            this.changePoint(curVal);
        }
    },
    manualChange: function(points) {
        points = this.slider.getNearestValue(parseInt(points));
        this.slider.value = points;
        this.slider.setValue(points);
        this.changePoint(points);
    },
    changeUseMaxpoint: function(event) {
        var checkEl = event.element();
        if (checkEl.checked) {
            this.manualChange(this.maxPoints);
        } else {
            this.manualChange(0);
        }
    },
    changeUseMaxpointEvent: function(checkEl) {
        Event.observe($(checkEl), 'change', this.changeUseMaxpoint.bind(this));
    },
    manualChangePoint: function(event) {
        var changeEl = event.element();
        this.manualChange(changeEl.value);
    },
    manualChangePointEvent: function(changeEl) {
        Event.observe($(changeEl), 'change', this.manualChangePoint.bind(this));
    }
}

/********** Reward Point Price ********/
var RewardPrice = Class.create();
RewardPrice.prototype = {
    initialize: function (templateEl, listPrices, finalPrice, priceFormat) {
        this.templateEl = $(templateEl);
        this.listPrices = listPrices;
        
        this.generatedOldPrice = false;
        this.oldPrices = [];
        
        this.finalPrice = parseFloat(finalPrice);
        this.priceFormat = priceFormat;
        
        this.isShowed = false;
    },
    showPointPrices: function(points, ruleOption) {
        this.generateOldPrice();
        this.templateEl.down('.points').innerHTML = points;
        var discount = 0;
        if (typeof ruleOption.sliderOption == 'undefined') {
            return false;
        }
        var pointStep = parseInt(ruleOption.sliderOption.pointStep);
        if (pointStep < 1) {
            discount = parseFloat(ruleOption.stepDiscount);
        } else {
            var timesDiscount = Math.floor(points / pointStep);
            discount = parseFloat(ruleOption.stepDiscount) * timesDiscount;
        }
        var price = this.finalPrice - discount;
        if (this.finalPrice < discount) {
            price = 0;
        }
        this.templateEl.down('.price .price').innerHTML = formatCurrency(price, this.priceFormat);
        for (var i = 0; i < this.listPrices.length; i++) {
            var priceEl = this.listPrices[i];
            var oldPrice = this.oldPrices[i];
            priceEl.innerHTML = this.templateEl.innerHTML;
            if (priceEl.className == 'regular-price'
                || priceEl.className == 'full-product-price'
            ) {
                oldPrice.show();
            }
        }
        this.isShowed = true;
        return true;
    },
    clearPrices: function () {
        if (this.isShowed == false) {
            return false;
        }
        if (this.generatedOldPrice == false) {
            return false;
        }
        for (var i = 0; i < this.listPrices.length; i++) {
            var priceEl = this.listPrices[i];
            var oldPrice = this.oldPrices[i];
            priceEl.innerHTML = oldPrice.innerHTML;
            oldPrice.hide();
        }
        this.isShowed = false;
        return true;
    },
    generateOldPrice: function() {
        if (this.generatedOldPrice) {
            return false;
        }
        var oldPrices = [];
        for (var i = 0; i < this.listPrices.length; i++) {
            var priceEl = this.listPrices[i];
            var parentEl = Element.extend(priceEl.parentNode);
            var oldPrice = Element.clone(priceEl, 1);
            oldPrice.addClassName('old-price');
            parentEl.insertBefore(oldPrice, priceEl);
            oldPrice.hide();
            oldPrices.push(oldPrice);
        }
        this.oldPrices = oldPrices;
        this.generatedOldPrice = true;
        return true;
    }
}

/************** Unique Ajax Request ************/
var UniqueAjax = Class.create();
UniqueAjax.prototype = {
    initialize: function(url) {
        this.addUrl(url);
        this.isRunningRequest = false;
        this.hasWaitingRequest = false;
    },
    addUrl: function(url) {
        if (window.location.href.match('https://') && !url.match('https://')) {
            url = url.replace('http://', 'https://');
        }
        if (!window.location.href.match('https://') && url.match('https://')) {
            url = url.replace('https://', 'http://');
        }
        this.url = url;
    },
    Request: function(url, config) {
        this.addUrl(url);
        this.config = config;
        this.ReRequest();
    },
    NewRequest: function(config) {
        this.config = config;
        this.ReRequest();
    },
    ReRequest: function() {
        if (this.isRunningRequest) {
            this.hasWaitingRequest = true;
            return;
        }
        this.isRunningRequest = true;
        config = this.config;
        if (typeof this.config.beforeRequest == "function") {
            this.config.beforeRequest();
        }
        if (typeof this.config.onComplete == "function") {
            this.orgComplete = this.config.onComplete;
        } else {
            this.orgComplete = function(response){};
        }
        config.onComplete = this.onComplete.bind(this);
        new Ajax.Request(this.url, config);
    },
    onComplete: function(response) {
        this.orgComplete(response);
        this.isRunningRequest = false;
        if (this.hasWaitingRequest) {
            this.hasWaitingRequest = false;
            this.ReRequest();
        }
    }
}
