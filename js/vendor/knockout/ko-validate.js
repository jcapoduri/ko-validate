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
	var name = function (value) {
		var pattern = /^[a-zA-ZàáâäãåąćęèéêëìíîïłńòóôöõøùúûüÿýżźñçčšžÀÁÂÄÃÅĄĆĘÈÉÊËÌÍÎÏŁŃÒÓÔÖÕØÙÚÛÜŸÝŻŹÑßÇŒÆČŠŽ∂ð ,.'-]+$/;
		return pattern.test(value);
	};
	//done
	var email = function(value){
		var pattern = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
		return pattern.test(value);
	};

	//done
	var numeric = function(value) {
		var pattern = /^[\d]*$/;
		return pattern.test(value);
	};

	//done
	var required = function(value){
		var pattern = /^.+$/;
		return ((value !== undefined ) && (pattern.test(value)));
	};

	//done
	var decimal = function(value){
		var pattern = /^[\d]+(\.[\d]+)?$/;
		return pattern.test(value);
	};

	//done
	var alphanumeric = function(value){
		var pattern = /^[a-z0-9\.-_'"]+$/i;
		return pattern.test(value);
	};

	var date = function(value){
		var pattern = /^(?:(?:(?:0?[13578]|1[02])(\/|-)31)|(?:(?:0?[1,3-9]|1[0-2])(\/|-)(?:29|30)))(\/|-)(?:[1-9]\d\d\d|\d[1-9]\d\d|\d\d[1-9]\d|\d\d\d[1-9])$|^(?:(?:0?[1-9]|1[0-2])(\/|-)(?:0?[1-9]|1\d|2[0-8]))(\/|-)(?:[1-9]\d\d\d|\d[1-9]\d\d|\d\d[1-9]\d|\d\d\d[1-9])$|^(0?2(\/|-)29)(\/|-)(?:(?:0[48]00|[13579][26]00|[2468][048]00)|(?:\d\d)?(?:0[48]|[2468][048]|[13579][26]))$/;
		return pattern.test(value);
	}

	var url = function(value){
		var pattern = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w\#\! \.-]*)*\/?$/;
		return pattern.test(value);
	}

	var getDataBind = function(value) {		
		/*var val = bindtype,
			instart = value.indexOf(val) + bindtype.length,
			inend,
			ret;
		
		inend = value.indexOf(',', instart);
		ret = value.slice(instart, inend);
		return ret.trim();*/
		var toRet = [],
			binds = value.split(','),
			i = binds.length,
			len = i - 1;
		while (i--) binds.splice(len - i, 1, binds[len - i].split(':')[1]);

		i = binds.length;

		while (i--) toRet.push(binds[len - i].trim());
		return toRet;
	};

	var getValidator = function(validator){
		if (validator === 'email') { return email; }
		if (validator === 'alphanumeric') { return alphanumeric; }
		if (validator === 'required') { return required; }
		if (validator === 'numeric') { return numeric; }
		if (validator === 'date') { return date; }
		if (validator === 'url') { return url; }
		return function () { return true; };
	};


	var validate = function (valueToCheck, validator, forceEmpty) {
		var len,
			checkToRun = [],
			valid = true;
		if ((!forceEmpty) && (valueToCheck == undefined)){ return false; };
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

    	return valid;
	};

	var validateAndDecorate = function (valueToCheck, validator, forceEmpty) {
		var valid = validate(valueToCheck, validator),
			element = validator.el;
		if (validator.decorator) {						
    		if (typeof validator.decorator === 'string') {
    			if (!valid) {
    				$(element).addClass(validator.decorator);
    			} else {
    				$(element).removeClass(validator.decorator);
    			};
    		};
    		if (typeof validator.decorator === 'function') {
    			validator.decorator.call(this, valid, element, forceEmpty);
    		};
    	};

    	return valid;
	};

	var reValidate = function(validator){
    	var viewModel = validator.model,
    		validconf, value;
    	validator.valid = true;
        for (currentValue in validator.fields) {    			
			validconf = validator.fields[currentValue];
            if(validconf.parentObject) {
                value = (viewModel[validconf.parentObject])[currentValue]();
             } else {
                value = viewModel[currentValue]();
             }

			validator.valid = validator.valid && validate(value, validconf);
		};
		return validator.valid;
    }


	ko.bindingHandlers.validate = {
		init: function(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
	        // This will be called when the binding is first applied to an element
	        // Set up any initial state, event handlers, etc. here	     	        
	        var validator = ko.utils.unwrapObservable(valueAccessor()),
	            currentValue= getDataBind(element.getAttribute("data-bind")),
	        	i = currentValue.length,
	        	len = i -1,
	        	field, ePath;

	        //while(!field && i--) field = validator.fields[currentValue[len - i]];
            while(!field && i--){
                field = validator.fields[currentValue[len - i]];
                if(!field) {
                    ePath = currentValue[len - i].split('.');
                    if(ePath.length > 1){
                        field = validator.fields[ePath[ePath.length-1]];
                    }
                }
            };
	        if(!field) return;
	        field.first = true;
	        if (!field.bindType) field.bindType = 'value';

	        validator.model = viewModel;
	        if(field) field.el = element;
	    },
	    update: function(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
	        // This will be called once when the binding is first applied to an element,
	        // and again whenever the associated observable changes value.
	        // Update the DOM element based on the supplied values here.
	        //TO DO
	        var validatorObj = ko.utils.unwrapObservable(valueAccessor()),
                currentValue= getDataBind(element.getAttribute("data-bind")),
	        	valueToCheck,
	       		i = currentValue.length,
	        	len = i -1,
	        	field, ePath;
            while(!field && i--){
                field = validatorObj.fields[currentValue[len - i]];
                if(!field) {
                    ePath = currentValue[len - i].split('.');
                    if(ePath.length > 1){
                        field = validatorObj.fields[ePath[ePath.length-1]];
                    }
                }
            };

	        if(!field) return;
	        if(field.first) { delete field.first; return; };

	        if (field) { //if validator exists
                ePath = currentValue[len - i].split('.');
                if(ePath.length > 1){
                    field = validatorObj.fields[ePath[ePath.length-1]];
                    valueToCheck = (viewModel[ePath[ePath.length-2]])[ePath[ePath.length-1]]();
                } else {
                    valueToCheck = viewModel[currentValue[len - i]]();
                }
	        	//valid = validate(valueToCheck, validator);

	        	valid = validateAndDecorate(valueToCheck, field);
	        	field.valid = valid;
	        	if (valid){ 
	        		validatorObj.valid = reValidate(valueAccessor());
	        	} else {
	        		validatorObj.valid = false;
	        	};
	        };

	    },
	    runValidation: function(validator, forceEmpty){
	    	// 
	    	// In-progress
	    	var viewModel = validator.model,
	    		validconf, value;
	    	validator.valid = true;
            for (currentValue in validator.fields) {    			
			    validconf = validator.fields[currentValue];
                if(validconf.parentObject) {
                    value = (viewModel[validconf.parentObject])[currentValue]();
                } else {
                    value = viewModel[currentValue]();
                }

			    validator.valid = validator.valid && validate(value, validconf, forceEmpty);
                if (!validator.valid) {
                    validateAndDecorate(value, validconf, forceEmpty);
                }
		    };
    		return validator.valid;
	    },
	    /**
	     * Add a given validation in a given field
	     * @param  {Array} validator  validator
	     * @param  {String} field      field where to add the new validation
	     * @param  {String} validation validation name
	     */
	    switchValidationOn: function(validator, field, validation) {

	    	var validationArray = validator.fields[field].validates;
	    	if (!validationArray) return;

	    	validationArray.push(validation);
	    },
	    /**
	     * Remove a given validation in a given field
	     * @param  {Array} validator  validator
	     * @param  {String} field      field that contains the validation to remove
	     * @param  {String} validation validation name
	     */
	    switchValidationOff: function (validator, field, validation) {

	    	var validationArray = validator.fields[field].validates,
	    	    validationPos = validationArray.indexOf(validation);

	        if (validationPos != -1) {
	        	validationArray.splice(validationPos, 1);
	        }

	    }
	};


    var getValueVar = function(value) {
    	var val = 'value',
			instart = value.indexOf(val) + val.length,
			inend,
			ret;
		if (instart === (val.length - 1)) return "";
		instart = value.indexOf(':', instart) + 1;
		inend = value.indexOf(',', instart);
		if (inend === -1) {
			ret = value.slice(instart);
		} else {
			ret = value.slice(instart, inend);	
		};		
		return ret.trim()
    };
})(ko);