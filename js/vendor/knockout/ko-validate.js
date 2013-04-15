/**
{
	field: "field_value", [field: required, ]
	pattern: "", [pattern: optional, pattern against that the field will be compared]
	validates: [], [validates: optional, array of string with the following check ["email", "requiered", "number", "decimal", "alphanumeric"]]
	extraValidate: [] [extraValidate: optional, array of function that will be executed passing the value as argument]
	okValue: ko.observable(), [optional, ]
	decorator: [optional, string with a class or a function (validateOk, element)] 
};
*/

;(function(ko){
	//done
	var email = function(value){
		var pattern = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
		return pattern.test(value);
	};

	//done
	var numeric = function(value){
		var pattern = /^[\d]+$/;
		return pattern.test(value);
	};

	//done
	var required = function(value){
		var pattern = /^.+$/;
		return pattern.test(value);
	};

	//done
	var decimal = function(value){
		var pattern = /^[\d]+(\.[\d]+)?$/;
		return pattern.test(value);
	};

	//done
	var alphanumeric = function(value){
		var pattern = /^[a-z0-9\.-_]+$/i;
		return pattern.test(value);
	};

	var getDataBind = function(value) {		
		var val = 'value:',
			instart = value.indexOf(val) + 6,
			inend,
			ret;
		if(instart < 0){
			val = 'checked:';
			instart = value.indexOf(val) + 8;
		};
		inend = value.indexOf(',', instart);
		ret = value.slice(instart, inend);
		return ret.trim();
	};

	var getValidator = function(validator){
		if (validator === 'email') { return email; }
		if (validator === 'alphanumeric') { return alphanumeric; }
		if (validator === 'required') { return required; }
		if (validator === 'numeric') { return numeric; }
		return function () { return true; };
	};


	ko.bindingHandlers.validate = {
		init: function(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
	        // This will be called when the binding is first applied to an element
	        // Set up any initial state, event handlers, etc. here	        
	        
	    },
	    update: function(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
	        // This will be called once when the binding is first applied to an element,
	        // and again whenever the associated observable changes value.
	        // Update the DOM element based on the supplied values here.
	        //TO DO
	        
	        var currentValue = getDataBind(element.dataset.bind),
	        	validator = valueAccessor()[currentValue],
	        	valueToCheck,
	        	len
	        	valid = true,
	        	checkToRun = [];

	        if (validator) { //if validator exists
	        	valueToCheck = viewModel[currentValue]();
	        	if (validator.validates) {
	        		len = validator.validates.length;
	        		while(len--) checkToRun.push(getValidator(validator.validates[len]));
	        	};

	        	if (validator.extraValidate) {
	        		if (typeof validator.extraValidate === 'function') {
	        			checkToRun.push(validator.extraValidate);
	        		} else {
	        			len = validator.extraValidate.length;
	        			while(len--) checkToRun.push(validator.extraValidate[len]);
	        		};
	        	};

	        	len = checkToRun.length;
	        	while(len--) {
	        		valid = valid && checkToRun[len].call(this, valueToCheck);
	        		if(!valid) break;
	        	};

	        	if (valid && validator.pattern) valid = validator.pattern.test(valueToCheck);

	        	if(validator.okValue) validator.okValue(valid);

	        	if (validator.decorator) {
	        		debugger;
	        		if (typeof validator.decorator === 'string') {
	        			if (!valid) {
	        				$(element).addClass(validator.decorator);
	        			} else {
	        				$(element).removeClass(validator.decorator);
	        			};
	        		};
	        		if (typeof validator.decorator === 'function') {
	        			validator.decorator.call(this, valid, element);
	        		};
	        	};
	        };

	    }
	};
})(ko);