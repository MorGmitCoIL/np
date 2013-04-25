This is an owncloud application made for GMIT company in israel.
The app is in np directory, though that should change.

The app includes:
	user logs: logs all the actions of users and shows a UserLogs navigation entry for showing them
    mail notification system based on those logs
	dxf/dwg viewing: viewing autocad files
	whitelisting files
	
Installation:
	Create an apps2 directory in owncloud's directory and add it to config/config.php
	Add np folder to apps2
	Add a .txt file in ajax/autocadWSdata that has a username on the first line, and password on the second
	Activate app from owncloud account
	Make sure the user owncloud runs in has read, write permissions for lib/logs and lib/previous_logs
	
TODO:
	1. use routed instead of things like 'getcwd()."apps2' ... 
	3. make autocad ws username and password configurable instead of static, so every group will have a username and a password
	4. user import from csv
	5. extra file data
    6. make the whitelist system more convenient. (right now the whitelist file has to include itself as a regex for example..)
	7. complete mail notification system:
	  7.1 logs that have been sent should still be viewable in the "UserLogs" page
	  7.2 add cron configuration options in admin's "UserLogs" page
	
in ajax/autocadWSdata:
add a file such as:

username_in_autocad_WS
password_in_autocad_WS
