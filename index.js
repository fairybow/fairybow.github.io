var previousContent;

function clearContent() {
	$("#content").html("");
	previousContent = null;
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
	let button = document.getElementById("navbar-control");
	let observer = new MutationObserver(function() {
		button.style.display = ($("#content").html() !== "")
			? "flex"
			: "none";
	});

	button.textContent = "close";
	button.style.display = "none";

	observer.observe(document.getElementById("content"), { childList: true });
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
		$("#content").html(parsed);

		previousContent = href;
	});
}

function handleNavbarMenuLinks(popup) {
	$(popup).on("click", "a", function(event) {
		let href = this.href;
		event.preventDefault();
		
		if (href === previousContent) return;

		previousContent = href;
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

	handleHeadClicks();
	handleNavItems();
	setupControlButton();
	handleControlButton();

});
