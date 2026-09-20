/* Syncs the songbook localStorage cache to /api/songs so rebuilds do not wipe songs. */
(function () {
  var KEY = "spss_songbook_v1";
  var pushing = false;
  var lastSent = "";

  function parseState(raw) {
    try {
      var parsed = JSON.parse(raw);
      if (!parsed || !Array.isArray(parsed.songs)) return null;
      return parsed;
    } catch (e) {
      return null;
    }
  }

  function songCount(raw) {
    var s = parseState(raw);
    return s ? s.songs.length : 0;
  }

  function pushNow(raw) {
    if (!raw || raw === lastSent || pushing) return;
    pushing = true;
    fetch("/api/songs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ payload: raw }),
    })
      .then(function (res) {
        if (res.ok) lastSent = raw;
      })
      .catch(function () {})
      .then(function () {
        pushing = false;
      });
  }

  function pullThenMerge() {
    fetch("/api/songs")
      .then(function (res) {
        return res.ok ? res.json() : null;
      })
      .then(function (data) {
        if (!data || !data.ok || !data.payload) return;
        var serverRaw = typeof data.payload === "string" ? data.payload : JSON.stringify(data.payload);
        var localRaw = null;
        try {
          localRaw = localStorage.getItem(KEY);
        } catch (e) {}
        var serverN = songCount(serverRaw);
        var localN = songCount(localRaw || "");
        if (serverN > 0 && serverN >= localN) {
          try {
            localStorage.setItem(KEY, serverRaw);
            lastSent = serverRaw;
            window.dispatchEvent(new Event("sps-songbook-hydrated"));
          } catch (e) {}
        } else if (localN > 0) {
          pushNow(localRaw);
        }
      })
      .catch(function () {});
  }

  var origSet = localStorage.setItem.bind(localStorage);
  localStorage.setItem = function (k, v) {
    origSet(k, v);
    if (k === KEY) pushNow(String(v));
  };

  pullThenMerge();
  setInterval(function () {
    try {
      var raw = localStorage.getItem(KEY);
      if (raw) pushNow(raw);
    } catch (e) {}
  }, 8000);
})();
