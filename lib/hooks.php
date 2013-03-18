<?php
class OC_np_Hooks{
	static public function logUserAction($action, $path) {
		$current_user = OC_User::getUser();
		$group = OC_Group::getUserGroups($current_user);
		$group = $group[0];
		//$group = $group[0] === "admin" ? $group[1] : $group[0];

		//$fileName = $_REQUEST['fileUploaded'];
		if(!is_dir(OC_np_helper_functions::$logs_path."/".$group)):
			$r = mkdir(OC_np_helper_functions::$logs_path."/".$group);
			//die($r);
		endif;
		$f = fopen(OC_np_helper_functions::$logs_path."/".$group."/".$current_user.".txt","a+") or die("a problem occured $action");
		//fwrite($f,"file: $fileName \nupdated by: $current_user \n");
		fwrite($f,
		       json_encode(array($action => $path,
					 "at time:"=> date("Y-m-d H:i:s")
			                )
                                  )."\n");
		fclose($f);
		//echo("file: $fileName \nupdated by: $current_user \n");
		return true;
	}
	static public function logUserAction_post_create($path){
		return self::logUserAction("created file:", $path["path"]);
	}
	static public function logUserAction_post_write($path){
		return self::logUserAction("wrote to file:", $path["path"]);
	}
	static public function logUserAction_post_rename($path){
		return self::logUserAction("renamed file:", array("from"=>$path["oldpath"], "to"=>$path["newpath"]));
	}
	static public function logUserAction_post_delete($path){
		return self::logUserAction("deleted file:", $path["path"]);
	}
	static public function logUserAction_post_copy($source_path, $destination_path){
		return self::logUserAction("copied file:", array("from"=>$source_path, "to"=>$destination_path));
	}
	static public function logUserAction_read($path){
		return self::logUserAction("read file:", $path["path"]);
	}
	//static public function logUserAction_test($path){ return true;}
}

