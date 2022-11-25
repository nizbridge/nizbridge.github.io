
$(function() {
    var findUrl;
    $('button').click(function() {
        findUrl = $('input').val();
        datascrab(findUrl);
    })
    
});
function datascrab(findUrl) {
    $.get(findUrl, function(data) {
        result = data.match(/{/g);
        

    }).done(function(data) {
        $('body').html(data);
    });  
}