#!/usr/bin/env bash
host=m.xindoudou.cn

dist=dist
dir=/data/apps/sanlian-dev-web/admin
user=root

echo "prepare"
rm -rf $dist
cp -r app $dist
rm -rf $dist/*.html $dist/bower_components $dist/js/*.js
cp -r app/index_dist.html $dist/index.html

echo "build lib.css"
cp app/bower_components/html5-boilerplate/css/main.css $dist/css
cat \
app/bower_components/angular-xeditable/dist/css/xeditable.css \
app/bower_components/ng-sortable/dist/ng-sortable.min.css \
app/bower_components/angular-ui-select/dist/select.min.css \
app/bower_components/textAngular/src/textAngular.css \
> $dist/css/lib.css

echo "build lib.js"
echo "'use strict';" > $dist/js/lib.js

cat app/bower_components/angular-file-upload/angular-file-upload.min.js >> $dist/js/lib.js

echo " " >> $dist/js/lib.js
cat app/bower_components/angular-xeditable/dist/js/xeditable.min.js >> $dist/js/lib.js

echo " " >> $dist/js/lib.js
cat app/bower_components/ng-sortable/dist/ng-sortable.js >> $dist/js/lib.js

echo " " >> $dist/js/lib.js
cat app/bower_components/angular-ui-select/dist/select.min.js >> $dist/js/lib.js

echo " " >> $dist/js/lib.js
cat app/bower_components/checklist-model/checklist-model.js >> $dist/js/lib.js

echo "build app.js"
echo "'use strict';" > $dist/js/app.js
cat app/js/*.js |grep -v "use strict" >> $dist/js/app.js

echo "done"
