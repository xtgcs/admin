host=www.quanminxingtan.com

dir=/opt/fengxing/public/m2

echo "prepare"
ssh root@$host "mkdir -p $dir"

echo "scp"
scp -r images root@$host:$dir
scp index.html root@$host:$dir

echo "done"
