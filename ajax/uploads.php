
<?php 
	$current_user = OC_User::getUser();
	$group = OC_Group::getUserGroups($current_user);
	$group = $group[0] === "admin" ? $group[1] : $group[0];

	$fileName = $_REQUEST['fileUploaded'];
	$f = fopen("apps2/np/ajax/daily/".$group.".txt","a+") or die("a problem occured ");
	fwrite($f,"file: $fileName \nupdated by: $current_user \n");
	fclose($f);

	echo("file: $fileName \nupdated by: $current_user \n");
?>

