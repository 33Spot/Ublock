// ==UserScript==
// @name          Remove Tumblr ads
// @namespace     http://userstyles.org
// @description	  <b>This user style is no longer being updated and may or may not work.</b>
// @author        cicerakes
// @homepage      https://userstyles.org/styles/112777
// @include       http://www.tumblr.com/dashboard*
// @include       https://www.tumblr.com/dashboard*
// @include       http://www.tumblr.com/reblog*
// @include       https://www.tumblr.com/reblog*
// @include       http://www.tumblr.com/search*
// @include       https://www.tumblr.com/search*
// @include       http://www.tumblr.com/explore*
// @include       https://www.tumblr.com/explore*
// @run-at        document-start
// @version       0.20170727103049
// ==/UserScript==
(function() {var css = [
	".stretchy_kids {",
	"	display: none !important;",
	"}",
	"",
	".notification.single_notification.alt.takeover-container.mb_tracked {",
	"    display:none !important;",
	"}",
	"",
	".yamplus-unit-container {",
	"	display: none !important;",
	"}",
	"",
	".sponsored_post {",
	"	display: none !important;",
	"}",
	"",
	".remnant-unit-container {",
	"	display: none !important;",
	"}",
	"",
	".remnant_ad {",
	"	display: none !important;",
	"}",
	"",
	".takeover-container .sponsored-day-media-section {",
	"	display: none !important;",
	"}",
	"",
	".image-ad {",
	"	display: none !important;",
	"}",
	"",
	".display-ad--yahoo.search-text-ad.pt.post_brick {",
	"	display: none !important;",
	"}",
	"",
	"#posts.posts>li.notification.single_notification.alt.takeover-container.big-margin {",
	"	margin: 0px;",
	"}",
	"",
	".sidebar-ad-container {",
	"	display: none;",
	"}",
	"",
	".dfp-ad-container {",
	"	display: none;",
	"}",
	"",
	"/* Video Ads Hidden */",
	"",
	".video-ad span, .video-ad .content, .video-ad .header, .video-ad .post_footer.clearfix, .video-ad article {",
	"	display: none !important;",
	"}",
	"",
	".video-ad div, .video-ad {",
	"	width: 1px !important;",
	"	height: 0px !important;",
	"}"
].join("\n");
if (typeof GM_addStyle != "undefined") {
	GM_addStyle(css);
} else if (typeof PRO_addStyle != "undefined") {
	PRO_addStyle(css);
} else if (typeof addStyle != "undefined") {
	addStyle(css);
} else {
	var node = document.createElement("style");
	node.type = "text/css";
	node.appendChild(document.createTextNode(css));
	var heads = document.getElementsByTagName("head");
	if (heads.length > 0) {
		heads[0].appendChild(node);
	} else {
		// no head yet, stick it whereever
		document.documentElement.appendChild(node);
	}
}
})();
