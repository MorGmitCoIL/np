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
	static public function get_lines($dir, $file){
		if(!OC_Filesystem::file_exists($dir."/".$file)):
			return false;
		endif;
		$lines = OC_Filesystem::file_get_contents($dir."/".$file);
		//$lines = ob_get_contents();
		$lines = explode("\n",$lines);
		return $lines;
	}
}
OC_np_helper_functions::init();
?>
