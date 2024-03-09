function openHref(href) {
	if (href.endsWith('.md')) {
		loadMarkdown(href);
	} else {
		$("#pagearea").load(href);
	}
}

function loadPreviousHref() {
	let previous_page = localStorage.getItem('page');

	if (previous_page !== null) {
		openHref(previous_page);
	}
}

function saveHref(href) {
	localStorage.setItem('page', href);
}

function loadNavbar() {
	$("#navbar").load("menus/navbar.html");
}

function loadContactBar() {
	$("#contactbar").load("menus/contacts.html");
}

function loadMarkdown(href) {
	$.get(href, function(markdown_text) {
		const renderer = new marked.Renderer();
		const original_renderer = renderer.text;
		renderer.text = function(text) {
			return original_renderer.call(this, text.replace(':arrow_up:', '⬆️'));
		};

		marked.setOptions({ renderer });

		let parsed = marked.parse(markdown_text);

		$("#pagearea").html(parsed);
	});
}

function handleTitleClicks() {
	$("#title").click(function() {
		saveHref(null);

		$("#pagearea").html("");
	}).hover(function() {
		$(this).css('cursor', 'pointer');
	}, function() {
		$(this).css('cursor', 'auto');
	});
}

function handleLinkClicks() {
	$(document).on("click", "a", function(event) {
		let href = this.href;

		if (href.match(/#.*$/)) {
			return;
		}

		if (!href.startsWith(window.location.origin)) {
			window.open(href, '_blank');

			return false;
		}

		event.preventDefault();
		
		saveHref(href);
		openHref(href);
	});
}

function onDocumentReady() {
	loadNavbar();
	loadContactBar();

	handleTitleClicks();
	handleLinkClicks();

	loadPreviousHref();
}

$(document).ready(onDocumentReady);
