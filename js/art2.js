/* Harrison's World: original drawings for shapes, numbers, letters, weather and art. */
(function () {
  "use strict";
  var A = window.HW.art, n = 0;
  function id(p) { n += 1; return p + "x" + n; }
  function svg(vb, body, defs) {
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="' + vb + '">' + (defs ? "<defs>" + defs + "</defs>" : "") + body + "</svg>";
  }
  var INK = "#2b3157";

  /* the little comet that circles the Earth on the start and home screens */
  A.comet = function () {
    var t = id("t"), h = id("h");
    return svg("0 0 120 48",
      '<path d="M100 13Q54 16 3 33Q52 30 100 35z" fill="url(#' + t + ')"/>' +
      '<circle cx="100" cy="24" r="18" fill="url(#' + h + ')"/>' +
      '<circle cx="100" cy="24" r="10" fill="#fff7dd"/><circle cx="97" cy="21" r="4" fill="#fff" opacity=".9"/>',
      '<linearGradient id="' + t + '" x1="1" x2="0" y1="0" y2="0"><stop offset="0" stop-color="#ffe2a8" stop-opacity=".95"/><stop offset=".45" stop-color="#ffc46b" stop-opacity=".55"/><stop offset="1" stop-color="#ffb35a" stop-opacity="0"/></linearGradient>' +
      '<radialGradient id="' + h + '"><stop offset=".45" stop-color="#ffd27a" stop-opacity=".9"/><stop offset="1" stop-color="#ffb35a" stop-opacity="0"/></radialGradient>');
  };

  /* ---------- letter pictures that have no emoji ---------- */
  A.igloo = function () {
    return svg("0 0 200 150",
      '<ellipse cx="100" cy="134" rx="94" ry="12" fill="#e3eef7"/>' +
      '<path d="M20 132a80 80 0 0 1 160 0z" fill="#f4f9fd" stroke="#a9c7de" stroke-width="5" stroke-linejoin="round"/>' +
      '<g fill="none" stroke="#bcd5e8" stroke-width="4" stroke-linecap="round">' +
      '<path d="M30 104h140M44 78h112M66 58h68"/><path d="M60 104v28M140 104v28M100 78v26M76 78v26M124 78v26M90 58v20M112 58v20"/></g>' +
      '<path d="M76 132v-20a24 24 0 0 1 48 0v20z" fill="#6f9cc0"/><path d="M84 132v-18a16 16 0 0 1 32 0v18z" fill="#4f7ea5"/>');
  };
  A.queen = function () {
    return svg("0 0 200 200",
      '<path d="M30 200c4-40 34-62 70-62s66 22 70 62z" fill="#8e5cc7"/><path d="M62 150c10 10 24 14 38 14s28-4 38-14l6 10c-12 12-28 18-44 18s-32-6-44-18z" fill="#fbf3e2"/>' +
      '<path d="M44 104c-6-44 18-70 56-70s62 26 56 70c-4 20-14 34-24 40H68c-10-6-20-20-24-40z" fill="#8a5a3b"/>' +
      '<ellipse cx="100" cy="100" rx="40" ry="44" fill="#f4cfae"/>' +
      '<circle cx="85" cy="96" r="5" fill="' + INK + '"/><circle cx="115" cy="96" r="5" fill="' + INK + '"/>' +
      '<ellipse cx="76" cy="112" rx="8" ry="5" fill="#f3a3a8" opacity=".6"/><ellipse cx="124" cy="112" rx="8" ry="5" fill="#f3a3a8" opacity=".6"/>' +
      '<path d="M88 118c7 7 17 7 24 0" stroke="' + INK + '" stroke-width="4.5" stroke-linecap="round" fill="none"/>' +
      '<path d="M62 62 66 26l18 18 16-24 16 24 18-18 4 36z" fill="#f2c53d" stroke="#d9a72a" stroke-width="3" stroke-linejoin="round"/>' +
      '<circle cx="100" cy="48" r="6" fill="#e2574c"/><circle cx="78" cy="54" r="4.5" fill="#3f7fdc"/><circle cx="122" cy="54" r="4.5" fill="#4caf62"/>');
  };
  A.wellies = function () {
    function boot(x) {
      return '<path d="M' + x + ' 8h40v74c0 6 4 10 10 12l20 6c8 2 12 8 12 14v6H' + (x - 4) + 'c-4 0-6-2-6-6z" fill="#f2c53d" stroke="#d29d1f" stroke-width="4" stroke-linejoin="round"/>' +
        '<rect x="' + (x - 6) + '" y="112" width="' + 92 + '" height="10" rx="5" fill="#3c4256"/>' +
        '<rect x="' + (x + 6) + '" y="16" width="8" height="54" rx="4" fill="#fff" opacity=".45"/>';
    }
    return svg("0 0 200 126", boot(14) + boot(104));
  };

  /* ---------- shapes for the shape games ---------- */
  A.heartPath = "M60 106C22 80 6 56 18 34 28 16 50 16 60 34 70 16 92 16 102 34 114 56 98 80 60 106z";
  A.shape2 = function (name, fill, stroke, dash) {
    var st = stroke ? ' stroke="' + stroke + '" stroke-width="7"' + (dash ? ' stroke-dasharray="14 10"' : "") + ' stroke-linejoin="round"' : "";
    var f = fill || "none";
    if (name === "heart") return svg("0 0 120 120", '<path d="' + A.heartPath + '" fill="' + f + '"' + st + "/>");
    if (name === "rectangle") return svg("0 0 120 120", '<rect x="8" y="30" width="104" height="60" rx="8" fill="' + f + '"' + st + "/>");
    return A.shape(name, fill, stroke, dash);
  };

  /* a toy block with its number on the front */
  A.block = function (colour, num) {
    return svg("0 0 100 100",
      '<rect x="4" y="4" width="92" height="92" rx="14" fill="' + colour + '"/>' +
      '<rect x="4" y="4" width="92" height="92" rx="14" fill="none" stroke="#000" stroke-opacity=".15" stroke-width="4"/>' +
      '<rect x="14" y="14" width="72" height="72" rx="10" fill="#fff" opacity=".22"/>' +
      (num ? '<text x="50" y="69" text-anchor="middle" font-family="Fredoka, Trebuchet MS, sans-serif" font-weight="700" font-size="54" fill="#fff">' + num + "</text>" : "") +
      '<path d="M16 22c6-6 14-8 22-8" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity=".55" fill="none"/>');
  };

  /* big friendly number or letter on a round tile */
  A.glyph = function (text, fill, size) {
    return svg("0 0 200 200",
      '<text x="100" y="' + (size && size > 120 ? 150 : 138) + '" text-anchor="middle" font-family="Fredoka, Trebuchet MS, sans-serif" font-weight="700" font-size="' + (size || 120) + '" fill="' + (fill || "#fff") + '">' + text + "</text>");
  };
  A.wordIcon = function (text, fill) {
    return svg("0 0 200 120",
      '<text x="100" y="86" text-anchor="middle" font-family="Fredoka, Trebuchet MS, sans-serif" font-weight="700" font-size="76" fill="' + (fill || "#fff") + '">' + text + "</text>");
  };

  /* ---------- weather ---------- */
  A.sunRays = function () {
    var g = id("g"), rays = "";
    for (var i = 0; i < 12; i++) rays += '<rect x="96" y="6" width="8" height="30" rx="4" fill="#ffc84a" transform="rotate(' + i * 30 + ' 100 100)"/>';
    return svg("0 0 200 200", '<g class="sun-rays">' + rays + '</g><circle cx="100" cy="100" r="54" fill="url(#' + g + ')"/>' +
      '<circle cx="82" cy="94" r="5" fill="#a8641c"/><circle cx="118" cy="94" r="5" fill="#a8641c"/><path d="M84 114c9 9 23 9 32 0" stroke="#a8641c" stroke-width="5" stroke-linecap="round" fill="none"/>',
      '<radialGradient id="' + g + '" cx="40%" cy="36%" r="70%"><stop offset="0" stop-color="#fff2b0"/><stop offset=".6" stop-color="#ffd34f"/><stop offset="1" stop-color="#f6a93a"/></radialGradient>');
  };
  A.greyCloud = function () {
    return svg("0 0 260 160",
      '<g fill="#a9b2c8"><circle cx="70" cy="104" r="44"/><circle cx="130" cy="80" r="58"/><circle cx="192" cy="104" r="44"/><rect x="60" y="100" width="140" height="48" rx="24"/></g>' +
      '<g fill="#c9d0e0"><circle cx="70" cy="96" r="42"/><circle cx="130" cy="72" r="56"/><circle cx="192" cy="96" r="42"/><rect x="62" y="92" width="136" height="46" rx="23"/></g>');
  };
  A.snowflake = function () {
    var arms = "";
    for (var i = 0; i < 6; i++) arms += '<g transform="rotate(' + i * 60 + ' 50 50)"><path d="M50 50V10M50 22l-9-8M50 22l9-8M50 34l-7-6M50 34l7-6" stroke="#fff" stroke-width="5" stroke-linecap="round" fill="none"/></g>';
    return svg("0 0 100 100", arms);
  };
  A.rainbow = function () {
    var cols = ["#e2574c", "#f08a35", "#f2c53d", "#4caf62", "#3f7fdc", "#8e5cc7"], arcs = "";
    cols.forEach(function (c, i) { var r = 150 - i * 16; arcs += '<path d="M' + (160 - r) + ' 170a' + r + ' ' + r + ' 0 0 1 ' + r * 2 + ' 0" fill="none" stroke="' + c + '" stroke-width="16"/>'; });
    return svg("0 0 320 176", arcs);
  };
  A.windLines = function () {
    return svg("0 0 240 120",
      '<g fill="none" stroke="#fff" stroke-width="7" stroke-linecap="round" opacity=".9">' +
      '<path d="M10 40h130c18 0 26-26 8-30-10-2-16 6-14 12"/><path d="M30 70h170c20 0 28 28 8 32-12 2-18-8-14-14"/><path d="M60 98h80"/></g>');
  };
  A.hillTree = function () {
    return svg("0 0 400 160",
      '<path d="M0 120C80 80 170 78 240 100s120 10 160-6v66H0z" fill="#7fbf6f"/><path d="M0 140c90-26 180-26 260-8s100 4 140-4v32H0z" fill="#6aad5c"/>');
  };
  A.tree = function () {
    return svg("0 0 120 180",
      '<rect x="50" y="100" width="20" height="74" rx="6" fill="#8a5a3b"/>' +
      '<circle cx="60" cy="70" r="46" fill="#4caf62"/><circle cx="34" cy="88" r="28" fill="#43a058"/><circle cx="86" cy="88" r="28" fill="#43a058"/><circle cx="48" cy="54" r="12" fill="#6cc27a" opacity=".7"/>');
  };
  A.weatherIcon = function (kind) {
    if (kind === "sunny") return A.sunRays();
    if (kind === "rain") return svg("0 0 200 200", '<g transform="translate(10 10) scale(.69)">' + inner(A.greyCloud()) + '</g><g fill="#5aa0e6"><path d="M60 140c0 10 14 10 14 0 0-6-7-14-7-20 0 6-7 14-7 20zM100 156c0 10 14 10 14 0 0-6-7-14-7-20 0 6-7 14-7 20zM140 140c0 10 14 10 14 0 0-6-7-14-7-20 0 6-7 14-7 20z"/></g>');
    if (kind === "snow") return svg("0 0 200 200", '<g transform="translate(20 20) scale(1.6)" >' + inner(A.snowflake()).replace(/#fff/g, "#7fb4e6") + "</g>");
    if (kind === "windy") return svg("0 0 200 200", '<g transform="translate(-10 30) scale(.9)">' + inner(A.windLines()).replace(/#fff/g, "#7f8db8") + "</g>");
    return svg("0 0 200 200", '<g transform="translate(-10 40) scale(.68)">' + inner(A.rainbow()) + "</g>");
  };
  function inner(s) { return s.replace(/^<svg[^>]*>/, "").replace(/<\/svg>$/, ""); }
  A.inner = inner;
  A.puddle = function () {
    return svg("0 0 220 70", '<ellipse cx="110" cy="38" rx="104" ry="28" fill="#5a9fd6"/><ellipse cx="110" cy="34" rx="92" ry="21" fill="#7cb9e8"/><ellipse cx="80" cy="28" rx="26" ry="6" fill="#fff" opacity=".45"/>');
  };

  /* ---------- colouring pictures: big areas, thick lines ---------- */
  /* each area has class "cz"; small details are drawn on top and never block a tap */
  function z(tag, attrs) { return "<" + tag + ' class="cz" fill="#fff" stroke="' + INK + '" stroke-width="5" stroke-linejoin="round" ' + attrs + "/>"; }
  function deco(body) { return '<g class="deco" pointer-events="none">' + body + "</g>"; }
  A.COLOURING = {
    car: function () {
      return svg("0 0 270 160",
        z("path", 'd="M20 98c0-14 8-22 22-24l30-3c12-24 30-34 56-34h34c22 0 38 12 50 32l26 5c14 3 22 12 22 25v8c0 6-4 10-10 10H30c-6 0-10-4-10-10z"') +
        z("path", 'd="M86 70c10-16 22-23 40-23h14v23z"') + z("path", 'd="M150 47h12c14 0 26 7 34 23h-46z"') +
        z("circle", 'cx="76" cy="118" r="24"') + z("circle", 'cx="204" cy="118" r="24"') +
        deco('<circle cx="76" cy="118" r="9" fill="' + INK + '"/><circle cx="204" cy="118" r="9" fill="' + INK + '"/>'));
    },
    rocket: function () {
      return svg("0 0 200 270",
        z("path", 'd="M100 8c26 20 40 52 40 70H60c0-18 14-50 40-70z"') +
        z("path", 'd="M60 78h80v110c0 8-6 14-14 14H74c-8 0-14-6-14-14z"') +
        z("circle", 'cx="100" cy="128" r="24"') +
        z("path", 'd="M60 150 22 196v20l38-14z"') + z("path", 'd="M140 150l38 46v20l-38-14z"') +
        z("path", 'd="M78 204h44c0 22-10 40-22 56-12-16-22-34-22-56z"'));
    },
    fish: function () {
      return svg("0 0 270 180",
        z("path", 'd="M196 90 256 40v100z"') +
        z("path", 'd="M80 44c20-26 70-30 92 0z"') +
        z("ellipse", 'cx="120" cy="92" rx="90" ry="58"') +
        z("path", 'd="M104 36c-16 34-16 78 0 112 14-4 26-4 38 0 14-34 14-78 0-112-12 4-26 4-38 0z"') +
        deco('<circle cx="62" cy="80" r="11" fill="#fff" stroke="' + INK + '" stroke-width="4"/><circle cx="64" cy="81" r="5.5" fill="' + INK + '"/><path d="M40 108c8 8 16 8 22 4" stroke="' + INK + '" stroke-width="4.5" stroke-linecap="round" fill="none"/>'));
    },
    apple: function () {
      return svg("0 0 210 220",
        z("path", 'd="M104 64c-22-16-62-14-80 18-20 36-6 92 24 118 18 16 38 16 56 6 18 10 38 10 56-6 30-26 44-82 24-118-18-32-58-34-80-18z"') +
        z("path", 'd="M110 56c4-30 28-46 60-42-4 32-28 46-60 42z"') +
        deco('<path d="M104 64c0-16-4-30-14-42" stroke="#6b4a2b" stroke-width="9" stroke-linecap="round" fill="none"/><path d="M48 98c-6 14-6 30 0 44" stroke="#fff" stroke-width="8" stroke-linecap="round" opacity=".6" fill="none"/>'));
    },
    house: function () {
      return svg("0 0 260 250",
        z("rect", 'x="168" y="30" width="30" height="64"') +
        z("path", 'd="M18 112 130 18l112 94z"') +
        z("rect", 'x="40" y="112" width="180" height="124"') +
        z("rect", 'x="108" y="160" width="46" height="76" rx="6"') +
        z("rect", 'x="58" y="134" width="38" height="38" rx="4"') + z("rect", 'x="166" y="134" width="38" height="38" rx="4"') +
        deco('<circle cx="144" cy="200" r="4" fill="' + INK + '"/>'));
    },
    butterfly: function () {
      return svg("0 0 270 210",
        z("path", 'd="M130 100C110 40 70 10 36 20 10 30 14 80 40 98c22 14 60 12 90 2z"') +
        z("path", 'd="M140 100c20-60 60-90 94-80 26 10 22 60-4 78-22 14-60 12-90 2z"') +
        z("path", 'd="M128 108c-30 0-70 8-80 36-10 30 20 52 46 40 22-10 34-44 34-76z"') +
        z("path", 'd="M142 108c30 0 70 8 80 36 10 30-20 52-46 40-22-10-34-44-34-76z"') +
        z("ellipse", 'cx="135" cy="112" rx="12" ry="62"') +
        deco('<path d="M128 54c-8-18-18-28-30-32M142 54c8-18 18-28 30-32" stroke="' + INK + '" stroke-width="5" stroke-linecap="round" fill="none"/><circle cx="97" cy="21" r="6" fill="' + INK + '"/><circle cx="173" cy="21" r="6" fill="' + INK + '"/>'));
    }
  };
  A.COLOURING_ORDER = ["car", "fish", "rocket", "apple", "house", "butterfly"];

  /* ---------- small icons ---------- */
  A.clearIcon = function () {
    return svg("0 0 48 48", '<path d="M10 40h28" stroke="#fbf3e2" stroke-width="4" stroke-linecap="round"/><path d="M14 30 30 8l8 6-16 22z" fill="#fbf3e2"/><path d="M14 30l-4 8 10-2z" fill="#e9b949"/>');
  };
})();
