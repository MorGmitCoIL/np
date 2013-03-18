<?php //echo $l->t('Some Setting').': "'. $_['somesetting'] . '"'; ?>
<?php

function json_readable_encode($in, $indent = 0, $from_array = false){
	return foo($in, 0, $indent, " ",$from_array = false);
}
function foo($in, $indent, $indent_increment, $indent_str, $from_array)
{
    $_myself = __FUNCTION__;
    $_escape = function ($str)
    {
        return preg_replace("!([\b\t\n\r\f\"\\'])!", "\\\\\\1", $str);
    };
    
    $out = '';

    foreach ($in as $key=>$value)
    {
        $out .= str_repeat($indent_str, $indent + $indent_increment);
        $out .= $from_array ? "": $key.": ";

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

    //$out = str_repeat($indent_str, $indent) . "{\n" . $out;
    //$out .= "\n" . str_repeat($indent_str, $indent) . "}";

    return $out;
}

?>
<?php 

function get_group_manager_logs($current_user, $group){
	$result = "";
	$dir = OC_np_helper_functions::$logs_path ."/".$group;
	$files = scandir($dir);
	//print_r($files);
	foreach($files as $i => $file){
		$info = pathinfo($file);
		if($info['extension'] !== "txt"):
			continue;
		endif;
		$username = $info['filename'];
		//$result .= $fie;
		$result .= $username . ":\n";
		$result .= "        ".str_replace("\n", "\n        ", get_user_logs($username, $group))."\n";
	}
	return $result;
}

function get_admin_logs($current_user){
	$dir = OC_np_helper_functions::$logs_path;
	$groups_folders = scandir($dir);
	$result = "";
	foreach($groups_folders as $i => $folder){
		$info = pathinfo($folder);
		if( !$info["filename"] || $info["filename"]==="."):
			continue;
		endif;
		$group_name = $info['filename'];
		$result .= $group_name .":\n";
		$result .= "        ".str_replace("\n", "\n        ", get_group_manager_logs($current_user, $group_name))."\n";
	}
	return $result;
}

function get_user_logs($current_user, $group){
	$file_name = OC_np_helper_functions::$logs_path."/".$group."/".$current_user.".txt";
	$f = fopen($file_name,"r") or die("a problem occured $group $current_user $action");
	$str = fread($f,filesize($file_name));
	$json = '['.str_replace("\n", ",\n\n", $str).'""]';
	$json = json_readable_encode(json_decode($json),4,true);
	return $json;
}
function get_logs(){
	$user_tmp = OC_User::getUser();
	if(!OC_Group::inGroup($user_tmp, "admin")):
		$groups_tmp = OC_Group::getUserGroups($user_tmp);
		//print_r($groups_tmp);
		if(!OC_SubAdmin::isSubAdminOfGroup($user_tmp, $groups_tmp[0])){
			return get_group_manager_logs($user_tmp,$groups_tmp[0]);
		}
		return get_user_logs($user_tmp,$groups_tmp[0]);
	else:
		return get_admin_logs($user_tmp);
	endif;
}
echo '<pre>'.get_logs().'</pre>';
?>
