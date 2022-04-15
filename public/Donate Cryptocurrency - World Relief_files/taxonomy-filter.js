jQuery(function($) {
    if ( $( '#taxonomy-filter' ).length ) {
        // Hide and show the dropdown
        $('#taxonomy-filter_current').on('click', function (e) {
            e.preventDefault();
            $('#taxonomy-filter_options').toggle();
        });
    }
});