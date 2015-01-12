var generator = {
	last: null,
	timeout: null,
	root: "/"
};

function load() {
	var hash = id();
	$.get(generator.root + "/scheduler/saved/" + hash, function(data) {
		$("#properties :checkbox").prop("checked",false);
		
		var props = {};
		
		$.each(data.theme.q.split("&"), function(index, value) {
			if (!value) { return; }
			var f = value.split("=");
			props[f[0]] = f[1];
			var e = $("#" + f[0]);
			var val = decodeURIComponent(f[1]);
			if (e.is(":checkbox")) {
				e[0].checked = (val == "true" || val == "on");
			}
			else {
				e.val(val);
			}
		});
		
		// fix business hours from older versions
		if (!props.cBizColor) {
			$("#cBizColor").val(props.cBackColor);
		}
		
		update();
	})
	.error(function() {
	});;	
}

function id() {
	return window.location.hash.replace("#", "");
}

function save() {
	var data = $("#form_save").serialize();
	$.post(generator.root + "/scheduler/save", data, function(data) {
		if (data.error) {
			alert(data.error);
			return;
		}
		var id = data.id;
		window.location.hash = "#" + id;
		saved();
		$("#save_dialog input:text").val('');
		$("#save_dialog").hide("fast");
		downloadNow();
	})
	.error(function() {
		alert("Saving failed. Please try again later.");
	});
}

function dirty() {
	generator.dirty = true;
	$("#theme_name").html("");
	$("#status").html("Not saved").show();
}

function saved() {
	var url = generator.root + "/scheduler/theme/" + id();
	generator.dirty = false;
	$("#theme_name").html("<b>" + $("#name").val() + "</b> saved as <a href='" + url +"'>" + url +"</a>.");
	$("#status").hide();
}

function updateDelayed() {
	if (generator.timeout) {
		window.clearTimeout(generator.timeout);
	}
	generator.timeout = window.setTimeout(update, 500);
}

function update() {
	var c = cfg();
	var fade = false;
	if (fade) {
		$("#dps").fadeTo("fast", 0, function() {
			loadcss(generator.root + "/scheduler/css?prefix=test&" + c);
			$("#dps").fadeTo("fast", 1);
		});
	}
	else {
		loadcss(generator.root + "/scheduler/css?prefix=test&" + c);
	}
	$("#q").val(c);
	$("#properties .color").each(function() {
		$(this).next().css('background-color', "#" + this.value);
	});
	dirty();
}

function cfg() {
	return $("#form_properties").serialize().replace(/\+/g,'%20');
}

function loadcss(filename){

	var css = document.createElement("link");
	css.setAttribute("rel", "stylesheet");
	css.setAttribute("type", "text/css");
	css.setAttribute("href", filename);
	document.getElementsByTagName("head")[0].appendChild(css);

	if (generator.last) {
		generator.last.parentNode.removeChild(generator.last);
	}

	generator.last = css;
}

function download() {
	if (generator.dirty) {
		$("#save_dialog").show("fast");
		$("#name").focus();
		$("#name").keyup(function() {
			var name = this.value;
			var prefix = name.toLowerCase().replace(/\s+/g, "_").replace(/[^a-z_0-9]/g, "");
			$("#prefix").val(prefix);
		});
	}
	else {
		downloadNow();
	}
}

function downloadNow() {
	window.location.href = generator.root + "/scheduler/download/" + id();
}

function lighter(ref) {
	var original = $(ref).val();
	var step = 0.02;
	$(ref).val(luminance(original, step));
	update();
}

function darker(ref) {
	var original = $(ref).val();
	var step = -0.02;
	$(ref).val(luminance(original, step));
	update();
}

// http://www.sitepoint.com/javascript-generate-lighter-darker-color/
function luminance(hex, lum) {
	hex = String(hex).replace(/[^0-9a-f]/gi, '');
	if (hex.length < 6) {
		hex = hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];
	}
	lum = lum || 0;
	var rgb = "", c, i;
	for (i = 0; i < 3; i++) {
		c = parseInt(hex.substr(i*2,2), 16);
		c = Math.round(Math.min(Math.max(0, c + (c * lum)), 255)).toString(16);
		rgb += ("00"+c).substr(c.length);
	}
	return rgb;
}

function removeHash() { 
    var scrollV, scrollH, loc = window.location;
    if ("pushState" in history)
        history.pushState("", document.title, loc.pathname + loc.search);
    else {
        scrollV = document.body.scrollTop;
        scrollH = document.body.scrollLeft;

        loc.hash = "";

        document.body.scrollTop = scrollV;
        document.body.scrollLeft = scrollH;
    }
}
