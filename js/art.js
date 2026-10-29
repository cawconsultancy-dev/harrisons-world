/* Harrison's World: original drawings (planets, the car, the alien and props).
   Fruit, veg and a few vehicles use Twemoji artwork files (CC-BY 4.0). */
(function () {
  "use strict";
  var HW = window.HW;
  var A = (HW.art = {});
  var uid = 0;
  function id(p) { uid += 1; return p + uid; }
  function svg(vb, body, defs) {
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="' + vb + '">' + (defs ? "<defs>" + defs + "</defs>" : "") + body + "</svg>";
  }
  function grad(gid, c1, c2, c3) {
    return '<radialGradient id="' + gid + '" cx="38%" cy="34%" r="72%"><stop offset="0" stop-color="' + c1 + '"/>' +
      (c3 ? '<stop offset=".6" stop-color="' + c2 + '"/><stop offset="1" stop-color="' + c3 + '"/>' : '<stop offset="1" stop-color="' + c2 + '"/>') + "</radialGradient>";
  }
  function shadeDef(gid) {
    return '<radialGradient id="' + gid + '" cx="36%" cy="30%" r="78%"><stop offset="0" stop-color="#fff" stop-opacity=".32"/><stop offset=".42" stop-color="#fff" stop-opacity="0"/><stop offset=".8" stop-color="#000" stop-opacity=".18"/><stop offset="1" stop-color="#000" stop-opacity=".42"/></radialGradient>';
  }

  /* ---------- planets of our solar system ---------- */
  A.planet = function (name) {
    var g = id("g"), s = id("s"), c = id("c"), r = 78, defs, body;
    var clip = '<clipPath id="' + c + '"><circle cx="100" cy="100" r="' + r + '"/></clipPath>';
    var shade = '<circle cx="100" cy="100" r="' + r + '" fill="url(#' + s + ')"/>';
    switch (name) {
      case "sun":
        var h = id("h");
        defs = '<radialGradient id="' + h + '"><stop offset=".6" stop-color="#ffd36b" stop-opacity=".5"/><stop offset="1" stop-color="#ffd36b" stop-opacity="0"/></radialGradient>' + grad(g, "#fff4b8", "#ffc84a", "#f39a2b");
        body = '<circle cx="100" cy="100" r="99" fill="url(#' + h + ')"/><circle cx="100" cy="100" r="70" fill="url(#' + g + ')"/>' +
          '<circle cx="78" cy="80" r="9" fill="#fff6c8" opacity=".35"/><circle cx="120" cy="118" r="12" fill="#f7a93a" opacity=".35"/>';
        return svg("0 0 200 200", body, defs);
      case "mercury":
        defs = grad(g, "#cdb7a2", "#9a8069", "#6b5645") + shadeDef(s) + clip;
        body = '<circle cx="100" cy="100" r="' + r + '" fill="url(#' + g + ')"/><g clip-path="url(#' + c + ')" fill="#5a4636" opacity=".35">' +
          '<circle cx="72" cy="78" r="12"/><circle cx="128" cy="70" r="7"/><circle cx="118" cy="128" r="15"/><circle cx="70" cy="132" r="8"/><circle cx="150" cy="104" r="6"/><circle cx="96" cy="104" r="5"/></g>' + shade;
        return svg("0 0 200 200", body, defs);
      case "venus":
        defs = grad(g, "#fbecc4", "#e6c17d", "#c79a52") + shadeDef(s) + clip;
        body = '<circle cx="100" cy="100" r="' + r + '" fill="url(#' + g + ')"/><g clip-path="url(#' + c + ')" fill="none" stroke="#fff6dc" stroke-width="9" stroke-linecap="round" opacity=".45">' +
          '<path d="M24 80c30-14 60 10 90-4s50-10 70 0"/><path d="M20 118c34-10 54 12 88 2s52-16 76-4"/><path d="M40 150c26-6 40 6 66 2"/></g>' + shade;
        return svg("0 0 200 200", body, defs);
      case "earth":
        defs = grad(g, "#7cc3f5", "#3f85d1", "#2a5ea8") + shadeDef(s) + clip;
        body = '<circle cx="100" cy="100" r="' + r + '" fill="url(#' + g + ')"/><g clip-path="url(#' + c + ')">' +
          '<path d="M52 56c14-10 34-8 40 4s-6 18 2 28-4 22-18 20-16-14-26-16-16-12-12-22 6-10 14-14z" fill="#6cc070"/>' +
          '<path d="M118 92c10-8 30-6 38 6s4 30-6 38-22 20-34 12 2-18-4-28-4-20 6-28z" fill="#66b86a"/>' +
          '<path d="M96 150c10-4 24-2 30 4s-4 12-16 12-22-10-14-16z" fill="#7bc77b"/>' +
          '<path d="M60 34c20-8 54-8 76 2" stroke="#fff" stroke-width="10" stroke-linecap="round" opacity=".7" fill="none"/>' +
          '<path d="M30 108c16-6 30-4 40 2M130 64c14-4 26-2 36 4M84 128c18-4 34-2 46 4" stroke="#fff" stroke-width="7" stroke-linecap="round" opacity=".55" fill="none"/></g>' + shade;
        return svg("0 0 200 200", body, defs);
      case "moon":
        defs = grad(g, "#f6f6f8", "#cfd1d8", "#a6a9b2") + shadeDef(s) + clip;
        body = '<circle cx="100" cy="100" r="' + r + '" fill="url(#' + g + ')"/><g clip-path="url(#' + c + ')" fill="#9a9da7" opacity=".4">' +
          '<circle cx="74" cy="76" r="14"/><circle cx="130" cy="84" r="9"/><circle cx="112" cy="132" r="16"/><circle cx="66" cy="126" r="7"/><circle cx="148" cy="122" r="6"/></g>' + shade;
        return svg("0 0 200 200", body, defs);
      case "mars":
        defs = grad(g, "#f4a072", "#d2683b", "#a4472a") + shadeDef(s) + clip;
        body = '<circle cx="100" cy="100" r="' + r + '" fill="url(#' + g + ')"/><g clip-path="url(#' + c + ')">' +
          '<path d="M40 92c20-10 34 4 54-2s30-14 48-4 22 12 30 6v20c-22 8-40-4-60 4s-36 10-56 0-18-8-24-6z" fill="#a9462b" opacity=".35"/>' +
          '<circle cx="132" cy="136" r="12" fill="#a9462b" opacity=".3"/><ellipse cx="100" cy="26" rx="34" ry="10" fill="#fff" opacity=".85"/></g>' + shade;
        return svg("0 0 200 200", body, defs);
      case "jupiter":
        defs = shadeDef(s) + clip;
        body = '<g clip-path="url(#' + c + ')"><rect x="0" y="0" width="200" height="200" fill="#f1dfc4"/>' +
          '<rect x="0" y="42" width="200" height="16" fill="#d7a676"/><rect x="0" y="66" width="200" height="10" fill="#e9c9a2"/>' +
          '<rect x="0" y="84" width="200" height="20" fill="#c98c5c"/><rect x="0" y="112" width="200" height="12" fill="#e6c39a"/>' +
          '<rect x="0" y="132" width="200" height="18" fill="#cf9767"/><rect x="0" y="158" width="200" height="10" fill="#dcb084"/>' +
          '<ellipse cx="128" cy="128" rx="20" ry="11" fill="#c6553a"/><ellipse cx="128" cy="128" rx="11" ry="5" fill="#de7a56"/></g>' + shade;
        return svg("0 0 200 200", body, defs);
      case "saturn":
        var rg = id("r"), cf = id("cf");
        defs = grad(g, "#f8e9bd", "#e6c97f", "#c9a55a") + shadeDef(s) +
          '<clipPath id="' + c + '"><circle cx="100" cy="100" r="54"/></clipPath>' +
          '<clipPath id="' + cf + '"><rect x="0" y="100" width="200" height="100"/></clipPath>' +
          '<linearGradient id="' + rg + '" x1="0" x2="1"><stop offset="0" stop-color="#cdb27a"/><stop offset=".5" stop-color="#f1e0b0"/><stop offset="1" stop-color="#c3a56b"/></linearGradient>';
        var ring = '<g transform="rotate(-14 100 100)"><ellipse cx="100" cy="100" rx="94" ry="26" fill="none" stroke="url(#' + rg + ')" stroke-width="13"/>' +
          '<ellipse cx="100" cy="100" rx="74" ry="18" fill="none" stroke="#e2c78c" stroke-width="7" opacity=".85"/></g>';
        body = ring + '<circle cx="100" cy="100" r="54" fill="url(#' + g + ')"/><g clip-path="url(#' + c + ')" opacity=".5">' +
          '<rect x="40" y="76" width="120" height="8" fill="#d2ad63"/><rect x="40" y="96" width="120" height="6" fill="#fff1c8"/><rect x="40" y="114" width="120" height="9" fill="#cfa45c"/></g>' +
          '<circle cx="100" cy="100" r="54" fill="url(#' + s + ')"/><g clip-path="url(#' + cf + ')">' + ring + "</g>";
        return svg("0 0 200 200", body, defs);
      case "uranus":
        defs = grad(g, "#d7f6f6", "#98dbe2", "#69b7c6") + shadeDef(s) + clip;
        body = '<g transform="rotate(78 100 100)"><ellipse cx="100" cy="100" rx="96" ry="20" fill="none" stroke="#e8fbfb" stroke-width="3" opacity=".55"/></g>' +
          '<circle cx="100" cy="100" r="' + r + '" fill="url(#' + g + ')"/><g clip-path="url(#' + c + ')" opacity=".25"><rect x="0" y="64" width="200" height="10" fill="#fff"/><rect x="0" y="124" width="200" height="8" fill="#5fa9b8"/></g>' + shade;
        return svg("0 0 200 200", body, defs);
      case "neptune":
        defs = grad(g, "#8aa6f5", "#4a69d2", "#2a3f9e") + shadeDef(s) + clip;
        body = '<circle cx="100" cy="100" r="' + r + '" fill="url(#' + g + ')"/><g clip-path="url(#' + c + ')">' +
          '<rect x="0" y="70" width="200" height="12" fill="#6f8ce6" opacity=".5"/><rect x="0" y="122" width="200" height="10" fill="#2f47a8" opacity=".5"/>' +
          '<ellipse cx="78" cy="110" rx="18" ry="10" fill="#22357f" opacity=".7"/><path d="M110 92c12-4 26-4 38 0" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity=".7" fill="none"/></g>' + shade;
        return svg("0 0 200 200", body, defs);
    }
    return A.planet("earth");
  };
  A.PLANETS = ["sun", "mercury", "venus", "earth", "moon", "mars", "jupiter", "saturn", "uranus", "neptune"];
  A.EIGHT = ["mercury", "venus", "earth", "mars", "jupiter", "saturn", "uranus", "neptune"];

  /* ---------- the car (side view, facing right) ---------- */
  A.car = function (colour, opts) {
    opts = opts || {};
    var col = colour || "#e2574c";
    var body =
      '<ellipse cx="132" cy="138" rx="108" ry="7" fill="#000" opacity=".12"/>' +
      '<path class="car-paint" style="fill:' + col + '" d="M20 98c0-14 8-22 22-24l30-3c12-24 30-34 56-34h34c22 0 38 12 50 32l26 5c14 3 22 12 22 25v8c0 6-4 10-10 10H30c-6 0-10-4-10-10z"/>' +
      '<path d="M20 104h236v6c0 6-4 10-10 10H30c-6 0-10-4-10-10z" fill="#000" opacity=".12"/>' +
      '<path d="M86 70c10-16 22-23 40-23h14v23z" fill="#d6ecf8"/><path d="M150 47h12c14 0 26 7 34 23h-46z" fill="#d6ecf8"/>' +
      '<path d="M90 66c6-8 12-12 20-13" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity=".8" fill="none"/>' +
      '<path d="M146 76v32" stroke="#000" stroke-width="2.5" opacity=".18"/>' +
      '<rect x="120" y="82" width="16" height="5" rx="2.5" fill="#000" opacity=".2"/><rect x="164" y="82" width="16" height="5" rx="2.5" fill="#000" opacity=".2"/>' +
      '<rect x="236" y="84" width="16" height="11" rx="5" fill="#fff3b0"/><rect x="21" y="84" width="10" height="11" rx="4" fill="#ffb7a8"/>' +
      wheel(76) + wheel(204);
    return svg("0 0 270 150", body);
    function wheel(x) {
      return '<g class="wheel" style="transform-origin:' + x + 'px 116px"><circle cx="' + x + '" cy="116" r="22" fill="#2d2f3a"/>' +
        '<circle cx="' + x + '" cy="116" r="11" fill="#c9ccd6"/><path d="M' + x + ' 105v22M' + (x - 11) + ' 116h22" stroke="#8a8e9c" stroke-width="3"/></g>';
    }
  };
  A.COLOURS = { red: "#e2574c", yellow: "#f2c53d", blue: "#3f7fdc", green: "#4caf62", orange: "#f08a35", purple: "#8e5cc7" };

  /* ---------- the friendly alien ---------- */
  A.alien = function () {
    var g = id("g");
    var defs = grad(g, "#b6ecb6", "#7fd08a", "#57ad68");
    var body =
      '<path d="M78 46 64 14M122 46l14-32" stroke="#57ad68" stroke-width="6" stroke-linecap="round"/><circle cx="62" cy="12" r="10" fill="#f6c84c"/><circle cx="138" cy="12" r="10" fill="#f6c84c"/>' +
      '<ellipse cx="38" cy="150" rx="16" ry="11" fill="#6cc27a" transform="rotate(-30 38 150)"/><ellipse cx="162" cy="150" rx="16" ry="11" fill="#6cc27a" transform="rotate(30 162 150)"/>' +
      '<ellipse cx="100" cy="122" rx="74" ry="80" fill="url(#' + g + ')"/><ellipse cx="100" cy="160" rx="44" ry="30" fill="#c9f2c6" opacity=".7"/>' +
      '<circle cx="72" cy="98" r="22" fill="#fff"/><circle cx="128" cy="98" r="22" fill="#fff"/>' +
      '<circle class="pupil" cx="75" cy="101" r="11" fill="#27304f"/><circle class="pupil" cx="131" cy="101" r="11" fill="#27304f"/>' +
      '<circle cx="79" cy="96" r="4" fill="#fff"/><circle cx="135" cy="96" r="4" fill="#fff"/>' +
      '<ellipse cx="52" cy="128" rx="10" ry="6" fill="#ff9fb0" opacity=".55"/><ellipse cx="148" cy="128" rx="10" ry="6" fill="#ff9fb0" opacity=".55"/>' +
      '<path class="mouth-smile" d="M80 134c10 12 30 12 40 0" stroke="#27304f" stroke-width="6" stroke-linecap="round" fill="none"/>' +
      '<ellipse class="mouth-open" cx="100" cy="140" rx="20" ry="15" fill="#7a2d3c" style="display:none"/>';
    return svg("0 0 200 210", body, defs);
  };

  /* ---------- props ---------- */
  A.star = function (fill) {
    return svg("0 0 100 100", '<path d="M50 6l12.5 28.5 31 3-23.5 20.5 7 30.5L50 72.5 23 88.5l7-30.5L6.5 37.5l31-3z" fill="' + (fill || "#ffd86b") + '" stroke="#fff3c4" stroke-width="3" stroke-linejoin="round"/>');
  };
  A.cloud = function () {
    return svg("0 0 260 160",
      '<g fill="#cfd6ea"><circle cx="70" cy="104" r="44"/><circle cx="130" cy="80" r="58"/><circle cx="192" cy="104" r="44"/><rect x="60" y="100" width="140" height="48" rx="24"/></g>' +
      '<g fill="#fff"><circle cx="70" cy="96" r="42"/><circle cx="130" cy="72" r="56"/><circle cx="192" cy="96" r="42"/><rect x="62" y="92" width="136" height="46" rx="23"/></g>');
  };
  A.sleepyMoon = function () {
    var g = id("g");
    return svg("0 0 200 200",
      '<circle cx="100" cy="100" r="80" fill="url(#' + g + ')"/><g fill="#b9bcc6" opacity=".45"><circle cx="64" cy="70" r="10"/><circle cx="140" cy="64" r="7"/><circle cx="146" cy="134" r="9"/></g>' +
      '<path d="M62 100c8 8 20 8 28 0M110 100c8 8 20 8 28 0" stroke="#5b5f73" stroke-width="5" stroke-linecap="round" fill="none"/>' +
      '<path d="M84 128c9 8 23 8 32 0" stroke="#5b5f73" stroke-width="5" stroke-linecap="round" fill="none"/>' +
      '<ellipse cx="62" cy="120" rx="10" ry="6" fill="#f3b6c2" opacity=".55"/><ellipse cx="138" cy="120" rx="10" ry="6" fill="#f3b6c2" opacity=".55"/>',
      grad(g, "#fffbe9", "#f1e7c2", "#d9cd9f"));
  };
  A.garage = function () {
    return svg("0 0 260 230",
      '<path d="M14 92 130 18l116 74z" fill="#c8735a"/><path d="M14 92 130 18l116 74" fill="none" stroke="#a85a44" stroke-width="8" stroke-linejoin="round"/>' +
      '<rect x="30" y="88" width="200" height="132" fill="#f3e6cd"/><rect x="52" y="104" width="156" height="116" rx="6" fill="#7d8597"/>' +
      '<rect x="30" y="214" width="200" height="10" fill="#d9c7a6"/>');
  };
  A.garageDoor = function () {
    var lines = ""; for (var y = 18; y < 116; y += 18) lines += '<path d="M8 ' + y + 'h140" stroke="#b9c0cf" stroke-width="3"/>';
    return svg("0 0 156 116", '<rect x="0" y="0" width="156" height="116" rx="4" fill="#dfe4ee"/>' + lines + '<rect x="64" y="96" width="28" height="6" rx="3" fill="#9aa3b5"/>');
  };
  A.trafficLight = function () {
    return svg("0 0 130 330",
      '<rect x="56" y="200" width="18" height="128" rx="6" fill="#59606e"/><rect x="8" y="6" width="114" height="210" rx="30" fill="#2e3340"/>' +
      '<circle class="lamp lamp-red" cx="65" cy="62" r="40" fill="#5a2a2a"/><circle class="lamp lamp-green" cx="65" cy="158" r="40" fill="#1f4a2e"/>');
  };
  A.basket = function () {
    return svg("0 0 260 170",
      '<path d="M50 70c0-50 160-50 160 0" fill="none" stroke="#a8743f" stroke-width="10" stroke-linecap="round"/>' +
      '<path d="M18 70h224l-22 90H40z" fill="#c8925a"/><path d="M18 70h224" stroke="#a8743f" stroke-width="12" stroke-linecap="round"/>' +
      '<g stroke="#a8743f" stroke-width="4" opacity=".7"><path d="M30 100h200M36 128h188"/><path d="M70 74l8 84M110 74l4 84M150 74l-4 84M190 74l-8 84"/></g>');
  };
  A.bowl = function () {
    return svg("0 0 260 150",
      '<ellipse cx="130" cy="40" rx="118" ry="26" fill="#dbe6f2"/><path d="M12 40c4 70 52 104 118 104s114-34 118-104z" fill="#f5f8fc"/>' +
      '<path d="M18 62c20 8 60 12 112 12s92-4 112-12" stroke="#9cc4e8" stroke-width="8" fill="none" stroke-linecap="round"/>');
  };
  A.paintPot = function (colour) {
    return svg("0 0 120 130",
      '<rect x="14" y="30" width="92" height="92" rx="14" fill="#e4e7ee"/>' +
      '<rect x="14" y="58" width="92" height="44" fill="' + colour + '"/>' +
      '<ellipse cx="60" cy="30" rx="46" ry="14" fill="' + colour + '"/><path d="M28 32c0 18 9 20 9 30s-9 10-9 0zM82 32c0 10 6 12 6 18s-6 6-6 0z" fill="' + colour + '"/>' +
      '<ellipse cx="46" cy="26" rx="14" ry="4" fill="#fff" opacity=".4"/><rect x="22" y="62" width="10" height="36" rx="5" fill="#fff" opacity=".25"/>');
  };
  A.shape = function (name, fill, stroke, dash) {
    var st = stroke ? ' stroke="' + stroke + '" stroke-width="7"' + (dash ? ' stroke-dasharray="14 10"' : "") + ' stroke-linejoin="round"' : "";
    var f = fill || "none", d;
    if (name === "circle") d = '<circle cx="60" cy="60" r="46" fill="' + f + '"' + st + "/>";
    else if (name === "square") d = '<rect x="16" y="16" width="88" height="88" rx="10" fill="' + f + '"' + st + "/>";
    else if (name === "triangle") d = '<path d="M60 12l50 88H10z" fill="' + f + '"' + st + "/>";
    else d = '<path d="M60 8l14.5 31 34 3.5-25.5 23 7.5 33.5L60 82 29.5 99l7.5-33.5-25.5-23 34-3.5z" fill="' + f + '"' + st + "/>";
    return svg("0 0 120 120", d);
  };
  A.bubble = function () {
    var g = id("b");
    return svg("0 0 100 100",
      '<circle cx="50" cy="50" r="46" fill="url(#' + g + ')" stroke="#cfe6ff" stroke-opacity=".7" stroke-width="2"/>' +
      '<ellipse cx="34" cy="30" rx="12" ry="7" fill="#fff" opacity=".7" transform="rotate(-30 34 30)"/>',
      '<radialGradient id="' + g + '" cx="50%" cy="50%" r="50%"><stop offset=".6" stop-color="#bfe0ff" stop-opacity=".08"/><stop offset=".9" stop-color="#d6c5ff" stop-opacity=".35"/><stop offset="1" stop-color="#ffffff" stop-opacity=".55"/></radialGradient>');
  };
  A.mud = function (seed) {
    var shapes = [
      "M30 10c14-6 30 2 32 14s12 18 4 28-26 8-36 4-22-4-22-18 8-22 22-28z",
      "M24 8c16-4 34 6 36 18s-2 26-16 30-30 2-36-10 0-34 16-38z",
      "M36 6c12 0 22 10 24 20s10 20 0 28-28 6-38 0-18-16-12-28 14-20 26-20z"
    ];
    return svg("0 0 70 66", '<path d="' + shapes[(seed || 0) % 3] + '" fill="#8a5a3b"/><circle cx="22" cy="22" r="4" fill="#6f452c"/><circle cx="44" cy="40" r="5" fill="#6f452c"/>');
  };
  A.wateringCan = function () {
    return svg("0 0 140 110",
      '<path d="M96 46l36-22 4 8-34 26z" fill="#5aa0cf"/><rect x="20" y="40" width="80" height="62" rx="12" fill="#6fb3e0"/>' +
      '<path d="M28 42c0-24 64-24 64 0" fill="none" stroke="#5aa0cf" stroke-width="9" stroke-linecap="round"/><rect x="28" y="54" width="64" height="8" rx="4" fill="#fff" opacity=".35"/>');
  };
  A.seedPacket = function () {
    return svg("0 0 110 140",
      '<rect x="10" y="10" width="90" height="120" rx="8" fill="#f2d48a"/><rect x="10" y="10" width="90" height="22" rx="8" fill="#e5bd62"/>' +
      '<path d="M55 58l12 40c2 8-2 14-12 14s-14-6-12-14z" fill="#f08a35"/><path d="M55 58c-6-10-14-14-20-12M55 58c2-12 8-18 16-18M55 58c-2-10 0-16 4-20" stroke="#4caf62" stroke-width="6" stroke-linecap="round" fill="none"/>');
  };
  A.soil = function () {
    return svg("0 0 260 90", '<ellipse cx="130" cy="58" rx="122" ry="30" fill="#7a4e33"/><ellipse cx="130" cy="50" rx="110" ry="22" fill="#8f6040"/>' +
      '<g fill="#6a432b"><circle cx="80" cy="52" r="4"/><circle cx="150" cy="46" r="3"/><circle cx="190" cy="56" r="4"/><circle cx="110" cy="60" r="3"/></g>');
  };
  A.carrotPlant = function () {
    return svg("0 0 160 200",
      '<path d="M80 96c-10-30-30-46-46-48M80 96c-2-34 6-58 20-70M80 96c10-26 26-38 44-40" stroke="#4caf62" stroke-width="12" stroke-linecap="round" fill="none"/>' +
      '<path class="carrot-root" d="M56 96h48l-18 96c-2 8-10 8-12 0z" fill="#f08a35"/><path d="M62 118h16M70 140h12M68 160h10" stroke="#c9692a" stroke-width="4" stroke-linecap="round"/>');
  };
  A.pumpkin = function () {
    return svg("0 0 120 110",
      '<path d="M60 24c-4-10 0-18 8-20" stroke="#5a8a3a" stroke-width="8" stroke-linecap="round" fill="none"/>' +
      '<ellipse cx="34" cy="66" rx="28" ry="38" fill="#e8822f"/><ellipse cx="86" cy="66" rx="28" ry="38" fill="#e8822f"/><ellipse cx="60" cy="66" rx="30" ry="42" fill="#f29a3e"/>' +
      '<path d="M60 26v80" stroke="#d26f24" stroke-width="3" opacity=".6"/>');
  };
  A.puzzle = function () {
    return svg("0 0 100 100", '<path d="M14 30h20c-6-14 4-22 12-22s18 8 12 22h20v22c14-6 22 4 22 12s-8 18-22 12v20H58c6-14-4-20-12-20s-18 6-12 20H14z" fill="#fbf3e2"/>');
  };
  A.road = function () {
    return svg("0 0 400 60", '<rect width="400" height="60" fill="#7c8496"/><path d="M0 30h400" stroke="#fff" stroke-width="5" stroke-dasharray="30 26" opacity=".85"/>', "") ;
  };
})();

/* ---------- sea animals: original cartoon drawings of real species ---------- */
(function () {
  "use strict";
  var A = window.HW.art, n = 0;
  function id(p) { n += 1; return p + "s" + n; }
  function svg(vb, body, defs) {
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="' + vb + '">' + (defs ? "<defs>" + defs + "</defs>" : "") + body + "</svg>";
  }
  function eye(x, y, r) {
    r = r || 9;
    return '<circle cx="' + x + '" cy="' + y + '" r="' + r + '" fill="#fff"/><circle cx="' + (x + r * 0.2) + '" cy="' + (y + r * 0.1) + '" r="' + r * 0.55 + '" fill="#1f2540"/><circle cx="' + (x + r * 0.4) + '" cy="' + (y - r * 0.25) + '" r="' + r * 0.2 + '" fill="#fff"/>';
  }
  function smile(x, y, w) { w = w || 10; return '<path d="M' + (x - w / 2) + ' ' + y + 'q' + w / 2 + ' ' + w * 0.6 + ' ' + w + ' 0" stroke="#1f2540" stroke-width="3.5" stroke-linecap="round" fill="none"/>'; }

  A.clownfish = function () {
    var c = id("c");
    return svg("0 0 200 140",
      '<path d="M44 70 12 38c-6 22-6 42 0 64z" fill="#f47a22" stroke="#1f2540" stroke-width="3" stroke-linejoin="round"/>' +
      '<path d="M78 32c16-20 44-22 62-6" fill="#f47a22" stroke="#1f2540" stroke-width="3"/>' +
      '<ellipse cx="108" cy="72" rx="70" ry="42" fill="#f58a2d" stroke="#1f2540" stroke-width="3"/>' +
      '<g clip-path="url(#' + c + ')" fill="#fff" stroke="#1f2540" stroke-width="3">' +
      '<path d="M66 20c-8 34-8 70 0 104h16c-8-34-8-70 0-104z"/><path d="M108 20c-8 34-8 70 0 104h18c-8-34-8-70 0-104z"/><path d="M152 26c-6 30-6 62 0 92h12c-6-30-6-62 0-92z"/></g>' +
      '<path d="M96 104c-4 12 6 22 18 18" fill="#f47a22" stroke="#1f2540" stroke-width="3"/>' +
      eye(158, 62, 9) + smile(170, 84, 10),
      '<clipPath id="' + c + '"><ellipse cx="108" cy="72" rx="68.5" ry="40.5"/></clipPath>');
  };
  A.blueTang = function () {
    return svg("0 0 200 140",
      '<path d="M44 70 10 40c-5 20-5 40 0 60z" fill="#f6cf3a"/>' +
      '<path d="M60 36c30-22 76-22 104 6" stroke="#1d3c8f" stroke-width="10" fill="none" stroke-linecap="round"/>' +
      '<ellipse cx="108" cy="72" rx="72" ry="44" fill="#2f6fe0"/>' +
      '<path d="M54 64c18-20 52-28 82-18 14 5 20 16 10 22-12 8-28-6-46-4s-30 18-40 14-10-8-6-14z" fill="#1b2b66"/>' +
      '<path d="M62 106c26 12 62 14 90 0" stroke="#1d3c8f" stroke-width="8" fill="none" stroke-linecap="round"/>' +
      '<path d="M100 92c-2 10 8 18 18 14" fill="#f6cf3a" opacity=".9"/>' +
      eye(156, 62, 9) + smile(170, 86, 10));
  };
  A.genericFish = function (colour) {
    return svg("0 0 200 140",
      '<path class="fish-paint" style="fill:' + colour + '" d="M46 70 12 36c-6 24-6 44 0 68z"/>' +
      '<path class="fish-paint" style="fill:' + colour + '" d="M76 34c18-22 50-22 66-4z"/>' +
      '<ellipse class="fish-paint" style="fill:' + colour + '" cx="108" cy="72" rx="70" ry="44"/>' +
      '<path d="M46 70 12 36c-6 24-6 44 0 68z" fill="#000" opacity=".12"/><path d="M76 34c18-22 50-22 66-4z" fill="#000" opacity=".12"/>' +
      '<ellipse cx="96" cy="88" rx="22" ry="12" fill="#000" opacity=".12" transform="rotate(-20 96 88)"/>' +
      '<path d="M70 50c20-14 54-16 74-4" stroke="#fff" stroke-width="6" opacity=".35" fill="none" stroke-linecap="round"/>' +
      eye(154, 62, 10) + smile(168, 86, 11));
  };
  A.pufferfish = function () {
    var sp = "";
    for (var i = 0; i < 14; i++) {
      var a = (Math.PI * 2 * i) / 14, x = 100 + Math.cos(a) * 56, y = 72 + Math.sin(a) * 52, x2 = 100 + Math.cos(a) * 70, y2 = 72 + Math.sin(a) * 66;
      sp += '<path d="M' + (x + Math.sin(a) * 6) + " " + (y - Math.cos(a) * 6) + "L" + x2 + " " + y2 + "L" + (x - Math.sin(a) * 6) + " " + (y + Math.cos(a) * 6) + 'z" fill="#e0a92a"/>';
    }
    return svg("0 0 200 150",
      sp + '<circle cx="100" cy="72" r="58" fill="#f5d04a"/><ellipse cx="100" cy="94" rx="40" ry="26" fill="#fbe9a6"/>' +
      '<circle cx="78" cy="88" r="5" fill="#d8a52d"/><circle cx="118" cy="98" r="4" fill="#d8a52d"/><circle cx="96" cy="44" r="4" fill="#d8a52d"/>' +
      '<path d="M44 66c-14-10-22-2-20 8 2 8 12 10 20 4z" fill="#e6b836"/>' +
      eye(124, 60, 11) + '<ellipse cx="146" cy="82" rx="6" ry="5" fill="#c8782a"/>');
  };
  A.turtle = function () {
    return svg("0 0 220 150",
      '<ellipse cx="64" cy="40" rx="30" ry="12" fill="#7cc47c" transform="rotate(-25 64 40)"/><ellipse cx="64" cy="112" rx="30" ry="12" fill="#7cc47c" transform="rotate(25 64 112)"/>' +
      '<ellipse cx="150" cy="38" rx="34" ry="13" fill="#7cc47c" transform="rotate(-35 150 38)"/><ellipse cx="150" cy="114" rx="34" ry="13" fill="#7cc47c" transform="rotate(35 150 114)"/>' +
      '<path d="M40 76 22 70l18-4z" fill="#7cc47c"/>' +
      '<circle cx="182" cy="76" r="24" fill="#8fd08f"/>' +
      '<ellipse cx="106" cy="76" rx="70" ry="48" fill="#4f9a55"/><ellipse cx="106" cy="76" rx="62" ry="41" fill="#5fae62"/>' +
      '<g fill="#4a8f4f" opacity=".8"><path d="M106 48l18 10v18l-18 10-18-10V58z"/><path d="M72 58l14 8v14l-14 8-12-8V66z"/><path d="M140 58l12 8v14l-12 8-14-8V66z"/><path d="M106 96l14 6v8l-14 6-14-6v-8z"/></g>' +
      eye(188, 70, 7) + smile(194, 86, 9));
  };
  A.octopus = function () {
    var legs = [
      "M62 104c-14 22-30 34-40 56-4 10 6 18 14 10",
      "M80 112c-6 24-16 40-16 62 0 10 12 12 14 2",
      "M100 116c0 24-4 44 2 66 3 10 14 6 12-4",
      "M120 116c4 22 10 40 20 58 5 9 15 4 11-6",
      "M140 112c10 20 24 34 40 46 8 6 16-4 8-10",
      "M158 104c16 16 32 22 46 32 8 6 14-6 6-10"
    ].map(function (d) { return '<path d="' + d + '" stroke="#8a5cc9" stroke-width="16" stroke-linecap="round" fill="none"/>'; }).join("");
    return svg("0 0 220 200",
      legs + '<path d="M40 104c0-58 32-90 70-90s70 32 70 90c0 14-20 18-70 18s-70-4-70-18z" fill="#9b6fd6"/>' +
      '<ellipse cx="86" cy="52" rx="16" ry="10" fill="#fff" opacity=".25" transform="rotate(-30 86 52)"/>' +
      '<g fill="#b48ae6" opacity=".8"><circle cx="70" cy="86" r="5"/><circle cx="150" cy="82" r="4"/><circle cx="130" cy="44" r="4"/></g>' +
      eye(90, 76, 11) + eye(132, 76, 11) + smile(111, 98, 16));
  };
  A.seahorse = function () {
    return svg("0 0 160 220",
      '<path d="M86 196c-26 4-36-22-18-30 14-6 22 10 10 16" stroke="#e8b32e" stroke-width="16" stroke-linecap="round" fill="none"/>' +
      '<path d="M58 66c10-6 20 4 24 16s-2 22-6 34c-6 18 0 36 10 48l-14 10c-16-14-26-40-22-62 2-16 0-38 8-46z" fill="#f2c53d"/>' +
      '<ellipse cx="82" cy="108" rx="28" ry="40" fill="#f2c53d"/><ellipse cx="94" cy="112" rx="14" ry="28" fill="#f8de85"/>' +
      '<path d="M48 92c-14 2-20 14-14 24 8-2 14-10 16-20z" fill="#e8b32e"/>' +
      '<circle cx="84" cy="52" r="26" fill="#f2c53d"/><path d="M104 46l34 4c4 1 4 9 0 10l-32 4z" fill="#f2c53d"/>' +
      '<path d="M70 28l6-14 8 12 8-12 4 16z" fill="#e8b32e"/>' +
      eye(90, 46, 8) + '<path d="M70 88h14M68 104h14M70 120h12" stroke="#e8b32e" stroke-width="4" stroke-linecap="round"/>');
  };
  A.starfish = function () {
    return svg("0 0 200 200",
      '<path d="M100 14c8 0 12 30 20 48 16 4 58 2 62 10 2 8-30 26-40 40 4 18 22 56 16 62s-40-20-58-28c-18 8-52 34-58 28s12-44 16-62C48 98 16 80 18 72c4-8 46-6 62-10 8-18 12-48 20-48z" fill="#f4914a" stroke="#e07a34" stroke-width="4" stroke-linejoin="round"/>' +
      '<g fill="#ffd0a8"><circle cx="100" cy="46" r="5"/><circle cx="150" cy="80" r="5"/><circle cx="132" cy="140" r="5"/><circle cx="68" cy="140" r="5"/><circle cx="50" cy="80" r="5"/></g>' +
      eye(86, 96, 9) + eye(114, 96, 9) + smile(100, 116, 14));
  };
  A.crab = function () {
    return svg("0 0 220 170",
      '<g stroke="#c8443a" stroke-width="8" stroke-linecap="round" fill="none"><path d="M60 110l-26 22M56 98l-30 10M64 120l-14 28M160 110l26 22M164 98l30 10M156 120l14 28"/>' +
      '<path d="M76 74 54 44M144 74l22-30"/><path d="M92 64V36M128 64V36"/></g>' +
      '<path d="M30 42c-18-6-24-30-6-36 6 10 16 10 22 4 10 12 2 32-16 32z" fill="#e2574c"/><path d="M190 42c18-6 24-30 6-36-6 10-16 10-22 4-10 12-2 32 16 32z" fill="#e2574c"/>' +
      '<ellipse cx="110" cy="100" rx="62" ry="42" fill="#e2574c"/><ellipse cx="110" cy="112" rx="40" ry="20" fill="#ef8a7f" opacity=".6"/>' +
      eye(92, 32, 10) + eye(128, 32, 10) + smile(110, 104, 18));
  };
  A.jellyfish = function () {
    var g = id("j");
    return svg("0 0 180 220",
      '<g stroke="#e58bb5" stroke-width="7" stroke-linecap="round" fill="none" opacity=".9">' +
      '<path d="M50 110c-6 20 8 30 0 50s6 30 0 44"/><path d="M76 116c-4 22 8 32 2 52s4 26 0 38"/><path d="M104 116c4 22-8 32-2 52s-4 26 0 38"/><path d="M130 110c6 20-8 30 0 50s-6 30 0 44"/></g>' +
      '<path d="M22 108c0-52 30-86 68-86s68 34 68 86c-10 8-20 0-34 6-12-8-22 0-34 6-12-6-22-14-34-6-14-6-24 2-34-6z" fill="url(#' + g + ')"/>' +
      '<ellipse cx="66" cy="54" rx="16" ry="9" fill="#fff" opacity=".45" transform="rotate(-30 66 54)"/>' +
      eye(72, 80, 9) + eye(108, 80, 9) + smile(90, 98, 14),
      '<linearGradient id="' + g + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f7bfdc"/><stop offset="1" stop-color="#eb94c0"/></linearGradient>');
  };
  A.whale = function () {
    return svg("0 0 240 170",
      '<path d="M110 36c-6-14-2-24 6-28M110 36c4-14 12-20 22-20M110 36c-10-10-20-12-28-8" stroke="#9fd3f2" stroke-width="6" stroke-linecap="round" fill="none"/>' +
      '<path d="M40 96c-16-6-30-26-28-44 14 4 24 14 30 26 6-12 16-22 30-26 2 16-8 32-22 42z" fill="#3f6fc4"/>' +
      '<path d="M44 104c0-40 46-64 98-64 48 0 86 26 86 66 0 28-34 44-90 44-56 0-94-18-94-46z" fill="#4a7fd6"/>' +
      '<path d="M64 118c22 22 112 26 152 0-4 22-34 32-78 32s-66-12-74-32z" fill="#cfe6f8"/>' +
      '<g stroke="#a9cdee" stroke-width="3"><path d="M96 124v18M120 128v20M144 128v20M168 126v18"/></g>' +
      '<ellipse cx="150" cy="128" rx="18" ry="8" fill="#3f6fc4" transform="rotate(20 150 128)"/>' +
      eye(186, 90, 9) + smile(204, 108, 14));
  };
  A.shark = function () {
    return svg("0 0 240 150",
      '<path d="M44 76 10 36c-4 18 0 34 8 42-8 10-12 26-8 40z" fill="#7d8ea6"/>' +
      '<path d="M110 38 126 4c6 10 12 24 14 36z" fill="#7d8ea6"/>' +
      '<path d="M36 78c18-30 70-44 120-42 40 2 70 18 78 40-8 22-38 36-78 38-50 2-102-10-120-36z" fill="#8fa1b8"/>' +
      '<path d="M70 92c40 22 110 26 160-12-10 22-40 34-76 36-36 2-66-8-84-24z" fill="#eef3f8"/>' +
      '<path d="M118 102c-6 14-2 26 8 30 4-10 2-22-8-30z" fill="#7d8ea6"/>' +
      '<g stroke="#6f8199" stroke-width="3" stroke-linecap="round"><path d="M160 66v18M168 64v20M176 64v18"/></g>' +
      eye(196, 66, 8) + '<path d="M196 92q12 8 26-2" stroke="#1f2540" stroke-width="3.5" stroke-linecap="round" fill="none"/>');
  };
  A.coral = function () {
    return svg("0 0 260 200",
      '<path d="M60 196c0-40-20-60-30-90M60 160c10-20 30-30 34-60M60 130c-14-10-20-24-18-40" stroke="#f08aa0" stroke-width="16" stroke-linecap="round" fill="none"/>' +
      '<path d="M190 196c4-36 24-54 30-84M190 150c-14-14-24-34-22-56M196 120c14-10 26-20 28-36" stroke="#f6a35a" stroke-width="16" stroke-linecap="round" fill="none"/>' +
      '<g fill="#b98ae6"><ellipse cx="126" cy="168" rx="58" ry="26"/></g>' +
      '<g stroke="#c9a0f0" stroke-width="10" stroke-linecap="round" fill="none"><path d="M86 160c-6-26 0-46 8-60M104 156c-2-26 4-44 12-58M124 154c0-24 4-42 10-56M144 156c2-24 0-42-4-58M162 160c4-22 2-40-6-54"/></g>' +
      '<rect x="0" y="186" width="260" height="14" rx="7" fill="#f3dfae"/>');
  };
  A.seaweed = function () {
    return svg("0 0 80 220", '<path d="M40 216c-18-30 18-50 0-80s18-50 0-80 10-40 6-52" stroke="#4fa86c" stroke-width="14" stroke-linecap="round" fill="none"/><path d="M40 160c14-6 22-18 24-30M40 100c-14-6-22-18-22-30" stroke="#5cbf7d" stroke-width="10" stroke-linecap="round" fill="none"/>');
  };
  A.foodPot = function () {
    return svg("0 0 120 140",
      '<rect x="22" y="40" width="76" height="92" rx="14" fill="#f2c53d"/><rect x="18" y="24" width="84" height="24" rx="8" fill="#e08a2e"/>' +
      '<g fill="#e08a2e"><circle cx="44" cy="80" r="6"/><circle cx="64" cy="94" r="7"/><circle cx="80" cy="76" r="5"/><circle cx="52" cy="110" r="5"/><circle cx="78" cy="108" r="6"/></g>' +
      '<g fill="#fff" opacity=".9"><circle cx="40" cy="36" r="3"/><circle cx="56" cy="34" r="3"/><circle cx="72" cy="36" r="3"/><circle cx="86" cy="34" r="3"/></g>');
  };
  A.SEA = { clownfish: A.clownfish, bluetang: A.blueTang, turtle: A.turtle, octopus: A.octopus, seahorse: A.seahorse,
    starfish: A.starfish, crab: A.crab, jellyfish: A.jellyfish, whale: A.whale, pufferfish: A.pufferfish, shark: A.shark };
})();
