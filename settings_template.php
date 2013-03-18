<?php

OCP\User::checkAdminUser();

OCP\Util::addScript( "np", "admin" );

$tmpl = new OCP\Template( 'np', 'settings');

$tmpl->assign('url', OCP\Config::getSystemValue( "somesetting", '' ));

return $tmpl->fetchPage();
