<?php
class OC_np_file_data{
	static public function testDb(){
		$query=OC_DB::prepare('SELECT * FROM `*PREFIX*file_data`');
		$result=$query->execute(array());
		$r = array();
		while($row=$result->fetchRow()) {
			$r[]=$row;
		}
		return $r;
	}
	static public function addRow($file_path, $data_json){
		$query=OC_DB::prepare('INSERT INTO `*PREFIX*file_data` VALUES (?,?)');
		$result=$query->execute(array($file_path, $data_json));
		return json_encode($result->fetchAll());
	}
/*
	static public function getFileData($file_path){
		$query=OC_DB::prepare('SELECT * FROM `*PREFIX*file_data` WHERE  = \'?\'');
		$result=$query->execute(array($file_path, $data_json));
		return json_encode($result->fetchAll());
	}
	static public function setFileData($file_path, $key, $data_item){
		$query=OC_DB::prepare('INSERT INTO `*PREFIX*file_data` VALUES (?,?)');
		$result=$query->execute(array($file_path, $data_json));
		return json_encode($result->fetchAll());
	}
*/
}
?>
