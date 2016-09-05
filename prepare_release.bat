echo "Cleaning Release Folder"
rmdir release /s /q
echo "Creating Folder release:\n"
mkdir release
echo "Creating Sub Folders Firefox and Chrome"
cd release
mkdir chrome
mkdir firefox
cd ..
echo "Copy files for Chrome"
xcopy _locales release\chrome\_locales /E /I /H /Y
xcopy contribs release\chrome\contribs /E /I /H /Y
xcopy images release\chrome\images /E /I /H /Y
xcopy ogspy release\chrome\ogspy /E /I /H /Y
xcopy parsers release\chrome\parsers /E /I /H /Y
xcopy ui release\chrome\ui /E /I /H /Y

copy /Y background.js release\chrome\background.js
copy /Y README.md release\chrome\README.md
copy /Y style.css release\chrome\style.css
copy /Y utilities.js release\chrome\utilities.js
copy /Y xtense.html release\chrome\xtense.html
copy /Y xtense.user.js release\chrome\xtense.user.js
copy /Y Xtense-128.png release\chrome\Xtense-128.png

copy /Y manifest.json.chrome release\chrome\manifest.json

echo "Copy files for Firefox"
xcopy _locales release\firefox\_locales /E /I /H /Y
xcopy contribs release\firefox\contribs /E /I /H /Y
xcopy images release\firefox\images /E /I /H /Y
xcopy ogspy release\firefox\ogspy /E /I /H /Y
xcopy parsers release\firefox\parsers /E /I /H /Y
xcopy ui release\firefox\ui /E /I /H /Y

copy /Y background.js release\firefox\background.js
copy /Y README.md release\firefox\README.md
copy /Y style.css release\firefox\style.css
copy /Y utilities.js release\firefox\utilities.js
copy /Y xtense.html release\firefox\xtense.html
copy /Y xtense.user.js release\firefox\xtense.user.js
copy /Y Xtense-128.png release\firefox\Xtense-128.png

copy /Y manifest.json.firefox release\firefox\manifest.json

