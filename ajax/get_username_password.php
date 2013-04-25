<?php
$info = pathinfo(__FILE__);
$dir_info = pathinfo($info["dirname"]);
$app_dir = $dir_info["dirname"];


$user = OC_User::getUser();
$group = OC_Group::getUserGroups($user);
$group = $group[0];
$lines = file_get_contents($app_dir."/ajax/autocadWSdata/".$group.".txt");
$lines = explode("\n",$lines);
echo '{"username": "'.$lines[0].'", "password": "'.$lines[1].'"}';
exit();


echo '{"username": "test1@gmit.co.il", "password": "something1"}';






?>
