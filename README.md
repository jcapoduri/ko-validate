ko-validate
===========

a not invasive validation system form KO. My goals are:

* small and non-intrusive declaration, keep the model as cleaner as posible
* clean binding, keep the binding simpler as posible
* all data define in one place, one object keep all info needed
* can validate as you will
* small set of defined validation
* easy to implement new validation
* per fields validation status

current version: v 0.6
definition object:

	{ 
		valid: [true|false]: optional, sets a overal status of the validation
		fields: {
			[field_name]: { //
				validates: ["required", "alphanumeric"] //array of string of default set of validation, current: "required", "url", "alphanumeric", "numeric", "decimal"
				pattern: /^.+$/, //optional, pattern to validate the value of the field
				extraValidate: [] //optional, array of function that will be executed passing the value as argument
				okValue: ko.observable(), //optional, field validation status
				decorator: function(){} //optional, string with a class or a function (validateOk, element) executed only if valid
			}	
		}
	}