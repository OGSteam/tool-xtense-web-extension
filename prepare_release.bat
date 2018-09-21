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
xcopy extension\_locales release\chrome\_locales /E /I /H /Y
xcopy extension\contribs release\chrome\contribs /E /I /H /Y
xcopy extension\images release\chrome\images /E /I /H /Y
xcopy extension\ogspy release\chrome\ogspy /E /I /H /Y
xcopy extension\parsers release\chrome\parsers /E /I /H /Y
xcopy extension\ui release\chrome\ui /E /I /H /Y

copy /Y extension\background.js release\chrome\background.js
copy /Y extension\README.md release\chrome\README.md
copy /Y extension\style.css release\chrome\style.css
copy /Y extension\utilities.js release\chrome\utilities.js
copy /Y extension\xtense.html release\chrome\xtense.html
copy /Y extension\xtense.user.js release\chrome\xtense.user.js
copy /Y extension\Xtense-128.png release\chrome\Xtense-128.png

copy /Y extension\manifest.json.chrome release\chrome\manifest.json

echo "Copy files for Firefox"
xcopy extension\_locales release\firefox\_locales /E /I /H /Y
xcopy extension\contribs release\firefox\contribs /E /I /H /Y
xcopy extension\images release\firefox\images /E /I /H /Y
xcopy extension\ogspy release\firefox\ogspy /E /I /H /Y
xcopy extension\parsers release\firefox\parsers /E /I /H /Y
xcopy extension\ui release\firefox\ui /E /I /H /Y

copy /Y extension\background.js release\firefox\background.js
copy /Y extension\README.md release\firefox\README.md
copy /Y extension\style.css release\firefox\style.css
copy /Y extension\utilities.js release\firefox\utilities.js
copy /Y extension\xtense.html release\firefox\xtense.html
copy /Y extension\tense.user.js release\firefox\xtense.user.js
copy /Y extension\Xtense-128.png release\firefox\Xtense-128.png

copy /Y extension\manifest.json.firefox release\firefox\manifest.json

