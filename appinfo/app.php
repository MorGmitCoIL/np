<?php

OC::$CLASSPATH['OC_np_Hooks'] = 'np/lib/hooks.php';
OC::$CLASSPATH['OC_np_helper_functions'] = 'np/lib/helper_functions.php';
OC::$CLASSPATH['OC_np_file_data'] = 'np/lib/fileData.php';
$actions = array('post_create', 'post_rename', 'post_delete', 'post_copy', 'post_write', 'read');
foreach($actions as $i => $a){
	OC_HOOK::connect('OC_Filesystem', $a, 'OC_np_Hooks', 'logUserAction'.'_'.$a);
}
OC_HOOK::connect('OC_Filesystem', 'post_create', 'OC_np_Hooks', 'delete_if_not_in_white_list_hook');
//OC_HOOK::connect('OC_Filesystem', "post_create", 'OC_np_Hooks', 'logUserAction');
OCP\Util::addscript( 'np', 'np_js' );
OCP\Util::addscript( 'np', 'webdavClient' );
OCP\Util::addscript( 'np', 'webdavManager' );
OCP\Util::addscript( 'np', 'Base64' );
OCP\Util::addscript( 'np', 'utils' );
OCP\Util::addscript( 'np', 'fileMetadata' );
OCP\App::registerAdmin( 'np', 'settings' );

OCP\App::addNavigationEntry( array( 
	'id' => 'np',
	'order' => 74,
	'href' => OCP\Util::linkTo( 'np', 'index.php' ),
	'icon' => OCP\Util::imagePath( 'np', 'example.png' ),
	'name' => 'UserLogs'
));

