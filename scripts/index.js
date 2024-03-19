var hasA11y = false;
var mainMenuPath = "content/main-menu.html";
var previousHref = null;
var flyoutMRVs = [];

var a11yControl = $("#a11y-font-toggle");
var scrollControl = $("#scroll-top");
var backControl = $("#back");
var scrollTopTime = 300;
var closeControl = $("#close-flyout");

var flyout = $("#flyout");
var flyoutContent = $("#content");
var flyoutTransition = flyout.css("transition");
var flyoutOpenTime = parseFloat(getComputedStyle(flyout[0])["transitionDuration"]) * 1000;

$(document).ready(function() {
	$("#contacts").load("content/contacts.html");
	flyoutLoad();

	setupFlyoutObserver();
	handleFlyoutContentLinks();
	handleControlLinks();
	handleScrollControlVisibility();
});

// untested
window.onpopstate = function(event) {
	if (flyoutMRVs.length > 0) {
		event.preventDefault();

		(backControl.css("display") !== "none")
			? backControl.click()
			: closeControl.click();
	}
};

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

	setTimeout(function() {
		flyout.css("transition", "unset");
	}, flyoutOpenTime);
}

function closeFlyout() {
	flyoutContent.html("");
	flyout.css("transition", flyoutTransition);
	flyout.removeClass("open");

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
	flybackEtAl().addClass("a11y");
}

function removeA11y() {
	flybackEtAl().removeClass("a11y");
}

function flybackEtAl() {
	return flyout.find("*").addBack().not(".material-icons");
}

function flyoutLoad(href, isRevisit) {
	if (!href) {
		href = mainMenuPath;
	}

	if (previousHref && !isRevisit) {
		flyoutMRVs.push(previousHref);
	}

	previousHref = href;

	!href.endsWith(".md")
		? flyoutContent.load(href)
		: loadMarkdown(href);

	setBackControlVisibility();
}

function loadMarkdown(href) {
	$.get(href, function(markdown_text) {
		const renderer = {
			link(href, title, text) {
				const link = marked.Renderer.prototype.link.call(this, href, title, text);
				return link.replace("<a","<a target='_blank' rel='noreferrer' ");
			}
		};

		marked.use({ renderer });
		let parsed = marked.parse(markdown_text);

		flyoutContent.html(parsed);
	});
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
