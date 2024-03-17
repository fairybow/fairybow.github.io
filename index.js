var previousContent = localStorage.getItem("previousContent");

function storePreviousContent(href) {
	previousContent = href;
	localStorage.setItem("previousContent", href);
}

function clearContent() {
	$("#content").html("");

	previousContent = null;
	localStorage.removeItem("previousContent");
}

function setupContentTransition() {
	let head = $("#head");
	let headInitialPadding = $("html").css("--layoutHeadInitialPadding");
	let headContentPadding = $("html").css("--layoutHeadContentPadding");
	let contentBottomPadding = $("html").css("--layoutContentBottomPadding");
	let content = $("#content");

	let observer = new MutationObserver(function() {
		if (content.html() === "") {
			head.css("padding-top", headInitialPadding);
			content.css("flex-grow", 0);
			content.css("padding-bottom", 0);

		} else {
			head.css("padding-top", headContentPadding);
			content.css("flex-grow", 1);
			content.css("padding-bottom", contentBottomPadding);
		}
	});

	observer.observe(content[0], { childList: true });
}

function handleControlButton() {
	let button = document.getElementById("navbar-control");
	let scrollDiv = $("#page-container");

	scrollDiv.scroll(function() {
		(scrollDiv.scrollTop() > 20)
			? button.textContent = "arrow_upward"
			: button.textContent = "close";
	});

	button.onclick = function() {
		(button.textContent === "close")
			? clearContent()
			: scrollDiv.animate({ scrollTop: 0 }, 300);
	};
}

function setupControlButton() {
	let content = $("#content");
	let button = document.getElementById("navbar-control");
	let observer = new MutationObserver(function() {
		button.style.display = (content.html() !== "")
			? "flex"
			: "none";
	});

	button.textContent = "close";
	button.style.display = "none";

	observer.observe(content[0], { childList: true });
}

function animateContentAdd(html) {
	// Typed for h1 and anime.js for rest.
	$("#content").html(html.replace(/(^|\n)(.+)/g, "<span class='animejs-line'>$2</span>"));

	anime.timeline({loop: false})
		.add({
			targets: '.animejs-line',
			opacity: [ 0, 1 ],
			duration: 500,
			delay: (el, i) => 25 * i
		});
}

function loadMarkdown(href) {
	if (!href.endsWith(".md")) return;

	$.get(href, function(markdown_text) {
		const renderer = {
			link(href, title, text) {
				const link = marked.Renderer.prototype.link.call(this, href, title, text);
				return link.replace("<a","<a target='_blank' rel='noreferrer' ");
			}
		};

		marked.use({ renderer });
		let parsed = marked.parse(markdown_text);

		animateContentAdd(parsed);
	});
}

function handleNavbarMenuLinks(popup) {
	$(popup).on("click", "a", function(event) {
		let href = this.href;
		event.preventDefault();
		
		if (href === previousContent) return;

		storePreviousContent(href);
		loadMarkdown(href);

		document.getElementById("page-container").scrollTop = 0;
	});
}

function handleNavItems() {
	$(document).on("click", ".navbar-item", function(event) {
		let href = this.href;
		event.preventDefault();

		if ($(this).hasClass("navbar-menu-link")) {
			let popup = document.createElement("div");
			popup.id = "navbar-menu";

			document.body.appendChild(popup);
			$(popup).load(href, handleNavbarMenuLinks(popup));

			document.addEventListener("click", function removePopup(event) {
				if (popup.contains(event.target) && event.target.tagName !== "A") return;

				document.body.removeChild(popup);
				document.removeEventListener("click", removePopup);
			});
		};
	});
}

function handleHeadClicks() {
	$("#head").click(function() {
		clearContent();
	}).hover(function() {
		$(this).css("cursor", "pointer");
	}, function() {
		$(this).css("cursor", "auto");
	});
}

$(document).ready(function() {
	$("#contacts").load("html/contacts.html");

	handleHeadClicks();
	handleNavItems();
	setupControlButton();
	handleControlButton();
	setupContentTransition();

	if (previousContent) {
		loadMarkdown(previousContent);
	}
});
