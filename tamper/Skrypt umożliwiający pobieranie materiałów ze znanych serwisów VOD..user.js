// ==UserScript==
// @name         Skrypt umożliwiający pobieranie materiałów ze znanych serwisów VOD.
// @namespace    http://www.ipla.tv/
// @include      *www.ipla.tv/*
// @include      *getmedia.redefine.pl/*
// @include      *player.pl/*
// @include      *vod.pl/*
// @include      *qi.ckm.onetapi.pl/*
// @include      *tvp.pl/*
// @include      *www.cda.pl/*
// @version      4.9
// @description  Skrypt umożliwiający pobieranie materiałów z serwisów: ipla.tv, player.pl, vod.pl, vod.tvp.pl, cda.pl. Działa tylko z rozszerzeniem Tampermonkey.
// @author       Przemek
// @match        http://www.ipla.tv/*
// @grant        none
// ==/UserScript==
//Ważne:
//Skrypt opiera się na skryptach umieszczonych na stronie: miniskrypt.blogspot.com
//oraz: miniskrypt.hubaiitv.pl. Moje rozszerzenie tylko i wyłącznie dodaje wygodne
//w użyciu przyciski, jednak nie jestem autorem większości kodu.
//Skrypt jest niepubliczny, a dostęp do niego mają tylko i wyłącznie osoby z linkiem.
/////////////////////// KONFIGURACJA ////////////////////////
var Wlacz_skrypt = true; // true = skrypt włączony, false = skrypt wyłączony.
//////////////////// KONIEC KONFIGURACJI ////////////////////

var SkryptKopiujText = "function copyText(e){function t(e){if(document.selection){var t=document.body.createTextRange();t.moveToElementText(e),t.select()}else if(window.getSelection){var t=document.createRange();t.selectNode(e),window.getSelection().removeAllRanges(),window.getSelection().addRange(t)}}var n=document.createElement(\"DIV\");n.textContent=e,document.body.appendChild(n),t(n),document.execCommand(\"copy\"),n.remove()} ";
var StyleText = "<style>body{font-family: \"Segoe UI\";}.clicked{background-color: #7CFC00;}</style>";

function addEvent(obj, event, func) {
    if (obj.addEventListener) {
        obj.addEventListener(event, func, false);
        return true;
    } else if (obj.attachEvent) {
        obj.attachEvent('on' + event, func);
    } else {
        var f = obj['on' + event];
        obj['on' + event] = typeof f === 'function' ? function () {
            f();
            func();
        }
        : func;
    }
}

function ShowPromptWithInfo(lol, info = null) {
    var infotext = 'Aby skopiować link, wciśnij: CTRL+C, potem: ENTER aby rozpocząć pobieranie, lub ESC aby zakończyć działanie skryptu';
    if(info !== null){
        infotext = infotext + ". " + info;
    }
    if (window.prompt(infotext, lol)) {
        document.location.href = lol;
    }
}

function ShowPrompt(lol) {
    window.prompt('Aby skopiować link, wciśnij: CTRL+C, potem: ENTER', lol);
}

function makeid()
{
    var text = '';
    var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (var i = 0; i < 5; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    return text;
}

var DocumentWriteFirefoxFix = '';
function fireNewTab() {
    function makeid2() {
        var text = '';
        var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        for (var i = 0; i < 5; i++)
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        return text;
    }
    var randomText = makeid2();
    var newTab = window.open('about:blank', 'MsgWindow-' + randomText);
    newTab.document.write("DocumentWriteFirefoxFix");
    newTab.addEventListener('load', function () {
        //alert('hi2');
        var destDoc = newTab.document;
        destDoc.open();
        destDoc.write("DocumentWriteFirefoxFix");
        destDoc.close();
    }, false
                           );
}
function addslashes( str ) {
    return (str + '').replace(/[\\"']/g, '\\$&').replace(/\u0000/g, '\\0');
}

function addJS_Node(text, s_URL, funcToRun, runOnLoad) {
    var D = document;
    var scriptNode = D.createElement('script');
    if (runOnLoad) {
        scriptNode.addEventListener('load', runOnLoad, false);
    }
    scriptNode.type = 'text/javascript';
    if (text) scriptNode.textContent = text;
    if (s_URL) scriptNode.src = s_URL;
    var str = funcToRun.toString();
    var tes = addslashes(DocumentWriteFirefoxFix);
    var res = str.replace("DocumentWriteFirefoxFix", tes);
    res = res.replace("DocumentWriteFirefoxFix", tes);
    if (funcToRun) scriptNode.textContent = '(' + res + ')()';

    var targ = D.getElementsByTagName('head') [0] || D.body || D.documentElement;
    targ.appendChild(scriptNode);
}

function PokazLinkTVNNowy() {
    try {
        try {
            n = document.querySelector("#detailEpisode").getAttribute("data-article-id");
        } catch (e) {
            var pageURL = window.location.href;
            var lastComma = pageURL.lastIndexOf(",");
            if (lastComma > - 1) {
                n = pageURL.substring(lastComma+1);
                n = parseInt(n);
            }
        }
        xmlhttp = new XMLHttpRequest();
        xmlhttp.open("GET", "/api/?platform=ConnectedTV&terminal=Panasonic&format=json&authKey=064fda5ab26dc1dd936f5c6e84b7d3c2&v=3.1&m=getItem&id=" + n, false);
        xmlhttp.send();
        o = JSON.parse(xmlhttp.responseText);
        lt = o.item.videos.main.video_content_license_type;
        dd = o.item.videos.main.video_content;
        title = o.item.serie_title + " - S" + o.item.season + "E" + o.item.episode;
        if (lt !== null) {
            alert('DRM lub brak materiału TV :(');
            return;
        }
        DocumentWriteFirefoxFix = "";
        var randomText = makeid();
        DocumentWriteFirefoxFix = DocumentWriteFirefoxFix + '<p>Tytuł: ' + title + '</p>';
        var HighestResolution = 0;
        var HighestResolutionLink = '';
        for (var j = 0, len = dd.length; j < len; j = j + 1) {
            HighestResolution = HighestResolution + 1;
            dlurl = dd[j].url;
            if(j < 2){
                HighestResolutionLink = dlurl;
            }
            pn = dd[j].profile_name;
            DocumentWriteFirefoxFix = DocumentWriteFirefoxFix + "<p>Jakość materiału: " + pn + "<br>";
            DocumentWriteFirefoxFix = DocumentWriteFirefoxFix + "Link do materiału: <button id=\"button-" + j + "\" type=\"button\">Kopiuj</button><br><a target=\"_blank\" href=\"" + dlurl + "\">" + dlurl + "</a></p>";
            DocumentWriteFirefoxFix = DocumentWriteFirefoxFix + "<script>var but = document.getElementById('button-"+j+"');but.addEventListener('click', function(){copyText(\""+ dlurl +"\");document.getElementById('button-"+j+"').setAttribute(\"class\", \"clicked\");})</script>";
        }
        DocumentWriteFirefoxFix = DocumentWriteFirefoxFix + StyleText + '<script type="application/javascript">function ShowPromptWithInfo(lol){if (window.prompt("Aby skopiować link, wciśnij: CTRL+C, potem: ENTER aby rozpocząć pobieranie, lub ESC aby zakończyć działanie skryptu", lol)){document.location.href=lol;}}setTimeout(function () {ShowPromptWithInfo("' + HighestResolutionLink + '");}, 1000);' + SkryptKopiujText + '</script>';
        addJS_Node(null, null, fireNewTab);

    } catch (e) {}
}

function PokazLinkPobieranieIpla() {
    //alert('ipla');
    nn = document.querySelector('pre').textContent;
    v = JSON.parse(nn);
    if (v.vod.drm == true) {
        alert('Niestety, ale materiał jest zabezpieczony DRM i prawdopodobnie nie będzie można go pobrać :(');
    }
    var QualityArray = [];
    var copies = v.vod.copies;
    if(copies !== null){
        if(copies.length > 0){
            for (var prop in copies) {
                var copy = copies[prop];
                var newArray = [copy.quality_p, copy.url];
                QualityArray.push(newArray);
            }
            if(QualityArray !== null){
                var countArray = QualityArray.length;
                if(countArray > 0){
                    var countArrayElement = countArray - 1;
                    var bestQuality = QualityArray[countArrayElement][0];
                    var bestQualityLink = QualityArray[countArrayElement][1];
                    ShowPromptWithInfo(bestQualityLink,"\nWybrana jakość materiału to: " + bestQuality + ".");
                }
            }
        }
    }
}

function PokazLinkIpla() {
    if (location.href.match(/^http[s]?:\/\/www\.ipla\.tv\//)) {
        try {
            var mid = document.querySelector('#vod-player').getAttribute('data-vod-json');
            var idn = JSON.parse(mid).mid;
            //top.location.href = 'https://getmedia.redefine.pl/vods/get_vod/?cpid=1&ua=mipla_ios/122&media_id=' + idn;
            top.location.href = 'https://getmedia.redefine.pl/vods/get_vod/?cpid=1&ua=www_iplatv_html5/12345&media_id=' + idn;
        } catch (e) {

            try {
            var x = window.location.href;
            idn = x.match(/[\a-z\d]{32}/)[0];
            //top.location.href = 'https://getmedia.redefine.pl/vods/get_vod/?cpid=1&ua=mipla_ios/122&media_id=' + idn;
            top.location.href = 'https://getmedia.redefine.pl/vods/get_vod/?cpid=1&ua=www_iplatv_html5/12345&media_id=' + idn;
            } catch (e) {
                var pageURL = window.location.href.split("?")[0];
                var pageURLTemp = pageURL.substring(0, pageURL.length - 3);
                var lastComma = pageURLTemp.lastIndexOf("/");
                if (lastComma > - 1) {
                var n = pageURL.substring(lastComma+1);
                    mid = n;
                    //document.location.href = 'http://getmedia.redefine.pl/vods/get_vod/?cpid=1&ua=mipla_ios/122&media_id=' + mid;
                    document.location.href = 'http://getmedia.redefine.pl/vods/get_vod/?cpid=1&ua=www_iplatv_html5/12345&media_id=' + mid;
                }
            }
        }
    }
}
function PokazLinkOnet() {
try{
       	i = document.querySelector(".mvp").getAttribute('id');
		m = i.match(/mvp:(.+)/)[1];
		i = document.body.innerHTML;
		title = i.match(/title: \'(.*)\',/)[1];
		url = "aHR0cHM6Ly9wbGF5ZXItYXBpLmRyZWFtbGFiLnBsLz9ib2R5W2lkXT0rbSsmYm9keVtqc29ucnBjXT0yLjAmYm9keVttZXRob2RdPWdldF9hc3NldF9kZXRhaWwmYm9keVtwYXJhbXNdW0lEX1B1Ymxpa2FjamldPSttKyZib2R5W3BhcmFtc11bU2VydmljZV09dm9kLm9uZXQucGwmY29udGVudC10eXBlPWFwcGxpY2F0aW9uL2pzb25wJngtb25ldC1hcHA9cGxheWVyLmZyb250Lm9uZXRhcGkucGwmY2FsbGJhY2s9";
		url = (atob(url)).replace(/\+m\+/g, m);
		xhr = new   XMLHttpRequest();
		xhr.open('GET', url, false);
		xhr.send(null);
		v = JSON.parse(xhr.responseText);
		vc = v.result[0].formats.wideo["mp4-uhd"];
		if (!vc) {
			alert('Niestety, ale materiał jest zabezpieczony DRM i nie będzie można go pobrać :(');
			return;
		};
		title = v.result[0].meta.title;
		for (var   i = -1, cc = [], dd = [], l = vc.length >>> 0; ++i !== l; null) {
			dd[i] = cc[i] = vc[i].video_bitrate;
		};
		dd.sort(function (a, b) {
			return   b - a;
		});
		//pagecreate(title);
		DocumentWriteFirefoxFix = "";
        var randomText = makeid();
        DocumentWriteFirefoxFix = DocumentWriteFirefoxFix + '<p>Tytuł: ' + title + '</p>';
        var HighestResolution = 0;
        var HighestResolutionLink = '';
        for (var j = 0, len = dd.length; j < len; j = j + 1) {
            dlurl = vc[cc.indexOf(dd[j])].url;
            bitrate = vc[cc.indexOf(dd[j])].video_bitrate;
            vertical_resolution = vc[cc.indexOf(dd[j])].vertical_resolution;
            /*container.appendChild(createNode("pre", {}, {
                textContent: "Bitrate: " + bitrate + " - Rozdzielczość pionowa: " + vertical_resolution
            }));
            w = 'wget --restrict-file-names=windows --progress=bar --header="User-Agent:ABC" -c -O "' + title + '.mp4" ' + dlurl;
            buttoncreate(dlurl, title, w);*/
            if (vertical_resolution > HighestResolution) {
                HighestResolution = vertical_resolution;
                HighestResolutionLink = dlurl;
            }
            DocumentWriteFirefoxFix = DocumentWriteFirefoxFix + '<p>Bitrate: ' + bitrate + ' - Rozdzielczość pionowa: ' + vertical_resolution + '<br>';
            DocumentWriteFirefoxFix = DocumentWriteFirefoxFix + "Link do materiału: <button id=\"button-" + j + "\" type=\"button\">Kopiuj</button><br><a target=\"_blank\" href=\"" + dlurl + "\">" + dlurl + "</a></p>";
            DocumentWriteFirefoxFix = DocumentWriteFirefoxFix + "<script>var but = document.getElementById('button-"+j+"');but.addEventListener('click', function(){copyText(\""+ dlurl +"\");document.getElementById('button-"+j+"').setAttribute(\"class\", \"clicked\");})</script>";
        }
        if (HighestResolution > 0) {
            DocumentWriteFirefoxFix = DocumentWriteFirefoxFix + StyleText + '<script type="application/javascript">function ShowPromptWithInfo(lol){if (window.prompt("Aby skopiować link, wciśnij: CTRL+C, potem: ENTER aby rozpocząć pobieranie, lub ESC aby zakończyć działanie skryptu", lol)){document.location.href=lol;}}setTimeout(function () {ShowPromptWithInfo("' + HighestResolutionLink + '");}, 1000);' + SkryptKopiujText + '</script>';
            addJS_Node(null, null, fireNewTab);
        }
    }
    catch (e){
        if (location.href.match(/^http[s]?:\/\/vod\.pl\//) || location.href.match(/^http[s]?:\/\/bajki\.onet\.pl\//)) {
            var i = document.body.innerHTML;
            m = i.match(/mvp:([\d\.]+)\x22/);
            var url = "http://qi.ckm.onetapi.pl/?body[id]=22D4B3BC014A3C200BCA14CDFF3AC018&body[jsonrpc]=2.0&body[method]=get_asset_detail&body[params][ID_Publikacji]=" + m[1] + "&body[params][Service]=vod.onet.pl&content-type=application/jsonp&x-onet-app=player.front.onetapi.pl&_=1487536996333";
            document.location.href = url;
        } else if (location.href.match(/^http?:\/\/qi\.ckm.\onetapi\.pl\//)) {
            nn = document.querySelector("pre").textContent;
            v = JSON.parse(nn);
            vc = v.result[0].formats.wideo.mp4;
            for (var i = -1, cc = [], dd = [], l = vc.length >>> 0; ++i !== l; null) {
                dd[i] = cc[i] = vc[i].video_bitrate;
            };
            dd.sort(function(a, b) {
                return b - a;
            });
            for (var j = 0, len = dd.length; j < len; j = j + 1) {
                var dlurl = vc[cc.indexOf(dd[j])].url;
                if (dlurl !== undefined) {
                    break;
                    break;
                }
            };
            document.location.href = dlurl;
        }
    }
}

function PokazLinkOnetOld() {
    try{
        i = document.body.innerHTML;
        m = i.match(/mvp:([\d]{7}\.[\d]{1,10})/)[1];
        title = i.match(/title: \'(.*)\',/)[1];
        url = "aHR0cHM6Ly9wbGF5ZXItYXBpLmRyZWFtbGFiLnBsLz9ib2R5W2lkXT0rbSsmYm9keVtqc29ucnBjXT0yLjAmYm9keVttZXRob2RdPWdldF9hc3NldF9kZXRhaWwmYm9keVtwYXJhbXNdW0lEX1B1Ymxpa2FjamldPSttKyZib2R5W3BhcmFtc11bU2VydmljZV09dm9kLm9uZXQucGwmY29udGVudC10eXBlPWFwcGxpY2F0aW9uL2pzb25wJngtb25ldC1hcHA9cGxheWVyLmZyb250Lm9uZXRhcGkucGwmY2FsbGJhY2s9";
        url = (atob(url)).replace(/\+m\+/g, m);
        xhr = new XMLHttpRequest();
        xhr.open('GET', url, false);
        xhr.send(null);
        v = JSON.parse(xhr.responseText);
        vc = v.result[0].formats.wideo.mp4;
        if (!vc) {
            alert('Niestety, ale materiał jest zabezpieczony DRM i nie będzie można go pobrać :(');
            return;
        }
        title = v.result[0].meta.title;
        for (var i = -1, cc = [], dd = [], l = vc.length >>> 0; ++i !== l; null) {
            dd[i] = cc[i] = vc[i].video_bitrate;
        }
        dd.sort(function(a, b) {
            return b - a;
        });
        //pagecreate(title);

        DocumentWriteFirefoxFix = "";
        var randomText = makeid();
        DocumentWriteFirefoxFix = DocumentWriteFirefoxFix + '<p>Tytuł: ' + title + '</p>';
        var HighestResolution = 0;
        var HighestResolutionLink = '';
        for (var j = 0, len = dd.length; j < len; j = j + 1) {
            dlurl = vc[cc.indexOf(dd[j])].url;
            bitrate = vc[cc.indexOf(dd[j])].video_bitrate;
            vertical_resolution = vc[cc.indexOf(dd[j])].vertical_resolution;
            /*container.appendChild(createNode("pre", {}, {
                textContent: "Bitrate: " + bitrate + " - Rozdzielczość pionowa: " + vertical_resolution
            }));
            w = 'wget --restrict-file-names=windows --progress=bar --header="User-Agent:ABC" -c -O "' + title + '.mp4" ' + dlurl;
            buttoncreate(dlurl, title, w);*/
            if (vertical_resolution > HighestResolution) {
                HighestResolution = vertical_resolution;
                HighestResolutionLink = dlurl;
            }
            DocumentWriteFirefoxFix = DocumentWriteFirefoxFix + '<p>Bitrate: ' + bitrate + ' - Rozdzielczość pionowa: ' + vertical_resolution + '<br>';
            DocumentWriteFirefoxFix = DocumentWriteFirefoxFix + "Link do materiału: <button id=\"button-" + j + "\" type=\"button\">Kopiuj</button><br><a target=\"_blank\" href=\"" + dlurl + "\">" + dlurl + "</a></p>";
            DocumentWriteFirefoxFix = DocumentWriteFirefoxFix + "<script>var but = document.getElementById('button-"+j+"');but.addEventListener('click', function(){copyText(\""+ dlurl +"\");document.getElementById('button-"+j+"').setAttribute(\"class\", \"clicked\");})</script>";
        }
        if (HighestResolution > 0) {
            DocumentWriteFirefoxFix = DocumentWriteFirefoxFix + StyleText + '<script type="application/javascript">function ShowPromptWithInfo(lol){if (window.prompt("Aby skopiować link, wciśnij: CTRL+C, potem: ENTER aby rozpocząć pobieranie, lub ESC aby zakończyć działanie skryptu", lol)){document.location.href=lol;}}setTimeout(function () {ShowPromptWithInfo("' + HighestResolutionLink + '");}, 1000);' + SkryptKopiujText + '</script>';
            addJS_Node(null, null, fireNewTab);
        }
    }
    catch (e){
        if (location.href.match(/^http[s]?:\/\/vod\.pl\//) || location.href.match(/^http[s]?:\/\/bajki\.onet\.pl\//)) {
            var i = document.body.innerHTML;
            m = i.match(/mvp:([\d\.]+)\x22/);
            var url = "http://qi.ckm.onetapi.pl/?body[id]=22D4B3BC014A3C200BCA14CDFF3AC018&body[jsonrpc]=2.0&body[method]=get_asset_detail&body[params][ID_Publikacji]=" + m[1] + "&body[params][Service]=vod.onet.pl&content-type=application/jsonp&x-onet-app=player.front.onetapi.pl&_=1487536996333";
            document.location.href = url;
        } else if (location.href.match(/^http?:\/\/qi\.ckm.\onetapi\.pl\//)) {
            nn = document.querySelector("pre").textContent;
            v = JSON.parse(nn);
            vc = v.result[0].formats.wideo.mp4;
            for (var i = -1, cc = [], dd = [], l = vc.length >>> 0; ++i !== l; null) {
                dd[i] = cc[i] = vc[i].video_bitrate;
            };
            dd.sort(function(a, b) {
                return b - a;
            });
            for (var j = 0, len = dd.length; j < len; j = j + 1) {
                var dlurl = vc[cc.indexOf(dd[j])].url;
                if (dlurl !== undefined) {
                    break;
                    break;
                }
            };
            document.location.href = dlurl;
        }
    }
}

function PokazLinkOnetApi(){
    var url = window.location.href;
    xhr = new XMLHttpRequest();
    xhr.open('GET', url, false);
    xhr.send(null);
    v = JSON.parse(xhr.responseText);
		vc = v.result[0].formats.wideo["mp4-uhd"];
		if (!vc) {
			alert('Niestety, ale materiał jest zabezpieczony DRM i nie będzie można go pobrać :(');
			return;
		};
		title = v.result[0].meta.title;
		for (var   i = -1, cc = [], dd = [], l = vc.length >>> 0; ++i !== l; null) {
			dd[i] = cc[i] = vc[i].video_bitrate;
            alert(dd[i]);
		};
		dd.sort(function (a, b) {
			return   b - a;
		});
    DocumentWriteFirefoxFix = "";
    var randomText = makeid();
    DocumentWriteFirefoxFix = DocumentWriteFirefoxFix + '<p>Tytuł: ' + title + '</p>';
    var HighestResolution = 0;
    var HighestResolutionLink = '';
    for (var j = 0, len = dd.length; j < len; j = j + 1) {
        dlurl = vc[cc.indexOf(dd[j])].url;
        bitrate = vc[cc.indexOf(dd[j])].video_bitrate;
        vertical_resolution = vc[cc.indexOf(dd[j])].vertical_resolution;
        /*container.appendChild(createNode("pre", {}, {
                textContent: "Bitrate: " + bitrate + " - Rozdzielczość pionowa: " + vertical_resolution
            }));
            w = 'wget --restrict-file-names=windows --progress=bar --header="User-Agent:ABC" -c -O "' + title + '.mp4" ' + dlurl;
            buttoncreate(dlurl, title, w);*/
        if (vertical_resolution > HighestResolution) {
            HighestResolution = vertical_resolution;
            HighestResolutionLink = dlurl;
        }
        DocumentWriteFirefoxFix = DocumentWriteFirefoxFix + '<p>Bitrate: ' + bitrate + ' - Rozdzielczość pionowa: ' + vertical_resolution + '<br>';
        DocumentWriteFirefoxFix = DocumentWriteFirefoxFix + "Link do materiału: <button id=\"button-" + j + "\" type=\"button\">Kopiuj</button><br><a target=\"_blank\" href=\"" + dlurl + "\">" + dlurl + "</a></p>";
        DocumentWriteFirefoxFix = DocumentWriteFirefoxFix + "<script>var but = document.getElementById('button-"+j+"');but.addEventListener('click', function(){copyText(\""+ dlurl +"\");document.getElementById('button-"+j+"').setAttribute(\"class\", \"clicked\");})</script>";
    }
    if (HighestResolution > 0) {
        DocumentWriteFirefoxFix = DocumentWriteFirefoxFix + StyleText + '<script type="application/javascript">function ShowPromptWithInfo(lol){if (window.prompt("Aby skopiować link, wciśnij: CTRL+C, potem: ENTER aby rozpocząć pobieranie, lub ESC aby zakończyć działanie skryptu", lol)){document.location.href=lol;}}setTimeout(function () {ShowPromptWithInfo("' + HighestResolutionLink + '");}, 1000);' + SkryptKopiujText + '</script>';
        //addJS_Node(null, null, fireNewTab);
        document.body.innerHTML = DocumentWriteFirefoxFix + "<br>" + document.body.innerHTML;
    }
}

function PokazLinkTvp() {
    if (location.href.match(/^http[s]?:\/\/vod\.tvp\.pl\/[\d]{0,8}/)) {
        i = document.body.innerHTML;
        m = i.match(/object_id=([\d]{0,8})/);
        var znalezionotytul = false;
        st = 'Nieznane';
        tt = 'Nieznane';
        i = document.querySelector('.movieWrapper');
        if (i !== null) {
            i = i.querySelector('iframe').contentWindow.document.head.innerHTML;
            if (i !== null) {
                st = i.match(/\{name: \x22SeriesTitle\x22\, value: \x22(.*)\x22\},/) [1];
                tt = i.match(/\{name: \x22Title\x22\, value: \x22(.*)\x22\},/) [1];
                znalezionotytul = true;
            }
        }
        title = st + ' - ' + tt;
        xmlhttp = new XMLHttpRequest();
        xmlhttp.open('GET', 'https://www.tvp.pl/shared/cdn/tokenizer_v2.php?object_id=' + m[1], false);
        xmlhttp.send();
        o = JSON.parse(xmlhttp.responseText);
        v = o.formats;
        vc = [];
        if(v != null){
            for (var i = - 1, vc = [
            ], l = v.length >>> 0; ++i !== l; null) {
                if (v[i].adaptive == false) {
                    vc.push(v[i]);
                };
            };
        }
        if (vc.length == 0) {
            alert('Niestety, ale materiał jest zabezpieczony DRM i nie będzie można go pobrać :(');
            return;
        };
        for (var i = - 1, cc = [
        ], dd = [
        ], l = vc.length >>> 0; ++i !== l; null) {
            dd[i] = cc[i] = vc[i].totalBitrate;
        };
        dd.sort(function (a, b) {
            return b - a;
        });
        DocumentWriteFirefoxFix = '';
        if (znalezionotytul) {
            DocumentWriteFirefoxFix = DocumentWriteFirefoxFix + '<p>Tytuł: ' + title + '</p>';
        }
        for (var j = 0, len = dd.length; j < len; j = j + 1) {
            dlurl = vc[cc.indexOf(dd[j])].url;
            bitrate = vc[cc.indexOf(dd[j])].totalBitrate;
            DocumentWriteFirefoxFix = DocumentWriteFirefoxFix + '<p>Bitrate: ' + bitrate + '<br>';
            DocumentWriteFirefoxFix = DocumentWriteFirefoxFix + "Link do materiału: <button id=\"button-" + j + "\" type=\"button\">Kopiuj</button><br><a target=\"_blank\" href=\"" + dlurl + "\">" + dlurl + "</a></p>";
            DocumentWriteFirefoxFix = DocumentWriteFirefoxFix + "<script>var but = document.getElementById('button-"+j+"');but.addEventListener('click', function(){copyText(\""+ dlurl +"\");document.getElementById('button-"+j+"').setAttribute(\"class\", \"clicked\");})</script>";
        }
        for (var j = 0, len = dd.length; j < len; j = j + 1) {
            dlurlbest = vc[cc.indexOf(dd[j])].url;
            if (dlurlbest !== undefined) {
                break;
            }
        }
        DocumentWriteFirefoxFix = DocumentWriteFirefoxFix + StyleText + '<script type="application/javascript">function ShowPromptWithInfo(lol){if (window.prompt("Aby skopiować link, wciśnij: CTRL+C, potem: ENTER aby rozpocząć pobieranie, lub ESC aby zakończyć działanie skryptu", lol)){document.location.href=lol;}}setTimeout(function () {ShowPromptWithInfo("' + dlurlbest + '");}, 1000);' + SkryptKopiujText + '</script>';
        addJS_Node(null, null, fireNewTab);
    }

}

function PokazLinkCda() {
    if (typeof l === 'undefined') {
        var kolumny_list2 = 'pb-video-player';
        var list_czat = document.getElementsByClassName(kolumny_list2);
        if (list_czat.length > 0) {
            for (i = 0; i < list_czat.length; i++)
            {
                var vviideoo = list_czat[i].src;
                ShowPromptWithInfo(vviideoo);
                break;
            }
        }
    }
    else {
        ShowPromptWithInfo(l);
    }
}

function SkryptDoPobieraniaStart() {
    if (Wlacz_skrypt) {
        var url = window.location.href;
        if (location.href.match(/^http[s]?:\/\/www\.ipla\.tv\//)) {
            var btnIpla = document.createElement('input');
            btnIpla.setAttribute('value', 'Pobierz video');
            btnIpla.setAttribute('type', 'button');
            btnIpla.setAttribute('id', 'btnIpla');
            btnIpla.setAttribute('style', 'position:fixed !important; left: 0px; top: 4px; width: 140px; height: 35px; background-color: #00a6ff; color: white; z-index: 1000000000;');
            document.getElementsByTagName('body') [0].appendChild(btnIpla);
            addEvent(document.getElementById('btnIpla'), 'click', function () {
                PokazLinkIpla();
            });
        }
        else if (url.indexOf('getmedia.redefine.pl') > - 1) {
            PokazLinkPobieranieIpla();
        }
        else if (location.href.match(/^http[s]?:\/\/(?:w{3}\.)?(?:tvn)?player\.pl\//)) {
            var btnTVNNowy = document.createElement('input');
            btnTVNNowy.setAttribute('value', 'Pobierz video');
            btnTVNNowy.setAttribute('type', 'button');
            btnTVNNowy.setAttribute('id', 'btnTVNNowy');
            btnTVNNowy.setAttribute('style', 'position:fixed !important; left: 0px; top: 1px; width: 115px; height: 30px; background-color: #00a6ff; color: white; z-index: 1000000000;');
            document.getElementsByTagName('body') [0].appendChild(btnTVNNowy);
            addEvent(document.getElementById('btnTVNNowy'), 'click', function () {
                PokazLinkTVNNowy();
            });
        }
        else if (location.href.match(/^http[s]?:\/\/vod\.pl\//)) {
            var btnOnet = document.createElement('input');
            btnOnet.setAttribute('value', 'Pobierz video');
            btnOnet.setAttribute('type', 'button');
            btnOnet.setAttribute('id', 'btnOnet');
            btnOnet.setAttribute('style', 'position:fixed !important; left: 0px; top: 2px; width: 110px; height: 25px; background-color: #2fd6ff; z-index: 1000000000;');
            document.getElementsByTagName('body') [0].appendChild(btnOnet);
            addEvent(document.getElementById('btnOnet'), 'click', function () {
                PokazLinkOnet();
            });
        }
        else if (location.href.match(/^http[s]?:\/\/qi\.ckm\.onetapi\.pl\//)) {
            PokazLinkOnetApi();
        }
        else if (location.href.match(/^http[s]?:\/\/vod\.tvp\.pl\/[\d]{0,8}/)) {
            i = document.body.innerHTML;
            m = i.match(/object_id=([\d]{0,8})/);
            if (m !== null) {
                if (url.indexOf('vod.tvp.pl/vod/slider') == - 1) {
                    if (url.indexOf('tvp.pl/sess/tvplayer.php?') == - 1) {
                        var btnTvp = document.createElement('input');
                        btnTvp.setAttribute('value', 'Pobierz video');
                        btnTvp.setAttribute('type', 'button');
                        btnTvp.setAttribute('id', 'btnTvp');
                        btnTvp.setAttribute('style', 'position:fixed !important; left: 0px; top: 10px; width: 100px; height: 35px;  z-index: 1000000000;');
                        document.getElementsByTagName('body') [0].appendChild(btnTvp);
                        addEvent(document.getElementById('btnTvp'), 'click', function () {
                            PokazLinkTvp();
                        });
                    }
                }
            }
        }
        else if (url.indexOf('www.cda.pl') > - 1) {
            var btnCda = document.createElement('input');
            btnCda.setAttribute('value', 'Pobierz video');
            btnCda.setAttribute('type', 'button');
            btnCda.setAttribute('id', 'btnCda');
            btnCda.setAttribute('style', 'position:fixed !important; left: 0px; top: 2px; width: 95px; height: 30px;  z-index: 1000000000;');
            document.getElementsByTagName('body') [0].appendChild(btnCda);
            addEvent(document.getElementById('btnCda'), 'click', function () {
                PokazLinkCda();
            });
        }
    }
}
if(window.jQuery){
    $(document).ready(function() {
        SkryptDoPobieraniaStart();
    });
}
else{
    window.onload = SkryptDoPobieraniaStart();
}
/*document.addEventListener("DOMContentLoaded", function(event) {
        SkryptDoPobieraniaStart();
});*/
