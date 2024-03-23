//const MAX_CACHE_SIZE = 5 * 1024 * 1024;

var hasA11y = false;
var mainMenuPath = "content/main-menu.html";
var previousHref = null;
var flyoutMRVs = [];

var a11yControl = $("#a11y-font-toggle");
var scrollControl = $("#scroll-top");
var backControl = $("#back");
var scrollTopTime = 300;
var closeControl = $("#close-flyout");

var mainText = $(".main-text");
var flyout = $("#flyout");
var flyoutContent = $("#content");
var flyoutTransition = flyout.css("transition");
var flyoutOpenTime = parseFloat(getComputedStyle(flyout[0])["transitionDuration"]) * 1000;

window.addEventListener("resize", function() {
	if (window.matchMedia("(orientation: landscape)").matches) {
		document.documentElement.style.height = window.innerHeight + "px";
	} else {
		document.documentElement.style.height = "auto";
	}
});

$(document).ready(function() {
	$("#contacts").load("content/contacts.html");
	flyoutLoad();

	setupFlyoutObserver();
	handleFlyoutContentLinks();
	handleControlLinks();
	handleScrollControlVisibility();
});

// untested
/*window.onpopstate = function(event) {
	if (flyoutMRVs.length > 0) {
		event.preventDefault();

		(backControl.css("display") !== "none")
			? backControl.click()
			: closeControl.click();
	}
};*/

function handleFlyoutContentLinks() {
	flyoutContent.on("click", "a", function(event) {
		if ($(this).attr("target") === "_blank") return;

		event.preventDefault();

		let href = this.href;
		let timeout = 0;

		if ($(this).parent().hasClass("flyout-open")) {
			timeout = flyoutOpenTime;
			openFlyout();
		}

		setTimeout(function() {
			flyoutLoad(href);
		}, timeout);
	});
}

function handleControlLinks() {
	a11yControl.on("click", function(event) {
		event.preventDefault();

		toggleA11y();
	});

	scrollControl.on("click", function(event) {
		event.preventDefault();

		flyoutContent.animate({ scrollTop: 0 }, scrollTopTime);
	});

	backControl.on("click", function(event) {
		event.preventDefault();

		if (flyoutMRVs.length > 0) {
			let mrv = flyoutMRVs.pop();
			flyoutLoad(mrv, true);
		}

		setBackControlVisibility();
	});

	closeControl.on("click", function(event) {
		event.preventDefault();
		
		closeFlyout();
	});
}

function setupFlyoutObserver() {
	let onMutation = function() {
		if (hasA11y) {
			addA11y();
		}
	};

	new MutationObserver(onMutation)
		.observe(flyout[0], {
			childList: true,
			subtree: true
		});
}

function openFlyout() {
	flyoutContent.html("");
	flyout.addClass("open");
	fadeElementOut(mainText, flyoutOpenTime);

	setTimeout(function() {
		flyout.css("transition", "unset");
	}, flyoutOpenTime);
}

function closeFlyout() {
	flyoutContent.html("");
	flyout.css("transition", flyoutTransition);
	flyout.removeClass("open");
	fadeElementIn(mainText, flyoutOpenTime);

	setTimeout(function() {
		flyoutLoad();
	}, flyoutOpenTime);

	previousHref = null;
	flyoutMRVs = [];
}

function toggleA11y() {
	if (hasA11y) {
		removeA11y();

		a11yControl.text("visibility");
		hasA11y = false;
	}
	else {
		addA11y();

		a11yControl.text("visibility_off");
		hasA11y = true;
	}
}

function addA11y() {
	textElements().addClass("a11y");
}

function removeA11y() {
	textElements().removeClass("a11y");
}

function textElements() {
	return $("body").find("*").not(".material-icons").filter(function() {
		return $(this).contents().filter(function() {
			return this.nodeType === 3 && $.trim(this.nodeValue).length > 0;
		}).length > 0;
	});
}

/*via: https://stackoverflow.com/questions/7616461/generate-a-hash-from-string-in-javascript */
/*function makeHash(string) {
	let hash = 0, i, charCode;
	let length = string.length;

	if (length === 0) return hash;

	for (i = 0; i < length; i++) {
		charCode = string.charCodeAt(i);
		hash = ((hash << 5) - hash) + charCode;
		hash |= 0;
	}

	return hash;
}*/

/*async */ function flyoutLoad(href, isRevisit) {
	if (!href) {
		href = mainMenuPath;
	}

	if (previousHref && !isRevisit) {
		flyoutMRVs.push(previousHref);
	}

	previousHref = href;

	//let response = await fetch(href);
	//let data = await response.text();
	//let hash = makeHash(data);
	//let cache = await caches.open("page-content");
	//let cachedResponse = await cache.match(hash);

	let loadContent = function(x) {
		href.endsWith(".md")
			? loadMarkdown(x)
			: flyoutContent.html(x);
	}

	/*if (cachedResponse) {
		alert("cached");

		let data = await cachedResponse.text();
		loadContent(data);
	} else {
		alert("NOT cached");

		$.get(href, async function(data) {
			loadContent(data);

			let response = new Response(data);
			await cache.put(hash, response);
		});
	}*/

	$.get(href, function(data) {
		loadContent(data);
	});

	setBackControlVisibility();
}

function loadMarkdown(data) {
	const renderer = {
		link(href, title, text) {
			const link = marked.Renderer.prototype.link.call(this, href, title, text);
			return link.replace("<a","<a target='_blank' rel='noreferrer' ");
		}
	};

	marked.use({ renderer });
	let parsed = marked.parse(data);

	flyoutContent.html(parsed);
}

function handleScrollControlVisibility() {
	flyoutContent.scroll(function() {
		(flyoutContent.scrollTop() > 20)
			? scrollControl.css("display", "unset")
			: scrollControl.css("display", "none");
	});
}

function setBackControlVisibility() {
	let lastPage = flyoutMRVs[flyoutMRVs.length - 1];

	(lastPage && lastPage !== mainMenuPath)
		? backControl.css("display", "unset")
		: backControl.css("display", "none");
}

function fadeElementIn(target, duration) {
	target.css("visibility", "visible");
	target.attr("aria-hidden", "false");

	anime({
		targets: target.toArray(),
		opacity: 1,
		duration: duration,
		easing: "easeInOutQuad"
	});
}

function fadeElementOut(target, duration) {
	anime({
		targets: target.toArray(),
		opacity: 0,
		duration: duration,
		easing: "easeInOutQuad",
		complete: function() {
			target.css("visibility", "hidden");
			target.attr("aria-hidden", "true");
		}
	});
}
