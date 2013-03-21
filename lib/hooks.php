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

	// checks foe regexes in the white list lines. if instead of regex the line is "directories" then checks if the file is a directory
	// a line starting with # is a comment
	static public function is_whitelisted($dir_in_owncloud,$filename){
		$white_list_regexes = OC_np_helper_functions::get_lines($dir_in_owncloud,"white_list.txt");
                if(!$white_list_regexes):
			return true;
		endif;
		foreach($white_list_regexes as $i=>$regex){
			if($regex[0] == "#"):
				continue;
			elseif($regex == "directories" && OC_Filesystem::is_dir($dir_in_owncloud."/".$filename)):
				return true;
			elseif(preg_match($regex, $filename)):
				return true;
			endif;
		}
		return false;
	}

	//TODO: when a file is uploaded, it is first shown as if uploaded successfully, even if it was deleted. fix this.
	static public function delete_if_not_in_white_list_hook($arg){
		$path_in_owncloud = $arg['path'];
		$info = pathinfo($path_in_owncloud);
		$dir_in_owncloud = $info['dirname'];
		$filename = $info['basename'];
		//die(json_encode(array($path_in_owncloud)));
		
		
		
		
		//die(json_encode(array()));
		
		if(OC_np_Hooks::is_whitelisted($dir_in_owncloud,$filename)):
			OC_np_Hooks::logThis("Y");
			//return "kept file: $filename";
		else:  OC_np_Hooks::logThis("N");
			$r = OC_Files::delete($dir_in_owncloud,$filename);
			OC_np_Hooks::logThis(" $dir_in_owncloud / $filename ".($r ? "Y" :"N")."\n");
			//return "deleted file: $filename";
		endif;
	}
	static public function logThis($str){
		$f = fopen(OC_np_helper_functions::$logs_path."/log.txt","a+") or die("?");
		fwrite($f,$str);
		fclose($f);
	}
	//static public function logUserAction_test($path){ return true;}
}

