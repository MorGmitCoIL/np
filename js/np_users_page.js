$(document).ready(function () {
    'use strict';
    function users_page(){
        return document.location.pathname.replace(/^.*(index.php)/, "$1") === "index.php/settings/users";
    }
    if(!users_page())
        return;

    //TODO on change of input, send ajax to change email
    $('th#headerPassword').
    after('<th>email</th>').
    npPlugin("columnBelow").
    after('<td><input type="text" placeholder="email"></input></td>').
    next().
    find('input').
    on("change", function () {
	var that = this;
	console.log("setting email...");
	$.ajax({
		type: "POST",
		url: OC.filePath("np", "ajax", "set_user_email.php"),
		data: {
			user: $(this).closest('tr').find('td:first-child').text().trim(),
			email: $(this).val()
		}
	}).
	success(function () {
		$(that).
		parent().
		css("background-color", "lightgreen").
		npPlugin("allInColumn").
		css("background-color", "white");
	});
    });
});
