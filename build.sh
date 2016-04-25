r.js -o src/build.js
rm -r build/views/*/*.css
rm -r build/views/*/*.tpl
cd build
version=`date +%Y%m%d%H`
sed -i '' "s/\?ver=[^\"]*\"/?ver=$version\"/g"  index.html
sed -i '' "s/_appVersion=date/_appVersion=\"$version\"/g" main.js
echo 'add'
git add .
echo 'commit'
git commit -m 'by liuhui'
git push origin master
curl http://cp01-bpit-iit-bkmdev-chenhongwei01.epc.baidu.com:8680/upload.php
#test by liuhui