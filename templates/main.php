<?php //echo $l->t('Some Setting').': "'. $_['somesetting'] . '"'; ?>
<?php

// associative arrays are not supported
function json_readable_encode($in, $indent = 0){
	return foo($in, 0, $indent, " ");
}
function foo($in, $indent, $indent_increment, $indent_str)
{
    $_myself = __FUNCTION__;
    $from_array = is_array($in);
    $_escape = function ($str)
    {
        return preg_replace("!([\b\t\n\r\f\"\\'])!", "\\\\\\1", $str);
    };
    
    $out = '';

    foreach ($in as $key=>$value)
    {
        $out .= str_repeat($indent_str, $indent + $indent_increment);
        $out .= $from_array ? "": "\"$key\": ";

        if (is_object($value) || is_array($value))
        {
            $out .= "\n";
            $out .= $_myself($value, $indent + $indent_increment, $indent_increment, $indent_str);
        }
        elseif (is_bool($value))
        {
            $out .= $value ? 'true' : 'false';
        }
        elseif (is_null($value))
        {
            $out .= 'null';
        }
        elseif (is_string($value))
        {
            $out .= "\"" . $_escape($value) ."\"";
        }
        else
        {
            $out .= $value;
        }

        $out .= ",\n";
    }
    
    if (!empty($out))
    {
        $out = substr($out, 0, -2);
    }

    $open_paren = $from_array ? "[" : "{";
    $close_paren = $from_array ? "]" : "}";
    $out = str_repeat($indent_str, $indent) . $open_paren."\n" . $out;
    $out .= "\n" . str_repeat($indent_str, $indent) . $close_paren;

    return $out;
}

?>
<?php 
function tag($tag, $obj){
	$result = new stdClass();
	$result->{$tag} = $obj;
	return $result;
}
function get_group_manager_logs($current_user, $group){
	$result = new stdClass();
	$dir = OC_np_helper_functions::$logs_path ."/".$group;
	$files = scandir($dir);
	//print_r($files);
	foreach($files as $i => $file){
		$info = pathinfo($file);
		if($info['extension'] !== "txt"):
			continue;
		endif;
		$username = $info['filename'];
		$result->{$username} = get_user_logs($username, $group);
	}
	return tag('group', $result);
}

function get_admin_logs($current_user){
	$dir = OC_np_helper_functions::$logs_path;
	$groups_folders = scandir($dir);
	$result = new stdClass();
	foreach($groups_folders as $i => $folder){
		$info = pathinfo($folder);
		if( !$info["filename"] || $info["filename"]==="." || !is_dir(OC_np_helper_functions::$logs_path . "/" . $folder)):
			continue;
		endif;
		$group_name = $info['filename'];
		$result->{$group_name} = get_group_manager_logs($current_user, $group_name);
	}
	return tag('all',$result);
}

function get_user_logs($current_user, $group){
	$file_name = OC_np_helper_functions::$logs_path."/".$group."/".$current_user.".txt";
	if(!file_exists($file_name)):
		return "";
	endif;
	$f = fopen($file_name,"r") or die("a problem occured $group $current_user $action");
	$str = fread($f,filesize($file_name));
	$json = '['.str_replace("\n", ",\n\n", $str).'""]';
	$result = json_decode($json);
	return tag('user',$result);
}
function get_logs_array(){
	$user_tmp = OC_User::getUser();
	if(OC_Group::inGroup($user_tmp, "admin")):
		return get_admin_logs($user_tmp);
	endif;
	$groups_tmp = OC_Group::getUserGroups($user_tmp);
	//print_r($groups_tmp);
	if(OC_SubAdmin::isSubAdminOfGroup($user_tmp, $groups_tmp[0])){
		return get_group_manager_logs($user_tmp,$groups_tmp[0]);
	}
	return get_user_logs($user_tmp,$groups_tmp[0]);;
}
function get_logs(){
	return json_readable_encode(get_logs_array(),4);
}
//OC_np_file_data::addRow(__FILE__, '{"just":"testing"}');
//echo "\n";
//$a=OC_np_file_data::testDb();
//print_r($a);
//echo '<pre>';
//foreach ($a as $k => $v){
//	echo $v["json_file_data"]."  ".$v["file_path"]."\n";
//}
//echo '</pre>';
echo '<pre id="logs_json">'.get_logs().'</pre>'.'<div id="logs"></div>';
?>
