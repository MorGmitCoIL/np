<?php
	$cloud_root = dirname(dirname(dirname(dirname(__FILE__))));
	include_once $cloud_root.'/lib/base.php';
?>
<?php

	function getAllEmailsInGroup($group){
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

	function get_file_name_from_json($json_log_string){ 
		$object = json_decode($json_log_string);
		foreach ($object as $key=>$val) {
			$tmp = explode(" ", $key);
			if(end($tmp) == "file:"){
				return is_string($val) ? $val : "";
			}
		}
		return false;
	}


function get_file_names_in_dir($group_dir){
	$result = array();
	$handle = opendir($group_dir);
	if ($handle) {
	    for($entry = readdir($handle); $entry !== false ; $entry = readdir($handle)) {
		$result[] = $entry;
	    }

	    closedir($handle);
	    return $result;
	}
	return false;
}

//$group_dir is assumed to end without /
// "logs/admin", not "logs/admin/"
function get_updates($group_dir){ 
	$files_in_dir = get_file_names_in_dir($group_dir);
	//print_r($files_in_dir);
	$updated_files_names = array();
	foreach ($files_in_dir as $file ) {
		if($file === "." || $file === "..")
			continue;
		$lines =file($group_dir."/".$file); 
		foreach($lines as $line){
			$tmp = get_file_name_from_json($line);
			$updated_files_names[] = $tmp;
		}
		
	}

	return $updated_files_names;
}


?>

<?php
function filter_function($str){
	$tmp = trim($str);
	return $tmp != "/" && $tmp != "";
}
function send_updates($group_dir){ 
	$updates = get_updates('logs/'.$group_dir);
	$mails = getAllEmailsInGroup($group_dir);

	$updates = array_filter($updates, 'filter_function');
	$updates = implode("\n", array_unique($updates));
	foreach($mails as $mail){
		//mail( ... );
	}
	
	print_r($mails);
	echo $updates."\n";
}
function testAll($group_dir){
	send_updates($group_dir);
	//rename directory
	$now = new DateTime();
	rename('logs/'.$group_dir, 'previous_logs/'.$group_dir.$now->getTimestamp());
}
testAll("arch");

//TODO
//for each directory in logs, send_updates($group_dir)
//then directory gets a timestamp in its name
?>
