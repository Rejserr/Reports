@echo off
echo Pokretanje dnevnog importa podataka u Picking tablicu...
sqlcmd -S ft-AppServer01\SQLEXPRESS -d Reports -i "C:\VS\Reports\daily_import_picking.sql" -o "C:\VS\Reports\logs\import_log_%date:~-4,4%%date:~-7,2%%date:~-10,2%.txt"
echo Import završen.
