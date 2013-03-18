<?php
	$current_user = OC_User::getUser();
	function getAllEmailsInUserGroup($current_user){
		
		$group = OC_Group::getUserGroups($current_user);
		$group = $group[0] === "admin" ? $group[1] : $group[0];
		$users = OC_Group::usersInGroup($group);

		$result = array();
		foreach($users as $i => $user){
			$tmp = OC_Preferences::getValue($user, 'settings', 'email');
			if($tmp && $tmp !== ""):
				$result[] = $tmp;
			endif;
		}
		return $result;
	}
	
	$r = true;
	$tmp = true;
	foreach(getAllEmailsInUserGroup($current_user) as $i => $email){
		$r = mail($email, "files updated/uploaded", $message);
		$tmp = $tmp && $r;
	}
	echo $tmp ? "update notification sent to all emails" : "notification could not be sent to all emails";


?>

