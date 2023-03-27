



gdebi=dpkg\ \-\-force-all\ \-i


url=https://download.xnview.com/XnViewMP-linux-x64.deb
debpackage=XnViewMP-linux-x64.deb
package=./$debpackage
#sudo $gdebi $package
if [ ! -f $package ]; then
(
wget --no-check-certificate $url
sudo $gdebi $package
)
fi

if [ -f $package ]; then
(
rm -f $package
)
fi



#url_p=$(./xidel -e '(//@href, //@src)/resolve-uri(.)' https://github\.com/abbodi1406/vcredist/releases | grep "releases/expanded" | head -n 1)
#url=https://github.com$(wget -qO- $url_p | grep ".zip" | sed -e "/span/d" -e "/FreetubeApp/,/deb/p" | sed -n '/"/!{/\n/{P;b}};s/"/\n/g;D' | head -n 1)
#debpackage=${url##*/}
#package=./$debpackage
#sudo gdebi $package
#if [ ! -f $package ]; then
#(
#wget $url
#unzip $package && rm -f $package
#)
#fi
#
#if [ -f $package ]; then
#(
#rm -f $package
#)
#fi







#url=https://github.com$(wget -qO- 'https://github.com/FreeTubeApp/FreeTube/releases/latest' | grep "amd64.deb" | sed -e "/span/d" -e "/FreetubeApp/,/deb/p" | sed -n '/"/!{/\n/{P;b}};s/"/\n/g;D' | head -n 1)
url_p=$(./xidel -e '(//@href, //@src)/resolve-uri(.)' https://github\.com/FreeTubeApp/FreeTube/releases | grep "releases/expanded" | head -n 1)
url=https://github.com$(wget -qO- $url_p | grep "amd64.deb" | sed -e "/span/d" -e "/FreetubeApp/,/deb/p" | sed -n '/"/!{/\n/{P;b}};s/"/\n/g;D' | head -n 1)
rm -f index.html
debpackage=${url##*/}
package=./$debpackage
#sudo $gdebi $package
if [ ! -f $package ]; then
(
wget --no-check-certificate $url
sudo $gdebi $package
)
fi

if [ -f $package ]; then
(
rm -f $package
)
fi






url_p=$(./xidel -e '(//@href, //@src)/resolve-uri(.)' https://github\.com/ferdium/ferdium-app/releases | grep "releases/expanded" | head -n 1)
url=https://github.com$(wget -qO- $url_p | grep "amd64.deb" | sed -e "/span/d" -e "/ferdium/,/deb/p" | sed -n '/"/!{/\n/{P;b}};s/"/\n/g;D' | head -n 1)
rm -f index.html
debpackage=${url##*/}
package=./$debpackage
#sudo $gdebi $package
if [ ! -f $package ]; then
(
wget --no-check-certificate $url
sudo $gdebi $package
)
fi

if [ -f $package ]; then
(
rm -f $package
)
fi










#wget -qO - https://keys.anydesk.com/repos/DEB-GPG-KEY | sudo apt-key add -
#echo "deb http://deb.anydesk.com/ all main" | sudo tee /etc/apt/sources.list.d/anydesk-stable.list
#sudo apt update
#sudo apt install xsel

echo done!
#read r;



