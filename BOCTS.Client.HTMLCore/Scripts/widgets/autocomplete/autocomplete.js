define(["widgets/autocomplete/jquery.autocomplete"],
    function() {

        ko.bindingHandlers.autocomplete = {
            init: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {

                var states = [
                    'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California',
                    'Colorado', 'Connecticut', 'Delaware', 'Florida', 'Georgia', 'Hawaii',
                    'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana',
                    'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota',
                    'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire',
                    'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota',
                    'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island',
                    'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont',
                    'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming'
                ];

                var $element = $(element);

                $element.autocomplete({
                    source: [states]
                });

                var value = valueAccessor();
                $element.off("keyup").on("keyup",
                    function() {
                        value($(this).val());
                    });
                
            }

        };


    });