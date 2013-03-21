This is an owncloud application made for GMIT company in israel.
The app is in np directory, though that should change.

The app includes:
	user logs: logs all the actions of users and shows a UserLogs navigation entry for showing them
	dxf/dwg viewing: viewing autocad files
	whitelisting files
	
Installation:
	Create an apps2 directory in owncloud's directory and add it to config/config.php
	Add np folder to apps2
	Add a file ajax/get_username_password.php that echoes the username and password as json: <?php echo '{"username": "example@example.com", "password": "example"}'; ?>
	Activate app from owncloud account
	Make sure the user owncloud runs in has read, write permissions for lib/logs 
	
TODO:
	1. use routed instead of things like 'getcwd()."apps2' ... 
	3. make autocad ws username and password configurable instead of static, so every group will have a username and a password
	4. user import from csv
	5. extra file data
