<?php

//OC_JSON::checkAdminUser();
//OCP\JSON::callCheck();

//echo '{"username": "", "password": ""}';
//OC_JSON::success(array("data" => array( "message" => "blah!" )));


// Get dataOC_Preferences::setValue
if( isset( $_POST['email'] ) && isset( $_POST['user'] ) && filter_var( $_POST['email'], FILTER_VALIDATE_EMAIL) ) {
	$email=trim($_POST['email']);
	$user = trim($_POST['user']);
	OC_Preferences::setValue($user, 'settings', 'email', $email);
	OC_JSON::success(array("email"=>$email,"data" => array( "message" => "Email saved" )));
}elseif(isset( $_POST['user'] )){
	$user = trim($_POST['user']);
	OC_JSON::success(array("email"=>OC_Preferences::getValue($user, 'settings', 'email')));
}else{
	OC_JSON::error(array("email"=>$email, "data" => array( "message" => "Invalid email" )));
}
