<?php
class OC_np_helper_functions{
	
	static public $app_dir;
	static public $logs_path;
	static public function init(){
		$info = pathinfo(__FILE__);
		$dir_info = pathinfo($info["dirname"]);
		OC_np_helper_functions::$app_dir = $dir_info["dirname"];
		OC_np_helper_functions::$logs_path = OC_np_helper_functions::$app_dir."/lib/logs";
	}
}
OC_np_helper_functions::init();
?>
