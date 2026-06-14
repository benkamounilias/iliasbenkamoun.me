const STORAGE_KEY = "layout-desk-feed-state";

const feed = document.querySelector("#feed");
const searchInput = document.querySelector("#feed-search");
const searchSuggestions = document.querySelector("#search-suggestions");
const sortSelect = document.querySelector("#feed-sort");
const restoreButton = document.querySelector("#restore-feed");
const emptyState = document.querySelector("#empty-state");
const visibleCount = document.querySelector("#visible-count");
const readCount = document.querySelector("#read-count");
const savedCount = document.querySelector("#saved-count");
const densityControls = document.querySelectorAll("input[name='density']");
const stories = Array.from(document.querySelectorAll(".story"));

const state = loadState();
const suggestionItems = getSuggestionItems(stories);
let activeSuggestionIndex = -1;
let masonryFrame;

stories.forEach((story) => {
  const actions = document.createElement("div");
  actions.className = "story-actions";
  actions.innerHTML = `
    <button class="story-action" type="button" data-action="open">Read more</button>
    <button class="story-action" type="button" data-action="read">Mark as read</button>
    <button class="story-action" type="button" data-action="save">Save</button>
    <button class="story-action" type="button" data-action="dismiss">Hide</button>
  `;
  story.append(actions);
});

feed.addEventListener("click", (event) => {
  const button = event.target.closest("[data-action]");
  if (!button) return;

  const story = button.closest(".story");
  const id = story.dataset.id;
  const action = button.dataset.action;

  if (action === "open") {
    button.blur();
    return;
  }

  if (action === "read") {
    toggleId(state.read, id);
    saveState();
    updateStoryState(story);
    updateStats();
    return;
  }

  if (action === "save") {
    toggleId(state.saved, id);
    saveState();
    updateStoryState(story);
    updateStats();
    return;
  }

  if (action === "dismiss") {
    addId(state.hidden, id);
    saveState();
    renderFeed();
  }
});

searchInput.addEventListener("input", () => {
  renderSuggestions();
  renderFeed();
});

searchInput.addEventListener("focus", renderSuggestions);
searchInput.addEventListener("keydown", handleSuggestionKeys);
searchInput.addEventListener("blur", () => {
  window.setTimeout(closeSuggestions, 130);
});

searchSuggestions.addEventListener("mousedown", (event) => {
  event.preventDefault();
});

searchSuggestions.addEventListener("click", (event) => {
  const button = event.target.closest(".search-suggestion");
  if (!button) return;

  searchInput.value = button.dataset.value;
  closeSuggestions();
  renderFeed();
  searchInput.focus();
});

sortSelect.addEventListener("change", () => renderFeed({ reorder: true }));
restoreButton.addEventListener("click", () => {
  state.hidden = [];
  saveState();
  renderFeed();
});

window.addEventListener("resize", () => {
  queueMasonryLayout();
});

densityControls.forEach((control) => {
  control.addEventListener("change", () => {
    document.body.classList.toggle(
      "compact",
      control.value === "compact" && control.checked
    );
    queueMasonryLayout();
  });
});

renderFeed({ reorder: true });

if (document.fonts) {
  document.fonts.ready.then(queueMasonryLayout);
}

function renderFeed({ reorder = false } = {}) {
  const query = searchInput.value.trim().toLowerCase();
  const sortedStories = sortStories(stories, sortSelect.value);
  let shown = 0;

  if (reorder) {
    sortedStories.forEach((story) => feed.append(story));
  }

  sortedStories.forEach((story) => {
    const id = story.dataset.id;
    const isHidden = state.hidden.includes(id);
    const matchesSearch = !query || getStoryText(story).includes(query);
    const shouldShow = !isHidden && matchesSearch;

    story.hidden = !shouldShow;
    updateStoryState(story);

    if (shouldShow) shown += 1;
  });

  updateStats(shown);
  emptyState.hidden = shown !== 0;
  restoreButton.disabled = state.hidden.length === 0;
  queueMasonryLayout();
}

function updateStoryState(story) {
  const isRead = state.read.includes(story.dataset.id);
  const isSaved = state.saved.includes(story.dataset.id);

  story.classList.toggle("is-read", isRead);
  story.classList.toggle("is-saved", isSaved);
  syncButton(story, "read", "Mark as read", isRead);
  syncButton(story, "save", isSaved ? "Saved" : "Save", isSaved);
}

function updateStats(visibleOverride) {
  const visible =
    typeof visibleOverride === "number"
      ? visibleOverride
      : stories.filter((story) => !story.hidden).length;

  visibleCount.textContent = visible;
  readCount.textContent = state.read.length;
  savedCount.textContent = state.saved.length;
}

function sortStories(items, mode) {
  return [...items].sort((a, b) => {
    if (mode === "oldest") {
      return getDate(a) - getDate(b);
    }

    if (mode === "source") {
      return a.dataset.source.localeCompare(b.dataset.source);
    }

    if (mode === "title") {
      return a
        .querySelector("h2")
        .textContent.localeCompare(b.querySelector("h2").textContent);
    }

    return getDate(b) - getDate(a);
  });
}

function getDate(story) {
  return new Date(
    story.querySelector(".pub-date").getAttribute("datetime")
  ).getTime();
}

function getStoryText(story) {
  return [
    story.dataset.source,
    story.dataset.tags,
    story.querySelector("h2").textContent,
    story.querySelector(".dek").textContent
  ]
    .join(" ")
    .toLowerCase();
}

function syncButton(story, action, label, pressed) {
  const button = story.querySelector(`[data-action="${action}"]`);
  button.textContent = label;
  button.setAttribute("aria-pressed", String(pressed));
}

function toggleId(list, id) {
  if (list.includes(id)) {
    list.splice(list.indexOf(id), 1);
    return;
  }

  list.push(id);
}

function addId(list, id) {
  if (!list.includes(id)) {
    list.push(id);
  }
}

function getSuggestionItems(items) {
  const terms = new Map();

  items.forEach((story) => {
    const source = story.dataset.source;
    const title = story.querySelector("h2").textContent.trim();
    const searchText = getStoryText(story);

    terms.set(source.toLowerCase(), {
      value: source,
      kind: "site",
      searchText
    });
    terms.set(title.toLowerCase(), { value: title, kind: "story", searchText });
  });

  return Array.from(terms.values());
}

function renderSuggestions() {
  const query = searchInput.value.trim().toLowerCase();

  if (!query) {
    closeSuggestions();
    return;
  }

  const matches = suggestionItems
    .filter(
      (item) =>
        item.value.toLowerCase().includes(query) ||
        item.searchText.includes(query)
    )
    .sort((a, b) => {
      const aStarts = a.value.toLowerCase().startsWith(query);
      const bStarts = b.value.toLowerCase().startsWith(query);

      if (aStarts !== bStarts) return aStarts ? -1 : 1;
      return a.value.localeCompare(b.value);
    })
    .slice(0, 6);

  if (matches.length === 0) {
    closeSuggestions();
    return;
  }

  activeSuggestionIndex = -1;
  searchInput.setAttribute("aria-expanded", "true");
  searchSuggestions.hidden = false;
  searchSuggestions.classList.remove("is-above");
  searchSuggestions.innerHTML = matches
    .map(
      (item, index) => `
    <button class="search-suggestion" type="button" role="option" data-index="${index}" data-value="${escapeAttribute(
        item.value
      )}">
      <span>${escapeHtml(item.value)}</span>
      <span class="suggestion-kind">${item.kind}</span>
    </button>
  `
    )
    .join("");

  const menuBox = searchSuggestions.getBoundingClientRect();
  const inputBox = searchInput.getBoundingClientRect();
  const roomAbove = inputBox.top;
  const roomBelow = window.innerHeight - inputBox.bottom;

  searchSuggestions.classList.toggle(
    "is-above",
    menuBox.height > roomBelow && roomAbove > roomBelow
  );
}

function handleSuggestionKeys(event) {
  const options = Array.from(
    searchSuggestions.querySelectorAll(".search-suggestion")
  );

  if (searchSuggestions.hidden || options.length === 0) return;

  if (event.key === "ArrowDown") {
    event.preventDefault();
    setActiveSuggestion(
      Math.min(activeSuggestionIndex + 1, options.length - 1)
    );
  }

  if (event.key === "ArrowUp") {
    event.preventDefault();
    setActiveSuggestion(Math.max(activeSuggestionIndex - 1, 0));
  }

  if (event.key === "Enter" && activeSuggestionIndex > -1) {
    event.preventDefault();
    searchInput.value = options[activeSuggestionIndex].dataset.value;
    closeSuggestions();
    renderFeed();
  }

  if (event.key === "Escape") {
    closeSuggestions();
  }
}

function setActiveSuggestion(index) {
  const options = Array.from(
    searchSuggestions.querySelectorAll(".search-suggestion")
  );
  activeSuggestionIndex = index;

  options.forEach((option, optionIndex) => {
    option.classList.toggle("is-active", optionIndex === index);
  });
}

function closeSuggestions() {
  activeSuggestionIndex = -1;
  searchInput.setAttribute("aria-expanded", "false");
  searchSuggestions.hidden = true;
  searchSuggestions.classList.remove("is-above");
  searchSuggestions.innerHTML = "";
}

function queueMasonryLayout() {
  window.cancelAnimationFrame(masonryFrame);
  masonryFrame = window.requestAnimationFrame(layoutMasonry);
}

function layoutMasonry() {
  const styles = window.getComputedStyle(feed);
  const rowHeight = parseFloat(styles.gridAutoRows) || 8;
  const rowGap = parseFloat(styles.rowGap) || 0;
  const visibleStories = stories.filter((story) => !story.hidden);

  stories.forEach((story) => {
    story.style.gridRowStart = "auto";
    story.style.gridRowEnd = "auto";
    story.style.minHeight = "";
    story.style.setProperty("--bottom-fill", "0px");
  });

  setMasonrySpans(visibleStories, rowHeight, rowGap);
  squareOffMasonryBottom(visibleStories);
  setMasonrySpans(visibleStories, rowHeight, rowGap);
}

function setMasonrySpans(items, rowHeight, rowGap) {
  items.forEach((story) => {
    const height = story.scrollHeight;
    const span = Math.ceil((height + rowGap) / (rowHeight + rowGap));
    story.style.gridRowEnd = `span ${span}`;
  });
}

function squareOffMasonryBottom(items) {
  if (items.length === 0) return;

  const feedRect = feed.getBoundingClientRect();
  const styles = window.getComputedStyle(feed);
  const columnTracks = styles.gridTemplateColumns
    .split(" ")
    .map((track) => parseFloat(track))
    .filter(Boolean);
  const columnGap = parseFloat(styles.columnGap) || 0;
  const columnWidth = columnTracks[0] || items[0].getBoundingClientRect().width;

  if (!columnWidth) return;

  const bottomsByColumn = new Map();
  const cardData = items.map((story) => {
    const rect = story.getBoundingClientRect();
    const startColumn = Math.max(
      0,
      Math.round((rect.left - feedRect.left) / (columnWidth + columnGap))
    );
    const columnSpan = Math.max(
      1,
      Math.round((rect.width + columnGap) / (columnWidth + columnGap))
    );
    const bottom = rect.bottom;

    for (
      let column = startColumn;
      column < startColumn + columnSpan;
      column += 1
    ) {
      const current = bottomsByColumn.get(column);

      if (!current || bottom > current.bottom) {
        bottomsByColumn.set(column, { story, bottom });
      }
    }

    return { story, bottom };
  });

  const targetBottom = Math.max(...cardData.map((item) => item.bottom));
  const bottomCards = new Set(
    Array.from(bottomsByColumn.values()).map((item) => item.story)
  );

  bottomCards.forEach((story) => {
    const rect = story.getBoundingClientRect();
    const fill = Math.max(0, Math.round(targetBottom - rect.bottom));

    if (fill > 0) {
      story.style.setProperty("--bottom-fill", `${fill}px`);
    }
  });
}

function escapeHtml(value) {
  return value.replace(
    /[&<>"']/g,
    (character) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
      }[character])
  );
}

function escapeAttribute(value) {
  return escapeHtml(value);
}

function loadState() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return {
      read: Array.isArray(parsed?.read) ? parsed.read : [],
      saved: Array.isArray(parsed?.saved) ? parsed.saved : [],
      hidden: Array.isArray(parsed?.hidden) ? parsed.hidden : []
    };
  } catch {
    return { read: [], saved: [], hidden: [] };
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}
